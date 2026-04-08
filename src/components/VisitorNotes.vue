<template>
  <div class="visitor-notes">
    <h3 class="section-title">📝 Besucher*innennotizen</h3>
    <p class="notes-hint">Schreib deine Beobachtungen oder Erlebnisse mit {{ animalName }} auf.</p>

    <p v-if="!firebaseEnabled" class="notes-status notes-status-error">
      Besucher*innennotizen sind gerade nicht verfuegbar.
    </p>
    <p v-else class="notes-status">
      Maximal {{ maxNotesPerDay }} Notizen pro Geraet und Tag. Verbleibend heute: {{ remainingToday }}.
    </p>

    <form v-if="firebaseEnabled" class="note-form" @submit.prevent="handleSubmit">
      <textarea
        v-model="newNote"
        class="note-input"
        :placeholder="`Was hast du mit ${animalName} erlebt?`"
        rows="3"
        maxlength="500"
      />
      <div class="note-form-row">
        <input
          v-model="authorName"
          class="author-input"
          placeholder="Dein Name (optional)"
          maxlength="40"
        />
        <button
          type="submit"
          class="note-submit"
          :disabled="submitting || newNote.trim().length < 10"
        >
          {{ submitting ? 'Speichert ...' : 'Speichern' }}
        </button>
      </div>
      <p class="notes-helper">Bitte mindestens 10 und maximal 500 Zeichen schreiben.</p>
    </form>

    <p v-if="error && firebaseEnabled" class="notes-status notes-status-error">{{ error }}</p>
    <p v-if="loading" class="notes-empty">Notizen werden geladen ...</p>

    <div v-else-if="notes.length" class="notes-list">
      <div v-for="note in notes" :key="note.id" class="note-card">
        <div class="note-header">
          <span class="note-author">{{ note.author || 'Anonym' }}</span>
          <span class="note-date">{{ formatDate(note.createdAt) }}</span>
        </div>
        <p class="note-text">{{ note.text }}</p>
      </div>
    </div>
    <p v-else class="notes-empty">Noch keine freigegebenen Notizen vorhanden.</p>
  </div>
</template>

<script setup>
import { ref, toRef } from 'vue';
import { useVisitorNotes } from '../composables/useSharedNotes.js';

const props = defineProps({
  animalName: { type: String, required: true }
});

const maxNotesPerDay = 3;
const newNote = ref('');
const authorName = ref('');
const animalNameRef = toRef(props, 'animalName');

const {
  notes,
  loading,
  submitting,
  error,
  remainingToday,
  firebaseEnabled,
  addNote
} = useVisitorNotes(animalNameRef);

async function handleSubmit() {
  try {
    await addNote(newNote.value, authorName.value);
    newNote.value = '';
    authorName.value = '';
  } catch {
    // Error is surfaced through composable state.
  }
}

function formatDate(value) {
  if (!value) return 'Gerade eben';

  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
</script>

<style scoped>
.visitor-notes {
  width: 100%;
  margin-top: .6rem;
  padding: .7rem;
  background: rgba(232, 245, 233, .55);
  border: 1px solid #c8e6c9;
  border-radius: 10px;
}

.section-title {
  font-size: .9rem;
  color: #2e7d32;
  margin: 0 0 .2rem;
}

.notes-hint,
.notes-status,
.notes-helper,
.notes-empty {
  margin: 0 0 .5rem;
  font-size: .75rem;
  color: #558b2f;
}

.notes-status {
  padding: .45rem .55rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, .65);
}

.notes-status-error {
  color: #b71c1c;
  background: rgba(255, 235, 238, .85);
}

.note-form {
  display: flex;
  flex-direction: column;
  gap: .35rem;
  margin-bottom: .5rem;
}

.note-input {
  width: 100%;
  box-sizing: border-box;
  padding: .45rem .5rem;
  border: 1px solid #c8e6c9;
  border-radius: 6px;
  font-size: .82rem;
  font-family: inherit;
  resize: vertical;
  min-height: 4rem;
}

.note-input:focus,
.author-input:focus {
  outline: none;
  border-color: #81c784;
  box-shadow: 0 0 0 2px rgba(129, 199, 132, .25);
}

.note-form-row {
  display: flex;
  gap: .35rem;
}

.author-input {
  flex: 1;
  padding: .35rem .5rem;
  border: 1px solid #c8e6c9;
  border-radius: 6px;
  font-size: .78rem;
  font-family: inherit;
}

.note-submit {
  padding: .35rem .75rem;
  border: none;
  border-radius: 6px;
  background: #81c784;
  color: #fff;
  font-weight: 700;
  font-size: .78rem;
  white-space: nowrap;
}

.note-submit:hover:not(:disabled) {
  background: #66bb6a;
}

.note-submit:disabled {
  opacity: .45;
  cursor: default;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: .35rem;
  max-height: 320px;
  overflow-y: auto;
}

.note-card {
  padding: .5rem .55rem;
  background: rgba(255, 255, 255, .9);
  border-radius: 8px;
  border: 1px solid #e8f5e9;
}

.note-header {
  display: flex;
  align-items: center;
  gap: .35rem;
  margin-bottom: .25rem;
  flex-wrap: wrap;
}

.note-author {
  font-size: .72rem;
  font-weight: 700;
  color: #2e7d32;
}

.note-date {
  font-size: .65rem;
  color: #9e9e9e;
}

.note-text {
  margin: 0;
  font-size: .8rem;
  line-height: 1.45;
  color: #37474f;
  white-space: pre-wrap;
}

@media (max-width: 520px) {
  .note-form-row {
    flex-direction: column;
  }
}
</style>
