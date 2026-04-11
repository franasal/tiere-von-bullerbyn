import animalDescriptionsRaw from './animal-descriptions.md?raw';
import { parsePigProfilesFromMarkdown } from './animalDescriptionParser.js';
import {
  MALE_PIG_GUIDE_ALT,
  MALE_PIG_GUIDE_CAPTION,
  MALE_PIG_GUIDE_CREDIT,
  MALE_PIG_GUIDE_IMAGE
} from './pigSexGuide.js';
import RONJA_SPOT_PATTERN_IMAGE from '../assets/pig-cues/Ronja/spotPattern.jpg';
import FRANZ_TAIL_TYPE_IMAGE from '../assets/pig-cues/Franz/tailType_.jpg';

const BINARY_DEFAULTS = {
  spotsPresent: 'no',
  largeBlackSpots: 'no',
  tusksVisible: 'no',
  frontArea: 'no',
  livesAlone: 'no',
  earSlit: 'no',
  mobility: 'normal'
};

function applyTraitDefaults(traits) {
  return {
    ...BINARY_DEFAULTS,
    ...traits
  };
}

const LONG_TAIL_VALUES = ['long_hairy', 'long_bare', 'curly_hairy'];

export const pigProfiles = parsePigProfilesFromMarkdown(animalDescriptionsRaw).map((pig) => ({
  ...pig,
  traits: applyTraitDefaults(pig.traits)
}));

export const pigQuestions = [
  {
    key: 'pigType',
    priority: 100,
    question: 'Welcher Schweinetyp passt am besten?',
    options: {
      wild_boar_like: 'Wildschweinartig mit dichtem Fell',
      pot_bellied: 'Hängebauchschwein',
      woolly_domestic: 'Behaartes Schwein',
      standard_domestic: 'Normales Hausschwein'
    }
  },
  {
    key: 'sex',
    priority: 90,
    question: 'Welches Geschlecht ist erkennbar?',
    options: {
      female: 'Weiblich',
      male: 'Männlich'
    }
  },
  {
    key: 'coatAppearance',
    priority: 80,
    question: 'Welche Fell- oder Borstenstruktur passt am besten?',
    options: {
      brown_dense: 'Braun-graues dichtes Fell',
      dark_dense: 'Braun-schwarzes dichtes Fell',
      full_hair_light: 'Hell / weiß-grau',
      black_head_hip_hairy: 'Schwarzer Kopf und Hüfte',
      black_white_bristles: 'Schwarz-weiße Borsten am ganzen Körper',
      white_bristles: 'Weiße Borsten',
      gray_bristles: 'Graue Borsten',
      black_bristles: 'Schwarze Borsten'
    }
  },
  {
    key: 'wildBoarMarking',
    priority: 78,
    question: 'Welche Wildschwein-Merkmale sind sichtbar?',
    options: {
      plain_brown: 'Schwarze Ohren mit weißen Haaren',
      dark_back_spot: 'Schwarz behaarte Ohren und dunkler Rückenfleck'
    }
  },
  {
    key: 'spotsPresent',
    priority: 77,
    question: 'Hat es Flecken?',
    options: {
      yes: 'Ja, Flecken sichtbar',
      no: 'Nein, keine Flecken'
    }
  },
  {
    key: 'largeBlackSpots',
    priority: 76,
    question: 'Hat es große Flecken?',
    options: {
      yes: 'Ja, große Flecken',
      no: 'Nein, keine großen Flecken'
    }
  },
  {
    key: 'spotPattern',
    priority: 70,
    question: 'Welche Fleckenzeichnung ist sichtbar?',
    options: {
      face_spots: 'Schwarze Flecken im Gesicht',
      hip_spots: 'Schwarze Flecken an Rücken/Hüfte',
      body_large_spots: 'Große Flecken im Gesicht und am Körper'
    }
  },
  {
    key: 'earPosture',
    priority: 65,
    question: 'Wie stehen die Ohren?',
    options: {
      hanging: 'Hängend',
      upright: 'Eher normal / aufrecht'
    }
  },
  {
    key: 'tailType',
    priority: 60,
    question: 'Welche Schwanzform ist sichtbar?',
    options: {
      short: 'Kurz',
      long_hairy: 'Lang mit Haaren',
      long_bare: 'Lang ohne Haare',
      curly_hairy: 'Lang, geringelt, mit Haaren'
    }
  },
  {
    key: 'earMark',
    priority: 50,
    question: 'Wo ist eine Ohrmarke, ein Loch oder ein Schlitz sichtbar?',
    options: {
      left: 'Links',
      right: 'Rechts',
      both: 'Links und rechts',
      none: 'Keine sichtbar'
    }
  },
  {
    key: 'earForm',
    priority: 45,
    question: 'Welche Ohrform passt besser?',
    options: {
      round: 'Rund stehend',
      pointed: 'Spitz stehend',
      hairy_hanging: 'Hängend und behaart'
    }
  },
  {
    key: 'skinColor',
    priority: 40,
    question: 'Welche Hautfarbe ist sichtbar?',
    options: {
      pink: 'Rosa'
    }
  },
  {
    key: 'bristleAmount',
    priority: 39,
    question: 'Wie viele Borsten sind sichtbar?',
    options: {
      few: 'Wenig Borsten',
      many: 'Viele Borsten'
    }
  },
  {
    key: 'noseColor',
    priority: 28,
    question: 'Welche Nasenfarbe ist sichtbar?',
    options: {
      black: 'Schwarze Nase',
      pink: 'Rosa Nase'
    }
  },
  {
    key: 'tusksVisible',
    priority: 25,
    question: 'Sind Stoßzähne sichtbar?',
    options: {
      yes: 'Ja',
      no: 'Nein'
    }
  },
  {
    key: 'frontArea',
    priority: 24,
    question: 'Lebt das Schwein vorne bei den Menschen?',
    options: {
      yes: 'Ja, vorne bei den Menschen',
      no: 'Nein'
    }
  },
  {
    key: 'mobility',
    priority: 23,
    question: 'Fällt der Gang oder die Hüfte auf?',
    options: {
      stiff_hip: 'Steife Hüfte / auffälliger Gang',
      normal: 'Unauffällig'
    }
  },
  {
    key: 'livesAlone',
    priority: 22,
    question: 'Lebt das Schwein allein / getrennt von der Rotte?',
    options: {
      yes: 'Ja, lebt allein',
      no: 'Nein'
    }
  },
  {
    key: 'earSlit',
    priority: 18,
    question: 'Ist ein Schlitz im linken Ohr sichtbar?',
    options: {
      yes: 'Ja',
      no: 'Nein'
    }
  }
];

