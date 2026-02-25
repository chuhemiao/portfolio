import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const BLOG_CONTENT_DIR = path.join(CONTENT_DIR, 'blog');
const REQUIRED_FIELDS = ['title', 'publishedAt', 'summary'];
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;
const DRAFT_DIRECTORY_NAMES = new Set(['drafts', '_drafts']);

function getMDXFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return getMDXFiles(fullPath);
    }

    if (entry.isFile() && path.extname(entry.name) === '.mdx') {
      return [fullPath];
    }

    return [];
  });
}

function getLegacyRootMDXFiles() {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  return fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && path.extname(entry.name) === '.mdx')
    .map((entry) => path.join(CONTENT_DIR, entry.name));
}

function getBlogMDXFiles() {
  return [...getLegacyRootMDXFiles(), ...getMDXFiles(BLOG_CONTENT_DIR)];
}

function normalizeSlug(slug) {
  return slug.trim().replace(/^\/+|\/+$/g, '');
}

function isDraftPath(filePath) {
  const relativePath = path.relative(CONTENT_DIR, filePath);
  const segments = relativePath.split(path.sep).map((segment) => segment.toLowerCase());
  return segments.some((segment) => DRAFT_DIRECTORY_NAMES.has(segment));
}

function isDraft(metadata, filePath) {
  if (isDraftPath(filePath)) {
    return true;
  }

  if (metadata.draft === true) {
    return true;
  }

  if (typeof metadata.status === 'string' && metadata.status.toLowerCase() === 'draft') {
    return true;
  }

  return false;
}

function resolveSlug(filePath, metadata) {
  const fallbackSlug = path.basename(filePath, path.extname(filePath));
  const configuredSlug =
    typeof metadata.slug === 'string' && metadata.slug.length > 0
      ? metadata.slug
      : fallbackSlug;

  return normalizeSlug(configuredSlug);
}

function isValidDate(value) {
  if (typeof value !== 'string' || !DATE_FORMAT.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function main() {
  const files = getBlogMDXFiles();
  const errors = [];
  const slugToFile = new Map();

  for (const filePath of files) {
    const relativePath = path.relative(process.cwd(), filePath);
    const source = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(source);
    const metadata = data;

    const slug = resolveSlug(filePath, metadata);
    if (!slug) {
      errors.push(`${relativePath}: slug is empty`);
    } else if (slug.includes('/')) {
      errors.push(`${relativePath}: slug "${slug}" contains "/" but route only supports /blog/[slug]`);
    }

    if (slug) {
      const existingPath = slugToFile.get(slug);
      if (existingPath) {
        errors.push(`${relativePath}: duplicate slug "${slug}" already used by ${existingPath}`);
      } else {
        slugToFile.set(slug, relativePath);
      }
    }

    if (isDraft(metadata, filePath)) {
      continue;
    }

    for (const field of REQUIRED_FIELDS) {
      const value = metadata[field];
      if (typeof value !== 'string' || value.trim().length === 0) {
        errors.push(`${relativePath}: missing required field "${field}"`);
      }
    }

    if (!isValidDate(metadata.publishedAt)) {
      errors.push(`${relativePath}: publishedAt must be YYYY-MM-DD`);
    }
  }

  if (errors.length > 0) {
    console.error(`\ncontent check failed with ${errors.length} issue(s):`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`content check passed. scanned ${files.length} mdx files.`);
}

main();
