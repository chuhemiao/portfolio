import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { registerHooks } from 'node:module';
import ts from 'typescript';
import { renderToStaticMarkup } from 'react-dom/server';

const root = path.resolve('.');
// Node SSR only: adapt TSX/aliases and Next's server-only marker, without a DOM,
// router, analytics network, layout engine, or a simulated browser lifecycle.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === 'server-only') return { url: 'data:text/javascript,export%20%7B%7D', shortCircuit: true };
    if (specifier === 'next/link') {
      const url = pathToFileURL(path.join(root, 'node_modules/next/link.js')).href;
      return { url: `data:text/javascript,${encodeURIComponent(`import module from ${JSON.stringify(url)}; export default module.default ?? module;`)}`, shortCircuit: true };
    }
    if (specifier === 'next/navigation') return next('next/navigation.js', context);
    const source = specifier.startsWith('@/') ? path.join(root, 'src', specifier.slice(2)) : specifier.startsWith('.') && context.parentURL?.startsWith(pathToFileURL(path.join(root, 'src/')).href) ? path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier) : null;
    if (source && !path.extname(source)) for (const ext of ['.ts', '.tsx']) if (fs.existsSync(source + ext)) return next(pathToFileURL(source + ext).href, context);
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith('file:') && url.endsWith('.tsx')) return { format: 'module', shortCircuit: true, source: ts.transpileModule(fs.readFileSync(fileURLToPath(url), 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText };
    return next(url, context);
  },
});

const { getLibrarySnapshot } = await import('../../src/lib/library/catalog.ts');
const { LibraryPage } = await import('../../src/components/library/library-page.tsx');
const { LibraryItemView } = await import('../../src/components/library/item-view.tsx');
const { LibraryArticleReading, LibraryTopicReading } = await import('../../src/components/library/related-reading.tsx');
const { libraryArticleLinks, libraryItemsForTopic } = await import('../../src/lib/library/relations.ts');
const { libraryIndexMetadata, libraryItemMetadata } = await import('../../src/lib/library/metadata.ts');
const { libraryPublicationDate } = await import('../../src/lib/library/presentation.ts');
const { createLibrarySearch, parseLibraryQuery, serializeLibraryQuery } = await import('../../src/lib/library/search.ts');
const { getPostMeta } = await import('../../src/data/blog.ts');
const { generateStaticParams: legacyParams } = await import('../../src/app/(legacy)/library/items/[slug]/page.tsx');
const { generateStaticParams: localizedParams } = await import('../../src/app/(localized)/[locale]/library/items/[slug]/page.tsx');
const snapshot = await getLibrarySnapshot();
const locales = ['zh-CN', 'en', 'ja'];
const escapeHtml = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' })[char]);

test('real public snapshot supplies exactly 100 curated shared slugs and 400 detail route params', async () => {
  assert.equal(snapshot.items.length, 100);
  assert.equal(Object.keys(snapshot.details).length, 100);
  const legacy = await legacyParams();
  const localized = await localizedParams();
  assert.equal(legacy.length, 100); assert.equal(localized.length, 300);
  for (const locale of locales) assert.deepEqual(localized.filter(value => value.locale === locale).map(value => value.slug), legacy.map(value => value.slug));
  await assert.rejects(LibraryItemView({ locale: 'en', slug: 'unpublished-or-missing-candidate' }), /NEXT_HTTP_ERROR_FALLBACK;404/u);
});

