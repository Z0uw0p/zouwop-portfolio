import { existsSync, statSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const DIST = path.resolve('dist');
const ATTRIBUTE_RE = /\b(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
const SKIP_RE = /^(?:https?:|\/\/|mailto:|tel:|data:|blob:|javascript:|#?$)/i;

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(full)));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

function resolveTarget(root, fromFile, pathname) {
  const rootDir = path.resolve(root);
  const base = pathname.startsWith('/') ? rootDir : path.dirname(fromFile);
  const relative = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  const candidate = path.resolve(base, relative);
  if (candidate !== rootDir && !candidate.startsWith(rootDir + path.sep)) return null;

  const options = [candidate];
  if (pathname.endsWith('/')) options.push(path.join(candidate, 'index.html'));
  else options.push(`${candidate}.html`, path.join(candidate, 'index.html'));

  return options.find((option) => existsSync(option) && statSync(option).isFile()) ?? null;
}

async function anchorsIn(file, cache) {
  if (!cache.has(file)) {
    const html = await readFile(file, 'utf8');
    const ids = new Set();
    for (const match of html.matchAll(/\b(?:id|name)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
      ids.add(match[1] ?? match[2]);
    }
    cache.set(file, ids);
  }
  return cache.get(file);
}

export async function scan(root) {
  const rootDir = path.resolve(root);
  const files = await htmlFiles(rootDir);
  const broken = [];
  const anchorCache = new Map();
  let checked = 0;

  for (const file of files) {
    const html = await readFile(file, 'utf8');
    for (const match of html.matchAll(ATTRIBUTE_RE)) {
      const target = (match[1] ?? match[2] ?? '').trim();
      if (!target || SKIP_RE.test(target)) continue;
      checked += 1;

      const hashIndex = target.indexOf('#');
      const hash = hashIndex >= 0 ? decode(target.slice(hashIndex + 1)) : '';
      const withoutHash = hashIndex >= 0 ? target.slice(0, hashIndex) : target;
      const queryIndex = withoutHash.indexOf('?');
      const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;

      let resolved = file;
      if (pathname) {
        resolved = resolveTarget(rootDir, file, decode(pathname));
        if (!resolved) {
          broken.push({ file, target, reason: `missing file ${pathname}` });
          continue;
        }
      }

      if (hash && resolved.endsWith('.html')) {
        const ids = await anchorsIn(resolved, anchorCache);
        if (!ids.has(hash)) {
          broken.push({ file, target, reason: `missing anchor #${hash}` });
        }
      }
    }
  }

  return { broken, checked };
}

async function selfTest() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'link-check-'));
  try {
    await mkdir(path.join(dir, 'ok'), { recursive: true });
    await writeFile(
      path.join(dir, 'index.html'),
      '<a href="/ok">ok</a><a href="/ok/#target">anchor</a><a href="/ok/#missing">bad anchor</a><a href="/nope">bad file</a><a href="https://example.com">external</a>',
    );
    await writeFile(path.join(dir, 'ok', 'index.html'), '<h1 id="target">ok</h1>');

    const { broken, checked } = await scan(dir);
    const caught = broken.map((entry) => entry.target).sort();
    const expected = ['/nope', '/ok/#missing'].sort();

    if (caught.length !== expected.length || caught.some((value, index) => value !== expected[index])) {
      throw new Error(`expected ${JSON.stringify(expected)}, caught ${JSON.stringify(caught)}`);
    }

    console.log(`Self-test passed: caught ${broken.length} broken links across ${checked} checked.`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

if (process.argv.includes('--self-test')) {
  await selfTest();
} else {
  if (!existsSync(DIST)) {
    console.error('dist/ not found — run npm run build first.');
    process.exit(1);
  }
  const { broken, checked } = await scan(DIST);
  if (broken.length > 0) {
    for (const entry of broken) {
      console.error(`${path.relative(DIST, entry.file)}: ${entry.target} (${entry.reason})`);
    }
    console.error(`\n${broken.length} broken internal link(s) across ${checked} checked.`);
    process.exit(1);
  }
  console.log(`Checked ${checked} internal links — all resolve.`);
}
