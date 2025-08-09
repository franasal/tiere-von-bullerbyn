// scripts/build-animals.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import Papa from 'papaparse';
import fetch from 'node-fetch';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRSwkMhkHBGiBOUD8ls5SLwKzJxYf0-R0FNcyqHM6hOR4Ftvb62um8QfrwC77VWEoxatrkJV6GRcySP/pub?output=csv';

async function main() {
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const csvText = await res.text();

  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

  const info = {};
  const speciesSet = new Set();

  for (const row of parsed.data) {
    const name = row.name?.trim();
    const rawSpecies = row.species?.trim()?.toLowerCase();
    if (!name || !rawSpecies) continue;

    let species = rawSpecies;
    if (rawSpecies === 'pig' || rawSpecies === 'wild_boar') species = 'pigs';

    info[name] = row;
    speciesSet.add(species);
  }

  const out = {
    info,
    species: Array.from(speciesSet)
  };

  const outPath = path.resolve('src/data/animals.json');
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log(`Wrote ${outPath} with ${Object.keys(info).length} entries, species: ${out.species.join(', ')}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
