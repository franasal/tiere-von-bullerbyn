<!-- src/components/ResultCard.vue -->
<template>
  <div class="result-card" ref="card">
    <div class="confetti-container" v-if="showConfetti">
      <span v-for="n in 18" :key="n" class="confetti-piece" :style="confettiStyle(n)" />
    </div>
    <img
      :src="imageUrl"
      :alt="`Bild von ${name}`"
      class="animal-image"
    />
    <div class="animal-info">
      <p v-if="appearance"><strong>Erscheinung:</strong> {{ appearance }}</p>
      <p v-if="story"><strong>Geschichte:</strong> {{ story }}</p>
    </div>

    <!-- Unique traits: "So erkennst du mich" -->
    <div v-if="uniqueTraits && uniqueTraits.length" class="unique-traits">
      <h3 class="section-title">So erkennst du mich</h3>
      <div class="trait-badges">
        <span v-for="t in uniqueTraits" :key="t.key" class="trait-badge">
          <span class="badge-icon">{{ t.icon }}</span>
          <span class="badge-text">
            <span class="badge-label">{{ t.label }}</span>
            <span class="badge-value">{{ t.value }}</span>
          </span>
        </span>
      </div>
    </div>

    <!-- Similar animals: "Leicht zu verwechseln mit" -->
    <div v-if="similarAnimals && similarAnimals.length" class="similar-section">
      <h3 class="section-title">So unterscheide ich mich von anderen</h3>
      <div
        v-for="sim in similarAnimals"
        :key="sim.name"
        class="similar-card"
        @click="$emit('showProfile', sim.name)"
      >
        <img
          v-if="sim.imageUrl"
          :src="sim.imageUrl"
          :alt="sim.name"
          class="similar-img"
        />
        <div class="similar-info">
          <strong class="similar-name">{{ sim.name }}</strong>
          <p v-for="d in sim.differences.slice(0, 2)" :key="d.key" class="diff-line">
            {{ d.icon }} {{ d.label }}: <em>{{ d.otherValue }}</em>
            <span class="diff-vs">vs.</span> {{ d.thisValue }}
          </p>
        </div>
      </div>
    </div>

    <div class="story-submit-section">
      <StorySubmissionWidget
        :animal-names="animalNames"
        :selected-animal="name"
        :appearance="appearance"
        :story="story"
        current-view="Ergebnis"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import StorySubmissionWidget from './StorySubmissionWidget.vue';

defineProps({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  appearance: { type: String, default: '' },
  story: { type: String, default: '' },
  animalNames: { type: Array, default: () => [] },
  uniqueTraits: { type: Array, default: () => [] },
  similarAnimals: { type: Array, default: () => [] }
});

defineEmits(['showProfile']);

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
});
</script>

<style scoped>
.result-card {
  position: relative;
  display: flex; flex-direction: column; align-items: center;
  border: 1px solid #ccc; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;
  background-color: #fdf5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  animation: resultReveal .4s cubic-bezier(.34,1.56,.64,1) both;
  overflow: hidden;
}

@keyframes resultReveal {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}

.animal-image {
  max-width: 100%; max-height: 280px; object-fit: contain;
  border-radius: 8px; margin-bottom: .75rem;
}
.animal-info {
  text-align: center; color: #212121;
  word-wrap: break-word; overflow-wrap: break-word; max-width: 100%;
}

/* Unique traits section */
.section-title {
  font-size: .9rem; color: #5d4037; margin: .75rem 0 .4rem;
  text-align: left; width: 100%;
}
.unique-traits { width: 100%; }
.trait-badges {
  display: flex; flex-wrap: wrap; gap: .4rem;
}
.trait-badge {
  display: inline-flex; align-items: center; gap: .35rem;
  background: rgba(244,143,177,.15);
  border: 1px solid #f8bbd0;
  border-radius: 20px;
  padding: .3rem .6rem;
}
.badge-icon { font-size: 1rem; }
.badge-text { display: flex; flex-direction: column; line-height: 1.2; }
.badge-label { font-size: .65rem; color: #8d6e63; text-transform: uppercase; letter-spacing: .03em; }
.badge-value { font-size: .82rem; font-weight: 600; color: #3e2723; }

/* Similar animals section */
.similar-section { width: 100%; }
.story-submit-section { width: 100%; margin-top: 0.9rem; }
.similar-card {
  display: flex; align-items: center; gap: .6rem;
  padding: .5rem; margin-top: .4rem;
  background: rgba(255,255,255,.7);
  border-radius: 8px;
  cursor: pointer;
  transition: background .15s ease, box-shadow .15s ease;
}
.similar-card:hover {
  background: rgba(255,255,255,.95);
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
}
.similar-img {
  width: 48px; height: 48px;
  border-radius: 50%; object-fit: cover;
  border: 2px solid #f8bbd0; flex-shrink: 0;
}
.similar-info { flex: 1; min-width: 0; }
.similar-name { font-size: .9rem; color: #3e2723; }
.diff-line {
  font-size: .78rem; color: #5d4037; margin: .15rem 0 0; line-height: 1.3;
}
.diff-vs {
  color: #bbb; font-style: normal; margin: 0 .2rem;
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
