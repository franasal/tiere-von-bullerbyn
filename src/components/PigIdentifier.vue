// AnimalIdentifier.vue
<template>
  <div class="container">
    <div v-if="!selectedAnimal">
      <h1>🐾 Tiere von Veganien identifizieren</h1>
      <div class="animal-options">
        <button
          v-for="animal in availableSpecies"
          :key="animal"
          @click="selectAnimal(animal)"
        >
          {{ formatSpecies(animal) }}
        </button>
      </div>
    </div>

    <div v-else>
      <h1>
  <template v-if="selectedAnimal === 'pigs'">🐖 {{ formatSpecies(selectedAnimal) }} 🐗</template>
  <template v-else>{{ formatSpecies(selectedAnimal) }} 🐾</template>
</h1>


<!-- Ergebnisansicht -->
<div v-if="currentNode && currentNode.result">
  <h2>Gefunden: {{ currentNode.result }}</h2>
  <div class="result-card">
    <img
      :src="getAnimalImage(currentNode.result)"
      :alt="`Bild von ${currentNode.result}`"
      class="animal-image"
    />
    <div class="animal-info">
      <p><strong>Erscheinung:</strong> {{ getAppearance(currentNode.result) }}</p>
      <p><strong>Geschichte:</strong> {{ getStory(currentNode.result) }}</p>
    </div>
  </div>
</div>

<!-- Entscheidungsbaum -->
<div v-else-if="currentNode">
  <div class="question-box">
    <p class="question">{{ currentNode.question }}</p>
  </div>
  <div class="options">
    <button
      v-for="(branch, option) in currentNode.options"
      :key="option"
      class="option-button"
      @click="advance(option)"
    >
      {{ formatLabel(option) }}
    </button>
  </div>
</div>

<!-- Navigations-Buttons (immer unten, unterhalb von Ergebnis oder Baum) -->
<div v-if="selectedAnimal" class="navigation-buttons">
  <template v-if="path.length > 0">
    <button class="back-button" @click="goBack">← Zurück</button>
    <button class="reset-button" @click="reset">🏠 Start</button>
  </template>
  <template v-else>
    <button class="reset-button full-width" @click="reset">🏠 Start</button>
  </template>
</div>


    </div>
  </div>
</template>

<script>

import Papa from 'papaparse';

export default {
  name: 'AnimalIdentifier',
  data() {
    return {
      animalDataUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRSwkMhkHBGiBOUD8ls5SLwKzJxYf0-R0FNcyqHM6hOR4Ftvb62um8QfrwC77VWEoxatrkJV6GRcySP/pub?output=csv',
      decisionTrees: {},
      animalInfo: {},
      currentNode: null,
      path: [],
      selectedAnimal: null,
      availableSpecies: []
    }
  },
  async mounted() {
    await this.loadAnimalInfo();
    await this.loadDecisionTrees();
  },
  methods: {

async loadAnimalInfo() {
  const res = await fetch(this.animalDataUrl);
  const csvText = await res.text();

  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true
  });

  const info = {};
  const speciesSet = new Set();

  parsed.data.forEach(row => {
    const name = row.name?.trim();
    const rawSpecies = row.species?.trim().toLowerCase();

    let species = rawSpecies;
    if (rawSpecies === 'pig' || rawSpecies === 'wild_boar') {
      species = 'pigs';
    }

    if (name) {
      info[name] = row;
      speciesSet.add(species);
    }
  });

  this.animalInfo = info;
  this.availableSpecies = Array.from(speciesSet);
}
,

    async loadDecisionTrees() {
      for (const species of this.availableSpecies) {
        try {
          const tree = await import(`../assets/trees/${species}.json`);
          this.decisionTrees[species] = tree.default;
        } catch (err) {
          console.warn(`Kein Entscheidungsbaum für ${species} gefunden.`);
        }
      }
    },

    selectAnimal(species) {
      this.selectedAnimal = species;
      const tree = this.decisionTrees[species];
if (tree) {
  this.currentNode = tree;
} else {
  console.warn(`Kein Baum für ${species}`);
  this.currentNode = null;
}

      this.path = [];
    },

    advance(option) {
      this.path.push(option);
      this.currentNode = this.currentNode.options[option];
    },

    reset() {
      this.selectedAnimal = null;
      this.currentNode = null;
      this.path = [];
    },

    goBack() {
      if (!this.path.length) return;
      this.path.pop();
      let node = this.decisionTrees[this.selectedAnimal];
      for (const step of this.path) {
        node = node.options[step];
      }
      this.currentNode = node;
    },

    getAnimalImage(name) {
      return this.animalInfo[name]?.image_url || 'https://veganbullerbyn.de/wp-content/uploads/2024/07/MG_0979-6.jpg';
    },

    getAppearance(name) {
      return this.animalInfo[name]?.appearance_description || '';
    },

    getStory(name) {
      return this.animalInfo[name]?.general_description || '';
    },

    formatSpecies(key) {
      const map = {
        pigs: 'Schweine',
        cow: 'Kuh',
        goat: 'Ziege'
      };
      return map[key] || key;
    },

    formatLabel(option) {
      const map = {
        '': 'Keine',
        left: 'Links',
        right: 'Rechts',
        hängend: 'Hängend',
        normal: 'Normal',
        ohne_spitzen: 'Ohne Spitzen',
        short: 'Kurz',
        long_with_hair: 'Lang mit Haaren',
        long_without_hair: 'Lang ohne Haare',
        flecken_gesicht: 'Flecken im Gesicht',
        flecken_genau_abgegrenzt: 'Flecken abgegrenzt',
        grau_rücken: 'Grau am Rücken',
        komplett_gefleckt: 'Komplett gefleckt',
        rosa: 'Rosa',
        halb_schwarz_rosa_klein: 'Halb schwarz, halb rosa',
        schwarz_weiss_borsten_groß: 'Schwarz/weiße Borsten (groß)',
        stoßzähne_buckel_helle_borsten: 'Stoßzähne + Buckel + helle Borsten',
        nur_schwarz_borsten_im_nacken: 'Schwarz + Borsten im Nacken'
      };
      return map[option] || option;
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 500px;
  margin: 2rem auto;
  font-family: sans-serif;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  color: #212121;
}

.question-box {
  background-color: #fce4ec;
  border: 1px solid #f8bbd0;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.question {
  font-weight: bold;
  margin: 0;
}

.option-button,
.back-button,
.reset-button {
  display: block;
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.option-button {
  background-color: #f48fb1;
  color: #212121;
}
.option-button:hover {
  background-color: #ec407a;
  color: white;
}

.back-button {
  background-color: #d1c4e9;
  color: #4527a0;
}
.back-button:hover {
  background-color: #b39ddb;
  color: white;
}

.reset-button {
  background-color: #b0bec5;
  color: #37474f;
}
.reset-button:hover {
  background-color: #90a4ae;
  color: white;
}

.animal-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #fdf5f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.animal-image {
  max-width: 100%;
  max-height: 280px;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.animal-info {
  text-align: center;
  color: #212121;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

.animal-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.animal-options button {
  background-color: #ffccbc;
  color: #5d4037;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.animal-options button:hover {
  background-color: #ffab91;
  color: white;
}
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}

.navigation-buttons button {
  flex: 1;
}
.full-width {
  width: 100%;
}
</style>
