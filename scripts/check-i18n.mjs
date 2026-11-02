// Runs as the last step of `pnpm build`, once the export, the segment-cache
// prune and the legacy redirect stubs are all in place. It lives there rather
// than in ci.yml because it reads out/, and that workflow deliberately skips
// `next build`; being unrunnable there is why nobody noticed it was failing.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { LOCALES, articleHref } from '../src/lib/i18n.ts';
import { assets } from '../src/data/fund.ts';
// Not .generated/ directly: on Vercel the index lives under .next/cache/content
// so it survives between builds (see resolveGeneratedDir).
import { BLOG_INDEX_FILE } from './lib/content/paths.mjs';
import { readCurrentLibrary } from './library/public-reader.mjs';

const root = process.cwd();
const index = JSON.parse(fs.readFileSync(BLOG_INDEX_FILE, 'utf8'));
const { TOPICS } = await import('../src/data/topics.ts');
const { instrumentRouteParams, issuerSlugsWithInstruments } = await import('../src/data/instruments.ts');
const library = await readCurrentLibrary(root);
const libraryDetails = library.items.filter(item => item.detail_enabled);
// /stocks was never in this list, which is why nothing caught that localizeHref
// did not recognise routes below it.
const pages = [
  '', 'blog', 'research', 'topics', 'thoughts', 'watch', 'pulse', 'fear', 'fund', 'oscillator', 'stack', 'stocks', 'library',
  ...libraryDetails.map(item => `library/items/${item.slug}`),
  ...TOPICS.map((topic) => `topics/${topic.slug}`),
  ...issuerSlugsWithInstruments().map((issuer) => `stocks/${issuer}`),
  ...instrumentRouteParams().map(({ issuer, ticker }) => `stocks/${issuer}/${ticker}`),
];
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
    if (page === 'library' || page.startsWith('library/items/')) {
      assert.ok(html.includes('<meta name="referrer" content="no-referrer"'), `missing Library referrer policy: ${route}`);
      assert.ok(html.includes(`<meta name="robots" content="${page === 'library' ? 'noindex' : 'index'}, follow"`), `wrong Library robots: ${route}`);
      assert.equal((markup.match(/<select\b[^>]*aria-label="(?:Site language|网站语言|サイトの言語)"/g) ?? []).length, 1, `Library needs one top language menu: ${route}`);
      assert.ok(!/googletagmanager\.com|gtag\('config'/u.test(html), `Library HTML initializes analytics: ${route}`);
    }
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

for (const page of ['library', ...libraryDetails.map(item => `library/items/${item.slug}`)]) {
  checkDocument(readRoute(`/${page}`), 'en', `${site}/en/${page}`);
}
const librarySitemapNames = fs.readdirSync(path.join(root, 'public/sitemaps')).filter(name => /^library-\d{4}\.xml$/u.test(name));
const libraryUrls = librarySitemapNames.flatMap(name => [...fs.readFileSync(path.join(root, 'public/sitemaps', name), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url));
assert.deepEqual(libraryUrls.sort(), libraryDetails.flatMap(item => LOCALES.map(locale => `${site}/${locale}/library/items/${item.slug}`)).sort(), 'Library sitemap must contain exactly the eligible canonical details');

for (const post of index.posts) {
  const route = articleHref(post.slug, post.language);
  const canonical = site + route;
  const html = readRoute(route);
  checkDocument(html, post.language, canonical);
  assert.ok(html.includes(`<article lang="${post.language}"`), `wrong body language: ${post.slug}`);
  const alternates = [...html.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/g)].map(([, locale, url]) => [locale, url]);
  assert.deepEqual(alternates.filter(([locale]) => LOCALES.includes(locale)).sort(), Object.entries(post.translations).map(([locale, slug]) => [locale, site + articleHref(slug, locale)]).sort(), `wrong article alternates: ${post.slug}`);

  // Since the duplicate /blog/[slug] route was dropped, the legacy URL holds a
  // redirect stub rather than a second copy of the article (see
  // emit-legacy-blog-redirects.mjs). It owes the locale URL a canonical, a meta
  // refresh and the script redirect -- asking it for an <article> or alternates
  // failed on the very first post, which is how this check sat red unnoticed.
  const legacy = readRoute(`/blog/${encodeURIComponent(post.slug)}`);
  checkDocument(legacy, post.language, canonical);
  assert.ok(legacy.includes(`<meta http-equiv="refresh" content="0; url=${route}">`), `legacy stub does not refresh to ${route}`);
  assert.ok(legacy.includes(`location.replace(${JSON.stringify(route)}+location.search+location.hash)`), `legacy stub does not redirect to ${route}`);
}

console.log(`i18n export check passed: ${LOCALES.length * pages.length} localized pages, ${index.posts.length} articles + legacy aliases, three language feeds.`);
