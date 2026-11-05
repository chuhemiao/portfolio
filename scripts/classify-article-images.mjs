// Classifies every locally hosted image referenced from content/ by how bright
// its background is, and writes the light-background ones to
// src/data/article-image-tone.json. The markdown pipeline stamps those with
// data-tone="light" so dark mode can frame them instead of letting a white
// chart sit unframed on a near-black page.
//
// Needs macOS `sips`, so it is NOT part of the build chain: run it by hand
// (pnpm images:tone) after adding an image, and commit the JSON.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'src/data/article-image-tone.json');
const SAMPLE = 24;
const EDGE_LUMINANCE_THRESHOLD = 0.8;

function listReferences() {
  const refs = new Set();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.mdx')) {
        const text = fs.readFileSync(full, 'utf8');
        for (const match of text.matchAll(/!\[[^\]]*\]\((\/[^)\s]+)\)/g)) {
          refs.add(match[1].split('?')[0]);
        }
      }
    }
  };
  walk(path.join(ROOT, 'content'));
  return [...refs].sort();
}

function edgeLuminance(file) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tone-'));
  const out = path.join(tmp, 'sample.bmp');
  try {
    execFileSync('sips', [
      '-z', String(SAMPLE), String(SAMPLE),
      '-s', 'format', 'bmp', file, '--out', out,
    ], { stdio: 'pipe' });
    const buf = fs.readFileSync(out);
    const offset = buf.readUInt32LE(10);
    const width = buf.readInt32LE(18);
    const height = Math.abs(buf.readInt32LE(22));
    const bytes = buf.readUInt16LE(28) / 8;
    const stride = Math.floor((bytes * 8 * width + 31) / 32) * 4;
    let sum = 0;
    let count = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x !== 0 && y !== 0 && x !== width - 1 && y !== height - 1) continue;
        const i = offset + y * stride + x * bytes;
        sum += (0.2126 * buf[i + 2] + 0.7152 * buf[i + 1] + 0.0722 * buf[i]) / 255;
        count += 1;
      }
    }
    return sum / count;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

// A chart exported to SVG paints its background with a full-bleed rect, and the
// fill may be an attribute or inline style, hex or percentage rgb().
function svgHasLightBackground(file) {
  const text = fs.readFileSync(file, 'utf8');
  return /fill\s*[:=]\s*"?\s*(#f{3,6}\b|white\b|rgb\(\s*100%\s*,\s*100%\s*,\s*100%\s*\))/i.test(text);
}

const light = [];
const skipped = [];
for (const ref of listReferences()) {
  const file = path.join(ROOT, 'public', ref);
  if (!fs.existsSync(file)) {
    skipped.push([ref, 'not in public/']);
    continue;
  }
  try {
    if (ref.endsWith('.svg')) {
      if (svgHasLightBackground(file)) light.push(ref);
    } else if (edgeLuminance(file) > EDGE_LUMINANCE_THRESHOLD) {
      light.push(ref);
    }
  } catch (error) {
    skipped.push([ref, String(error.message).slice(0, 80)]);
  }
}

fs.writeFileSync(OUT, `${JSON.stringify({ edgeLuminanceThreshold: EDGE_LUMINANCE_THRESHOLD, light }, null, 2)}\n`);
console.log(`light-background images: ${light.length}`);
for (const [ref, why] of skipped) console.log(`  skipped ${ref} — ${why}`);
