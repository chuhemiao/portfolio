import path from 'node:path';

export const ROOT = process.cwd();
export const CONTENT_DIR = path.join(ROOT, 'content');
export const BLOG_CONTENT_DIR = path.join(CONTENT_DIR, 'blog');
export const GENERATED_DIR = path.join(ROOT, '.generated');
export const POSTS_DIR = path.join(GENERATED_DIR, 'posts');

export const BLOG_INDEX_FILE = path.join(GENERATED_DIR, 'blog-index.json');
export const CATEGORY_INDEX_FILE = path.join(GENERATED_DIR, 'category-index.json');
export const TOPIC_INDEX_FILE = path.join(GENERATED_DIR, 'topic-index.json');
export const RELATIONS_FILE = path.join(GENERATED_DIR, 'relations.json');
export const CACHE_MANIFEST_FILE = path.join(GENERATED_DIR, 'cache-manifest.json');

export function artifactHtmlPath(artifact) {
  return path.join(POSTS_DIR, `${artifact}.html`);
}

export function artifactJsonPath(artifact) {
  return path.join(POSTS_DIR, `${artifact}.json`);
}
