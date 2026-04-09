<template>
  <section class="panel-section">
    <h3 class="section-title">Notizen verwalten</h3>
    <p class="panel-copy">
      Besucher*innen sehen neue Notizen sofort. Hier könnt ihr Einträge bei Bedarf wieder löschen.
    </p>

    <p v-if="!firebaseEnabled" class="notes-error">
      Firebase ist noch nicht konfiguriert.
    </p>

    <template v-else>
      <div class="notes-toolbar">
        <p v-if="adminReady" class="panel-copy toolbar-copy">
          Account verbunden.
        </p>
        <p v-else class="panel-copy toolbar-copy">
          Moderation wird automatisch mit dem festen Firebase-Admin-Account verbunden.
        </p>
        <button v-if="adminReady" class="lock-btn secondary" @click="logout">Firebase Logout</button>
      </div>

      <p v-if="!configuredAdminEmail" class="notes-error">
        `VITE_FIREBASE_ADMIN_EMAIL` fehlt in der Umgebung.
      </p>
      <p v-else-if="authLoading && !adminReady" class="notes-empty">Moderation wird verbunden ...</p>
      <p v-if="authError" class="notes-error">{{ authError }}</p>
      <button
        v-if="configuredAdminEmail && adminPassword && authError && !adminReady"
        class="action-btn login-btn"
        :disabled="authLoading"
        @click="connectWithPanelPassword"
      >
        Erneut verbinden
      </button>

      <p v-if="!adminReady" class="notes-error">
        Notizen sind sichtbar, aber Löschen ist erst möglich wenn der Firebase-Admin-Login erfolgreich ist.
      </p>
      <p v-if="notesError" class="notes-error">{{ notesError }}</p>
      <p v-if="loading" class="notes-empty">Notizen werden geladen ...</p>
      <p v-else-if="!groupedNotes.length" class="notes-empty">Noch keine Notizen vorhanden.</p>

      <div v-else class="pending-groups">
        <div v-for="group in groupedNotes" :key="group.animalName" class="pending-group">
          <div class="pending-group-header">
            <strong>{{ group.animalName }}</strong>
            <span>{{ group.notes.length }} Notizen</span>
          </div>

          <article v-for="note in group.notes" :key="note.id" class="pending-note-card">
            <div class="pending-note-meta">
              <span>{{ formatAuthor(note.author) }}</span>
              <span>{{ formatDate(note.createdAt) }}</span>
            </div>
            <p class="pending-note-text">{{ note.text }}</p>
            <div class="pending-note-actions">
              <button
                class="remove-btn"
                :disabled="actionId === note.id || !adminReady"
                @click="deleteNote(note)"
              >
                Löschen
              </button>
            </div>
          </article>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { watch } from 'vue';
import { formatVisitorNoteAuthor, useAdminNotesModeration } from '../composables/useSharedNotes.js';
import { configuredAdminEmail } from '../lib/firebase.js';

const props = defineProps({
  adminPassword: { type: String, default: '' },
  animalInfo: { type: Object, required: true }
});

const {
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
} = useAdminNotesModeration(props.animalInfo);

async function connectWithPanelPassword() {
  if (!configuredAdminEmail || !props.adminPassword) return;
  await login(configuredAdminEmail, props.adminPassword);
}

const formatAuthor = formatVisitorNoteAuthor;

function formatDate(value) {
  if (!value) return 'Gerade eben';

  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

watch(
  () => [props.adminPassword, configuredAdminEmail, adminReady.value],
  async ([adminPassword, adminEmail, isReady]) => {
    if (!adminPassword || !adminEmail || isReady) return;
    await login(adminEmail, adminPassword);
  },
  { immediate: true }
);
</script>

<style scoped>
.login-btn {
  width: 100%;
  margin-top: .75rem;
}

.notes-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  margin-top: .5rem;
}

.toolbar-copy {
  margin: 0;
}

.notes-error {
  margin: .65rem 0 0;
  color: #c62828;
  font-size: .8rem;
}

.notes-empty {
  margin: .75rem 0 0;
  color: #8d6e63;
  font-size: .82rem;
}

.pending-groups {
  display: grid;
  gap: .75rem;
  margin-top: .8rem;
}

.pending-group {
  padding: .75rem;
  border: 1px solid #f0e7e1;
  border-radius: 10px;
  background: linear-gradient(180deg, #fff, #fbf7f3);
}

.pending-group-header {
  display: flex;
  justify-content: space-between;
  gap: .5rem;
  margin-bottom: .5rem;
  color: #5d4037;
  font-size: .82rem;
}

.pending-note-card {
  padding: .6rem;
  border: 1px solid #eadfd8;
  border-radius: 8px;
  background: #fffdfa;
}

.pending-note-card + .pending-note-card {
  margin-top: .45rem;
}

.pending-note-meta {
  display: flex;
  justify-content: space-between;
  gap: .5rem;
  margin-bottom: .35rem;
  font-size: .74rem;
  color: #8d6e63;
}

.pending-note-text {
  margin: 0;
  color: #3e2723;
  font-size: .84rem;
  line-height: 1.45;
  white-space: pre-wrap;
}

.pending-note-actions {
  display: flex;
  gap: .4rem;
  margin-top: .55rem;
}

@media (max-width: 520px) {
  .notes-toolbar,
  .pending-note-meta,
  .pending-note-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
