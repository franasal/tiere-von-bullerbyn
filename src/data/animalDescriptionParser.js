const STORY_META_FIELDS = [
  ['Ankunftsalter', 'ankunftsalter'],
  ['Art', 'art'],
  ['Herkunft', 'herkunft'],
  ['Retterin', 'retterin'],
  ['Retter', 'retter']
];

function normalizeBlockText(value) {
  return String(value || '')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractStoryMeta(...blocks) {
  const metadata = {};
  const keysByLabel = new Map(STORY_META_FIELDS);

  const cleanedBlocks = blocks.map((block) => String(block || '')
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      const match = trimmed.match(/^([^:]+):\s*(.+)$/);
      if (!match) return true;

      const key = keysByLabel.get(match[1].trim());
      if (!key) return true;

      metadata[key] = match[2].trim();
      return false;
    })
    .join('\n'));

  return {
    metadata,
    cleanedBlocks: cleanedBlocks.map(normalizeBlockText)
  };
}

function extractSubsection(rest, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = rest.match(new RegExp(`### ${escapedHeading}\\n([\\s\\S]*?)(?=\\n### |$)`));
  return (match?.[1] || '').trim();
}

function parseTraitBlock(block) {
  const traits = {};
  const content = String(block || '')
    .replace(/^```[^\n]*\n?/, '')
    .replace(/\n```$/, '')
    .trim();

  if (!content) {
    return traits;
  }

  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const match = trimmed.match(/^([a-zA-Z0-9_]+):\s*(.+)$/);
    if (!match) {
      return;
    }

    traits[match[1]] = match[2].trim();
  });

  return traits;
}

export function parseAnimalDescriptionSections(markdown) {
  const text = (markdown || '').replace(/\r\n/g, '\n');
  const sections = text.split(/^## /m).slice(1);
  const parsed = {};

  sections.forEach((section) => {
    const [headingLine, ...restLines] = section.split('\n');
    const name = headingLine?.trim();
    if (!name) return;

    const rest = restLines.join('\n');
    parsed[name] = {
      appearance: extractSubsection(rest, 'Erscheinung'),
      traitBlock: extractSubsection(rest, 'Merkmale'),
      story: extractSubsection(rest, 'Geschichte')
    };
  });

  return parsed;
}

export function parseAnimalDescriptionsMarkdown(markdown) {
  const sections = parseAnimalDescriptionSections(markdown);
  const descriptions = {};

  Object.entries(sections).forEach(([name, content]) => {
    const { metadata, cleanedBlocks } = extractStoryMeta(content.appearance, content.story);
    const [cleanAppearance, cleanStory] = cleanedBlocks;
    const traits = parseTraitBlock(content.traitBlock);

    descriptions[name] = {
      appearance_description: cleanAppearance === '-' ? '' : cleanAppearance,
      general_description: cleanStory === '-' ? '' : cleanStory,
      rescue_meta: metadata,
      traits
    };
  });

  return descriptions;
}

export function parsePigProfilesFromMarkdown(markdown) {
  const sections = parseAnimalDescriptionSections(markdown);

  return Object.entries(sections)
    .map(([name, content]) => {
      const traits = parseTraitBlock(content.traitBlock);
      if (!traits.pigType) {
        return null;
      }

      return { name, traits };
    })
    .filter(Boolean);
}
