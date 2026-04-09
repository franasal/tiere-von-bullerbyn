export const CHARACTERISTIC_SCALE_MAX = 5;

export const CHARACTERISTIC_DEFINITIONS = [
  {
    key: 'menschenfreundlichkeit',
    icon: '🤗',
    label: 'Menschenfreundlich'
  },
  {
    key: 'aktivitaet',
    icon: '⚡',
    label: 'Aktivitaet'
  },
  {
    key: 'neugier',
    icon: '🔍',
    label: 'Neugier'
  }
];

// Central document for all 5-point characteristic ratings.
// Collaborators only need to edit this file.
export const ANIMAL_CHARACTERISTICS = {
  Franz: { menschenfreundlichkeit: 3, aktivitaet: 1, neugier: 3 },
  Kiwi: { menschenfreundlichkeit: 5, aktivitaet: 3, neugier: 3 },
  Ronja: { menschenfreundlichkeit: 5, aktivitaet: 3, neugier: 3 },
  Ferdinand: { menschenfreundlichkeit: 4, aktivitaet: 3, neugier: 3 },
  Hedda: { menschenfreundlichkeit: 1, aktivitaet: 3, neugier: 2 },
  Nia: { menschenfreundlichkeit: 3, aktivitaet: 2, neugier: 3 },
  Feline: { menschenfreundlichkeit: 2, aktivitaet: 3, neugier: 3 },
  Rosalie: { menschenfreundlichkeit: 4, aktivitaet: 3, neugier: 5 },
  Hope: { menschenfreundlichkeit: 5, aktivitaet: 4, neugier: 3 },
  Justus: { menschenfreundlichkeit: 4, aktivitaet: 1, neugier: 1 },
  Maike: { menschenfreundlichkeit: 4, aktivitaet: 5, neugier: 5 },
  Milli: { menschenfreundlichkeit: 2, aktivitaet: 1, neugier: 2 },
  Vanilli: { menschenfreundlichkeit: 2, aktivitaet: 2, neugier: 2 },
  Strolch: { menschenfreundlichkeit: 2, aktivitaet: 1, neugier: 2 },
  Susi: { menschenfreundlichkeit: 2, aktivitaet: 1, neugier: 2 },
  Frida: { menschenfreundlichkeit: 3, aktivitaet: 4, neugier: 3 },
  Lili: { menschenfreundlichkeit: 1, aktivitaet: 4, neugier: 4 },
  Gezi: { menschenfreundlichkeit: 3, aktivitaet: 5, neugier: 5 },
  Emil: { menschenfreundlichkeit: 3, aktivitaet: 5, neugier: 5 },
  Markus: { menschenfreundlichkeit: 2, aktivitaet: 3, neugier: 3 },
  Yoda: { menschenfreundlichkeit: 3, aktivitaet: 4, neugier: 5 },
  Jule: { menschenfreundlichkeit: 4, aktivitaet: 5, neugier: 5 },
  Timon: { menschenfreundlichkeit: 5, aktivitaet: 4, neugier: 5 },
  August: { menschenfreundlichkeit: 5, aktivitaet: 5, neugier: 5 },
  Schneeweisschen: { menschenfreundlichkeit: 1, aktivitaet: 4, neugier: 2 },
  Henry: { menschenfreundlichkeit: 5, aktivitaet: 4, neugier: 5 },
  Carlos: { menschenfreundlichkeit: 5, aktivitaet: 4, neugier: 5 },
  Samu: { menschenfreundlichkeit: 1, aktivitaet: 4, neugier: 1 },
  Raven: { menschenfreundlichkeit: 1, aktivitaet: 4, neugier: 1 },
  Lissi: { menschenfreundlichkeit: 4, aktivitaet: 3, neugier: 4 },
  Liso: { menschenfreundlichkeit: 5, aktivitaet: 4, neugier: 4 },
  Senta: { menschenfreundlichkeit: 2, aktivitaet: 3, neugier: 5 },
  Pablo: { menschenfreundlichkeit: 4, aktivitaet: 3, neugier: 5 },
  Miela: { menschenfreundlichkeit: 1, aktivitaet: 3, neugier: 2 },
  Kasper: { menschenfreundlichkeit: 5, aktivitaet: 5, neugier: 5 },
  'Peter-Charlie': { menschenfreundlichkeit: 4, aktivitaet: 4, neugier: 5 },
  Greta: { menschenfreundlichkeit: 4, aktivitaet: 4, neugier: 5 },
  Grumpy: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 5 },
  Romeo: { menschenfreundlichkeit: 4, aktivitaet: 3, neugier: 3 },
  Giulia: { menschenfreundlichkeit: 4, aktivitaet: 4, neugier: 5 },
  Prue: { menschenfreundlichkeit: 2, aktivitaet: 2, neugier: 2 },
  Piper: { menschenfreundlichkeit: 1, aktivitaet: 2, neugier: 2 },
  Ziggy: { menschenfreundlichkeit: 3, aktivitaet: 4, neugier: 4 },
  Eli: { menschenfreundlichkeit: 3, aktivitaet: 4, neugier: 4 },
  Bobby: { menschenfreundlichkeit: 4, aktivitaet: 2, neugier: 3 },
  Jina: { menschenfreundlichkeit: 5, aktivitaet: 4, neugier: 5 },
  Grinch: { menschenfreundlichkeit: 5, aktivitaet: 4, neugier: 5 },
  Toffie: { menschenfreundlichkeit: 3, aktivitaet: 1, neugier: 2 },
  Mau: { menschenfreundlichkeit: 4, aktivitaet: 4, neugier: 4 },
  Sari: { menschenfreundlichkeit: 3, aktivitaet: 2, neugier: 3 }
};

function normalizeCharacteristicName(name) {
  return String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss');
}

export function getAnimalCharacteristics(name) {
  if (ANIMAL_CHARACTERISTICS[name]) {
    return ANIMAL_CHARACTERISTICS[name];
  }

  const normalizedName = normalizeCharacteristicName(name);
  const match = Object.entries(ANIMAL_CHARACTERISTICS).find(
    ([candidate]) => normalizeCharacteristicName(candidate) === normalizedName
  );

  return match?.[1] || {};
}
