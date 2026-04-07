export const pigProfiles = [
  {
    name: 'Lili',
    traits: {
      pigType: 'wild_boar_like',
      sex: 'female',
      coatAppearance: 'brown_dense',
      wildBoarMarking: 'plain_brown'
    }
  },
  {
    name: 'Gezi',
    traits: {
      pigType: 'wild_boar_like',
      sex: 'female',
      coatAppearance: 'gray_dense',
      wildBoarMarking: 'black_ears_lower_back_spot'
    }
  },
  {
    name: 'Maike',
    traits: {
      pigType: 'woolly_domestic',
      sex: 'female',
      coatAppearance: 'full_hair_no_spots',
      earMark: 'right'
    }
  },
  {
    name: 'Justus',
    traits: {
      pigType: 'woolly_domestic',
      sex: 'male',
      coatAppearance: 'big_black_spots_full_hair',
      earMark: 'none'
    }
  },
  {
    name: 'Milli',
    traits: {
      pigType: 'pot_bellied',
      coatAppearance: 'black_white_bristles',
      sizeClass: 'large'
    }
  },
  {
    name: 'Vanilli',
    traits: {
      pigType: 'pot_bellied',
      coatAppearance: 'bristle_punk_left',
      sizeClass: 'small'
    }
  },
  {
    name: 'Strolch',
    traits: {
      pigType: 'pot_bellied',
      tusksVisible: 'yes',
      humpPresent: 'yes',
      coatAppearance: 'light_bristles'
    }
  },
  {
    name: 'Susi',
    traits: {
      pigType: 'pot_bellied',
      coatAppearance: 'black_with_neck_bristles'
    }
  },
  {
    name: 'Kiwi',
    traits: {
      pigType: 'standard_domestic',
      sex: 'male',
      earMark: 'right',
      skinColor: 'pink',
      earForm: 'pointed',
      spotPattern: 'face_spots',
      tailType: 'short'
    }
  },
  {
    name: 'Ferdinand',
    traits: {
      pigType: 'standard_domestic',
      sex: 'male',
      earMark: 'right',
      skinColor: 'pink',
      earForm: 'round_hairy',
      tailType: 'short'
    }
  },
  {
    name: 'Franz',
    traits: {
      pigType: 'standard_domestic',
      sex: 'male',
      earMark: 'right',
      skinColor: 'pink',
      earForm: 'folded',
      tailType: 'long_bare'
    }
  },
  {
    name: 'Frida',
    traits: {
      pigType: 'standard_domestic',
      sex: 'female',
      earMark: 'left',
      coatAppearance: 'orange_hair',
      livesAlone: 'yes',
      tailType: 'short'
    }
  },
  {
    name: 'Hedda',
    traits: {
      pigType: 'standard_domestic',
      sex: 'female',
      earMark: 'left',
      earPosture: 'hanging',
      tailType: 'long_hairy'
    }
  },
  {
    name: 'Nia',
    traits: {
      pigType: 'standard_domestic',
      sex: 'female',
      earMark: 'left',
      earPosture: 'hanging',
      tailType: 'long_bare'
    }
  },
  {
    name: 'Ronja',
    traits: {
      pigType: 'standard_domestic',
      sex: 'female',
      earMark: 'right',
      skinColor: 'pink',
      spotPattern: 'black_hip_spots',
      backColor: 'gray_back',
      tailType: 'short'
    }
  },
  {
    name: 'Feline',
    traits: {
      pigType: 'standard_domestic',
      sex: 'female',
      earMark: 'right',
      spotPattern: 'sharp_spots',
      tailType: 'short'
    }
  },
  {
    name: 'Rosalie',
    traits: {
      pigType: 'standard_domestic',
      sex: 'female',
      earMark: 'left',
      skinColor: 'pink',
      tailType: 'short',
      bodyShape: 'slim_hump'
    }
  },
  {
    name: 'Hope',
    traits: {
      pigType: 'standard_domestic',
      sex: 'female',
      earMark: 'left',
      skinColor: 'pink',
      tailType: 'curly_hairy'
    }
  }
];

