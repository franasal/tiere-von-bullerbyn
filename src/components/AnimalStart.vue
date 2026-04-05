<!-- src/components/AnimalStart.vue -->
<template>
  <div class="start-screen">
    <h1 class="start-title" @click="handleTitleTap">
      Die Tiere<br />
      <span class="subtitle">von Veganien</span>
    </h1>

    <img
      src="https://veganbullerbyn.de/wp-content/webp-express/webp-images/uploads/2023/03/logo_gross.png.webp"
      alt="Vegan Bullerbyn Logo"
      class="start-logo"
    />

    <h2 class="subtitle2">Welches Tier möchtest du identifizieren?</h2>

    <div class="animal-options">
      <button
        v-for="animal in availableSpecies"
        :key="animal"
        @click="$emit('select', animal)"
      >
        {{ formatSpecies(animal) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  availableSpecies: { type: Array, required: true }
});

const emit = defineEmits(['select', 'browse', 'toggleAdmin']);

const tapCount = ref(0);
let tapTimer = null;

function handleTitleTap() {
  tapCount.value++;
  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => { tapCount.value = 0; }, 1500);
  if (tapCount.value >= 5) {
    tapCount.value = 0;
    emit('toggleAdmin');
  }
}

function formatSpecies(key) {
  const map = { pigs: 'Schweine', cow: 'Kuh', goat: 'Ziege' };
  return map[key] || key;
}
</script>

<style scoped>
.start-screen { display: flex; flex-direction: column; align-items: center; text-align: center; }
.start-logo { max-width: 30%; height: auto; margin-bottom: 1rem; }
.start-title {
  font-size: 1.8rem; line-height: 1.4; margin-bottom: 0.5rem;
  text-align: center; cursor: default; user-select: none;
}
.subtitle { display: block; padding-left: 1.5rem; }
.subtitle2 { font-size: 1.4rem; display: block; margin-bottom: .5rem; }
.animal-options { display: flex; flex-direction: column; gap: .5rem; width: 100%; max-width: 280px; }
.animal-options button {
  background-color: #ffccbc; color: #5d4037; border: none;
  padding: .75rem 1rem; border-radius: 6px; cursor: pointer;
  font-weight: bold; font-size: .95rem;
  transition: background .15s ease, transform .1s ease;
}
.animal-options button:hover { background-color: #ffab91; color: white; }
.animal-options button:active { transform: scale(0.98); }

.browse-button {
  background-color: #c8e6c9 !important;
  color: #2e7d32 !important;
}
.browse-button:hover {
  background-color: #a5d6a7 !important;
  color: white !important;
}
</style>
