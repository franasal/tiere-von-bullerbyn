// src/composables/useAnimalData.js
import Papa from 'papaparse';

const CACHE_KEY = 'animal_info_v1';
const SPECIES_KEY = 'animal_species_v1';
const TTL = 24 * 60 * 60 * 1000; // 24h

export async function loadFromLocalMirror() {
  try {
    // Vite can import JSON; default export holds the object
    const m = await import('../data/animals.json');
    const mirror = m.default || m;
    return {
      info: mirror?.info || {},
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
