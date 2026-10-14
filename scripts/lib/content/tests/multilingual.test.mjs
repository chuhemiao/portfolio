import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { registerHooks } from 'node:module';
import test from 'node:test';

import { buildTranslationGroups, hashSource, toIndexMetadata, validateTranslationProvenance } from '../discovery.mjs';
import { buildRelations, buildTopicIndex } from '../indexes.mjs';
import { selectResearchPosts } from '../../../sync-research-registry.mjs';

const post = (slug, language, extra = {}) => ({
  slug, language, title: slug, summary: '', publishedAt: '2026-10-13', category: 'research', ...extra
});

test('generated translations reject changed, missing or self-referencing sources', () => {
  const hash = hashSource('original body');
  const source = { slug: 'original', sourceHash: hash };
  const translated = { slug: 'original-ja', sourceSlug: 'original', translationSourceHash: hash };
  assert.doesNotThrow(() => validateTranslationProvenance([source, translated]));
  assert.throws(() => validateTranslationProvenance([{ ...source, sourceHash: hashSource('revised body') }, translated]), /stale/);
  assert.throws(() => validateTranslationProvenance([translated]), /requires a distinct source/);
  assert.throws(() => validateTranslationProvenance([{ ...translated, sourceSlug: translated.slug }]), /requires a distinct source/);
  assert.doesNotThrow(() => validateTranslationProvenance([source, { slug: 'manual-ja', sourceSlug: 'original' }]));
});

test('generated translation metadata validates provenance digest and source', () => {
  const hash = hashSource('original body');
  assert.equal(toIndexMetadata({ sourceSlug: 'original', translationSourceHash: hash }).translationSourceHash, hash);
  assert.throws(() => toIndexMetadata({ sourceSlug: 'original', translationSourceHash: 'abc' }), /SHA-256/);
  assert.throws(() => toIndexMetadata({ translationSourceHash: hash }), /requires sourceSlug/);
});

test('metadata canonicalizes aliases and detects Japanese kana before Han', () => {
  assert.equal(toIndexMetadata({ title: '中文' }).language, 'zh-CN');
  assert.equal(toIndexMetadata({ title: '日本語の記事' }).language, 'ja');
  assert.equal(toIndexMetadata({ title: 'こんにちは' }).language, 'ja');
  assert.equal(toIndexMetadata({ title: '株は' }).language, 'ja');
  assert.equal(toIndexMetadata({
    title: '༼ つ ◕_◕ ༽つ / GIB: DeFi infrastructure value capture, liquidity, and token risk',
    summary: '༼ つ ◕_◕ ༽つ is treated as a DeFi infrastructure watchlist candidate.'
  }).language, 'en');
  assert.equal(toIndexMetadata({ title: '市場', language: 'ja' }).language, 'ja');
  assert.equal(toIndexMetadata({ title: '中文', language: 'en-US' }).language, 'en');
  assert.equal(toIndexMetadata({ language: 'zh' }).language, 'zh-CN');
  assert.throws(() => toIndexMetadata({ language: 'fr' }), /Unsupported language/);
  assert.throws(() => toIndexMetadata({ translationKey: '' }), /non-empty/);
});

test('legacy bilingual pairs expand to a three-language group', () => {
  const grouped = buildTranslationGroups([
    post('guide', 'zh-CN', { translationSlug: 'guide-en' }),
    post('guide-en', 'en', { translationSlug: 'guide' }),
    post('guide-ja', 'ja')
  ]);
  for (const member of grouped) {
    assert.equal(member.translationKey, 'guide');
    assert.equal(member.sourceSlug, 'guide');
    assert.deepEqual(member.translations, { 'zh-CN': 'guide', en: 'guide-en', ja: 'guide-ja' });
  }
});

test('an English source remains original after Chinese and Japanese translations arrive', () => {
  const grouped = buildTranslationGroups([
    post('bitcoin', 'en', { translationKey: 'bitcoin-paper' }),
    post('bitcoin-zh-CN', 'zh-CN', { translationKey: 'bitcoin-paper' }),
    post('bitcoin-ja', 'ja', { translationKey: 'bitcoin-paper' }),
    post('standalone-ja', 'ja')
  ]);
  assert.equal(grouped[1].sourceSlug, 'bitcoin');
  assert.deepEqual(grouped[3].translations, { ja: 'standalone-ja' });
  assert.deepEqual(selectResearchPosts(grouped).map((item) => item.slug), ['bitcoin', 'standalone-ja']);
});

