import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const BLOG_DIR = path.join(CONTENT_DIR, 'blog');

function getRootMDXFiles() {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  return fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && path.extname(entry.name) === '.mdx')
    .map((entry) => path.join(CONTENT_DIR, entry.name));
}

function getYear(publishedAt) {
  if (typeof publishedAt !== 'string') {
    return 'unknown';
  }

  const match = publishedAt.match(/^(\d{4})-/);
  return match ? match[1] : 'unknown';
}

function slugifySegment(value, fallback) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return fallback;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || fallback;
}

function resolveTargetPath(filePath, metadata) {
  const year = getYear(metadata.publishedAt);
  const category = slugifySegment(metadata.category, 'uncategorized');
  const fileName = path.basename(filePath);
  const targetDir = path.join(BLOG_DIR, year, category);
  const initialPath = path.join(targetDir, fileName);

  if (!fs.existsSync(initialPath)) {
    return initialPath;
  }

  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);
  let index = 1;

  while (true) {
    const candidate = path.join(targetDir, `${base}-${index}${ext}`);
    if (!fs.existsSync(candidate)) {
      return candidate;
    }
    index += 1;
  }
}

function main() {
  const files = getRootMDXFiles();

  if (files.length === 0) {
    console.log('no root content files to organize');
    return;
  }

  let moved = 0;

  for (const filePath of files) {
    const source = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(source);
    const targetPath = resolveTargetPath(filePath, data);

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.renameSync(filePath, targetPath);

    moved += 1;
    console.log(`${path.relative(process.cwd(), filePath)} -> ${path.relative(process.cwd(), targetPath)}`);
  }

  console.log(`organized ${moved} files`);
}

main();
