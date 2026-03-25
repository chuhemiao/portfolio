import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import matter from 'gray-matter';

import { markdownToHTML } from '../src/data/blog.ts';

const bsbPostPath = path.join(
  process.cwd(),
  'content/blog/2026/investing/bsb-the-binance-alpha-ticket-bought-with.mdx'
);

test('BSB key metrics renders as a markdown table', async () => {
  const source = fs.readFileSync(bsbPostPath, 'utf8');
  const { content } = matter(source);
  const html = await markdownToHTML(content);

  const sectionStart = html.indexOf('<h3 id="12-key-metrics">1.2 Key Metrics</h3>');
  const sectionEnd = html.indexOf('<h3 id="13-revenue-model">1.3 Revenue Model</h3>');

  assert.notEqual(sectionStart, -1, 'expected the 1.2 heading to render');
  assert.notEqual(sectionEnd, -1, 'expected the 1.3 heading to render');

  const keyMetricsSection = html.slice(sectionStart, sectionEnd);

  assert.match(keyMetricsSection, /<table>/, 'expected 1.2 Key Metrics to render as a table');
});
