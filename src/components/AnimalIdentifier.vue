<template>
  <div class="container">
    <AnimalStart
      v-if="!selectedAnimal"
      :available-species="availableSpecies"
      @select="selectAnimal"
    />

    <div v-else>
      <h1>
        <template v-if="selectedAnimal === 'pigs'">🐖 {{ formatSpecies(selectedAnimal) }} 🐗</template>
        <template v-else>{{ formatSpecies(selectedAnimal) }} 🐾</template>
      </h1>

      <!-- Trail of chosen options -->
      <ChoicesTrail :steps="steps" @removeLast="goBack" />

      <template v-if="resultName">
  <h2>Gefunden: {{ resultName }}</h2>
  <ResultCard
    :name="resultName"
    :image-url="getAnimalImage(resultName)"
    :appearance="getAppearance(resultName)"
    :story="getStory(resultName)"
  />
  <div class="navigation-buttons">
    <button class="back-button" @click="goBack">← Zurück</button>
    <button class="reset-button" @click="reset">Start</button>
  </div>
</template>

<DecisionTree
  v-else
  :current-node="currentNode"
  :path="path"
  :show-nav="true"
  @advance="advance"
  @back="goBack"
  @reset="reset"
/>

    </div>
  </div>
</template>

<script>
import AnimalStart from './AnimalStart.vue';
import DecisionTree from './DecisionTree.vue';
import ResultCard from './ResultCard.vue';
import ChoicesTrail from './ChoicesTrail.vue';

import {
  loadFromLocalMirror,
  loadFromCache,
  saveCache,
  fetchFromGoogle
} from '../composables/useAnimalData.js';

