import { pigProfiles, pigQuestions, traitMeta } from './pigIdentifier.js';

/**
 * Resolve a trait key+value to a human-readable label.
 */
function resolveTraitLabel(key, value) {
  const question = pigQuestions.find((q) => q.key === key);
  return question?.options?.[value] || value;
}

/**
 * Return the 2-3 traits that most distinguish a pig from all others.
 * Traits shared by fewer other pigs rank higher.
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

  scored.sort((a, b) => a.sharedBy - b.sharedBy);
  return scored.slice(0, 3);
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
