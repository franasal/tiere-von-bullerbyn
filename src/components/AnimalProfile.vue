<!-- src/components/AnimalProfile.vue -->
<template>
  <div class="profile">
    <img :src="imageUrl" :alt="name" class="profile-img" />
    <h2 class="profile-name">{{ name }}</h2>

    <div class="profile-info">
      <p v-if="appearance"><strong>Erscheinung:</strong> {{ appearance }}</p>
      <p v-if="story"><strong>Geschichte:</strong> {{ story }}</p>
    </div>

    <div v-if="uniqueTraits.length" class="profile-section">
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

    <div v-if="similarAnimals.length" class="profile-section">
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
          <strong>{{ sim.name }}</strong>
          <p v-for="d in sim.differences.slice(0, 2)" :key="d.key" class="diff-line">
            {{ d.icon }} {{ d.label }}: <em>{{ d.otherValue }}</em>
            <span class="diff-vs">vs.</span> {{ d.thisValue }}
          </p>
        </div>
      </div>
    </div>

    <div class="profile-section">
      <StorySubmissionWidget
        :animal-names="animalNames"
        :selected-animal="name"
        :appearance="appearance"
        :story="story"
        current-view="Profil"
      />
    </div>

    <button class="back-button" @click="$emit('back')">← Zurück zur Galerie</button>
  </div>
</template>

<script setup>
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

defineEmits(['back', 'showProfile']);
</script>

<style scoped>
.profile {
  animation: fadeIn .3s ease;
  display: flex; flex-direction: column; align-items: center;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.profile-img {
  max-width: 100%; max-height: 260px; object-fit: contain;
  border-radius: 10px; margin-bottom: .5rem;
}
.profile-name {
  font-size: 1.3rem; margin: 0 0 .5rem; color: #3e2723;
}
.profile-info {
  text-align: center; color: #212121; margin-bottom: .5rem;
  word-wrap: break-word; max-width: 100%;
}

.profile-section { width: 100%; margin-top: .5rem; }

.section-title {
  font-size: .9rem; color: #5d4037; margin: .5rem 0 .3rem;
}

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

.similar-card {
  display: flex; align-items: center; gap: .6rem;
  padding: .5rem; margin-top: .4rem;
  background: rgba(255,255,255,.7);
  border-radius: 8px;
  cursor: pointer;
  transition: background .15s ease;
}
.similar-card:hover { background: rgba(255,255,255,.95); }
.similar-img {
  width: 44px; height: 44px;
  border-radius: 50%; object-fit: cover;
  border: 2px solid #f8bbd0; flex-shrink: 0;
}
.diff-line { font-size: .78rem; color: #5d4037; margin: .1rem 0 0; }
.diff-vs { color: #bbb; margin: 0 .2rem; }

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
