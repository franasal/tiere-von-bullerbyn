<!-- src/components/ProgressBar.vue -->
<template>
  <div class="progress-wrap" :aria-valuenow="Math.round(percent*100)" aria-valuemin="0" aria-valuemax="100">
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: (percent*100).toFixed(1) + '%' }"></div>
    </div>
    <div class="progress-label">
      {{ answered }} / {{ total }} Merkmale gewählt
    </div>
  </div>
</template>

<script setup>
defineProps({
  answered: { type: Number, required: true },
  total: { type: Number, required: true },
  percent: { type: Number, required: true } // 0..1
});
</script>

<style scoped>
.progress-wrap { display: grid; gap: .25rem; }
.progress-track { width: 100%; height: 10px; background: rgba(0,0,0,.08); border-radius: 999px; overflow: hidden; }
.progress-fill { height: 100%; background: #f48fb1; opacity: .9; transition: width .25s ease; }
.progress-label { font-size: .875rem; opacity: .8; }
</style>
