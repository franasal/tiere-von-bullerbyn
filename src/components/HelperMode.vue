<!-- src/components/HelperMode.vue -->
<template>
  <div class="helper">
    <h2 class="helper-title">Foto-Helfer</h2>
    <p class="helper-hint">
      Wir brauchen 3 Fotos pro Tier: Ohren, Schwanz, und ein besonderes Merkmal.
      Fotografiere und teile das Foto direkt.
    </p>

    <div class="helper-stats">
      <span class="stat">{{ totalMissing }} Fotos werden noch gebraucht</span>
    </div>

    <div v-for="animal in animalsWithMissing" :key="animal.name" class="animal-block">
      <div class="animal-header" @click="toggleExpand(animal.name)">
        <img :src="getAnimalImage(animal.name)" :alt="animal.name" class="helper-thumb" />
        <div class="header-text">
          <strong>{{ animal.name }}</strong>
          <span class="missing-count">{{ animal.missingFields.length }} Fotos fehlen</span>
        </div>
        <span class="expand-icon">{{ expanded[animal.name] ? '▾' : '▸' }}</span>
      </div>

      <div v-if="expanded[animal.name]" class="field-list">
        <div
          v-for="field in animal.missingFields"
          :key="field.key"
          class="field-card"
        >
          <div class="field-header">
            <span class="field-icon">{{ field.icon }}</span>
            <div class="field-text">
              <span class="field-label">{{ field.label }}</span>
            </div>
          </div>
          <p class="field-instruction">{{ field.hint }}</p>

          <!-- Captured photo preview -->
          <div v-if="captured[`${animal.name}__${field.key}`]" class="captured">
            <img :src="captured[`${animal.name}__${field.key}`]" class="captured-img" />
            <div class="captured-actions">
              <input
                type="text"
                class="desc-input"
                v-model="descriptions[`${animal.name}__${field.key}`]"
                placeholder="Beschreibung (z.B. Ohr hat besondere Form)…"
              />
              <button
                class="share-btn"
                @click="sharePhoto(animal.name, field)"
              >
                Foto teilen
              </button>
              <button
                class="retake-btn"
                @click="clearCapture(animal.name, field.key)"
              >
                Neu aufnehmen
              </button>
            </div>
          </div>

          <!-- Camera button -->
          <label v-else class="camera-btn">
            Foto aufnehmen
            <input
              type="file"
              accept="image/*"
              capture="environment"
              @change="handleCapture($event, animal.name, field.key)"
            />
          </label>
        </div>
      </div>
    </div>

    <div v-if="!animalsWithMissing.length" class="all-done">
      Alle Fotos sind vorhanden — danke!
    </div>

    <button class="back-button" @click="$emit('back')">← Zurück</button>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { pigProfiles } from '../data/pigIdentifier.js';
import {
  PHOTO_FIELDS,
  getTraitPhoto,
  resizeImageFile
} from '../composables/useAdminPhotos.js';

const props = defineProps({
  animalInfo: { type: Object, required: true }
});

defineEmits(['back']);

const expanded = reactive({});
const captured = reactive({});
const capturedFiles = reactive({});
const descriptions = reactive({});

function getAnimalImage(name) {
  return props.animalInfo[name]?.image_url || '';
}

function toggleExpand(name) {
  expanded[name] = !expanded[name];
}

const animalsWithMissing = computed(() => {
  return pigProfiles
    .map((pig) => {
      const missingFields = PHOTO_FIELDS.filter((f) => !getTraitPhoto(pig.name, f.key));
      return { name: pig.name, missingFields };
    })
    .filter((a) => a.missingFields.length > 0);
});

const totalMissing = computed(() =>
  animalsWithMissing.value.reduce((sum, a) => sum + a.missingFields.length, 0)
);

async function handleCapture(event, pigName, fieldKey) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const key = `${pigName}__${fieldKey}`;
    const base64 = await resizeImageFile(file, 800, 0.8);
    captured[key] = base64;
    capturedFiles[key] = file;
  } catch (err) {
    alert('Fehler: ' + err.message);
  }
}

function clearCapture(pigName, fieldKey) {
  const key = `${pigName}__${fieldKey}`;
  delete captured[key];
  delete capturedFiles[key];
  delete descriptions[key];
}

