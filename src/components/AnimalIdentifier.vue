<template>
  <div class="container">
    <!-- Admin Mode -->
    <AdminMode
      v-if="adminMode && adminUnlocked"
      :animal-info="animalInfo"
      :security-info="adminSecurityInfo"
      @back="adminMode = false"
      @lock="lockAdminAccess"
      @openHelper="adminMode = false; helperMode = true"
    />

    <AdminAccessGate
      v-else-if="adminMode"
      :security-info="adminSecurityInfo"
      @back="adminMode = false"
      @unlock="handleAdminUnlock"
    />

    <!-- Helper Mode -->
    <HelperMode
      v-else-if="helperMode"
      :animal-info="animalInfo"
      @back="helperMode = false"
    />

    <!-- Start screen -->
    <AnimalStart
      v-else-if="appView === 'start'"
      :available-species="availableSpecies"
      @select="selectAnimal"
      @toggleAdmin="adminMode = !adminMode"
    />

    <!-- Gallery browse mode -->
    <AnimalGallery
      v-else-if="appView === 'gallery'"
      :animals="galleryAnimals"
      @showProfile="showProfile"
      @back="appView = 'identify'"
    />

    <!-- Animal profile (from gallery) -->
    <AnimalProfile
      v-else-if="appView === 'profile'"
      :name="profileAnimal"
      :image-url="getAnimalImage(profileAnimal)"
      :appearance="getAppearance(profileAnimal)"
      :story="getStory(profileAnimal)"
      :unique-traits="getUniqueTraitsFor(profileAnimal)"
      :similar-animals="getSimilarAnimalsFor(profileAnimal)"
      @back="appView = 'gallery'"
      @showProfile="showProfile"
    />

    <!-- Identification flow -->
    <div v-else-if="appView === 'identify'">
      <h1>
        <template v-if="selectedAnimal === 'pigs'">Schweine</template>
        <template v-else>{{ formatSpecies(selectedAnimal) }}</template>
      </h1>

      <ChoicesTrail :steps="steps" @undoTo="undoTo" />

      <div v-if="selectedAnimal === 'pigs' && !showComparison && !resultName && currentCandidates.length > 1" class="candidate-gallery">
        <span class="candidate-label">Noch möglich ({{ currentCandidates.length }}):</span>
        <div class="candidate-thumbs">
          <div
            v-for="pig in currentCandidates"
            :key="pig.name"
            class="candidate-thumb"
            :title="pig.name"
          >
            <img
              :src="getAnimalImage(pig.name)"
              :alt="pig.name"
              class="thumb-img"
            />
            <span class="thumb-name">{{ pig.name }}</span>
          </div>
        </div>
      </div>

      <!-- Comparison view for 2-3 similar candidates -->
      <template v-if="showComparison">
        <ComparisonView
          :candidates="comparisonCandidates"
          :differentiating-traits="comparisonTraits"
          @select="selectFromComparison"
        />
        <div class="navigation-buttons three-col">
          <button class="back-button" @click="goBack">← Zurück</button>
          <button class="restart-button" @click="restart">Nochmal</button>
          <button class="reset-button" @click="reset">Start</button>
        </div>
      </template>

      <!-- Result -->
      <template v-else-if="resultName">
        <h2>Es ist: {{ resultName }}!</h2>
        <ResultCard
          :name="resultName"
          :image-url="getAnimalImage(resultName)"
          :appearance="getAppearance(resultName)"
          :story="getStory(resultName)"
          :unique-traits="getUniqueTraitsFor(resultName)"
          :similar-animals="getSimilarAnimalsFor(resultName)"
          @showProfile="showProfileFromResult"
        />
        <div class="navigation-buttons three-col">
          <button class="back-button" @click="goBack">← Zurück</button>
          <button class="restart-button" @click="restart">Nochmal</button>
          <button class="reset-button" @click="reset">Start</button>
        </div>
      </template>

      <!-- Decision tree questions -->
      <DecisionTree
        v-else
        :current-node="currentNode"
        :path="path"
        :show-nav="true"
        @advance="advance"
        @back="goBack"
        @reset="reset"
      />

      <button class="browse-link" @click="appView = 'gallery'">
        Alle {{ formatSpecies(selectedAnimal) }} kennenlernen →
      </button>
    </div>
  </div>
</template>

