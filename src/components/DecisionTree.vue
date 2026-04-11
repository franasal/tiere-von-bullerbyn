<!-- src/components/DecisionTree.vue -->
<template>
  <div>
    <ProgressBar
      v-if="totalSteps > 0"
      :answered="answeredCount"
      :total="totalSteps"
      :percent="progress"
      :species="species"
      class="mb-4"
    />

    <div v-if="currentNode && currentNode.result">
      <slot name="result" :name="currentNode.result"></slot>
    </div>

    <Transition name="question-fade" mode="out-in" v-else>
      <div v-if="currentNode" :key="currentNode.key || currentNode.question">
        <div
          v-if="currentNode.questionImage && currentNode.key === 'sex'"
          class="question-box"
        >
          <p v-if="currentNode.categoryHint" class="category-hint">{{ currentNode.categoryHint }}</p>
          <p class="question">{{ currentNode.question }}</p>
          <div class="question-visual question-visual--stacked">
            <p v-if="currentNode.questionImageLabel" class="question-visual-label">
              {{ currentNode.questionImageLabel }}
            </p>
            <div class="question-visual-media">
              <img
                :src="currentNode.questionImage"
                :alt="currentNode.questionImageAlt || currentNode.question"
                class="question-visual-image"
                role="button"
                tabindex="0"
                @click="openImagePreview(currentNode.questionImage)"
                @keydown.enter.prevent="openImagePreview(currentNode.questionImage)"
                @keydown.space.prevent="openImagePreview(currentNode.questionImage)"
              />
              <div
                v-if="currentNode.questionImageCredit"
                class="question-visual-credit-overlay"
              >
                © {{ currentNode.questionImageCredit }}
              </div>
            </div>
            <p v-if="currentNode.questionImageCaption" class="question-visual-caption">
              {{ currentNode.questionImageCaption }}
            </p>
          </div>
          <p v-if="currentNode.helpText" class="help-text">{{ currentNode.helpText }}</p>
        </div>
        <div
          v-else
          class="question-box"
          :class="{ 'question-box--with-visual': currentNode.questionImage }"
        >
          <div class="question-copy">
            <p v-if="currentNode.categoryHint" class="category-hint">{{ currentNode.categoryHint }}</p>
            <p class="question">{{ currentNode.question }}</p>
            <p v-if="currentNode.helpText" class="help-text">{{ currentNode.helpText }}</p>
          </div>
          <div
            v-if="currentNode.questionImage"
            class="question-visual"
          >
            <p v-if="currentNode.questionImageLabel" class="question-visual-label">
              {{ currentNode.questionImageLabel }}
            </p>
            <img
              :src="currentNode.questionImage"
              :alt="currentNode.questionImageAlt || currentNode.question"
              class="question-visual-image"
              role="button"
              tabindex="0"
              @click="openImagePreview(currentNode.questionImage)"
              @keydown.enter.prevent="openImagePreview(currentNode.questionImage)"
              @keydown.space.prevent="openImagePreview(currentNode.questionImage)"
            />
            <p v-if="currentNode.questionImageCaption" class="question-visual-caption">
              {{ currentNode.questionImageCaption }}
            </p>
          </div>
        </div>
        <div v-if="currentNode.key === 'fallbackResult' && currentNode.optionCards" class="option-card-grid">
          <button
            v-for="(branch, option) in currentNode.options"
            :key="option"
            type="button"
            class="option-card"
            @click="$emit('advance', option, branch)"
          >
            <img
              :src="currentNode.optionCards[option]?.imageUrl"
              :alt="currentNode.optionCards[option]?.title || formatLabel(option)"
              class="option-card-image"
            />
            <span class="option-card-title">{{ currentNode.optionCards[option]?.title || formatLabel(option) }}</span>
          </button>
        </div>
        <div v-else class="options">
          <template v-for="(branch, option) in currentNode.options" :key="option">
            <button
              v-if="option !== unknownOption"
              class="option-button"
              @click="$emit('advance', option, branch)"
            >
              {{ formatLabel(option) }}
            </button>
          </template>
          <button
            v-if="unknownOption in (currentNode.options || {})"
            class="skip-button"
            @click="$emit('advance', unknownOption, currentNode.options[unknownOption])"
          >
            {{ formatLabel(unknownOption) }}
          </button>
        </div>
      </div>
    </Transition>

    <div
      v-if="previewImage"
      class="cue-preview-overlay"
      @click.self="closeImagePreview"
    >
      <div class="cue-preview-dialog">
        <button
          type="button"
          class="cue-preview-close"
          aria-label="Bild schließen"
          @click="closeImagePreview"
        >
          X
        </button>
        <img
          :src="previewImage"
          :alt="currentNode?.questionImageAlt || currentNode?.question || 'Hinweisfoto'"
          class="cue-preview-image"
        />
      </div>
    </div>

    <div v-if="showNav" class="navigation-buttons">
      <template v-if="path.length > 0">
        <button class="back-button" @click="$emit('back')">← Zurück</button>
        <button class="reset-button" @click="$emit('reset')">Startseite</button>
      </template>
      <template v-else>
        <button class="reset-button full-width" @click="$emit('reset')">Startseite</button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import ProgressBar from './ProgressBar.vue';
