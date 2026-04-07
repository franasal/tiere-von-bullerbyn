<template>
  <div class="admin">
    <div class="admin-hero">
      <div>
        <p class="admin-kicker">Admin Workspace</p>
        <h2 class="admin-title">Tierdaten, Merkmale und Spiele verwalten</h2>
        <p class="admin-hint">
          Der bisherige Foto-Workflow bleibt erhalten. Zusaetzlich zeigt dieses Panel,
          wie die App auf beliebig viele Tiergruppen erweitert werden sollte.
        </p>
      </div>
      <button class="lock-btn" @click="$emit('lock')">Sperren</button>
    </div>

    <div class="tab-row">
      <button
        :class="['tab-btn', { active: activeTab === 'overview' }]"
        @click="activeTab = 'overview'"
      >
        Struktur
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'photos' }]"
        @click="activeTab = 'photos'"
      >
        Fotos
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'security' }]"
        @click="activeTab = 'security'"
      >
        Sicherheit
      </button>
    </div>

    <template v-if="activeTab === 'overview'">
      <section class="panel-section">
        <h3 class="section-title">Bestandsaufnahme</h3>
        <div class="metrics-grid">
          <article v-for="card in reviewCards" :key="card.label" class="metric-card">
            <span class="metric-value">{{ card.value }}</span>
            <span class="metric-label">{{ card.label }}</span>
            <p class="metric-copy">{{ card.copy }}</p>
          </article>
        </div>
      </section>

      <section class="panel-section">
        <h3 class="section-title">Was heute schon gut funktioniert</h3>
        <ul class="bullet-list">
          <li v-for="item in strengths" :key="item">{{ item }}</li>
        </ul>
      </section>

      <section class="panel-section">
        <h3 class="section-title">Warum die aktuelle Struktur nicht skaliert</h3>
        <ul class="bullet-list">
          <li v-for="item in scaleBlockers" :key="item">{{ item }}</li>
        </ul>
      </section>

      <section class="panel-section">
        <h3 class="section-title">Empfohlene Admin-Module</h3>
        <div class="proposal-grid">
          <article v-for="module in adminModules" :key="module.title" class="proposal-card">
            <p class="proposal-title">{{ module.title }}</p>
            <p class="proposal-copy">{{ module.copy }}</p>
          </article>
        </div>
      </section>

      <section class="panel-section">
        <h3 class="section-title">Vorgeschlagenes Datenmodell</h3>
        <p class="panel-copy">
          Statt harter `pigProfiles` und `pigQuestions` braucht die App ein generisches
          Content-Modell, das Tiergruppen, Merkmale, Tiere, Entscheidungsbäume und
          Spielvarianten versioniert speichert.
        </p>
        <pre class="schema-block">{{ proposedSchema }}</pre>
      </section>

      <section class="panel-section">
        <h3 class="section-title">Umsetzungsphasen</h3>
        <div class="phase-list">
          <article v-for="phase in rolloutPhases" :key="phase.title" class="phase-card">
            <p class="phase-title">{{ phase.title }}</p>
            <p class="phase-copy">{{ phase.copy }}</p>
          </article>
        </div>
      </section>
    </template>

    <template v-else-if="activeTab === 'photos'">
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

      <div class="helper-section">
        <h3 class="section-label">Helfer einladen</h3>
        <p class="helper-desc">
          Teile diesen Link mit Helfer:innen. Sie sehen, welche Fotos fehlen,
          können direkt fotografieren und die Bilder weiterleiten.
        </p>
        <div class="helper-link-row">
          <input
            type="text"
            readonly
            :value="helperUrl"
            class="helper-link-input"
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

      <div class="admin-actions">
        <button class="action-btn" @click="doExport">Fotos exportieren (JSON)</button>
        <label class="action-btn import-btn">
          Fotos importieren (JSON)
          <input type="file" accept=".json" @change="doImport" />
        </label>
      </div>
    </template>

    <template v-else>
      <section class="panel-section">
        <h3 class="section-title">Passwortschutz</h3>
        <p class="panel-copy">
          Das Panel ist jetzt per Passwortgate geschützt und merkt sich die Freigabe für
          die aktuelle Browser-Sitzung.
        </p>
        <div class="security-card">
          <p :class="['security-status', securityStatusClass]">{{ securityStatus }}</p>
          <p class="security-copy">
            Empfehlung: `VITE_ADMIN_PASSWORD` in der Deployment-Umgebung setzen. Das ist
            für eine statische Vue-App ein sinnvoller Basisschutz, aber kein Ersatz für
            serverseitige Authentifizierung.
          </p>
          <p v-if="securityInfo.usesFallback" class="security-copy">
            Aktuell läuft der Entwicklungs-Fallback `{{ securityInfo.devFallbackPassword }}`.
          </p>
          <p class="security-copy">
            Wenn ihr später echte Bearbeitung, Teamzugriff und Publizieren braucht, sollte
            das Admin Panel an ein Backend mit Accounts, Rollen und Versionierung angeschlossen werden.
          </p>
          <button class="lock-btn secondary" @click="$emit('lock')">Admin jetzt sperren</button>
        </div>
      </section>
    </template>

    <button class="back-button" @click="$emit('back')">← Zurück</button>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { pigProfiles, pigQuestions } from '../data/pigIdentifier.js';
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
  securityInfo: { type: Object, required: true }
});

