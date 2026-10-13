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

function groupPosts(posts) {
  const groups = new Map();
  for (const post of posts) {
    const key = post.translationKey ?? post.slug;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(post);
  }
  return groups;
}

export function buildTopicIndex(posts, topics) {
  const index = Object.fromEntries(topics.map((topic) => [topic.slug, []]));
  for (const members of groupPosts(posts).values()) {
    const text = members.map(matchText).join(' ');
    for (const topic of topics) {
      if (topic.matchKeywords.some((keyword) => text.includes(keyword.toLowerCase()))) {
        index[topic.slug].push(...members.map((post) => post.slug));
      }
    }
  }
  return index;
}

export function buildRelations(posts, topics) {
  const groups = groupPosts(posts);
  const topicIndex = buildTopicIndex(posts, topics);
  const topicSets = Object.fromEntries(Object.entries(topicIndex).map(([slug, entries]) => [slug, new Set(entries)]));
  const relations = {};
  for (const post of posts) {
    const related = [];
    if (post.category) {
      for (const [key, members] of groups) {
        if (key === (post.translationKey ?? post.slug)) continue;
        const siblings = members.filter((member) => member.category === post.category);
        if (siblings.length === 0) continue;
        const sibling = siblings.find((member) => member.language === post.language)
          ?? siblings.find((member) => member.slug === member.sourceSlug) ?? siblings[0];
        related.push(sibling.slug);
        if (related.length === RELATED_POSTS_LIMIT) break;
      }
    }
    relations[post.slug] = {
      posts: related,
      topics: topics.filter((topic) => topicSets[topic.slug].has(post.slug)).slice(0, RELATED_TOPICS_LIMIT).map((topic) => topic.slug)
    };
  }
  return relations;
}
