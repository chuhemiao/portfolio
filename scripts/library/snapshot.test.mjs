import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { buildSnapshot, readSnapshot, validatePublicRecord } from './snapshot.mjs';
import { emptyCatalog, canonicalJson, hashJson } from './contract.mjs';
import { publishedFixture, draftFixture, appendFixtureReview, FIXTURE_AS_OF } from './fixtures/catalog.mjs';
import { withDirectoryLock } from './files.mjs';

async function setup(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'library-snapshot-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const fixture = publishedFixture();
  return { root, fixture, options: { catalog: fixture.catalog, directory: path.join(root, 'output'), asOf: FIXTURE_AS_OF, context: fixture.options.context, codeVersion: 'fixture-generator-v1' } };
}
async function modifyFile(directory, name, mutate) {
  const manifestPath = path.join(directory, 'manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath));
  const file = path.join(directory, 'snapshots', manifest.snapshot_id, name);
  const value = JSON.parse(await fs.readFile(file)); mutate(value);
  const bytes = Buffer.from(canonicalJson(value) + '\n');
  await fs.writeFile(file, bytes);
  manifest.files[name].sha256 = createHash('sha256').update(bytes).digest('hex');
  manifest.files[name].bytes = bytes.byteLength;
  manifest.checksum = 'sha256-' + hashJson(manifest.files);
  await fs.writeFile(manifestPath, canonicalJson(manifest) + '\n');
}

test('producer and separate reader consume the public Schema and exact content hashes, including an empty catalog', async t => {
  const { options, fixture } = await setup(t);
  const built = await buildSnapshot(options);
  const read = await readSnapshot(options.directory, { asOf: FIXTURE_AS_OF, currentCatalog: fixture.catalog, context: options.context });
  assert.equal(read.items.length, 1); assert.equal(built.detail_count, 1); assert.deepEqual(read.rankings.sorts.best, [fixture.catalog.items[0].id]);
  assert.equal(read.items[0].locales.ja.title, fixture.catalog.item_locales[2].title);
  assert.equal(read.details[read.items[0].id].locales.en.editorial_body, fixture.catalog.item_locales[1].editorial_body);
  assert.equal(read.rankings.sorts['recently-recommended'].length, 0);
  const empty = await buildSnapshot({ ...options, catalog: emptyCatalog() });
  assert.equal(empty.item_count, 0);
  assert.deepEqual((await readSnapshot(options.directory, { asOf: FIXTURE_AS_OF })).items, []);
  assert.equal((await fs.readdir(path.join(options.directory, 'snapshots'))).length, 1);
});

test('public projection never serializes raw catalog review, actor, model-run or provenance records', async t => {
  const { options } = await setup(t);
  await buildSnapshot(options);
  const read = await readSnapshot(options.directory, { asOf: FIXTURE_AS_OF });
  const output = JSON.stringify(read);
  for (const name of ['review_event_id', 'actor_cluster_ref', 'field_provenance', 'review_log', 'approved_by', 'subject_hash', 'prompt_version', 'input_hash']) {
    if (name === 'input_hash') continue;
    assert.equal(output.includes(`"${name}"`), false, name);
  }
  assert.equal(output.includes('fixture-not-a-human'), false);
  assert.throws(() => validatePublicRecord('item', { ...read.items[0], actor_cluster_ref: 'private' }), { code: 'PUBLIC_SCHEMA_INVALID' });
});

test('equal source data and explicit clock rebuild exactly; irrelevant collection ordering does not change identity', async t => {
  const { options } = await setup(t);
  const first = await buildSnapshot(options);
  const bytes = await fs.readFile(path.join(options.directory, 'manifest.json'));
  const shuffled = structuredClone(options.catalog); shuffled.item_locales.reverse();
  const second = await buildSnapshot({ ...options, catalog: shuffled });
  assert.equal(first.manifest.snapshot_id, second.manifest.snapshot_id);
  assert.deepEqual(await fs.readFile(path.join(options.directory, 'manifest.json')), bytes);
  assert.notEqual((await buildSnapshot({ ...options, asOf: '2026-11-02T12:00:01Z' })).manifest.snapshot_id, first.manifest.snapshot_id);
});

test('ordinary malformed input preserves the last lawful output, but stale content/audit/rights cannot restore it', async t => {
  const { options } = await setup(t);
  await buildSnapshot(options);
  const prior = await fs.readFile(path.join(options.directory, 'manifest.json'));
  const bad = structuredClone(options.catalog); bad.schema_version = '2.0';
  await assert.rejects(buildSnapshot({ ...options, catalog: bad }), { code: 'CATALOG_INVALID' });
  assert.deepEqual(await fs.readFile(path.join(options.directory, 'manifest.json')), prior);
  const unknown = structuredClone(options.catalog); unknown.items[0].unknown_extra = 'ordinary shape error without withdrawal';
  await assert.rejects(buildSnapshot({ ...options, catalog: unknown }), { code: 'CATALOG_INVALID' });
  assert.deepEqual(await fs.readFile(path.join(options.directory, 'manifest.json')), prior);
  const revoked = structuredClone(options.catalog); revoked.sources[0].status = 'revoked';
  await assert.rejects(readSnapshot(options.directory, { asOf: FIXTURE_AS_OF, currentCatalog: revoked, context: options.context }), { code: 'SNAPSHOT_STALE' });
  await assert.rejects(buildSnapshot({ ...options, catalog: revoked }), { code: 'CATALOG_INVALID' });
  await assert.rejects(fs.stat(path.join(options.directory, 'manifest.json')), { code: 'ENOENT' });
  assert.deepEqual(await fs.readdir(path.join(options.directory, 'snapshots')), []);
});

test('a later takedown event also suspends an old snapshot when its published item row was not materialized', async t => {
  const { options } = await setup(t);
  await buildSnapshot(options);
  appendFixtureReview(options.catalog, 'item', options.catalog.items[0], { action: 'takedown', state: 'takedown' });
  await assert.rejects(buildSnapshot(options), { code: 'CATALOG_INVALID' });
  await assert.rejects(fs.stat(path.join(options.directory, 'manifest.json')), { code: 'ENOENT' });
});

test('readers enforce expiry, schema version, byte hashes, same snapshot identity and semantic references', async t => {
  for (const scenario of ['expired', 'schema', 'hash', 'version', 'reference']) {
    const local = await setup(t); const { options } = local;
    await buildSnapshot(options);
    if (scenario === 'expired') { await assert.rejects(readSnapshot(options.directory, { asOf: '2027-01-01T00:00:00Z' }), { code: 'SNAPSHOT_EXPIRED' }); continue; }
    const filename = path.join(options.directory, 'manifest.json');
    if (scenario === 'schema') { const value = JSON.parse(await fs.readFile(filename)); value.schema_version = '2.0'; await fs.writeFile(filename, JSON.stringify(value)); }
    if (scenario === 'hash') { const m = JSON.parse(await fs.readFile(filename)); await fs.appendFile(path.join(options.directory, 'snapshots', m.snapshot_id, 'items.json'), ' '); }
    if (scenario === 'version') await modifyFile(options.directory, 'items.json', value => { value.snapshot_id = 'sha256-' + '0'.repeat(64); });
    if (scenario === 'reference') await modifyFile(options.directory, 'items.json', value => { value.data[0].locales.en.reasons[0].editorial_selection_id = 'not-present'; });
    await assert.rejects(readSnapshot(options.directory, { asOf: FIXTURE_AS_OF }), { code: { schema: 'PUBLIC_SCHEMA_INVALID', hash: 'SNAPSHOT_CHECKSUM_INVALID', version: 'SNAPSHOT_VERSION_MISMATCH', reference: 'SNAPSHOT_REFERENCE_INVALID' }[scenario] });
  }
});

test('public output ownership, write locks and immutable snapshot bytes protect unrelated or conflicting files', async t => {
  const { root, options } = await setup(t);
  const foreign = path.join(root, 'foreign'); await fs.mkdir(foreign); await fs.writeFile(path.join(foreign, 'keep.txt'), 'keep');
  await assert.rejects(buildSnapshot({ ...options, directory: foreign }), { code: 'OUTPUT_NOT_OWNED' });
  assert.equal(await fs.readFile(path.join(foreign, 'keep.txt'), 'utf8'), 'keep');
  await buildSnapshot(options);
  await assert.rejects(withDirectoryLock(options.directory, () => buildSnapshot(options)), { code: 'WRITE_LOCKED' });
  const manifest = JSON.parse(await fs.readFile(path.join(options.directory, 'manifest.json')));
  await fs.writeFile(path.join(options.directory, 'snapshots', manifest.snapshot_id, 'items.json'), 'corrupt');
  await assert.rejects(buildSnapshot(options), { code: 'SNAPSHOT_COLLISION' });
});

test('reader recomputes the payload content address independently of self-reported file hashes', async t => {
  const { options } = await setup(t);
  const first = await buildSnapshot(options);
  await modifyFile(options.directory, 'items.json', value => { value.data[0].original_title = 'A different title with freshly rehashed bytes'; });
  await assert.rejects(readSnapshot(options.directory, { asOf: FIXTURE_AS_OF, currentCatalog: options.catalog, context: options.context }), { code: 'SNAPSHOT_IDENTITY_INVALID' });
  await fs.rm(options.directory, { recursive: true });
  const rebuilt = await buildSnapshot(options);
  assert.equal(rebuilt.manifest.snapshot_id, first.manifest.snapshot_id);
  assert.equal((await readSnapshot(options.directory, { asOf: FIXTURE_AS_OF })).items.length, 1);
});

test('withdrawal, expiry and audit invalidation suspend old output despite unrelated malformed siblings', async t => {
  for (const reason of ['revoked', 'blocked', 'disabled', 'expired', 'takedown', 'audit']) {
    const { options } = await setup(t);
    await buildSnapshot(options);
    const catalog = structuredClone(options.catalog);
    catalog.items[0].unknown_extra = 'unrelated malformed sibling';
    if (['revoked', 'blocked', 'disabled'].includes(reason)) catalog.sources[0].status = reason;
    if (reason === 'expired') catalog.sources[0].review_due_at = '2026-11-02T10:00:00Z';
    if (reason === 'takedown') appendFixtureReview(catalog, 'item', catalog.items[0], { action: 'takedown', state: 'takedown' });
    if (reason === 'audit') catalog.review_log[0].event_hash = '0'.repeat(64);
    await assert.rejects(buildSnapshot({ ...options, catalog }), { code: 'CATALOG_INVALID' });
    await assert.rejects(fs.stat(path.join(options.directory, 'manifest.json')), { code: 'ENOENT' }, reason);
    assert.deepEqual(await fs.readdir(path.join(options.directory, 'snapshots')), []);
  }
});

test('draft and quarantined resources never leak into a public snapshot, even under private input validation', async t => {
  const { options } = await setup(t);
  const draft = draftFixture();
  const result = await buildSnapshot({ ...options, catalog: draft.catalog, publicGit: false });
  assert.equal(result.item_count, 0);
  const read = await readSnapshot(options.directory, { asOf: FIXTURE_AS_OF });
  assert.equal(JSON.stringify(read).includes('Synthetic fixture resource'), false);
});