export const UNKNOWN_OPTION = 'unknown';

export const pigOpeningQuestions = [
  {
    key: 'pigType',
    compareValue: 'wild_boar_like',
    compareLabel: 'Wildschweinartig mit dichtem Fell',
    question: 'Ist es ein Wildschwein?'
  },
  {
    key: 'pigType',
    compareValue: 'pot_bellied',
    compareLabel: 'Hängebauchschwein',
    question: 'Ist es ein Hängebauchschwein?'
  },
  {
    key: 'tusksVisible',
    compareValue: 'yes',
    compareLabel: 'Stoßzähne',
    question: 'Sind Stoßzähne sichtbar?'
  },
  {
    key: 'pigType',
    compareValue: 'woolly_domestic',
    compareLabel: 'Behaartes Schwein',
    question: 'Ist es ein stark behaartes Schwein?'
  }
];

export const traitMeta = {
  pigType: { icon: '🐖', label: 'Typ' },
  sex: { icon: '♀♂', label: 'Geschlecht' },
  coatAppearance: { icon: '🧥', label: 'Fell / Borsten' },
  wildBoarMarking: { icon: '🐗', label: 'Wildschwein-Merkmale' },
  spotsPresent: { icon: '⚫', label: 'Flecken' },
  largeBlackSpots: { icon: '⬛', label: 'Große Flecken' },
  spotPattern: { icon: '🐄', label: 'Fleckenmuster' },
  earPosture: { icon: '👂', label: 'Ohren' },
  tailType: { icon: '〰️', label: 'Schwanz' },
  earMark: { icon: '🏷️', label: 'Ohrmarke / Loch' },
  earForm: { icon: '👂', label: 'Ohrform' },
  skinColor: { icon: '🩷', label: 'Hautfarbe' },
  bristleAmount: { icon: '🪮', label: 'Borstenmenge' },
  sizeClass: { icon: '📏', label: 'Größe' },
  noseColor: { icon: '🐽', label: 'Nase' },
  tusksVisible: { icon: '🦷', label: 'Stoßzähne' },
  frontArea: { icon: '📍', label: 'Vorderer Bereich' },
  mobility: { icon: '🚶', label: 'Gang / Hüfte' },
  livesAlone: { icon: '🧍', label: 'Lebt allein' },
  earSlit: { icon: '✂️', label: 'Ohrschlitz' }
};

