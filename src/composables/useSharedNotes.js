import { computed, onBeforeUnmount, ref, toValue, watch } from 'vue';
import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDocs,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where
} from 'firebase/firestore';
import {
  auth,
  db,
  ensureVisitorSession,
  firebaseConfigHelp,
  firebaseEnabled,
  onFirebaseAuthChange,
  signInAdmin,
  signOutFirebase
} from '../lib/firebase.js';

const MAX_NOTES_PER_DAY = 3;
const MIN_NOTE_LENGTH = 10;
const MAX_NOTE_LENGTH = 500;
const MAX_AUTHOR_LENGTH = 40;
const LOCAL_RATE_LIMIT_KEY = 'shared_notes_rate_limit_v1';

const currentUser = ref(auth?.currentUser ?? null);
const authBooted = ref(!firebaseEnabled);

onFirebaseAuthChange((user) => {
  currentUser.value = user;
  authBooted.value = true;
});

function normalizeAnimalKey(name) {
  return String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown';
}

function createAnonymousAuthor(animalName, existingNotes) {
  const animalKey = normalizeAnimalKey(animalName).replace(/-/g, '_');
  const prefix = `anonymous_${animalKey}_fan-`;

  const nextNumber = existingNotes.reduce((max, note) => {
    const author = String(note.author || '');
    if (!author.startsWith(prefix)) return max;

    const suffix = Number(author.slice(prefix.length));
    return Number.isFinite(suffix) ? Math.max(max, suffix) : max;
  }, 0) + 1;

  return `${prefix}${nextNumber}`;
}

function getDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function readLocalQuota() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_RATE_LIMIT_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeLocalQuota(value) {
  try {
    localStorage.setItem(LOCAL_RATE_LIMIT_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage failures and keep server count as fallback.
  }
}

function getLocalQuotaCount(uid, dayKey) {
  if (!uid) return 0;
  const all = readLocalQuota();
  return Number(all[uid]?.[dayKey] || 0);
}

function incrementLocalQuota(uid, dayKey) {
  if (!uid) return;
  const all = readLocalQuota();
  all[uid] = all[uid] || {};
  all[uid][dayKey] = Number(all[uid][dayKey] || 0) + 1;
  writeLocalQuota(all);
}

function timestampToMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function mapNote(snapshot) {
  const data = snapshot.data();
  const createdAtMs = timestampToMillis(data.createdAt);

  return {
    id: snapshot.id,
    animalKey: data.animalKey || '',
    animalName: data.animalName || '',
    text: data.text || '',
    author: data.author || '',
    status: data.status || 'approved',
    deviceUid: data.deviceUid || '',
    createdAt: data.createdAt || null,
    createdAtMs,
    createdDay: data.createdDay || '',
    canDelete: false
  };
}

function sortNotes(a, b) {
  return b.createdAtMs - a.createdAtMs;
}

function getConfigError() {
  if (firebaseEnabled) return '';
  return 'Besucher*innennotizen sind gerade nicht verfuegbar.';
}

export function formatVisitorNoteDate(value) {
  if (!value) return 'Gerade eben';

  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMs < 3600000) return 'Gerade eben';
  if (diffMs < 86400000) return 'Heute';
  if (diffDays === 1) return 'Gestern';

  return date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatVisitorNoteAuthor(value) {
  const author = String(value || '').trim();
  if (!author || author.startsWith('anonymous_')) return 'Anonym geteilt';
  return author;
}

async function getServerDailyCount(uid, dayKey) {
  const snapshot = await getCountFromServer(
    query(
      collectionGroup(db, 'entries'),
      where('deviceUid', '==', uid),
      where('createdDay', '==', dayKey)
    )
  );

  return snapshot.data().count || 0;
}

export function useVisitorNotes(animalNameSource) {
  const notes = ref([]);
  const loading = ref(true);
  const submitting = ref(false);
  const deletingId = ref('');
  const error = ref('');
  const currentUid = ref('');
  const remainingToday = ref(MAX_NOTES_PER_DAY);

  let stopNotes = null;

  function clearSubscriptions() {
    stopNotes?.();
    stopNotes = null;
  }

  async function refreshRemaining() {
    if (!firebaseEnabled || !currentUid.value) return;

    const dayKey = getDayKey();
    const localCount = getLocalQuotaCount(currentUid.value, dayKey);

    try {
      const serverCount = await getServerDailyCount(currentUid.value, dayKey);
      remainingToday.value = Math.max(0, MAX_NOTES_PER_DAY - Math.max(serverCount, localCount));
    } catch {
      remainingToday.value = Math.max(0, MAX_NOTES_PER_DAY - localCount);
    }
  }

  async function subscribe() {
    clearSubscriptions();
    notes.value = [];

    if (!firebaseEnabled) {
      error.value = getConfigError();
      loading.value = false;
      return;
    }

    const animalName = toValue(animalNameSource);
    if (!animalName) {
      loading.value = false;
      return;
    }

    loading.value = true;
    error.value = '';

    try {
      const user = await ensureVisitorSession();
      currentUid.value = user.uid;

      const animalKey = normalizeAnimalKey(animalName);
      const notesRef = collection(db, 'notes', animalKey, 'entries');
      stopNotes = onSnapshot(
        query(notesRef, orderBy('createdAt', 'desc')),
        (snapshot) => {
          notes.value = snapshot.docs.map(mapNote).sort(sortNotes);
          loading.value = false;
        },
        (snapshotError) => {
          error.value = snapshotError.message;
          loading.value = false;
        }
      );

      await refreshRemaining();
    } catch (loadError) {
      error.value = loadError.message || 'Notizen konnten nicht geladen werden.';
      loading.value = false;
    }
  }

  async function addNote(textInput, authorInput) {
    const text = String(textInput || '').trim();
    const rawAuthor = String(authorInput || '').trim();

    if (text.length < MIN_NOTE_LENGTH) {
      throw new Error(`Bitte schreibe mindestens ${MIN_NOTE_LENGTH} Zeichen.`);
    }

    if (text.length > MAX_NOTE_LENGTH) {
      throw new Error(`Bitte maximal ${MAX_NOTE_LENGTH} Zeichen verwenden.`);
    }

    if (rawAuthor.length > MAX_AUTHOR_LENGTH) {
      throw new Error(`Der Name darf maximal ${MAX_AUTHOR_LENGTH} Zeichen haben.`);
    }

    if (!firebaseEnabled) {
      throw new Error(getConfigError());
    }

    submitting.value = true;
    error.value = '';

    try {
      const user = await ensureVisitorSession();
      currentUid.value = user.uid;
      await refreshRemaining();

      if (remainingToday.value <= 0) {
        throw new Error('Heute sind bereits 3 Notizen von diesem Geraet gespeichert worden.');
      }

      const animalName = toValue(animalNameSource);
      const animalKey = normalizeAnimalKey(animalName);
      const dayKey = getDayKey();
      const author = rawAuthor || createAnonymousAuthor(animalName, notes.value);

      await addDoc(collection(db, 'notes', animalKey, 'entries'), {
        animalKey,
        animalName,
        text,
        author,
        status: 'approved',
        deviceUid: user.uid,
        createdDay: dayKey,
        createdAt: serverTimestamp()
      });

      incrementLocalQuota(user.uid, dayKey);
      await refreshRemaining();
    } catch (submitError) {
      error.value = submitError.message || 'Die Notiz konnte nicht gespeichert werden.';
      throw submitError;
    } finally {
      submitting.value = false;
    }
  }

  async function deleteOwnPendingNote(note) {
    if (!note?.id || note.deviceUid !== currentUid.value) {
      return;
    }

    deletingId.value = note.id;
    error.value = '';

    try {
      await deleteDoc(doc(db, 'notes', note.animalKey, 'entries', note.id));
      await refreshRemaining();
    } catch (deleteError) {
      error.value = deleteError.message || 'Die Notiz konnte nicht geloescht werden.';
      throw deleteError;
    } finally {
      deletingId.value = '';
    }
  }

  watch(
    () => [toValue(animalNameSource), currentUser.value?.uid, authBooted.value],
    () => {
      if (!authBooted.value) return;
      subscribe();
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    clearSubscriptions();
  });

  return {
    notes,
    loading,
    submitting,
    deletingId,
    error,
    remainingToday,
    firebaseEnabled,
    addNote,
    deleteOwnPendingNote
  };
}

export function useRecentVisitorNotes(animalNamesSource, maxEntries = 10) {
  const notes = ref([]);
  const loading = ref(true);
  const error = ref('');

  async function subscribe() {
    notes.value = [];

    if (!firebaseEnabled) {
      error.value = getConfigError();
      loading.value = false;
      return;
    }

    loading.value = true;
    error.value = '';

    try {
      await ensureVisitorSession();
      const animalNames = Array.from(new Set((toValue(animalNamesSource) || []).filter(Boolean)));

      if (!animalNames.length) {
        loading.value = false;
        return;
      }

      const snapshots = await Promise.all(
        animalNames.map(async (animalName) => {
          const animalKey = normalizeAnimalKey(animalName);
          const snapshot = await getDocs(
            query(
              collection(db, 'notes', animalKey, 'entries'),
              orderBy('createdAt', 'desc'),
              limit(maxEntries)
            )
          );
          return snapshot.docs;
        })
      );

      notes.value = snapshots
        .flat()
        .map(mapNote)
        .sort(sortNotes)
        .slice(0, maxEntries);
      loading.value = false;
    } catch (loadError) {
      error.value = loadError.message || 'Notizen konnten nicht geladen werden.';
      loading.value = false;
    }
  }

  watch(
    () => [authBooted.value, JSON.stringify(toValue(animalNamesSource) || [])],
    () => {
      if (!authBooted.value) return;
      subscribe();
    },
    { immediate: true }
  );

  return {
    notes,
    loading,
    error,
    firebaseEnabled
  };
}

export function useAdminNotesModeration(animalInfo) {
  const allNotes = ref([]);
  const loading = ref(false);
  const authLoading = ref(false);
  const actionId = ref('');
  const authError = ref('');
  const notesError = ref('');
  const adminReady = ref(false);
  const adminUser = computed(() => (currentUser.value?.isAnonymous ? null : currentUser.value));
  const groupedNotes = computed(() => {
    const groups = new Map();

    allNotes.value.forEach((note) => {
      const key = note.animalName || 'Unbekannt';
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(note);
    });

    return Array.from(groups.entries())
      .map(([animalName, notes]) => ({ animalName, notes }))
      .sort((a, b) => a.animalName.localeCompare(b.animalName, 'de'));
  });

  function clearSubscription() {}

  async function ensureAdmin() {
    if (!firebaseEnabled) {
      authError.value = getConfigError();
      adminReady.value = false;
      return false;
    }

    if (!adminUser.value) {
      adminReady.value = false;
      return false;
    }

    adminReady.value = true;
    authError.value = '';
    return true;
  }

  async function subscribeToPending() {
    clearSubscription();
    allNotes.value = [];
    authError.value = '';

    loading.value = true;
    notesError.value = '';

    try {
      await ensureVisitorSession();
      const animals = Object.keys(animalInfo || {});
      const snapshots = await Promise.all(
        animals.map(async (animalName) => {
          const animalKey = normalizeAnimalKey(animalName);
          const snapshot = await getDocs(
            query(collection(db, 'notes', animalKey, 'entries'), orderBy('createdAt', 'desc'))
          );
          return snapshot.docs;
        })
      );

      allNotes.value = snapshots.flat().map(mapNote).sort(sortNotes);
      loading.value = false;

      await ensureAdmin();
    } catch (subscribeError) {
      notesError.value = subscribeError.message || 'Notizen konnten nicht geladen werden.';
      loading.value = false;
    }
  }

  async function login(email, password) {
    if (!email || !password) {
      authError.value = 'Admin-E-Mail oder Passwort fehlt.';
      adminReady.value = false;
      return;
    }

    if (adminUser.value?.email === email && adminReady.value) {
      return;
    }

    authLoading.value = true;
    authError.value = '';

    try {
      await signInAdmin(email, password);
      adminReady.value = true;
      await subscribeToPending();
    } catch (loginError) {
      authError.value = loginError.message || 'Firebase-Admin-Login fehlgeschlagen.';
      adminReady.value = false;
    } finally {
      authLoading.value = false;
    }
  }

  async function logout() {
    clearSubscription();
    allNotes.value = [];
    adminReady.value = false;
    await signOutFirebase();
    await ensureVisitorSession().catch(() => {});
  }

  async function deleteNote(note) {
    if (!adminReady.value || !note?.id) return;

    actionId.value = note.id;
    notesError.value = '';

    try {
      await deleteDoc(doc(db, 'notes', note.animalKey, 'entries', note.id));
    } catch (deleteError) {
      notesError.value = deleteError.message || 'Die Notiz konnte nicht geloescht werden.';
    } finally {
      actionId.value = '';
    }
  }

  watch(
    () => [currentUser.value?.uid, authBooted.value],
    () => {
      if (!authBooted.value) return;
      if (adminUser.value) {
        subscribeToPending();
      } else {
        adminReady.value = false;
        authError.value = '';
        subscribeToPending();
      }
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    clearSubscription();
  });

  return {
    adminUser,
    adminReady,
    authLoading,
    loading,
    actionId,
    authError,
    notesError,
    groupedNotes,
    firebaseEnabled,
    login,
    logout,
    deleteNote
  };
}
