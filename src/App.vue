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
  let nextTheme = 'light'

  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') {
      nextTheme = stored
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      nextTheme = 'dark'
    }
  } catch {
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      nextTheme = 'dark'
    }
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

.app-toolbar {
  display: flex;
  justify-content: flex-end;
}

.theme-toggle {
  width: 2.9rem;
  height: 2.9rem;
  padding: 0;
  border-radius: 50%;
  border: 1px solid var(--theme-border, #d7c3af);
  background: var(--theme-surface, rgba(255, 250, 244, 0.88));
  color: var(--theme-text, #4c3527);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}

.theme-toggle__icon {
  font-size: 1.1rem;
  line-height: 1;
}

.app-credit {
  margin: 0;
  text-align: center;
  font-size: 0.9rem;
  color: var(--theme-muted, #6f4e37);
}

.app-credit__name {
  font-weight: 700;
}
</style>
