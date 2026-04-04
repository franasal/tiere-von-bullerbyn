<!-- src/components/ProgressBar.vue -->
<template>
  <div class="progress-wrap" role="progressbar"
    :aria-valuenow="Math.round(percent*100)" aria-valuemin="0" aria-valuemax="100">
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: (percent*100).toFixed(1) + '%' }">
        <span class="progress-pig" v-if="percent > 0">🐷</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  answered: { type: Number, required: true },
  total: { type: Number, required: true },
  percent: { type: Number, required: true }
});
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
  background: linear-gradient(90deg, #f8bbd0, #f48fb1);
  border-radius: 999px;
  transition: width .35s ease;
  position: relative;
  min-width: 0;
}
.progress-pig {
  position: absolute;
  right: -6px; top: 50%;
  transform: translateY(-50%);
  font-size: .75rem;
  line-height: 1;
  filter: drop-shadow(0 1px 1px rgba(0,0,0,.15));
}
</style>
