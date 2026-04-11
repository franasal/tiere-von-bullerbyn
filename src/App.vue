<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AnimalIdentifier from './components/AnimalIdentifier.vue'

const THEME_KEY = 'pig-id-theme'
const theme = ref('light')

const themeLabel = computed(() => theme.value === 'dark' ? 'Hellen Modus aktivieren' : 'Dunklen Modus aktivieren')

function applyTheme(value) {
  theme.value = value
  document.documentElement.setAttribute('data-theme', value)
  try {
    localStorage.setItem(THEME_KEY, value)
  } catch {
    // Ignore storage errors.
  }
}

function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

onMounted(() => {
  let nextTheme = 'dark'

  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') {
      nextTheme = stored
    } else if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      nextTheme = 'light'
    }
  } catch {
    // Default stays dark
  }

  document.documentElement.style.colorScheme = nextTheme
  applyTheme(nextTheme)
})

watch(theme, (value) => {
  document.documentElement.style.colorScheme = value
})
</script>

<template>
  <div class="app-shell">
    <div class="app-toolbar">
      <button class="theme-toggle" type="button" :aria-label="themeLabel" :title="themeLabel" @click="toggleTheme">
        <span class="theme-toggle__icon" aria-hidden="true">{{ theme === 'dark' ? '☀' : '☾' }}</span>
      </button>
    </div>
    <AnimalIdentifier />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem;
  padding-bottom: 5rem;
}

.app-toolbar {
  display: flex;
  justify-content: flex-end;
}

.theme-toggle {
  width: 2.9rem;
  height: 2.9rem;
  padding: 0;
  border-radius: 50%;
  border: 1px solid var(--theme-border, rgba(255, 255, 255, 0.08));
  background: var(--theme-surface, rgba(20, 20, 20, 0.7));
  color: var(--theme-text, #e8e6e1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: background 0.2s, border-color 0.2s;
}

.theme-toggle__icon {
  font-size: 1.1rem;
  line-height: 1;
}

@media (max-width: 640px) {
  .app-shell {
    padding-bottom: 5.75rem;
  }
}
</style>
