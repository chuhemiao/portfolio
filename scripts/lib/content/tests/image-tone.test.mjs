import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import { markdownToHTML } from '../markdown.mjs';

const ROOT = path.resolve(import.meta.dirname, '../../../..');
const TONE_FILE = path.join(ROOT, 'src/data/article-image-tone.json');

const loadTone = async () => JSON.parse(await fs.readFile(TONE_FILE, 'utf8'));

test('light-background images are marked so dark mode can frame them, others are left alone', async () => {
  const { light } = await loadTone();
  assert.ok(light.length > 0, 'the classified set should not be empty');

  const lightImage = light[0];
  const darkImage = '/assets/page-076-img-01.jpg';
  assert.ok(!light.includes(darkImage), `${darkImage} is a photo and must stay unclassified`);

  const html = await markdownToHTML(
    `![chart](${lightImage})\n\n![chart with a cache buster](${lightImage}?v=abc123)\n\n![photo](${darkImage})`
  );

  const tagged = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  assert.equal(tagged.length, 3);
  assert.ok(tagged[0].includes('data-tone="light"'));
  assert.ok(tagged[1].includes('data-tone="light"'), 'a query string must not defeat the lookup');
  assert.ok(!tagged[2].includes('data-tone'));
});

test('every classified image still exists, so none quietly loses its treatment', async () => {
  const { light } = await loadTone();
  for (const ref of light) {
    const file = path.join(ROOT, 'public', ref);
    await assert.doesNotReject(fs.access(file), `${ref} is classified but missing from public/`);
  }
});
