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
  Kiwi: { menschenfreundlichkeit: 5, aktivitaet: 3, neugier: 5 },
  Ronja: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Ferdinand: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Hedda: { menschenfreundlichkeit: 1, aktivitaet: 3, neugier: 3 },
  Nia: { menschenfreundlichkeit: 1, aktivitaet: 3, neugier: 1 },
  Feline: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Rosalie: { menschenfreundlichkeit: 3, aktivitaet: 1, neugier: 3 },
  Hope: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 5 },
  Justus: { menschenfreundlichkeit: 3, aktivitaet: 1, neugier: 1 },
  Maike: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Milli: { menschenfreundlichkeit: 3, aktivitaet: 1, neugier: 3 },
  Vanilli: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 5 },
  Strolch: { menschenfreundlichkeit: 1, aktivitaet: 3, neugier: 3 },
  Susi: { menschenfreundlichkeit: 3, aktivitaet: 1, neugier: 3 },
  Frida: { menschenfreundlichkeit: 3, aktivitaet: 1, neugier: 1 },
  Lili: { menschenfreundlichkeit: 1, aktivitaet: 3, neugier: 5 },
  Gezi: { menschenfreundlichkeit: 1, aktivitaet: 3, neugier: 3 },
  Emil: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 5 },
  Markus: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Yoda: { menschenfreundlichkeit: 3, aktivitaet: 1, neugier: 3 },
  Jule: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Timon: { menschenfreundlichkeit: 5, aktivitaet: 5, neugier: 5 },
  August: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Schneeweisschen: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Henry: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Carlos: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Samu: { menschenfreundlichkeit: 1, aktivitaet: 3, neugier: 3 },
  Raven: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Lissi: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Lisso: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Senta: { menschenfreundlichkeit: 3, aktivitaet: 1, neugier: 3 },
  Pablo: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Miela: { menschenfreundlichkeit: 5, aktivitaet: 1, neugier: 3 },
  Kasper: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 5 },
  'Peter-Charlie': { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Greta: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Grumpy: { menschenfreundlichkeit: 1, aktivitaet: 1, neugier: 1 },
  Romeo: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Giulia: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Prue: { menschenfreundlichkeit: 5, aktivitaet: 3, neugier: 3 },
  Piper: { menschenfreundlichkeit: 5, aktivitaet: 3, neugier: 3 },
  Ziggy: { menschenfreundlichkeit: 5, aktivitaet: 5, neugier: 5 },
  Eli: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Bobby: { menschenfreundlichkeit: 5, aktivitaet: 3, neugier: 3 },
  Jina: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 },
  Grinch: { menschenfreundlichkeit: 3, aktivitaet: 3, neugier: 3 }
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
