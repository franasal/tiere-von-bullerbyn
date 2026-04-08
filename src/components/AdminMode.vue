<template>
  <div class="admin">
    <div class="admin-hero">
      <div>
        <p class="admin-kicker">Admin Workspace</p>
        <h2 class="admin-title">Fotos und Besucher*innennotizen verwalten</h2>
        <p class="admin-hint">
          Dieses Panel ist jetzt auf die beiden aktiven Aufgaben reduziert:
          Merkmal-Fotos pflegen und Notizen moderieren.
        </p>
      </div>
      <button class="lock-btn" @click="$emit('lock')">Log out</button>
    </div>

    <div class="tab-row">
      <button
        :class="['tab-btn', { active: activeTab === 'photos' }]"
        @click="activeTab = 'photos'"
      >
        Fotos
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'notes' }]"
        @click="activeTab = 'notes'"
      >
        Notizen
      </button>
    </div>

    <template v-if="activeTab === 'photos'">
      <section class="panel-section">
        <h3 class="section-title">Merkmal-Fotos</h3>
        <p class="panel-copy">
          Pro Tier werden aktuell 3 Fotos gesammelt: Ohren, Schwanz und ein besonderes Merkmal.
          Dieser Bereich sollte später pro Tiergruppe konfigurierbare Medien-Slots bekommen.
        </p>
      </section>

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

      <div v-for="animal in filteredAnimals" :key="animal.name" class="animal-block">
        <div class="animal-header" @click="toggleExpand(animal.name)">
          <img :src="getAnimalImage(animal.name)" :alt="animal.name" class="admin-thumb" />
          <strong>{{ animal.name }}</strong>
          <span class="animal-status">
            {{ animal.doneCount }}/{{ animal.fields.length }}
          </span>
          <span class="expand-icon">{{ expanded[animal.name] ? '▾' : '▸' }}</span>
        </div>

        <div v-if="expanded[animal.name]" class="trait-list">
          <div
            v-for="field in animal.fields"
            :key="field.key"
            class="trait-row"
          >
            <div class="trait-info">
              <span class="trait-icon">{{ field.icon }}</span>
              <span class="trait-body">
                <span class="trait-label">{{ field.label }}</span>
                <span class="trait-hint">{{ field.hint }}</span>
              </span>
              <span :class="['status-dot', field.entry ? 'done' : 'missing']" />
            </div>

            <div v-if="field.entry" class="photo-preview">
              <img :src="field.entry.url" :alt="`${animal.name} ${field.label}`" class="preview-img" />
              <div class="preview-details">
                <input
                  type="text"
                  class="desc-input"
                  :value="field.entry.description"
                  placeholder="Beschreibung hinzufügen…"
                  @change="updateDescription($event, animal.name, field.key)"
                />
                <button class="remove-btn" @click="removePhoto(animal.name, field.key)">Entfernen</button>
              </div>
            </div>

            <div v-if="!field.entry" class="upload-controls">
              <label class="upload-btn">
                Foto aufnehmen / hochladen
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  @change="handleFileUpload($event, animal.name, field.key)"
                />
              </label>
              <div class="url-input-row">
                <input
                  type="url"
                  placeholder="Oder URL einfügen…"
                  v-model="urlInputs[`${animal.name}__${field.key}`]"
                  class="url-input"
                />
                <button
                  class="url-save-btn"
                  :disabled="!urlInputs[`${animal.name}__${field.key}`]"
                  @click="saveUrl(animal.name, field.key)"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="admin-actions">
        <button class="action-btn" @click="doExport">Fotos exportieren (JSON)</button>
        <label class="action-btn import-btn">
          Fotos importieren (JSON)
          <input type="file" accept=".json" @change="doImport" />
        </label>
      </div>
    </template>

    <template v-else>
      <AdminNotesModeration :admin-password="adminPassword" :animal-info="animalInfo" />
    </template>

    <button class="back-button" @click="$emit('back')">← Zurück</button>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { pigProfiles } from '../data/pigIdentifier.js';
import AdminNotesModeration from './AdminNotesModeration.vue';
import {
  PHOTO_FIELDS,
  getTraitPhoto,
  setTraitPhoto,
  setTraitDescription,
  removeTraitPhoto as removeEntry,
  resizeImageFile,
  exportPhotosJSON,
  importPhotosJSON
} from '../composables/useAdminPhotos.js';

const props = defineProps({
  animalInfo: { type: Object, required: true },
  adminPassword: { type: String, default: '' }
});

defineEmits(['back', 'lock']);

