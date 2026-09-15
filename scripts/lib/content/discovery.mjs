import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import { BLOG_CONTENT_DIR, CONTENT_DIR, ROOT } from './paths.mjs';

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
  const meta = {
    title: toPlainValue(data.title),
    publishedAt: toPlainValue(data.publishedAt),
    summary: toPlainValue(data.summary)
  };

  if (data.category !== undefined && data.category !== null) {
    meta.category = toPlainValue(data.category);
  }

  if (data.image !== undefined && data.image !== null) {
    meta.image = toPlainValue(data.image);
  }

  return meta;
}