async function sharePhoto(pigName, field) {
  const key = `${pigName}__${field.key}`;
  const file = capturedFiles[key];
  const base64 = captured[key];
  const desc = descriptions[key] || '';

  const fileName = `${pigName}_${field.key}.jpg`;
  const shareText = `Bullerbyn Foto: ${pigName} — ${field.label}${desc ? ': ' + desc : ''}`;

  if (navigator.share && file) {
    try {
      const shareFile = new File([file], fileName, { type: file.type });
      if (navigator.canShare && navigator.canShare({ files: [shareFile] })) {
        await navigator.share({ title: shareText, text: shareText, files: [shareFile] });
        return;
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  if (navigator.share) {
    try {
      await navigator.share({ title: shareText, text: shareText });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  if (base64) {
    const a = document.createElement('a');
    a.href = base64;
    a.download = fileName;
    a.click();
    alert(`Foto gespeichert als "${fileName}". Bitte manuell teilen.`);
  }
}
</script>

<style scoped>
.helper { animation: fadeIn .3s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.helper-title { font-size: 1.2rem; margin: 0 0 .2rem; color: #3e2723; }
.helper-hint { font-size: .85rem; color: #8d6e63; margin: 0 0 .5rem; line-height: 1.4; }
.helper-stats {
  background: #fff3e0; border: 1px solid #ffe0b2;
  border-radius: 6px; padding: .4rem .6rem; margin-bottom: .75rem;
}
.stat { font-size: .85rem; font-weight: 600; color: #e65100; }

.animal-block { border: 1px solid #f8bbd0; border-radius: 8px; margin-bottom: .5rem; overflow: hidden; }
.animal-header {
  display: flex; align-items: center; gap: .5rem;
  padding: .6rem; cursor: pointer;
  background: linear-gradient(135deg, #fdf5f9, #fce4ec);
}
.animal-header:hover { background: #fce4ec; }
.helper-thumb { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid #f8bbd0; }
.header-text { flex: 1; }
.header-text strong { display: block; font-size: .95rem; color: #3e2723; }
.missing-count { font-size: .78rem; color: #e65100; }
.expand-icon { font-size: .8rem; color: #8d6e63; }

.field-list { padding: .4rem .5rem .5rem; display: flex; flex-direction: column; gap: .5rem; }
.field-card {
  background: rgba(255,255,255,.8); border: 1px solid #f0f0f0;
  border-radius: 8px; padding: .6rem;
}
.field-header { display: flex; align-items: center; gap: .4rem; margin-bottom: .2rem; }
.field-icon { font-size: 1.1rem; }
.field-text { flex: 1; }
.field-label { font-size: .9rem; font-weight: 600; color: #3e2723; }
.field-instruction { font-size: .8rem; color: #5d4037; margin: .15rem 0 .4rem; line-height: 1.3; }

.camera-btn {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: .7rem;
  background: #e3f2fd; border: 2px dashed #42a5f5;
  border-radius: 8px; text-align: center;
  font-size: .9rem; font-weight: 600; color: #1565c0; cursor: pointer;
  transition: background .15s ease;
}
.camera-btn:hover { background: #bbdefb; }
.camera-btn input { display: none; }

.captured { display: flex; align-items: flex-start; gap: .5rem; margin-top: .3rem; }
.captured-img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #66bb6a; flex-shrink: 0; }
.captured-actions { display: flex; flex-direction: column; gap: .3rem; flex: 1; }
.desc-input {
  width: 100%; padding: .35rem .4rem; border: 1px solid #ddd;
  border-radius: 4px; font-size: .78rem; color: #333;
}
.share-btn {
  padding: .5rem; border: none; border-radius: 6px;
  background: #66bb6a; color: #fff;
  font-weight: bold; font-size: .85rem; cursor: pointer;
  transition: background .15s ease;
}
.share-btn:hover { background: #43a047; }
.retake-btn {
  padding: .35rem; border: 1px solid #bbb; border-radius: 6px;
  background: transparent; color: #777; font-size: .78rem; cursor: pointer;
}
.retake-btn:hover { background: #f5f5f5; }

.all-done { text-align: center; padding: 2rem 1rem; color: #2e7d32; font-weight: 600; font-size: 1rem; }

.back-button {
  display: block; width: 100%; margin-top: .75rem; padding: .65rem;
  border: none; border-radius: 6px;
  background-color: #d1c4e9; color: #4527a0;
  font-weight: bold; font-size: .9rem; cursor: pointer;
}
.back-button:hover { background-color: #b39ddb; color: #fff; }
</style>
