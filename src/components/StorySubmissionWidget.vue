<template>
  <div class="story-root">
    <button class="story-launcher" @click="openPanel = true">
      Geschichte beisteuern
    </button>

    <transition name="story-fade">
      <div v-if="openPanel" class="story-overlay" @click.self="closePanel">
        <section class="story-panel" aria-label="Geschichte beisteuern">
          <div class="story-header">
            <div>
              <h2>Geschichte beisteuern</h2>
              <p>
                Reicht einen Vorschlag zur Freigabe ein.
                Nutze die Schweine als Vorbild: Erkennung und Geschichte getrennt beschreiben.
              </p>
            </div>
            <button class="story-close" @click="closePanel" aria-label="Schließen">
              ×
            </button>
          </div>

          <div class="story-example">
            <strong>Vorlage wie bei den Schweinen:</strong>
            <p>`Erscheinung`: Woran erkennt man das Tier auf Distanz?</p>
            <p>`Geschichte`: Rettung, Charakter, Besonderheiten, frühere Haltung oder Erlebnisse.</p>
          </div>

          <label class="story-field">
            <span>Tier</span>
            <select v-model="selectedAnimalName">
              <option value="">Bitte auswählen</option>
              <option v-for="animal in animalNames" :key="animal" :value="animal">
                {{ animal }}
              </option>
            </select>
          </label>

          <label class="story-field">
            <span>Dein Name oder Bezug zum Tier</span>
            <input
              v-model.trim="contributor"
              type="text"
              placeholder="Optional, z. B. Pflegerin, Freundin, Helfer"
            />
          </label>

          <label class="story-field">
            <span>Erscheinung / Woran erkennt man das Tier?</span>
            <textarea
              v-model.trim="appearanceDraft"
              rows="4"
              placeholder="Beispiel wie bei den Schweinen: Weiblich, rosa, linke Ohrmarke/Loch, kurzer Schwanz ..."
            />
          </label>

          <label class="story-field">
            <span>Geschichte / Was sollte im Profil stehen?</span>
            <textarea
              v-model.trim="storyDraft"
              rows="7"
              placeholder="Beispiel wie bei den Schweinen: Rettung, frühere Haltung, Charakter, markante Eigenheiten ..."
            />
          </label>

          <div v-if="selectedAnimalName" class="story-current">
            <strong>Aktueller Stand im Profil</strong>
            <p><span>Erscheinung:</span> {{ currentAppearance || 'Noch leer' }}</p>
            <p><span>Geschichte:</span> {{ currentStory || 'Noch leer' }}</p>
          </div>

          <div class="story-note">
            Beim Absenden öffnet sich dein E-Mail-Programm mit einem sauber formatierten Markdown-Entwurf.
          </div>

          <div class="story-actions">
            <button class="story-secondary" @click="closePanel">Abbrechen</button>
            <button class="story-primary" :disabled="!canSubmit" @click="submitStory">
              E-Mail öffnen
            </button>
          </div>
        </section>
      </div>
    </transition>
  </div>
</template>

<script>
const STORY_EMAIL = 'farcilas@gmail.com';