const filter = ref('missing');
const activeTab = ref('notes');
const expanded = reactive({});
const urlInputs = reactive({});
const refreshKey = ref(0);

function getAnimalImage(name) {
  return props.animalInfo[name]?.image_url || '';
}

function toggleExpand(name) {
  expanded[name] = !expanded[name];
}

const allAnimals = computed(() => {
  void refreshKey.value;
  return pigProfiles.map((pig) => {
    const fields = PHOTO_FIELDS.map((field) => ({
      ...field,
      entry: getTraitPhoto(pig.name, field.key)
    }));
    const count = fields.filter((field) => field.entry).length;
    return { name: pig.name, fields, doneCount: count };
  });
});

const filteredAnimals = computed(() => {
  if (filter.value === 'all') return allAnimals.value;
  if (filter.value === 'missing') return allAnimals.value.filter((animal) => animal.doneCount < animal.fields.length);
  if (filter.value === 'done') return allAnimals.value.filter((animal) => animal.doneCount > 0);
  return allAnimals.value;
});

const missingCount = computed(() =>
  allAnimals.value.filter((animal) => animal.doneCount < animal.fields.length).length
);

const doneCount = computed(() =>
  allAnimals.value.filter((animal) => animal.doneCount > 0).length
);

async function handleFileUpload(event, pigName, fieldKey) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const base64 = await resizeImageFile(file);
    setTraitPhoto(pigName, fieldKey, base64);
    refreshKey.value++;
  } catch (err) {
    alert(`Fehler beim Verarbeiten des Bildes: ${err.message}`);
  }
}

function saveUrl(pigName, fieldKey) {
  const key = `${pigName}__${fieldKey}`;
  const url = urlInputs[key];

  if (!url) return;

  setTraitPhoto(pigName, fieldKey, url);
  urlInputs[key] = '';
  refreshKey.value++;
}

function updateDescription(event, pigName, fieldKey) {
  setTraitDescription(pigName, fieldKey, event.target.value);
  refreshKey.value++;
}

