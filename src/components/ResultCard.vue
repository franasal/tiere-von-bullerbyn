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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

defineProps({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  appearance: { type: String, default: '' },
  story: { type: String, default: '' },
});

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
