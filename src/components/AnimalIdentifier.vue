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
    <div v-else-if="appView === 'identify'" class="identify-view" :style="currentThemeStyle">
      <h1>
        <template v-if="selectedAnimal === 'pigs'">Schweine</template>
        <template v-else>{{ formatSpecies(selectedAnimal) }}</template>
      </h1>

      <ChoicesTrail :steps="steps" @undoTo="undoTo" />

      <div v-if="!showComparison && !resultName && currentCandidateCards.length > 1" class="candidate-gallery">
        <span class="candidate-label">Noch möglich ({{ currentCandidateCards.length }}):</span>
        <div class="candidate-thumbs">
          <div
            v-for="candidate in currentCandidateCards"
            :key="candidate.name"
            class="candidate-thumb"
            :title="candidate.name"
          >
            <img
              :src="candidate.imageUrl"
              :alt="candidate.name"
              class="thumb-img"
            />
            <span class="thumb-name">{{ candidate.name }}</span>
          </div>
        </div>
      </div>

      <div v-if="questionCueGroups.length" class="question-cues">
        <div class="question-cues-title">Foto-Hinweise zur aktuellen Frage</div>
        <div class="question-cues-list">
          <article
            v-for="group in questionCueGroups"
            :key="group.name"
            class="question-cue-card"
          >
            <div class="question-cue-images">
              <button
                v-for="(url, index) in group.images"
                :key="`${group.name}-${index}`"
                type="button"
                class="question-cue-button"
                @click="openCuePreview(url)"
              >
                <img
                  :src="url"
                  alt="Hinweisfoto"
                  class="question-cue-image"
                />
              </button>
            </div>
          </article>
        </div>
      </div>

      <div
        v-if="activeCuePreview"
        class="cue-preview-overlay"
        @click.self="closeCuePreview"
      >
        <div class="cue-preview-dialog">
          <button
            type="button"
            class="cue-preview-close"
            aria-label="Bild schliessen"
            @click="closeCuePreview"
          >
            X
          </button>
          <img
            :src="activeCuePreview"
            alt="Grosses Hinweisfoto"
            class="cue-preview-image"
          />
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

    <FeedbackWidget
      :pig-names="feedbackPigNames"
      :selected-pig="feedbackSelectedPig"
      :current-view="feedbackViewLabel"
    />
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
import FeedbackWidget from './FeedbackWidget.vue';