function removePhoto(pigName, fieldKey) {
  removeEntry(pigName, fieldKey);
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
  reader.onload = (loadEvent) => {
    if (importPhotosJSON(loadEvent.target.result)) {
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

.admin-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: .75rem;
  margin-bottom: .9rem;
  padding: .9rem;
  border: 1px solid #eadfd8;
  border-radius: 12px;
  background:
    radial-gradient(circle at top right, rgba(66, 165, 245, .15), transparent 34%),
    linear-gradient(180deg, #fffdf8, #f8f4ef);
}

.admin-kicker {
  margin: 0 0 .15rem;
  font-size: .74rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: #8d6e63;
}

.admin-title {
  margin: 0;
  font-size: 1.2rem;
  color: #3e2723;
}

.admin-hint,
.panel-copy {
  margin: .35rem 0 0;
  font-size: .84rem;
  line-height: 1.45;
  color: #6d4c41;
}

.tab-row {
  display: flex;
  gap: .4rem;
  margin-bottom: .85rem;
}

.tab-btn,
.filter-btn,
.action-btn,
.back-button,
.lock-btn {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background .15s ease, transform .1s ease, color .15s ease;
}

.tab-btn {
  flex: 1;
  padding: .55rem .7rem;
  background: #f4ece7;
  color: #6d4c41;
  font-size: .84rem;
  font-weight: 700;
}

.tab-btn.active {
  background: #3e2723;
  color: #fffaf5;
}

.panel-section {
  margin-bottom: .85rem;
  padding: .85rem;
  border: 1px solid #eee4de;
  border-radius: 12px;
  background: #fffdfa;
}

.section-title,
.section-label {
  margin: 0 0 .35rem;
  font-size: .95rem;
  color: #3e2723;
}

.metrics-grid,
.proposal-grid,
.phase-list {
  display: grid;
  gap: .6rem;
}

.metrics-grid,
.proposal-grid {
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
}

.metric-card,
.proposal-card,
.phase-card,
.security-card {
  padding: .75rem;
  border: 1px solid #f0e7e1;
  border-radius: 10px;
  background: linear-gradient(180deg, #fff, #fbf7f3);
}

.metric-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 800;
  color: #ec407a;
}

.metric-label,
.proposal-title,
.phase-title {
  display: block;
  margin-top: .15rem;
  font-size: .85rem;
  font-weight: 700;
  color: #3e2723;
}

.metric-copy,
.proposal-copy,
.phase-copy,
.security-copy {
  margin: .25rem 0 0;
  font-size: .8rem;
  line-height: 1.45;
  color: #6d4c41;
}

.bullet-list {
  margin: 0;
  padding-left: 1rem;
  color: #5d4037;
}

.bullet-list li {
  margin-bottom: .4rem;
  font-size: .82rem;
  line-height: 1.45;
}

.schema-block {
  margin: .55rem 0 0;
  padding: .75rem;
  border-radius: 10px;
  background: #2b211d;
  color: #fff7ef;
  font-size: .74rem;
  line-height: 1.45;
  overflow-x: auto;
}

.admin-filter,
.admin-actions {
  display: flex;
  gap: .4rem;
}

.admin-filter {
  margin-bottom: .75rem;
}

.filter-btn,
.action-btn {
  flex: 1;
  padding: .5rem;
  background: #fff;
  border: 1px solid #ddd;
  color: #5d4037;
  font-size: .8rem;
}

.filter-btn.active {
  background: #f48fb1;
  border-color: #f48fb1;
  color: #fff;
}

.animal-block {
  margin-bottom: .55rem;
  border: 1px solid #f8bbd0;
  border-radius: 10px;
  overflow: hidden;
}

.animal-header {
  display: flex;
  align-items: center;
  gap: .55rem;
  padding: .55rem;
  cursor: pointer;
  background: linear-gradient(135deg, #fdf5f9, #fce4ec);
}

.admin-thumb {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f8bbd0;
}

.animal-status {
  margin-left: auto;
  font-size: .8rem;
  color: #8d6e63;
}

.expand-icon {
  font-size: .8rem;
  color: #8d6e63;
}

.trait-list {
  display: flex;
  flex-direction: column;
  gap: .4rem;
  padding: .35rem .5rem .5rem;
}

.trait-row {
  padding: .45rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, .7);
}

.trait-info {
  display: flex;
  align-items: center;
  gap: .45rem;
}

.trait-body {
  flex: 1;
}

.trait-label {
  display: block;
  font-size: .76rem;
  font-weight: 700;
  color: #3e2723;
}

.trait-hint {
  display: block;
  font-size: .69rem;
  line-height: 1.25;
  color: #8d6e63;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.done { background: #66bb6a; }
.status-dot.missing { background: #ef5350; }

.photo-preview {
  display: flex;
  align-items: flex-start;
  gap: .5rem;
  margin-top: .35rem;
}

.preview-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 6px;
  flex-shrink: 0;
}

.preview-details {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: .25rem;
}

.desc-input,
.url-input {
  width: 100%;
  padding: .35rem .45rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: .8rem;
  color: #333;
  background: #fff;
}

.remove-btn {
  align-self: flex-start;
  padding: .22rem .45rem;
  border: 1px solid #ef5350;
  border-radius: 4px;
  background: transparent;
  color: #ef5350;
  font-size: .72rem;
  cursor: pointer;
}

.upload-controls {
  margin-top: .35rem;
}

.upload-btn {
  display: block;
  width: 100%;
  padding: .45rem;
  border: 1px dashed #66bb6a;
  border-radius: 6px;
  background: #e8f5e9;
  text-align: center;
  font-size: .8rem;
  color: #2e7d32;
  cursor: pointer;
}

.upload-btn input,
.import-btn input {
  display: none;
}

.url-input-row {
  display: flex;
  gap: .3rem;
  margin-top: .3rem;
}

.url-save-btn {
  padding: .35rem .6rem;
  border: none;
  border-radius: 5px;
  background: #42a5f5;
  color: #fff;
  font-size: .8rem;
  cursor: pointer;
}

.url-save-btn:disabled {
  opacity: .45;
  cursor: default;
}

.security-status {
  margin: 0;
  font-size: .85rem;
  font-weight: 700;
}

.security-status.ok { color: #2e7d32; }
.security-status.warn { color: #ef6c00; }
.security-status.error { color: #c62828; }

.lock-btn {
  padding: .6rem .8rem;
  background: #5d4037;
  color: #fff;
  font-size: .82rem;
  font-weight: 700;
  white-space: nowrap;
}

.lock-btn.secondary {
  margin-top: .65rem;
  background: #6d4c41;
}

.back-button {
  width: 100%;
  margin-top: .75rem;
  padding: .68rem;
  background: #d1c4e9;
  color: #4527a0;
  font-size: .9rem;
  font-weight: 700;
}

.tab-btn:active,
.filter-btn:active,
.action-btn:active,
.back-button:active,
.lock-btn:active {
  transform: scale(.98);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 520px) {
  .admin-hero {
    flex-direction: column;
  }

  .metrics-grid,
  .proposal-grid {
    grid-template-columns: 1fr;
  }
}
</style>
