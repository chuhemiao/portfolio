import fs from 'node:fs/promises';
import path from 'node:path';

import matter from 'gray-matter';

import {
  artifactIdForSlug,
  discoverContentFiles,
  hashSource,
  isDraftPost,
  resolveSlug,
  toIndexMetadata,
  toRelativePath
} from './lib/content/discovery.mjs';
import {
  buildCategoryIndex,
  buildRelations,
  buildTopicIndex,
  loadTopics,
  sortNewestFirst
} from './lib/content/indexes.mjs';
import {
  BLOG_INDEX_FILE,
  CACHE_MANIFEST_FILE,
  CATEGORY_INDEX_FILE,
  POSTS_DIR,
  RELATIONS_FILE,
  TOPIC_INDEX_FILE
} from './lib/content/paths.mjs';
import { runCompileJobs } from './lib/content/pool.mjs';

// Bump when the markdown pipeline or artifact format changes: every cached
// artifact from an older version is then recompiled instead of reused.
export const CONTENT_COMPILER_VERSION = 1;

function parseArgs(argv) {
  const options = { force: false, workers: undefined };

  for (const arg of argv) {
    if (arg === '--force') options.force = true;
    else if (arg.startsWith('--workers=')) options.workers = Number(arg.slice('--workers='.length));
  }

  return options;
}

async function readJsonFile(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath, value) {
  await fs.writeFile(filePath, JSON.stringify(value), 'utf8');
}

async function listArtifactFiles() {
  try {
    return new Set(await fs.readdir(POSTS_DIR));
  } catch {
    return new Set();
  }
}

async function main() {
  const started = Date.now();
  const options = parseArgs(process.argv.slice(2));

  await fs.mkdir(POSTS_DIR, { recursive: true });

  const manifest = options.force
    ? { compilerVersion: CONTENT_COMPILER_VERSION, files: {} }
    : await readJsonFile(CACHE_MANIFEST_FILE, { compilerVersion: CONTENT_COMPILER_VERSION, files: {} });
  const cachedFiles = manifest.compilerVersion === CONTENT_COMPILER_VERSION ? manifest.files ?? {} : {};

  const [files, artifactFiles, topics] = await Promise.all([
    discoverContentFiles(),
    listArtifactFiles(),
    loadTopics()
  ]);

  const entries = [];
  const manifestEntries = [];
  const jobs = [];
  const slugToFile = new Map();
  let cacheHits = 0;
  let drafts = 0;

  for (const filePath of files) {
    const relativePath = toRelativePath(filePath);
    const source = await fs.readFile(filePath, 'utf8');
    const contentHash = hashSource(source);
    const cached = cachedFiles[relativePath];

    const artifactsPresent =
      cached && (cached.draft || (artifactFiles.has(`${cached.artifact}.html`) && artifactFiles.has(`${cached.artifact}.json`)));
    const cacheHit = Boolean(cached) && cached.hash === contentHash && artifactsPresent;

    let entry;

    if (cacheHit) {
      entry = { ...cached, hash: contentHash, sourcePath: relativePath };
    } else {
      const { data } = matter(source);

      if (isDraftPost(data, filePath)) {
        entry = { hash: contentHash, draft: true, sourcePath: relativePath };
      } else {
        const slug = resolveSlug(filePath, data);
        const artifact = artifactIdForSlug(slug);
        entry = {
          hash: contentHash,
          draft: false,
          slug,
          artifact,
          sourcePath: relativePath,
          meta: toIndexMetadata(data)
        };
        jobs.push({ filePath, artifact, slug });
      }
    }

    manifestEntries.push(entry);

    if (entry.draft) {
      drafts += 1;
      continue;
    }

    if (cacheHit) cacheHits += 1;

    const existingFile = slugToFile.get(entry.slug);
    if (existingFile) {
      throw new Error(
        `Duplicate slug "${entry.slug}" found in ${existingFile} and ${relativePath}`
      );
    }

    slugToFile.set(entry.slug, relativePath);
    entries.push(entry);
  }

  await runCompileJobs(jobs, { workerCount: options.workers, onResult: () => {} });

  const posts = entries
    .map((entry) => ({
      slug: entry.slug,
      title: entry.meta.title,
      publishedAt: entry.meta.publishedAt,
      summary: entry.meta.summary,
      ...(entry.meta.category !== undefined ? { category: entry.meta.category } : {}),
      ...(entry.meta.image !== undefined ? { image: entry.meta.image } : {}),
      artifact: entry.artifact,
      contentHash: entry.hash,
      sourcePath: entry.sourcePath
    }))
    .sort(sortNewestFirst);

  const expectedArtifacts = new Set();
  for (const entry of entries) {
    expectedArtifacts.add(`${entry.artifact}.html`);
    expectedArtifacts.add(`${entry.artifact}.json`);
  }

  let removedArtifacts = 0;
  for (const fileName of artifactFiles) {
    if (expectedArtifacts.has(fileName)) continue;
    await fs.rm(path.join(POSTS_DIR, fileName), { force: true });
    removedArtifacts += 1;
  }

  const nextManifestFiles = {};
  for (const entry of manifestEntries) {
    nextManifestFiles[entry.sourcePath] = entry.draft
      ? { hash: entry.hash, draft: true, compilerVersion: CONTENT_COMPILER_VERSION }
      : {
          hash: entry.hash,
          slug: entry.slug,
          artifact: entry.artifact,
          draft: false,
          compilerVersion: CONTENT_COMPILER_VERSION,
          meta: entry.meta
        };
  }

  await Promise.all([
    writeJsonFile(BLOG_INDEX_FILE, {
      compilerVersion: CONTENT_COMPILER_VERSION,
      generatedAt: new Date().toISOString(),
      count: posts.length,
      posts
    }),
    writeJsonFile(CATEGORY_INDEX_FILE, buildCategoryIndex(posts)),
    writeJsonFile(TOPIC_INDEX_FILE, buildTopicIndex(posts, topics)),
    writeJsonFile(RELATIONS_FILE, buildRelations(posts, topics)),
    writeJsonFile(CACHE_MANIFEST_FILE, {
      compilerVersion: CONTENT_COMPILER_VERSION,
      files: nextManifestFiles
    })
  ]);

  const elapsed = ((Date.now() - started) / 1000).toFixed(2);
  console.log(
    [
      `Content files discovered: ${files.length}`,
      `Published posts: ${posts.length}`,
      `Drafts skipped: ${drafts}`,
      `Cache hits: ${cacheHits}`,
      `Compiled: ${jobs.length}`,
      `Artifacts removed: ${removedArtifacts}`,
      `Content compile: ${elapsed}s`
    ].join('\n')
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
