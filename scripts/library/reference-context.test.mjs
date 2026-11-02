import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { loadReferenceContext } from './validate.mjs';
import { CATALOG_FILES, canonicalJson, entityKey, hashJson, readCatalog, validateCatalog, validateRecord } from './contract.mjs';
import { resolveGeneratedDir } from '../lib/content/paths.mjs';
import { publishedFixture, FIXTURE_AS_OF } from './fixtures/catalog.mjs';
import { applyReview, inspectReview } from './review.mjs';
import { readSnapshot } from './snapshot.mjs';

test('article reference context stays bounded to real relation targets in a large content index', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'library-reference-context-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const posts = Array.from({ length: 7428 }, (_, index) => ({ slug: `existing-research-long-article-${index}`, translationKey: `existing-research-long-article-${index}` }));
  const generated = resolveGeneratedDir(root);
  await fs.mkdir(generated, { recursive: true });
  await fs.writeFile(path.join(generated, 'blog-index.json'), JSON.stringify({ posts }));
  const wanted = posts.slice(0, 10);
  const context = await loadReferenceContext(root, { item_topics: [], item_relations: [...wanted.map(post => ({ existing_entity_type: 'article', existing_entity_slug: post.slug })), { existing_entity_type: 'article', existing_entity_slug: 'missing-target' }] });
  assert.equal(validateRecord('reference_context', context).valid, true, '7428 unrelated posts must not overflow the reference-context byte limit');
  assert.deepEqual(context.articles, wanted.map(post => ({ slug: post.slug, translation_key: post.translationKey })));
  assert.equal(context.articles.some(post => post.slug === 'missing-target'), false, 'a missing target must remain missing for catalog validation');
});

for (const type of ['article', 'project']) test(`default review context covers existing and newly requested ${type} targets`, async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'library-reference-review-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const directory = path.join(root, 'catalog'); await fs.mkdir(directory);
  const output = path.join(root, 'output'); const fixture = publishedFixture();
  for (const [key, file] of Object.entries(CATALOG_FILES)) await fs.writeFile(path.join(directory, file), file.endsWith('.jsonl') ? fixture.catalog[key].map(canonicalJson).join('\n') + (fixture.catalog[key].length ? '\n' : '') : canonicalJson(fixture.catalog[key]) + '\n');
  let targets;
  if (type === 'article') {
    const data = JSON.parse(await fs.readFile(path.join(resolveGeneratedDir(process.cwd()), 'blog-index.json'), 'utf8'));
    targets = data.posts.filter(post => post.translationKey).slice(0, 2).map(post => ({ slug: post.slug, key: post.translationKey }));
  } else {
    const { PROJECTS } = await import('../../src/data/research-projects.ts');
    targets = PROJECTS.slice(0, 2).map(project => ({ slug: project.slug, key: null }));
  }
  const relation = target => ({ schema_version: '1.1.0', revision: 1, item_id: fixture.catalog.items[0].id, existing_entity_type: type, existing_entity_slug: target.slug, article_translation_key: target.key, relation_type: 'further_reading', review_status: 'pending_review', reviewed_by: null, reviewed_at: null, review_event_id: null });
  const request = async (action, record, replacement = undefined) => {
    const catalog = await readCatalog(directory); const id = entityKey('item_relation', record);
    const found = catalog.item_relations.some(row => entityKey('item_relation', row) === id);
    const observed = found ? inspectReview(catalog, 'item_relation', id) : { revision: 0, content_hash: null, catalog_hash: hashJson(catalog) };
    return applyReview({ directory, output, write: true, asOf: FIXTURE_AS_OF, command: { schema_version: 'library-review-command/v1', id: `fixture-${type}-${action}-${catalog.review_log.length}`, actor: 'fixture-reference-operator', role: 'editor', action, entity_type: 'item_relation', entity_id: id, expected_revision: observed.revision, expected_content_hash: observed.content_hash, expected_catalog_hash: observed.catalog_hash, reason: 'Synthetic reference-context workflow only; no editorial relationship is asserted.', as_of: FIXTURE_AS_OF, ...(replacement ? { replacement } : {}) } });
  };
  const records = targets.map(relation);
  await request('revise', records[0], records[0]);
  await request('approve', records[0]);
  await request('revise', records[1], records[1]);
  await request('approve', records[1]);
  const revised = { ...records[0], revision: 2 };
  await request('revise', records[0], revised);
  await request('approve', revised);
  await request('reject', revised);
  const current = await readCatalog(directory); const context = await loadReferenceContext(process.cwd(), current);
  assert.equal(validateCatalog(current, { context, asOf: FIXTURE_AS_OF }).valid, true);
  assert.equal(current.item_relations.length, 2);
  assert.equal(current.item_relations[0].review_status, 'rejected');
  const snapshot = await readSnapshot(output, { currentCatalog: current, context, asOf: FIXTURE_AS_OF });
  assert.equal(snapshot.relations.length, 1);
  assert.equal(snapshot.relations[0].entity_slug, targets[1].slug);
  const unknown = relation({ slug: 'missing-reference-target-987654321', key: type === 'article' ? 'missing-reference-group' : null });
  await assert.rejects(request('revise', unknown, unknown), error => error.code === 'REVIEW_VALIDATION_FAILED' && error.issues.some(issue => issue.code === 'ENTITY_REFERENCE_INVALID'));
  if (type === 'article') {
    const mismatch = relation({ ...targets[0], key: 'wrong-translation-group' }); mismatch.revision = 3;
    await assert.rejects(request('revise', mismatch, mismatch), error => error.code === 'REVIEW_VALIDATION_FAILED' && error.issues.some(issue => issue.code === 'ENTITY_REFERENCE_INVALID'));
  }
  const retargeted = { ...records[1], revision: 3 };
  await assert.rejects(request('revise', revised, retargeted), { code: 'REVIEW_CONFLICT' });
  assert.equal(hashJson(await readCatalog(directory)), hashJson(current));
});

