<template>
  <div class="characteristics">
    <h3 class="section-title">Steckbrief</h3>
    <div class="char-rows">
      <div class="char-row" v-for="char in charList" :key="char.key">
        <span class="char-emoji-label">{{ char.icon }}</span>
        <span class="char-label">{{ char.label }}</span>
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
  margin-top: .5rem;
  padding: .6rem;
  background: rgba(255, 248, 240, .7);
  border: 1px solid #ffe0b2;
  border-radius: 10px;
}

.section-title {
  font-size: .9rem;
  color: #5d4037;
  margin: 0 0 .4rem;
}

.char-rows {
  display: flex;
  flex-direction: column;
  gap: .35rem;
}

.char-row {
  display: flex;
  align-items: center;
  gap: .4rem;
}

.char-emoji-label {
  font-size: .85rem;
  width: 1.2rem;
  text-align: center;
  display: none;
}

.char-label {
  font-size: .78rem;
  color: #6d4c41;
  min-width: 7rem;
  font-weight: 600;
}

.char-scale {
  display: flex;
  gap: .15rem;
}

.char-dot {
  font-size: .9rem;
  opacity: .2;
  filter: grayscale(1);
  transition: opacity .2s ease, filter .2s ease;
}

.char-dot.filled {
  opacity: 1;
  filter: grayscale(0);
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
</style>
