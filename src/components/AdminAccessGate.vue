<template>
  <div class="admin-gate">
    <div class="gate-card">
      <p class="gate-kicker">Geschuetzter Bereich</p>
      <h2 class="gate-title">Admin Panel</h2>
      <p class="gate-copy">
        Dieser Bereich steuert Inhalte, Fotos und kuenftige Tiergruppen.
        Bitte mit Passwort entsperren.
      </p>

      <form class="gate-form" @submit.prevent="submit">
        <label class="gate-label" for="admin-password">Passwort</label>
        <input
          id="admin-password"
          v-model="password"
          class="gate-input"
          type="password"
          autocomplete="current-password"
          placeholder="Admin-Passwort"
        />
        <p v-if="error" class="gate-error">{{ error }}</p>
        <button class="gate-button" type="submit">Admin entsperren</button>
      </form>

      <div class="gate-status">
        <p v-if="securityInfo.source === 'env'" class="status-ok">
          Passwort ist ueber `VITE_ADMIN_PASSWORD` konfiguriert.
        </p>
        <p v-else-if="securityInfo.source === 'dev-fallback'" class="status-warn">
          Entwicklungs-Fallback aktiv: `{{ securityInfo.devFallbackPassword }}`.
          Vor Deployment durch `VITE_ADMIN_PASSWORD` ersetzen.
        </p>
        <p v-else class="status-error">
          Kein Produktions-Passwort gesetzt. Setze `VITE_ADMIN_PASSWORD`, sonst bleibt
          das Admin Panel gesperrt.
        </p>
        <p class="status-note">
          Hinweis: In dieser reinen Frontend-App ist das ein Schutz vor versehentlichem
          Zugriff, kein vollwertiges Login-System.
        </p>
      </div>

      <button class="back-button" type="button" @click="$emit('back')">← Zurueck</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { unlockAdmin } from '../composables/useAdminAuth.js';

const props = defineProps({
  securityInfo: { type: Object, required: true }
});

const emit = defineEmits(['back', 'unlock']);

const password = ref('');
const error = ref('');

function submit() {
  error.value = '';

  if (!props.securityInfo.hasPassword) {
    error.value = 'Kein Passwort konfiguriert.';
    return;
  }

  if (!unlockAdmin(password.value)) {
    error.value = 'Passwort ist nicht korrekt.';
    return;
  }

  password.value = '';
  emit('unlock');
}
</script>

<style scoped>
.admin-gate {
  display: flex;
  justify-content: center;
  animation: fadeIn .25s ease;
}

.gate-card {
  width: 100%;
  max-width: 420px;
  padding: 1rem;
  border: 1px solid #e0d7d1;
  border-radius: 12px;
  background:
    radial-gradient(circle at top right, rgba(244, 143, 177, .18), transparent 32%),
    linear-gradient(180deg, #fffefc, #fbf7f3);
}

.gate-kicker {
  margin: 0 0 .2rem;
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: #8d6e63;
}

.gate-title {
  margin: 0;
  font-size: 1.35rem;
  color: #3e2723;
}

.gate-copy {
  margin: .35rem 0 1rem;
  font-size: .9rem;
  line-height: 1.45;
  color: #5d4037;
}

.gate-form {
  display: flex;
  flex-direction: column;
  gap: .45rem;
}

.gate-label {
  font-size: .82rem;
  font-weight: 600;
  color: #5d4037;
}

.gate-input {
  width: 100%;
  padding: .7rem .8rem;
  border: 1px solid #d7ccc8;
  border-radius: 8px;
  background: #fff;
  color: #3e2723;
  font-size: .95rem;
}

.gate-button,
.back-button {
  width: 100%;
  padding: .72rem .9rem;
  border: none;
  border-radius: 8px;
  font-size: .92rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform .1s ease, background .15s ease;
}

.gate-button {
  background: #ec407a;
  color: #fff;
}

.gate-button:hover {
  background: #d81b60;
}

.back-button {
  margin-top: .85rem;
  background: #d1c4e9;
  color: #4527a0;
}

.back-button:hover {
  background: #b39ddb;
  color: #fff;
}

.gate-button:active,
.back-button:active {
  transform: scale(.98);
}

.gate-error {
  margin: 0;
  font-size: .82rem;
  color: #c62828;
}

.gate-status {
  margin-top: 1rem;
  padding: .8rem;
  border: 1px solid #eee3dd;
  border-radius: 10px;
  background: rgba(255, 255, 255, .75);
}

.status-ok,
.status-warn,
.status-error,
.status-note {
  margin: 0;
  font-size: .8rem;
  line-height: 1.45;
}

.status-ok { color: #2e7d32; }
.status-warn { color: #ef6c00; }
.status-error { color: #c62828; }
.status-note {
  margin-top: .45rem;
  color: #6d4c41;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