export function getInitialPigCandidates() {
  return pigProfiles.map((pig) => ({ ...pig, traits: { ...pig.traits } }));
}

export function filterPigCandidates(candidates, step) {
  if (!step || step.optionKey === UNKNOWN_OPTION) {
    return candidates;
  }

  const matchesTrait = (candidate, expectedValue) => {
    const candidateValue = candidate.traits[step.questionKey];

    if (Array.isArray(expectedValue)) {
      return expectedValue.some((value) => matchesTrait(candidate, value));
    }

    if (candidateValue === expectedValue) {
      return true;
    }

    if (step.questionKey === 'tailType' && expectedValue === 'long_hairy' && candidateValue === 'curly_hairy') {
      return true;
    }

    return false;
  };

  if (step.mode === 'binary') {
    if (step.optionKey === 'yes') {
      return candidates.filter((candidate) => matchesTrait(candidate, step.compareValue));
    }

    if (step.optionKey === 'no') {
      return candidates.filter((candidate) => !matchesTrait(candidate, step.compareValue));
    }
  }

  return candidates.filter((candidate) => matchesTrait(candidate, step.optionKey));
}

function getDistinctValues(candidates, questionKey) {
  return Array.from(
    new Set(
      candidates
        .map((candidate) => candidate.traits[questionKey])
        .filter((value) => value !== undefined && value !== null)
    )
  );
}

function getQuestionScore(candidates, question, values) {
  if (values.length < 2) {
    return -1;
  }

  const counts = values.map(
    (value) => candidates.filter((candidate) => candidate.traits[question.key] === value).length
  );
  const balance = counts.length ? Math.min(...counts) : 0;
  return (question.priority || 0) + values.length * 10 + balance;
}

export function getNextPigQuestion(candidates, answeredKeys) {
  const askedByKey = new Map();
  const lockedKeys = new Set();

  answeredKeys.forEach((step) => {
    if (!askedByKey.has(step.questionKey)) {
      askedByKey.set(step.questionKey, new Set());
    }

    if (step.mode === 'binary') {
      if (step.compareValue !== undefined) {
        askedByKey.get(step.questionKey).add(step.compareValue);
      }
      if (step.optionKey === UNKNOWN_OPTION || step.optionKey === 'yes') {
        lockedKeys.add(step.questionKey);
      }
      return;
    }

    lockedKeys.add(step.questionKey);
  });

  const shortTailFemaleSpots = getShortTailFemaleSpotQuestion(candidates, answeredKeys);
  if (shortTailFemaleSpots) {
    return shortTailFemaleSpots;
  }

  const maleFaceSpotsQuestion = getMaleFaceSpotsQuestion(candidates, answeredKeys);
  if (maleFaceSpotsQuestion) {
    return maleFaceSpotsQuestion;
  }

  const hipSpotsQuestion = getHipSpotsQuestion(candidates, answeredKeys);
  if (hipSpotsQuestion) {
    return hipSpotsQuestion;
  }

  const tailTypeCueQuestion = getTailTypeCueQuestion(candidates, answeredKeys);
  if (tailTypeCueQuestion) {
    return tailTypeCueQuestion;
  }

  const woollyColorQuestion = getWoollyColorQuestion(candidates, answeredKeys);
  if (woollyColorQuestion) {
    return woollyColorQuestion;
  }

  const openingQuestion = getOpeningQuestion(candidates, answeredKeys);
  if (openingQuestion) {
    return openingQuestion;
  }

  let bestQuestion = null;
  let bestScore = -1;
  let bestValues = [];

  for (const question of pigQuestions) {
    if (lockedKeys.has(question.key)) {
      continue;
    }

    const previouslyAsked = askedByKey.get(question.key) || new Set();
    const values = getDistinctValues(candidates, question.key).filter((value) => !previouslyAsked.has(value));
    if (values.length < 2) {
      continue;
    }

    const score = getQuestionScore(candidates, question, values);
    if (score > bestScore) {
      bestQuestion = question;
      bestScore = score;
      bestValues = values;
    }
  }

  return bestQuestion ? { question: bestQuestion, values: bestValues } : null;
}

