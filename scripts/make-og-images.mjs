#!/usr/bin/env node
/**
 * make-og-images.mjs — build one 1200×630 JPEG per template.
 *
 * Source: the committed full-page desktop capture at
 * public/templates/<slug>/desktop.webp. We scale it to 1200px wide and crop
 * the top 630px, so the social card shows the top of the real product.
 *
 * This is a one-off asset generator, not part of `npm run build`: it shells out
 * to the system `ffmpeg`, so the build stays dependency-free and offline. The
 * JPEGs it writes are committed.
 *
 * Usage:
 *
 *   node scripts/make-og-images.mjs
 *   node scripts/make-og-images.mjs --self-test
 */

import { spawnSync } from 'node:child_process';
import { readdir, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC_TEMPLATES = path.join(ROOT, 'public/templates');
const WIDTH = 1200;
const HEIGHT = 630;

async function isFile(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} exited ${result.status}: ${result.stderr.trim()}`);
  }
  return result.stdout;
}

function render(source, destination) {
  run('ffmpeg', [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-i',
    source,
    '-vf',
    `scale=${WIDTH}:-1,crop=${WIDTH}:${HEIGHT}:0:0`,
    '-frames:v',
    '1',
    '-q:v',
    '2',
    '-pix_fmt',
    'yuvj420p',
    destination,
  ]);
}

function dimensions(file) {
  const output = run('ffprobe', [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=codec_name,width,height',
    '-of',
    'csv=p=0',
    file,
  ]).trim();
  const [codec, width, height] = output.split(',');
  return { codec, width: Number(width), height: Number(height) };
}

async function main() {
  if (spawnSync('ffmpeg', ['-version']).status !== 0) {
    console.error('ffmpeg is required to generate the OG images.');
    process.exit(1);
  }

  const entries = await readdir(PUBLIC_TEMPLATES, { withFileTypes: true });
  const slugs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  let generated = 0;
  for (const slug of slugs) {
    const source = path.join(PUBLIC_TEMPLATES, slug, 'desktop.webp');
    if (!(await isFile(source))) continue;

    const destination = path.join(PUBLIC_TEMPLATES, slug, 'og.jpg');
    render(source, destination);
    const { codec, width, height } = dimensions(destination);
    if (codec !== 'mjpeg' || width !== WIDTH || height !== HEIGHT) {
      throw new Error(`${slug}: expected mjpeg ${WIDTH}x${HEIGHT}, got ${codec} ${width}x${height}`);
    }
    generated += 1;
    console.log(`${slug}/og.jpg ${width}x${height}`);
  }

  console.log(`Generated ${generated} OG image(s).`);
}

if (process.argv.includes('--self-test')) {
  const sample = path.join(PUBLIC_TEMPLATES, 'forge-trades', 'desktop.webp');
  const output = path.join(os.tmpdir(), `zouwop-og-self-test-${process.pid}.jpg`);
  try {
    render(sample, output);
    const { codec, width, height } = dimensions(output);
    if (codec !== 'mjpeg' || width !== WIDTH || height !== HEIGHT) {
      throw new Error(`self-test failed: ${codec} ${width}x${height}`);
    }
    console.log(`Self-test passed: ${codec} ${width}x${height}`);
  } finally {
    await rm(output, { force: true });
  }
} else {
  await main();
}
