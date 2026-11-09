#!/usr/bin/env node
/**
 * build-sitemap.mjs — write dist/sitemap.xml after `astro build`.
 *
 * Zero dependencies. Walks the built site for index.html pages, drops anything
 * that must not be indexed (/thank-you, previews, demos, /go redirects), and
 * writes absolute URLs from https://zouwop.com. `lastmod` comes from the last
 * git commit that touched the page's source, with the HEAD commit date as a
 * fallback; if git is unavailable the element is omitted (a valid sitemap).
 *
 * Usage: node scripts/build-sitemap.mjs
 */

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SITE = 'https://zouwop.com';

function xml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function indexFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await indexFiles(full)));
    else if (entry.isFile() && entry.name === 'index.html') files.push(full);
  }
  return files;
}

function routeFor(file) {
  const relative = path.relative(DIST, file).split(path.sep).join('/');
  const dir = path.posix.dirname(relative);
  return dir === '.' ? '/' : `/${dir}/`;
}

function isIndexable(route) {
  if (route === '/') return true;
  if (route === '/thank-you/') return false;
  if (route.startsWith('/go/')) return false;
  if (/^\/templates\/[^/]+\/(preview|demo)\//.test(route)) return false;
  return true;
}

function sourceCandidates(route) {
  const parts = route.replace(/^\/|\/$/g, '').split('/');
  if (parts[0] === 'templates') {
    if (parts.length === 1) return ['src/pages/templates/index.astro'];
    return [
      'src/pages/templates/[slug].astro',
      'src/data/templates.generated.ts',
      'src/data/templates.overrides.ts',
      'src/data/stripe-links.json',
    ];
  }
  if (parts.length === 1) return [`src/pages/${parts[0]}.astro`];
  return [];
}

function gitLog(args) {
  try {
    return execFileSync('git', args, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function lastmod(route) {
  const sources = sourceCandidates(route)
    .map((file) => path.join(ROOT, file))
    .filter((file) => existsSync(file));
  if (sources.length > 0) {
    const date = gitLog(['log', '-1', '--format=%cI', '--', ...sources]);
    if (date) return date;
  }
  return gitLog(['log', '-1', '--format=%cI']) || null;
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('dist/ not found — run astro build first.');
    process.exit(1);
  }

  const routes = (await indexFiles(DIST))
    .map(routeFor)
    .filter(isIndexable)
    .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));

  if (routes.length === 0) {
    console.error('No indexable routes found — refusing to write an empty sitemap.');
    process.exit(1);
  }

  const urls = routes.map((route) => {
    const loc = `${SITE}${route}`;
    const modified = lastmod(route);
    return [
      '  <url>',
      `    <loc>${xml(loc)}</loc>`,
      ...(modified ? [`    <lastmod>${xml(modified)}</lastmod>`] : []),
      '  </url>',
    ].join('\n');
  });

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap);
  console.log(`Wrote dist/sitemap.xml (${routes.length} URL(s)).`);
}

await main();
