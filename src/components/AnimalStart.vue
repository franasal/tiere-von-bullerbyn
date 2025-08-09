<!-- src/components/AnimalStart.vue -->
<template>
  <div class="start-screen">
    <h1 class="start-title">
      🐾 Die Tiere<br />
      <span class="subtitle">von Veganien 🐾</span>
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
const props = defineProps({
  availableSpecies: { type: Array, required: true }
});

function formatSpecies(key) {
  const map = { pigs: 'Schweine', cow: 'Kuh', goat: 'Ziege' };
  return map[key] || key;
}
</script>

<style scoped>
.start-screen { display: flex; flex-direction: column; align-items: center; text-align: center; }
.start-logo { max-width: 30%; height: auto; margin-bottom: 1rem; }
.start-title { font-size: 1.8rem; line-height: 1.4; margin-bottom: 0.5rem; text-align: center; }
.subtitle { display: block; padding-left: 1.5rem; }
.subtitle2 { font-size: 1.8rem; display: block; }
.animal-options { display: flex; flex-direction: column; gap: .5rem; }
.animal-options button { background-color: #ffccbc; color: #5d4037; border: none; padding: .5rem; border-radius: 4px; cursor: pointer; font-weight: bold; }
.animal-options button:hover { background-color: #ffab91; color: white; }
</style>
