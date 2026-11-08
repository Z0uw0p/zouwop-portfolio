#!/usr/bin/env node
/**
 * sync-templates.mjs — copy the private templates catalog into the site.
 *
 * The templates repo (Z0uw0p/templates) is private, so Cloudflare Pages cannot
 * fetch `release/catalog.json` at build time. This script runs locally or in CI
 * and commits the result:
 *
 *   src/data/templates.generated.ts
 *   public/templates/<slug>/desktop.webp
 *   public/templates/<slug>/mobile.webp
 *
 * Usage:
 *
 *   npm run sync:templates -- --from ../templates
 *   npm run sync:templates -- --catalog path/to/catalog.json
 *   npm run sync:templates -- --check
 *
 *   --from <dir>       read <dir>/release/catalog.json and resolve previews
 *                      from <dir>/<slug>/...
 *   --catalog <file>   read a catalog JSON file and resolve previews from the
 *                      catalog file's directory: <dir>/<slug>/...
 *   --root <dir>       override where previews are resolved from
 *   --check            regenerate in memory and diff against the working tree;
 *                      defaults to the committed fixture. Never writes.
 *
 * The committed fixture at scripts/fixtures/catalog.sample.json is the
 * reproducible input CI uses (it has no access to the private templates repo).
 * A real sync refreshes that fixture too, so `--check` keeps passing.
 *
 * Zero dependencies. Node 22.
 */

import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const FIXTURE_CATALOG = path.join(REPO_ROOT, 'scripts/fixtures/catalog.sample.json');
const FIXTURE_ROOT = path.join(REPO_ROOT, 'scripts/fixtures');
const GENERATED_TS_REL = 'src/data/templates.generated.ts';
const GENERATED_TS = path.join(REPO_ROOT, GENERATED_TS_REL);
const OVERRIDES_TS = path.join(REPO_ROOT, 'src/data/templates.overrides.ts');
const PUBLIC_TEMPLATES = path.join(REPO_ROOT, 'public/templates');
const MIN_PREVIEW_BYTES = 5 * 1024;

const TEMPLATE_KEYS = [
  'slug',
  'name',
  'niche',
  'audience',
  'stack',
  'version',
  'blurb',
  'tags',
  'previews',
  'priceCents',
];
const RELEASE_KEYS = ['zip', 'bytes', 'sha256', 'packagedAt'];
const ALLOWED_KEYS = new Set([...TEMPLATE_KEYS, ...RELEASE_KEYS]);
const REQUIRED_KEYS = [...TEMPLATE_KEYS, ...RELEASE_KEYS];

const SEMVER_RE =
  /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const SHA256_RE = /^[0-9a-f]{64}$/;

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function usage() {
  return `Usage:
  npm run sync:templates -- --from <templates-checkout>
  npm run sync:templates -- --catalog <catalog.json>
  npm run sync:templates -- --check [--from <dir>|--catalog <file>]

Options:
  --from <dir>      read <dir>/release/catalog.json, previews from <dir>/<slug>/
  --catalog <file>  read a catalog file, previews from its directory/<slug>/
  --root <dir>      override the preview root
  --check           diff generated output against the working tree, write nothing
  --help            show this message`;
}

