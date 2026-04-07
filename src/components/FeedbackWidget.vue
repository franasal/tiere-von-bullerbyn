<template>
  <div class="feedback-root">
    <button class="feedback-launcher" @click="openPanel = true">
      Feedback senden
    </button>

    <transition name="feedback-fade">
      <div v-if="openPanel" class="feedback-overlay" @click.self="closePanel">
        <section class="feedback-panel" aria-label="Feedback senden">
          <div class="feedback-header">
            <div>
              <h2>Feedback senden</h2>
              <p>Öffnet eine vorbereitete E-Mail an `farcilas@gmail.com`.</p>
            </div>
            <button class="feedback-close" @click="closePanel" aria-label="Schliessen">
              ×
            </button>
          </div>

          <div class="feedback-type-switch">
            <button
              :class="['feedback-type-button', { active: feedbackType === 'general' }]"
              @click="setType('general')"
            >
              Allgemein
            </button>
            <button
              :class="['feedback-type-button', { active: feedbackType === 'pig' }]"
              @click="setType('pig')"
            >
              Zu einem Schwein
            </button>
          </div>

          <label class="feedback-field">
            <span>Titel</span>
            <input v-model.trim="title" type="text" placeholder="Kurz zusammenfassen" />
          </label>

          <label v-if="feedbackType === 'pig'" class="feedback-field">
            <span>Schwein</span>
            <select v-model="selectedPigName">
              <option value="">Bitte auswählen</option>
              <option v-for="pig in pigNames" :key="pig" :value="pig">
                {{ pig }}
              </option>
            </select>
          </label>

          <label class="feedback-field">
            <span>Beschreibung</span>
            <textarea
              v-model.trim="message"
              rows="6"
              placeholder="Was ist passiert, was ist falsch oder was sollte verbessert werden?"
            />
          </label>

          <div class="feedback-note">
            Beim Absenden öffnet sich dein E-Mail-Programm mit vorausgefülltem Betreff und Text.
          </div>

          <div class="feedback-actions">
            <button class="feedback-secondary" @click="closePanel">Abbrechen</button>
            <button class="feedback-primary" :disabled="!canSubmit" @click="submitFeedback">
              E-Mail öffnen
            </button>
          </div>
        </section>
      </div>
    </transition>
  </div>
</template>

<script>
const FEEDBACK_EMAIL = 'farcilas@gmail.com';

export default {
  name: 'FeedbackWidget',
  props: {
    pigNames: {
      type: Array,
      default: () => []
    },
    selectedPig: {
      type: String,
      default: ''
    },
    currentView: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      openPanel: false,
      feedbackType: 'general',
      title: '',
      message: '',
      selectedPigName: ''
    };
  },
  computed: {
    canSubmit() {
      if (!this.title || !this.message) {
        return false;
      }

      if (this.feedbackType === 'pig' && !this.selectedPigName) {
        return false;
      }

      return true;
    }
  },
  watch: {
    selectedPig: {
      immediate: true,
      handler(value) {
        if (value && !this.selectedPigName) {
          this.selectedPigName = value;
        }
      }
    }
  },
  methods: {
    closePanel() {
      this.openPanel = false;
    },
    setType(nextType) {
      this.feedbackType = nextType;
      if (nextType === 'pig' && this.selectedPig && !this.selectedPigName) {
        this.selectedPigName = this.selectedPig;
      }
    },
    buildMailtoUrl() {
      const computedTitle = this.feedbackType === 'pig' && this.selectedPigName
        ? `Feedback: ${this.selectedPigName} - ${this.title}`
        : `Feedback: ${this.title}`;
      const bodyLines = [
        `Type: ${this.feedbackType}`,
        `Pig: ${this.selectedPigName || '-'}`,
        `View: ${this.currentView || '-'}`,
        `Page: ${window.location.href}`,
        '',
        this.message
      ];

      const params = new URLSearchParams({
        subject: computedTitle,
        body: bodyLines.join('\n')
      });

      return `mailto:${FEEDBACK_EMAIL}?${params.toString()}`;
    },
    submitFeedback() {
      if (!this.canSubmit) {
        return;
      }

      window.location.href = this.buildMailtoUrl();
      this.closePanel();
    }
  }
};
</script>

<style scoped>
.feedback-root {
  position: fixed;
  left: 14px;
  bottom: 14px;
  pointer-events: none;
  z-index: 40;
}

.feedback-launcher {
  pointer-events: auto;
  border: 1px solid #d9cfbd;
  border-radius: 999px;
  background: rgba(251, 247, 239, 0.96);
  color: #4d5a4e;
  padding: 0.52rem 0.85rem;
  font-size: 0.88rem;
  font-weight: 600;
  box-shadow: 0 8px 18px rgba(32, 48, 38, 0.12);
}

.feedback-overlay {
  position: fixed;
  inset: 0;
  background: rgba(24, 28, 24, 0.38);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
  pointer-events: auto;
}

.feedback-panel {
  width: min(560px, 100%);
  background: #fbf7ef;
  border: 1px solid #d7ccb5;
  border-radius: 18px;
  padding: 1rem;
  box-shadow: 0 20px 60px rgba(25, 30, 25, 0.24);
  text-align: left;
}

.feedback-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.feedback-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #243126;
}

.feedback-header p {
  margin: 0.15rem 0 0;
  color: #617061;
  font-size: 0.92rem;
}

.feedback-close {
  border: 0;
  background: transparent;
  color: #556155;
  font-size: 1.5rem;
  padding: 0.1rem 0.4rem;
}

.feedback-type-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}

.feedback-type-button {
  border: 1px solid #d3cab6;
  background: #f2ecde;
  color: #495649;
}

.feedback-type-button.active {
  background: #314936;
  color: #f7f4ea;
  border-color: #314936;
}

.feedback-field {
  display: grid;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.feedback-field span {
  font-size: 0.88rem;
  font-weight: 700;
  color: #334033;
}

.feedback-field input,
.feedback-field select,
.feedback-field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d4cab7;
  border-radius: 10px;
  background: #fffdf7;
  color: #263126;
  padding: 0.8rem 0.9rem;
  font: inherit;
}

.feedback-field textarea {
  resize: vertical;
  min-height: 132px;
}

.feedback-note {
  color: #6d776d;
  font-size: 0.88rem;
  margin-bottom: 0.85rem;
}

.feedback-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.feedback-secondary {
  border: 1px solid #d5ccb8;
  background: #efe7d6;
  color: #495649;
}

.feedback-primary {
  border: 0;
  background: linear-gradient(135deg, #6e4a2b, #95653b);
  color: #fff8f1;
}

.feedback-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.feedback-fade-enter-active,
.feedback-fade-leave-active {
  transition: opacity 0.18s ease;
}

.feedback-fade-enter-from,
.feedback-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .feedback-root {
    left: 10px;
    bottom: 10px;
  }

  .feedback-launcher {
    width: auto;
    max-width: none;
  }
}
</style>
