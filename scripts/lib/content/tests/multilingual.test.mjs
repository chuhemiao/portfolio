import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { registerHooks } from 'node:module';
import test from 'node:test';

import { buildTranslationGroups, hashSource, toIndexMetadata, validateTranslationProvenance } from '../discovery.mjs';
import { buildRelations, buildTopicIndex, loadTopics } from '../indexes.mjs';
import { extractToc, markdownToHTML } from '../markdown.mjs';
import { selectResearchPosts } from '../../../sync-research-registry.mjs';

const post = (slug, language, extra = {}) => ({
  slug, language, title: slug, summary: '', publishedAt: '2026-10-13', category: 'research', ...extra
});

test('Japanese kana headings have usable anchors matching the table of contents', async () => {
  const markdown = '## トークンのキャッシュフロー\n\n## インフラとしての位置づけ\n\n## 用户与收入\n\n## Users and revenue';
  const toc = extractToc(markdown);
  const html = await markdownToHTML(markdown);
  assert.deepEqual(toc.map((item) => item.id), [
    'トークンのキャッシュフロー', 'インフラとしての位置づけ', '用户与收入', 'users-and-revenue'
  ]);
  for (const item of toc) assert.ok(html.includes(`id="${item.id}"`));
  assert.ok(!html.includes('id=""'));
});

test('formatted and repeated headings use the same unique anchors in HTML and the TOC', async () => {
  const markdown = '## 手順 3：探す：`php.ini`設定\n\n## Fees & Revenue\n\n## [リンク](https://example.com) **見出し**\n\n## Fees & Revenue\n\n## !!!\n\n```sh\n## not a heading\n```';
  const toc = extractToc(markdown);
  const html = await markdownToHTML(markdown);
  assert.deepEqual(toc.map((item) => item.id), [
    '手順-3探すphpini設定', 'fees-revenue', 'リンク-見出し', 'fees-revenue-1', 'section'
  ]);
  for (const item of toc) assert.ok(html.includes(`id="${item.id}"`), item.id);
  assert.equal(toc[0].text, '手順 3：探す：php.ini設定');
  assert.equal(toc.length, 5);
});

test('automatic heading IDs preserve the accessible footnote heading target', async () => {
  const markdown = '## Notes\n\nSource reference[^1].\n\n[^1]: Supporting evidence.';
  const html = await markdownToHTML(markdown);
  assert.ok(html.includes('aria-describedby="footnote-label"'));
  assert.ok(html.includes('id="footnote-label"'));
  assert.deepEqual(extractToc(markdown).map((item) => item.id), ['notes']);
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

test('an intersection topic needs both halves, and its generic half alone is not enough', () => {
  const posts = buildTranslationGroups([
    post('both', 'en', { title: 'AI agents settling on-chain' }),
    post('generic', 'en', { title: 'How will we live after AI?' }),
    post('other', 'en', { title: 'On-chain settlement latency' })
  ]);
  const topics = [{ slug: 'ai-crypto', matchKeywords: ['ai', 'agent'], requireAnyOf: ['on-chain', 'token'] }];
  assert.deepEqual(buildTopicIndex(posts, topics)['ai-crypto'], ['both']);
});

test('the real ai-crypto topic stays about the intersection rather than about AI', async () => {
  const topics = (await loadTopics()).filter((topic) => topic.slug === 'ai-crypto');
  assert.equal(topics.length, 1);
  const posts = buildTranslationGroups([
    post('essay', 'en', { title: 'When humans are no longer needed: how will we live after AI?' }),
    post('notes', 'en', { title: 'Markdown Syntax Study Notes', summary: 'the rendered result' }),
    post('equity', 'en', { title: 'Astera Labs: AI rack-scale connectivity, growth quality and valuation' }),
    post('network', 'en', { title: 'Gensyn: a decentralized compute network for machine learning' }),
    post('agents', 'en', { title: 'AI agents holding a wallet' })
  ]);
  assert.deepEqual(buildTopicIndex(posts, topics)['ai-crypto'], ['network', 'agents']);
});

test('excludeIfAnyOf drops a keyword hit that belongs to the neighbouring topic', () => {
  const posts = buildTranslationGroups([
    post('essay', 'en', { title: 'How will we live after AI?' }),
    post('report', 'en', { title: 'AI Analysis Token: on-chain value capture' })
  ]);
  const topics = [{ slug: 'ai', matchKeywords: ['ai'], excludeIfAnyOf: ['on-chain', 'token'] }];
  assert.deepEqual(buildTopicIndex(posts, topics).ai, ['essay']);
});

test('the real ai and ai-crypto topics split the AI corpus instead of overlapping', async () => {
  const topics = (await loadTopics()).filter((topic) => topic.slug === 'ai' || topic.slug === 'ai-crypto');
  assert.equal(topics.length, 2);
  const posts = buildTranslationGroups([
    post('essay', 'en', { title: 'When humans are no longer needed: how will we live after AI?' }),
    post('equity', 'en', { title: 'Astera Labs: AI rack-scale connectivity, growth quality and valuation' }),
    post('harness', 'en', { title: 'Self-Harness: when an agentic system edits its own operating system' }),
    post('network', 'en', { title: 'Gensyn: a decentralized compute network for machine learning' }),
    post('venue', 'en', { title: 'Binance product teardown', summary: 'deep research with ai report' })
  ]);
  const index = buildTopicIndex(posts, topics);
  assert.deepEqual(index.ai, ['essay', 'equity', 'harness']);
  assert.deepEqual(index['ai-crypto'], ['network']);
  assert.deepEqual(index.ai.filter((slug) => index['ai-crypto'].includes(slug)), []);
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
