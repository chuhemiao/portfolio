import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const resumeSource = fs.readFileSync(new URL('../src/data/resume.tsx', import.meta.url), 'utf8');
const blogPageSource = fs.readFileSync(new URL('../src/app/blog/[slug]/page.tsx', import.meta.url), 'utf8');
const oscillatorClientSource = fs.readFileSync(
  new URL('../src/app/oscillator/oscillator-client.tsx', import.meta.url),
  'utf8'
);

test('homepage projects include an oscillator card', () => {
  assert.match(resumeSource, /title:\s*'Oscillator'/);
  assert.match(resumeSource, /href:\s*'\/oscillator'/);
});

test('blog detail layout reserves space for TOC and prevents content overflow', () => {
  assert.match(blogPageSource, /xl:grid-cols-\[220px_minmax\(0,1fr\)\]/);
  assert.match(blogPageSource, /min-w-0/);
  assert.match(blogPageSource, /max-w-none/);
  assert.match(blogPageSource, /overflow-x-auto/);
  assert.match(blogPageSource, /xl:sticky/);
});

test('oscillator page shows a visible weekly update notice', () => {
  assert.match(oscillatorClientSource, /Weekly Snapshot/);
  assert.match(oscillatorClientSource, /Updates every week/);
  assert.match(oscillatorClientSource, /Short-term market moves after the snapshot may not be reflected yet/);
});

test('oscillator page describes the breadth universe as top 500 and includes pagination controls', () => {
  assert.match(oscillatorClientSource, /top 500/i);
  assert.doesNotMatch(oscillatorClientSource, /top 300/i);
  assert.match(oscillatorClientSource, /Previous/);
  assert.match(oscillatorClientSource, /Next/);
});
