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
        <div class="question-box">
          <p v-if="currentNode.categoryHint" class="category-hint">{{ currentNode.categoryHint }}</p>
          <p class="question">{{ currentNode.question }}</p>
          <div v-if="currentNode.questionImage" class="question-visual">
            <img
              :src="currentNode.questionImage"
              :alt="currentNode.questionImageAlt || currentNode.question"
              class="question-visual-image"
            />
            <p v-if="currentNode.questionImageCaption" class="question-visual-caption">
              {{ currentNode.questionImageCaption }}
            </p>
          </div>
          <p v-if="currentNode.helpText" class="help-text">{{ currentNode.helpText }}</p>
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
              :class="{ 'option-button--with-image': currentNode.optionImages?.[option] }"
              @click="$emit('advance', option, branch)"
            >
              <img
                v-if="currentNode.optionImages?.[option]"
                :src="currentNode.optionImages[option]"
                :alt="formatLabel(option)"
                class="option-cue-image"
              />
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

    <div v-if="showNav" class="navigation-buttons">
      <template v-if="path.length > 0">
        <button class="back-button" @click="$emit('back')">← Zurück</button>
        <button class="reset-button" @click="$emit('reset')">Start</button>
      </template>
      <template v-else>
        <button class="reset-button full-width" @click="$emit('reset')">Start</button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ProgressBar from './ProgressBar.vue';
import { UNKNOWN_OPTION } from '../data/pigIdentifier.js';

const unknownOption = UNKNOWN_OPTION;

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
    short: 'Kurz', long_with_hair: 'Lang mit Haaren', long_without_hair: 'Lang ohne Haare',
    flecken_gesicht: 'Flecken im Gesicht', flecken_genau_abgegrenzt: 'Flecken abgegrenzt',
    grau_rücken: 'Grau am Rücken', komplett_gefleckt: 'Komplett gefleckt', rosa: 'Rosa',
    halb_schwarz_rosa_klein: 'Halb schwarz, halb rosa', schwarz_weiss_borsten_groß: 'Schwarz/weiße Borsten (groß)',
    stoßzähne_buckel_helle_borsten: 'Stoßzähne + Buckel + helle Borsten',
    nur_schwarz_borsten_im_nacken: 'Schwarz + Borsten im Nacken'
  };
  return map[option] || option;
}
</script>

<style scoped>
.mb-4 { margin-bottom: 1rem; }

.question-box {
  background-color: var(--group-accent-soft, #fce4ec);
  border: 1px solid var(--group-accent-border, #f8bbd0);
  padding: 1rem; border-radius: 6px; margin-bottom: 1rem;
}
.category-hint {
  margin: 0 0 .3rem; font-size: .8rem;
  color: #8d6e63; text-transform: uppercase; letter-spacing: .04em;
}
.question { font-weight: bold; margin: 0; }
.help-text { margin: 0.5rem 0 0; font-size: 0.9rem; color: #6d4c41; }
.question-visual {
  margin-top: 0.75rem;
  padding: 0.75rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.75);
}
.question-visual-image {
  display: block;
  width: 100%;
  max-width: 240px;
  border-radius: 8px;
  margin: 0 auto;
  object-fit: cover;
}
.question-visual-caption {
  margin: 0.55rem 0 0;
  font-size: 0.9rem;
  line-height: 1.35;
  color: #5d4037;
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
  border: 1px solid var(--group-accent-border, #f8bbd0);
  border-radius: 12px;
  background: color-mix(in srgb, var(--group-accent-soft, #fce4ec) 65%, white);
  cursor: pointer;
  transition: transform .12s ease, box-shadow .15s ease, border-color .15s ease;
}

.option-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, .08);
  border-color: var(--group-accent-strong, #ec407a);
}

.option-card:active {
  transform: scale(0.98);
}

.option-card-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 10px;
  background: #fff;
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
  border: none; border-radius: 6px;
  cursor: pointer; font-weight: bold;
  font-size: .95rem;
  transition: background .15s ease, transform .1s ease;
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

.option-button--with-image {
  display: flex;
  align-items: center;
  gap: .6rem;
  text-align: left;
}

.option-cue-image {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.skip-button {
  background: transparent;
  border: 1.5px dashed #bbb;
  color: #888;
  font-weight: normal;
  font-size: .88rem;
  padding: .55rem .75rem;
  margin-top: .25rem;
}
.skip-button:hover { border-color: #999; color: #555; background: #f5f5f5; }

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
