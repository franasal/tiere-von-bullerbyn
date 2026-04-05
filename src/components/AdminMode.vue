<!-- src/components/AdminMode.vue -->
<template>
  <div class="admin">
    <h2 class="admin-title">Admin: Merkmal-Fotos</h2>
    <p class="admin-hint">
      Gehe raus zu den Tieren und fotografiere die Merkmale.
      Du kannst Fotos direkt hochladen oder eine URL einfügen.
    </p>

    <!-- Filter -->
    <div class="admin-filter">
      <button
        :class="['filter-btn', { active: filter === 'missing' }]"
        @click="filter = 'missing'"
      >
        Fehlend ({{ missingCount }})
      </button>
      <button
        :class="['filter-btn', { active: filter === 'done' }]"
        @click="filter = 'done'"
      >
        Vorhanden ({{ doneCount }})
      </button>
      <button
        :class="['filter-btn', { active: filter === 'all' }]"
        @click="filter = 'all'"
      >
        Alle
      </button>
    </div>

    <!-- Animal list -->
    <div v-for="animal in filteredAnimals" :key="animal.name" class="animal-block">
      <div class="animal-header" @click="toggleExpand(animal.name)">
        <img :src="getAnimalImage(animal.name)" :alt="animal.name" class="admin-thumb" />
        <strong>{{ animal.name }}</strong>
        <span class="animal-status">
          {{ animal.doneCount }}/{{ animal.traits.length }}
        </span>
        <span class="expand-icon">{{ expanded[animal.name] ? '▾' : '▸' }}</span>
      </div>

      <div v-if="expanded[animal.name]" class="trait-list">
        <div
          v-for="trait in animal.traits"
          :key="trait.key"
          class="trait-row"
        >
          <div class="trait-info">
            <span class="trait-icon">{{ trait.icon }}</span>
            <span class="trait-body">
              <span class="trait-label">{{ trait.label }}</span>
              <span class="trait-value">{{ trait.valueLabel }}</span>
            </span>
            <span :class="['status-dot', trait.hasPhoto ? 'done' : 'missing']" />
          </div>

          <!-- Photo preview if exists -->
          <div v-if="trait.photoUrl" class="photo-preview">
            <img :src="trait.photoUrl" :alt="`${animal.name} ${trait.label}`" class="preview-img" />
            <button class="remove-btn" @click="removePhoto(animal.name, trait.key)">Entfernen</button>
          </div>

          <!-- Upload controls -->
          <div v-if="!trait.photoUrl" class="upload-controls">
            <label class="upload-btn">
              Foto aufnehmen / hochladen
              <input
                type="file"
                accept="image/*"
                capture="environment"
                @change="handleFileUpload($event, animal.name, trait.key)"
              />
            </label>
            <div class="url-input-row">
              <input
                type="url"
                placeholder="Oder URL einfügen…"
                v-model="urlInputs[`${animal.name}__${trait.key}`]"
                class="url-input"
              />
              <button
                class="url-save-btn"
                :disabled="!urlInputs[`${animal.name}__${trait.key}`]"
                @click="saveUrl(animal.name, trait.key)"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Helper link -->
    <div class="helper-section">
      <h3 class="section-label">Helfer einladen</h3>
      <p class="helper-desc">
        Teile diesen Link mit Helfer:innen — sie sehen, welche Fotos fehlen
        und können direkt Fotos aufnehmen und teilen.
      </p>
      <div class="helper-link-row">
        <input
          type="text"
          readonly
          :value="helperUrl"
          class="helper-link-input"
          ref="helperLinkInput"
        />
        <button class="copy-btn" @click="copyHelperLink">
          {{ copied ? 'Kopiert!' : 'Kopieren' }}
        </button>
      </div>
      <button class="share-helper-btn" @click="shareHelperLink">
        Helfer-Link teilen
      </button>
      <button class="open-helper-btn" @click="$emit('openHelper')">
        Helfer-Modus öffnen
      </button>
    </div>

    <!-- Export / Import -->
    <div class="admin-actions">
      <button class="action-btn" @click="doExport">Fotos exportieren (JSON)</button>
      <label class="action-btn import-btn">
        Fotos importieren (JSON)
        <input type="file" accept=".json" @change="doImport" />
      </label>
    </div>

    <button class="back-button" @click="$emit('back')">← Zurück</button>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { pigProfiles } from '../data/pigIdentifier.js';
import { getTraitKeysForPig } from '../data/pigTraitAnalysis.js';
import {
  getTraitPhoto,
  setTraitPhoto,
  removeTraitPhoto,
  resizeImageFile,
  exportPhotosJSON,
  importPhotosJSON
} from '../composables/useAdminPhotos.js';

