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

    <p class="start-mission">
      Jedes Tier hier hat eine Geschichte. Lerne sie kennen, erkenne sie wieder
      und erfahre, was sie besonders macht.
    </p>

    <p class="start-prompt">Wen m&ouml;chtest du kennenlernen?</p>

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

    <section class="shared-notes reveal">
      <div class="shared-notes__header">
        <div>
          <h2 class="shared-notes__title">Stimmen von Besucher*innen</h2>
          <p class="shared-notes__copy">Eindr&uuml;cke und Begegnungen aus dem Lebenshof.</p>
        </div>
      </div>

      <p v-if="!firebaseEnabled" class="shared-notes__status">
        Besucher*innennotizen sind gerade nicht verfügbar.
      </p>
      <p v-else-if="feedError" class="shared-notes__status">
        {{ feedError }}
      </p>
      <p v-else-if="feedLoading" class="shared-notes__status">
        Einträge werden geladen ...
      </p>
      <div
        v-else-if="recentNotes.length"
        class="carousel"
        @pointerenter="pauseCarousel"
        @pointerleave="resumeCarousel"
      >
        <div
          ref="carouselViewport"
          class="carousel__viewport"
          @scroll="handleCarouselScroll"
        >
          <article
            v-for="note in recentNotes"
            :key="note.id"
            class="shared-note-card"
            :style="getAnimalNoteThemeStyle(note)"
          >
            <img
              :src="getAnimalImage(note)"
              :alt="note.animalName"
              class="shared-note-card__image"
              @error="handleImageError"
            />
            <div class="shared-note-card__body">
              <div class="shared-note-card__meta">
                <span class="shared-note-card__animal">{{ note.animalName }}</span>
                <span class="shared-note-card__date">{{ formatDate(note.createdAt) }}</span>
              </div>
              <p class="shared-note-card__text">{{ truncateText(note.text) }}</p>
              <p class="shared-note-card__author">{{ formatAuthor(note.author) }}</p>
            </div>
          </article>
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
        Noch keine Einträge vorhanden.
      </p>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
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
const carouselViewport = ref(null);

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

const activeSlide = ref(0);
let carouselTimer = null;
let scrollSyncTimer = null;
const CAROUSEL_INTERVAL = 4500;

function getCardWidth() {
  const viewport = carouselViewport.value;
  const firstCard = viewport?.querySelector('.shared-note-card');
  if (!viewport || !firstCard) return 0;

  const styles = window.getComputedStyle(viewport);
  const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
  return firstCard.offsetWidth + gap;
}

function syncActiveSlide() {
  const viewport = carouselViewport.value;
  const step = getCardWidth();
  if (!viewport || !step) return;

  activeSlide.value = Math.round(viewport.scrollLeft / step);
}

function scrollToSlide(index, behavior = 'smooth') {
  const viewport = carouselViewport.value;
  const step = getCardWidth();
  if (!viewport || !step) return;

  const safeIndex = ((index % recentNotes.value.length) + recentNotes.value.length) % recentNotes.value.length;
  activeSlide.value = safeIndex;
  viewport.scrollTo({ left: safeIndex * step, behavior });
}

function nextSlide() {
  if (recentNotes.value.length <= 1) return;
  scrollToSlide(activeSlide.value + 1);
}

function goToSlide(index) {
  pauseCarousel();
  scrollToSlide(index);
  resumeCarousel();
}

function startCarousel() {
  stopCarousel();
  if (recentNotes.value.length <= 1) return;
  carouselTimer = setInterval(nextSlide, CAROUSEL_INTERVAL);
}

function stopCarousel() {
  if (!carouselTimer) return;
  clearInterval(carouselTimer);
  carouselTimer = null;
}

function pauseCarousel() {
  stopCarousel();
}

function resumeCarousel() {
  startCarousel();
}

function handleCarouselScroll() {
  if (scrollSyncTimer) {
    clearTimeout(scrollSyncTimer);
  }

  scrollSyncTimer = window.setTimeout(() => {
    syncActiveSlide();
    scrollSyncTimer = null;
  }, 90);
}

watch(recentNotes, async () => {
  activeSlide.value = 0;
  await nextTick();
  scrollToSlide(0, 'auto');
  startCarousel();
}, { immediate: true });

let revealObserver = null;

onMounted(() => {
  startCarousel();

  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver.observe(el);
  });
});

