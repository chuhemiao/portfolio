import test from 'node:test';
import assert from 'node:assert/strict';
import { selectLocalizedPosts, filterPostsForLocale, paginatePosts } from './post-locale-selection.ts';
import { articleHref } from './i18n.ts';

function post(slug, language, key, sourceSlug, translations, title = slug, summary = '', category = 'research') {
  return { slug, metadata: { language, translationKey: key, sourceSlug, translations, title, summary, category } };
}
const guideTranslations = { en: 'guide', 'zh-CN': 'guide-zh', ja: 'guide-ja' };
const guide = post('guide', 'en', 'guide', 'guide', guideTranslations, 'Bitcoin setup guide', 'Native wallet security');
const chinese = post('guide-zh', 'zh-CN', 'guide', 'guide', guideTranslations, '比特币接入指南', '钱包安全');
const japanese = post('guide-ja', 'ja', 'guide', 'guide', guideTranslations, 'ビットコイン接続ガイド', 'ウォレットの安全性');
const original = post('original', 'zh-CN', 'original', 'original', { 'zh-CN': 'original' }, '独立开发心得', '产品实践', 'thoughts');
const posts = [guide, chinese, japanese, original];

test('default lists choose one real version per group and retain source order', () => {
  assert.deepEqual(selectLocalizedPosts(posts, 'zh-CN'), [chinese, original]);
  assert.deepEqual(selectLocalizedPosts(posts, 'en'), [guide, original]);
  assert.deepEqual(selectLocalizedPosts([japanese, original, guide, chinese], 'ja'), [original, japanese]);
});

test('missing translations fall back to actual source language and URLs', () => {
  const result = selectLocalizedPosts(posts, 'ja');
  assert.equal(result[1], original);
  assert.equal(articleHref(result[1].slug, result[1].metadata.language), '/zh-CN/blog/original');
  const subset = selectLocalizedPosts([chinese], 'ja', (slug) => posts.find((candidate) => candidate.slug === slug));
  assert.deepEqual(subset, [japanese]);
  assert.deepEqual(selectLocalizedPosts([chinese], 'en', (slug) => posts.find((candidate) => candidate.slug === slug)), [guide]);
});

test('dangling or incorrect language metadata cannot create a fake translation', () => {
  const damaged = post('damaged', 'en', 'damaged', 'damaged', { ja: 'guide' });
  assert.deepEqual(selectLocalizedPosts([...posts, damaged], 'ja'), [japanese, original, damaged]);
  assert.deepEqual(selectLocalizedPosts([damaged], 'ja'), [damaged]);
});

test('explicit all preserves every version and explicit locales filter real body languages', () => {
  assert.deepEqual(filterPostsForLocale(posts, 'ja', { language: 'all' }), posts);
  assert.deepEqual(filterPostsForLocale(posts, 'en', { language: 'zh-CN' }), [chinese, original]);
  assert.deepEqual(filterPostsForLocale(posts, 'zh-CN', { language: 'ja' }), [japanese]);
});

test('topic filters inherit across translation groups before pagination', () => {
  assert.deepEqual(filterPostsForLocale(posts, 'zh-CN', { language: 'auto', topicSlugs: new Set(['guide']) }), [chinese]);
  assert.deepEqual(filterPostsForLocale(posts, 'ja', { language: 'auto', topicSlugs: new Set() }), []);
  assert.deepEqual(filterPostsForLocale(posts, 'en', { language: 'auto', category: 'thoughts' }), [original]);
});

test('default search checks selected translation and original title and summary', () => {
  assert.deepEqual(filterPostsForLocale(posts, 'zh-CN', { language: 'auto', query: '  BITCOIN  ' }), [chinese]);
  assert.deepEqual(filterPostsForLocale(posts, 'zh-CN', { language: 'auto', query: 'wallet security' }), [chinese]);
  assert.deepEqual(filterPostsForLocale(posts, 'zh-CN', { language: 'auto', query: '钱包' }), [chinese]);
  assert.deepEqual(filterPostsForLocale(posts, 'zh-CN', { language: 'auto', query: 'ウォレット' }), []);
  assert.deepEqual(filterPostsForLocale(posts, 'zh-CN', { language: 'zh-CN', query: 'Bitcoin' }), []);
});

test('pagination uses deduplicated counts and handles empty, invalid and out-of-range pages', () => {
  const selected = filterPostsForLocale(posts, 'ja', { language: 'auto' });
  assert.deepEqual(paginatePosts(selected, 9, 1), { posts: [original], page: 2, totalPages: 2, startIndex: 1 });
  assert.deepEqual(paginatePosts(selected, NaN, 12), { posts: selected, page: 1, totalPages: 1, startIndex: 0 });
  assert.equal(paginatePosts(selected, -1, 12).page, 1);
  assert.equal(paginatePosts(selected, 1.5, 12).page, 1);
  assert.deepEqual(paginatePosts([], 2, 12), { posts: [], page: 1, totalPages: 0, startIndex: 0 });
  assert.throws(() => paginatePosts(selected, 1, 0), RangeError);
  assert.throws(() => paginatePosts(selected, 1, Infinity), RangeError);
});
