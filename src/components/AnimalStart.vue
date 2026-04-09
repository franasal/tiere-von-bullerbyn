<!-- src/components/AnimalStart.vue -->
<template>
  <div class="start-screen">
    <div class="start-header">
      <img
        src="https://veganbullerbyn.de/wp-content/webp-express/webp-images/uploads/2023/03/logo_gross.png.webp"
        alt="Vegan Bullerbyn Logo"
        class="start-logo"
        @click="handleTitleTap"
      />
      <h1 class="start-title">
        Die Tiere
        <span class="subtitle">von Veganien</span>
      </h1>
    </div>

    <p class="start-prompt">Welches Tier möchtest du identifizieren?</p>

    <div class="animal-grid">
      <button
        v-for="animal in availableSpecies"
        :key="animal"
        :class="['animal-card', `animal-card--${animal}`]"
        :style="getSpeciesThemeStyle(animal)"
        @click="$emit('select', animal)"
      >
        <span class="animal-emoji">{{ getEmoji(animal) }}</span>
        <span class="animal-label">{{ getLabel(animal) }}</span>
      </button>
    </div>

    <section class="shared-notes">
      <div class="shared-notes__header">
        <div>
          <h2 class="shared-notes__title">Was Besucher*innen teilen</h2>
          <p class="shared-notes__copy">Die neuesten Eindruecke von Begegnungen mit den Tieren.</p>
        </div>
      </div>

      <p v-if="!firebaseEnabled" class="shared-notes__status">
        Besucher*innennotizen sind gerade nicht verfuegbar.
      </p>
      <p v-else-if="feedError" class="shared-notes__status">
        {{ feedError }}
      </p>
      <p v-else-if="feedLoading" class="shared-notes__status">
        Eintraege werden geladen ...
      </p>
      <div
        v-else-if="recentNotes.length"
        class="carousel"
        @pointerenter="pauseCarousel"
        @pointerleave="resumeCarousel"
      >
        <div class="carousel__viewport">
          <Transition :name="slideDirection" mode="out-in">
            <article
              :key="recentNotes[activeSlide].id"
              class="shared-note-card"
              :style="getAnimalNoteThemeStyle(recentNotes[activeSlide])"
            >
              <img
                :src="getAnimalImage(recentNotes[activeSlide])"
                :alt="recentNotes[activeSlide].animalName"
                class="shared-note-card__image"
                @error="handleImageError"
              />
              <div class="shared-note-card__body">
                <div class="shared-note-card__meta">
                  <span class="shared-note-card__animal">{{ recentNotes[activeSlide].animalName }}</span>
                  <span class="shared-note-card__date">{{ formatDate(recentNotes[activeSlide].createdAt) }}</span>
                </div>
                <p class="shared-note-card__text">{{ truncateText(recentNotes[activeSlide].text) }}</p>
                <p class="shared-note-card__author">{{ formatAuthor(recentNotes[activeSlide].author) }}</p>
              </div>
            </article>
          </Transition>
        </div>

        <div v-if="recentNotes.length > 1" class="carousel__dots">
          <button
            v-for="(note, i) in recentNotes"
            :key="note.id"
            type="button"
            class="carousel__dot"
            :class="{ 'carousel__dot--active': i === activeSlide }"
            :aria-label="`Kommentar ${i + 1} von ${recentNotes.length}`"
            @click="goToSlide(i)"
          />
        </div>
      </div>
      <p v-else class="shared-notes__status">
        Noch keine Eintraege vorhanden.
      </p>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  formatVisitorNoteAuthor,
  formatVisitorNoteDate,
  useRecentVisitorNotes
} from '../composables/useSharedNotes.js';
import { getThemeVars, toThemeKey } from '../data/speciesThemes.js';

const props = defineProps({
  availableSpecies: { type: Array, required: true },
  animalInfo: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['select', 'browse', 'toggleAdmin']);

const {
  notes: recentNotesRaw,
  loading: feedLoading,
  error: feedError,
  firebaseEnabled
} = useRecentVisitorNotes(computed(() => Object.keys(props.animalInfo || {})), 10);

const tapCount = ref(0);
let tapTimer = null;

function handleTitleTap() {
  tapCount.value++;
  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => { tapCount.value = 0; }, 1500);
  if (tapCount.value >= 5) {
    tapCount.value = 0;
    emit('toggleAdmin');
  }
}

const speciesData = {
  pigs:   { emoji: '🐷', label: 'Schweine' },
  cow:    { emoji: '🐮', label: 'Kühe' },
  goat:   { emoji: '🐐', label: 'Ziegen' },
  sheep:  { emoji: '🐑', label: 'Schafe' },
  equine: { emoji: '🫏', label: 'Esel & Ponys' },
  dog:    { emoji: '🐶🐱', label: 'Hunde & Katzen' }
};