import { UNKNOWN_OPTION } from '../data/pigIdentifier.js';

const unknownOption = UNKNOWN_OPTION;
const previewImage = ref('');

const props = defineProps({
  currentNode: { type: Object, default: null },
  path: { type: Array, required: true },
  species: { type: String, default: '' },
  showNav: { type: Boolean, default: true }
});

function remainingToLeaf(node) {
  if (!node || node.result) return 0;
  let minDepth = Infinity;
  for (const k of Object.keys(node.options || {})) {
    const child = node.options[k];
    minDepth = Math.min(minDepth, 1 + remainingToLeaf(child));
  }
  return Number.isFinite(minDepth) ? minDepth : 1;
}

const answeredCount = computed(() => props.path.length);
const totalSteps = computed(() => {
  if (props.currentNode?.estimatedRemaining) {
    return Math.max(1, answeredCount.value + props.currentNode.estimatedRemaining);
  }
  const rem = remainingToLeaf(props.currentNode);
  return Math.max(1, answeredCount.value + rem);
});
const progress = computed(() => answeredCount.value / totalSteps.value);

function formatLabel(option) {
  if (props.currentNode?.optionLabels?.[option]) {
    return props.currentNode.optionLabels[option];
  }

  const map = {
    '': 'Keine', left: 'Links', right: 'Rechts',
    'hängend': 'Hängend', normal: 'Normal', 'ohne_spitzen': 'Ohne Spitzen',
    short: 'Kurz', long_with_hair: 'Lang mit Haaren', long_without_hair: 'Lang',
    flecken_gesicht: 'Flecken im Gesicht', flecken_genau_abgegrenzt: 'Flecken abgegrenzt',
    grau_rücken: 'Grau am Rücken', komplett_gefleckt: 'Komplett gefleckt', rosa: 'Rosa',
    halb_schwarz_rosa_klein: 'Halb schwarz, halb rosa', schwarz_weiss_borsten_groß: 'Schwarz/weiße Borsten (groß)',
    stoßzähne_buckel_helle_borsten: 'Stoßzähne + Buckel + helle Borsten',
    nur_schwarz_borsten_im_nacken: 'Schwarz + Borsten im Nacken'
  };
  return map[option] || option;
}

function openImagePreview(url) {
  previewImage.value = url || '';
}

function closeImagePreview() {
  previewImage.value = '';
}
</script>

<style scoped>
.mb-4 { margin-bottom: 1rem; }

