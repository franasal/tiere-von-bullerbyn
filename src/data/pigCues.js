const cueModules = import.meta.glob('../assets/pig-cues/**/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default'
});

const QUESTION_HINTS = {
  pigType: ['type', 'typ'],
  sex: ['sex', 'geschlecht'],
  coatAppearance: ['coat', 'fell', 'borsten', 'hair'],
  wildBoarMarking: ['wild', 'marking', 'ohren', 'ruecken', 'fleck'],
  spotPattern: ['spot', 'fleck', 'gesicht', 'koerper'],
  earPosture: ['ear', 'ohr', 'haltung', 'posture'],
  earForm: ['ear', 'ohr', 'form'],
  earMark: ['earmark', 'ohrmarke', 'loch', 'ear'],
  tailType: ['tail', 'schwanz'],
  skinColor: ['skin', 'haut', 'rosa'],
  backColor: ['back', 'ruecken'],
  skinCondition: ['skin', 'haut'],
  sizeClass: ['size', 'groesse'],
  tusksVisible: ['tusk', 'stosszahn'],
  humpPresent: ['hump', 'buckel'],
  bodyShape: ['shape', 'koerper'],
  livesAlone: ['alone', 'allein']
};

const QUESTION_PREFERRED_PIGS = {
  spotPattern: ['Kiwi']
};

function indexCuesByPig() {
  const byPig = new Map();

  Object.entries(cueModules).forEach(([path, url]) => {
    const match = path.match(/\/pig-cues\/([^/]+)\/([^/]+)$/);
    if (!match) {
      return;
    }

    const pigName = decodeURIComponent(match[1]);
    const fileName = decodeURIComponent(match[2]);

    if (!byPig.has(pigName)) {
      byPig.set(pigName, []);
    }

    byPig.get(pigName).push({
      url,
      fileName,
      baseName: fileName.replace(/\.[^.]+$/, ''),
      normalized: fileName.toLowerCase()
    });
  });

  return byPig;
}

const cueIndex = indexCuesByPig();

function getKiwiSpotCue() {
  const kiwiCues = cueIndex.get('Kiwi') || [];
  return kiwiCues.find((cue) => cue.baseName.toLowerCase() === 'kiwi_flecken')?.url || null;
}

function getFranzTailCue() {
  const franzCues = cueIndex.get('Franz') || [];
  return franzCues.find((cue) => cue.baseName.toLowerCase() === 'tailtype_')?.url || null;
}

function scoreCueForQuestion(cue, questionKey) {
  if (!questionKey) {
    return 0;
  }

  const normalizedQuestion = questionKey.toLowerCase();
  const normalizedBase = cue.baseName.toLowerCase();

  if (
    normalizedBase === normalizedQuestion ||
    normalizedBase.startsWith(`${normalizedQuestion}_`) ||
    normalizedBase.startsWith(`${normalizedQuestion}-`)
  ) {
    return 100;
  }

  const hints = QUESTION_HINTS[questionKey] || [];
  for (const hint of hints) {
    if (
      normalizedBase === hint ||
      normalizedBase.startsWith(`${hint}_`) ||
      normalizedBase.startsWith(`${hint}-`)
    ) {
      return 20;
    }
  }

  return 0;
}

function sortCuesForQuestion(cues, questionKey) {
  return [...cues].sort((a, b) => {
    const scoreDiff = scoreCueForQuestion(b, questionKey) - scoreCueForQuestion(a, questionKey);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return a.fileName.localeCompare(b.fileName, 'de');
  });
}

function prioritizePigNamesForQuestion(names, questionKey) {
  const preferred = QUESTION_PREFERRED_PIGS[questionKey] || [];
  if (!preferred.length) {
    return [...names];
  }

  return [...names].sort((a, b) => {
    const aPriority = preferred.indexOf(a);
    const bPriority = preferred.indexOf(b);
    const normalizedAPriority = aPriority === -1 ? Number.MAX_SAFE_INTEGER : aPriority;
    const normalizedBPriority = bPriority === -1 ? Number.MAX_SAFE_INTEGER : bPriority;

    if (normalizedAPriority !== normalizedBPriority) {
      return normalizedAPriority - normalizedBPriority;
    }

    return 0;
  });
}

export function getCueImageForAnimalAndQuestion(name, questionKey) {
  if (name === 'Kiwi' && questionKey === 'spotPattern') {
    const kiwiSpotCue = getKiwiSpotCue();
    if (kiwiSpotCue) {
      return kiwiSpotCue;
    }
  }

  const cues = cueIndex.get(name) || [];
  const sorted = sortCuesForQuestion(cues, questionKey);
  const matching = sorted.filter((cue) => scoreCueForQuestion(cue, questionKey) > 0);
  return matching.length > 0 ? matching[0].url : null;
}

export function getQuestionCueGallery(candidateNames, questionKey, options = {}) {
  const maxPigs = options.maxPigs || 4;
  const maxImagesPerPig = options.maxImagesPerPig || 2;

  if (questionKey === 'spotPattern') {
    const kiwiSpotCue = getKiwiSpotCue();
    if (kiwiSpotCue) {
      return [
        {
          name: 'Kiwi',
          images: [kiwiSpotCue]
        }
      ];
    }
  }

  if (questionKey === 'tailType') {
    const franzTailCue = getFranzTailCue();
    if (franzTailCue) {
      return [
        {
          name: 'Franz',
          images: [franzTailCue]
        }
      ];
    }
  }

  const names = prioritizePigNamesForQuestion(candidateNames || [], questionKey).slice(0, maxPigs);

  return names
    .map((name) => {
      const cues = cueIndex.get(name) || [];
      if (!cues.length) {
        return null;
      }

      const sorted = sortCuesForQuestion(cues, questionKey).filter(
        (cue) => scoreCueForQuestion(cue, questionKey) > 0
      );
      const images = sorted.slice(0, maxImagesPerPig).map((cue) => cue.url);
      if (!images.length) {
        return null;
      }

      return {
        name,
        images
      };
    })
    .filter(Boolean);
}
