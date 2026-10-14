import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import { BLOG_CONTENT_DIR, CONTENT_DIR, ROOT } from './paths.mjs';
import { inferLocale, normalizeLocale } from '../../../src/lib/i18n.ts';

const DRAFT_DIRECTORY_NAMES = new Set(['drafts', '_drafts']);

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function readMdxFilesRecursive(dir) {
  if (!(await pathExists(dir))) return [];

  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await readMdxFilesRecursive(fullPath)));
    } else if (entry.isFile() && path.extname(entry.name) === '.mdx') {
      files.push(fullPath);
    }
  }

  return files;
}

async function readLegacyRootMdxFiles() {
  if (!(await pathExists(CONTENT_DIR))) return [];

  const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && path.extname(entry.name) === '.mdx')
    .map((entry) => path.join(CONTENT_DIR, entry.name));
}

export async function discoverContentFiles() {
  const files = [...(await readLegacyRootMdxFiles()), ...(await readMdxFilesRecursive(BLOG_CONTENT_DIR))];
  return files.sort();
}

export function toRelativePath(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

export function toAbsolutePath(relativePath) {
  return path.join(ROOT, relativePath.split('/').join(path.sep));
}

export function normalizeSlug(slug) {
  return String(slug ?? '').trim().replace(/^\/+|\/+$/g, '');
}

export function isDraftPath(filePath) {
  const relativePath = path.relative(CONTENT_DIR, filePath);
  return relativePath
    .split(path.sep)
    .map((segment) => segment.toLowerCase())
    .some((segment) => DRAFT_DIRECTORY_NAMES.has(segment));
}

export function isDraftPost(metadata, filePath) {
  return (
    isDraftPath(filePath) ||
    metadata.draft === true ||
    (typeof metadata.status === 'string' && metadata.status.toLowerCase() === 'draft')
  );
}

export function resolveSlug(filePath, metadata) {
  const fallbackSlug = path.basename(filePath, path.extname(filePath));
  const configuredSlug =
    typeof metadata.slug === 'string' && metadata.slug.length > 0 ? metadata.slug : fallbackSlug;
  const slug = normalizeSlug(configuredSlug);

  if (!slug) {
    throw new Error(`Empty slug found in ${toRelativePath(filePath)}`);
  }

  if (slug.includes('/')) {
    throw new Error(
      `Invalid slug "${slug}" in ${toRelativePath(filePath)}. Nested slugs are not supported with /blog/[slug].`
    );
  }

  return slug;
}

export function hashSource(source) {
  return crypto.createHash('sha256').update(source).digest('hex');
}

export function artifactIdForSlug(slug) {
  return crypto.createHash('sha256').update(slug).digest('hex');
}

function toPlainValue(value) {
  if (value instanceof Date) return value.toISOString();
  return value;
}

export function toIndexMetadata(data) {
  const text = `${data.title ?? ''} ${data.summary ?? ''}`;
  const inferredLanguage = inferLocale(text);
  const language = normalizeLocale(data.language);
  if (data.language !== undefined && !language) {
    throw new Error(`Unsupported language "${data.language}"; use zh-CN, en or ja`);
  }
  const meta = {
    title: toPlainValue(data.title),
    publishedAt: toPlainValue(data.publishedAt),
    summary: toPlainValue(data.summary),
    language: language ?? inferredLanguage
  };

  if (data.category !== undefined && data.category !== null) {
    meta.category = toPlainValue(data.category);
  }

  if (data.image !== undefined && data.image !== null) {
    meta.image = toPlainValue(data.image);
  }

  for (const field of ['translationSlug', 'translationKey', 'sourceSlug']) {
    if (data[field] === undefined) continue;
    if (typeof data[field] !== 'string' || !data[field].trim()) {
      throw new Error(`${field} must be a non-empty string`);
    }
    meta[field] = field === 'translationKey' ? data[field].trim() : normalizeSlug(data[field]);
  }

  if (data.translationSourceHash !== undefined) {
    if (typeof data.translationSourceHash !== 'string' || !/^[a-f0-9]{64}$/.test(data.translationSourceHash)) {
      throw new Error('translationSourceHash must be a SHA-256 hex digest');
    }
    if (!meta.sourceSlug) throw new Error('translationSourceHash requires sourceSlug');
    meta.translationSourceHash = data.translationSourceHash;
  }

  return meta;
}

export function validateTranslationProvenance(posts) {
  const bySlug = new Map(posts.map((post) => [post.slug, post]));
  for (const post of posts) {
    if (!post.translationSourceHash) continue;
    const source = bySlug.get(post.sourceSlug);
    if (!source || source.slug === post.slug) {
      throw new Error(`Translation "${post.slug}" requires a distinct source "${post.sourceSlug}"`);
    }
    if (post.translationSourceHash !== source.sourceHash) {
      throw new Error(`Translation "${post.slug}" is stale: source "${post.sourceSlug}" changed; regenerate or review the translation`);
    }
  }
}

export function buildTranslationGroups(posts) {
  const bySlug = new Map();
  for (const post of posts) {
    if (bySlug.has(post.slug)) throw new Error(`Duplicate slug "${post.slug}"`);
    bySlug.set(post.slug, post);
  }
  const parent = new Map(posts.map((post) => [post.slug, post.slug]));
  function root(slug) {
    const ancestor = parent.get(slug);
    if (ancestor === slug) return slug;
    const resolved = root(ancestor);
    parent.set(slug, resolved);
    return resolved;
  }
  function join(a, b) { parent.set(root(b), root(a)); }
  const keys = new Map();
  for (const post of posts) {
    for (const field of ['translationSlug', 'sourceSlug']) {
      if (!post[field]) continue;
      const target = normalizeSlug(post[field]);
      if (target === post.slug && field === 'translationSlug') {
        throw new Error(`${post.slug}: translationSlug cannot reference the same post`);
      }
      if (!bySlug.has(target)) throw new Error(`${post.slug}: ${field} "${target}" does not exist`);
      join(post.slug, target);
    }
    if (post.translationKey) {
      const previous = keys.get(post.translationKey);
      if (previous) join(post.slug, previous);
      else keys.set(post.translationKey, post.slug);
    }
    const suffix = post.slug.match(/-(en|ja|zh-CN|zh)$/);
    if (suffix) {
      const base = post.slug.slice(0, -suffix[0].length);
      if (bySlug.has(base)) join(post.slug, base);
    }
  }
  const groups = new Map();
  for (const post of posts) {
    const key = root(post.slug);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(post);
  }
  const resolvedKeys = new Map();
  return posts.map((post) => {
    const members = groups.get(root(post.slug));
    const explicitKeys = new Set(members.map((member) => member.translationKey).filter(Boolean));
    if (explicitKeys.size > 1) throw new Error(`${post.slug}: conflicting translationKey values in translation group`);
    const explicitSources = new Set(members.map((member) => member.sourceSlug).filter(Boolean));
    if (explicitSources.size > 1) throw new Error(`${post.slug}: conflicting sourceSlug values in translation group`);
    const languages = new Set();
    for (const member of members) {
      if (languages.has(member.language)) throw new Error(`${post.slug}: duplicate ${member.language} language in translation group`);
      languages.add(member.language);
    }
    const published = members.filter((member) => !member.draft);
    const unsuffixed = members.filter((member) => !/-(en|ja|zh-CN|zh)$/.test(member.slug));
    if (explicitSources.size === 0 && unsuffixed.length > 1) {
      throw new Error(`${post.slug}: ambiguous translation source; set sourceSlug to the original post`);
    }
    const original = bySlug.get([...explicitSources][0]) ?? unsuffixed[0] ?? members.slice().sort((a, b) => a.slug.localeCompare(b.slug))[0];
    const translationKey = [...explicitKeys][0] ?? original.slug;
    const previousFamily = resolvedKeys.get(translationKey);
    if (previousFamily && previousFamily !== root(post.slug)) {
      throw new Error(`${post.slug}: translationKey "${translationKey}" conflicts with another translation group`);
    }
    resolvedKeys.set(translationKey, root(post.slug));
    const source = original.draft ? published[0] ?? original : original;
    const translations = Object.fromEntries(published.map((member) => [member.language, member.slug]));
    const { translationSlug, ...metadata } = post;
    const legacyTarget = published.find((member) => member.slug === translationSlug && member.slug !== post.slug)
      ?? published.find((member) => member.slug !== post.slug);
    return {
      ...metadata,
      translationKey,
      sourceSlug: source.slug,
      translations,
      ...(legacyTarget ? { translationSlug: legacyTarget.slug } : {})
    };
  });
}
