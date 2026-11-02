import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { CATALOG_FILES, canonicalJson, readCatalog, SCHEMA_VERSION, reviewContentHash, reviewEventHash } from './contract.mjs';
import { publishedFixture, FIXTURE_AS_OF } from './fixtures/catalog.mjs';
import { importCandidates, parseCandidateCsv } from './import.mjs';
import { withDirectoryLock } from './files.mjs';

async function setup(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'library-import-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const directory = path.join(root, 'catalog'); await fs.mkdir(directory);
  const fixture = publishedFixture();
  for (const [key, file] of Object.entries(CATALOG_FILES)) await fs.writeFile(path.join(directory, file), file.endsWith('.jsonl') ? fixture.catalog[key].map(canonicalJson).join('\n') + (fixture.catalog[key].length ? '\n' : '') : canonicalJson(fixture.catalog[key]));
  const input = path.join(root, 'input.csv');
  const header = 'source_record_id,source_url,observed_at,kind,identifier,url,title_hint\n';
  await fs.writeFile(input, header + 'record_2,https://example.org/discussion,2026-11-02T10:00:00Z,article,,https://example.org/article,Example\n');
  return { root, header, fixture, options: { directory, input, sourceId: 'fixture_owned', batchKey: 'batch_1', format: 'csv', jobDirectory: path.join(root, 'jobs'), asOf: FIXTURE_AS_OF, context: fixture.options.context } };
}

test('dry-run parses and previews without writing a catalog, checkpoint, lock or network request', async t => {
  const { root, options } = await setup(t);
  const before = await fs.readFile(path.join(options.directory, 'candidates.jsonl'));
  const request = globalThis.fetch; globalThis.fetch = () => { throw Error('Network forbidden'); };
  try {
    const result = await importCandidates(options);
    assert.equal(result.dry_run, true); assert.equal(result.accepted, 1);
    assert.deepEqual(await fs.readFile(path.join(options.directory, 'candidates.jsonl')), before);
    assert.deepEqual((await fs.readdir(root)).sort(), ['catalog', 'input.csv']);
    assert.equal((await fs.readdir(options.directory)).includes('.library.lock'), false);
  } finally { globalThis.fetch = request; }
});

