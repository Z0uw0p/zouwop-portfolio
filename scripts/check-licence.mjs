import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'src/data/licence.json');
const FULFILMENT = path.join(ROOT, 'src/data/fulfilment.ts');
const LOCK = path.join(ROOT, 'licence/parity.lock');
const TXT = path.join(ROOT, 'licence/LICENSE.txt');

export function renderLicence(licence) {
  const lines = [];
  lines.push('LICENCE — Zouwop');
  lines.push(`Last updated: ${licence.updated}`);
  lines.push('');
  lines.push(licence.rule);

  for (const id of licence.order) {
    const section = licence.sections[id];
    if (!section) throw new Error(`Unknown licence section: ${id}`);
    lines.push('');
    lines.push(section.title.toUpperCase());
    for (const item of section.items) {
      lines.push('');
      lines.push(item.title);
      lines.push(item.body);
    }
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
}

// The machine-readable fulfilment values live in `src/data/fulfilment.ts`. Read
// them here so the licence prose is asserted against a single source instead of
// hardcoding `12` and `30` a second time.
function readFulfilmentNumbers() {
  const src = readFileSync(FULFILMENT, 'utf8');
  const num = (name) => {
    const match = src.match(new RegExp(`export const ${name} = (\\d+);`));
    if (!match) throw new Error(`Could not read ${name} from src/data/fulfilment.ts`);
    return Number(match[1]);
  };
  return { UPDATES_MONTHS: num('UPDATES_MONTHS'), SUPPORT_DAYS: num('SUPPORT_DAYS') };
}

const data = JSON.parse(readFileSync(DATA, 'utf8'));
const text = renderLicence(data);
const hash = createHash('sha256').update(text).digest('hex');

if (process.argv.includes('--write')) {
  mkdirSync(path.dirname(TXT), { recursive: true });
  writeFileSync(TXT, text);
  writeFileSync(LOCK, `${hash}\n`);
  console.log(`Wrote licence/LICENSE.txt and licence/parity.lock (sha256 ${hash}).`);
} else {
  let locked = '';
  try {
    locked = readFileSync(LOCK, 'utf8').trim();
  } catch {
    locked = '';
  }

  if (!locked) {
    console.error('licence/parity.lock is missing. Run: npm run licence:render');
    process.exit(1);
  }

  if (locked !== hash) {
    console.error('Licence text does not match licence/parity.lock.');
    console.error(`  expected ${locked}`);
    console.error(`  rendered ${hash}`);
    console.error('If the change is intentional: npm run licence:render, then copy licence/LICENSE.txt into the templates repo and update its pinned hash.');
    process.exit(1);
  }

  const { UPDATES_MONTHS, SUPPORT_DAYS } = readFulfilmentNumbers();
  const required = [
    `${UPDATES_MONTHS} months`,
    `${SUPPORT_DAYS} days`,
    'one business day',
  ];
  const missing = required.filter((fragment) => !text.includes(fragment));
  if (missing.length > 0) {
    console.error('Licence prose is missing wording the site promises:');
    for (const fragment of missing) console.error(`  - "${fragment}"`);
    console.error('Update src/data/licence.json so the prose matches src/data/fulfilment.ts, then run: npm run licence:render');
    process.exit(1);
  }

  console.log(`Licence text matches parity.lock (sha256 ${hash.slice(0, 12)}…).`);
}
