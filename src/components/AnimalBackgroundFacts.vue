<template>
  <section v-if="entries.length" class="background-facts">
    <h3 class="background-facts__title">Hintergrund</h3>
    <div class="background-facts__grid">
      <article
        v-for="entry in entries"
        :key="entry.key"
        class="background-facts__item"
      >
        <span class="background-facts__icon">{{ entry.icon }}</span>
        <div class="background-facts__body">
          <span class="background-facts__label">{{ entry.label }}</span>
          <span class="background-facts__value">{{ entry.value }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  facts: { type: Object, default: () => ({}) }
});

const FACT_DEFINITIONS = [
  { key: 'ankunftsalter', label: 'Ankunftsalter', icon: '📅' },
  { key: 'art', label: 'Art', icon: '🐾' },
  { key: 'herkunft', label: 'Herkunft', icon: '🏚️' },
  { key: 'retterin', label: 'Retterin', icon: '💚' },
  { key: 'retter', label: 'Retter', icon: '💚' }
];

const entries = computed(() => FACT_DEFINITIONS
  .map((definition) => ({
    ...definition,
    value: String(props.facts?.[definition.key] || '').trim()
  }))
  .filter((entry) => entry.value));
</script>

<style scoped>
.background-facts {
  width: 100%;
  box-sizing: border-box;
  margin-top: .75rem;
  padding: .8rem .85rem;
  background: rgba(255, 250, 244, .9);
  border: 1px solid #f0dcc8;
  border-radius: 12px;
}

.background-facts__title {
  margin: 0 0 .55rem;
  font-size: .88rem;
  color: #6d4c41;
}

.background-facts__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .5rem;
}

.background-facts__item {
  display: flex;
  align-items: flex-start;
  gap: .5rem;
  padding: .55rem .6rem;
  background: rgba(255, 255, 255, .82);
  border: 1px solid #ecd9c8;
  border-radius: 10px;
}

.background-facts__icon {
  font-size: 1rem;
  line-height: 1;
  margin-top: .08rem;
}

.background-facts__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.background-facts__label {
  font-size: .66rem;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: #8d6e63;
}

.background-facts__value {
  font-size: .8rem;
  line-height: 1.4;
  color: #3e2723;
  word-break: break-word;
}

@media (max-width: 520px) {
  .background-facts__grid {
    grid-template-columns: 1fr;
  }
}
</style>
