<script setup>
import AnimalIdentifier from './components/AnimalIdentifier.vue'
</script>

<template>
  <div class="app-shell">
    <AnimalIdentifier />
    <p class="app-credit">
      Mit tierischer Liebe entwickelt von <span class="app-credit__name">vgn-dev</span>
    </p>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.app-credit {
  margin: 0;
  text-align: center;
  font-size: 0.9rem;
  color: #6f4e37;
}

.app-credit__name {
  font-weight: 700;
}
</style>
