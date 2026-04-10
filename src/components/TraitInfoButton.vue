<template>
  <div class="trait-info">
    <button
      type="button"
      class="trait-info-button"
      :aria-label="buttonLabel"
      @click.stop="open = true"
    >
      i
    </button>

    <div v-if="open" class="trait-info-overlay" @click.self="open = false">
      <div class="trait-info-dialog">
        <button
          type="button"
          class="trait-info-close"
          aria-label="Schließen"
          @click="open = false"
        >
          ×
        </button>
        <div class="trait-info-image-wrap">
          <img :src="imageSrc" :alt="imageAlt" class="trait-info-image" />
          <div v-if="credit" class="trait-info-credit-overlay">© {{ credit }}</div>
        </div>
        <p v-if="caption" class="trait-info-caption">{{ caption }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  imageSrc: { type: String, required: true },
  imageAlt: { type: String, default: '' },
  caption: { type: String, default: '' },
  credit: { type: String, default: '' },
  label: { type: String, default: 'Info anzeigen' }
});

const open = ref(false);
const buttonLabel = computed(() => props.label || 'Info anzeigen');
</script>

<style scoped>
.trait-info {
  display: inline-flex;
  align-items: center;
}

.trait-info-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.2rem;
  height: 1.2rem;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(62, 39, 35, 0.1);
  color: #5d4037;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.trait-info-inline {
  position: absolute;
  right: 0.55rem;
  bottom: 0.55rem;
}

.trait-info-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(20, 14, 18, 0.7);
}

.trait-info-dialog {
  position: relative;
  width: min(88vw, 24rem);
  max-height: min(78vh, 32rem);
  overflow: auto;
  padding: 0.85rem;
  border-radius: 14px;
  background: #fffaf7;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
}

.trait-info-close {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 999px;
  background: rgba(62, 39, 35, 0.08);
  color: #4e342e;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 2;
}

.trait-info-image {
  display: block;
  width: 100%;
  max-height: 22rem;
  border-radius: 12px;
  object-fit: contain;
}

.trait-info-image-wrap {
  position: relative;
}

.trait-info-credit-overlay {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  padding: 0.18rem 0.3rem;
  border-radius: 6px;
  background: rgba(20, 14, 18, 0.5);
  color: #fdf5f9;
  font-size: 0.62rem;
  line-height: 1.15;
}

.trait-info-caption {
  margin: 0.75rem 0 0;
  color: #5d4037;
  font-size: 0.88rem;
  line-height: 1.45;
}
</style>
