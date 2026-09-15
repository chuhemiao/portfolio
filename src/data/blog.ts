import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const GENERATED_DIR = path.join(process.cwd(), '.generated');
const BLOG_INDEX_FILE = path.join(GENERATED_DIR, 'blog-index.json');
const RELATIONS_FILE = path.join(GENERATED_DIR, 'relations.json');
const TOPIC_INDEX_FILE = path.join(GENERATED_DIR, 'topic-index.json');
const CATEGORY_INDEX_FILE = path.join(GENERATED_DIR, 'category-index.json');
const POSTS_DIR = path.join(GENERATED_DIR, 'posts');

const isDevelopment = process.env.NODE_ENV === 'development';

export type Category = 'thoughts' | 'research' | 'economics' | 'philosophy' | 'investing' | 'tech' | 'ai' | 'story';

export type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
  category?: Category;
  slug?: string;
  draft?: boolean;
  status?: string;
};

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

export type PostListItem = {
  metadata: Metadata;
  slug: string;
  source: string;
};

export type ParsedPost = {
  source: string;
  metadata: Metadata;
  slug: string;
  toc: TocItem[];
};

type BlogIndexEntry = {
  slug: string;
  title: string;
  publishedAt: string;
  summary: string;
  category?: Category;
  image?: string;
  artifact: string;
  contentHash: string;
  sourcePath: string;
};

type BlogIndexFile = {
  compilerVersion: number;
  generatedAt: string;
  count: number;
  posts: BlogIndexEntry[];
};

type Relation = { posts: string[]; topics: string[] };

type ContentIndex = {
  entries: BlogIndexEntry[];
  items: PostListItem[];
  bySlug: Map<string, BlogIndexEntry>;
  itemBySlug: Map<string, PostListItem>;
};

function readJson<T>(filePath: string, label: string): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch (error) {
    throw new Error(
      `Missing or unreadable ${label} at ${path.relative(process.cwd(), filePath)}. Run "pnpm content:build" first.\n${String(error)}`
    );
  }
}

function toMetadata(entry: BlogIndexEntry): Metadata {
  const metadata: Metadata = {
    title: entry.title,
    publishedAt: entry.publishedAt,
    summary: entry.summary
  };

  if (entry.category !== undefined) metadata.category = entry.category;
  if (entry.image !== undefined) metadata.image = entry.image;

  return metadata;
}

function loadContentIndex(): ContentIndex {
  const file = readJson<BlogIndexFile>(BLOG_INDEX_FILE, 'blog index');
  const entries = file.posts;
  const items = entries.map((entry) => ({
    metadata: toMetadata(entry),
    slug: entry.slug,
    source: ''
  }));

  return {
    entries,
    items,
    bySlug: new Map(entries.map((entry) => [entry.slug, entry])),
    itemBySlug: new Map(items.map((item) => [item.slug, item]))
  };
}

let contentIndex: ContentIndex | null = null;
let contentIndexStamp = '';

// The index is read once per process in production. In development it is
// re-read whenever the compiler rewrites it, so `pnpm content:build` in a
// second terminal shows up without restarting the dev server.
function getContentIndex(): ContentIndex {
  if (isDevelopment) {
    const stamp = String(fs.statSync(BLOG_INDEX_FILE).mtimeMs);
    if (!contentIndex || stamp !== contentIndexStamp) {
      contentIndex = loadContentIndex();
      contentIndexStamp = stamp;
    }
    return contentIndex;
  }

  contentIndex ??= loadContentIndex();
  return contentIndex;
}

function loadLazyJson<T>(filePath: string, label: string, holder: { value: T | null }): T {
  if (isDevelopment) return readJson<T>(filePath, label);
  holder.value ??= readJson<T>(filePath, label);
  return holder.value;
}

const relationsHolder: { value: Record<string, Relation> | null } = { value: null };
const topicIndexHolder: { value: Record<string, string[]> | null } = { value: null };
const categoryIndexHolder: { value: Record<string, string[]> | null } = { value: null };

function normalizeSlug(slug: string): string {
  return slug.trim().replace(/^\/+|\/+$/g, '');
}

