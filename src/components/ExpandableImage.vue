<template>
  <button
    type="button"
    :class="buttonClass"
    :aria-label="ariaLabel"
    @click="openPreview"
  >
    <img
      :src="src"
      :alt="alt"
      :class="imgClass"
    />
  </button>

  <Teleport to="body">
    <div
      v-if="isOpen"
      class="image-lightbox"
      @click.self="closePreview"
    >
      <div class="image-lightbox__frame">
        <button
          type="button"
          class="image-lightbox__close"
          aria-label="Bild schließen"
          @click="closePreview"
        >
          &times;
        </button>
        <img
          :src="src"
          :alt="alt"
          :class="expandedImgClass"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  imgClass: { type: [String, Array, Object], default: '' },
  buttonClass: { type: [String, Array, Object], default: 'expandable-image' },
  expandedImgClass: { type: [String, Array, Object], default: 'image-lightbox__image' }
});

const isOpen = ref(false);

const ariaLabel = computed(() => {
  const base = props.alt?.trim() || 'Bild';
  return `${base} vergrößern`;
});

function onKeydown(event) {
  if (event.key === 'Escape') {
    closePreview();
  }
}

function openPreview(event) {
  event.stopPropagation();
  isOpen.value = true;
  window.addEventListener('keydown', onKeydown);
}

function closePreview() {
  isOpen.value = false;
  window.removeEventListener('keydown', onKeydown);
}

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
.expandable-image {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: zoom-in;
  display: inline-flex;
}

.image-lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(18, 18, 18, 0.82);
}

.image-lightbox__frame {
  position: relative;
  display: inline-flex;
  align-items: flex-start;
  justify-content: center;
  max-width: min(92vw, 920px);
  max-height: 88vh;
}

.image-lightbox__close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  background: rgba(255, 255, 255, 0.9);
  color: #2c1d19;
  font-weight: 700;
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
}

.image-lightbox__image {
  max-width: 100%;
  max-height: 88vh;
  border-radius: 12px;
  object-fit: contain;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
  background: #fff;
}
</style>
