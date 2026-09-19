import path from 'node:path';

export const ROOT = process.cwd();
export const CONTENT_DIR = path.join(ROOT, 'content');
export const BLOG_CONTENT_DIR = path.join(CONTENT_DIR, 'blog');

// Where compiled content artifacts live.
// NOTE: src/data/blog.ts carries the same resolution and must stay in sync.
//  - CONTENT_CACHE_DIR wins when set (escape hatch / tests)
//  - On Vercel, .next/cache is the one directory restored between builds, so
//    putting artifacts there gives the same incremental behaviour that
//    actions/cache gives on GitHub runners. Verified: `next build` preserves it.
//  - Everywhere else: a plain, inspectable .generated/ at the repo root.
export function resolveGeneratedDir(cwd = ROOT, env = process.env) {
  if (env.CONTENT_CACHE_DIR) {
    return path.resolve(cwd, env.CONTENT_CACHE_DIR);
  }

  if (env.VERCEL) {
    return path.join(cwd, env.NEXT_DIST_DIR || '.next', 'cache', 'content');
  }

  return path.join(cwd, '.generated');
}

export const GENERATED_DIR = resolveGeneratedDir();
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
