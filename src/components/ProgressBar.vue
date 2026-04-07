<!-- src/components/ProgressBar.vue -->
<template>
  <div class="progress-wrap" role="progressbar"
    :aria-valuenow="Math.round(percent*100)" aria-valuemin="0" aria-valuemax="100">
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: (percent*100).toFixed(1) + '%' }">
        <span
          class="progress-animal"
          :class="{ 'progress-animal--mirrored': shouldMirror }"
          v-if="percent > 0"
        >
          {{ speciesEmoji }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  answered: { type: Number, required: true },
  total: { type: Number, required: true },
  percent: { type: Number, required: true },
  species: { type: String, default: '' }
});

const speciesEmojiMap = {
  pigs: '🐷',
  cow: '🐮',
  goat: '🐐',
  sheep: '🐑',
  equine: '🫏',
  dog: '🐶'
};

const speciesEmoji = computed(() => speciesEmojiMap[props.species] || '🐾');
const shouldMirror = computed(() => props.species === 'goat' || props.species === 'sheep');
</script>

<style scoped>
.progress-wrap { display: grid; gap: .25rem; }
.progress-track {
  width: 100%; height: 14px;
  background: rgba(0,0,0,.06);
  border-radius: 999px; overflow: hidden;
  position: relative;
}
.progress-fill {
  height: 100%;
  background-image:
    linear-gradient(
      90deg,
      #ff4d6d 0%,
      #ff9e00 18%,
      #ffd60a 34%,
      #6ecb63 50%,
      #32c5ff 68%,
      #6c63ff 84%,
      #c77dff 100%
    );
  background-size: 180% 100%;
  border-radius: 999px;
  transition: width .35s ease;
  position: relative;
  min-width: 0;
  animation: rainbowSlide 4s linear infinite;
}
.progress-animal {
  position: absolute;
  right: -6px; top: 50%;
  transform: translateY(-50%);
  font-size: .82rem;
  line-height: 1;
  filter: drop-shadow(0 1px 1px rgba(0,0,0,.15));
}

.progress-animal--mirrored {
  transform: translateY(-50%) scaleX(-1);
}

@keyframes rainbowSlide {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
</style>