<script>
import AnimalStart from './AnimalStart.vue';
import DecisionTree from './DecisionTree.vue';
import ResultCard from './ResultCard.vue';
import ChoicesTrail from './ChoicesTrail.vue';
import ComparisonView from './ComparisonView.vue';
import AnimalGallery from './AnimalGallery.vue';
import AnimalProfile from './AnimalProfile.vue';
import AdminMode from './AdminMode.vue';
import HelperMode from './HelperMode.vue';
import AdminAccessGate from './AdminAccessGate.vue';

import {
  loadFromLocalMirror,
  loadFromCache,
  saveCache,
  fetchFromGoogle
} from '../composables/useAnimalData.js';
import {
  getAdminSecurityInfo,
  isAdminUnlocked,
  lockAdmin
} from '../composables/useAdminAuth.js';
import {
  buildPigQuestionNode,
  filterPigCandidates,
  getInitialPigCandidates,
  getNextPigQuestion,
  UNKNOWN_OPTION
} from '../data/pigIdentifier.js';
import {
  getUniqueTraits,
  getSimilarAnimals,
  getDifferentiatingTraits
} from '../data/pigTraitAnalysis.js';

export default {
  name: 'AnimalIdentifier',
  components: {
    AnimalStart, DecisionTree, ResultCard, ChoicesTrail,
    ComparisonView, AnimalGallery, AnimalProfile, AdminMode, HelperMode, AdminAccessGate
  },
  data() {
    return {
      animalDataUrl:
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vRSwkMhkHBGiBOUD8ls5SLwKzJxYf0-R0FNcyqHM6hOR4Ftvb62um8QfrwC77VWEoxatrkJV6GRcySP/pub?output=csv',
      decisionTrees: {},
      animalInfo: {},
      currentNode: null,
      currentCandidates: [],
      path: [],
      steps: [],
      selectedAnimal: null,
      availableSpecies: [],
      loading: true,
      resultName: null,
      // New state
      appView: 'start',       // 'start' | 'identify' | 'gallery' | 'profile'
      profileAnimal: null,
      showComparison: false,
      comparisonCandidates: [],
      comparisonTraits: [],
      adminMode: false,
      helperMode: false,
      adminUnlocked: false,
      adminSecurityInfo: getAdminSecurityInfo()
    };
  },
  computed: {
    galleryAnimals() {
      return Object.keys(this.animalInfo).map((name) => ({
        name,
        imageUrl: this.getAnimalImage(name),
        uniqueTraits: getUniqueTraits(name)
      }));
    }
  },
  async mounted() {
    this.adminUnlocked = isAdminUnlocked();

    // Check URL params for admin/helper mode
    const params = window.location.search;
    if (params.includes('admin')) {
      this.adminMode = true;
    } else if (params.includes('helper')) {
      this.helperMode = true;
    }

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
    handleAdminUnlock() {
      this.adminUnlocked = true;
    },

    lockAdminAccess() {
      lockAdmin();
      this.adminUnlocked = false;
      this.adminMode = false;
    },

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
        if (species === 'pigs') continue;
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
      this.appView = 'identify';
      this.path = [];
      this.steps = [];
      this.resultName = null;
      this.showComparison = false;

      if (species === 'pigs') {
        this.recomputePigState();
        return;
      }

      this.currentCandidates = [];
      this.currentNode = this.decisionTrees[species] || null;
    },

    showProfile(name) {
      this.profileAnimal = name;
      this.appView = 'profile';
    },

    showProfileFromResult(name) {
      // Navigate to profile from result card's "similar animals"
      this.profileAnimal = name;
      this.appView = 'profile';
    },

    advance(option, branch) {
      if (!this.currentNode) return;

      if (this.selectedAnimal === 'pigs') {
        if (this.currentNode.key === 'conflict') {
          this.steps = [];
          this.recomputePigState();
          return;
        }

        const next = branch ?? null;
        if (next && typeof next === 'object' && 'result' in next) {
          this.resultName = next.result;
          this.currentNode = null;
          return;
        }

        const optionLabel = this.currentNode.optionLabels?.[option] || this.formatLabel(option);
        this.steps.push({
          question: this.currentNode.question,
          questionKey: this.currentNode.key,
          mode: this.currentNode.mode || 'direct',
          optionKey: option,
          optionLabel,
          compareValue: this.currentNode.compareValue,
          compareLabel: this.currentNode.compareLabel
        });
        this.recomputePigState();
        return;
      }

      const optionLabel = this.formatLabel(option);
      const questionText = typeof this.currentNode === 'object' ? this.currentNode.question : '';
      this.steps.push({ question: questionText, optionKey: option, optionLabel });
      this.path.push(option);
      const next = branch ?? null;

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
      this.currentNode = null;
      this.currentCandidates = [];
      this.path = [];
      this.steps = [];
      this.resultName = null;
      this.showComparison = false;
      this.comparisonCandidates = [];
      this.comparisonTraits = [];
      this.selectedAnimal = null;
      this.appView = 'start';
    },

    restart() {
      this.currentNode = null;
      this.currentCandidates = [];
      this.path = [];
      this.steps = [];
      this.resultName = null;
      this.showComparison = false;
      this.comparisonCandidates = [];
      this.comparisonTraits = [];
      if (this.selectedAnimal === 'pigs') {
        this.recomputePigState();
      }
    },

    goBack() {
      if (!this.steps.length) return;
      this.undoTo(this.steps.length - 2);
    },

    undoTo(index) {
      this.resultName = null;
      this.showComparison = false;

      if (index < 0) {
        this.steps = [];
        this.path = [];
        if (this.selectedAnimal === 'pigs') {
          this.recomputePigState();
        } else {
          this.currentNode = this.decisionTrees[this.selectedAnimal];
        }
        return;
      }

      this.steps = this.steps.slice(0, index + 1);

      if (this.selectedAnimal === 'pigs') {
        this.recomputePigState();
        return;
      }

      this.path = this.steps.map((s) => s.optionKey);
      let node = this.decisionTrees[this.selectedAnimal];
      for (const step of this.path) {
        const next = node.options?.[step];
        node = typeof next === 'string' ? { result: next } : next;
      }
      this.currentNode = node;
    },

    selectFromComparison(name) {
      this.resultName = name;
      this.showComparison = false;
      this.currentNode = null;
    },

    recomputePigState() {
      let candidates = getInitialPigCandidates();

      this.steps.forEach((step) => {
        candidates = filterPigCandidates(candidates, step);
      });

      this.currentCandidates = candidates;
      this.path = this.steps.map((step) => step.optionKey);
      this.showComparison = false;

      if (!candidates.length) {
        this.resultName = null;
        this.currentNode = {
          key: 'conflict',
          question: 'Diese Merkmalskombination passt gerade zu keinem Schwein.',
          options: { [UNKNOWN_OPTION]: {} },
          optionLabels: { [UNKNOWN_OPTION]: 'Neu einschätzen' },
          estimatedRemaining: 1,
          helpText: 'Gehe einen Schritt zurück oder beginne die Einschätzung neu.'
        };
        return;
      }

      if (candidates.length === 1) {
        this.resultName = candidates[0].name;
        this.currentNode = null;
        return;
      }

      // Check if we should show comparison view (2-3 candidates, no more useful questions)
      const nextQuestion = getNextPigQuestion(candidates, this.steps);

      if (candidates.length <= 3 && !nextQuestion) {
        this.triggerComparison(candidates);
        return;
      }

      // Also trigger comparison if only 2 candidates and remaining questions won't help much
      if (candidates.length === 2 && nextQuestion) {
        const names = candidates.map((c) => c.name);
        const diffTraits = getDifferentiatingTraits(names);
        if (diffTraits.length <= 2) {
          this.triggerComparison(candidates);
          return;
        }
      }

      this.resultName = null;

      if (nextQuestion) {
        this.currentNode = buildPigQuestionNode(nextQuestion.question, candidates, nextQuestion.values);
        return;
      }

      // Fallback: let user pick
      this.currentNode = {
        key: 'fallbackResult',
        question: 'Mehrere Schweine passen noch. Welches passt am ehesten?',
        options: Object.fromEntries(candidates.map((c) => [c.name, { result: c.name }])),
        optionLabels: Object.fromEntries(candidates.map((c) => [c.name, c.name])),
        estimatedRemaining: 1,
        helpText: 'Die bisherigen Merkmale reichen noch nicht für eine eindeutige Entscheidung.'
      };
    },

    triggerComparison(candidates) {
      const names = candidates.map((c) => c.name);
      this.comparisonCandidates = candidates.map((c) => ({
        name: c.name,
        imageUrl: this.getAnimalImage(c.name)
      }));
      this.comparisonTraits = getDifferentiatingTraits(names);
      this.showComparison = true;
      this.resultName = null;
      this.currentNode = null;
    },

    // Trait analysis helpers
    getUniqueTraitsFor(name) {
      return getUniqueTraits(name);
    },

    getSimilarAnimalsFor(name) {
      return getSimilarAnimals(name).map((sim) => ({
        ...sim,
        imageUrl: this.getAnimalImage(sim.name)
      }));
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
        unknown: 'Nicht sicher / nicht sichtbar',
        '': 'Keine', left: 'Links', right: 'Rechts', none: 'Keine sichtbar',
        hängend: 'Hängend', normal: 'Normal', ohne_spitzen: 'Ohne Spitzen',
        short: 'Kurz', long_with_hair: 'Lang mit Haaren', long_without_hair: 'Lang ohne Haare',
        flecken_gesicht: 'Flecken im Gesicht', flecken_genau_abgegrenzt: 'Flecken abgegrenzt',
        grau_rücken: 'Grau am Rücken', komplett_gefleckt: 'Komplett gefleckt', rosa: 'Rosa',
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

/* Candidate thumbnail gallery */
.candidate-gallery { margin: 0 0 1rem; }
.candidate-label {
  display: block; font-size: 0.9rem; color: #5d4037; margin-bottom: .4rem;
}
.candidate-thumbs {
  display: flex; flex-wrap: wrap; gap: .4rem;
}
.candidate-thumb {
  display: flex; flex-direction: column; align-items: center;
  width: 52px;
  transition: opacity .3s ease, transform .3s ease;
}
.thumb-img {
  width: 44px; height: 44px;
  object-fit: cover; border-radius: 50%;
  border: 2px solid #f8bbd0;
}
.thumb-name {
  font-size: .65rem; color: #5d4037;
  text-align: center; line-height: 1.1; margin-top: 2px;
}

.option-button, .back-button, .reset-button {
  display: block; width: 100%;
  padding: 0.75rem 1rem; margin-top: 0.5rem;
  border: none; border-radius: 6px;
  cursor: pointer; font-weight: bold; font-size: 0.95rem;
  transition: background .15s ease, transform .1s ease;
}
.option-button:active, .back-button:active, .reset-button:active {
  transform: scale(0.98);
}
.option-button { background-color: #f48fb1; color: #212121; }
.option-button:hover { background-color: #ec407a; color: #fff; }
.back-button { background-color: #d1c4e9; color: #4527a0; }
.back-button:hover { background-color: #b39ddb; color: #fff; }
.restart-button {
  display: block; width: 100%;
  padding: 0.75rem 1rem; margin-top: 0.5rem;
  border: none; border-radius: 6px;
  cursor: pointer; font-weight: bold; font-size: 0.95rem;
  transition: background .15s ease, transform .1s ease;
  background-color: #ffccbc; color: #5d4037;
}
.restart-button:hover { background-color: #ffab91; color: #fff; }
.restart-button:active { transform: scale(0.98); }
.reset-button { background-color: #b0bec5; color: #37474f; }
.reset-button:hover { background-color: #90a4ae; color: #fff; }

.navigation-buttons {
  display: flex; justify-content: space-between; gap: 1rem; margin-top: 1rem;
}
.navigation-buttons button { flex: 1; }
.navigation-buttons.three-col button { flex: 1; min-width: 0; }

/* Browse link */
.browse-link {
  display: block; width: 100%; margin-top: 1rem;
  padding: .55rem; border: 1.5px dashed #a5d6a7; border-radius: 6px;
  background: transparent; color: #2e7d32;
  font-size: .85rem; font-weight: 600; cursor: pointer;
  text-align: center;
  transition: background .15s ease, border-color .15s ease;
}
.browse-link:hover { background: #e8f5e9; border-color: #66bb6a; }

/* Species sub-menu */
.species-menu {
  display: flex; flex-direction: column; align-items: center; text-align: center;
}
.species-menu h2 { margin: 0 0 .75rem; font-size: 1.4rem; color: #3e2723; }
.menu-options {
  display: flex; flex-direction: column; gap: .5rem; width: 100%; max-width: 300px;
  margin-bottom: 1rem;
}
.menu-btn {
  display: block; width: 100%;
  padding: .85rem 1rem; border: none; border-radius: 8px;
  font-weight: bold; font-size: .95rem; cursor: pointer;
  transition: background .15s ease, transform .1s ease;
}
.menu-btn:active { transform: scale(0.98); }
.identify-btn { background-color: #f48fb1; color: #212121; }
.identify-btn:hover { background-color: #ec407a; color: #fff; }
.browse-btn { background-color: #c8e6c9; color: #2e7d32; }
.browse-btn:hover { background-color: #a5d6a7; color: #fff; }
</style>
