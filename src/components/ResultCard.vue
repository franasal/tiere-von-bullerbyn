<!-- src/components/ResultCard.vue -->
<template>
  <div class="result-card" ref="card">
    <div class="confetti-container" v-if="showConfetti">
      <span v-for="n in 18" :key="n" class="confetti-piece" :style="confettiStyle(n)" />
    </div>
    <section class="hero-card">
      <div class="hero-copy">
        <span class="section-eyebrow">Erkanntes Tier</span>
        <div class="hero-heading">
          <h3 class="hero-title">{{ name }}</h3>
          <span class="status-chip">{{ statusLabel }}</span>
        </div>
        <p class="hero-summary">{{ heroSummary }}</p>

        <div v-if="quickFacts.length" class="fact-grid">
          <article v-for="fact in quickFacts" :key="fact.label" class="fact-card">
            <span class="fact-label">{{ fact.label }}</span>
            <span class="fact-value">{{ fact.value }}</span>
          </article>
        </div>
      </div>

      <ExpandableImage
        :src="imageUrl"
        :alt="`Bild von ${name}`"
        img-class="animal-image"
      />
    </section>

    <AnimalCharacteristics
      v-if="characteristics && Object.keys(characteristics).length"
      :characteristics="characteristics"
      :besonderheiten="besonderheiten"
    />

    <section v-if="uniqueTraits && uniqueTraits.length" class="content-card">
      <div class="section-header">
        <span class="section-eyebrow">Schnell erkennen</span>
        <h3 class="section-title">Die wichtigsten Merkmale</h3>
      </div>
      <div class="trait-badges">
        <span v-for="t in uniqueTraits" :key="t.key" class="trait-badge">
          <span class="badge-icon">{{ t.icon }}</span>
          <span class="badge-text">
            <span class="badge-label">{{ t.label }}</span>
            <span class="badge-value">{{ t.value }}</span>
          </span>
        </span>
      </div>
    </section>

    <section v-if="similarAnimals && similarAnimals.length" class="content-card">
      <div class="section-header">
        <span class="section-eyebrow">Verwechslung vermeiden</span>
        <h3 class="section-title">Aehnliche Tiere im Vergleich</h3>
      </div>
      <div
        v-for="sim in similarAnimals"
        :key="sim.name"
        class="similar-card"
        @click="$emit('showProfile', sim.name)"
      >
        <ExpandableImage
          v-if="sim.imageUrl"
          :src="sim.imageUrl"
          :alt="sim.name"
          img-class="similar-img"
        />
        <div class="similar-info">
          <div class="similar-topline">
            <strong class="similar-name">{{ sim.name }}</strong>
            <span class="compare-chip">Profil oeffnen</span>
          </div>
          <p v-for="d in sim.differences.slice(0, 2)" :key="d.key" class="diff-line">
            <span class="diff-icon">{{ d.icon }}</span>
            <span class="diff-copy">
              <strong>{{ d.label }}:</strong> {{ d.otherValue }}
              <span class="diff-vs">statt</span> {{ d.thisValue }}
            </span>
          </p>
        </div>
      </div>
    </section>

    <VisitorNotes :animal-name="name" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import ExpandableImage from './ExpandableImage.vue';
import AnimalCharacteristics from './AnimalCharacteristics.vue';
import VisitorNotes from './VisitorNotes.vue';

const props = defineProps({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  appearance: { type: String, default: '' },
  story: { type: String, default: '' },
  uniqueTraits: { type: Array, default: () => [] },
  similarAnimals: { type: Array, default: () => [] },
  characteristics: { type: Object, default: () => ({}) },
  besonderheiten: { type: String, default: '' }
});

defineEmits(['showProfile']);

const showConfetti = ref(false);

const heroSummary = computed(() =>
  props.story || props.appearance || `${props.name} ist im Tierbereich gerade das passendste Ergebnis.`
);

const statusLabel = computed(() => {
  if (props.similarAnimals.length) return 'Mit Lookalikes abgleichen';
  if (props.uniqueTraits.length >= 3) return 'Gut unterscheidbar';
  return 'Treffer';
});

const quickFacts = computed(() => {
  const facts = [];

  if (props.appearance) {
    facts.push({ label: 'Aussehen', value: props.appearance });
  }

  if (props.story) {
    facts.push({ label: 'Hintergrund', value: props.story });
  }

  props.uniqueTraits.slice(0, 2).forEach((trait) => {
    facts.push({ label: trait.label, value: trait.value });
  });

  return facts.slice(0, 4);
});

function confettiStyle(n) {
  const hue = (n * 47) % 360;
  const left = 10 + (n * 17) % 80;
  const delay = (n * 0.06).toFixed(2);
  const size = 6 + (n % 4) * 2;
  const drift = -30 + (n * 13) % 60;
  return {
    '--hue': hue,
    '--left': left + '%',
    '--delay': delay + 's',
    '--size': size + 'px',
    '--drift': drift + 'px',
    background: `hsl(${hue}, 80%, 60%)`,
    left: left + '%',
    width: size + 'px',
    height: size + 'px',
    animationDelay: delay + 's',
  };
}

onMounted(() => {
  showConfetti.value = true;
  setTimeout(() => { showConfetti.value = false; }, 1800);
});
</script>

