<template>
  <div class="trail" v-if="steps && steps.length">
    <div class="trail-label">Bisher gewählt:</div>
    <ul class="chips">
      <li v-for="(s, i) in steps" :key="i" class="chip" :title="s.question">
        <span class="chip-q">{{ s.question }}:</span>
        <span class="chip-a">{{ s.optionLabel }}</span>
        <button
          v-if="i === steps.length - 1"
          class="chip-x"
          @click="$emit('removeLast')"
          aria-label="Letzte Auswahl entfernen"
          title="Letzte Auswahl entfernen"
        >×</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  steps: { type: Array, required: true } // [{question, optionKey, optionLabel}]
});
defineEmits(['removeLast']);
</script>

<style scoped>
.trail { display: grid; gap: .5rem; margin-bottom: .75rem; }
.trail-label { font-size: .9rem; opacity: .8; }
.chips { display: flex; flex-wrap: wrap; gap: .5rem; margin: 0; padding: 0; list-style: none; }
.chip {
  display: inline-flex; align-items: center; gap: .4rem;
  background: #f3f3f3; border: 1px solid #e0e0e0; border-radius: 999px;
  padding: .25rem .5rem;
  font-size: .85rem;
}
.chip-q { opacity: .75; }
.chip-a { font-weight: 600; }
.chip-x {
  border: none; background: transparent; cursor: pointer; font-size: 1rem; line-height: 1;
  padding: 0 .25rem; margin-left: .1rem; color: #666;
}
.chip-x:hover { color: #000; }
</style>