onBeforeUnmount(() => {
  stopCarousel();
  if (scrollSyncTimer) {
    clearTimeout(scrollSyncTimer);
    scrollSyncTimer = null;
  }
  if (revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
  }
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
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ---- Reveal scroll animation ---- */
.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ---- Header ---- */
.start-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.start-logo {
  width: 100px;
  height: auto;
  cursor: default;
  user-select: none;
}

.start-title {
  font-family: 'Survivant', Inter, sans-serif;
  font-size: clamp(1.8rem, 6vw, 2.4rem);
  line-height: 1.1;
  margin: 0;
  font-weight: normal;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, var(--theme-text, #e8e6e1) 30%, var(--theme-muted, #8a8880) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  display: block;
  font-family: 'Survivant', Inter, sans-serif;
  font-weight: normal;
  font-size: clamp(1rem, 3.5vw, 1.3rem);
  margin-top: 0.1rem;
}

/* ---- Mission text ---- */
.start-mission {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--theme-muted, #8a8880);
  max-width: 360px;
  margin: 0 0 1.25rem;
}

/* ---- Prompt ---- */
.start-prompt {
  font-size: 0.9rem;
  color: var(--theme-muted, #8a8880);
  margin: 0 0 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.78rem;
}

/* ---- Grid ---- */
.animal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  width: 100%;
  max-width: 340px;
  margin-bottom: 2rem;
}

.animal-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 1.1rem 0.5rem;
  border-radius: var(--radius, 16px);
  border: 1px solid var(--group-accent-border, rgba(255, 255, 255, 0.08));
  background: var(--group-accent-soft, rgba(255, 255, 255, 0.03));
  color: var(--group-text, var(--theme-text, #e8e6e1));
  cursor: pointer;
  font-family: inherit;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.animal-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.18);
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
  font-weight: 700;
  letter-spacing: 0.02em;
}

.shared-notes {
  width: 100%;
  max-width: 420px;
  padding: 1rem;
  border-radius: var(--radius, 16px);
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.12);
  text-align: left;
}

.shared-notes__header {
  margin-bottom: 0.8rem;
}

.shared-notes__title {
  margin: 0 0 0.2rem;
  font-size: 1rem;
  font-weight: 800;
  color: var(--theme-text, #e8e6e1);
}

.shared-notes__copy,
.shared-notes__status {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--theme-muted, #8a8880);
}

.carousel {
  display: grid;
  gap: 0.75rem;
}

.carousel__viewport {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 100%;
  gap: 0.75rem;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
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
  background: rgba(255, 255, 255, 0.14);
  cursor: pointer;
  transition: width 0.2s, background 0.2s;
}

.carousel__dot--active {
  width: 1.15rem;
  background: var(--theme-accent, #2f6b4f);
}

.shared-note-card {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.72rem 0.76rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  min-height: 110px;
  width: 100%;
  box-sizing: border-box;
  scroll-snap-align: start;
}

.shared-note-card__image {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid color-mix(in srgb, var(--group-accent-border, #2f6b4f) 82%, white 18%);
  background: rgba(255, 255, 255, 0.06);
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
  color: var(--theme-text, #e8e6e1);
}

.shared-note-card__date,
.shared-note-card__author {
  font-size: 0.7rem;
  color: var(--theme-muted, #8a8880);
}

.shared-note-card__text {
  margin: 0 0 0.32rem;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--theme-muted, #a59f93);
  white-space: pre-wrap;
}

/* ---- Dark mode overrides (dark is now default) ---- */
:global(:root[data-theme='dark']) .start-screen .animal-card {
  background: color-mix(in srgb, var(--group-accent-soft, #fafafa) 18%, rgba(20, 20, 20, 0.88)) !important;
  color: color-mix(in srgb, var(--group-text, #333) 18%, white 82%) !important;
  border-color: color-mix(in srgb, var(--group-accent-border, #2f6b4f) 52%, rgba(255, 255, 255, 0.08)) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--group-accent-border, #2f6b4f) 28%, transparent),
    0 10px 24px rgba(0, 0, 0, 0.3) !important;
}

:global(:root[data-theme='dark']) .start-screen .animal-card:hover {
  background: var(--group-accent, #e0e0e0) !important;
  color: #fff !important;
  border-color: var(--group-accent, #2f6b4f) !important;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--group-accent, #2f6b4f) 30%, transparent),
    0 14px 28px rgba(0, 0, 0, 0.34) !important;
}

:global(:root[data-theme='dark']) .start-screen .shared-note-card__image {
  background: var(--theme-surface-strong, #0a0a0a);
  border-color: var(--group-accent, #2f6b4f);
}

/* ---- Light mode overrides ---- */
:global(:root:not([data-theme='dark'])) .start-screen .shared-notes {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-color: rgba(214, 196, 180, 0.6);
}

:global(:root:not([data-theme='dark'])) .start-screen .shared-notes__title {
  color: #3e2723;
}

:global(:root:not([data-theme='dark'])) .start-screen .shared-notes__copy,
:global(:root:not([data-theme='dark'])) .start-screen .shared-notes__status {
  color: #7a6253;
}

:global(:root:not([data-theme='dark'])) .start-screen .shared-note-card {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(232, 217, 205, 0.9);
}

:global(:root:not([data-theme='dark'])) .start-screen .shared-note-card__animal {
  color: #4c3527;
}

:global(:root:not([data-theme='dark'])) .start-screen .shared-note-card__text {
  color: #43352e;
}

:global(:root:not([data-theme='dark'])) .start-screen .shared-note-card__date,
:global(:root:not([data-theme='dark'])) .start-screen .shared-note-card__author {
  color: #8f7a6c;
}

:global(:root:not([data-theme='dark'])) .start-screen .carousel__dot {
  background: rgba(141, 110, 99, 0.24);
}

:global(:root:not([data-theme='dark'])) .start-screen .carousel__dot--active {
  background: #2f6b4f;
}

:global(:root:not([data-theme='dark'])) .start-mission {
  color: #6f4e37;
}

:global(:root:not([data-theme='dark'])) .start-prompt {
  color: #6f4e37;
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