function getEmoji(key) { return speciesData[key]?.emoji || '🐾'; }
function getLabel(key) { return speciesData[key]?.label || key; }
const recentNotes = computed(() => recentNotesRaw.value.filter((note) => note.animalName));
const animalInfoByNormalizedKey = computed(() => {
  const entries = Object.entries(props.animalInfo || {});
  return Object.fromEntries(entries.map(([name, info]) => [normalizeName(name), info]));
});
const animalInfoByNormalizedName = computed(() => {
  const entries = Object.entries(props.animalInfo || {});
  return Object.fromEntries(entries.map(([name, info]) => [normalizeName(name), info]));
});

function resolveImageUrl(url) {
  if (!url) {
    const base = import.meta.env.BASE_URL || '/';
    return `${base.replace(/\/$/, '')}/animal-images/placeholder.svg`;
  }
  if (url.startsWith('/')) {
    const base = import.meta.env.BASE_URL || '/';
    return `${base.replace(/\/$/, '')}${url}`;
  }
  return url;
}

function getAnimalImage(note) {
  const name = typeof note === 'string' ? note : note?.animalName;
  const animalKey = typeof note === 'string' ? '' : note?.animalKey;
  const direct = props.animalInfo?.[name]?.image_url;
  if (direct) return resolveImageUrl(direct);

  if (animalKey) {
    const byKey = animalInfoByNormalizedKey.value[animalKey];
    if (byKey?.image_url) return resolveImageUrl(byKey.image_url);
  }

  const normalized = animalInfoByNormalizedName.value[normalizeName(name)];
  return resolveImageUrl(normalized?.image_url);
}

function truncateText(value) {
  const text = String(value || '').trim();
  if (text.length <= 140) return text;
  return text.slice(0, 137).trimEnd() + '...';
}

const formatDate = formatVisitorNoteDate;
const formatAuthor = formatVisitorNoteAuthor;

function normalizeName(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function handleImageError(event) {
  event.target.src = resolveImageUrl('');
}

// --- Carousel auto-scroll ---
const activeSlide = ref(0);
const slideDirection = ref('carousel-slide-next');
let carouselTimer = null;
const CAROUSEL_INTERVAL = 4500;

function setSlide(index, direction = 'carousel-slide-next') {
  if (!recentNotes.value.length) return;
  slideDirection.value = direction;
  activeSlide.value = (index + recentNotes.value.length) % recentNotes.value.length;
}

function nextSlide() {
  setSlide(activeSlide.value + 1, 'carousel-slide-next');
}

function goToSlide(index) {
  const direction = index >= activeSlide.value ? 'carousel-slide-next' : 'carousel-slide-prev';
  setSlide(index, direction);
}

function startCarousel() {
  if (recentNotes.value.length <= 1) return;
  stopCarousel();
  carouselTimer = setInterval(nextSlide, CAROUSEL_INTERVAL);
}

function stopCarousel() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
}

function pauseCarousel() {
  stopCarousel();
}

function resumeCarousel() {
  startCarousel();
}

watch(recentNotes, (val) => {
  activeSlide.value = 0;
  if (val.length > 1) {
    setTimeout(startCarousel, 500);
  } else {
    stopCarousel();
  }
});

onMounted(() => {
  if (recentNotes.value.length > 1) {
    setTimeout(startCarousel, 1500);
  }
});

onBeforeUnmount(() => {
  stopCarousel();
});

function getSpeciesThemeStyle(key) {
  return getThemeVars(key);
}

function getAnimalNoteThemeStyle(note) {
  const name = note?.animalName;
  const animalKey = note?.animalKey;
  const species =
    props.animalInfo?.[name]?.species ||
    (animalKey ? animalInfoByNormalizedKey.value[animalKey]?.species : '') ||
    animalInfoByNormalizedName.value[normalizeName(name)]?.species;
  return getThemeVars(toThemeKey(species));
}
</script>

<style scoped>
.start-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem 1rem 2rem;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ---- Header ---- */
.start-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 1.25rem;
}

.start-logo {
  width: 100px;
  height: auto;
  cursor: default;
  user-select: none;
}

.start-title {
  font-size: 1.6rem;
  line-height: 1.3;
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.subtitle {
  display: block;
  font-weight: 400;
  font-size: 1.1rem;
  opacity: 0.7;
  margin-top: 0.1rem;
}

/* ---- Prompt ---- */
.start-prompt {
  font-size: 1rem;
  opacity: 0.65;
  margin: 0 0 1rem;
  font-weight: 500;
}

/* ---- Grid ---- */
.animal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  width: 100%;
  max-width: 340px;
  margin-bottom: 1.4rem;
}

