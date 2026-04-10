import { pigProfiles, pigQuestions, traitMeta } from './pigIdentifier.js';

/**
 * Resolve a trait key+value to a human-readable label.
 */
function resolveTraitLabel(key, value) {
  const question = pigQuestions.find((q) => q.key === key);
  return question?.options?.[value] || value;
}

// Explicit morphology chip order per pig, aligned with the appearance copy.
const UNIQUE_TRAIT_OVERRIDES = {
  Franz: [
    { key: 'sex' },
    { key: 'earMark' },
    { key: 'earForm' },
    { key: 'tailType', value: 'Lang ohne Haare' },
    { key: 'bristleAmount', value: 'Wenig Borsten' }
  ],
  Kiwi: [
    { key: 'sex' },
    { key: 'spotsPresent', value: 'Flecken sichtbar' },
    { key: 'spotPattern' },
    { key: 'earMark' },
    { key: 'earForm' },
    { key: 'tailType', value: 'Kurz' }
  ],
  Ronja: [
    { key: 'sex' },
    { key: 'earMark' },
    { key: 'spotsPresent', value: 'Flecken sichtbar' },
    { key: 'spotPattern' },
    { key: 'earForm' },
    { key: 'tailType', value: 'Kurz' }
  ],
  Ferdinand: [
    { key: 'sex' },
    { key: 'earMark' },
    { key: 'earForm' },
    { key: 'tailType', value: 'Kurz' }
  ],
  Hedda: [
    { key: 'sex' },
    { key: 'earMark' },
    { key: 'earPosture' },
    { key: 'tailType', value: 'Lang mit Haaren' },
    { key: 'bristleAmount', value: 'Viele Borsten' }
  ],
  Nia: [
    { key: 'sex' },
    { key: 'earMark' },
    { key: 'earPosture' },
    { key: 'tailType', value: 'Lang ohne Haare' },
    { key: 'bristleAmount', value: 'Wenig Borsten' }
  ],
  Feline: [
    { key: 'sex' },
    { key: 'earMark' },
    { key: 'spotsPresent', value: 'Flecken sichtbar' },
    { key: 'spotPattern' },
    { key: 'tailType', value: 'Kurz' },
    { key: 'bristleAmount', value: 'Wenig Borsten' }
  ],
  Rosalie: [
    { key: 'sex' },
    { key: 'earMark' },
    { key: 'tailType', value: 'Kurz' },
    { key: 'mobility', value: 'Steife Hüfte / auffälliger Gang' }
  ],
  Hope: [
    { key: 'sex' },
    { key: 'earMark' },
    { key: 'tailType', value: 'Lang, geringelt, mit Haaren' },
    { key: 'earSlit', value: 'Schlitz im linken Ohr' }
  ],
  Justus: [
    { key: 'sex' },
    { key: 'coatAppearance' },
    { key: 'bristleAmount', value: 'Viele Borsten' }
  ],
  Maike: [
    { key: 'sex' },
    { key: 'coatAppearance' },
    { key: 'earForm' },
    { key: 'bristleAmount', value: 'Viele Borsten' }
  ],
  Milli: [
    { key: 'sex' },
    { key: 'pigType', value: 'Hängebauchschwein' },
    { key: 'coatAppearance' },
    { key: 'noseColor' }
  ],
  Vanilli: [
    { key: 'sex' },
    { key: 'coatAppearance' },
    { key: 'noseColor' }
  ],
  Strolch: [
    { key: 'sex' },
    { key: 'coatAppearance' },
    { key: 'tusksVisible', value: 'Stoßzähne' }
  ],
  Susi: [
    { key: 'sex' },
    { key: 'coatAppearance' },
    { key: 'noseColor' }
  ],
  Frida: [
    { key: 'sex' },
    { key: 'earMark', value: 'Links' },
    { key: 'tailType', value: 'Kurz' },
    { key: 'frontArea', value: 'Ja, vorne bei den Menschen' },
  ],
  Lili: [
    { key: 'sex' },
    { key: 'pigType', value: 'Wildschweinartig mit dichtem Fell' },
    { key: 'coatAppearance' },
    { key: 'wildBoarMarking' }
  ],
  Gezi: [
    { key: 'sex' },
    { key: 'pigType', value: 'Wildschweinartig mit dichtem Fell' },
    { key: 'coatAppearance' },
    { key: 'wildBoarMarking' }
  ]
};

