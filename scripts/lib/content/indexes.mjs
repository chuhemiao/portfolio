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

// Keywords match at a word start, so "perp" still catches "perpetuals" and
// "token" catches "tokenized". Plain substring matching put 622 of 3,043 post
// groups under ai-crypto, 610 of them on the bare "ai" in words like chain,
// available, retail and airdrop; "chain" likewise pulled every blockchain post
// into l1-l2, and "dai" pulled in anything saying daily.
//
// A few keywords are too short to be safe even as prefixes, so they match as
// whole words only. Boundaries are ASCII-only in JS regexes, so they are
// applied only where the keyword actually ends in an ASCII word character --
// a CJK keyword like 链上美股 needs none and would never match with one.
const WHOLE_WORD_ONLY = new Set(['ai', 'dai']);

// Word boundaries still leave an intersection topic matching on half of itself:
// ai-crypto owns the bare "ai", so any title with AI in it landed there, crypto
// or not -- 21 of its 157 groups were things like a Markdown syntax note, an
// Astera Labs equity memo and an essay on post-AI society. Such a topic also
// declares requireAnyOf, and a keyword hit only counts alongside one of those.

function keywordPattern(keyword) {
  const lower = keyword.toLowerCase();
  const escaped = lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const lead = /^[a-z0-9]/.test(lower) ? '\\b' : '';
  const trail = WHOLE_WORD_ONLY.has(lower) && /[a-z0-9]$/.test(lower) ? '\\b' : '';
  return new RegExp(`${lead}${escaped}${trail}`);
}

export function buildTopicIndex(posts, topics) {
  const index = Object.fromEntries(topics.map((topic) => [topic.slug, []]));
  const patterns = topics.map((topic) => topic.matchKeywords.map(keywordPattern));
  const required = topics.map((topic) => topic.requireAnyOf?.map(keywordPattern));
  for (const members of groupPosts(posts).values()) {
    const text = members.map(matchText).join(' ');
    topics.forEach((topic, i) => {
      if (!patterns[i].some((pattern) => pattern.test(text))) return;
      if (required[i] && !required[i].some((pattern) => pattern.test(text))) return;
      index[topic.slug].push(...members.map((post) => post.slug));
    });
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