export default {
  name: 'StorySubmissionWidget',
  props: {
    animalNames: {
      type: Array,
      default: () => []
    },
    selectedAnimal: {
      type: String,
      default: ''
    },
    appearance: {
      type: String,
      default: ''
    },
    story: {
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
      selectedAnimalName: '',
      contributor: '',
      appearanceDraft: '',
      storyDraft: ''
    };
  },
  computed: {
    canSubmit() {
      return Boolean(this.selectedAnimalName && (this.appearanceDraft || this.storyDraft));
    },
    currentAppearance() {
      return this.selectedAnimalName === this.selectedAnimal ? this.appearance : '';
    },
    currentStory() {
      return this.selectedAnimalName === this.selectedAnimal ? this.story : '';
    }
  },
  watch: {
    selectedAnimal: {
      immediate: true,
      handler(value) {
        if (value && !this.selectedAnimalName) {
          this.selectedAnimalName = value;
        }
      }
    },
    openPanel(value) {
      if (value && this.selectedAnimal) {
        this.selectedAnimalName = this.selectedAnimal;
      }
    }
  },
  methods: {
    closePanel() {
      this.openPanel = false;
    },
    resetForm() {
      this.contributor = '';
      this.appearanceDraft = '';
      this.storyDraft = '';
    },
    buildMarkdownBody() {
      return [
        `# Tiergeschichte: ${this.selectedAnimalName}`,
        '',
        '## Meta',
        `- Beitrag von: ${this.contributor || '-'}`,
        `- Ansicht: ${this.currentView || '-'}`,
        `- URL: ${window.location.href}`,
        '',
        '## Vorschlag für appearance_description',
        this.appearanceDraft || '-',
        '',
        '## Vorschlag für general_description',
        this.storyDraft || '-',
        '',
        '## Aktuell im Repo',
        '',
        '### appearance_description',
        this.currentAppearance || '-',
        '',
        '### general_description',
        this.currentStory || '-'
      ].join('\n');
    },
    buildMailtoUrl() {
      const params = new URLSearchParams({
        subject: `Tiergeschichte: ${this.selectedAnimalName}`,
        body: this.buildMarkdownBody()
      });

      return `mailto:${STORY_EMAIL}?${params.toString()}`;
    },
    submitStory() {
      if (!this.canSubmit) {
        return;
      }

      window.location.href = this.buildMailtoUrl();
      this.resetForm();
      this.closePanel();
    }
  }
};
</script>

<style scoped>
.story-root {
  width: 100%;
}

.story-launcher {
  width: 100%;
  border: 1px solid #d7ccb5;
  border-radius: 12px;
  background: linear-gradient(135deg, #f6eddc, #f2e5cc);
  color: #4f4633;
  padding: 0.8rem 0.95rem;
  font-size: 0.95rem;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(68, 58, 37, 0.08);
}

.story-overlay {
  position: fixed;
  inset: 0;
  background: rgba(24, 28, 24, 0.38);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
  z-index: 60;
}

.story-panel {
  width: min(640px, 100%);
  max-height: calc(100vh - 2rem);
  overflow: auto;
  background: #fbf7ef;
  border: 1px solid #d7ccb5;
  border-radius: 18px;
  padding: 1rem;
  box-shadow: 0 20px 60px rgba(25, 30, 25, 0.24);
  text-align: left;
}

.story-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.story-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #243126;
}

.story-header p {
  margin: 0.18rem 0 0;
  color: #617061;
  font-size: 0.92rem;
  line-height: 1.4;
}

.story-close {
  border: 0;
  background: transparent;
  color: #556155;
  font-size: 1.5rem;
  padding: 0.1rem 0.4rem;
}

.story-example,
.story-current {
  background: #f4edde;
  border: 1px solid #ded1b5;
  border-radius: 12px;
  padding: 0.8rem 0.9rem;
  margin-bottom: 0.8rem;
}

.story-example strong,
.story-current strong {
  display: block;
  margin-bottom: 0.35rem;
  color: #3c3322;
}

.story-example p,
.story-current p {
  margin: 0.2rem 0 0;
  color: #5d5b52;
  line-height: 1.4;
}

.story-current span {
  font-weight: 700;
  color: #433726;
}

.story-field {
  display: grid;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.story-field span {
  font-size: 0.88rem;
  font-weight: 700;
  color: #334033;
}

.story-field input,
.story-field select,
.story-field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d4cab7;
  border-radius: 10px;
  background: #fffdf7;
  color: #263126;
  padding: 0.8rem 0.9rem;
  font: inherit;
}

.story-field textarea {
  resize: vertical;
  min-height: 110px;
}

.story-note {
  color: #6d776d;
  font-size: 0.88rem;
  margin-bottom: 0.85rem;
}

.story-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.story-secondary {
  border: 1px solid #d5ccb8;
  background: #efe7d6;
  color: #495649;
}

.story-primary {
  border: 0;
  background: linear-gradient(135deg, #6e4a2b, #95653b);
  color: #fff8f1;
}

.story-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.story-fade-enter-active,
.story-fade-leave-active {
  transition: opacity 0.18s ease;
}

.story-fade-enter-from,
.story-fade-leave-to {
  opacity: 0;
}
</style>
