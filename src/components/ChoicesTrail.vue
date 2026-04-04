<template>
  <div class="steckbrief" v-if="visibleSteps.length">
    <div class="steckbrief-header">
      <span class="steckbrief-title">Erkannte Merkmale</span>
    </div>
    <TransitionGroup name="trait-row" tag="ul" class="trait-list">
      <li
        v-for="s in visibleSteps"
        :key="s.originalIndex"
        class="trait-row"
        @click="$emit('undoTo', s.originalIndex)"
      >
        <span class="trait-icon">{{ traitMeta[s.questionKey]?.icon || '?' }}</span>
        <span class="trait-body">
          <span class="trait-category">{{ traitMeta[s.questionKey]?.label || s.questionKey }}</span>
          <span class="trait-value">{{ resolveLabel(s) }}</span>
        </span>
        <span class="trait-undo" title="Zurück zu diesem Schritt">×</span>
      </li>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { traitMeta, UNKNOWN_OPTION } from '../data/pigIdentifier.js';

const props = defineProps({
  steps: { type: Array, required: true }
});
defineEmits(['undoTo']);

const visibleSteps = computed(() =>
  props.steps
    .map((s, i) => ({ ...s, originalIndex: i }))
    .filter((s) => s.optionKey !== UNKNOWN_OPTION)
    .filter((s) => !(s.mode === 'binary' && s.optionKey === 'no'))
);

function resolveLabel(step) {
  if (step.mode === 'binary' && step.optionKey === 'yes') {
    return step.compareLabel;
  }
  return step.optionLabel;
}
</script>

<style scoped>
.steckbrief {
  background: linear-gradient(135deg, #fdf5f9, #fce4ec);
  border: 1px solid #f8bbd0;
  border-radius: 8px;
  padding: .6rem .75rem;
  margin-bottom: .75rem;
}
.steckbrief-header {
  display: flex; align-items: center; gap: .4rem;
  margin-bottom: .4rem;
}
.steckbrief-title {
  font-size: .85rem; font-weight: 700; color: #5d4037;
  letter-spacing: .02em;
}

.trait-list {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: .3rem;
}

.trait-row {
  display: flex; align-items: center; gap: .5rem;
  padding: .35rem .5rem;
  background: rgba(255,255,255,.7);
  border-radius: 6px;
  cursor: pointer;
  transition: background .15s ease, box-shadow .15s ease;
}
.trait-row:hover {
  background: rgba(255,255,255,.95);
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
}

.trait-icon { font-size: 1.05rem; flex-shrink: 0; width: 1.5rem; text-align: center; }

.trait-body { flex: 1; min-width: 0; }
.trait-category {
  display: block;
  font-size: .7rem; color: #8d6e63;
  text-transform: uppercase; letter-spacing: .04em;
  line-height: 1.2;
}
.trait-value {
  display: block;
  font-size: .88rem; font-weight: 600; color: #3e2723;
  line-height: 1.3;
}

.trait-undo {
  font-size: .9rem; color: #bbb; flex-shrink: 0;
  transition: color .15s ease;
}
.trait-row:hover .trait-undo { color: #c62828; }

/* Transition for new rows */
.trait-row-enter-active { animation: traitSlideIn .25s ease; }
.trait-row-leave-active { animation: traitSlideOut .2s ease; }
.trait-row-move { transition: transform .25s ease; }

@keyframes traitSlideIn {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes traitSlideOut {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(10px); }
}
</style>
