<!-- src/components/AnimalGallery.vue -->
<template>
  <div class="gallery">
    <h2 class="gallery-title">Alle Tiere kennenlernen</h2>
    <p class="gallery-hint">Tippe auf ein Tier, um mehr zu erfahren.</p>

    <div class="gallery-grid">
      <div
        v-for="animal in animals"
        :key="animal.name"
        class="gallery-card"
        @click="$emit('showProfile', animal.name)"
      >
        <img
          :src="animal.imageUrl"
          :alt="animal.name"
          class="gallery-img"
        />
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
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.gallery-title {
  font-size: 1.2rem; margin: 0 0 .2rem; color: #3e2723; text-align: center;
}
.gallery-hint {
  font-size: .85rem; color: #8d6e63; margin: 0 0 .75rem; text-align: center;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: .6rem;
}

.gallery-card {
  display: flex; flex-direction: column; align-items: center;
  background: linear-gradient(135deg, #fdf5f9, #fce4ec);
  border: 1px solid #f8bbd0;
  border-radius: 10px;
  padding: .6rem;
  cursor: pointer;
  overflow: hidden;
  transition: transform .15s ease, box-shadow .15s ease;
}
.gallery-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0,0,0,.1);
}
.gallery-card:active {
  transform: scale(0.97);
}

.gallery-img {
  width: 72px; height: 72px;
  border-radius: 50%; object-fit: cover;
  border: 3px solid #f8bbd0;
  margin-bottom: .35rem;
  flex-shrink: 0;
}
.gallery-name {
  font-size: .88rem; color: #3e2723; margin-bottom: .3rem;
  text-align: center;
  word-break: break-word;
}

.gallery-traits {
  display: flex; flex-direction: column; align-items: center; gap: .15rem;
  width: 100%;
}
.mini-badge {
  font-size: .68rem; color: #5d4037;
  background: rgba(255,255,255,.6);
  padding: .15rem .4rem; border-radius: 10px;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.back-button {
  display: block; width: 100%;
  margin-top: 1rem; padding: .65rem;
  border: none; border-radius: 6px;
  background-color: #d1c4e9; color: #4527a0;
  font-weight: bold; font-size: .9rem;
  cursor: pointer;
  transition: background .15s ease;
}
.back-button:hover { background-color: #b39ddb; color: #fff; }
</style>