const props = defineProps({
  animalInfo: { type: Object, required: true }
});

const emit = defineEmits(['back', 'openHelper']);

const helperLinkInput = ref(null);
const copied = ref(false);
const filter = ref('missing');
const expanded = reactive({});
const urlInputs = reactive({});
const refreshKey = ref(0);

const helperUrl = computed(() => {
  const url = new URL(window.location.href);
  url.search = '?helper';
  return url.toString();
});

function copyHelperLink() {
  navigator.clipboard.writeText(helperUrl.value).then(() => {
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  });
}

async function shareHelperLink() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Bullerbyn Foto-Helfer',
        text: 'Hilf uns, Fotos von den Tieren zu machen!',
        url: helperUrl.value
      });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }
  copyHelperLink();
}

function getAnimalImage(name) {
  return props.animalInfo[name]?.image_url || '';
}

function toggleExpand(name) {
  expanded[name] = !expanded[name];
}

const allAnimals = computed(() => {
  // Force reactivity on refreshKey
  void refreshKey.value;

  return pigProfiles.map((pig) => {
    const traits = getTraitKeysForPig(pig.name).map((t) => {
      const photoUrl = getTraitPhoto(pig.name, t.key);
      return { ...t, hasPhoto: !!photoUrl, photoUrl };
    });
    const doneCount = traits.filter((t) => t.hasPhoto).length;
    return { name: pig.name, traits, doneCount };
  });
});

const filteredAnimals = computed(() => {
  if (filter.value === 'all') return allAnimals.value;
  if (filter.value === 'missing') return allAnimals.value.filter((a) => a.doneCount < a.traits.length);
  if (filter.value === 'done') return allAnimals.value.filter((a) => a.doneCount > 0);
  return allAnimals.value;
});

const missingCount = computed(() => allAnimals.value.filter((a) => a.doneCount < a.traits.length).length);
const doneCount = computed(() => allAnimals.value.filter((a) => a.doneCount > 0).length);

async function handleFileUpload(event, pigName, traitKey) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const base64 = await resizeImageFile(file);
    setTraitPhoto(pigName, traitKey, base64);
    refreshKey.value++;
  } catch (err) {
    alert('Fehler beim Verarbeiten des Bildes: ' + err.message);
  }
}

function saveUrl(pigName, traitKey) {
  const key = `${pigName}__${traitKey}`;
  const url = urlInputs[key];
  if (!url) return;
  setTraitPhoto(pigName, traitKey, url);
  urlInputs[key] = '';
  refreshKey.value++;
}

function removePhoto(pigName, traitKey) {
  removeTraitPhoto(pigName, traitKey);
  refreshKey.value++;
}

function doExport() {
  const json = exportPhotosJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bullerbyn-trait-photos.json';
  a.click();
  URL.revokeObjectURL(url);
}

function doImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    if (importPhotosJSON(e.target.result)) {
      refreshKey.value++;
      alert('Fotos erfolgreich importiert!');
    } else {
      alert('Fehler beim Import – ungültige JSON-Datei.');
    }
  };
  reader.readAsText(file);
}
</script>

