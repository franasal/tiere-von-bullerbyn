<!-- src/components/ResultCard.vue -->
<template>
  <div class="result-card" ref="card">
    <div class="confetti-container" v-if="showConfetti">
      <span v-for="n in 18" :key="n" class="confetti-piece" :style="confettiStyle(n)" />
    </div>

    <!-- Hero section: image + overlaid name -->
    <div class="hero">
      <ExpandableImage
        :src="imageUrl"
        :alt="`Bild von ${name}`"
        img-class="hero-image"
        button-class="hero-image-button"
      />
      <div class="hero-overlay">
        <h2 class="hero-name">{{ name }}</h2>
      </div>
    </div>

    <!-- Info cards for Erscheinung + Geschichte -->
    <div class="info-cards">
      <div v-if="appearance" class="info-card">
        <span class="info-card-icon">🎨</span>
        <div class="info-card-body">
          <span class="info-card-label">Erscheinung</span>
          <p class="info-card-text">{{ appearance }}</p>
        </div>
      </div>
      <div v-if="story" class="info-card">
        <span class="info-card-icon">📖</span>
        <div class="info-card-body">
          <span class="info-card-label">Geschichte</span>
          <p class="info-card-text">{{ story }}</p>
        </div>
      </div>
    </div>

    <div class="card-padded">
      <AnimalCharacteristics
        v-if="characteristics && Object.keys(characteristics).length"
        :characteristics="characteristics"
        :besonderheiten="besonderheiten"
      />
    </div>

    <!-- Unique traits: "So erkennst du mich" -->
    <div v-if="uniqueTraits && uniqueTraits.length" class="unique-traits">
      <h3 class="section-title">So erkennst du mich</h3>
      <div class="trait-grid">
        <div v-for="t in uniqueTraits" :key="t.key" class="trait-card">
          <span class="trait-card-icon">{{ t.icon }}</span>
          <div class="trait-card-body">
            <span class="trait-card-label">{{ t.label }}</span>
            <span class="trait-card-value">{{ t.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card-padded">
      <VisitorNotes :animal-name="name" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ExpandableImage from './ExpandableImage.vue';
import AnimalCharacteristics from './AnimalCharacteristics.vue';
import VisitorNotes from './VisitorNotes.vue';

defineProps({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  appearance: { type: String, default: '' },
  story: { type: String, default: '' },
  uniqueTraits: { type: Array, default: () => [] },
  similarAnimals: { type: Array, default: () => [] },
  characteristics: { type: Object, default: () => ({}) },
  besonderheiten: { type: String, default: '' }
});

defineEmits(['showProfile']);

const card = ref(null);
const showConfetti = ref(false);

function confettiStyle(n) {
  const hue = (n * 47) % 360;
  const left = 10 + (n * 17) % 80;
  const delay = (n * 0.06).toFixed(2);
  const size = 6 + (n % 4) * 2;
  const drift = -30 + (n * 13) % 60;
  return {
    '--hue': hue,
    '--left': left + '%',
    '--delay': delay + 's',
    '--size': size + 'px',
    '--drift': drift + 'px',
    background: `hsl(${hue}, 80%, 60%)`,
    left: left + '%',
    width: size + 'px',
    height: size + 'px',
    animationDelay: delay + 's',
  };
}

onMounted(() => {
  showConfetti.value = true;
  setTimeout(() => { showConfetti.value = false; }, 1800);
  card.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
</script>

<style scoped>
.result-card {
  position: relative;
  display: flex; flex-direction: column; align-items: center;
  border: 1px solid #ccc; border-radius: 12px; margin-bottom: 1rem;
  background-color: #fdf5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  animation: resultReveal .4s cubic-bezier(.34,1.56,.64,1) both;
  overflow: hidden;
}

@keyframes resultReveal {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}

/* Hero section */
.hero {
  position: relative;
  width: 100%;
}
:deep(.hero-image-button) {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: zoom-in;
}
:deep(.hero-image) {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  display: block;
}
.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2.5rem 1rem 0.75rem;
  background: linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.18) 60%, transparent 100%);
}
.hero-name {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 1px 6px rgba(0,0,0,0.35);
}

/* Info cards */
.info-cards {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem 0;
}
.info-card {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.65rem 0.75rem;
  background: rgba(255, 248, 240, 0.8);
  border: 1px solid #ffe0b2;
  border-radius: 10px;
}
.info-card-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}
.info-card-body {
  flex: 1;
  min-width: 0;
}
.info-card-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #8d6e63;
  margin-bottom: 0.15rem;
}
.info-card-text {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.45;
  color: #3e2723;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.card-padded {
  width: 100%;
  padding: 0 1rem;
}

/* Unique traits section */
.section-title {
  font-size: .9rem; color: #5d4037; margin: .75rem 0 .4rem;
  text-align: left; width: 100%;
}
.unique-traits { width: 100%; padding: 0 1rem; }
.trait-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.45rem;
}
.trait-card {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.6rem;
  background: rgba(244,143,177,.12);
  border: 1px solid #f8bbd0;
  border-radius: 10px;
}
.trait-card-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}
.trait-card-body {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
}
.trait-card-label {
  font-size: 0.65rem;
  color: #8d6e63;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.trait-card-value {
  font-size: 0.88rem;
  font-weight: 700;
  color: #3e2723;
}

/* Similar animals section */
.similar-section { width: 100%; padding: 0 1rem; }
.similar-card {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.6rem;
  margin-top: 0.5rem;
  background: rgba(255,255,255,.7);
  border: 1px solid #f0e6e0;
  border-radius: 10px;
  cursor: pointer;
  transition: background .15s ease, box-shadow .15s ease;
}
.similar-card:hover {
  background: rgba(255,255,255,.95);
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
}
:deep(.similar-img) {
  width: 64px; height: 64px;
  border-radius: 50%; object-fit: cover;
  border: 2px solid #f8bbd0; flex-shrink: 0;
}
.similar-info { flex: 1; min-width: 0; }
.similar-name { font-size: .92rem; color: #3e2723; display: block; margin-bottom: 0.3rem; }

/* Comparison table */
.diff-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.76rem;
}
.diff-th {
  text-align: left;
  font-weight: 600;
  color: #8d6e63;
  padding: 0.1rem 0.3rem 0.15rem 0;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-bottom: 1px solid #f0e6e0;
}
.diff-th-me { color: #5d4037; }
.diff-th-other { color: #8d6e63; }
.diff-row td {
  padding: 0.2rem 0.3rem 0.2rem 0;
  vertical-align: top;
}
.diff-trait {
  color: #6d4c41;
  white-space: nowrap;
}
.diff-mine {
  color: #3e2723;
  font-weight: 600;
}
.diff-theirs {
  color: #9e8e85;
}

/* Confetti */
.confetti-container {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none; overflow: hidden; z-index: 1;
}
.confetti-piece {
  position: absolute; top: -10px;
  border-radius: 2px;
  opacity: 0;
  animation: confettiFall 1.4s ease-out forwards;
}

@keyframes confettiFall {
  0%   { opacity: 1; transform: translateY(0) rotate(0deg); }
  100% { opacity: 0; transform: translateY(260px) translateX(var(--drift, 0px)) rotate(720deg); }
}
</style>
