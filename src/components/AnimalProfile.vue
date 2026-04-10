<!-- src/components/AnimalProfile.vue -->
<template>
  <div class="profile" ref="profileEl">
    <!-- Hero section: image + overlaid name -->
    <div class="hero">
      <ExpandableImage
        :src="imageUrl"
        :alt="name"
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

    <div class="profile-section">
      <AnimalCharacteristics
        v-if="characteristics && Object.keys(characteristics).length"
        :characteristics="characteristics"
        :besonderheiten="besonderheiten"
      />
    </div>

    <div v-if="backgroundFacts && Object.keys(backgroundFacts).length" class="profile-section">
      <AnimalBackgroundFacts :facts="backgroundFacts" />
    </div>

    <div v-if="uniqueTraits.length" class="profile-section profile-section--traits">
      <h3 class="section-title">So erkennst du mich</h3>
      <div class="trait-grid">
        <div v-for="t in uniqueTraits" :key="t.key" class="trait-card">
          <span class="trait-card-icon">{{ t.icon }}</span>
          <div class="trait-card-body">
            <span class="trait-card-label">{{ t.label }}</span>
            <span class="trait-card-value">{{ t.value }}</span>
          </div>
          <TraitInfoButton
            v-if="t.key === 'sex'"
            class="trait-info-inline"
            :image-src="MALE_PIG_GUIDE_IMAGE"
            :image-alt="MALE_PIG_GUIDE_ALT"
            :caption="MALE_PIG_GUIDE_CAPTION"
            credit="Bild adaptiert von Jo-Anne McArthur / We Animals."
            label="Hilfe zum Geschlecht anzeigen"
          />
        </div>
      </div>
    </div>

    <div class="profile-section">
      <AnimalNoteCarousel :animal-name="name" />
    </div>

    <div class="profile-section">
      <VisitorNotes :animal-name="name" />
    </div>

    <button class="back-button" @click="$emit('back')">← Zurück zur Galerie</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ExpandableImage from './ExpandableImage.vue';
import AnimalCharacteristics from './AnimalCharacteristics.vue';
import AnimalBackgroundFacts from './AnimalBackgroundFacts.vue';
import AnimalNoteCarousel from './AnimalNoteCarousel.vue';
import TraitInfoButton from './TraitInfoButton.vue';
import VisitorNotes from './VisitorNotes.vue';
import {
  MALE_PIG_GUIDE_ALT,
  MALE_PIG_GUIDE_CAPTION,
  MALE_PIG_GUIDE_IMAGE
} from '../data/pigSexGuide.js';

defineProps({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  appearance: { type: String, default: '' },
  story: { type: String, default: '' },
  uniqueTraits: { type: Array, default: () => [] },
  similarAnimals: { type: Array, default: () => [] },
  characteristics: { type: Object, default: () => ({}) },
  backgroundFacts: { type: Object, default: () => ({}) },
  besonderheiten: { type: String, default: '' }
});

defineEmits(['back', 'showProfile']);

const profileEl = ref(null);

onMounted(() => {
  profileEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
</script>

<style scoped>
.profile {
  animation: fadeIn .3s ease;
  display: flex; flex-direction: column; align-items: center;
  border: 1px solid #ccc;
  border-radius: 12px;
  background-color: #fdf5f9;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
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

.profile-section { width: 100%; padding: 0 1rem; box-sizing: border-box; }

.profile-section--traits {
  padding-left: 1.15rem;
  padding-right: 1.15rem;
}

.section-title {
  font-size: .9rem; color: #5d4037; margin: .75rem 0 .4rem;
}

/* Trait grid - 2 columns */
.trait-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.55rem;
}
.trait-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.58rem 0.7rem;
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

/* Similar animals */
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

.back-button {
  display: block; width: calc(100% - 2rem);
  margin: 1rem; padding: .65rem;
  border: none; border-radius: 6px;
  background-color: #d1c4e9; color: #4527a0;
  font-weight: bold; font-size: .9rem;
  cursor: pointer;
  transition: background .15s ease;
}
.back-button:hover { background-color: #b39ddb; color: #fff; }

/* ── Dark mode ── */
:global(:root[data-theme='dark']) .profile {
  background-color: var(--theme-surface-strong, #0e1015);
  border-color: var(--theme-border, #2a2e37);
  box-shadow: var(--theme-shadow);
}

:global(:root[data-theme='dark']) .info-card {
  background: var(--theme-surface, rgba(18, 20, 26, 0.92));
  border-color: var(--theme-border, #2a2e37);
}

:global(:root[data-theme='dark']) .info-card-label {
  color: var(--theme-muted, #a89f98);
}

:global(:root[data-theme='dark']) .info-card-text {
  color: var(--theme-text, #f3eee8);
}

:global(:root[data-theme='dark']) .section-title {
  color: var(--theme-text, #f3eee8);
}

:global(:root[data-theme='dark']) .trait-card {
  background: rgba(244, 143, 177, 0.08);
  border-color: rgba(244, 143, 177, 0.22);
}

:global(:root[data-theme='dark']) .trait-card-label {
  color: var(--theme-muted, #a89f98);
}

:global(:root[data-theme='dark']) .trait-card-value {
  color: var(--theme-text, #f3eee8);
}

:global(:root[data-theme='dark']) .similar-card {
  background: var(--theme-surface, rgba(18, 20, 26, 0.92));
  border-color: var(--theme-border, #2a2e37);
}

:global(:root[data-theme='dark']) .similar-name {
  color: var(--theme-text, #f3eee8);
}

:global(:root[data-theme='dark']) .back-button {
  background-color: rgba(209, 196, 233, 0.12);
  color: #ce93d8;
  border-color: rgba(209, 196, 233, 0.24);
}

:global(:root[data-theme='dark']) .back-button:hover {
  background-color: rgba(179, 157, 219, 0.2);
  color: #e1bee7;
}
</style>
