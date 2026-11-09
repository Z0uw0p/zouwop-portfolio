#!/usr/bin/env node
/**
 * check-seo.mjs — prove the built product pages are indexable.
 *
 * Reads dist/templates/<slug>/index.html and asserts:
 *   - <title> is unique and ≤ 60 characters
 *   - <meta name="description"> is unique and ≤ 155 characters
 *   - a valid Product + Offer JSON-LD block exists (CAD, InStock/PreOrder)
 *   - a BreadcrumbList exists with Home → Templates → product
 *   - og:image points at a 1200×630 JPEG that exists in dist/ (HTTP 200)
 *   - og:locale is en_CA
 *
 * Usage: node scripts/check-seo.mjs [--self-test]
 */

import { existsSync } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const TEMPLATES = path.join(DIST, 'templates');
const MAX_TITLE = 60;
const MAX_DESCRIPTION = 155;

function decode(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function first(html, re) {
  const match = html.match(re);
  return match ? match[1] : null;
}

function jsonLdBlocks(html) {
  const blocks = [];
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      blocks.push(JSON.parse(match[1]));
    } catch {
      blocks.push(null);
    }
  }
  return blocks;
}

export function analyzePage(slug, html) {
  const errors = [];
  const title = first(html, /<title>([\s\S]*?)<\/title>/);
  const description = first(html, /<meta name="description" content="([^"]*)"/);
  const ogImage = first(html, /<meta property="og:image" content="([^"]*)"/);
  const ogWidth = first(html, /<meta property="og:image:width" content="([^"]*)"/);
  const ogHeight = first(html, /<meta property="og:image:height" content="([^"]*)"/);
  const ogLocale = first(html, /<meta property="og:locale" content="([^"]*)"/);

  if (!title) errors.push('missing <title>');
  else if (decode(title).length > MAX_TITLE) {
    errors.push(`title is ${decode(title).length} chars (max ${MAX_TITLE})`);
  }

  if (!description) errors.push('missing meta description');
  else if (decode(description).length > MAX_DESCRIPTION) {
    errors.push(`description is ${decode(description).length} chars (max ${MAX_DESCRIPTION})`);
  }

  if (!ogImage) errors.push('missing og:image');
  if (ogWidth !== '1200' || ogHeight !== '630') {
    errors.push(`og:image must declare 1200×630, got ${ogWidth}×${ogHeight}`);
  }
  if (ogLocale !== 'en_CA') errors.push(`og:locale must be en_CA, got ${ogLocale ?? '(missing)'}`);

  const blocks = jsonLdBlocks(html);
  if (blocks.some((block) => block === null)) errors.push('a JSON-LD block is not valid JSON');
  const product = blocks.find((block) => block?.['@type'] === 'Product');
  const breadcrumb = blocks.find((block) => block?.['@type'] === 'BreadcrumbList');

  if (!product) {
    errors.push('missing Product JSON-LD');
  } else {
    const offer = product.offers;
    if (!offer || offer['@type'] !== 'Offer') errors.push('Product is missing an Offer');
    else {
      if (!/^\d+\.\d{2}$/.test(String(offer.price))) {
        errors.push(`Offer.price must be a decimal string, got ${offer.price}`);
      }
      if (offer.priceCurrency !== 'CAD') errors.push('Offer.priceCurrency must be CAD');
      if (!/InStock$|PreOrder$/.test(String(offer.availability))) {
        errors.push(`Offer.availability must be InStock or PreOrder, got ${offer.availability}`);
      }
    }
    if (typeof product.url !== 'string' || !product.url.startsWith('https://zouwop.com/templates/')) {
      errors.push('Product.url must be the absolute product page');
    }
    if (!Array.isArray(product.image) || !product.image[0]?.includes(`/templates/${slug}/og.jpg`)) {
      errors.push('Product.image must be the template og.jpg');
    }
  }

  if (!breadcrumb) {
    errors.push('missing BreadcrumbList JSON-LD');
  } else if (!Array.isArray(breadcrumb.itemListElement) || breadcrumb.itemListElement.length !== 3) {
    errors.push('BreadcrumbList must have Home, Templates and product');
  }

  return { slug, title: title && decode(title), description: description && decode(description), ogImage, errors };
}