<style scoped>
.result-card {
  --result-accent: #c06b3e;
  --result-accent-soft: #f7e0d0;
  --result-border: #e4c8b3;
  --result-ink: #2f241d;
  --result-muted: #71584a;
  --result-surface: linear-gradient(180deg, rgba(255, 250, 245, 0.98), rgba(250, 240, 230, 0.95));

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  border: 1px solid var(--result-border);
  border-radius: 24px;
  padding: 1.1rem;
  margin-bottom: 1rem;
  background: var(--result-surface);
  box-shadow: 0 24px 50px rgba(76, 49, 27, 0.12);
  animation: resultReveal .4s cubic-bezier(.34,1.56,.64,1) both;
  overflow: hidden;
  text-align: left;
}

@keyframes resultReveal {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}

.hero-card,
.content-card {
  position: relative;
  z-index: 2;
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(220px, .9fr);
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border: 1px solid rgba(192, 107, 62, 0.18);
  border-radius: 20px;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.96), rgba(255, 246, 239, 0.82)),
    linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(247, 224, 208, 0.78));
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: .75rem;
}

.section-eyebrow {
  display: inline-flex;
  align-self: flex-start;
  padding: .3rem .65rem;
  border-radius: 999px;
  background: rgba(192, 107, 62, 0.12);
  color: var(--result-accent);
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.hero-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .6rem;
}

.hero-title {
  margin: 0;
  font-size: clamp(1.45rem, 3vw, 2rem);
  line-height: 1;
  color: var(--result-ink);
}

.status-chip,
.compare-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: .35rem .75rem;
  font-size: .72rem;
  font-weight: 700;
  background: #fff;
  border: 1px solid rgba(192, 107, 62, 0.24);
  color: var(--result-accent);
}

.hero-summary {
  margin: 0;
  font-size: .96rem;
  line-height: 1.6;
  color: var(--result-ink);
  max-width: 42ch;
}

.fact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .6rem;
}

.fact-card {
  display: flex;
  flex-direction: column;
  gap: .2rem;
  padding: .75rem .8rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(192, 107, 62, 0.14);
}

.fact-label {
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--result-muted);
}

.fact-value {
  font-size: .88rem;
  line-height: 1.45;
  color: var(--result-ink);
}

:deep(.animal-image) {
  width: 100%;
  max-width: 100%;
  max-height: 320px;
  object-fit: cover;
  border-radius: 18px;
  box-shadow: 0 14px 32px rgba(87, 56, 34, 0.18);
}

:deep(.similar-img) {
  width: 68px;
  height: 68px;
  border-radius: 18px;
  object-fit: cover;
  border: 1px solid rgba(192, 107, 62, 0.16);
  flex-shrink: 0;
}

.content-card {
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid rgba(192, 107, 62, 0.12);
  background: rgba(255, 255, 255, 0.7);
}

.section-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: .4rem;
  margin-bottom: .8rem;
}

.section-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--result-ink);
  text-align: left;
  width: 100%;
}

.trait-badges {
  display: flex;
  flex-wrap: wrap;
  gap: .55rem;
}

.trait-badge {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  min-width: min(100%, 220px);
  background: rgba(247, 224, 208, 0.34);
  border: 1px solid rgba(192, 107, 62, 0.18);
  border-radius: 16px;
  padding: .55rem .7rem;
}
.badge-icon { font-size: 1rem; }
.badge-text { display: flex; flex-direction: column; line-height: 1.2; }
.badge-label {
  font-size: .66rem;
  color: var(--result-muted);
  text-transform: uppercase;
  letter-spacing: .06em;
}
.badge-value {
  font-size: .88rem;
  font-weight: 700;
  color: var(--result-ink);
}

.similar-card {
  display: flex;
  align-items: center;
  gap: .8rem;
  padding: .8rem;
  margin-top: .6rem;
  background: rgba(255, 249, 244, 0.92);
  border: 1px solid rgba(192, 107, 62, 0.14);
  border-radius: 18px;
  cursor: pointer;
  transition: background .15s ease, box-shadow .15s ease, transform .15s ease;
}
.similar-card:hover {
  background: rgba(255,255,255,.98);
  box-shadow: 0 12px 28px rgba(76, 49, 27, 0.12);
  transform: translateY(-1px);
}
.similar-info { flex: 1; min-width: 0; }
.similar-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  flex-wrap: wrap;
}
.similar-name {
  font-size: .98rem;
  color: var(--result-ink);
}
.diff-line {
  display: flex;
  gap: .45rem;
  font-size: .82rem;
  color: var(--result-muted);
  margin: .3rem 0 0;
  line-height: 1.45;
}
.diff-vs {
  color: var(--result-accent);
  font-style: normal;
  margin: 0 .2rem;
  font-weight: 700;
}

.diff-icon {
  flex-shrink: 0;
}

.diff-copy strong {
  color: var(--result-ink);
}

.confetti-container {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none; overflow: hidden; z-index: 1;
}
.confetti-piece {
  position: absolute; top: -10px;
  border-radius: 2px;
  opacity: 0;
  animation: confettiFall 1.4s ease-out forwards;
}

@keyframes confettiFall {
  0%   { opacity: 1; transform: translateY(0) rotate(0deg); }
  100% { opacity: 0; transform: translateY(260px) translateX(var(--drift, 0px)) rotate(720deg); }
}

@media (max-width: 720px) {
  .hero-card,
  .fact-grid {
    grid-template-columns: 1fr;
  }

  .result-card {
    padding: .85rem;
    border-radius: 20px;
  }

  .hero-card,
  .content-card {
    padding: .85rem;
  }

  .trait-badge {
    width: 100%;
  }

  .similar-card {
    align-items: flex-start;
  }
}
</style>