.animal-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 1.1rem 0.5rem;
  border-radius: 16px;
  border: 2px solid var(--group-accent-border, #e0e0e0);
  background: var(--group-accent-soft, #fafafa);
  color: var(--group-text, #333);
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.animal-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  background: var(--group-accent, #e0e0e0);
  border-color: var(--group-accent, #bbb);
  color: #fff;
}

.animal-card:active {
  transform: translateY(0) scale(0.97);
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.animal-emoji {
  font-size: 2.2rem;
  line-height: 1;
}

.animal-label {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.shared-notes {
  width: 100%;
  max-width: 420px;
  padding: 1rem;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(248, 242, 235, 0.95));
  border: 1px solid rgba(214, 196, 180, 0.75);
  box-shadow: 0 14px 34px rgba(76, 53, 39, 0.08);
  text-align: left;
}

.shared-notes__header {
  margin-bottom: 0.8rem;
}

.shared-notes__title {
  margin: 0 0 0.2rem;
  font-size: 1rem;
  color: #3e2723;
}

.shared-notes__copy,
.shared-notes__status {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.45;
  color: #7a6253;
}

.carousel {
  display: grid;
  gap: 0.75rem;
}

.carousel__viewport {
  position: relative;
  overflow: hidden;
}

.carousel__dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.42rem;
}

.carousel__dot {
  width: 0.55rem;
  height: 0.55rem;
  padding: 0;
  border-radius: 999px;
  border: 0;
  background: rgba(141, 110, 99, 0.24);
  cursor: pointer;
}

.carousel__dot--active {
  width: 1.15rem;
  background: #8d6e63;
}

.shared-note-card {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.72rem 0.76rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(232, 217, 205, 0.9);
  min-height: 110px;
  width: 100%;
  box-sizing: border-box;
}

.shared-note-card__image {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid color-mix(in srgb, var(--group-accent-border, #f8bbd0) 82%, white 18%);
  background: #fff;
}

.shared-note-card__body {
  min-width: 0;
  flex: 1;
}

.shared-note-card__meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.22rem;
}

.shared-note-card__animal {
  font-size: 0.8rem;
  font-weight: 700;
  color: #4c3527;
}

.shared-note-card__date,
.shared-note-card__author {
  font-size: 0.7rem;
  color: #8f7a6c;
}

.shared-note-card__text {
  margin: 0 0 0.32rem;
  font-size: 0.82rem;
  line-height: 1.5;
  color: #43352e;
  white-space: pre-wrap;
}

.carousel-slide-next-enter-active,
.carousel-slide-next-leave-active,
.carousel-slide-prev-enter-active,
.carousel-slide-prev-leave-active {
  transition: opacity .24s ease, transform .24s ease;
}

.carousel-slide-next-enter-from,
.carousel-slide-prev-leave-to {
  opacity: 0;
  transform: translateX(18px);
}

.carousel-slide-next-leave-to,
.carousel-slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-18px);
}

:global(:root[data-theme='dark']) .start-screen .animal-card {
  background: rgba(15, 17, 22, 0.92) !important;
  color: var(--theme-text, #f3eee8) !important;
  border-color: var(--group-accent-border, #d98357) !important;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--group-accent-border, #d98357) 30%, transparent),
    0 14px 28px rgba(0, 0, 0, 0.3),
    0 0 18px color-mix(in srgb, var(--group-accent-border, #d98357) 18%, transparent) !important;
}

:global(:root[data-theme='dark']) .start-screen .animal-card:hover {
  background: rgba(22, 25, 33, 0.95) !important;
  color: #fff !important;
  border-color: var(--group-accent, #d98357) !important;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--group-accent, #d98357) 28%, transparent),
    0 18px 34px rgba(0, 0, 0, 0.36),
    0 0 28px color-mix(in srgb, var(--group-accent, #d98357) 24%, transparent) !important;
}

:global(:root[data-theme='dark']) .start-screen .shared-notes {
  background: linear-gradient(180deg, rgba(18, 21, 28, 0.96), rgba(12, 14, 19, 0.96));
  border-color: var(--theme-border, #2a2e37);
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.34),
    0 0 0 1px rgba(255, 255, 255, 0.02);
}

:global(:root[data-theme='dark']) .start-screen .shared-notes__title {
  color: var(--theme-text, #f3eee8);
}

:global(:root[data-theme='dark']) .start-screen .shared-notes__copy,
:global(:root[data-theme='dark']) .start-screen .shared-notes__status {
  color: var(--theme-muted, #a89f98);
}

:global(:root[data-theme='dark']) .start-screen .carousel__dot {
  background: rgba(255, 255, 255, 0.18);
}

:global(:root[data-theme='dark']) .start-screen .carousel__dot--active {
  background: var(--group-accent, #f48fb1);
}

:global(:root[data-theme='dark']) .start-screen .shared-note-card {
  background: rgba(18, 20, 28, 0.96);
  border-color: var(--group-accent-border, #3a3028);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.03),
    0 10px 24px rgba(0, 0, 0, 0.24);
}

:global(:root[data-theme='dark']) .start-screen .shared-note-card__animal {
  color: var(--theme-text, #f3eee8);
}

:global(:root[data-theme='dark']) .start-screen .shared-note-card__text {
  color: #ded5cd;
}

:global(:root[data-theme='dark']) .start-screen .shared-note-card__date,
:global(:root[data-theme='dark']) .start-screen .shared-note-card__author {
  color: var(--theme-muted, #a89f98);
}

:global(:root[data-theme='dark']) .start-screen .shared-note-card__image {
  background: var(--theme-surface-strong, #0e1015);
  border-color: var(--group-accent, #d98357);
}

/* single-column for very narrow screens */
@media (max-width: 280px) {
  .animal-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .shared-notes {
    padding: 0.9rem;
  }

  .shared-note-card {
    padding: 0.68rem 0.7rem;
  }
}
</style>