function getMaleFaceSpotsQuestion(candidates, answeredSteps) {
  const hasMale = answeredSteps.some(
    (step) => step.questionKey === 'sex' && step.optionKey === 'male'
  );
  const alreadyAsked = answeredSteps.some((step) => step.questionKey === 'spotPattern');

  if (!hasMale || alreadyAsked) {
    return null;
  }

  const values = getDistinctValues(candidates, 'spotPattern');
  if (!values.includes('face_spots')) {
    return null;
  }

  const nonFaceSpotCandidates = candidates.filter((candidate) => candidate.traits.spotPattern !== 'face_spots');
  const allNonFaceUnspotted = nonFaceSpotCandidates.every((candidate) => candidate.traits.spotsPresent === 'no');
  if (!allNonFaceUnspotted) {
    return null;
  }

  return {
    question: {
      key: 'spotPattern',
      mode: 'binary',
      compareValue: 'face_spots',
      compareLabel: 'Flecken im Gesicht',
      question: 'Hat es Flecken im Gesicht?',
      options: {
        yes: 'Ja, passt',
        no: 'Nein'
      }
    },
    values: ['yes', 'no'],
    forcedBinary: true
  };
}

function getWoollyColorQuestion(candidates, answeredSteps) {
  const alreadyAsked = answeredSteps.some((step) => step.questionKey === 'coatAppearance');
  if (alreadyAsked || candidates.length < 2) {
    return null;
  }

  const allWoolly = candidates.every((candidate) => candidate.traits.pigType === 'woolly_domestic');
  if (!allWoolly) {
    return null;
  }

  const values = getDistinctValues(candidates, 'coatAppearance');
  if (values.length < 2) {
    return null;
  }

  const question = pigQuestions.find((entry) => entry.key === 'coatAppearance');
  if (!question) {
    return null;
  }

  return { question, values };
}

function getHipSpotsQuestion(candidates, answeredSteps) {
  const alreadyAsked = answeredSteps.some((step) => step.questionKey === 'spotPattern');
  if (alreadyAsked || candidates.length !== 2) {
    return null;
  }

  const values = getDistinctValues(candidates, 'spotPattern');
  const hasOnlyHipAndBodyLarge =
    values.length === 2 &&
    values.includes('hip_spots') &&
    values.includes('body_large_spots');

  if (!hasOnlyHipAndBodyLarge) {
    return null;
  }

  const candidateNames = candidates.map((candidate) => candidate.name).sort((a, b) => a.localeCompare(b, 'de'));
  if (candidateNames.join('|') !== 'Feline|Ronja') {
    return null;
  }

  return {
    question: {
      key: 'spotPattern',
      mode: 'binary',
      compareValue: 'hip_spots',
      compareLabel: 'Flecken an Ruecken/Huefte',
      question: 'Hat es Flecken an den Rücken/Hüfte?',
      optionLabels: {
        yes: 'Ja, passt',
        no: 'Nein, es hat Große Flecken im Gesicht und am Körper'
      },
      questionImage: RONJA_SPOT_PATTERN_IMAGE,
      questionImageAlt: 'Hinweisfoto Flecken an Rücken und Hüfte',
      questionImageLabel: 'Hinweis'
    },
    values: ['yes', 'no'],
    forcedBinary: true
  };
}

