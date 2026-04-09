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
        </div>
        <span class="char-value">{{ char.value }}/{{ CHARACTERISTIC_SCALE_MAX }}</span>
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
  display: flex;
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
  min-width: 6.5rem;
  font-weight: 600;
  flex-shrink: 0;
}

.char-bar-track {
  flex: 1;
  min-width: 0;
  height: 8px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  overflow: hidden;
}

.char-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #f48fb1, #ec407a);
  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.char-value {
  font-size: .72rem;
  color: #8d6e63;
  min-width: 1.8rem;
  text-align: right;
  font-weight: 600;
  flex-shrink: 0;
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
    display: grid;
    grid-template-columns: 1.3rem minmax(0, 1fr) auto;
    align-items: center;
  }

  .char-label {
    min-width: 0;
  }

  .char-bar-track {
    grid-column: 2 / 3;
    margin-top: .1rem;
  }

  .char-value {
    grid-column: 3 / 4;
    grid-row: 1 / 3;
    align-self: center;
  }
}
</style>
