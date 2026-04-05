<!-- src/components/HelperMode.vue -->
<template>
  <div class="helper">
    <h2 class="helper-title">Foto-Helfer</h2>
    <p class="helper-hint">
      Wir brauchen Fotos von bestimmten Merkmalen der Tiere.
      Fotografiere das Merkmal und teile das Foto direkt.
    </p>

    <div class="helper-stats">
      <span class="stat">{{ totalMissing }} Fotos werden noch gebraucht</span>
    </div>

    <div v-for="animal in animalsWithMissing" :key="animal.name" class="animal-block">
      <div class="animal-header" @click="toggleExpand(animal.name)">
        <img :src="getAnimalImage(animal.name)" :alt="animal.name" class="helper-thumb" />
        <div class="header-text">
          <strong>{{ animal.name }}</strong>
          <span class="missing-count">{{ animal.missingTraits.length }} Fotos fehlen</span>
        </div>
        <span class="expand-icon">{{ expanded[animal.name] ? '▾' : '▸' }}</span>
      </div>

      <div v-if="expanded[animal.name]" class="trait-list">
        <div
          v-for="trait in animal.missingTraits"
          :key="trait.key"
          class="trait-card"
        >
          <div class="trait-header">
            <span class="trait-icon">{{ trait.icon }}</span>
            <div class="trait-text">
              <span class="trait-label">{{ trait.label }}</span>
              <span class="trait-value">{{ trait.valueLabel }}</span>
            </div>
          </div>
          <p class="trait-instruction">
            Fotografiere <strong>{{ animal.name }}</strong> so, dass
            <strong>{{ trait.valueLabel.toLowerCase() }}</strong> gut sichtbar ist.
          </p>

          <!-- Captured photo preview -->
          <div v-if="captured[`${animal.name}__${trait.key}`]" class="captured">
            <img :src="captured[`${animal.name}__${trait.key}`]" class="captured-img" />
            <div class="captured-actions">
              <button
                class="share-btn"
                @click="sharePhoto(animal.name, trait)"
              >
                Foto teilen
              </button>
              <button
                class="retake-btn"
                @click="clearCapture(animal.name, trait.key)"
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
              @change="handleCapture($event, animal.name, trait.key)"
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
import { getTraitKeysForPig } from '../data/pigTraitAnalysis.js';
import { getTraitPhoto, resizeImageFile } from '../composables/useAdminPhotos.js';

const props = defineProps({
  animalInfo: { type: Object, required: true }
});

defineEmits(['back']);

const expanded = reactive({});
const captured = reactive({});
const capturedFiles = reactive({});

function getAnimalImage(name) {
  return props.animalInfo[name]?.image_url || '';
}

function toggleExpand(name) {
  expanded[name] = !expanded[name];
}

const animalsWithMissing = computed(() => {
  return pigProfiles
    .map((pig) => {
      const traits = getTraitKeysForPig(pig.name);
      const missingTraits = traits.filter((t) => !getTraitPhoto(pig.name, t.key));
      return { name: pig.name, missingTraits };
    })
    .filter((a) => a.missingTraits.length > 0);
});

const totalMissing = computed(() =>
  animalsWithMissing.value.reduce((sum, a) => sum + a.missingTraits.length, 0)
);

async function handleCapture(event, pigName, traitKey) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const key = `${pigName}__${traitKey}`;
    const base64 = await resizeImageFile(file, 800, 0.8);
    captured[key] = base64;
    capturedFiles[key] = file;
  } catch (err) {
    alert('Fehler: ' + err.message);
  }
}

function clearCapture(pigName, traitKey) {
  const key = `${pigName}__${traitKey}`;
  delete captured[key];
  delete capturedFiles[key];
}

