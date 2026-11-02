import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { CATALOG_FILES, CATALOG_TRANSACTION_FILE, canonicalJson, hashJson, readCatalog, validateCatalog } from './contract.mjs';
import { publishedFixture, FIXTURE_AS_OF } from './fixtures/catalog.mjs';
import { inspectReview, planReview, applyReview, recoverReview } from './review.mjs';
import { buildSnapshot, readSnapshot } from './snapshot.mjs';
import { withDirectoryLock, writeAtomic } from './files.mjs';
import { importCandidates } from './import.mjs';
import { loadReferenceContext } from './validate.mjs';

async function setup(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'library-review-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const requested = path.join(root, 'catalog'); await fs.mkdir(requested); const directory = await fs.realpath(requested);
  const fixture = publishedFixture(); const output = path.join(root, 'output');
  for (const [key, file] of Object.entries(CATALOG_FILES)) await fs.writeFile(path.join(directory, file), file.endsWith('.jsonl') ? fixture.catalog[key].map(canonicalJson).join('\n') + (fixture.catalog[key].length ? '\n' : '') : canonicalJson(fixture.catalog[key]) + '\n');
  await buildSnapshot({ catalog: fixture.catalog, context: fixture.options.context, asOf: FIXTURE_AS_OF, directory: output });
  return { root, directory, output, fixture, options: { directory, output, context: fixture.options.context, asOf: FIXTURE_AS_OF } };
}
function command(catalog, changes = {}) {
  const type = changes.entity_type ?? 'item'; const id = changes.entity_id ?? catalog.items[0].id;
  const inspected = inspectReview(catalog, type, id);
  return { schema_version: 'library-review-command/v1', id: 'synthetic_operation', actor: 'fixture_operator', role: 'publisher', action: 'takedown', entity_type: type, entity_id: id, expected_revision: inspected.revision, expected_content_hash: inspected.content_hash, expected_catalog_hash: inspected.catalog_hash, reason: 'Synthetic operator test, not a human review.', as_of: FIXTURE_AS_OF, ...changes };
}

test('operator dry-run uses real validation but writes no files, locks or projections', async t => {
  const { directory, output, fixture, options } = await setup(t);
  const before = await fs.readFile(path.join(output, 'manifest.json'));
  const request = command(fixture.catalog);
  const preview = await applyReview({ ...options, command: request });
  assert.equal(preview.dry_run, true); assert.equal(preview.eligible_after, 0);
  assert.equal((await readCatalog(directory)).items[0].status, 'published');
  assert.deepEqual(await fs.readFile(path.join(output, 'manifest.json')), before);
  assert.equal((await fs.readdir(directory)).includes('.library.lock'), false);
  assert.equal((await fs.readdir(directory)).includes(CATALOG_TRANSACTION_FILE), false);
});

test('takedown commits its actual role/event and current projection; exact replay is idempotent', async t => {
  const { directory, output, fixture, options } = await setup(t);
  const request = command(fixture.catalog);
  const written = await applyReview({ ...options, command: request, write: true });
  assert.equal(written.eligible_after, 0);
  let current = await readCatalog(directory); const count = current.review_log.length;
  assert.equal(current.review_log.at(-1).reviewer_role, 'publisher');
  assert.equal((await readSnapshot(output, { currentCatalog: current, context: options.context, asOf: FIXTURE_AS_OF })).items.length, 0);
  assert.equal((await applyReview({ ...options, command: request, write: true })).replayed, true);
  current = await readCatalog(directory); assert.equal(current.review_log.length, count);
  await assert.rejects(applyReview({ ...options, command: { ...request, reason: 'Changed command' } }), { code: 'REVIEW_CONFLICT' });
});

test('role, revision, graph and content conflicts reject without mutation', async t => {
  const { directory, fixture, options } = await setup(t);
  const request = command(fixture.catalog);
  for (const change of [{ role: 'editor' }, { expected_revision: 99 }, { expected_content_hash: 'a'.repeat(64) }, { expected_catalog_hash: 'b'.repeat(64) }, { unexpected: true }]) {
    await assert.rejects(applyReview({ ...options, command: { ...request, ...change }, write: true }));
  }
  assert.equal((await readCatalog(directory)).items[0].status, 'published');
});