test('actual CLI accepts the same dry-run contract and leaves candidate files unchanged', async t => {
  const { options } = await setup(t);
  const result = spawnSync(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', 'scripts/library/import.mjs', '--dir', options.directory, '--input', options.input, '--source', options.sourceId, '--batch', options.batchKey, '--format', 'csv', '--as-of', FIXTURE_AS_OF, '--dry-run'], { cwd: process.cwd(), encoding: 'utf8', timeout: 10000 });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).accepted, 1);
  assert.equal((await readCatalog(options.directory)).candidates.length, 0);
});

test('write and rerun are idempotent, batch input changes conflict, and a new source record can match an existing identity', async t => {
  const { header, options } = await setup(t);
  assert.equal((await importCandidates({ ...options, write: true })).accepted, 1);
  assert.equal((await importCandidates({ ...options, write: true })).accepted, 0);
  assert.equal((await readCatalog(options.directory)).candidates.length, 1);
  await fs.appendFile(options.input, 'record_3,https://example.org/discussion,2026-11-02T10:00:00Z,article,,https://example.org/article,Example\n');
  await assert.rejects(importCandidates({ ...options, write: true }), { code: 'INGEST_CONFLICT' });
  await fs.writeFile(options.input, header + 'record_3,https://example.org/discussion,2026-11-02T10:00:00Z,article,,https://example.org/article,Example\n');
  const matched = await importCandidates({ ...options, batchKey: 'batch_2', write: true });
  assert.equal(matched.matched, 1); assert.equal((await readCatalog(options.directory)).candidates[1].state === 'matched' || (await readCatalog(options.directory)).candidates[0].state === 'matched', true);
});

test('malformed JSONL record goes to a redacted failure list and does not discard valid neighbours', async t => {
  const { fixture, options } = await setup(t);
  const row = (id, url) => ({ schema_version: SCHEMA_VERSION, revision: 1, candidate_id: id, ingestion_id: 'input_batch', source_id: 'fixture_owned', source_record_id: id, source_url: 'https://example.org/source', observed_at: '2026-11-02T10:00:00Z', resource: { kind: 'article', identifier: null, url, title_hint: null }, policy_version: 'fixture-policy-v1', field_provenance: Object.fromEntries(['source_record_id', 'source_url', 'observed_at', 'kind', 'url'].map(field => [field, structuredClone(fixture.catalog.items[0].field_provenance.original_title)])), state: 'needs_review' });
  await fs.writeFile(options.input, canonicalJson(row('record_a', 'https://example.org/a')) + '\n{"invalid": secret raw text}\n' + canonicalJson(row('record_b', 'https://example.org/b')) + '\n');
  const result = await importCandidates({ ...options, format: 'jsonl', write: true, checkpointEvery: 1 });
  assert.equal(result.accepted, 2); assert.equal(result.failures.length, 1);
  const job = JSON.parse(await fs.readFile(result.checkpoint, 'utf8'));
  assert.equal(job.cursor, '1'); assert.equal(job.state, 'failed');
  const dlq = await fs.readFile(result.checkpoint.replace(/\.json$/, '.dlq.jsonl'), 'utf8');
  assert.equal(dlq.includes('secret'), false); assert.equal(dlq.includes('INVALID_JSON'), true);
  assert.equal((await readCatalog(options.directory)).candidates.length, 2);
});

test('unversioned real EIP candidates stay unreviewed without invented item identity', async t => {
  const { header, options } = await setup(t);
  await fs.writeFile(options.input, header + 'eip_7702,https://eips.ethereum.org/EIPS/eip-7702,2026-11-02T10:00:00Z,spec,,https://eips.ethereum.org/EIPS/eip-7702,Set EOA code\n');
  const report = await importCandidates({ ...options, write: true });
  assert.equal(report.accepted, 1); assert.equal(report.identity_needs_review[0].code, 'VERSION_REQUIRED');
  const candidate = (await readCatalog(options.directory)).candidates[0];
  assert.equal(candidate.state, 'needs_review'); assert.equal(candidate.resource.identifier, null);
  assert.equal('canonical_key' in candidate, false); assert.equal((await readCatalog(options.directory)).items.length, 1);
});

test('CSV quoting preserves literal text and refuses malformed headers/quotes instead of executing cells', () => {
  const input = Buffer.from('source_record_id,source_url,observed_at,kind,identifier,url,title_hint\r\nrec,https://example.org/source,2026-11-02T10:00:00Z,article,,https://example.org/a,"=not-executed, \"\"quoted\"\"\nnext line"\r\n');
  assert.equal(parseCandidateCsv(input)[0].record.title_hint, '=not-executed, "quoted"\nnext line');
  assert.throws(() => parseCandidateCsv(Buffer.from('url,url\na,b')), { code: 'INVALID_CSV_HEADER' });
  assert.throws(() => parseCandidateCsv(Buffer.from('"unterminated')), { code: 'INVALID_CSV' });
});

test('unapproved rights, dangerous references, changed records and promotion attempts cannot be imported', async t => {
  const { header, options } = await setup(t);
  await fs.writeFile(options.input, header + 'record_x,https://127.0.0.1/private,2026-11-02T10:00:00Z,article,,https://example.org/a,Example\n');
  assert.equal((await importCandidates(options)).failures[0].code, 'SCHEMA_INVALID');
  await fs.writeFile(options.input, header + 'record_2,https://example.org/discussion,2026-11-02T10:00:00Z,article,,https://example.org/article,Example\n');
  await importCandidates({ ...options, write: true });
  await fs.writeFile(options.input, header + 'record_2,https://example.org/discussion,2026-11-02T10:00:00Z,article,,https://example.org/changed,Example\n');
  assert.equal((await importCandidates({ ...options, batchKey: 'changed', write: true })).failures[0].code, 'RECORD_CONFLICT');
  const promoted = (await readCatalog(options.directory)).candidates[0];
  promoted.state = 'promoted'; promoted.candidate_id = 'new_candidate'; promoted.source_record_id = 'new_record';
  await fs.writeFile(options.input, canonicalJson(promoted) + '\n');
  assert.equal((await importCandidates({ ...options, format: 'jsonl', batchKey: 'promote', write: true })).failures[0].code, 'IMPORT_STATE_FORBIDDEN');
});

test('candidate field rights are checked before storing a row, independently of item publication', async t => {
  const { fixture, options } = await setup(t);
  const source = fixture.catalog.sources[0];
  source.allowed_fields.store = source.allowed_fields.store.filter(field => field !== 'title_hint');
  let previous = null;
  for (const event of fixture.catalog.review_log) {
    if (event.entity_type === 'source') event.subject_hash = reviewContentHash('source', source);
    event.previous_event_hash = previous; event.event_hash = reviewEventHash(event); previous = event.event_hash;
  }
  await fs.writeFile(path.join(options.directory, 'sources.json'), canonicalJson(fixture.catalog.sources));
  await fs.writeFile(path.join(options.directory, 'review-log.jsonl'), fixture.catalog.review_log.map(canonicalJson).join('\n') + '\n');
  const report = await importCandidates({ ...options, write: true });
  assert.equal(report.accepted, 0); assert.equal(report.failures[0].code, 'FIELD_RIGHTS_BLOCKED');
  assert.equal((await readCatalog(options.directory)).candidates.length, 0);
});

test('cancelled jobs resume, checkpoints reconcile lost catalog writes and competing writers are rejected', async t => {
  const { options } = await setup(t);
  await assert.rejects(withDirectoryLock(options.directory, () => importCandidates({ ...options, write: true })), { code: 'WRITE_LOCKED' });
  const controller = new AbortController(); controller.abort();
  const cancelled = await importCandidates({ ...options, write: true, signal: controller.signal });
  assert.equal(cancelled.state, 'cancelled');
  assert.equal((await importCandidates({ ...options, write: true })).accepted, 1);
  await fs.writeFile(path.join(options.directory, 'candidates.jsonl'), '');
  assert.equal((await importCandidates({ ...options, write: true })).accepted, 1);
  assert.equal((await readCatalog(options.directory)).candidates.length, 1);
});

test('private import exempts public history permission but never the storage whitelist', async t => {
  for (const allowStore of [false, true]) {
    const { fixture, options } = await setup(t);
    const source = fixture.catalog.sources[0];
    source.allowed_fields.public_git = [];
    source.public_history_allowed = false;
    if (!allowStore) source.allowed_fields.store = source.allowed_fields.store.filter(field => field !== 'title_hint');
    const event = fixture.catalog.review_log.find(record => record.entity_type === 'source');
    event.subject_hash = reviewContentHash('source', source); event.event_hash = reviewEventHash(event);
    for (const [key, file] of Object.entries(CATALOG_FILES)) {
      const records = key === 'sources' ? [source] : key === 'review_log' ? [event] : [];
      await fs.writeFile(path.join(options.directory, file), file.endsWith('.jsonl') ? records.map(canonicalJson).join('\n') + (records.length ? '\n' : '') : canonicalJson(records));
    }
    const report = await importCandidates({ ...options, context: { topic_slugs: [], articles: [], project_slugs: [] }, publicGit: false, write: true });
    assert.equal(report.accepted, allowStore ? 1 : 0);
    if (!allowStore) assert.equal(report.failures[0].code, 'FIELD_RIGHTS_BLOCKED');
    assert.equal((await readCatalog(options.directory)).candidates.length, allowStore ? 1 : 0);
  }
});

test('jobs cannot be written inside the repository and catalog symlinks are refused', async t => {
  const { root, options } = await setup(t);
  await assert.rejects(importCandidates({ ...options, write: true, jobDirectory: path.resolve('data/library') }), { code: 'JOB_DIRECTORY_IN_REPOSITORY' });
  const alias = path.join(root, 'alias'); await fs.symlink(options.directory, alias);
  await assert.rejects(importCandidates({ ...options, directory: alias, write: true }), { code: 'INVALID_DIRECTORY' });
});