// Next hands `params.slug` back percent-encoded for non-ASCII routes, so a
// literal lookup misses posts with e.g. a Chinese slug. Try the raw value
// first: existing ASCII slugs never take the decode path.
function lookupKey<T>(slug: string, map: Map<string, T>): T | undefined {
  const normalized = normalizeSlug(slug);
  const direct = map.get(normalized);
  if (direct !== undefined) return direct;

  try {
    return map.get(decodeURIComponent(normalized));
  } catch {
    return undefined;
  }
}

export async function getBlogPosts(): Promise<PostListItem[]> {
  return getContentIndex().items.slice();
}

export function getBlogSlugs(): string[] {
  return getContentIndex().entries.map((entry) => entry.slug);
}

export function getPostMeta(slug: string): PostListItem | null {
  return lookupKey(slug, getContentIndex().itemBySlug) ?? null;
}

// Small bounded cache so `generateMetadata` and the page body never read the
// same artifact twice, without holding every compiled post in memory.
const POST_CACHE_LIMIT = 16;
const postCache = new Map<string, ParsedPost>();

function rememberPost(post: ParsedPost): ParsedPost {
  postCache.set(post.slug, post);
  if (postCache.size > POST_CACHE_LIMIT) {
    const oldest = postCache.keys().next().value;
    if (oldest !== undefined) postCache.delete(oldest);
  }
  return post;
}

async function compileFromSource(entry: BlogIndexEntry): Promise<ParsedPost> {
  const compilerUrl = pathToFileURL(
    path.join(process.cwd(), 'scripts/lib/content/markdown.mjs')
  ).href;
  const compiler = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ compilerUrl);
  const { html, toc } = await compiler.compilePostFile(path.join(process.cwd(), entry.sourcePath));

  return { source: html, metadata: toMetadata(entry), slug: entry.slug, toc };
}

export async function getPost(slug: string): Promise<ParsedPost | null> {
  const entry = lookupKey(slug, getContentIndex().bySlug);

  if (!entry) {
    return null;
  }

  const normalizedSlug = entry.slug;

  // In development the MDX file is the source of truth so edits show up on
  // reload; production builds always read the precompiled artifact.
  if (isDevelopment) {
    return compileFromSource(entry);
  }

  const cached = postCache.get(normalizedSlug);
  if (cached) return cached;

  const [html, artifactJson] = await Promise.all([
    fs.promises.readFile(path.join(POSTS_DIR, `${entry.artifact}.html`), 'utf-8'),
    fs.promises.readFile(path.join(POSTS_DIR, `${entry.artifact}.json`), 'utf-8')
  ]);

  const { toc } = JSON.parse(artifactJson) as { slug: string; toc: TocItem[] };

  return rememberPost({
    source: html,
    metadata: toMetadata(entry),
    slug: entry.slug,
    toc
  });
}

function resolveSlugs(slugs: string[]): PostListItem[] {
  const { itemBySlug } = getContentIndex();
  const items: PostListItem[] = [];

  for (const slug of slugs) {
    const item = itemBySlug.get(slug);
    if (item) items.push(item);
  }

  return items;
}

let relationMap: Map<string, Relation> | null = null;

function getRelation(slug: string): Relation | undefined {
  const relations = loadLazyJson<Record<string, Relation>>(RELATIONS_FILE, 'relations index', relationsHolder);
  if (!relationMap || isDevelopment) relationMap = new Map(Object.entries(relations));
  return lookupKey(slug, relationMap);
}

export function getRelatedPosts(slug: string): PostListItem[] {
  return resolveSlugs(getRelation(slug)?.posts ?? []);
}

export function getRelatedTopicSlugs(slug: string): string[] {
  return getRelation(slug)?.topics ?? [];
}

export function getPostsForTopic(topicSlug: string, limit?: number): PostListItem[] {
  const topicIndex = loadLazyJson<Record<string, string[]>>(TOPIC_INDEX_FILE, 'topic index', topicIndexHolder);
  const slugs = topicIndex[topicSlug] ?? [];
  return resolveSlugs(limit === undefined ? slugs : slugs.slice(0, limit));
}

export function getPostsForCategory(category: string, limit?: number): PostListItem[] {
  const categoryIndex = loadLazyJson<Record<string, string[]>>(
    CATEGORY_INDEX_FILE,
    'category index',
    categoryIndexHolder
  );
  const slugs = categoryIndex[category] ?? [];
  return resolveSlugs(limit === undefined ? slugs : slugs.slice(0, limit));
}
