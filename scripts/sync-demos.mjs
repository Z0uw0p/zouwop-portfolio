#!/usr/bin/env node
/**
 * sync-demos.mjs — copy committed template demos into the store.
 *
 * The demos are build artifacts produced by the private templates repo
 * (Z0uw0p/templates, see its scripts/build-demos.mjs). This repo does not
 * build them; it only copies them from a local checkout into:
 *
 *   public/templates/<slug>/demo/
 *
 * A demo is only copied when src/data/demos.json marks its slug "available".
 * The committed fixture (scripts/fixtures/demos/) lets CI run --check without
 * access to the private templates repo.
 *
 * Usage:
 *
 *   npm run sync:demos -- --from ../templates
 *   npm run sync:demos -- --check
 *   npm run sync:demos -- --self-test
 *
 *   --from <dir>   read <dir>/release/demos/<slug>/
 *   --check        compare the committed output with the fixture; never writes
 *   --self-test    prove that a root-absolute asset URL fails the check
 *
 * Zero dependencies. Node 22.
 */

import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const MANIFEST = path.join(REPO_ROOT, 'src/data/demos.json');
const GENERATED_TS = path.join(REPO_ROOT, 'src/data/templates.generated.ts');
const PUBLIC_TEMPLATES = path.join(REPO_ROOT, 'public/templates');
const FIXTURE_DEMOS = path.join(REPO_ROOT, 'scripts/fixtures/demos');
const PUBLIC_DEMOS_REL = 'public/templates';

const ATTR_RE = /(?:^|\s)(src|href)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
const CSS_URL_RE = /url\(\s*["']?(\/[^"')]+)/gi;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function usage() {
  return `Usage:
  npm run sync:demos -- --from <templates-checkout>
  npm run sync:demos -- --check
  npm run sync:demos -- --self-test

Options:
  --from <dir>   read demos from <dir>/release/demos/<slug>/
  --check        compare committed demos with the fixture, write nothing
  --self-test    prove a root-absolute asset URL is rejected
  --help         show this message`;
}

function parseArgs(argv) {
  const options = { check: false, from: null, selfTest: false, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const equals = arg.indexOf('=');
    const name = equals >= 0 ? arg.slice(0, equals) : arg;
    const inlineValue = equals >= 0 ? arg.slice(equals + 1) : null;

    const takeValue = () => {
      if (inlineValue !== null) return inlineValue;
      const value = argv[index + 1];
      if (value === undefined || value.startsWith('--')) {
        throw new Error(`${name} requires a value\n\n${usage()}`);
      }
      index += 1;
      return value;
    };

    switch (name) {
      case '--from':
        options.from = takeValue();
        break;
      case '--check':
        options.check = true;
        break;
      case '--self-test':
        options.selfTest = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        throw new Error(`unknown option: ${arg}\n\n${usage()}`);
    }
  }

  return options;
}

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

function rel(file) {
  return path.relative(REPO_ROOT, file).split(path.sep).join('/');
}

async function isDirectory(target) {
  try {
    return (await readdir(target, { withFileTypes: true })) !== undefined;
  } catch {
    return false;
  }
}

async function listFiles(dir) {
  const files = [];
  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile()) files.push(full);
    }
  }
  await walk(dir);
  return files.sort();
}

