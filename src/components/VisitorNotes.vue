<template>
  <div class="visitor-notes">
    <div class="notes-intro">
      <div>
        <h3 class="section-title">📝 Besucher*innennotizen</h3>
        <p class="notes-hint">Kurze Eindrücke, Begegnungen und kleine Momente mit {{ animalName }}.</p>
      </div>
      <span v-if="firebaseEnabled && notes.length" class="notes-count">{{ notes.length }} Einträge</span>
    </div>

    <p v-if="!firebaseEnabled" class="notes-status notes-status-error">
      Besucher*innennotizen sind gerade nicht verfügbar.
    </p>
    <p v-else-if="remainingToday <= 1" class="notes-status">
      Heute kannst du noch {{ remainingToday }} {{ remainingToday === 1 ? 'Notiz' : 'Notizen' }} schreiben.
    </p>

    <form v-if="firebaseEnabled" class="note-form" @submit.prevent="handleSubmit">
      <textarea
        v-model="newNote"
        class="note-input"
        :placeholder="`Was möchtest du über ${animalName} teilen?`"
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
      <p class="notes-helper">10 bis 500 Zeichen. Name optional.</p>
    </form>

    <template v-if="firebaseEnabled">
      <p v-if="error" class="notes-status notes-status-error">{{ error }}</p>
      <p v-else-if="loading" class="notes-empty">Notizen werden geladen ...</p>
      <p v-else class="notes-empty">Dein Eintrag erscheint danach oben im Besucher*innen-Block.</p>
    </template>
  </div>
</template>

<script setup>
import { ref, toRef } from 'vue';
import {
  useVisitorNotes
} from '../composables/useSharedNotes.js';

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
</script>

<style scoped>
.visitor-notes {
  width: 100%;
  box-sizing: border-box;
  margin-top: .9rem;
  padding: .95rem;
  background: rgba(246, 249, 244, .96);
  border: 1px solid #dbe8d3;
  border-radius: 14px;
}

.notes-intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: .75rem;
  margin-bottom: .55rem;
  min-width: 0;
}

.section-title {
  font-size: .95rem;
  color: #2e5d34;
  margin: 0 0 .2rem;
}

.notes-count {
  flex-shrink: 0;
  padding: .24rem .5rem;
  border-radius: 999px;
  background: rgba(129, 199, 132, .14);
  border: 1px solid rgba(129, 199, 132, .28);
  color: #3d6b42;
  font-size: .68rem;
  font-weight: 700;
}

.notes-hint,
.notes-status,
.notes-helper,
.notes-empty {
  margin: 0 0 .6rem;
  font-size: .76rem;
  color: #66785f;
}

.notes-status {
  padding: .5rem .65rem;
  border-radius: 10px;
  background: rgba(129, 199, 132, .08);
  border: 1px solid rgba(129, 199, 132, .2);
}

.notes-status-error {
  color: #b71c1c;
  background: rgba(255, 235, 238, .85);
}

.note-form {
  display: flex;
  flex-direction: column;
  gap: .45rem;
  margin-bottom: .8rem;
}

.note-input {
  width: 100%;
  box-sizing: border-box;
  padding: .7rem .8rem;
  border: 1px solid #d3e2cb;
  border-radius: 10px;
  font-size: .84rem;
  font-family: inherit;
  resize: vertical;
  min-height: 4.4rem;
  background: rgba(255, 255, 255, .92);
}

.note-input:focus,
.author-input:focus {
  outline: none;
  border-color: #81c784;
  box-shadow: 0 0 0 2px rgba(129, 199, 132, .25);
}

.note-form-row {
  display: flex;
  gap: .45rem;
  min-width: 0;
}

.author-input {
  flex: 1;
  min-width: 0;
  padding: .55rem .7rem;
  border: 1px solid #d3e2cb;
  border-radius: 10px;
  font-size: .79rem;
  font-family: inherit;
  background: rgba(255, 255, 255, .92);
}

.note-submit {
  padding: .55rem .9rem;
  border: none;
  border-radius: 10px;
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

@media (max-width: 520px) {
  .notes-intro {
    flex-direction: column;
    align-items: stretch;
  }

  .notes-count {
    align-self: flex-start;
  }

  .note-form-row {
    flex-direction: column;
  }
}
</style>