<style scoped>
.admin {
  animation: fadeIn .3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.admin-title { font-size: 1.15rem; margin: 0 0 .2rem; color: #3e2723; }
.admin-hint { font-size: .82rem; color: #8d6e63; margin: 0 0 .75rem; }

/* Filter */
.admin-filter {
  display: flex; gap: .3rem; margin-bottom: .75rem;
}
.filter-btn {
  flex: 1; padding: .4rem; border: 1px solid #ddd; border-radius: 6px;
  background: #fff; color: #5d4037; font-size: .8rem;
  cursor: pointer; font-weight: 500;
  transition: all .15s ease;
}
.filter-btn.active {
  background: #f48fb1; color: #fff; border-color: #f48fb1;
}

/* Animal blocks */
.animal-block {
  border: 1px solid #f8bbd0; border-radius: 8px;
  margin-bottom: .5rem; overflow: hidden;
}
.animal-header {
  display: flex; align-items: center; gap: .5rem;
  padding: .5rem; cursor: pointer;
  background: linear-gradient(135deg, #fdf5f9, #fce4ec);
  transition: background .15s ease;
}
.animal-header:hover { background: #fce4ec; }
.admin-thumb {
  width: 36px; height: 36px; border-radius: 50%;
  object-fit: cover; border: 2px solid #f8bbd0;
}
.animal-status {
  margin-left: auto; font-size: .8rem; color: #8d6e63;
}
.expand-icon { font-size: .75rem; color: #8d6e63; }

.trait-list {
  padding: .3rem .5rem .5rem;
  display: flex; flex-direction: column; gap: .4rem;
}

.trait-row {
  background: rgba(255,255,255,.6);
  border-radius: 6px;
  padding: .4rem;
}
.trait-info {
  display: flex; align-items: center; gap: .4rem;
}
.trait-icon { font-size: .9rem; }
.trait-body { flex: 1; }
.trait-label {
  display: block; font-size: .65rem; color: #8d6e63;
  text-transform: uppercase; letter-spacing: .03em;
}
.trait-value { font-size: .82rem; font-weight: 600; color: #3e2723; }

.status-dot {
  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
}
.status-dot.done { background: #66bb6a; }
.status-dot.missing { background: #ef5350; }

/* Photo preview */
.photo-preview {
  margin-top: .3rem;
  display: flex; align-items: center; gap: .5rem;
}
.preview-img {
  width: 60px; height: 60px; object-fit: cover;
  border-radius: 6px; border: 1px solid #ddd;
}
.remove-btn {
  padding: .25rem .5rem; border: 1px solid #ef5350; border-radius: 4px;
  background: transparent; color: #ef5350; font-size: .75rem;
  cursor: pointer;
}
.remove-btn:hover { background: #ef5350; color: #fff; }

/* Upload controls */
.upload-controls { margin-top: .3rem; }
.upload-btn {
  display: block; width: 100%; padding: .45rem;
  background: #e8f5e9; border: 1px dashed #66bb6a;
  border-radius: 6px; text-align: center;
  font-size: .8rem; color: #2e7d32;
  cursor: pointer;
  transition: background .15s ease;
}
.upload-btn:hover { background: #c8e6c9; }
.upload-btn input { display: none; }

.url-input-row {
  display: flex; gap: .3rem; margin-top: .3rem;
}
.url-input {
  flex: 1; padding: .35rem .5rem;
  border: 1px solid #ddd; border-radius: 4px;
  font-size: .8rem;
}
.url-save-btn {
  padding: .35rem .6rem; border: none; border-radius: 4px;
  background: #42a5f5; color: #fff; font-size: .8rem;
  cursor: pointer;
}
.url-save-btn:disabled { opacity: .4; cursor: default; }

/* Helper section */
.helper-section {
  margin-top: .75rem; padding: .6rem;
  background: #e3f2fd; border: 1px solid #90caf9;
  border-radius: 8px;
}
.section-label {
  font-size: .9rem; margin: 0 0 .2rem; color: #1565c0;
}
.helper-desc {
  font-size: .78rem; color: #5d4037; margin: 0 0 .4rem; line-height: 1.3;
}
.helper-link-row {
  display: flex; gap: .3rem; margin-bottom: .4rem;
}
.helper-link-input {
  flex: 1; padding: .3rem .5rem;
  border: 1px solid #90caf9; border-radius: 4px;
  font-size: .75rem; color: #333; background: #fff;
}
.copy-btn {
  padding: .3rem .6rem; border: none; border-radius: 4px;
  background: #42a5f5; color: #fff; font-size: .78rem;
  cursor: pointer; white-space: nowrap;
}
.copy-btn:hover { background: #1e88e5; }
.share-helper-btn, .open-helper-btn {
  display: block; width: 100%;
  padding: .5rem; border: none; border-radius: 6px;
  font-weight: 600; font-size: .85rem;
  cursor: pointer; margin-top: .3rem;
  transition: background .15s ease;
}
.share-helper-btn {
  background: #42a5f5; color: #fff;
}
.share-helper-btn:hover { background: #1e88e5; }
.open-helper-btn {
  background: transparent; border: 1px solid #90caf9; color: #1565c0;
}
.open-helper-btn:hover { background: #e3f2fd; }

/* Actions */
.admin-actions {
  display: flex; gap: .4rem; margin-top: .75rem;
}
.action-btn {
  flex: 1; padding: .45rem; border: 1px solid #ddd; border-radius: 6px;
  background: #fff; font-size: .78rem; color: #5d4037;
  cursor: pointer; text-align: center;
  transition: background .15s ease;
}
.action-btn:hover { background: #f5f5f5; }
.import-btn input { display: none; }

.back-button {
  display: block; width: 100%;
  margin-top: .75rem; padding: .65rem;
  border: none; border-radius: 6px;
  background-color: #d1c4e9; color: #4527a0;
  font-weight: bold; font-size: .9rem;
  cursor: pointer;
}
.back-button:hover { background-color: #b39ddb; color: #fff; }
</style>