test('unpublished members never become selectable or expose legacy links', () => {
  const grouped = buildTranslationGroups([
    post('guide', 'en', { translationSlug: 'guide-ja' }),
    post('guide-ja', 'ja', { draft: true })
  ]);
  assert.deepEqual(grouped[0].translations, { en: 'guide' });
  assert.equal(grouped[0].translationSlug, undefined);
  assert.deepEqual(selectResearchPosts(grouped).map((item) => item.slug), ['guide']);
});

test('rejects missing, self, duplicate language and ambiguous translation groups', () => {
  assert.throws(() => buildTranslationGroups([post('a', 'en', { translationSlug: 'missing' })]), /does not exist/);
  assert.throws(() => buildTranslationGroups([post('a', 'en', { sourceSlug: 'missing' })]), /does not exist/);
  assert.throws(() => buildTranslationGroups([post('a', 'en', { translationSlug: 'a' })]), /same post/);
  assert.throws(() => buildTranslationGroups([post('a', 'en'), post('a-en', 'en')]), /duplicate en/);
  assert.throws(() => buildTranslationGroups([post('a', 'en', { translationKey: 'same' }), post('b', 'ja', { translationKey: 'same' })]), /ambiguous/);
  assert.throws(() => buildTranslationGroups([post('a', 'en', { translationKey: 'one' }), post('a-ja', 'ja', { translationKey: 'two' })]), /conflicting translationKey/);
  assert.throws(() => buildTranslationGroups([post('a', 'en'), post('a', 'ja')]), /Duplicate slug/);
  assert.throws(() => buildTranslationGroups([post('a', 'en'), post('b', 'ja', { translationKey: 'a' })]), /conflicts with another/);
});

test('explicit source handles unrelated slugs and keeps topical reports out of registry', () => {
  const grouped = buildTranslationGroups([
    post('project', 'en'),
    post('项目研究', 'zh-CN', { sourceSlug: 'project' }),
    post('project-ja', 'ja'),
    post('project-mining', 'en', { researchProjectSlug: '项目研究' }),
    post('project-mining-ja', 'ja', { researchProjectSlug: '项目研究' })
  ]);
  assert.equal(grouped[1].sourceSlug, 'project');
  assert.deepEqual(selectResearchPosts(grouped).map((item) => item.slug), ['project']);
});

test('topic membership is shared across translations; related posts exclude their own group', () => {
  const posts = buildTranslationGroups([
    post('a', 'en', { title: 'Bitcoin' }), post('a-ja', 'ja', { title: 'ビットコイン' }),
    post('b', 'en'), post('b-ja', 'ja'), post('c', 'zh-CN')
  ]);
  const topics = [{ slug: 'btc', matchKeywords: ['bitcoin'] }];
  assert.deepEqual(buildTopicIndex(posts, topics).btc, ['a', 'a-ja']);
  const relations = buildRelations(posts, topics);
  assert.deepEqual(relations['a-ja'].posts, ['b-ja', 'c']);
  assert.deepEqual(relations['a-ja'].topics, ['btc']);
});

test('runtime list and href helpers prefer translations and preserve actual fallback language', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'portfolio-i18n-'));
  const previousCache = process.env.CONTENT_CACHE_DIR;
  process.env.CONTENT_CACHE_DIR = directory;
  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      if (['../lib/i18n', '../lib/post-locale-selection'].includes(specifier) && context.parentURL?.endsWith('/src/data/blog.ts')) {
        return nextResolve(`${specifier}.ts`, context);
      }
      return nextResolve(specifier, context);
    }
  });
  try {
    const entries = buildTranslationGroups([
      post('a', 'en'), post('a-zh-CN', 'zh-CN'), post('a-ja', 'ja'), post('b', 'en')
    ]);
    await fs.writeFile(path.join(directory, 'blog-index.json'), JSON.stringify({ posts: entries }));
    const { getBlogPosts, getLocalizedPosts, getPostHref, getPostTranslations } = await import('../../../../src/data/blog.ts');
    const posts = await getBlogPosts();
    assert.deepEqual(getLocalizedPosts(posts, 'ja').map((item) => item.slug), ['a-ja', 'b']);
    assert.equal(getPostHref(posts[0], 'ja'), '/ja/blog/a-ja');
    assert.equal(getPostHref(posts[3], 'ja'), '/en/blog/b');
    assert.deepEqual(getPostTranslations('a'), { en: 'a', 'zh-CN': 'a-zh-CN', ja: 'a-ja' });
  } finally {
    hooks.deregister();
    if (previousCache === undefined) delete process.env.CONTENT_CACHE_DIR;
    else process.env.CONTENT_CACHE_DIR = previousCache;
    await fs.rm(directory, { recursive: true, force: true });
  }
});
