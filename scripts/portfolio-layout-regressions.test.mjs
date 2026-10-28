import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const resumeSource = fs.readFileSync(new URL('../src/data/resume.tsx', import.meta.url), 'utf8');
const blogPageSource = fs.readFileSync(new URL('../src/components/blog/article-view.tsx', import.meta.url), 'utf8');
const globalsSource = fs.readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');
const oscillatorClientSource = fs.readFileSync(
  new URL('../src/app/(legacy)/oscillator/oscillator-client.tsx', import.meta.url),
  'utf8'
);

test('homepage projects include an oscillator card', () => {
  assert.match(resumeSource, /title:\s*'Oscillator'/);
  assert.match(resumeSource, /href:\s*'\/oscillator'/);
});

test('blog detail layout reserves space for TOC', () => {
  assert.match(blogPageSource, /xl:grid-cols-\[220px_minmax\(0,1fr\)\]/);
  assert.match(blogPageSource, /min-w-0/);
  assert.match(blogPageSource, /max-w-none/);
  assert.match(blogPageSource, /xl:sticky/);
});

// Wide article content used to be kept in bounds by a utility class on the
// article element. The research-terminal redesign moved that to the
// .article-prose layer, so the rule is asserted where it now lives.
test('article prose keeps wide tables and code blocks inside the column', () => {
  for (const selector of ['.article-prose pre', '.article-prose table']) {
    const block = globalsSource.match(new RegExp(`\\${selector}\\s*\\{[^}]*\\}`));
    assert.ok(block, `${selector} rule is missing from globals.css`);
    assert.match(block[0], /overflow-x:\s*auto/);
    assert.match(block[0], /max-width:\s*100%/);
  }
});

test('oscillator page says its data comes from a snapshot refresh, not live quotes', () => {
  assert.match(oscillatorClientSource, /Market Snapshot/);
  assert.match(oscillatorClientSource, /Updated by an explicit snapshot refresh/);
  assert.match(oscillatorClientSource, /Market moves after the source timestamps are not reflected yet/);
});

test('oscillator page describes the breadth universe as top 500 and includes pagination controls', () => {
  // The breadth table tracks the top 500. "top 300" also appears legitimately,
  // in the FAQ answer defining dual-ranked, so only the breadth copy is checked.
  const breadthCopy = oscillatorClientSource.match(/The full-market observation layer\.[^`]*?top \d+/);
  assert.ok(breadthCopy, 'breadth universe description is missing');
  assert.match(breadthCopy[0], /top 500/);
  assert.match(oscillatorClientSource, /Previous/);
  assert.match(oscillatorClientSource, /Next/);
});