/**
 * Return the morphology traits that should appear in "So erkennst du mich".
 * These are curated per pig to match the appearance description, while
 * intentionally omitting skin color chips like "Rosa".
 */
export function getUniqueTraits(pigName) {
  const pig = pigProfiles.find((p) => p.name === pigName);
  if (!pig) return [];

  const others = pigProfiles.filter((p) => p.name !== pigName);
  const scored = [];

  for (const [key, value] of Object.entries(pig.traits)) {
    const sharedCount = others.filter((o) => o.traits[key] === value).length;
    const meta = traitMeta[key] || {};
    scored.push({
      key,
      valueKey: value,
      value: resolveTraitLabel(key, value),
      icon: meta.icon || '?',
      label: meta.label || key,
      sharedBy: sharedCount
    });
  }

  const overrideKeys = UNIQUE_TRAIT_OVERRIDES[pigName];
  if (overrideKeys?.length) {
    return overrideKeys
      .map((override) => {
        const trait = scored.find((item) => item.key === override.key);
        if (!trait) return null;
        return override.value
          ? { ...trait, value: override.value }
          : trait;
      })
      .filter(Boolean);
  }
  return scored
    .filter((trait) => trait.key !== 'skinColor')
    .sort((a, b) => a.sharedBy - b.sharedBy);
}

/**
 * Return 1-3 animals most similar to the given pig,
 * each annotated with the key differences.
 */
export function getSimilarAnimals(pigName) {
  const pig = pigProfiles.find((p) => p.name === pigName);
  if (!pig) return [];

  const others = pigProfiles.filter((p) => p.name !== pigName);

  const scored = others.map((other) => {
    const allKeys = new Set([...Object.keys(pig.traits), ...Object.keys(other.traits)]);
    let overlap = 0;
    const differences = [];

    for (const key of allKeys) {
      const myVal = pig.traits[key];
      const theirVal = other.traits[key];
      if (myVal === theirVal && myVal !== undefined) {
        overlap++;
      } else if (myVal !== undefined && theirVal !== undefined) {
        const meta = traitMeta[key] || {};
        differences.push({
          key,
          label: meta.label || key,
          icon: meta.icon || '?',
          thisValue: resolveTraitLabel(key, myVal),
          otherValue: resolveTraitLabel(key, theirVal)
        });
      }
    }

    return { name: other.name, overlap, differences };
  });

  scored.sort((a, b) => b.overlap - a.overlap);
  return scored
    .filter((s) => s.overlap >= 2)
    .slice(0, 3);
}

/**
 * Given 2-3 candidate names, return the traits where they differ,
 * with per-pig values — powers the ComparisonView.
 */
export function getDifferentiatingTraits(candidateNames) {
  const candidates = candidateNames
    .map((name) => pigProfiles.find((p) => p.name === name))
    .filter(Boolean);

  if (candidates.length < 2) return [];

  const allKeys = new Set();
  candidates.forEach((c) => Object.keys(c.traits).forEach((k) => allKeys.add(k)));

  const result = [];
  for (const key of allKeys) {
    const values = {};
    candidates.forEach((c) => {
      values[c.name] = c.traits[key] !== undefined
        ? resolveTraitLabel(key, c.traits[key])
        : '—';
    });

    const uniqueValues = new Set(Object.values(values));
    if (uniqueValues.size > 1) {
      const meta = traitMeta[key] || {};
      result.push({
        key,
        label: meta.label || key,
        icon: meta.icon || '?',
        values
      });
    }
  }

  return result;
}

/**
 * Return all trait keys that are used across pigProfiles
 * with their possible values — used by admin mode to know
 * which trait photos are needed per pig.
 */
export function getTraitKeysForPig(pigName) {
  const pig = pigProfiles.find((p) => p.name === pigName);
  if (!pig) return [];

  return Object.entries(pig.traits).map(([key, value]) => {
    const meta = traitMeta[key] || {};
    return {
      key,
      valueKey: value,
      label: meta.label || key,
      icon: meta.icon || '?',
      valueLabel: resolveTraitLabel(key, value)
    };
  });
}
