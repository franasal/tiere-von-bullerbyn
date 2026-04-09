<template>
  <div class="characteristics">
    <h3 class="section-title">Steckbrief</h3>
    <div class="char-rows">
      <div class="char-row" v-for="char in charList" :key="char.key">
        <span class="char-icon">{{ char.icon }}</span>
        <span class="char-label">{{ char.label }}</span>
        <div class="char-bar-track">
          <div
            class="char-bar-fill"
            :style="{ width: (char.value / CHARACTERISTIC_SCALE_MAX * 100) + '%' }"
          />
          <span
            v-for="step in CHARACTERISTIC_SCALE_MAX - 1"
            :key="`${char.key}-limit-${step}`"
            class="char-bar-limit"
            :style="{ left: (step / CHARACTERISTIC_SCALE_MAX * 100) + '%' }"
          />
        </div>
      </div>
    </div>
    <div v-if="besonderheiten" class="besonderheiten">
      <span class="besonderheiten-label">⭐ Besonderheit:</span>
      <span class="besonderheiten-text">{{ besonderheiten }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  CHARACTERISTIC_DEFINITIONS,
  CHARACTERISTIC_SCALE_MAX
} from '../data/animalCharacteristics.js';

const props = defineProps({
  characteristics: { type: Object, default: () => ({}) },
  besonderheiten: { type: String, default: '' }
});

const charList = computed(() =>
  CHARACTERISTIC_DEFINITIONS.map((definition) => ({
    ...definition,
    value: props.characteristics?.[definition.key] || 0
  }))
);
</script>

<style scoped>
.characteristics {
  width: 100%;
  box-sizing: border-box;
  margin-top: .5rem;
  padding: .6rem .75rem;
  background: rgba(255, 248, 240, .7);
  border: 1px solid #ffe0b2;
  border-radius: 10px;
}

.section-title {
  font-size: .9rem;
  color: #5d4037;
  margin: 0 0 .5rem;
}

.char-rows {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.char-row {
  display: grid;
  grid-template-columns: 1.3rem 7.5rem minmax(0, 1fr);
  align-items: center;
  gap: .45rem;
  min-width: 0;
}

.char-icon {
  font-size: .95rem;
  width: 1.3rem;
  text-align: center;
  flex-shrink: 0;
}

.char-label {
  font-size: .78rem;
  color: #6d4c41;
  width: 7.5rem;
  font-weight: 600;
  flex-shrink: 0;
}

.char-bar-track {
  position: relative;
  width: 100%;
  min-width: 0;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(93, 64, 55, 0.12);
  border: 1px solid rgba(93, 64, 55, 0.08);
}

.char-bar-fill {
  position: absolute;
  inset: 0 auto 0 0;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #f48fb1, #ec407a);
  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.char-bar-limit {
  position: absolute;
  top: -1px;
  bottom: -1px;
  width: 1px;
  background: rgba(255, 248, 240, 0.9);
  transform: translateX(-50%);
}

.char-bar-track::after {
  content: '';
  position: absolute;
  inset: 0;
  height: 10px;
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgba(93, 64, 55, 0.08);
  pointer-events: none;
}

.besonderheiten {
  margin-top: .5rem;
  padding-top: .45rem;
  border-top: 1px dashed #ffe0b2;
  font-size: .82rem;
  color: #5d4037;
  line-height: 1.4;
}

.besonderheiten-label {
  font-weight: 700;
  margin-right: .3rem;
}

.besonderheiten-text {
  font-style: italic;
}

@media (max-width: 520px) {
  .char-row {
    grid-template-columns: 1.3rem minmax(0, 1fr);
    align-items: center;
  }

  .char-label {
    width: auto;
    min-width: 0;
  }

  .char-bar-track {
    grid-column: 2 / 3;
    margin-top: .1rem;
  }
}

/* ── Dark mode ── */
:global(:root[data-theme='dark']) .characteristics {
  background: var(--theme-surface, rgba(18, 20, 26, 0.92));
  border-color: var(--theme-border, #2a2e37);
}

:global(:root[data-theme='dark']) .section-title {
  color: var(--theme-text, #f3eee8);
}

:global(:root[data-theme='dark']) .char-label {
  color: #d7c3b5;
}

:global(:root[data-theme='dark']) .char-bar-track {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.04);
}

:global(:root[data-theme='dark']) .char-bar-limit {
  background: rgba(18, 20, 26, 0.7);
}

:global(:root[data-theme='dark']) .besonderheiten {
  border-top-color: var(--theme-border, #2a2e37);
  color: var(--theme-text, #f3eee8);
}
</style>
