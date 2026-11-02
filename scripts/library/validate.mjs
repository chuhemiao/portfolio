import path from 'node:path';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { readCatalog, validateCatalog, parseJsonStrict, LibraryValidationError } from './contract.mjs';
import { resolveGeneratedDir } from '../lib/content/paths.mjs';

export async function loadReferenceContext(root, catalog) {
  const context = { topic_slugs: [], articles: [], project_slugs: [] };
  if (catalog.item_topics.length) {
    const { TOPICS } = await import(pathToFileURL(path.join(root, 'src/data/topics.ts')).href);
    context.topic_slugs = TOPICS.map(topic => topic.slug);
  }
  if (catalog.item_relations.some(relation => relation.existing_entity_type === 'project')) {
    const { PROJECTS } = await import(pathToFileURL(path.join(root, 'src/data/research-projects.ts')).href);
    context.project_slugs = PROJECTS.map(project => project.slug);
  }
  if (catalog.item_relations.some(relation => relation.existing_entity_type === 'article')) {
    const data = parseJsonStrict(await fs.readFile(path.join(resolveGeneratedDir(root), 'blog-index.json')));
    context.articles = data.posts.map(post => ({ slug: post.slug, translation_key: post.translationKey }));
  }
  return context;
}

export async function main(args = process.argv.slice(2)) {
  const options = { directory: path.resolve('data/library'), asOf: new Date().toISOString(), publicGit: true };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir' && args[i + 1]) options.directory = path.resolve(args[++i]);
    else if (args[i] === '--as-of' && args[i + 1]) options.asOf = args[++i];
    else throw new LibraryValidationError('INVALID_ARGUMENT', 'Usage: library:validate [--dir <catalog-directory>] [--as-of <UTC timestamp>]');
  }
  const catalog = await readCatalog(options.directory);
  const context = await loadReferenceContext(process.cwd(), catalog);
  const result = validateCatalog(catalog, { ...options, context });
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  return result.valid ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().then(code => { process.exitCode = code; }).catch(error => {
    process.stderr.write(`${error.code ?? 'LIBRARY_VALIDATION_FAILED'}: ${error.message}\n`);
    process.exitCode = 1;
  });
}