const emit = defineEmits(['back', 'openHelper', 'lock']);

const strengths = [
  'Der Startscreen und die Tierdaten aus `animals.json` sind bereits als Inhaltsquelle angelegt.',
  'Die Schweine-Identifikation ist spielerisch stark: Kandidatenfilter, Vergleichsansicht und Profilkarten sind schon da.',
  'Es gibt schon einen versteckten Admin-Einstieg und einen separaten Helfer-Modus für Foto-Sammlungen.',
  'Import und Export laufen lokal bereits über JSON und bilden einen guten Start für spätere Publish-Workflows.'
];

const scaleBlockers = [
  'Die eigentliche Spiellogik ist fest in `pigIdentifier.js` und `pigTraitAnalysis.js` verdrahtet. Neue Tiergruppen können nicht im Admin angelegt werden.',
  'Die Daten sind auf mehrere Formate verteilt: Tabellen-Spiegel in `animals.json`, harte Trait-Definitionen im Code und Foto-Slots nur in `localStorage`.',
  'Andere Arten sind im Ladepfad vorgesehen, aber es gibt noch keinen generischen Editor für Traits, Fragen, Bäume oder Spielregeln.',
  'Die aktuellen 3 Foto-Felder gelten für alle Tiere gleich, obwohl andere Tiergruppen andere Referenzbilder brauchen werden.'
];

const adminModules = [
  {
    title: '1. Tiergruppen',
    copy: 'Gruppen wie Schweine, Ziegen, Schafe oder Hühner anlegen. Jede Gruppe bekommt Label, Bildstil, Sortierung und einen aktiven Status.'
  },
  {
    title: '2. Merkmalsbibliothek',
    copy: 'Traits als strukturierte Felder pflegen: Typ, Frage, Optionen, Icons, Hilfetexte, Pflichtgrad und ob sie für Fotos oder Spiele genutzt werden.'
  },
  {
    title: '3. Tierprofile',
    copy: 'Einzelne Tiere pro Gruppe verwalten: Stammdaten, Story, Bild, Trait-Werte, Medien und Freigabestatus.'
  },
  {
    title: '4. Entscheidungsbaum-Builder',
    copy: 'Fragen per Drag-and-drop oder Listenlogik aufbauen, Knoten testen, Konflikte anzeigen und aus Trait-Daten automatisch Vorschlaege generieren.'
  },
  {
    title: '5. Spiele-Modi',
    copy: 'Nicht nur Identifikation, sondern auch Quiz-, Vergleichs- und Lernspiele pro Tiergruppe konfigurieren, inklusive Schwierigkeit und Frageauswahl.'
  },
  {
    title: '6. Medien und Publishing',
    copy: 'Fotos, Referenzbilder, Export, Import, Versionen und später Freigabe nach Produktion an einer Stelle sammeln.'
  }
];

const rolloutPhases = [
  {
    title: 'Phase 1: Datenmodell entkoppeln',
    copy: 'Pig-spezifische Konstanten in ein generisches Registry-Modell überführen: groups, traits, animals, trees und gameModes.'
  },
  {
    title: 'Phase 2: Admin CRUD',
    copy: 'Masken für Tiergruppen, Traits und Tierprofile bauen. Erst danach lohnt sich ein visueller Tree-Builder.'
  },
  {
    title: 'Phase 3: Tree und Game Builder',
    copy: 'Aus dem generischen Modell Entscheidungsbäume und Spielkonfigurationen erzeugen, validieren und in der Vorschau testen.'
  },
  {
    title: 'Phase 4: Backend und Rollen',
    copy: 'Wenn mehrere Personen Inhalte pflegen, braucht das Projekt ein Backend mit Auth, Versionshistorie und Publikationsstufen.'
  }
];