async function listDirectories(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Inputs: demo manifest, catalog, committed fixture
// ---------------------------------------------------------------------------

async function readManifest() {
  let parsed;
  try {
    parsed = JSON.parse(await readFile(MANIFEST, 'utf8'));
  } catch (error) {
    throw new Error(`cannot read ${rel(MANIFEST)}: ${error.message}`);
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${rel(MANIFEST)}: root must be an object of slug -> { status }`);
  }

  const errors = [];
  const entries = new Map();
  for (const [slug, value] of Object.entries(parsed)) {
    if (typeof value !== 'object' || value === null) {
      errors.push(`${slug}: manifest entry must be an object`);
      continue;
    }
    if (value.status !== 'available' && value.status !== 'coming-soon') {
      errors.push(`${slug}: status must be "available" or "coming-soon"`);
      continue;
    }
    entries.set(slug, { status: value.status });
  }

  return { entries, errors };
}

async function readCatalogSlugs() {
  let text;
  try {
    text = await readFile(GENERATED_TS, 'utf8');
  } catch {
    return new Set();
  }
  try {
    const assignment = text.indexOf('=', text.indexOf('generatedTemplates'));
    const start = text.indexOf('[', assignment);
    const end = text.lastIndexOf(']');
    if (assignment < 0 || start < 0 || end < start) return new Set();
    const parsed = JSON.parse(text.slice(start, end + 1));
    return new Set(parsed.map((entry) => entry.slug));
  } catch {
    return new Set();
  }
}

// ---------------------------------------------------------------------------
// Validation: no root-absolute asset URLs
// ---------------------------------------------------------------------------

function absoluteUrls(html) {
  const found = [];
  for (const match of html.matchAll(ATTR_RE)) {
    const value = (match[2] ?? match[3] ?? '').trim();
    if (!value.startsWith('/') || value.startsWith('//') || value === '/') continue;
    found.push(value);
  }
  return found;
}

function absoluteCssUrls(css) {
  const found = [];
  for (const match of css.matchAll(CSS_URL_RE)) {
    const value = match[1];
    if (value.startsWith('//')) continue;
    found.push(value);
  }
  return found;
}

/**
 * A demo is served from /templates/<slug>/demo/. Its URLs may be relative or
 * carry exactly that base path; any other root-absolute URL resolves against
 * the site root, 404s, and loads the demo unstyled — refuse it here instead of
 * shipping it.
 */
async function validateDemo(slug, dir) {
  const errors = [];
  const files = await listFiles(dir);
  const base = `/templates/${slug}/demo/`;
  const stray = (url) => !url.startsWith(base);

  for (const file of files) {
    const relative = path.relative(dir, file).split(path.sep).join('/');
    if (file.endsWith('.html')) {
      const html = await readFile(file, 'utf8');
      for (const url of absoluteUrls(html).filter(stray)) {
        errors.push(
          `${slug}/${relative}: root-absolute asset URL "${url}" — build this template with ` +
            `base ${base} (or relative paths)`,
        );
      }
    } else if (file.endsWith('.css')) {
      const css = await readFile(file, 'utf8');
      for (const url of absoluteCssUrls(css).filter(stray)) {
        errors.push(
          `${slug}/${relative}: root-absolute asset URL "${url}" — build this template with ` +
            `base ${base} (or relative paths)`,
        );
      }
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Build: source -> expected output map
// ---------------------------------------------------------------------------

/**
 * Read demos from `sourceRoot/<slug>/` and return the exact files that should
 * land in public/. Nothing is written here, so --check can reuse it.
 */
async function build(sourceRoot) {
  const errors = [];
  const warnings = [];
  const outputs = new Map();

  const { entries: manifest, errors: manifestErrors } = await readManifest();
  errors.push(...manifestErrors);

  const catalog = await readCatalogSlugs();
  if (catalog.size === 0) {
    errors.push(`${rel(GENERATED_TS)} has no templates — run npm run sync:templates first`);
  }

  for (const slug of manifest.keys()) {
    if (!catalog.has(slug)) errors.push(`${slug}: demo manifest entry has no catalog template`);
  }
  for (const slug of catalog) {
    if (!manifest.has(slug)) {
      errors.push(`${slug}: catalog template has no demo manifest entry (add it to src/data/demos.json)`);
    }
  }

  if (!(await isDirectory(sourceRoot))) {
    errors.push(`demo source not found: ${rel(sourceRoot)}`);
    return { errors, warnings, outputs };
  }

  const available = [...manifest.entries()]
    .filter(([, entry]) => entry.status === 'available')
    .map(([slug]) => slug)
    .sort();

  const present = await listDirectories(sourceRoot);

  for (const slug of present) {
    if (!manifest.has(slug)) {
      errors.push(`${slug}: orphan demo — no entry in src/data/demos.json`);
    } else if (manifest.get(slug).status !== 'available') {
      errors.push(`${slug}: demo exists but src/data/demos.json marks it "coming-soon"`);
    }
  }

  for (const slug of available) {
    if (!present.includes(slug)) {
      errors.push(`${slug}: src/data/demos.json marks it "available" but no demo was found`);
      continue;
    }

    const dir = path.join(sourceRoot, slug);
    const index = path.join(dir, 'index.html');
    const files = await listFiles(dir);
    if (!files.includes(index)) {
      errors.push(`${slug}: demo has no index.html`);
      continue;
    }

    errors.push(...(await validateDemo(slug, dir)));

    for (const file of files) {
      const relative = path.relative(dir, file).split(path.sep).join('/');
      outputs.set(`${PUBLIC_DEMOS_REL}/${slug}/demo/${relative}`, await readFile(file));
    }
  }

  for (const slug of manifest.keys()) {
    if (manifest.get(slug).status === 'coming-soon') {
      const stale = path.join(PUBLIC_TEMPLATES, slug, 'demo');
      if (await isDirectory(stale)) warnings.push(`${slug}: coming-soon demo still present at ${rel(stale)}`);
    }
  }

  return { errors, warnings, outputs, available };
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function check(result) {
  const drift = [];

  for (const [relativePath, expected] of result.outputs) {
    const file = path.join(REPO_ROOT, relativePath);
    let actual;
    try {
      actual = await readFile(file);
    } catch {
      drift.push(`${relativePath}: missing`);
      continue;
    }
    if (!actual.equals(expected)) drift.push(`${relativePath}: drifted`);
  }

  const expectedFiles = new Set([...result.outputs.keys()]);
  for (const slug of await listDirectories(PUBLIC_TEMPLATES)) {
    if (result.available?.includes(slug)) continue;
    const stale = path.join(PUBLIC_TEMPLATES, slug, 'demo');
    if (!(await isDirectory(stale))) continue;
    for (const file of await listFiles(stale)) {
      const relative = path.relative(REPO_ROOT, file).split(path.sep).join('/');
      drift.push(`${relative}: unexpected file (demo is not marked available)`);
    }
  }

  if (drift.length > 0) {
    for (const entry of drift) console.error(entry);
    console.error(`\nDemo drift: ${drift.length} file(s) differ. Run npm run sync:demos to regenerate.`);
    process.exit(1);
  }

  console.log(`Demos match ${rel(FIXTURE_DEMOS)} (${result.outputs.size} file(s)).`);
}

async function selfTest() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'demo-sync-'));
  try {
    const good = path.join(dir, 'forge-trades');
    await mkdir(good, { recursive: true });
    const fixture = path.join(FIXTURE_DEMOS, 'forge-trades');
    for (const file of await listFiles(fixture)) {
      const relative = path.relative(fixture, file);
      const destination = path.join(good, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, await readFile(file));
    }

    const index = path.join(good, 'index.html');
    const html = await readFile(index, 'utf8');
    await writeFile(index, html.replace('<link rel="stylesheet" href="css/style.css">', '<link rel="stylesheet" href="/css/style.css">'));

    const result = await build(dir);
    const caught = result.errors.find(
      (error) => error.includes('forge-trades/index.html') && error.includes('"/css/style.css"'),
    );
    if (!caught) {
      throw new Error(`expected a root-absolute URL error, got:\n${result.errors.join('\n') || '(none)'}`);
    }
    console.log(`Self-test passed: ${caught}`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function run() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }

  if (options.help) {
    console.log(usage());
    return;
  }

  if (options.selfTest) {
    try {
      await selfTest();
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
    return;
  }

  const sourceRoot = options.from ? path.join(path.resolve(options.from), 'release/demos') : FIXTURE_DEMOS;

  let result;
  try {
    result = await build(sourceRoot);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  if (result.errors.length > 0) {
    for (const error of result.errors) console.error(error);
    console.error(`\n${result.errors.length} demo error(s). Nothing written.`);
    process.exit(1);
  }

  for (const warning of result.warnings) console.warn(`warning: ${warning}`);

  if (options.check) {
    await check(result);
    return;
  }

  for (const [relativePath, buffer] of result.outputs) {
    const file = path.join(REPO_ROOT, relativePath);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, buffer);
  }

  for (const slug of result.available) {
    const source = path.join(sourceRoot, slug);
    const fixture = path.join(FIXTURE_DEMOS, slug);
    if (path.resolve(source) === path.resolve(fixture)) continue;
    await rm(fixture, { recursive: true, force: true });
    for (const file of await listFiles(source)) {
      const relative = path.relative(source, file);
      const destination = path.join(fixture, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, await readFile(file));
    }
  }

  for (const [slug, entry] of (await readManifest()).entries) {
    if (entry.status !== 'coming-soon') continue;
    await rm(path.join(PUBLIC_TEMPLATES, slug, 'demo'), { recursive: true, force: true });
    await rm(path.join(FIXTURE_DEMOS, slug), { recursive: true, force: true });
  }

  console.log(`Synced ${result.outputs.size} demo file(s) from ${rel(sourceRoot)}.`);
}

await run();
