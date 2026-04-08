<template>
  <div class="characteristics">
    <div class="section-header">
      <span class="section-eyebrow">Steckbrief</span>
      <h3 class="section-title">Charakter und Auftreten</h3>
    </div>
    <div class="char-rows">
      <div class="char-row" v-for="char in charList" :key="char.key">
        <div class="char-main">
          <span class="char-emoji-label">{{ char.icon }}</span>
          <span class="char-label">{{ char.label }}</span>
        </div>
        <span class="char-scale">
          <span
            v-for="n in CHARACTERISTIC_SCALE_MAX"
            :key="n"
            class="char-dot"
            :class="{ filled: n <= char.value }"
          >{{ char.icon }}</span>
        </span>
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
  padding: 1rem;
  border-radius: 20px;
  border: 1px solid rgba(157, 90, 52, 0.14);
  background: linear-gradient(180deg, rgba(255, 252, 248, 0.98), rgba(252, 244, 236, 0.95));
  box-shadow: 0 18px 40px rgba(76, 53, 39, 0.08);
}

.section-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: .4rem;
  margin-bottom: .85rem;
}

.section-eyebrow {
  display: inline-flex;
  align-self: flex-start;
  padding: .3rem .65rem;
  border-radius: 999px;
  background: rgba(157, 90, 52, 0.1);
  color: #9d5a34;
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.section-title {
  margin: 0;
  font-size: 1.1rem;
  color: #2d221b;
}

.char-rows {
  display: flex;
  flex-direction: column;
  gap: .55rem;
}

.char-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  padding: .7rem .8rem;
  border-radius: 16px;
  border: 1px solid rgba(157, 90, 52, 0.1);
  background: rgba(255, 255, 255, 0.76);
}

.char-main {
  display: flex;
  align-items: center;
  gap: .55rem;
  min-width: 0;
}

.char-emoji-label {
  font-size: 1rem;
  width: 1.4rem;
  text-align: center;
}

.char-label {
  font-size: .88rem;
  color: #2d221b;
  font-weight: 700;
}

.char-scale {
  display: flex;
  gap: .2rem;
  flex-shrink: 0;
}

.char-dot {
  font-size: 1rem;
  opacity: .18;
  filter: grayscale(1);
  transition: opacity .2s ease, filter .2s ease;
}

.char-dot.filled {
  opacity: 1;
  filter: grayscale(0);
}

.besonderheiten {
  margin-top: .75rem;
  padding: .85rem .9rem;
  border-radius: 16px;
  border: 1px dashed rgba(157, 90, 52, 0.24);
  font-size: .84rem;
  color: #5d4037;
  line-height: 1.4;
  background: rgba(255, 251, 247, 0.78);
}

.besonderheiten-label {
  font-weight: 700;
  margin-right: .3rem;
}

.besonderheiten-text {
  font-style: italic;
}

@media (max-width: 640px) {
  .characteristics {
    padding: .85rem;
  }

  .char-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