test('three SSR list first screens contain readable real resources and accessible search', async () => {
  for (const locale of locales) {
    const html = renderToStaticMarkup(await LibraryPage({ locale }));
    assert.match(html, /<form role="search" aria-label=/u);
    assert.match(html, /<input id="library-search" type="search"/u);
    assert.match(html, /100/u);
    assert.equal((html.match(/<h3\b[^>]*>[\s\S]*?<a\b[^>]*href="\/(?:en|ja|zh-CN)\/library\/items\//gu) ?? []).length, 20);
    assert.ok(!html.includes('googletagmanager.com'));
    assert.ok(!html.includes('field_provenance'));
    assert.ok(!html.includes('blog-index.json'));
    assert.ok(!html.includes(snapshot.details[snapshot.items[0].id].locales[locale].editorial_body));
  }
});

test('all 300 editorial detail bodies and reasons render fully without external source text injection', async () => {
  for (const item of snapshot.items) for (const locale of locales) {
    const html = renderToStaticMarkup(await LibraryItemView({ locale, slug: item.slug }));
    assert.ok(html.includes(escapeHtml(item.locales[locale].title)), `${item.id}/${locale}: title`);
    for (const paragraph of snapshot.details[item.id].locales[locale].editorial_body.split(/\n\n/u)) assert.ok(html.includes(escapeHtml(paragraph)), `${item.id}/${locale}: body paragraph`);
    for (const reason of item.locales[locale].reasons) assert.ok(html.includes(escapeHtml(reason.text)), `${item.id}/${locale}: reason`);
    assert.ok(html.includes(`href="${escapeHtml(item.canonical_url)}" target="_blank" rel="noopener noreferrer"`));
    assert.ok(!html.includes('href="/ja/blog/agent-to-earn-agent-economy-startup-investment-memo-ja"'));
  }
});

test('list noindex/referrer and detail canonical/hreflang use the real shared slug rather than Topics fallback', () => {
  for (const locale of locales) {
    const index = libraryIndexMetadata(locale);
    assert.equal(index.robots.index, false); assert.equal(index.robots.follow, true); assert.equal(index.referrer, 'no-referrer');
    assert.equal(index.alternates.canonical, `https://kkdemian.com/${locale}/library`);
    for (const item of snapshot.items) {
      const meta = libraryItemMetadata(item, locale);
      assert.equal(meta.title, item.locales[locale].title); assert.equal(meta.description, item.locales[locale].description);
      assert.equal(meta.robots.index, true); assert.equal(meta.referrer, 'no-referrer');
      assert.equal(meta.alternates.canonical, `https://kkdemian.com/${locale}/library/items/${item.slug}`);
      for (const language of locales) assert.equal(meta.alternates.languages[language], `https://kkdemian.com/${language}/library/items/${item.slug}`);
    }
  }
});

test('five real Topic blocks cap at six and ten article groups use only available translation targets', async () => {
  const topicSlugs = Object.keys(snapshot.facets.topics);
  assert.equal(topicSlugs.length, 5);
  for (const slug of topicSlugs) {
    const items = libraryItemsForTopic(snapshot.items, slug);
    assert.ok(items.length > 0 && items.length <= 6);
    const html = renderToStaticMarkup(await LibraryTopicReading({ slug, locale: 'ja' }));
    assert.equal((html.match(/\/ja\/library\/items\//gu) ?? []).length, items.length);
  }
  for (const locale of locales) {
    const articles = libraryArticleLinks(snapshot.relations, locale, getPostMeta);
    assert.equal(articles.length, 10);
    for (const article of articles) {
      const target = getPostMeta(decodeURIComponent(article.href.split('/').at(-1)));
      assert.equal(target.metadata.language, article.language);
      assert.equal(target.metadata.translationKey, article.translationKey);
      const html = renderToStaticMarkup(await LibraryArticleReading({ translationKey: article.translationKey, locale }));
      assert.match(html, new RegExp(`/${locale}/library/items/`, 'u'));
    }
    if (locale === 'ja') {
      assert.equal(articles.find(article => article.translationKey === 'agent-to-earn-agent-economy-startup-investment-memo').language, 'zh-CN');
      assert.equal(articles.find(article => article.translationKey === 'uniswap-liquidity-infrastructure-evolution-or-uni-governance-legacy').language, 'en');
      assert.equal(articles.find(article => article.translationKey === 'circle-arc-usdc-long-term-settlement-moat').language, 'zh-CN');
    }
  }
  assert.equal(renderToStaticMarkup(await LibraryArticleReading({ translationKey: 'unrelated-existing-group', locale: 'en' })), '');
  assert.equal(renderToStaticMarkup(await LibraryTopicReading({ slug: 'unknown-topic', locale: 'en' })), '');
});

test('B1 applies local visibility before total/page slicing and preserves the URL contract', () => {
  const search = createLibrarySearch(snapshot);
  const ids = new Set(snapshot.items.slice(0, 23).map(item => item.id));
  const result = search.search({ page: '2' }, { locale: 'en', asOf: snapshot.manifest.as_of, itemIds: ids });
  assert.equal(result.total, 23); assert.equal(result.page_count, 2); assert.equal(result.results.length, 3);
  assert.ok(result.results.every(hit => ids.has(hit.item.id)));
  assert.equal(search.search({}, { itemIds: new Set(), asOf: snapshot.manifest.as_of }).total, 0);
  const query = parseLibraryQuery(new URLSearchParams('q=ERC-7702&topic=l1-l2&sort=evergreen&page=2'));
  assert.deepEqual(parseLibraryQuery(serializeLibraryQuery(query)), query);
  for (const value of ['q=a&q=b', 'page=0', 'recommendedFrom=2026-11-02&recommendedTo=2026-01-01', 'q=' + 'x'.repeat(201)]) assert.throws(() => parseLibraryQuery(new URLSearchParams(value)));
  assert.equal(search.search({ topic: 'no-longer-in-library', language: 'fr', year: '2099' }, { asOf: snapshot.manifest.as_of }).total, 0);
});

test('publication precision never turns unknown or year/month metadata into an invented day', () => {
  assert.equal(libraryPublicationDate({ original_published_at: null, date_precision: 'unknown' }, 'en'), 'Publication date unknown');
  assert.equal(libraryPublicationDate({ original_published_at: '2018-01-01', date_precision: 'year' }, 'en'), '2018');
  assert.equal(libraryPublicationDate({ original_published_at: '2018-02-01', date_precision: 'month' }, 'en'), 'Feb 2018');
  assert.equal(libraryPublicationDate({ original_published_at: '2018-02-03', date_precision: 'day' }, 'en'), 'Feb 3, 2018');
});