test('revision invalidates trilingual/check approvals; explicit rechecks are required before republish', async t => {
  const { directory, fixture, options } = await setup(t); const item = fixture.catalog.items[0];
  const replacement = structuredClone(item); replacement.revision++; replacement.original_title = 'Revised synthetic title';
  await applyReview({ ...options, command: command(fixture.catalog, { role: 'editor', action: 'revise', replacement }), write: true });
  let current = await readCatalog(directory);
  assert.equal(current.items[0].status, 'pending_review');
  assert.ok(current.item_locales.every(local => local.abstract_status === 'draft' && local.source_revision === current.items[0].revision));
  await assert.rejects(applyReview({ ...options, command: command(current, { id: 'early_publish', action: 'publish' }), write: true }), { code: 'REVIEW_VALIDATION_FAILED' });
  for (const locale of ['zh-CN', 'en', 'ja']) {
    current = await readCatalog(directory); const local = current.item_locales.find(row => row.locale === locale);
    for (const reason of local.recommendation_reasons) {
      const id = `${local.item_id}:${locale}:${reason.id}`;
      await applyReview({ ...options, command: command(current, { id: `reason_${locale}`, role: 'editor', action: 'approve', entity_type: 'reason', entity_id: id }), write: true });
      current = await readCatalog(directory);
    }
    await applyReview({ ...options, command: command(current, { id: `locale_${locale}`, role: 'editor', action: 'approve', entity_type: 'item_locale', entity_id: `${local.item_id}:${locale}` }), write: true });
  }
  for (const check of ['metadata_valid', 'evidence_checked', 'content_status']) {
    current = await readCatalog(directory);
    await applyReview({ ...options, command: command(current, { id: check, role: 'editor', action: 'approve', check }), write: true });
  }
  current = await readCatalog(directory);
  await applyReview({ ...options, command: command(current, { id: 'rights', role: 'rights_reviewer', action: 'approve_rights' }), write: true });
  current = await readCatalog(directory);
  await applyReview({ ...options, command: command(current, { id: 'publish_revision', action: 'publish' }), write: true });
  assert.equal(validateCatalog(await readCatalog(directory), fixture.options).eligibleItemIds.length, 1);
});

test('withdrawn state must be explicitly restored and cannot silently inherit checks', async t => {
  const { directory, fixture, options } = await setup(t);
  await applyReview({ ...options, command: command(fixture.catalog), write: true });
  let current = await readCatalog(directory);
  await assert.rejects(applyReview({ ...options, command: command(current, { id: 'publish_withdrawn', action: 'publish' }) }), { code: 'INVALID_TRANSITION' });
  await applyReview({ ...options, command: command(current, { id: 'restore', action: 'restore' }), write: true });
  current = await readCatalog(directory);
  assert.equal(current.items[0].status, 'pending_review'); assert.equal(current.items[0].checks.rights_checked.passed, false);
});

test('a quick completed transaction during a read is detected after its marker disappears', async t => {
  const { directory, fixture } = await setup(t); const proposed = planReview(fixture.catalog, command(fixture.catalog), fixture.options.context).catalog;
  const original = fs.readFile; let fired = false;
  fs.readFile = async function (filename, ...args) {
    const bytes = await original.call(this, filename, ...args);
    if (!fired && String(filename) === path.join(directory, 'items.jsonl')) {
      fired = true; await fs.writeFile(path.join(directory, CATALOG_TRANSACTION_FILE), '{}');
      for (const key of ['items', 'review_log']) await writeAtomic(path.join(directory, CATALOG_FILES[key]), proposed[key].map(canonicalJson).join('\n') + '\n');
      await fs.unlink(path.join(directory, CATALOG_TRANSACTION_FILE));
    }
    return bytes;
  };
  try { await assert.rejects(readCatalog(directory), { code: 'CATALOG_CHANGED_DURING_READ' }); } finally { fs.readFile = original; }
  assert.equal(fired, true);
});

