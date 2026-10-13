import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { LOCALES, articleHref } from '../src/lib/i18n.ts';
import { assets } from '../src/data/fund.ts';

const root = process.cwd();
const index = JSON.parse(fs.readFileSync(path.join(root, '.generated/blog-index.json'), 'utf8'));
const { TOPICS } = await import('../src/data/topics.ts');
const pages = ['', 'blog', 'research', 'topics', 'thoughts', 'watch', 'pulse', 'fear', 'fund', 'oscillator', 'stack', ...TOPICS.map((topic) => `topics/${topic.slug}`)];
const site = 'https://kkdemian.com';

function readRoute(route) {
  return fs.readFileSync(path.join(root, 'out', `${decodeURIComponent(route).replace(/^\//, '') || 'index'}.html`), 'utf8');
}

function checkDocument(html, locale, canonical) {
  assert.ok(html.includes(`<html lang="${locale}"`), `wrong document language: ${canonical}`);
  assert.ok(html.includes(`rel="canonical" href="${canonical}"`), `wrong canonical: ${canonical}`);
}

for (const locale of LOCALES) {
  for (const page of pages) {
    const route = `/${locale}${page ? `/${page}` : ''}`;
    const html = readRoute(route);
    checkDocument(html, locale, site + route);
    for (const language of LOCALES) {
      assert.ok(html.includes(`hrefLang="${language}"`) || html.includes(`hreflang="${language}"`), `missing page alternate ${language}: ${route}`);
    }
    // Check rendered links rather than RSC JSON embedded in script tags.
    const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    if (page === 'fund') {
      for (const asset of assets) {
        const symbol = asset.ticker ?? asset.handle;
        if (symbol) assert.ok(markup.includes(`>${symbol}</span>`), `translated ticker ${symbol}: ${route}`);
      }
    }
    for (const [, rawHref] of markup.matchAll(/href="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
      const target = decodeURIComponent(rawHref.replaceAll('&amp;', '&'));
      if (!/^\/(?:zh-CN|en|ja)(?:\/|$)/.test(target) && !/^\/blog\//.test(target)) continue;
      assert.ok(fs.existsSync(path.join(root, 'out', `${target.replace(/^\//, '')}.html`)), `broken locale link ${rawHref} on ${route}`);
    }
  }
  const feed = fs.readFileSync(path.join(root, 'public', `rss-${locale}.xml`), 'utf8');
  assert.ok(feed.includes(`<language>${locale}</language>`), `wrong feed language ${locale}`);
  assert.equal((feed.match(/<item>/g) ?? []).length, index.posts.filter((post) => post.language === locale).length);
}

for (const post of index.posts) {
  const route = articleHref(post.slug, post.language);
  const canonical = site + route;
  for (const html of [readRoute(route), readRoute(`/blog/${encodeURIComponent(post.slug)}`)]) {
    checkDocument(html, post.language, canonical);
    assert.ok(html.includes(`<article lang="${post.language}"`), `wrong body language: ${post.slug}`);
    const alternates = [...html.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/g)].map(([, locale, url]) => [locale, url]);
    assert.deepEqual(alternates.filter(([locale]) => LOCALES.includes(locale)).sort(), Object.entries(post.translations).map(([locale, slug]) => [locale, site + articleHref(slug, locale)]).sort(), `wrong article alternates: ${post.slug}`);
  }
}

console.log(`i18n export check passed: ${LOCALES.length * pages.length} localized pages, ${index.posts.length} articles + legacy aliases, three language feeds.`);