async function sharePhoto(pigName, trait) {
  const key = `${pigName}__${trait.key}`;
  const file = capturedFiles[key];
  const base64 = captured[key];

  const fileName = `${pigName}_${trait.key}.jpg`;
  const shareText = `Bullerbyn Foto: ${pigName} — ${trait.label}: ${trait.valueLabel}`;

  // Try native share with file
  if (navigator.share && file) {
    try {
      const shareFile = new File(
        [file],
        fileName,
        { type: file.type }
      );

      if (navigator.canShare && navigator.canShare({ files: [shareFile] })) {
        await navigator.share({
          title: shareText,
          text: shareText,
          files: [shareFile]
        });
        return;
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  // Try native share with text only
  if (navigator.share) {
    try {
      await navigator.share({
        title: shareText,
        text: shareText
      });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  // Fallback: download the image
  if (base64) {
    const a = document.createElement('a');
    a.href = base64;
    a.download = fileName;
    a.click();
    alert(`Foto gespeichert als "${fileName}". Bitte manuell teilen (WhatsApp, E-Mail, etc.)`);
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
  border-radius: 6px; padding: .4rem .6rem;
  margin-bottom: .75rem;
}
.stat { font-size: .85rem; font-weight: 600; color: #e65100; }

/* Animal blocks */
.animal-block {
  border: 1px solid #f8bbd0; border-radius: 8px;
  margin-bottom: .5rem; overflow: hidden;
}
.animal-header {
  display: flex; align-items: center; gap: .5rem;
  padding: .6rem; cursor: pointer;
  background: linear-gradient(135deg, #fdf5f9, #fce4ec);
}
.animal-header:hover { background: #fce4ec; }
.helper-thumb {
  width: 44px; height: 44px; border-radius: 50%;
  object-fit: cover; border: 2px solid #f8bbd0;
}
.header-text { flex: 1; }
.header-text strong { display: block; font-size: .95rem; color: #3e2723; }
.missing-count { font-size: .78rem; color: #e65100; }
.expand-icon { font-size: .8rem; color: #8d6e63; }

.trait-list {
  padding: .4rem .5rem .5rem;
  display: flex; flex-direction: column; gap: .5rem;
}

.trait-card {
  background: rgba(255,255,255,.8);
  border: 1px solid #f0f0f0;
  border-radius: 8px; padding: .6rem;
}
.trait-header {
  display: flex; align-items: center; gap: .4rem; margin-bottom: .3rem;
}
.trait-icon { font-size: 1.1rem; }
.trait-text { flex: 1; }
.trait-label {
  display: block; font-size: .65rem; color: #8d6e63;
  text-transform: uppercase; letter-spacing: .03em;
}
.trait-value { font-size: .88rem; font-weight: 600; color: #3e2723; }
.trait-instruction {
  font-size: .8rem; color: #5d4037; margin: .2rem 0 .4rem;
  line-height: 1.3;
}

/* Camera button */
.camera-btn {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: .7rem;
  background: #e3f2fd; border: 2px dashed #42a5f5;
  border-radius: 8px; text-align: center;
  font-size: .9rem; font-weight: 600; color: #1565c0;
  cursor: pointer;
  transition: background .15s ease;
}
.camera-btn:hover { background: #bbdefb; }
.camera-btn input { display: none; }

/* Captured preview */
.captured {
  display: flex; align-items: center; gap: .5rem;
  margin-top: .3rem;
}
.captured-img {
  width: 80px; height: 80px; object-fit: cover;
  border-radius: 8px; border: 2px solid #66bb6a;
}
.captured-actions {
  display: flex; flex-direction: column; gap: .3rem; flex: 1;
}
.share-btn {
  padding: .5rem; border: none; border-radius: 6px;
  background: #66bb6a; color: #fff;
  font-weight: bold; font-size: .85rem;
  cursor: pointer;
  transition: background .15s ease;
}
.share-btn:hover { background: #43a047; }
.retake-btn {
  padding: .35rem; border: 1px solid #bbb; border-radius: 6px;
  background: transparent; color: #777;
  font-size: .78rem; cursor: pointer;
}
.retake-btn:hover { background: #f5f5f5; }

.all-done {
  text-align: center; padding: 2rem 1rem;
  color: #2e7d32; font-weight: 600; font-size: 1rem;
}

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