test('build input lock prevents a successful interleaved withdrawal and later builds use withdrawn state', async t => {
  const { directory, output, fixture, options } = await setup(t); const request = command(fixture.catalog);
  await withDirectoryLock(directory, async () => {
    const old = await readCatalog(directory);
    await assert.rejects(applyReview({ ...options, command: request, write: true }), { code: 'WRITE_LOCKED' });
    await buildSnapshot({ catalog: old, context: options.context, directory: output, asOf: FIXTURE_AS_OF });
  });
  await applyReview({ ...options, command: request, write: true });
  const built = spawnSync(process.execPath, ['scripts/library/build-index.mjs', '--dir', directory, '--out', output, '--as-of', FIXTURE_AS_OF], { encoding: 'utf8' });
  assert.equal(built.status, 0, built.stderr); assert.equal(JSON.parse(built.stdout).item_count, 0);
  const current = await readCatalog(directory);
  const actualContext = await loadReferenceContext(process.cwd(), current);
  assert.equal((await readSnapshot(output, { currentCatalog: current, context: actualContext, asOf: FIXTURE_AS_OF })).items.length, 0);
});

test('ordinary commit failure rolls back bytes and leaves public output suspended', async t => {
  const { directory, output, fixture, options } = await setup(t); const original = fs.rename; let failed = false;
  fs.rename = async function (from, to) { if (!failed && to === path.join(directory, 'review-log.jsonl')) { failed = true; throw Object.assign(Error('Injected filesystem write failure'), { code: 'EIO' }); } return original.call(this, from, to); };
  try { await assert.rejects(applyReview({ ...options, command: command(fixture.catalog), write: true }), { code: 'EIO' }); } finally { fs.rename = original; }
  assert.equal((await readCatalog(directory)).items[0].status, 'published');
  await assert.rejects(fs.access(path.join(output, 'manifest.json')), { code: 'ENOENT' });
  assert.equal((await fs.readdir(directory)).includes(CATALOG_TRANSACTION_FILE), false);
});

test('interrupted rollback stays blocked, importer refuses it, and hash-bound recovery completes once', async t => {
  const { directory, output, fixture, options, root } = await setup(t); const original = fs.rename; let itemWrites = 0; let failed;
  const manifest = JSON.parse(await fs.readFile(path.join(output, 'manifest.json'), 'utf8'));
  const itemBytes = await fs.readFile(path.join(output, 'snapshots', manifest.snapshot_id, 'items.json'));
  fs.rename = async function (from, to) {
    if (to === path.join(directory, 'items.jsonl')) { itemWrites++; if (itemWrites > 1) throw Object.assign(Error('Interrupted rollback'), { code: 'EIO' }); }
    if (to === path.join(directory, 'review-log.jsonl')) throw Object.assign(Error('Interrupted commit'), { code: 'EIO' });
    return original.call(this, from, to);
  };
  try { await applyReview({ ...options, command: command(fixture.catalog), write: true }); } catch (error) { failed = error; } finally { fs.rename = original; }
  assert.equal(failed.recovery_required, true);
  await assert.rejects(readCatalog(directory), { code: 'CATALOG_TRANSACTION_PENDING' });
  await assert.rejects(fs.access(path.join(output, 'manifest.json')), { code: 'ENOENT' });
  const input = path.join(root, 'empty.jsonl'); await fs.writeFile(input, '');
  await assert.rejects(importCandidates({ directory, input, sourceId: 'fixture_owned', batchKey: 'pending', jobDirectory: path.join(root, 'jobs'), asOf: FIXTURE_AS_OF }), { code: 'CATALOG_TRANSACTION_PENDING' });
  assert.equal((await recoverReview({ ...options, transactionHash: failed.transaction_hash })).dry_run, true);
  const staging = await fs.mkdtemp(path.join(output, 'snapshots', '.staging-'));
  await fs.writeFile(path.join(staging, 'items.json'), itemBytes);
  const stagingName = path.basename(staging);
  const status = spawnSync(process.execPath, ['scripts/library/review.mjs', 'status', '--dir', directory], { encoding: 'utf8' });
  assert.equal(status.status, 0, status.stderr);
  const stagingHash = JSON.parse(status.stdout).staging.find(row => row.name === stagingName).hash;
  await assert.rejects(recoverReview({ ...options, transactionHash: failed.transaction_hash, write: true }), { code: 'STAGING_RECONCILIATION_REQUIRED' });
  await assert.rejects(recoverReview({ ...options, transactionHash: failed.transaction_hash, stagingName, stagingHash: 'a'.repeat(64), write: true }), { code: 'REVIEW_CONFLICT' });
  await fs.writeFile(path.join(staging, 'foreign.txt'), 'Unknown objects are not disposable staging.');
  await assert.rejects(recoverReview({ ...options, transactionHash: failed.transaction_hash, stagingName, stagingHash, write: true }), { code: 'INVALID_SNAPSHOT_FILE' });
  await fs.unlink(path.join(staging, 'foreign.txt'));
  await fs.unlink(path.join(staging, 'items.json'));
  const outside = path.join(root, 'outside.json'); await fs.writeFile(outside, 'Untouched external fixture');
  await fs.symlink(outside, path.join(staging, 'items.json'));
  await assert.rejects(recoverReview({ ...options, transactionHash: failed.transaction_hash, stagingName, stagingHash, write: true }), { code: 'INVALID_FILE' });
  assert.equal(await fs.readFile(outside, 'utf8'), 'Untouched external fixture');
  await fs.unlink(path.join(staging, 'items.json')); await fs.writeFile(path.join(staging, 'items.json'), itemBytes);
  const scorePath = path.join(directory, 'scores.jsonl'); const scoreBefore = await fs.readFile(scorePath);
  await fs.writeFile(scorePath, '\n');
  await assert.rejects(recoverReview({ ...options, transactionHash: failed.transaction_hash, stagingName, stagingHash, write: true }), { code: 'REVIEW_CONFLICT' });
  await fs.writeFile(scorePath, scoreBefore);
  await assert.rejects(recoverReview({ ...options, transactionHash: failed.transaction_hash, stagingName, stagingHash, write: true, asOf: '2028-01-01T00:00:00Z' }), { code: 'INVALID_TRANSACTION' });
  await assert.doesNotReject(recoverReview({ ...options, transactionHash: failed.transaction_hash, stagingName, stagingHash, write: true }));
  const current = await readCatalog(directory); assert.equal(current.items[0].status, 'takedown');
  assert.equal((await readSnapshot(output, { currentCatalog: current, context: options.context, asOf: FIXTURE_AS_OF })).items.length, 0);
  await assert.rejects(recoverReview({ ...options, transactionHash: failed.transaction_hash, write: true }), { code: 'ENOENT' });
});

