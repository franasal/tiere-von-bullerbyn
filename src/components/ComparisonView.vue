<!-- src/components/ComparisonView.vue -->
<template>
  <div class="comparison">
    <h2 class="comparison-title">Wer von diesen ist es?</h2>
    <p class="comparison-hint">Vergleiche die Unterschiede und wähle das passende Tier.</p>

    <div class="comparison-cards">
      <div
        v-for="c in candidates"
        :key="c.name"
        class="compare-card"
      >
        <img :src="c.imageUrl" :alt="c.name" class="compare-img" />
        <strong class="compare-name">{{ c.name }}</strong>
        <ul class="compare-traits">
          <li v-for="t in differentiatingTraits" :key="t.key" class="compare-trait">
            <span class="ct-icon">{{ t.icon }}</span>
            <span class="ct-body">
              <span class="ct-label">{{ t.label }}</span>
              <span class="ct-value">{{ t.values[c.name] }}</span>
            </span>
          </li>
        </ul>
        <button class="select-button" @click="$emit('select', c.name)">
          Das ist es!
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  candidates: { type: Array, required: true },
  differentiatingTraits: { type: Array, required: true }
});

defineEmits(['select']);
</script>

<style scoped>
.comparison {
  animation: fadeIn .3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.comparison-title {
  font-size: 1.15rem; margin: 0 0 .25rem; color: #3e2723;
}
.comparison-hint {
  font-size: .85rem; color: #8d6e63; margin: 0 0 .75rem;
}

.comparison-cards {
  display: flex; gap: .6rem;
}
.compare-card {
  flex: 1;
  display: flex; flex-direction: column; align-items: center;
  background: linear-gradient(135deg, #fdf5f9, #fce4ec);
  border: 1px solid #f8bbd0;
  border-radius: 10px;
  padding: .6rem;
  min-width: 0;
}
.compare-img {
  width: 80px; height: 80px;
  border-radius: 50%; object-fit: cover;
  border: 3px solid #f8bbd0;
  margin-bottom: .4rem;
}
.compare-name {
  font-size: .95rem; color: #3e2723; margin-bottom: .4rem;
}

.compare-traits {
  list-style: none; margin: 0; padding: 0; width: 100%;
  display: flex; flex-direction: column; gap: .25rem;
  flex: 1;
}
.compare-trait {
  display: flex; align-items: center; gap: .3rem;
  padding: .25rem .35rem;
  background: rgba(255,255,255,.6);
  border-radius: 5px;
}
.ct-icon { font-size: .85rem; flex-shrink: 0; }
.ct-body { flex: 1; min-width: 0; }
.ct-label {
  display: block;
  font-size: .6rem; color: #8d6e63;
  text-transform: uppercase; letter-spacing: .03em;
}
.ct-value {
  display: block;
  font-size: .75rem; font-weight: 600; color: #3e2723;
  word-break: break-word;
}

.select-button {
  margin-top: .5rem; width: 100%;
  padding: .5rem; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 999px;
  background-color: #f48fb1; color: #212121;
  font-weight: 700; font-size: .85rem;
  cursor: pointer;
  transition: background .2s ease, transform .15s ease;
}
.select-button:hover { background-color: #ec407a; color: #fff; }
.select-button:active { transform: scale(0.97); }
</style>
