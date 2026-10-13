import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCALES, articleHref, categoryLabel, formatLocaleDate, getTranslator, localizeHref, normalizeLocale, stripLocale } from '../src/lib/i18n.ts';

test('canonical locales accept existing metadata aliases without broadening supported routes', () => {
  assert.deepEqual(LOCALES, ['zh-CN', 'en', 'ja']);
  assert.equal(normalizeLocale('zh'), 'zh-CN');
  assert.equal(normalizeLocale('en-US'), 'en');
  assert.equal(normalizeLocale('ja-JP'), 'ja');
  assert.equal(normalizeLocale('fr'), undefined);
  assert.equal(normalizeLocale(null), undefined);
});

test('page links switch locale and retain query/hash without touching external links or assets', () => {
  assert.equal(localizeHref('/en/research?q=BTC#results', 'ja'), '/ja/research?q=BTC#results');
  assert.equal(localizeHref('/topics/quantum', 'zh-CN'), '/zh-CN/topics/quantum');
  assert.equal(localizeHref('/', 'en'), '/en');
  assert.equal(localizeHref('https://example.com', 'ja'), 'https://example.com');
  assert.equal(localizeHref('//example.com', 'ja'), '//example.com');
  assert.equal(localizeHref('/rss.xml', 'ja'), '/rss.xml');
  assert.equal(localizeHref('/article/test.png', 'ja'), '/article/test.png');
  assert.equal(localizeHref('/blog/original-slug', 'ja'), '/blog/original-slug');
  assert.equal(stripLocale('/enough/blog'), '/enough/blog');
});

test('article links safely encode Unicode and copy/date formatting follows selected locale', () => {
  assert.equal(articleHref('日文文章', 'ja'), '/ja/blog/%E6%97%A5%E6%96%87%E6%96%87%E7%AB%A0');
  assert.equal(getTranslator('ja')('Blog', '博客', 'ブログ'), 'ブログ');
  assert.equal(categoryLabel('research', 'zh-CN'), '研究');
  assert.match(formatLocaleDate('2026-10-13', 'ja'), /2026.*10.*13/);
  assert.equal(formatLocaleDate('2026-10-13', 'en'), 'Oct 13, 2026');
});
