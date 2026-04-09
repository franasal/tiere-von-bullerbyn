<template>
  <section v-if="firebaseEnabled" class="animal-note-feed">
    <div class="animal-note-feed__header">
      <div>
        <h3 class="animal-note-feed__title">Was Besucher*innen über {{ animalName }} teilen</h3>
        <p class="animal-note-feed__copy">Beobachtungen und kleine Begegnungen laufen hier automatisch von oben nach unten.</p>
      </div>
      <button
        v-if="notes.length > 1"
        type="button"
        class="animal-note-feed__toggle"
        @click="collapsed = !collapsed"
      >
        {{ collapsed ? 'Mehr zeigen' : 'Kompakt' }}
      </button>
    </div>

    <p v-if="error" class="animal-note-feed__status animal-note-feed__status--error">{{ error }}</p>
    <p v-else-if="loading" class="animal-note-feed__status">Notizen werden geladen ...</p>
    <p v-else-if="!notes.length" class="animal-note-feed__status">Noch keine Einträge vorhanden.</p>
    <div
      v-else
      ref="viewportRef"
      :class="['animal-note-feed__viewport', { 'animal-note-feed__viewport--collapsed': collapsed }]"
      @pointerenter="pauseAutoScroll"
      @pointerleave="resumeAutoScroll"
    >
      <article
        v-for="note in notes"
        :key="note.id"
        class="animal-note-feed__card"
      >
        <div class="animal-note-feed__meta">
          <span class="animal-note-feed__author">{{ formatAuthor(note.author) }}</span>
          <span class="animal-note-feed__date">{{ formatDate(note.createdAt) }}</span>
        </div>
        <p class="animal-note-feed__text">{{ note.text }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, toRef, watch } from 'vue';
import {
  formatVisitorNoteAuthor,
  formatVisitorNoteDate,
  useVisitorNotes
} from '../composables/useSharedNotes.js';

const props = defineProps({
  animalName: { type: String, required: true }
});

const animalNameRef = toRef(props, 'animalName');
const viewportRef = ref(null);
const collapsed = ref(true);

const {
  notes,
  loading,
  error,
  firebaseEnabled
} = useVisitorNotes(animalNameRef);

const formatDate = formatVisitorNoteDate;
const formatAuthor = formatVisitorNoteAuthor;

let autoScrollTimer = null;

const shouldAutoScroll = computed(() => notes.value.length > (collapsed.value ? 1 : 3));

function getStepSize() {
  const viewport = viewportRef.value;
  const firstCard = viewport?.querySelector('.animal-note-feed__card');
  if (!viewport || !firstCard) return 0;

  const styles = window.getComputedStyle(viewport);
  const gap = Number.parseFloat(styles.rowGap || styles.gap || '0') || 0;
  return firstCard.offsetHeight + gap;
}

function scrollToTop() {
  viewportRef.value?.scrollTo({ top: 0, behavior: 'smooth' });
}

function advanceScroll() {
  const viewport = viewportRef.value;
  const step = getStepSize();
  if (!viewport || !step) return;

  const maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
  if (maxScrollTop <= 4) return;

  const nextTop = viewport.scrollTop + step;
  if (nextTop >= maxScrollTop - 4) {
    scrollToTop();
    return;
  }

  viewport.scrollTo({ top: nextTop, behavior: 'smooth' });
}

function stopAutoScroll() {
  if (!autoScrollTimer) return;
  clearInterval(autoScrollTimer);
  autoScrollTimer = null;
}

function startAutoScroll() {
  stopAutoScroll();
  if (!shouldAutoScroll.value) return;
  autoScrollTimer = window.setInterval(advanceScroll, 5200);
}

function pauseAutoScroll() {
  stopAutoScroll();
}

function resumeAutoScroll() {
  startAutoScroll();
}

watch([notes, collapsed], async () => {
  await nextTick();
  scrollToTop();
  startAutoScroll();
}, { immediate: true });

onBeforeUnmount(() => {
  stopAutoScroll();
});
</script>

<style scoped>
.animal-note-feed {
  width: 100%;
  box-sizing: border-box;
  margin-top: .9rem;
  padding: .95rem;
  background: rgba(255, 250, 244, .98);
  border: 1px solid #f0dac5;
  border-radius: 14px;
}

.animal-note-feed__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: .75rem;
  margin-bottom: .7rem;
}

.animal-note-feed__title {
  margin: 0 0 .2rem;
  font-size: .95rem;
  color: #5d4037;
}

.animal-note-feed__copy,
.animal-note-feed__status {
  margin: 0;
  font-size: .76rem;
  color: #7d6a60;
}

.animal-note-feed__status {
  padding: .65rem .75rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, .78);
  border: 1px solid #eedbcc;
}

.animal-note-feed__status--error {
  color: #b71c1c;
  background: rgba(255, 235, 238, .88);
  border-color: rgba(239, 154, 154, .6);
}

.animal-note-feed__toggle {
  flex-shrink: 0;
  border: 1px solid #e1c4ad;
  border-radius: 999px;
  background: rgba(255, 255, 255, .86);
  color: #6d4c41;
  padding: .35rem .7rem;
  font-size: .72rem;
  font-weight: 700;
}

.animal-note-feed__viewport {
  display: flex;
  flex-direction: column;
  gap: .6rem;
  max-height: 24.6rem;
  overflow-y: auto;
  padding-right: .15rem;
  scrollbar-width: thin;
}

.animal-note-feed__viewport--collapsed {
  max-height: 7.6rem;
}

.animal-note-feed__card {
  min-height: 7rem;
  box-sizing: border-box;
  padding: .78rem .85rem;
  background: rgba(255, 255, 255, .94);
  border: 1px solid #ead7c5;
  border-radius: 12px;
}

.animal-note-feed__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  margin-bottom: .42rem;
  flex-wrap: wrap;
}

.animal-note-feed__author {
  font-size: .74rem;
  font-weight: 700;
  color: #5d4037;
}

.animal-note-feed__date {
  font-size: .68rem;
  color: #9a867b;
}

.animal-note-feed__text {
  margin: 0;
  font-size: .84rem;
  line-height: 1.45;
  color: #3e2723;
  white-space: pre-wrap;
}

@media (max-width: 520px) {
  .animal-note-feed__header {
    flex-direction: column;
  }
}
</style>
