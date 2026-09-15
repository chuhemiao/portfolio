import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { ROOT } from './paths.mjs';

const RELATED_POSTS_LIMIT = 3;
const RELATED_TOPICS_LIMIT = 3;

export async function loadTopics() {
  const module = await import(pathToFileURL(path.join(ROOT, 'src/data/topics.ts')).href);
  return module.TOPICS;
}

export function sortNewestFirst(a, b) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

function matchText(post) {
  return [post.title, post.summary ?? '', post.category ?? ''].join(' ').toLowerCase();
}

export function buildCategoryIndex(posts) {
  const index = {};

  for (const post of posts) {
    const category = post.category;
    if (!category) continue;
    (index[category] ??= []).push(post.slug);
  }

  return index;
}

export function buildTopicIndex(posts, topics) {
  const index = {};
  const normalized = topics.map((topic) => ({
    slug: topic.slug,
    keywords: topic.matchKeywords.map((keyword) => keyword.toLowerCase())
  }));

  for (const topic of normalized) index[topic.slug] = [];

  for (const post of posts) {
    const text = matchText(post);
    for (const topic of normalized) {
      if (topic.keywords.some((keyword) => text.includes(keyword))) {
        index[topic.slug].push(post.slug);
      }
    }
  }

  return index;
}

// Related posts are the newest posts sharing a category. The posts array is
// already sorted newest-first, so each category only needs one linear pass.
export function buildRelations(posts, topics) {
  const byCategory = new Map();

  for (const post of posts) {
    if (!post.category) continue;
    if (!byCategory.has(post.category)) byCategory.set(post.category, []);
    byCategory.get(post.category).push(post.slug);
  }

  const normalizedTopics = topics.map((topic) => ({
    slug: topic.slug,
    keywords: topic.matchKeywords.map((keyword) => keyword.toLowerCase())
  }));

  const relations = {};

  for (const post of posts) {
    const related = [];

    if (post.category) {
      const siblings = byCategory.get(post.category);
      for (const slug of siblings) {
        if (slug === post.slug) continue;
        related.push(slug);
        if (related.length === RELATED_POSTS_LIMIT) break;
      }
    }

    const text = matchText(post);
    const topicSlugs = [];
    for (const topic of normalizedTopics) {
      if (topicSlugs.length === RELATED_TOPICS_LIMIT) break;
      if (topic.keywords.some((keyword) => text.includes(keyword))) {
        topicSlugs.push(topic.slug);
      }
    }

    relations[post.slug] = { posts: related, topics: topicSlugs };
  }

  return relations;
}
