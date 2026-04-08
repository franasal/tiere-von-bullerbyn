<!-- src/components/AnimalProfile.vue -->
<template>
  <div class="profile">
    <section class="hero-card">
      <div class="hero-copy">
        <span class="section-eyebrow">Tierprofil</span>
        <div class="hero-heading">
          <h2 class="profile-name">{{ name }}</h2>
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
        :alt="name"
        img-class="profile-img"
      />
    </section>

    <AnimalCharacteristics
      v-if="characteristics && Object.keys(characteristics).length"
      :characteristics="characteristics"
      :besonderheiten="besonderheiten"
    />

    <section v-if="uniqueTraits.length" class="content-card">
      <div class="section-header">
        <span class="section-eyebrow">Schnell erkennen</span>
        <h3 class="section-title">Darauf solltest du achten</h3>
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

    <section v-if="similarAnimals.length" class="content-card">
      <div class="section-header">
        <span class="section-eyebrow">Vergleich</span>
        <h3 class="section-title">Aehnliche Tiere in der Herde</h3>
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

    <button class="back-button" @click="$emit('back')">← Zurück zur Galerie</button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
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

defineEmits(['back', 'showProfile']);

const heroSummary = computed(() =>
  props.story || props.appearance || `${props.name} hat ein eigenes Profil mit den wichtigsten Erkennungsmerkmalen.`
);

const statusLabel = computed(() => {
  if (props.similarAnimals.length) return 'Mit aehnlichen Tieren vergleichen';
  if (props.uniqueTraits.length >= 3) return 'Gut zu erkennen';
  return 'Tierprofil';
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
</script>

<style scoped>
.profile {
  --profile-accent: #9d5a34;
  --profile-border: #e7ceb9;
  --profile-ink: #2d221b;
  --profile-muted: #735646;

  animation: fadeIn .3s ease;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  text-align: left;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.hero-card,
.content-card {
  width: 100%;
  padding: 1rem;
  border-radius: 20px;
  border: 1px solid rgba(157, 90, 52, 0.14);
  background:
    linear-gradient(180deg, rgba(255, 252, 248, 0.98), rgba(252, 244, 236, 0.95));
  box-shadow: 0 18px 40px rgba(76, 53, 39, 0.08);
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(220px, .9fr);
  gap: 1rem;
  align-items: center;
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
  background: rgba(157, 90, 52, 0.1);
  color: var(--profile-accent);
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.hero-heading,
.similar-topline,
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .6rem;
  flex-wrap: wrap;
}

:deep(.profile-img) {
  width: 100%;
  max-width: 100%;
  max-height: 340px;
  object-fit: cover;
  border-radius: 18px;
  box-shadow: 0 14px 32px rgba(87, 56, 34, 0.18);
}

.profile-name {
  font-size: clamp(1.5rem, 3vw, 2.1rem);
  margin: 0;
  color: var(--profile-ink);
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
  border: 1px solid rgba(157, 90, 52, 0.22);
  color: var(--profile-accent);
}

.hero-summary {
  margin: 0;
  font-size: .96rem;
  line-height: 1.6;
  color: var(--profile-ink);
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
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(157, 90, 52, 0.14);
}

.fact-label {
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--profile-muted);
}

.fact-value {
  font-size: .88rem;
  line-height: 1.45;
  color: var(--profile-ink);
}

.section-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--profile-ink);
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
  background: rgba(245, 229, 218, 0.5);
  border: 1px solid rgba(157, 90, 52, 0.18);
  border-radius: 16px;
  padding: .55rem .7rem;
}
.badge-icon { font-size: 1rem; }
.badge-text { display: flex; flex-direction: column; line-height: 1.2; }
.badge-label {
  font-size: .66rem;
  color: var(--profile-muted);
  text-transform: uppercase;
  letter-spacing: .06em;
}
.badge-value {
  font-size: .88rem;
  font-weight: 700;
  color: var(--profile-ink);
}

.similar-card {
  display: flex;
  align-items: center;
  gap: .8rem;
  padding: .8rem;
  margin-top: .6rem;
  background: rgba(255, 250, 245, 0.92);
  border: 1px solid rgba(157, 90, 52, 0.14);
  border-radius: 18px;
  cursor: pointer;
  transition: background .15s ease, box-shadow .15s ease, transform .15s ease;
}
.similar-card:hover {
  background: rgba(255,255,255,.98);
  box-shadow: 0 12px 28px rgba(76, 49, 27, 0.12);
  transform: translateY(-1px);
}
:deep(.similar-img) {
  width: 68px;
  height: 68px;
  border-radius: 18px;
  object-fit: cover;
  border: 1px solid rgba(157, 90, 52, 0.16);
  flex-shrink: 0;
}
.similar-info { flex: 1; min-width: 0; }
.similar-name {
  font-size: .98rem;
  color: var(--profile-ink);
}
.diff-line {
  display: flex;
  gap: .45rem;
  font-size: .82rem;
  color: var(--profile-muted);
  margin: .3rem 0 0;
  line-height: 1.45;
}
.diff-icon { flex-shrink: 0; }
.diff-copy strong { color: var(--profile-ink); }
.diff-vs {
  color: var(--profile-accent);
  margin: 0 .2rem;
  font-weight: 700;
}

.back-button {
  display: block;
  width: 100%;
  padding: .85rem 1rem;
  border: 1px solid rgba(157, 90, 52, 0.18);
  border-radius: 16px;
  background: linear-gradient(180deg, #fffaf5, #f7e8dc);
  color: var(--profile-ink);
  font-weight: 700;
  font-size: .92rem;
  cursor: pointer;
  transition: background .15s ease, transform .15s ease, box-shadow .15s ease;
}
.back-button:hover {
  background: linear-gradient(180deg, #fffdfb, #f4ddcb);
  box-shadow: 0 12px 28px rgba(76, 49, 27, 0.12);
  transform: translateY(-1px);
}

@media (max-width: 720px) {
  .hero-card,
  .fact-grid {
    grid-template-columns: 1fr;
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
