import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'src/data/licence.json');
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

  console.log(`Licence text matches parity.lock (sha256 ${hash.slice(0, 12)}…).`);
}