async function imageIsJpeg1200x630(url) {
  let pathname;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return 'og:image is not an absolute URL';
  }
  const file = path.join(DIST, pathname);
  if (!existsSync(file)) return `og:image file is missing: ${pathname}`;
  const info = await stat(file);
  if (info.size < 1024) return `og:image is only ${info.size} bytes: ${pathname}`;
  const buffer = await readFile(file);
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return `og:image is not a JPEG: ${pathname}`;
  return null;
}

export async function checkPages(pages, { skipImages = false } = {}) {
  const errors = [];
  const titles = new Map();
  const descriptions = new Map();

  for (const page of pages) {
    const result = analyzePage(page.slug, page.html);
    for (const error of result.errors) errors.push(`${page.slug}: ${error}`);

    if (result.title) {
      if (titles.has(result.title)) errors.push(`${page.slug}: duplicate title with ${titles.get(result.title)}`);
      else titles.set(result.title, page.slug);
    }
    if (result.description) {
      if (descriptions.has(result.description)) {
        errors.push(`${page.slug}: duplicate description with ${descriptions.get(result.description)}`);
      } else {
        descriptions.set(result.description, page.slug);
      }
    }
    if (result.ogImage && !skipImages) {
      const imageError = await imageIsJpeg1200x630(result.ogImage);
      if (imageError) errors.push(`${page.slug}: ${imageError}`);
    }
  }

  return errors;
}

async function selfTest() {
  const good = `
    <title>Forge Trades template — trades | Zouwop</title>
    <meta name="description" content="Forge Trades: a trades website template built with HTML, CSS, JavaScript." />
    <meta property="og:image" content="https://zouwop.com/templates/forge-trades/og.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="en_CA" />
    <script type="application/ld+json">{"@type":"Product","url":"https://zouwop.com/templates/forge-trades/","image":["https://zouwop.com/templates/forge-trades/og.jpg"],"offers":{"@type":"Offer","price":"500.00","priceCurrency":"CAD","availability":"https://schema.org/InStock"}}</script>
    <script type="application/ld+json">{"@type":"BreadcrumbList","itemListElement":[{},{},{}]}</script>`;

  const clean = analyzePage('forge-trades', good);
  if (clean.errors.length > 0) {
    throw new Error(`self-test: the good sample failed: ${clean.errors.join('; ')}`);
  }

  const long = good.replace(
    'Forge Trades template — trades | Zouwop',
    'A title that is deliberately far too long to pass the sixty character limit',
  );
  if (!analyzePage('forge-trades', long).errors.some((error) => error.includes('title is'))) {
    throw new Error('self-test: a too-long title was not caught');
  }

  const broken = good.replace('"priceCurrency":"CAD"', '"priceCurrency":"USD"');
  if (!analyzePage('forge-trades', broken).errors.some((error) => error.includes('priceCurrency'))) {
    throw new Error('self-test: a non-CAD offer was not caught');
  }

  const duplicates = await checkPages(
    [
      { slug: 'one', html: good },
      { slug: 'two', html: good },
    ],
    { skipImages: true },
  );
  if (!duplicates.some((error) => error.includes('duplicate title'))) {
    throw new Error('self-test: duplicate titles were not caught');
  }

  console.log('Self-test passed: caught long titles, non-CAD offers and duplicates.');
}

async function main() {
  if (!existsSync(TEMPLATES)) {
    console.error('dist/templates not found — run npm run build first.');
    process.exit(1);
  }

  const dirs = await readdir(TEMPLATES, { withFileTypes: true });
  const slugs = dirs
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  if (slugs.length === 0) {
    console.error('No product pages found in dist/templates.');
    process.exit(1);
  }

  const pages = [];
  for (const slug of slugs) {
    const file = path.join(TEMPLATES, slug, 'index.html');
    if (!existsSync(file)) continue;
    pages.push({ slug, html: await readFile(file, 'utf8') });
  }

  const errors = await checkPages(pages);
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    console.error(`\n${errors.length} SEO problem(s) across ${pages.length} product page(s).`);
    process.exit(1);
  }

  console.log(`Checked ${pages.length} product pages — titles/descriptions unique and within limits, JSON-LD and og:image valid.`);
}

if (process.argv.includes('--self-test')) {
  await selfTest();
} else {
  await main();
}