import {
  loadFromLocalMirror,
  loadFromCache,
  mergeAnimalSources,
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
import { getQuestionCueGallery, getCueImageForAnimalAndQuestion } from '../data/pigCues.js';

export default {
  name: 'AnimalIdentifier',
  components: {
    AnimalStart, DecisionTree, ResultCard, ChoicesTrail,
    ComparisonView, AnimalGallery, AnimalProfile, AdminMode, HelperMode, AdminAccessGate, FeedbackWidget
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
      adminSecurityInfo: getAdminSecurityInfo(),
      activeCuePreview: ''
    };
  },
  computed: {
    currentCandidateCards() {
      if (!this.selectedAnimal || this.showComparison || this.resultName) {
        return [];
      }

      return this.currentCandidates.map((candidate) => ({
        name: candidate.name,
        imageUrl: this.getAnimalImage(candidate.name)
      }));
    },
    galleryAnimals() {
      const names = Object.keys(this.animalInfo).filter((name) => {
        const species = this.animalInfo[name]?.species;
        if (this.selectedAnimal === 'pigs') {
          return species === 'pig' || species === 'wild_boar';
        }

        return species === this.selectedAnimal;
      });

      return names.map((name) => ({
        name,
        imageUrl: this.getAnimalImage(name),
        uniqueTraits: getUniqueTraits(name)
      }));
    },
    questionCueGroups() {
      if (
        this.selectedAnimal !== 'pigs' ||
        this.showComparison ||
        this.resultName ||
        !this.currentNode ||
        !this.currentCandidates.length
      ) {
        return [];
      }

      const candidateNames = this.currentCandidates.map((candidate) => candidate.name);
      return getQuestionCueGallery(candidateNames, this.currentNode.key, {
        maxPigs: 4,
        maxImagesPerPig: 2
      });
    },
    feedbackPigNames() {
      return Object.values(this.animalInfo)
        .filter((animal) => animal.species === 'pig')
        .map((animal) => animal.name)
        .sort((a, b) => a.localeCompare(b, 'de'));
    },
    feedbackSelectedPig() {
      if (this.resultName && this.animalInfo[this.resultName]?.species === 'pig') {
        return this.resultName;
      }

      if (this.profileAnimal && this.animalInfo[this.profileAnimal]?.species === 'pig') {
        return this.profileAnimal;
      }

      return '';
    },
    feedbackViewLabel() {
      if (this.appView === 'profile') {
        return `profile:${this.profileAnimal || '-'}`;
      }

      if (this.appView === 'identify' && this.selectedAnimal) {
        return `identify:${this.selectedAnimal}`;
      }

      return this.appView;
    },
    currentThemeStyle() {
      const themes = {
        pigs: {
          '--group-accent-soft': '#fce4ec',
          '--group-accent-border': '#f8bbd0',
          '--group-accent': '#f48fb1',
          '--group-accent-strong': '#ec407a',
          '--group-accent-text': '#5a3044',
          '--group-secondary': '#d1c4e9',
          '--group-secondary-strong': '#9575cd',
          '--group-secondary-text': '#4527a0',
          '--group-tertiary': '#ffccbc',
          '--group-tertiary-strong': '#ff8a65',
          '--group-tertiary-text': '#5d4037',
          '--group-link-bg': '#fff1f5',
          '--group-link-border': '#f48fb1',
          '--group-link-hover': '#fce4ec'
        },
        goat: {
          '--group-accent-soft': '#efebe9',
          '--group-accent-border': '#d7ccc8',
          '--group-accent': '#bcaaa4',
          '--group-accent-strong': '#8d6e63',
          '--group-accent-text': '#4e342e',
          '--group-secondary': '#dcedc8',
          '--group-secondary-strong': '#7cb342',
          '--group-secondary-text': '#33691e',
          '--group-tertiary': '#ffe0b2',
          '--group-tertiary-strong': '#fb8c00',
          '--group-tertiary-text': '#6d4c41',
          '--group-link-bg': '#f7f1ed',
          '--group-link-border': '#a1887f',
          '--group-link-hover': '#efebe9'
        },
        sheep: {
          '--group-accent-soft': '#eceff1',
          '--group-accent-border': '#cfd8dc',
          '--group-accent': '#b0bec5',
          '--group-accent-strong': '#607d8b',
          '--group-accent-text': '#37474f',
          '--group-secondary': '#d1c4e9',
          '--group-secondary-strong': '#7e57c2',
          '--group-secondary-text': '#4a148c',
          '--group-tertiary': '#f5f5f5',
          '--group-tertiary-strong': '#90a4ae',
          '--group-tertiary-text': '#455a64',
          '--group-link-bg': '#f4f7f8',
          '--group-link-border': '#90a4ae',
          '--group-link-hover': '#eceff1'
        },
        equine: {
          '--group-accent-soft': '#efebe9',
          '--group-accent-border': '#d7ccc8',
          '--group-accent': '#bcaaa4',
          '--group-accent-strong': '#8d6e63',
          '--group-accent-text': '#4e342e',
          '--group-secondary': '#dcedc8',
          '--group-secondary-strong': '#7cb342',
          '--group-secondary-text': '#33691e',
          '--group-tertiary': '#ffe0b2',
          '--group-tertiary-strong': '#fb8c00',
          '--group-tertiary-text': '#6d4c41',
          '--group-link-bg': '#f7f1ed',
          '--group-link-border': '#a1887f',
          '--group-link-hover': '#efebe9'
        },
        cow: {
          '--group-accent-soft': '#fff3e0',
          '--group-accent-border': '#ffcc80',
          '--group-accent': '#ffb74d',
          '--group-accent-strong': '#fb8c00',
          '--group-accent-text': '#6d4c41',
          '--group-secondary': '#d7ccc8',
          '--group-secondary-strong': '#8d6e63',
          '--group-secondary-text': '#4e342e',
          '--group-tertiary': '#fff8e1',
          '--group-tertiary-strong': '#ffb300',
          '--group-tertiary-text': '#6d4c41',
          '--group-link-bg': '#fff7eb',
          '--group-link-border': '#ffb74d',
          '--group-link-hover': '#fff3e0'
        },
        dog: {
          '--group-accent-soft': '#e8f5e9',
          '--group-accent-border': '#a5d6a7',
          '--group-accent': '#81c784',
          '--group-accent-strong': '#43a047',
          '--group-accent-text': '#2e5d34',
          '--group-secondary': '#dcedc8',
          '--group-secondary-strong': '#7cb342',
          '--group-secondary-text': '#33691e',
          '--group-tertiary': '#fff8e1',
          '--group-tertiary-strong': '#f9a825',
          '--group-tertiary-text': '#6d4c41',
          '--group-link-bg': '#f1f8e9',
          '--group-link-border': '#81c784',
          '--group-link-hover': '#e8f5e9'
        }
      };

      return themes[this.selectedAnimal] || {};
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

    const local = await loadFromLocalMirror();
    const cached = loadFromCache();

    if (cached) {
      const merged = mergeAnimalSources(cached, local);
      this.animalInfo = merged.info;
      this.availableSpecies = merged.species;
      this.loading = false;
      this.$nextTick(() => this.backgroundRefresh());
    } else {
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
          const local = await loadFromLocalMirror();
          const merged = mergeAnimalSources(fresh, local);
          this.animalInfo = merged.info;
          this.availableSpecies = merged.species;
          saveCache(merged.info, merged.species);
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

      const tree = this.decisionTrees[species] || null;
      this.currentCandidates = this.getTreeCandidates(tree);
      this.currentNode = this.enrichTreeNode(tree, this.currentCandidates.length);
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

      const optionLabel = this.currentNode.optionLabels?.[option] || this.formatLabel(option);
      const questionText = typeof this.currentNode === 'object' ? this.currentNode.question : '';
      this.steps.push({
        question: questionText,
        questionKey: this.currentNode.key || '',
        optionKey: option,
        optionLabel
      });
      this.path.push(option);
      const next = branch ?? null;

      if (typeof next === 'string') {
        this.resultName = next;
        this.currentNode = null;
        this.currentCandidates = [];
      } else if (next && typeof next === 'object' && 'result' in next) {
        this.resultName = next.result;
        this.currentNode = null;
        this.currentCandidates = [];
      } else {
        const nextCandidates = this.getTreeCandidates(next);
        this.currentCandidates = nextCandidates;
        this.currentNode = this.enrichTreeNode(next, nextCandidates.length);
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
      } else {
        const tree = this.decisionTrees[this.selectedAnimal] || null;
        const candidates = this.getTreeCandidates(tree);
        this.currentCandidates = candidates;
        this.currentNode = this.enrichTreeNode(tree, candidates.length);
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
          const tree = this.decisionTrees[this.selectedAnimal];
          const candidates = this.getTreeCandidates(tree);
          this.currentCandidates = candidates;
          this.currentNode = this.enrichTreeNode(tree, candidates.length);
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
      const candidates = this.getTreeCandidates(node);
      this.currentCandidates = candidates;
      this.currentNode = this.enrichTreeNode(node, candidates.length);
    },

    selectFromComparison(name) {
      this.resultName = name;
      this.showComparison = false;
      this.currentNode = null;
    },

    openCuePreview(url) {
      this.activeCuePreview = url;
    },

    closeCuePreview() {
      this.activeCuePreview = '';
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
        const node = buildPigQuestionNode(nextQuestion.question, candidates, nextQuestion.values);
        this.currentNode = this.addOptionImages(node, candidates);
        return;
      }

      // Fallback: let user pick
      this.currentNode = {
        key: 'fallbackResult',
        question: 'Mehrere Schweine passen noch. Welches passt am ehesten?',
        options: Object.fromEntries(candidates.map((c) => [c.name, { result: c.name }])),
        optionLabels: Object.fromEntries(candidates.map((c) => [c.name, c.name])),
        optionCards: Object.fromEntries(
          candidates.map((c) => [
            c.name,
            {
              title: c.name,
              imageUrl: this.getAnimalImage(c.name)
            }
          ])
        ),
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

    // Enrich a decision-tree node from the JSON trees with helpText (candidate count)
    enrichTreeNode(node, candidateCount) {
      if (!node || node.result) return node;
      const speciesLabel = this.formatSpecies(this.selectedAnimal);
      return {
        ...node,
        helpText: `${candidateCount} ${speciesLabel} passen aktuell noch.`
      };
    },

    // Add optionImages to a pig question node based on available cue images
    addOptionImages(node, candidates) {
      const images = {};
      if (node.mode === 'binary' && node.compareValue) {
        const matching = candidates.filter((c) => c.traits[node.key] === node.compareValue);
        for (const candidate of matching) {
          const img = getCueImageForAnimalAndQuestion(candidate.name, node.key);
          if (img) { images['yes'] = img; break; }
        }
      } else if (node.mode === 'direct') {
        for (const optionKey of Object.keys(node.options)) {
          if (optionKey === UNKNOWN_OPTION) continue;
          const matching = candidates.filter((c) => c.traits[node.key] === optionKey);
          for (const candidate of matching) {
            const img = getCueImageForAnimalAndQuestion(candidate.name, node.key);
            if (img) { images[optionKey] = img; break; }
          }
        }
      }
      return Object.keys(images).length > 0 ? { ...node, optionImages: images } : node;
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
      const imageUrl = this.animalInfo[name]?.image_url;
      if (!imageUrl) {
        const base = import.meta.env.BASE_URL || '/';
        return `${base.replace(/\/$/, '')}/animal-images/placeholder.svg`;
      }

      if (imageUrl.startsWith('/')) {
        const base = import.meta.env.BASE_URL || '/';
        return `${base.replace(/\/$/, '')}${imageUrl}`;
      }

      return imageUrl;
    },
    getAppearance(name) {
      return this.animalInfo[name]?.appearance_description || '';
    },
    getStory(name) {
      return this.animalInfo[name]?.general_description || '';
    },
    collectResultsFromNode(node) {
      if (!node) return [];
      if (typeof node === 'string') return [node];
      if (typeof node === 'object' && node.result) return [node.result];

      const names = [];
      for (const branch of Object.values(node.options || {})) {
        names.push(...this.collectResultsFromNode(branch));
      }
      return [...new Set(names)];
    },
    getTreeCandidates(node) {
      return this.collectResultsFromNode(node).map((name) => ({ name }));
    },

    formatSpecies(key) {
      const map = {
        pigs: 'Schweine',
        goat: 'Ziegen',
        sheep: 'Schafe',
        equine: 'Esel & Ponys',
        cow: 'Kühe',
        dog: 'Hunde'
      };
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
  padding: 1rem 1rem 5.5rem;
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

.question-cues {
  margin: 0 0 1rem;
  padding: .6rem;
  background: #fff8fb;
  border: 1px solid #f8bbd0;
  border-radius: 8px;
}
.question-cues-title {
  font-size: .9rem;
  font-weight: 700;
  color: #7b1f46;
  margin-bottom: .45rem;
}
.question-cues-list {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
}
.question-cue-card {
  background: transparent;
}
.question-cue-images {
  display: flex;
  flex-wrap: wrap;
  gap: .35rem;
}
.question-cue-button {
  padding: 0;
  border: none;
  background: transparent;
  border-radius: 999px;
  line-height: 0;
}
.question-cue-image {
  width: 76px;
  height: 76px;
  object-fit: cover;
  border-radius: 999px;
  border: 3px solid #fff;
  box-shadow: 0 0 0 1px #f0d6e0;
}
.question-cue-button:hover .question-cue-image {
  box-shadow: 0 0 0 1px #e8a1c1, 0 6px 16px rgba(126, 56, 92, 0.14);
}

.cue-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(23, 18, 23, 0.68);
}
.cue-preview-dialog {
  position: relative;
  width: min(92vw, 560px);
}
.cue-preview-close {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 999px;
  background: #fff;
  color: #5a4151;
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: 0 8px 22px rgba(22, 14, 22, 0.22);
}
.cue-preview-image {
  display: block;
  width: 100%;
  max-height: 78vh;
  object-fit: contain;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 18px 50px rgba(15, 11, 15, 0.3);
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
.option-button {
  background-color: var(--group-accent, #f48fb1);
  color: var(--group-accent-text, #212121);
}
.option-button:hover {
  background-color: var(--group-accent-strong, #ec407a);
  color: #fff;
}
.back-button {
  background-color: var(--group-secondary, #d1c4e9);
  color: var(--group-secondary-text, #4527a0);
}
.back-button:hover {
  background-color: var(--group-secondary-strong, #b39ddb);
  color: #fff;
}
.restart-button {
  display: block; width: 100%;
  padding: 0.75rem 1rem; margin-top: 0.5rem;
  border: none; border-radius: 6px;
  cursor: pointer; font-weight: bold; font-size: 0.95rem;
  transition: background .15s ease, transform .1s ease;
  background-color: var(--group-tertiary, #ffccbc);
  color: var(--group-tertiary-text, #5d4037);
}
.restart-button:hover {
  background-color: var(--group-tertiary-strong, #ffab91);
  color: #fff;
}
.restart-button:active { transform: scale(0.98); }
.reset-button {
  background-color: var(--group-tertiary, #b0bec5);
  color: var(--group-tertiary-text, #37474f);
}
.reset-button:hover {
  background-color: var(--group-tertiary-strong, #90a4ae);
  color: #fff;
}

.navigation-buttons {
  display: flex; justify-content: space-between; gap: 1rem; margin-top: 1rem;
}
.navigation-buttons button { flex: 1; }
.navigation-buttons.three-col button { flex: 1; min-width: 0; }

/* Browse link */
.browse-link {
  display: block; width: 100%; margin-top: 1rem;
  padding: .55rem; border: 1.5px dashed var(--group-link-border, #a5d6a7); border-radius: 6px;
  background: var(--group-link-bg, transparent); color: var(--group-secondary-text, #2e7d32);
  font-size: .85rem; font-weight: 600; cursor: pointer;
  text-align: center;
  transition: background .15s ease, border-color .15s ease;
}
.browse-link:hover {
  background: var(--group-link-hover, #e8f5e9);
  border-color: var(--group-accent-strong, #66bb6a);
}

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
