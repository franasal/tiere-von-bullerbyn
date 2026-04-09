<!-- src/components/AnimalGallery.vue -->
<template>
  <div class="gallery">
    <div class="gallery-header">
      <h2 class="gallery-title">Alle Tiere kennenlernen</h2>
      <p class="gallery-hint">Tippe auf ein Tier, um mehr zu erfahren.</p>
    </div>

    <div class="gallery-grid">
      <div
        v-for="animal in animals"
        :key="animal.name"
        class="gallery-card"
        @click="$emit('showProfile', animal.name)"
      >
        <div class="gallery-image-wrap">
          <img
            :src="animal.imageUrl"
            :alt="animal.name"
            class="gallery-img"
          />
        </div>
        <div class="gallery-body">
          <strong class="gallery-name">{{ animal.name }}</strong>
          <div class="gallery-traits">
            <span
              v-for="t in animal.uniqueTraits.slice(0, 2)"
              :key="t.key"
              class="mini-badge"
            >
              {{ t.icon }} {{ t.value }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <button class="back-button" @click="$emit('back')">← Zurück</button>
  </div>
</template>

<script setup>
defineProps({
  animals: { type: Array, required: true }
});

defineEmits(['showProfile', 'back']);
</script>

<style scoped>
.gallery {
  animation: fadeIn .3s ease;
  text-align: left;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.gallery-header {
  margin-bottom: 1rem;
}

.gallery-title {
  font-size: 1.35rem;
  margin: 0 0 .2rem;
  color: #3e2723;
  text-align: left;
}
.gallery-hint {
  font-size: .9rem;
  color: #8d6e63;
  margin: 0;
  text-align: left;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
  gap: .9rem;
}

.gallery-card {
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(255, 250, 246, 0.96), rgba(252, 240, 246, 0.96));
  border: 1px solid #f0d8e4;
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
  transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
  box-shadow: 0 10px 24px rgba(62, 39, 35, 0.08);
}
.gallery-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 28px rgba(62, 39, 35, 0.14);
  border-color: #f8bbd0;
}
.gallery-card:active {
  transform: scale(0.97);
}

.gallery-image-wrap {
  padding: .75rem .75rem 0;
}

.gallery-img {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 14px;
  object-fit: cover;
  border: 1px solid #f3d7e2;
  display: block;
}

.gallery-body {
  display: flex;
  flex-direction: column;
  gap: .45rem;
  padding: .8rem;
}
.gallery-name {
  font-size: .96rem;
  color: #3e2723;
  text-align: left;
  word-break: break-word;
}

.gallery-traits {
  display: flex;
  flex-wrap: wrap;
  gap: .3rem;
  width: 100%;
}
.mini-badge {
  font-size: .7rem;
  color: #5d4037;
  background: rgba(255,255,255,.72);
  border: 1px solid #f1dde5;
  padding: .18rem .45rem;
  border-radius: 999px;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.back-button {
  display: block; width: 100%;
  margin-top: 1.2rem; padding: .75rem;
  border: none; border-radius: 6px;
  background-color: #d1c4e9; color: #4527a0;
  font-weight: bold; font-size: .9rem;
  cursor: pointer;
  transition: background .15s ease;
}
.back-button:hover { background-color: #b39ddb; color: #fff; }

@media (max-width: 520px) {
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: .75rem;
  }

  .gallery-image-wrap {
    padding: .65rem .65rem 0;
  }

  .gallery-body {
    padding: .7rem;
  }
}
</style>
