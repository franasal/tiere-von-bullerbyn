<!-- src/components/AnimalStart.vue -->
<template>
  <div class="start-screen">
    <div class="start-header">
      <img
        src="https://veganbullerbyn.de/wp-content/webp-express/webp-images/uploads/2023/03/logo_gross.png.webp"
        alt="Vegan Bullerbyn Logo"
        class="start-logo"
        @click="handleTitleTap"
      />
      <h1 class="start-title">
        Die Tiere
        <span class="subtitle">von Veganien</span>
      </h1>
    </div>

    <p class="start-prompt">Welches Tier möchtest du identifizieren?</p>

    <div class="animal-grid">
      <button
        v-for="animal in availableSpecies"
        :key="animal"
        :class="['animal-card', `animal-card--${animal}`]"
        :style="getSpeciesThemeStyle(animal)"
        @click="$emit('select', animal)"
      >
        <span class="animal-emoji">{{ getEmoji(animal) }}</span>
        <span class="animal-label">{{ getLabel(animal) }}</span>
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

const speciesData = {
  pigs:   { emoji: '🐷', label: 'Schweine' },
  cow:    { emoji: '🐮', label: 'Kühe' },
  goat:   { emoji: '🐐', label: 'Ziegen' },
  sheep:  { emoji: '🐑', label: 'Schafe' },
  equine: { emoji: '🫏', label: 'Esel & Ponys' },
  dog:    { emoji: '🐶', label: 'Hunde' }
};

function getEmoji(key) { return speciesData[key]?.emoji || '🐾'; }
function getLabel(key) { return speciesData[key]?.label || key; }

function getSpeciesThemeStyle(key) {
  const themes = {
    pigs:   { '--card-bg': '#fce4ec', '--card-hover': '#f48fb1', '--card-text': '#880e4f', '--card-border': '#f8bbd0' },
    goat:   { '--card-bg': '#efebe9', '--card-hover': '#a1887f', '--card-text': '#3e2723', '--card-border': '#d7ccc8' },
    sheep:  { '--card-bg': '#eceff1', '--card-hover': '#90a4ae', '--card-text': '#263238', '--card-border': '#cfd8dc' },
    equine: { '--card-bg': '#efebe9', '--card-hover': '#a1887f', '--card-text': '#3e2723', '--card-border': '#d7ccc8' },
    cow:    { '--card-bg': '#fff3e0', '--card-hover': '#ffb74d', '--card-text': '#4e342e', '--card-border': '#ffe0b2' },
    dog:    { '--card-bg': '#e8f5e9', '--card-hover': '#81c784', '--card-text': '#1b5e20', '--card-border': '#c8e6c9' }
  };
  return themes[key] || {};
}
</script>

<style scoped>
.start-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem 1rem 2rem;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ---- Header ---- */
.start-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 1.25rem;
}

.start-logo {
  width: 100px;
  height: auto;
  cursor: default;
  user-select: none;
}

.start-title {
  font-size: 1.6rem;
  line-height: 1.3;
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.subtitle {
  display: block;
  font-weight: 400;
  font-size: 1.1rem;
  opacity: 0.7;
  margin-top: 0.1rem;
}

/* ---- Prompt ---- */
.start-prompt {
  font-size: 1rem;
  opacity: 0.65;
  margin: 0 0 1rem;
  font-weight: 500;
}

/* ---- Grid ---- */
.animal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  width: 100%;
  max-width: 340px;
}

.animal-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 1.1rem 0.5rem;
  border-radius: 16px;
  border: 2px solid var(--card-border, #e0e0e0);
  background: var(--card-bg, #fafafa);
  color: var(--card-text, #333);
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.animal-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  background: var(--card-hover, #e0e0e0);
  border-color: var(--card-hover, #bbb);
  color: #fff;
}

.animal-card:active {
  transform: translateY(0) scale(0.97);
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.animal-emoji {
  font-size: 2.2rem;
  line-height: 1;
}

.animal-label {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* single-column for very narrow screens */
@media (max-width: 280px) {
  .animal-grid {
    grid-template-columns: 1fr;
  }
}
</style>
