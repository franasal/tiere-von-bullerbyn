/**
 * Central species theme definitions.
 *
 * Every species colour lives here. Components import getThemeVars()
 * and bind the result to :style — no colour literals elsewhere.
 *
 * Naming convention for the CSS custom properties:
 *   --group-accent-*   primary action colour (option buttons, accents)
 *   --group-secondary-* back / secondary button colour
 *   --group-tertiary-*  reset / tertiary button colour
 *   --group-link-*      browse-link styling
 *   --group-text        text colour on soft/card backgrounds
 */

// ── raw colour tokens per species ──────────────────────────────────

const SPECIES_THEMES = {
  pigs: {
    accentSoft: '#fce4ec',
    accentBorder: '#f8bbd0',
    accent: '#f48fb1',
    accentStrong: '#ec407a',
    accentText: '#5a3044',
    text: '#880e4f',

    secondary: '#d1c4e9',
    secondaryStrong: '#9575cd',
    secondaryText: '#4527a0',

    tertiary: '#ffccbc',
    tertiaryStrong: '#ff8a65',
    tertiaryText: '#5d4037',

    linkBg: '#fff1f5',
    linkBorder: '#f48fb1',
    linkHover: '#fce4ec'
  },

  goat: {
    accentSoft: '#efebe9',
    accentBorder: '#d7ccc8',
    accent: '#bcaaa4',
    accentStrong: '#8d6e63',
    accentText: '#4e342e',
    text: '#3e2723',

    secondary: '#dcedc8',
    secondaryStrong: '#7cb342',
    secondaryText: '#33691e',

    tertiary: '#ffe0b2',
    tertiaryStrong: '#fb8c00',
    tertiaryText: '#6d4c41',

    linkBg: '#f7f1ed',
    linkBorder: '#a1887f',
    linkHover: '#efebe9'
  },

  sheep: {
    accentSoft: '#eceff1',
    accentBorder: '#cfd8dc',
    accent: '#b0bec5',
    accentStrong: '#607d8b',
    accentText: '#37474f',
    text: '#263238',

    secondary: '#d1c4e9',
    secondaryStrong: '#7e57c2',
    secondaryText: '#4a148c',

    tertiary: '#f5f5f5',
    tertiaryStrong: '#90a4ae',
    tertiaryText: '#455a64',

    linkBg: '#f4f7f8',
    linkBorder: '#90a4ae',
    linkHover: '#eceff1'
  },

  equine: {
    accentSoft: '#eef3ff',
    accentBorder: '#b7c9ff',
    accent: '#8eaafc',
    accentStrong: '#5c7cfa',
    accentText: '#2f437f',
    text: '#2a3b70',

    secondary: '#e3ecff',
    secondaryStrong: '#7c98ff',
    secondaryText: '#31457f',

    tertiary: '#f2f6ff',
    tertiaryStrong: '#91a8ff',
    tertiaryText: '#40558f',

    linkBg: '#f5f8ff',
    linkBorder: '#8eaafc',
    linkHover: '#eef3ff'
  },

  cow: {
    accentSoft: '#fff3e0',
    accentBorder: '#ffcc80',
    accent: '#ffb74d',
    accentStrong: '#fb8c00',
    accentText: '#6d4c41',
    text: '#4e342e',

    secondary: '#d7ccc8',
    secondaryStrong: '#8d6e63',
    secondaryText: '#4e342e',

    tertiary: '#fff8e1',
    tertiaryStrong: '#ffb300',
    tertiaryText: '#6d4c41',

    linkBg: '#fff7eb',
    linkBorder: '#ffb74d',
    linkHover: '#fff3e0'
  },

  dog: {
    accentSoft: '#e8f5e9',
    accentBorder: '#a5d6a7',
    accent: '#81c784',
    accentStrong: '#43a047',
    accentText: '#2e5d34',
    text: '#1b5e20',

    secondary: '#dcedc8',
    secondaryStrong: '#7cb342',
    secondaryText: '#33691e',

    tertiary: '#fff8e1',
    tertiaryStrong: '#f9a825',
    tertiaryText: '#6d4c41',

    linkBg: '#f1f8e9',
    linkBorder: '#81c784',
    linkHover: '#e8f5e9'
  }
};

// ── species key normalisation ──────────────────────────────────────

const SPECIES_KEY_MAP = {
  pig: 'pigs',
  wild_boar: 'pigs',
  pigs: 'pigs',
  goat: 'goat',
  sheep: 'sheep',
  equine: 'equine',
  cow: 'cow',
  dog: 'dog'
};

export function toThemeKey(species) {
  return SPECIES_KEY_MAP[species] || species;
}

// ── CSS custom-property builder ────────────────────────────────────

export function getThemeVars(species) {
  const key = toThemeKey(species);
  const t = SPECIES_THEMES[key];
  if (!t) return {};

  return {
    // primary
    '--group-accent-soft': t.accentSoft,
    '--group-accent-border': t.accentBorder,
    '--group-accent': t.accent,
    '--group-accent-strong': t.accentStrong,
    '--group-accent-text': t.accentText,
    '--group-text': t.text,

    // secondary
    '--group-secondary': t.secondary,
    '--group-secondary-strong': t.secondaryStrong,
    '--group-secondary-text': t.secondaryText,

    // tertiary
    '--group-tertiary': t.tertiary,
    '--group-tertiary-strong': t.tertiaryStrong,
    '--group-tertiary-text': t.tertiaryText,

    // link
    '--group-link-bg': t.linkBg,
    '--group-link-border': t.linkBorder,
    '--group-link-hover': t.linkHover
  };
}