function getTailTypeCueQuestion(candidates, answeredSteps) {
  const alreadyAsked = answeredSteps.some((step) => step.questionKey === 'tailType');
  if (alreadyAsked) {
    return null;
  }

  const values = getDistinctValues(candidates, 'tailType');
  const hasShortAndLongBare =
    values.length === 2 &&
    values.includes('short') &&
    values.includes('long_bare');

  if (!hasShortAndLongBare) {
    return null;
  }

  return {
    question: {
      key: 'tailType',
      mode: 'binary',
      compareValue: 'long_bare',
      compareLabel: 'Langer Schwanz ohne Haare',
      question: 'Hat es einen langen Schwanz ohne Haare?',
      optionLabels: {
        yes: 'Ja, passt',
        no: 'Nein, es hat einen kurzen Schwanz'
      },
      questionImage: FRANZ_TAIL_TYPE_IMAGE,
      questionImageAlt: 'Hinweisfoto langer Schwanz ohne Haare',
      questionImageLabel: 'Hinweis'
    },
    values: ['yes', 'no'],
    forcedBinary: true
  };
}

function getShortTailFemaleSpotQuestion(candidates, answeredSteps) {
  const hasFemale = answeredSteps.some(
    (step) => step.questionKey === 'sex' && step.optionKey === 'female'
  );
  const hasShortTail = answeredSteps.some(
    (step) => step.questionKey === 'tailType' && step.optionKey === 'short'
  );
  const alreadyAsked = answeredSteps.some(
    (step) => step.questionKey === 'spotsPresent'
  );

  if (!hasFemale || !hasShortTail || alreadyAsked) {
    return null;
  }

  const values = getDistinctValues(candidates, 'spotsPresent');
  if (!values.includes('yes') || !values.includes('no')) {
    return null;
  }

  return {
    question: {
      key: 'spotsPresent',
      mode: 'binary',
      compareValue: 'yes',
      compareLabel: 'Flecken sichtbar',
      question: 'Hat es Flecken?',
      options: {
        yes: 'Ja, passt',
        no: 'Nein'
      }
    },
    values: ['yes', 'no'],
    forcedBinary: true
  };
}

function getOpeningQuestion(candidates, answeredSteps) {
  for (const opening of pigOpeningQuestions) {
    const alreadyAsked = answeredSteps.some(
      (step) => step.questionKey === opening.key && step.compareValue === opening.compareValue
    );
    if (alreadyAsked) {
      continue;
    }

    const matching = candidates.filter((candidate) => candidate.traits[opening.key] === opening.compareValue);
    if (!matching.length || matching.length === candidates.length) {
      continue;
    }

    return {
      question: {
        key: opening.key,
        mode: 'binary',
        compareValue: opening.compareValue,
        compareLabel: opening.compareLabel,
        question: opening.question,
        options: {
          yes: 'Ja, passt',
          no: 'Nein'
        }
      },
      values: ['yes', 'no'],
      forcedBinary: true
    };
  }

  return null;
}

function getBestBinaryValue(candidates, questionKey, values) {
  const total = candidates.length;
  let bestValue = values[0];
  let bestBalance = -1;

  values.forEach((value) => {
    const count = candidates.filter((candidate) => candidate.traits[questionKey] === value).length;
    const balance = Math.min(count, total - count);
    if (balance > bestBalance) {
      bestBalance = balance;
      bestValue = value;
    }
  });

  return bestValue;
}

