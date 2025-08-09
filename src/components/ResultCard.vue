<!-- src/components/ResultCard.vue -->
<template>
  <div class="result-card">
    <img
      :src="imageUrl"
      :alt="`Bild von ${name}`"
      class="animal-image"
    />
    <div class="animal-info">
      <p><strong>Erscheinung:</strong> {{ appearance }}</p>
      <p><strong>Geschichte:</strong> {{ story }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  appearance: { type: String, default: '' },
  story: { type: String, default: '' },
});
</script>

<style scoped>
.result-card {
  display: flex; flex-direction: column; align-items: center;
  border: 1px solid #ccc; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;
  background-color: #fdf5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.animal-image { max-width: 100%; max-height: 280px; object-fit: contain; border-radius: 8px; margin-bottom: .75rem; }
.animal-info { text-align: center; color: #212121; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%; }
</style>