export const pigQuestions = [
  {
    key: 'pigType',
    priority: 100,
    question: 'Welcher Schweinetyp passt am besten?',
    options: {
      wild_boar_like: 'Wildschweinartig mit dichtem Fell',
      pot_bellied: 'Hängebauchschwein',
      woolly_domestic: 'Stark behaartes Wollschwein',
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
    question: 'Welche Fell- oder Borstenfarbe passt am besten?',
    options: {
      brown_dense: 'Braun und dicht behaart',
      gray_dense: 'Grau und dicht behaart',
      full_hair_no_spots: 'Voll behaart ohne Flecken',
      big_black_spots_full_hair: 'Große schwarze Flecken und voll behaart',
      black_white_bristles: 'Schwarz mit weisslichen Borsten',
      bristle_punk_left: 'Borsten auf der linken Seite (Punk-Look)',
      light_bristles: 'Hellere Borsten',
      black_with_neck_bristles: 'Schwarz mit Borsten im Nacken',
      orange_hair: 'Orangefarbene Haare'
    }
  },
  {
    key: 'wildBoarMarking',
    priority: 78,
    question: 'Welche Wildschwein-Merkmale sind sichtbar?',
    options: {
      plain_brown: 'Braunes Fell ohne schwarze Ohren oder schwarzen Fleck am unteren Rücken',
      black_ears_lower_back_spot: 'Schwarz behaarte Ohren und schwarzer Fleck am unteren Rücken'
    }
  },
  {
    key: 'spotPattern',
    priority: 70,
    question: 'Welche Fleckenzeichnung ist sichtbar?',
    options: {
      face_spots: 'Schwarze Flecken im Gesicht',
      sharp_spots: 'Grosse Flecken im Gesicht und am Körper',
      black_face_tail_spots: 'Schwarze Flecken im Gesicht und am Schwanz',
      black_hip_spots: 'Schwarze Flecken am Rücken bei der Hüfte'
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
    question: 'Wo ist eine Ohrmarke oder ein Loch sichtbar?',
    options: {
      left: 'Links',
      right: 'Rechts',
      none: 'Keine sichtbar'
    }
  },
  {
    key: 'earForm',
    priority: 45,
    question: 'Welche Ohrform passt besser?',
    options: {
      round_hairy: 'Rund mit Haaren',
      pointed: 'Spitzig',
      folded: 'Gefaltet'
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
    key: 'backColor',
    priority: 35,
    question: 'Ist der Rücken grau gefärbt?',
    options: {
      gray_back: 'Ja, der Rücken ist grau'
    }
  },
  {
    key: 'skinCondition',
    priority: 35,
    question: 'Gibt es eine auffällige Hautstruktur?',
    options: {
      scaly: 'Sehr schuppige Haut'
    }
  },
  {
    key: 'sizeClass',
    priority: 30,
    question: 'Wie wirkt die Körpergröße?',
    options: {
      large: 'Eher gross',
      small: 'Eher klein'
    }
  },
  {
    key: 'tusksVisible',
    priority: 25,
    question: 'Sind Stoßzähne sichtbar?',
    options: {
      yes: 'Ja'
    }
  },
  {
    key: 'humpPresent',
    priority: 20,
    question: 'Ist ein deutlicher Buckel sichtbar?',
    options: {
      yes: 'Ja'
    }
  },
  {
    key: 'bodyShape',
    priority: 20,
    question: 'Fällt die Körperform besonders auf?',
    options: {
      slim_hump: 'Sehr lang, schmal oder buckelig'
    }
  },
  {
    key: 'livesAlone',
    priority: 15,
    question: 'Lebt das Schwein allein / getrennt von der Rotte?',
    options: {
      yes: 'Ja, lebt allein'
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
    key: 'pigType',
    compareValue: 'woolly_domestic',
    compareLabel: 'Stark behaartes Wollschwein',
    question: 'Ist es ein behaartes Wollschwein?'
  },
  {
    key: 'coatAppearance',
    compareValue: 'big_black_spots_full_hair',
    compareLabel: 'Große schwarze Flecken und voll behaart',
    question: 'Hat es große schwarze Flecken und ist voll behaart?'
  }
];

export const traitMeta = {
  pigType:        { icon: '🐖', label: 'Typ' },
  sex:            { icon: '♀♂', label: 'Geschlecht' },
  coatAppearance: { icon: '🎨', label: 'Fell / Borsten' },
  wildBoarMarking:{ icon: '🪶', label: 'Wildschwein-Merkmale' },
  spotPattern:    { icon: '⚫', label: 'Flecken' },
  earPosture:     { icon: '👂', label: 'Ohren' },
  tailType:       { icon: '〰️', label: 'Schwanz' },
  earMark:        { icon: '🕳️', label: 'Ohrloch' },
  earForm:        { icon: '👂', label: 'Ohrform' },
  skinColor:      { icon: '🩷', label: 'Hautfarbe' },
  backColor:      { icon: '🔘', label: 'Rücken' },
  skinCondition:  { icon: '🧴', label: 'Haut' },
  sizeClass:      { icon: '📏', label: 'Größe' },
  tusksVisible:   { icon: '🦷', label: 'Stoßzähne' },
  humpPresent:    { icon: '🐫', label: 'Buckel' },
  bodyShape:      { icon: '📐', label: 'Körperbau' },
  livesAlone:     { icon: '🏠', label: 'Lebt allein' }
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
    if (candidateValue === expectedValue) {
      return true;
    }

    // "Lang mit Haaren" should include ringed long hairy tails as well.
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

function getOpeningQuestion(candidates, answeredSteps) {
  for (const opening of pigOpeningQuestions) {
    if (
      opening.key === 'coatAppearance' &&
      !candidates.every((candidate) => candidate.traits.pigType === 'woolly_domestic')
    ) {
      continue;
    }

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

export function buildPigQuestionNode(question, candidates, values) {
  const estimatedRemaining = Math.max(1, Math.ceil(Math.log2(candidates.length)));

  const meta = traitMeta[question.key];

  if (question.mode === 'binary' && question.compareValue) {
    const categoryHint = meta ? `${meta.icon} ${meta.label}` : '';

    return {
      key: question.key,
      mode: 'binary',
      compareValue: question.compareValue,
      compareLabel: question.compareLabel,
      categoryHint,
      question: question.question,
      options: {
        yes: {},
        no: {},
        [UNKNOWN_OPTION]: {}
      },
      optionLabels: {
        yes: 'Ja, passt',
        no: 'Nein',
        [UNKNOWN_OPTION]: 'Nicht sicher'
      },
      estimatedRemaining,
      helpText: `${candidates.length} Schweine passen aktuell noch.`
    };
  }

  if (values.length <= 2) {
    const options = {};
    values.forEach((value) => {
      options[value] = {};
    });
    options[UNKNOWN_OPTION] = {};

    return {
      key: question.key,
      mode: 'direct',
      categoryHint: meta ? `${meta.icon} ${meta.label}` : '',
      question: question.question,
      options,
      optionLabels: { ...question.options, [UNKNOWN_OPTION]: 'Nicht sicher' },
      estimatedRemaining,
      helpText: `${candidates.length} Schweine passen aktuell noch.`
    };
  }

  const compareValue = getBestBinaryValue(candidates, question.key, values);
  const compareLabel = question.options[compareValue] || compareValue;
  const categoryHint = meta ? `${meta.icon} ${meta.label}` : '';

  return {
    key: question.key,
    mode: 'binary',
    compareValue,
    compareLabel,
    categoryHint,
    question: `${compareLabel}?`,
    options: {
      yes: {},
      no: {},
      [UNKNOWN_OPTION]: {}
    },
    optionLabels: {
      yes: 'Ja, passt',
      no: 'Nein',
      [UNKNOWN_OPTION]: 'Nicht sicher'
    },
    estimatedRemaining,
    helpText: `${candidates.length} Schweine passen aktuell noch.`
  };
}
