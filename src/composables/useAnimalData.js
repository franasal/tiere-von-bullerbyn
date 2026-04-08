// src/composables/useAnimalData.js
import Papa from 'papaparse';

const CACHE_KEY = 'animal_info_v1';
const SPECIES_KEY = 'animal_species_v1';
const TTL = 24 * 60 * 60 * 1000; // 24h

function parseAnimalDescriptionsMarkdown(markdown) {
  const text = (markdown || '').replace(/\r\n/g, '\n');
  const sections = text.split(/^## /m).slice(1);
  const descriptions = {};

  sections.forEach((section) => {
    const [headingLine, ...restLines] = section.split('\n');
    const name = headingLine?.trim();
    if (!name) return;

    const rest = restLines.join('\n');
    const appearanceMatch = rest.match(/### Erscheinung\n([\s\S]*?)(?:\n### Geschichte|\n*$)/);
    const storyMatch = rest.match(/### Geschichte\n([\s\S]*?)$/);

    const appearance = (appearanceMatch?.[1] || '').trim();
    const story = (storyMatch?.[1] || '').trim();

    descriptions[name] = {
      appearance_description: appearance === '-' ? '' : appearance,
      general_description: story === '-' ? '' : story
    };
  });

  return descriptions;
}

function mergeDescriptions(info, descriptions) {
  const mergedInfo = { ...(info || {}) };

  Object.entries(descriptions || {}).forEach(([name, content]) => {
    if (!mergedInfo[name]) return;
    mergedInfo[name] = {
      ...mergedInfo[name],
      appearance_description: content.appearance_description || '',
      general_description: content.general_description || ''
    };
  });

  return mergedInfo;
}

export async function loadFromLocalMirror() {
  try {
    // Vite can import JSON; default export holds the object
    const [m, descriptionsRaw] = await Promise.all([
      import('../data/animals.json'),
      import('../data/animal-descriptions.md?raw')
    ]);
    const mirror = m.default || m;
    const descriptions = parseAnimalDescriptionsMarkdown(descriptionsRaw.default || descriptionsRaw);
    return {
      info: mergeDescriptions(mirror?.info || {}, descriptions),
      species: mirror?.species || [],
    };
  } catch {
    return { info: {}, species: [] };
  }
}

export function loadFromCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    const cachedSpecies = JSON.parse(localStorage.getItem(SPECIES_KEY) || 'null');
    if (cached && cachedSpecies && Date.now() - cached.timestamp < TTL) {
      return { info: cached.data, species: cachedSpecies };
    }
  } catch {}
  return null;
}

export function mergeAnimalSources(primary, secondary) {
  const primaryInfo = primary?.info || {};
  const secondaryInfo = secondary?.info || {};
  const mergedInfo = { ...secondaryInfo, ...primaryInfo };

  Object.keys(secondaryInfo).forEach((name) => {
    if (!mergedInfo[name]) return;
    if ('image_url' in secondaryInfo[name]) {
      mergedInfo[name].image_url = secondaryInfo[name].image_url || '';
    }
    if ('appearance_description' in secondaryInfo[name]) {
      mergedInfo[name].appearance_description = secondaryInfo[name].appearance_description || '';
    }
    if ('general_description' in secondaryInfo[name]) {
      mergedInfo[name].general_description = secondaryInfo[name].general_description || '';
    }
  });

  const mergedSpecies = Array.from(
    new Set([...(secondary?.species || []), ...(primary?.species || [])])
  );

  return {
    info: mergedInfo,
    species: mergedSpecies
  };
}

export function saveCache(info, species) {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ data: info, timestamp: Date.now() })
  );
  localStorage.setItem(SPECIES_KEY, JSON.stringify(species));
}

export async function fetchFromGoogle(csvUrl) {
  const res = await fetch(csvUrl, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const csvText = await res.text();

  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

  const info = {};
  const speciesSet = new Set();

  parsed.data.forEach((row) => {
    const name = row.name?.trim();
    const rawSpecies = row.species?.trim().toLowerCase();
    if (!name || !rawSpecies) return;

    let species = rawSpecies;
    if (rawSpecies === 'pig' || rawSpecies === 'wild_boar') species = 'pigs';

    info[name] = row;
    speciesSet.add(species);
  });

  return { info, species: Array.from(speciesSet) };
}