const proposedSchema = `{
  "groups": [
    {
      "id": "pigs",
      "label": "Schweine",
      "mediaSlots": ["ears", "tail", "special"],
      "gameModes": ["identify", "compare", "quiz"]
    }
  ],
  "traits": [
    {
      "groupId": "pigs",
      "key": "earMark",
      "label": "Ohrmarke",
      "input": "single-select",
      "options": ["left", "right", "none"],
      "question": "Wo ist eine Ohrmarke sichtbar?"
    }
  ],
  "animals": [
    {
      "groupId": "pigs",
      "name": "Hedda",
      "profile": { "imageUrl": "...", "story": "..." },
      "traitValues": { "earMark": "left", "tailType": "long_hairy" }
    }
  ],
  "trees": [
    {
      "groupId": "pigs",
      "version": 1,
      "nodes": [{ "traitKey": "pigType", "mode": "binary" }]
    }
  ],
  "gameModes": [
    {
      "groupId": "pigs",
      "type": "identify",
      "treeVersion": 1
    }
  ]
}`;

const copied = ref(false);
const filter = ref('missing');
const activeTab = ref('overview');
const expanded = reactive({});
const urlInputs = reactive({});
const refreshKey = ref(0);

const helperUrl = computed(() => {
  const url = new URL(window.location.href);
  url.search = '?helper';
  return url.toString();
});

const rawSpecies = computed(() =>
  Array.from(
    new Set(
      Object.values(props.animalInfo)
        .map((animal) => animal?.species)
        .filter(Boolean)
    )
  )
);

const reviewCards = computed(() => [
  {
    label: 'Tiere im Spiegel',
    value: Object.keys(props.animalInfo).length,
    copy: 'Datensaetze aus `animals.json` bzw. Google Sheet.'
  },
  {
    label: 'Rohe Arten im Quellfeed',
    value: rawSpecies.value.length,
    copy: rawSpecies.value.join(', ') || 'Noch keine'
  },
  {
    label: 'Pig Profiles im Code',
    value: pigProfiles.length,
    copy: 'Diese Tiere sind aktuell fest im Entscheidungsmodell verdrahtet.'
  },
  {
    label: 'Harte Fragen im Code',
    value: pigQuestions.length,
    copy: 'Neue Fragen können bisher nicht ohne Codeänderung gepflegt werden.'
  }
]);

const securityStatus = computed(() => {
  if (props.securityInfo.source === 'env') {
    return 'Produktions-Passwort aktiv';
  }
  if (props.securityInfo.source === 'dev-fallback') {
    return 'Entwicklungs-Fallback aktiv';
  }
  return 'Kein Passwort konfiguriert';
});

const securityStatusClass = computed(() => {
  if (props.securityInfo.source === 'env') return 'ok';
  if (props.securityInfo.source === 'dev-fallback') return 'warn';
  return 'error';
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
.copy-btn,
.share-helper-btn,
.open-helper-btn,
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
.helper-desc,
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
.admin-actions,
.helper-link-row {
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
.url-input,
.helper-link-input {
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

.helper-section {
  margin-top: .8rem;
  padding: .75rem;
  border: 1px solid #90caf9;
  border-radius: 10px;
  background: #e3f2fd;
}

.helper-link-row {
  margin-bottom: .4rem;
}

.copy-btn {
  padding: .35rem .6rem;
  background: #42a5f5;
  color: #fff;
  font-size: .78rem;
  white-space: nowrap;
}

.share-helper-btn,
.open-helper-btn {
  width: 100%;
  padding: .52rem;
  font-size: .84rem;
  font-weight: 700;
}

.share-helper-btn {
  margin-top: .25rem;
  background: #42a5f5;
  color: #fff;
}

.open-helper-btn {
  margin-top: .35rem;
  background: transparent;
  border: 1px solid #90caf9;
  color: #1565c0;
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
.copy-btn:active,
.share-helper-btn:active,
.open-helper-btn:active,
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