.question-box {
  background-color: var(--question-box-bg, var(--group-accent-soft, rgba(255, 255, 255, 0.04)));
  border: 1px solid var(--question-box-border, var(--group-accent-border, rgba(255, 255, 255, 0.08)));
  padding: 1rem; border-radius: var(--radius, 16px); margin-bottom: 1rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.question-box--with-visual {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.9rem;
}
.question-box--stacked-visual .question-visual {
  margin-top: 0.75rem;
  width: 100%;
  max-width: none;
  padding: 0.75rem;
  border-radius: 10px;
  background: var(--question-box-visual-bg, rgba(255, 255, 255, 0.75));
  box-sizing: border-box;
}
.question-copy {
  flex: 1 1 auto;
  min-width: 0;
}
.category-hint {
  margin: 0 0 .3rem; font-size: .8rem;
  color: var(--theme-muted, #8d6e63); text-transform: uppercase; letter-spacing: .04em;
}
.question { font-weight: bold; margin: 0; color: var(--theme-text, inherit); }
.help-text { margin: 0.5rem 0 0; font-size: 0.9rem; color: var(--question-box-caption, #6d4c41); }
.question-visual {
  flex: 0 0 auto;
  width: 84px;
  text-align: center;
}
.question-visual-media {
  position: relative;
}
.question-visual--stacked {
  width: 100%;
  max-width: none;
}
.question-visual-label {
  margin: 0 0 0.35rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--theme-accent, #7b1f46);
}
.question-visual-image {
  display: block;
  width: 76px;
  height: 76px;
  border-radius: 999px;
  margin: 0 0 0 auto;
  object-fit: cover;
  border: 3px solid var(--theme-surface-strong, #fff);
  box-shadow: var(--cue-image-shadow, 0 0 0 1px #f0d6e0);
  cursor: zoom-in;
}
.question-visual--stacked .question-visual-image {
  width: 100%;
  max-width: 280px;
  height: auto;
  aspect-ratio: 1231 / 819;
  border-radius: 8px;
  margin: 0 auto;
  border: none;
  box-shadow: none;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.72);
}
.question-visual--stacked .question-visual-media {
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;
}
.question-visual-credit-overlay {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  padding: 0.18rem 0.3rem;
  border-radius: 6px;
  background: rgba(20, 14, 18, 0.5);
  color: #fdf5f9;
  font-size: 0.54rem;
  line-height: 1.2;
  max-width: 8.5rem;
  white-space: normal;
  overflow-wrap: anywhere;
  text-align: right;
}
.question-visual-caption {
  margin: 0.4rem 0 0;
  font-size: 0.78rem;
  line-height: 1.35;
  color: var(--question-box-caption, #5d4037);
}
.question-visual--stacked .question-visual-caption {
  font-size: 0.9rem;
  margin-top: 0.55rem;
}

.cue-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(23, 18, 23, 0.68);
}

.cue-preview-dialog {
  position: relative;
  width: min(92vw, 560px);
}

.cue-preview-close {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 999px;
  background: var(--theme-surface-strong, #fff);
  color: var(--theme-text, #5a4151);
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: 0 8px 22px rgba(22, 14, 22, 0.22);
}

.cue-preview-image {
  display: block;
  width: 100%;
  max-height: 78vh;
  object-fit: contain;
  border-radius: 20px;
  background: var(--theme-surface-strong, #fff);
  box-shadow: 0 18px 50px rgba(15, 11, 15, 0.3);
}

@media (max-width: 420px) {
  .question-box {
    padding: 0.9rem;
  }

  .question-box--with-visual {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .question-visual {
    width: 100%;
    text-align: left;
  }

  .question-visual-label {
    margin-bottom: 0.45rem;
  }

  .question-box--with-visual {
    gap: 0.75rem;
  }

  .question-visual {
    width: 100%;
  }

  .question-visual-image {
    width: min(100%, 168px);
    height: auto;
    margin: 0;
  }

  .question-visual-credit-overlay {
    right: 0.4rem;
    bottom: 0.4rem;
    font-size: 0.5rem;
    max-width: 7rem;
  }
}

.options { display: flex; flex-direction: column; gap: .4rem; }

.option-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(124px, 1fr));
  gap: .7rem;
}

.option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .45rem;
  width: 100%;
  padding: .65rem;
  border: 1px solid var(--option-card-border, var(--group-accent-border, #f8bbd0));
  border-radius: var(--radius, 16px);
  background: var(--option-card-bg, color-mix(in srgb, var(--group-accent-soft, #fce4ec) 65%, white));
  cursor: pointer;
  transition: transform .12s ease, box-shadow .15s ease, border-color .15s ease;
}

.option-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--option-card-hover-shadow, 0 8px 18px rgba(0, 0, 0, .08));
  border-color: var(--question-box-border, var(--group-accent-strong, #ec407a));
}

.option-card:active {
  transform: scale(0.98);
}

.option-card-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 10px;
  background: var(--theme-surface-strong, #fff);
}

.option-card-title {
  font-size: .9rem;
  font-weight: 700;
  color: var(--group-accent-text, #3e2723);
  text-align: center;
}

.option-button, .skip-button, .back-button, .reset-button {
  display: block; width: 100%;
  padding: .75rem 1rem;
  min-height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 999px;
  cursor: pointer; font-weight: 700;
  font-size: .95rem;
  transition: background .2s ease, transform .15s ease, box-shadow .2s ease;
  -webkit-tap-highlight-color: transparent;
}
.option-button:active, .skip-button:active,
.back-button:active, .reset-button:active {
  transform: scale(0.98);
}

.option-button {
  background-color: var(--group-accent, #f48fb1);
  color: var(--group-accent-text, #212121);
}
.option-button:hover {
  background-color: var(--group-accent-strong, #ec407a);
  color: white;
}

.skip-button {
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed var(--theme-muted, rgba(255, 255, 255, 0.2));
  color: var(--theme-muted, #8a8880);
  font-weight: normal;
  font-size: .88rem;
  padding: .55rem .75rem;
  margin-top: .25rem;
}
.skip-button:hover { border-color: var(--theme-text, #ccc); color: var(--theme-text, #e8e6e1); background: rgba(255, 255, 255, 0.04); }

.back-button {
  background-color: var(--group-secondary, #d1c4e9);
  color: var(--group-secondary-text, #4527a0);
}
.back-button:hover {
  background-color: var(--group-secondary-strong, #b39ddb);
  color: white;
}
.reset-button {
  background-color: var(--group-tertiary, #b0bec5);
  color: var(--group-tertiary-text, #37474f);
}
.reset-button:hover {
  background-color: var(--group-tertiary-strong, #90a4ae);
  color: white;
}

.navigation-buttons {
  display: flex; justify-content: space-between; gap: 1rem; margin-top: 1rem;
}
.navigation-buttons button { flex: 1; }
.full-width { width: 100%; }

/* Question transition */
.question-fade-enter-active { animation: fadeSlideIn .25s ease; }
.question-fade-leave-active { animation: fadeSlideOut .15s ease; }

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeSlideOut {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-6px); }
}
</style>