test('cancellation before mutation does not write a transaction or change current data', async t => {
  const { directory, fixture, options } = await setup(t); const signal = AbortSignal.abort();
  await assert.rejects(applyReview({ ...options, command: command(fixture.catalog), write: true, signal }), { code: 'CANCELLED' });
  assert.equal(hashJson(await readCatalog(directory)), hashJson(fixture.catalog));
});

test('a cancellation after an actual first file rename rolls back the catalog', async t => {
  const { directory, output, fixture, options } = await setup(t); const controller = new AbortController(); const original = fs.rename;
  fs.rename = async function (from, to) { const result = await original.call(this, from, to); if (to === path.join(directory, 'items.jsonl')) controller.abort(); return result; };
  try { await assert.rejects(applyReview({ ...options, command: command(fixture.catalog), write: true, signal: controller.signal }), { code: 'CANCELLED' }); } finally { fs.rename = original; }
  assert.equal(hashJson(await readCatalog(directory)), hashJson(fixture.catalog));
  await assert.rejects(fs.access(path.join(output, 'manifest.json')), { code: 'ENOENT' });
});

test('editorial revision cannot retarget a published slug or canonical identity', () => {
  const fixture = publishedFixture();
  for (const field of ['slug', 'canonical_key']) {
    const replacement = structuredClone(fixture.catalog.items[0]); replacement.revision++;
    if (field === 'slug') replacement.slug = 'revised-' + replacement.slug;
    else replacement[field] += '-different';
    assert.throws(() => planReview(fixture.catalog, command(fixture.catalog, { role: 'editor', action: 'revise', replacement }), fixture.options.context), { code: 'IMMUTABLE_IDENTITY' });
  }
});

test('rejecting a reviewed locale returns the item and all translations to review', () => {
  const fixture = publishedFixture(); const local = fixture.catalog.item_locales[0];
  const result = planReview(fixture.catalog, command(fixture.catalog, { role: 'editor', action: 'reject', entity_type: 'item_locale', entity_id: `${local.item_id}:${local.locale}` }), fixture.options.context);
  assert.equal(result.catalog.items[0].status, 'pending_review');
  assert.ok(result.catalog.item_locales.every(row => row.abstract_status === 'draft'));
});