function parseArgs(argv) {
  const options = { check: false, from: null, catalog: null, root: null, help: false };

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
      case '--catalog':
        options.catalog = takeValue();
        break;
      case '--root':
        options.root = takeValue();
        break;
      case '--check':
        options.check = true;
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

function isSemver(value) {
  return typeof value === 'string' && SEMVER_RE.test(value.trim());
}

function rel(file) {
  return path.relative(REPO_ROOT, file).split(path.sep).join('/');
}

/** Parse width/height out of a WebP buffer (VP8X / VP8L / VP8). */
function webpDimensions(buffer) {
  if (buffer.length < 30) return null;
  if (buffer.toString('ascii', 0, 4) !== 'RIFF') return null;
  if (buffer.toString('ascii', 8, 12) !== 'WEBP') return null;
  const fourcc = buffer.toString('ascii', 12, 16);
  if (fourcc === 'VP8X') {
    const width = 1 + buffer.readUIntLE(24, 3);
    const height = 1 + buffer.readUIntLE(27, 3);
    return { width, height };
  }
  if (fourcc === 'VP8L') {
    if (buffer[20] !== 0x2f) return null;
    const b0 = buffer[21];
    const b1 = buffer[22];
    const b2 = buffer[23];
    const b3 = buffer[24];
    const width = 1 + (((b1 & 0x3f) << 8) | b0);
    const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
    return { width, height };
  }
  if (fourcc === 'VP8 ') {
    const width = buffer.readUInt16LE(26) & 0x3fff;
    const height = buffer.readUInt16LE(28) & 0x3fff;
    return { width, height };
  }
  return null;
}

async function pathIsFile(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateEntry(entry, index) {
  const errors = [];
  if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
    return { label: `#${index}`, errors: ['entry must be a JSON object'] };
  }

  const label = typeof entry.slug === 'string' && entry.slug.trim() !== '' ? entry.slug : `#${index}`;

  for (const key of Object.keys(entry)) {
    if (!ALLOWED_KEYS.has(key)) errors.push(`unknown key "${key}"`);
  }
  for (const key of REQUIRED_KEYS) {
    if (!(key in entry)) errors.push(`missing field "${key}"`);
  }

  for (const key of ['slug', 'name', 'niche', 'audience', 'version', 'blurb', 'zip', 'sha256', 'packagedAt']) {
    if (key in entry && typeof entry[key] !== 'string') errors.push(`field "${key}" must be a string`);
    else if (key in entry && typeof entry[key] === 'string' && entry[key].trim() === '') {
      errors.push(`field "${key}" must be non-empty`);
    }
  }

  if (typeof entry.slug === 'string' && !SLUG_RE.test(entry.slug)) {
    errors.push(`slug "${entry.slug}" must be lowercase kebab-case`);
  }
  if (typeof entry.version === 'string' && !isSemver(entry.version)) {
    errors.push(`version "${entry.version}" is not valid semver`);
  }
  if (typeof entry.blurb === 'string' && entry.blurb.length > 140) {
    errors.push(`blurb is ${entry.blurb.length} chars (max 140)`);
  }

  if ('stack' in entry) {
    if (!Array.isArray(entry.stack)) errors.push('field "stack" must be an array');
    else if (entry.stack.length === 0) errors.push('field "stack" must not be empty');
    else if (entry.stack.some((item) => typeof item !== 'string' || item.trim() === '')) {
      errors.push('field "stack" must be an array of non-empty strings');
    }
  }
  if ('tags' in entry) {
    if (!Array.isArray(entry.tags)) errors.push('field "tags" must be an array');
    else if (entry.tags.some((item) => typeof item !== 'string')) {
      errors.push('field "tags" must be an array of strings');
    }
  }
  if ('previews' in entry) {
    if (typeof entry.previews !== 'object' || entry.previews === null || Array.isArray(entry.previews)) {
      errors.push('field "previews" must be an object');
    } else {
      for (const key of ['desktop', 'mobile']) {
        if (!(key in entry.previews)) errors.push(`missing field "previews.${key}"`);
        else if (typeof entry.previews[key] !== 'string' || entry.previews[key].trim() === '') {
          errors.push(`field "previews.${key}" must be a non-empty string path`);
        }
      }
      for (const key of Object.keys(entry.previews)) {
        if (key !== 'desktop' && key !== 'mobile') errors.push(`unknown key "previews.${key}"`);
      }
    }
  }
  if ('priceCents' in entry) {
    if (typeof entry.priceCents !== 'number' || !Number.isInteger(entry.priceCents) || entry.priceCents < 0) {
      errors.push('field "priceCents" must be a non-negative integer');
    }
  }
  if ('bytes' in entry) {
    if (typeof entry.bytes !== 'number' || !Number.isInteger(entry.bytes) || entry.bytes < 0) {
      errors.push('field "bytes" must be a non-negative integer');
    }
  }
  if (typeof entry.sha256 === 'string' && !SHA256_RE.test(entry.sha256)) {
    errors.push('field "sha256" must be a 64-character lowercase hex digest');
  }
  if (typeof entry.packagedAt === 'string' && Number.isNaN(Date.parse(entry.packagedAt))) {
    errors.push(`field "packagedAt" is not a valid date: ${entry.packagedAt}`);
  }

  return { label, errors };
}

// ---------------------------------------------------------------------------
// Store-owned overrides (read as text: this is a .ts module, not importable here)
// ---------------------------------------------------------------------------

async function readOverrides() {
  let text;
  try {
    text = await readFile(OVERRIDES_TS, 'utf8');
  } catch {
    return new Map();
  }

  const start = text.indexOf('overrides');
  if (start < 0) return new Map();
  const body = text.slice(start);

  const slugs = new Map();
  const keyRe = /(['"])([a-z0-9][a-z0-9-]*)\1\s*:\s*\{/g;
  let match;
  while ((match = keyRe.exec(body)) !== null) {
    const slug = match[2];
    const open = keyRe.lastIndex - 1;
    const close = body.indexOf('}', open);
    if (close < 0) continue;
    const block = body.slice(open + 1, close);
    slugs.set(slug, {
      status: /\bstatus\s*:\s*(['"])available\1/.test(block) ? 'available' : 'coming-soon',
    });
  }
  return slugs;
}

// ---------------------------------------------------------------------------
// Committed state, for carry-over safety
// ---------------------------------------------------------------------------

async function readCommittedGenerated() {
  let text;
  try {
    text = await readFile(GENERATED_TS, 'utf8');
  } catch {
    return [];
  }
  try {
    const assignment = text.indexOf('=', text.indexOf('generatedTemplates'));
    const start = text.indexOf('[', assignment);
    const end = text.lastIndexOf(']');
    if (assignment < 0 || start < 0 || end < start) return [];
    const parsed = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

async function readCatalog(options) {
  let catalogFile;
  let previewRoot;

  if (options.from && options.catalog) {
    throw new Error('pass only one of --from and --catalog');
  }
  if (options.from) {
    previewRoot = path.resolve(options.from);
    catalogFile = path.join(previewRoot, 'release/catalog.json');
  } else if (options.catalog) {
    catalogFile = path.resolve(options.catalog);
    previewRoot = path.dirname(catalogFile);
  } else if (options.check) {
    catalogFile = FIXTURE_CATALOG;
    previewRoot = FIXTURE_ROOT;
  } else {
    throw new Error(`no catalog source given\n\n${usage()}`);
  }

  if (options.root) previewRoot = path.resolve(options.root);
  if (!(await pathIsFile(catalogFile))) {
    throw new Error(`catalog not found: ${rel(catalogFile)}`);
  }

  let catalog;
  try {
    catalog = JSON.parse(await readFile(catalogFile, 'utf8'));
  } catch (error) {
    throw new Error(`catalog is not valid JSON (${rel(catalogFile)}): ${error.message}`);
  }

  return { catalog, catalogFile, previewRoot };
}

async function loadPreview(previewRoot, slug, relativePath, kind) {
  const file = path.resolve(previewRoot, slug, relativePath);
  if (!(await pathIsFile(file))) {
    return { error: `missing ${kind} preview: ${rel(file)}` };
  }
  const info = await stat(file);
  if (info.size < MIN_PREVIEW_BYTES) {
    return { error: `${kind} preview is ${info.size} bytes (minimum ${MIN_PREVIEW_BYTES}): ${rel(file)}` };
  }
  const buffer = await readFile(file);
  const dimensions = webpDimensions(buffer);
  if (!dimensions) {
    return { error: `${kind} preview is not a readable WebP: ${rel(file)}` };
  }
  return { file, buffer, width: dimensions.width, height: dimensions.height };
}

function generatedPreview(slug, name, kind, preview) {
  return {
    src: `/templates/${slug}/${kind}.webp`,
    alt: `${name} — ${kind} preview`,
    kind,
    width: preview.width,
    height: preview.height,
  };
}

function generatedEntry(entry, previews) {
  return {
    slug: entry.slug,
    name: entry.name,
    niche: entry.niche,
    audience: entry.audience,
    stack: entry.stack,
    version: entry.version,
    blurb: entry.blurb,
    tags: entry.tags,
    priceCents: entry.priceCents,
    previews,
    release: {
      zip: entry.zip,
      bytes: entry.bytes,
      sha256: entry.sha256,
      packagedAt: entry.packagedAt,
    },
  };
}

function serializeTemplates(templates) {
  const body = JSON.stringify(templates, null, 2);
  return [
    '// AUTO-GENERATED — do not edit. Run npm run sync:templates.',
    "import type { GeneratedTemplate } from './templates';",
    '',
    `export const generatedTemplates: GeneratedTemplate[] = ${body};`,
    '',
  ].join('\n');
}

/**
 * Turn a catalog into the exact files that belong in the repo. Returns an
 * in-memory map of relative path -> Buffer, plus warnings. Nothing is written
 * here, so --check can reuse it without touching the working tree.
 */
async function build({ catalog, previewRoot }) {
  const errors = [];
  const warnings = [];
  const outputs = new Map();

  if (!Array.isArray(catalog)) {
    errors.push('catalog: root must be a JSON array');
    return { errors, warnings, outputs };
  }
  if (catalog.length === 0) {
    errors.push('catalog: catalog is empty — refusing to write an empty store');
    return { errors, warnings, outputs };
  }

  const seen = new Set();
  const valid = [];

  for (let index = 0; index < catalog.length; index += 1) {
    const entry = catalog[index];
    const { label, errors: reasons } = validateEntry(entry, index);
    if (reasons.length > 0) {
      for (const reason of reasons) errors.push(`${label}: ${reason}`);
      continue;
    }
    if (seen.has(entry.slug)) {
      errors.push(`${entry.slug}: duplicate slug`);
      continue;
    }
    seen.add(entry.slug);

    const desktop = await loadPreview(previewRoot, entry.slug, entry.previews.desktop, 'desktop');
    const mobile = await loadPreview(previewRoot, entry.slug, entry.previews.mobile, 'mobile');
    if (desktop.error) errors.push(`${entry.slug}: ${desktop.error}`);
    if (mobile.error) errors.push(`${entry.slug}: ${mobile.error}`);
    if (desktop.error || mobile.error) continue;

    valid.push({ entry, desktop, mobile });
  }

  if (errors.length > 0) return { errors, warnings, outputs };

  const entries = valid
    .map(({ entry, desktop, mobile }) => ({
      entry,
      template: generatedEntry(entry, [
        generatedPreview(entry.slug, entry.name, 'desktop', desktop),
        generatedPreview(entry.slug, entry.name, 'mobile', mobile),
      ]),
      desktop,
      mobile,
    }))
    .sort((a, b) => a.entry.slug.localeCompare(b.entry.slug));

  // Never drop a slug a human marked available: keep its previously generated
  // entry, and warn for everything else that disappeared.
  const overrides = await readOverrides();
  const currentSlugs = new Set(entries.map(({ entry }) => entry.slug));
  const carried = [];
  const removed = [];
  for (const old of await readCommittedGenerated()) {
    if (!old || typeof old.slug !== 'string' || currentSlugs.has(old.slug)) continue;
    if (overrides.get(old.slug)?.status === 'available') {
      carried.push(old);
      warnings.push(`keeping "${old.slug}" — it is marked available but missing from the catalog`);
    } else {
      removed.push(old.slug);
    }
  }
  if (removed.length > 0) {
    warnings.push(`removing ${removed.length} template(s) not marked available: ${removed.join(', ')}`);
  }

  const templates = [...entries.map(({ template }) => template), ...carried].sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );

  for (const template of carried) {
    for (const kind of ['desktop', 'mobile']) {
      const file = path.join(PUBLIC_TEMPLATES, template.slug, `${kind}.webp`);
      if (!(await pathIsFile(file))) {
        errors.push(`${template.slug}: carried template is missing ${rel(file)}`);
        continue;
      }
      outputs.set(`public/templates/${template.slug}/${kind}.webp`, await readFile(file));
    }
  }

  // Orphan overrides make the store's hand-written copy point at nothing.
  const templateSlugs = new Set(templates.map((template) => template.slug));
  for (const slug of overrides.keys()) {
    if (!templateSlugs.has(slug)) errors.push(`${slug}: override has no matching generated template`);
  }
  if (errors.length > 0) return { errors, warnings, outputs };

  outputs.set(GENERATED_TS_REL, Buffer.from(serializeTemplates(templates), 'utf8'));
  for (const { entry, desktop, mobile } of entries) {
    outputs.set(`public/templates/${entry.slug}/desktop.webp`, desktop.buffer);
    outputs.set(`public/templates/${entry.slug}/mobile.webp`, mobile.buffer);
  }

  // Sources for the committed CI fixture. Real runs refresh these so --check
  // stays reproducible without access to the private templates repo.
  const fixtureCatalog = valid.map(({ entry }) => entry);
  const fixturePreviews = [];
  for (const { entry, desktop, mobile } of entries) {
    fixturePreviews.push({
      destination: path.join(FIXTURE_ROOT, entry.slug, entry.previews.desktop),
      source: desktop.file,
    });
    fixturePreviews.push({
      destination: path.join(FIXTURE_ROOT, entry.slug, entry.previews.mobile),
      source: mobile.file,
    });
  }

  return { errors, warnings, outputs, fixtureCatalog, fixturePreviews };
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

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

  let result;
  let catalogInfo;
  try {
    catalogInfo = await readCatalog(options);
    result = await build(catalogInfo);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  if (result.errors.length > 0) {
    for (const error of result.errors) console.error(error);
    console.error(`\n${result.errors.length} catalog error(s). Nothing written.`);
    process.exit(1);
  }

  for (const warning of result.warnings) console.warn(`warning: ${warning}`);

  if (options.check) {
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

    if (drift.length > 0) {
      for (const entry of drift) console.error(entry);
      console.error(`\nCatalog drift: ${drift.length} file(s) differ. Run npm run sync:templates to regenerate.`);
      process.exit(1);
    }

    if (options.from || options.catalog) {
      console.log(`Catalog matches ${rel(catalogInfo.catalogFile)} (${result.outputs.size} file(s)).`);
    } else {
      console.log(`Catalog is in sync with ${rel(FIXTURE_CATALOG)}.`);
    }
    return;
  }

  for (const [relativePath, buffer] of result.outputs) {
    const file = path.join(REPO_ROOT, relativePath);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, buffer);
  }

  if (result.fixtureCatalog && result.fixturePreviews) {
    await mkdir(FIXTURE_ROOT, { recursive: true });
    await writeFile(FIXTURE_CATALOG, `${JSON.stringify(result.fixtureCatalog, null, 2)}\n`);

    for (const { source, destination } of result.fixturePreviews) {
      if (path.resolve(source) === path.resolve(destination)) continue;
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(source, destination);
    }
  }

  console.log(
    `Synced ${result.outputs.size} file(s) from ${rel(catalogInfo.catalogFile)} (${result.warnings.length} warning(s)).`,
  );
}

await run();