test('default review context also resolves a first Topic mapping without trusting an unknown slug', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'library-topic-reference-review-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const fixture = publishedFixture(); const directory = path.join(root, 'catalog'); await fs.mkdir(directory);
  for (const [key, file] of Object.entries(CATALOG_FILES)) await fs.writeFile(path.join(directory, file), file.endsWith('.jsonl') ? fixture.catalog[key].map(canonicalJson).join('\n') + (fixture.catalog[key].length ? '\n' : '') : canonicalJson(fixture.catalog[key]) + '\n');
  const replacement = { schema_version: '1.1.0', revision: 1, item_id: fixture.catalog.items[0].id, existing_topic_slug: 'l1-l2', mapping_method: 'manual', review_status: 'pending_review', reviewed_at: null, review_event_id: null };
  const command = { schema_version: 'library-review-command/v1', id: 'fixture-first-topic', actor: 'fixture-reference-operator', role: 'editor', action: 'revise', entity_type: 'item_topic', entity_id: entityKey('item_topic', replacement), expected_revision: 0, expected_content_hash: null, expected_catalog_hash: hashJson(fixture.catalog), reason: 'Synthetic mapping only, not a real editorial classification.', as_of: FIXTURE_AS_OF, replacement };
  const options = { directory, output: path.join(root, 'output'), asOf: FIXTURE_AS_OF };
  assert.equal((await applyReview({ ...options, command })).dry_run, true);
  const missing = { ...replacement, existing_topic_slug: 'missing-topic-987654321' };
  await assert.rejects(applyReview({ ...options, command: { ...command, id: 'fixture-missing-topic', entity_id: entityKey('item_topic', missing), replacement: missing } }), error => error.code === 'REVIEW_VALIDATION_FAILED' && error.issues.some(issue => issue.code === 'TOPIC_REFERENCE_INVALID'));
});

test('current actual relations validate against only their real site references', async () => {
  const catalog = await readCatalog('data/library'); const context = await loadReferenceContext(process.cwd(), catalog);
  const result = validateCatalog(catalog, { context, asOf: new Date().toISOString() });
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  const targets = new Set(catalog.item_relations.filter(row => row.existing_entity_type === 'article').map(row => row.existing_entity_slug));
  assert.equal(context.articles.length, targets.size);
  assert.ok(context.articles.every(row => targets.has(row.slug)));
});

test('statically supplied real site models produce the same context as current Node CLI discovery', async () => {
  const { TOPICS } = await import('../../src/data/topics.ts');
  const { PROJECTS } = await import('../../src/data/research-projects.ts');
  const catalog = await readCatalog('data/library');
  assert.deepEqual(await loadReferenceContext(process.cwd(), catalog, { TOPICS, PROJECTS }), await loadReferenceContext(process.cwd(), catalog));
});

test('default CLI discovery still reads the provided source root rather than the bundled site models', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'library-root-models-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.mkdir(path.join(root, 'src/data'), { recursive: true });
  await fs.writeFile(path.join(root, 'src/data/topics.ts'), 'export const TOPICS = [{slug:"fixture-root-topic"}];');
  await fs.writeFile(path.join(root, 'src/data/research-projects.ts'), 'export const PROJECTS = [{slug:"fixture-root-project"}];');
  const catalog = { item_topics: [{ existing_topic_slug: 'fixture-root-topic' }], item_relations: [{ existing_entity_type: 'project', existing_entity_slug: 'fixture-root-project' }] };
  assert.deepEqual(await loadReferenceContext(root, catalog), { topic_slugs: ['fixture-root-topic'], project_slugs: ['fixture-root-project'], articles: [] });
});