export function buildPigQuestionNode(question, candidates, values, answeredCount = 0) {
  const estimatedRemaining = Math.max(1, Math.ceil(Math.log2(candidates.length)));
  const allowUnknownOption = question.key === 'sex' && answeredCount >= 3;
  const isHipVsBodyLargeSpotQuestion =
    question.key === 'spotPattern' &&
    values.length === 2 &&
    values.includes('hip_spots') &&
    values.includes('body_large_spots');

  const meta = traitMeta[question.key];
  const sexGuide =
    question.key === 'sex'
      ? {
          questionImage: MALE_PIG_GUIDE_IMAGE,
          questionImageAlt: MALE_PIG_GUIDE_ALT,
          questionImageCaption: MALE_PIG_GUIDE_CAPTION,
          questionImageCredit: MALE_PIG_GUIDE_CREDIT
        }
      : {};

  if (question.mode === 'binary' && question.compareValue) {
    const categoryHint = meta ? `${meta.icon} ${meta.label}` : '';
    const options = {
      yes: {},
      no: {}
    };
    const optionLabels = {
      yes: 'Ja, passt',
      no: 'Nein'
    };
    Object.assign(optionLabels, question.optionLabels || {});

    if (allowUnknownOption) {
      options[UNKNOWN_OPTION] = {};
      optionLabels[UNKNOWN_OPTION] = 'Nicht sicher';
    }

    return {
      key: question.key,
      mode: 'binary',
      compareValue: question.compareValue,
      compareLabel: question.compareLabel,
      categoryHint,
      question: question.question,
      options,
      optionLabels,
      estimatedRemaining,
      helpText: `${candidates.length} Schweine passen aktuell noch.`,
      ...sexGuide,
      ...(question.questionImage
        ? {
            questionImage: question.questionImage,
            questionImageAlt: question.questionImageAlt,
            questionImageCaption: question.questionImageCaption,
            questionImageLabel: question.questionImageLabel
          }
        : {})
    };
  }

  if (isHipVsBodyLargeSpotQuestion) {
    return {
      key: question.key,
      mode: 'binary',
      compareValue: 'hip_spots',
      compareLabel: 'Flecken an Ruecken/Huefte',
      categoryHint: meta ? `${meta.icon} ${meta.label}` : '',
      question: 'Hat es Flecken an den Rücken/Hüfte?',
      options: {
        yes: {},
        no: {}
      },
      optionLabels: {
        yes: 'Ja, passt',
        no: 'Nein, es hat Große Flecken im Gesicht und am Körper'
      },
      estimatedRemaining,
      helpText: `${candidates.length} Schweine passen aktuell noch.`,
      questionImage: RONJA_SPOT_PATTERN_IMAGE,
      questionImageAlt: 'Hinweisfoto Flecken an Rücken und Hüfte',
      questionImageLabel: 'Hinweis'
    };
  }

  if (values.length <= 2) {
    const options = {};
    values.forEach((value) => {
      options[value] = {};
    });

    const optionLabels = { ...question.options };
    if (allowUnknownOption) {
      options[UNKNOWN_OPTION] = {};
      optionLabels[UNKNOWN_OPTION] = 'Nicht sicher';
    }

    const questionText =
      question.key === 'largeBlackSpots'
        ? 'Bedecken die Flecken den größten Teil des Gesichts?'
        : question.question;

    return {
      key: question.key,
      mode: 'direct',
      categoryHint: meta ? `${meta.icon} ${meta.label}` : '',
      question: questionText,
      options,
      optionLabels,
      estimatedRemaining,
      helpText: `${candidates.length} Schweine passen aktuell noch.`,
      ...sexGuide
    };
  }

  let compareValue = getBestBinaryValue(candidates, question.key, values);
  let compareLabel = question.options[compareValue] || compareValue;
  const categoryHint = meta ? `${meta.icon} ${meta.label}` : '';
  const options = {
    yes: {},
    no: {}
  };
  const optionLabels = {
    yes: 'Ja, passt',
    no: 'Nein'
  };

  if (allowUnknownOption) {
    options[UNKNOWN_OPTION] = {};
    optionLabels[UNKNOWN_OPTION] = 'Nicht sicher';
  }

  let questionText = `${compareLabel}?`;
  if (
    question.key === 'spotPattern' &&
    compareValue === 'face_spots' &&
    values.includes('body_large_spots')
  ) {
    compareValue = ['face_spots', 'body_large_spots'];
    compareLabel = 'Schwarze Flecken im Gesicht';
    questionText = 'Hat es schwarze Flecken im Gesicht?';
  }

  if (question.key === 'tailType' && compareValue === 'short') {
    compareValue = LONG_TAIL_VALUES.filter((value) => values.includes(value));
    compareLabel = 'Lang';
    questionText = 'Schwanz lang?';
  }

  return {
    key: question.key,
    mode: 'binary',
    compareValue,
    compareLabel,
    categoryHint,
    question: questionText,
    options,
    optionLabels,
    estimatedRemaining,
    helpText: `${candidates.length} Schweine passen aktuell noch.`,
    ...sexGuide
  };
}