export default {
  name: 'AnimalIdentifier',
  components: { AnimalStart, DecisionTree, ResultCard, ChoicesTrail },
  data() {
    return {
      animalDataUrl:
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vRSwkMhkHBGiBOUD8ls5SLwKzJxYf0-R0FNcyqHM6hOR4Ftvb62um8QfrwC77VWEoxatrkJV6GRcySP/pub?output=csv',
      decisionTrees: {},
      animalInfo: {},
      currentNode: null,
      path: [],
      steps: [], // [{question, optionKey, optionLabel}]
      selectedAnimal: null,
      availableSpecies: [],
      loading: true,
      resultName: null,
    };
    
  },
  async mounted() {
    const cached = loadFromCache();
    if (cached) {
      this.animalInfo = cached.info;
      this.availableSpecies = cached.species;
      this.loading = false;
      this.$nextTick(() => this.backgroundRefresh());
    } else {
      const local = await loadFromLocalMirror();
      this.animalInfo = local.info;
      this.availableSpecies = local.species;
      this.loading = false;
      this.$nextTick(() => this.backgroundRefresh());
    }

    await this.loadDecisionTrees();
  },
  methods: {
    async backgroundRefresh() {
      try {
        const fresh = await fetchFromGoogle(this.animalDataUrl);
        if (Object.keys(fresh.info).length) {
          this.animalInfo = fresh.info;
          this.availableSpecies = fresh.species;
          saveCache(fresh.info, fresh.species);
          await this.loadDecisionTrees();
        }
      } catch (e) {
        console.warn('Google refresh failed:', e?.message || e);
      }
    },

    async loadDecisionTrees() {
      this.decisionTrees = {};
      for (const species of this.availableSpecies) {
        try {
          const tree = await import(`../assets/trees/${species}.json`);
          this.decisionTrees[species] = tree.default;
        } catch {
          console.warn(`Kein Entscheidungsbaum für ${species} gefunden.`);
        }
      }
    },

    selectAnimal(species) {
      this.selectedAnimal = species;
      const tree = this.decisionTrees[species];
      this.currentNode = tree || null;
      this.path = [];
      this.steps = [];
    },

    advance(option, branch) {
    if (!this.currentNode) return;

    // record step for the trail
    const optionLabel = this.formatLabel(option);
    const questionText = typeof this.currentNode === 'object' ? this.currentNode.question : '';
    this.steps.push({ question: questionText, optionKey: option, optionLabel });

      // Move to next
      this.path.push(option);
      const next = branch ?? null;

       // Leaf? accept both string or { result: '...' }
       if (typeof next === 'string') {
    this.resultName = next;
    this.currentNode = null;
  } else if (next && typeof next === 'object' && 'result' in next) {
    this.resultName = next.result;
    this.currentNode = null;
  } else {
    this.currentNode = next;
  }
},
    reset() {
      this.selectedAnimal = null;
      this.currentNode = null;
      this.path = [];
      this.steps = [];
      this.resultName = null;
    },

    goBack() {
      if (!this.path.length) return;
      this.path.pop();
      this.steps.pop();
      this.resultName = null;

      let node = this.decisionTrees[this.selectedAnimal];
      for (const step of this.path) {
        const next = node.options?.[step];
        node = (typeof next === 'string') ? { result: next } : next;
      }
      this.currentNode = node;
    },

    getAnimalImage(name) {
      return (
        this.animalInfo[name]?.image_url ||
        'https://veganbullerbyn.de/wp-content/uploads/2024/07/MG_0979-6.jpg'
      );
    },
    getAppearance(name) {
      return this.animalInfo[name]?.appearance_description || '';
    },
    getStory(name) {
      return this.animalInfo[name]?.general_description || '';
    },

    formatSpecies(key) {
      const map = { pigs: 'Schweine', cow: 'Kuh', goat: 'Ziege' };
      return map[key] || key;
    },
    formatLabel(option) {
      const map = {
        '': 'Keine', left: 'Links', right: 'Rechts',
        'hängend': 'Hängend', normal: 'Normal', 'ohne_spitzen': 'Ohne Spitzen',
        short: 'Kurz', long_with_hair: 'Lang mit Haaren', long_without_hair: 'Lang ohne Haare',
        flecken_gesicht: 'Flecken im Gesicht', flecken_genau_abgegrenzt: 'Flecken abgegrenzt',
        grau_rücken: 'Grau am Rücken', komplett_gefleckt: 'Komplett gefleckt', rosa: 'Rosa',
        halb_schwarz_rosa_klein: 'Halb schwarz, halb rosa', schwarz_weiss_borsten_groß: 'Schwarz/weiße Borsten (groß)',
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

/* --- match the original button styles --- */
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

/* primary options (same as before) */
.option-button {
  background-color: #f48fb1;
  color: #212121;
}
.option-button:hover {
  background-color: #ec407a;
  color: #fff;
}

/* back button (purple family) */
.back-button {
  background-color: #d1c4e9;
  color: #4527a0;
}
.back-button:hover {
  background-color: #b39ddb;
  color: #fff;
}

/* reset/home button (grey family) */
.reset-button {
  background-color: #b0bec5;
  color: #37474f;
}
.reset-button:hover {
  background-color: #90a4ae;
  color: #fff;
}

/* layout for the nav row shown in the result view */
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}
.navigation-buttons button {
  flex: 1;
}

/* keep start-screen styles for AnimalStart look */
:deep(.start-screen) { display: flex; flex-direction: column; align-items: center; text-align: center; }
:deep(.start-logo) { max-width: 30%; height: auto; margin-bottom: 1rem; }
:deep(.start-title) { font-size: 1.8rem; line-height: 1.4; margin-bottom: 0.5rem; text-align: center; }
:deep(.subtitle) { display: block; padding-left: 1.5rem; }
:deep(.subtitle2) { font-size: 1.8rem; display: block; }
/* AnimalStart peach buttons */
:deep(.animal-options) { display: flex; flex-direction: column; gap: .5rem; }
:deep(.animal-options button) {
  background-color: #ffccbc;
  color: #5d4037;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
:deep(.animal-options button:hover) {
  background-color: #ffab91;
  color: #fff;
}
</style>
