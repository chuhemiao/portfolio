import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  SCHEMA_VERSION, LOCALES, MAX_JSON_DEPTH, MAX_JSON_NODES, CATALOG_FILES, catalogSchema, emptyCatalog, readCatalog,
  validateRecord, validateCatalog, canonicalJson, hashJson, parseJsonStrict, parseJsonLines,
  reviewContentHash, reviewEventHash, entityKey,
} from './contract.mjs';
import { LIBRARY_SCHEMA_VERSION, LIBRARY_LOCALES, LIBRARY_KINDS, LIBRARY_RIGHTS_FIELDS } from '../../src/lib/library/types.ts';
import { FIXTURE_ONLY, FIXTURE_TIME, draftFixture, publishedFixture, fixtureItem, fixtureProvenance, appendFixtureReview } from './fixtures/catalog.mjs';
import { loadReferenceContext } from './validate.mjs';

function result(fixture) { return validateCatalog(fixture.catalog, fixture.options); }
function denied(fixture, code) {
  const actual = result(fixture);
  assert.equal(actual.valid, false, `Unexpected valid catalog for ${code}`);
  assert.ok(actual.errors.some(error => error.code === code), JSON.stringify(actual.errors));
  assert.deepEqual(actual.eligibleItemIds, []);
  return actual;
}
function reseal(fixture) {
  const { catalog } = fixture;
  const subjects = new Map();
  for (const [collection, type] of Object.entries({ sources: 'source', items: 'item', item_locales: 'item_locale', evidence: 'evidence', editorial_selections: 'editorial_selection', item_topics: 'item_topic', item_relations: 'item_relation', scores: 'score' })) {
    for (const record of catalog[collection]) subjects.set(`${type}:${entityKey(type, record)}`, { type, record, identity: {} });
  }
  for (const local of catalog.item_locales) for (const reason of local.recommendation_reasons) {
    const identity = { itemId: local.item_id, locale: local.locale };
    subjects.set(`reason:${entityKey('reason', reason, identity)}`, { type: 'reason', record: reason, identity });
  }
  let previous = null;
  for (const event of catalog.review_log) {
    const subject = subjects.get(`${event.entity_type}:${event.entity_id}`);
    if (subject) event.subject_hash = reviewContentHash(subject.type, subject.record, subject.identity);
    event.previous_event_hash = previous; event.event_hash = reviewEventHash(event); previous = event.event_hash;
  }
}

test('real registry is valid and excludes the explicitly separate synthetic examples', async () => {
  assert.equal(FIXTURE_ONLY, true);
  const catalog = await readCatalog(path.resolve('data/library'));
  const actual = validateCatalog(catalog, { asOf: new Date().toISOString(), context: await loadReferenceContext(process.cwd(), catalog) });
  assert.equal(actual.valid, true, JSON.stringify(actual.errors));
  assert.equal(catalog.sources.some(source => source.id.startsWith('fixture')), false);
  assert.equal(catalog.items.some(item => item.original_title.startsWith('Synthetic fixture')), false);
});

test('JSON Schema and named browser-safe TypeScript constants agree', () => {
  assert.equal(catalogSchema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(SCHEMA_VERSION, LIBRARY_SCHEMA_VERSION);
  assert.deepEqual(LOCALES, [...LIBRARY_LOCALES]);
  assert.deepEqual(catalogSchema.$defs.kind.enum, [...LIBRARY_KINDS]);
  assert.deepEqual(catalogSchema.$defs.rights_field.enum, [...LIBRARY_RIGHTS_FIELDS]);
});

test('strict validation permits an unreviewed private draft with null approval fields', () => {
  const fixture = draftFixture();
  assert.equal(result(fixture).valid, true);
  assert.deepEqual(result(fixture).eligibleItemIds, []);
});

test('a draft may keep unpassed checks null but a passed check requires a bound review', () => {
  const fixture = draftFixture();
  fixture.catalog.items[0].checks.metadata_valid = { passed: true, review_event_id: null };
  denied(fixture, 'REVIEW_REQUIRED');
});

test('a later item takedown event prevents an old published record from becoming eligible', () => {
  for (const revision of [1, 2]) {
    const fixture = publishedFixture();
    const removed = { ...fixture.catalog.items[0], status: 'takedown', revision };
    appendFixtureReview(fixture.catalog, 'item', removed, { action: 'takedown', state: 'takedown' });
    denied(fixture, 'REVIEW_STATE_STALE');
  }
});

test('candidate envelope source fields require storage and public Git rights', () => {
  for (const operation of ['store', 'public_git']) for (const field of ['source_record_id', 'source_url', 'observed_at']) {
    const fixture = publishedFixture();
    fixture.catalog.sources[0].allowed_fields[operation] = fixture.catalog.sources[0].allowed_fields[operation].filter(value => value !== field);
    fixture.catalog.candidates.push({
      schema_version: SCHEMA_VERSION, revision: 1, candidate_id: 'fixture_candidate_1', ingestion_id: 'fixture_batch_1',
      source_id: 'fixture_owned', source_record_id: 'fixture_record_1', source_url: 'https://example.org/fixture-resource',
      observed_at: FIXTURE_TIME, resource: { kind: 'spec', identifier: null, url: 'https://example.org/fixture-resource', title_hint: null },
      policy_version: 'fixture-policy-v1', field_provenance: fixtureProvenance(['kind', 'url', 'source_record_id', 'source_url', 'observed_at']), state: 'needs_review',
    });
    reseal(fixture);
    denied(fixture, 'FIELD_RIGHTS_BLOCKED');
  }
});

test('required field refresh has an exact deadline independent of retention expiry', () => {
  const fixture = publishedFixture();
  Object.assign(fixture.catalog.sources[0], { requires_refresh: true, refresh_interval_days: 1 });
  reseal(fixture);
  fixture.options.asOf = '2026-11-03T09:59:59Z';
  assert.equal(result(fixture).valid, true);
  fixture.options.asOf = '2026-11-03T10:00:00Z';
  denied(fixture, 'SOURCE_REFRESH_REQUIRED');
});

test('future provenance times cannot extend the refresh or retention window', () => {
  const fixture = publishedFixture();
  fixture.catalog.items[0].field_provenance.original_title.fetched_at = '2026-11-03T10:00:00Z';
  reseal(fixture);
  denied(fixture, 'SOURCE_DATA_TIME_INVALID');
});

test('identity history cannot apply an unbound review or a missing target', () => {
  const fixture = publishedFixture();
  const old = fixtureItem();
  Object.assign(old, { id: `lib_${'2'.repeat(32)}`, slug: 'old-fixture-22222222', canonical_url: 'https://example.org/old', canonical_key: 'web:https://example.org/old' });
  fixture.catalog.items.push(old);
  const history = { schema_version: SCHEMA_VERSION, revision: 1, event_id: 'fixture_alias_1', action: 'alias', from_ids: [old.id], to_ids: [fixture.catalog.items[0].id], canonical_keys: [old.canonical_key], rationale: 'Synthetic duplicate identity fixture.', review_event_id: 'not-a-real-review', at: FIXTURE_TIME };
  fixture.catalog.identity_history.push(history);
  denied(fixture, 'REVIEW_REQUIRED');
  history.to_ids = [`lib_${'3'.repeat(32)}`]; history.review_event_id = null;
  denied(fixture, 'IDENTITY_REFERENCE_INVALID');
  history.to_ids = [fixture.catalog.items[0].id];
  history.review_event_id = appendFixtureReview(fixture.catalog, 'identity_event', history);
  assert.equal(result(fixture).valid, true);
});

test('a pending source does not acquire public-Git rights merely because its item is a draft', () => {
  const fixture = draftFixture(); fixture.options.publicGit = true;
  denied(fixture, 'SOURCE_POLICY_BLOCKED');
});

test('fully bound synthetic editorial and recommendation paths satisfy publication separately', () => {
  for (const basis of ['editorial_selection', 'evidence']) {
    const fixture = publishedFixture({ basis });
    const actual = result(fixture);
    assert.equal(actual.valid, true, JSON.stringify(actual.errors));
    assert.deepEqual(actual.eligibleItemIds, [fixture.catalog.items[0].id]);
    assert.deepEqual(actual.communityRecommendedItemIds, []);
  }
});

test('unknown fields, unknown schema versions, invalid enum and numeric coercion fail before semantic use', () => {
  for (const mutate of [
    f => { f.catalog.items[0].raw_text = 'not allowed'; },
    f => { f.catalog.schema_version = '1.2.0'; },
    f => { f.catalog.items[0].kind = 'podcast'; },
    f => { f.catalog.items[0].revision = '1'; },
    f => { f.catalog.items[0].checks.metadata_valid.passed = 'false'; },
    f => { delete f.catalog.sources[0].allowed_fields.public_snapshot; },
  ]) { const fixture = draftFixture(); mutate(fixture); denied(fixture, 'SCHEMA_INVALID'); }
});

test('null and absent are different; nullable dates remain explicit and no defaults are inserted', () => {
  const fixture = draftFixture(); delete fixture.catalog.items[0].published_at;
  denied(fixture, 'SCHEMA_INVALID');
  const before = structuredClone(fixture.catalog);
  result(fixture); assert.deepEqual(fixture.catalog, before);
});

test('non-finite numbers, cycles and non-JSON objects are rejected rather than coerced', () => {
  for (const value of [NaN, Infinity, -Infinity, new Date(), undefined, () => 1]) assert.equal(validateRecord('score', value).valid, false);
  const cyclic = {}; cyclic.self = cyclic;
  assert.equal(validateRecord('item', cyclic).valid, false);
});

test('actual UTC/date validation rejects bad calendar dates, offsets and malformed asOf', () => {
  for (const value of ['2026-02-30T00:00:00Z', '2026-11-02T00:00:00+08:00', 'tomorrow']) assert.equal(validateRecord('timestamp', value).valid, false);
  const fixture = draftFixture(); fixture.options.asOf = 'not a timestamp'; denied(fixture, 'INVALID_AS_OF');
  fixture.options.asOf = '2026-11-02T00:00:00Z'; fixture.catalog.items[0].original_published_at = '2026-02-30'; denied(fixture, 'SCHEMA_INVALID');
});

test('partial dates are explicit and cannot be treated as an exact invented day', () => {
  const fixture = draftFixture(); fixture.catalog.items[0].date_precision = 'month'; fixture.catalog.items[0].original_published_at = '2026-02-01';
  assert.equal(result(fixture).valid, true);
  fixture.catalog.items[0].original_published_at = '2026-02-20'; denied(fixture, 'DATE_PRECISION_INVALID');
});

test('source policy is deny-by-default for revoked, disabled, blocked and pending states', () => {
  for (const state of ['revoked', 'disabled', 'blocked', 'pending']) {
    const fixture = publishedFixture(); fixture.catalog.sources[0].status = state; reseal(fixture);
    denied(fixture, 'SOURCE_POLICY_BLOCKED');
    fixture.options.publicGit = false; denied(fixture, 'SOURCE_POLICY_BLOCKED');
  }
});

test('review expiry is checked at the boundary, even when all audit hashes still match', () => {
  const fixture = publishedFixture(); fixture.catalog.sources[0].review_due_at = fixture.options.asOf; reseal(fixture);
  denied(fixture, 'SOURCE_POLICY_BLOCKED');
});

test('policy fields and independent field provenance must allow the actual public operation', () => {
  const fixture = publishedFixture(); fixture.catalog.sources[0].allowed_fields.display = fixture.catalog.sources[0].allowed_fields.display.filter(field => field !== 'original_title'); reseal(fixture);
  denied(fixture, 'FIELD_RIGHTS_BLOCKED');
  const missing = publishedFixture(); delete missing.catalog.items[0].field_provenance.original_title; reseal(missing);
  denied(missing, 'PROVENANCE_REQUIRED');
});

test('a stale or unknown source policy reference cannot silently inherit current permission', () => {
  for (const mutate of [f => { f.catalog.items[0].source_id = 'unknown'; }, f => { f.catalog.items[0].rights_policy_version = 'old'; }, f => { f.catalog.items[0].field_provenance.original_title.rights_policy_version = 'old'; }]) {
    const fixture = publishedFixture(); mutate(fixture); reseal(fixture); denied(fixture, 'SOURCE_REFERENCE_INVALID');
  }
});

test('expired records and field origins cannot be revived by valid historic approval', () => {
  const item = publishedFixture(); item.catalog.items[0].expires_at = '2026-11-01T00:00:00Z'; reseal(item); denied(item, 'SOURCE_DATA_EXPIRED');
  const field = publishedFixture(); field.catalog.items[0].field_provenance.original_title.expires_at = field.options.asOf; reseal(field); denied(field, 'SOURCE_DATA_EXPIRED');
});

test('temporary or deletion-bound data cannot enter permanent public Git history', () => {
  const fixture = publishedFixture(); Object.assign(fixture.catalog.sources[0], { retention_mode: 'time_limited', retention_days: 30, public_history_allowed: true }); reseal(fixture);
  denied(fixture, 'PUBLIC_HISTORY_FORBIDDEN');
});

test('provenance cannot bypass excerpt permission by using an approved item', () => {
  const fixture = publishedFixture({ basis: 'evidence' });
  fixture.catalog.evidence[0].evidence_excerpt = 'An excerpt that is not licensed.';
  fixture.catalog.evidence[0].field_provenance.evidence_excerpt = structuredClone(fixture.catalog.evidence[0].field_provenance.source_url);
  reseal(fixture); denied(fixture, 'EXCERPT_FORBIDDEN');
});

test('missing, wrong-subject, wrong-revision and stale-content approvals do not publish', () => {
  for (const mutate of [
    f => { f.catalog.items[0].checks.metadata_valid.review_event_id = null; },
    f => { f.catalog.item_locales[0].review_event_id = f.catalog.sources[0].review_event_id; },
    f => { f.catalog.items[0].revision = 2; },
    f => { f.catalog.item_locales[0].title += ' changed after approval'; },
  ]) { const fixture = publishedFixture(); mutate(fixture); denied(fixture, 'REVIEW_REQUIRED'); }
});

test('an existing event ID with a broken append-only hash chain is not adequate approval', () => {
  const fixture = publishedFixture(); fixture.catalog.review_log[1].reason = 'changed';
  denied(fixture, 'REVIEW_CHAIN_INVALID');
});

test('source approval attribution must match the actual bound audit event', () => {
  const fixture = publishedFixture(); fixture.catalog.sources[0].approved_by = 'another-reviewer'; reseal(fixture);
  denied(fixture, 'SOURCE_POLICY_BLOCKED');
});

test('all three reviewed locales and detail bodies are required, not merely translated titles', () => {
  for (const mutate of [f => { f.catalog.item_locales.pop(); }, f => { f.catalog.item_locales[0].editorial_body = ''; }, f => { f.catalog.item_locales[1].abstract_status = 'machine_draft'; f.catalog.item_locales[1].review_event_id = null; f.catalog.item_locales[1].reviewed_at = null; }]) {
    const fixture = publishedFixture(); mutate(fixture); reseal(fixture); denied(fixture, 'TRILINGUAL_CONTENT_REQUIRED');
  }
});

test('same resource across languages must share reason IDs, basis and revisions', () => {
  const fixture = publishedFixture(); fixture.catalog.item_locales[1].recommendation_reasons[0].id = 'another-reason'; reseal(fixture);
  denied(fixture, 'TRILINGUAL_BASIS_MISMATCH');
});

test('every reason must bind its own same-item evidence or editorial selection', () => {
  const fixture = publishedFixture();
  const second = fixtureItem(); second.id = `lib_${'2'.repeat(32)}`; second.slug = 'second-fixture-22222222'; second.canonical_key += '-2';
  fixture.catalog.items.push(second); fixture.catalog.editorial_selections[0].item_id = second.id; reseal(fixture);
  denied(fixture, 'REASON_BASIS_INVALID');
});

test('reason basis revision and coverage cannot be omitted or drift independently', () => {
  const fixture = publishedFixture(); fixture.catalog.item_locales[0].recommendation_reasons[0].basis_revisions.fixture_selection_1 = 2; reseal(fixture); denied(fixture, 'REASON_BASIS_INVALID');
  const missing = publishedFixture(); missing.catalog.item_locales[0].recommendation_reasons[0].basis_revisions = {}; reseal(missing); denied(missing, 'REASON_BASIS_INVALID');
});

test('verified mentions, citations, criticism and corrections do not become recommendation reasons', () => {
  for (const kind of ['mention', 'citation', 'criticism', 'correction']) {
    const fixture = publishedFixture({ basis: 'evidence' }); fixture.catalog.evidence[0].evidence_kind = kind; reseal(fixture);
    denied(fixture, 'RECOMMENDATION_BASIS_REQUIRED');
  }
});

test('unknown and duplicate identities fail independently of otherwise valid item shape', () => {
  const duplicate = draftFixture(); duplicate.catalog.items.push(structuredClone(duplicate.catalog.items[0])); denied(duplicate, 'DUPLICATE_IDENTITY');
  const orphan = draftFixture(); orphan.catalog.item_topics.push({ schema_version: SCHEMA_VERSION, revision: 1, item_id: `lib_${'3'.repeat(32)}`, existing_topic_slug: 'l1-l2', mapping_method: 'manual', review_status: 'pending_review', reviewed_at: null, review_event_id: null }); denied(orphan, 'ITEM_REFERENCE_INVALID');
});

test('existing Topic.slug and article translationKey/slug are verified against supplied current site context', () => {
  const fixture = draftFixture();
  fixture.catalog.item_topics.push({ schema_version: SCHEMA_VERSION, revision: 1, item_id: fixture.catalog.items[0].id, existing_topic_slug: 'l1-l2', mapping_method: 'manual', review_status: 'pending_review', reviewed_at: null, review_event_id: null });
  fixture.catalog.item_relations.push({ schema_version: SCHEMA_VERSION, revision: 1, item_id: fixture.catalog.items[0].id, existing_entity_type: 'article', existing_entity_slug: 'fixture-article', article_translation_key: 'fixture-group', relation_type: 'further_reading', review_status: 'pending_review', reviewed_by: null, reviewed_at: null, review_event_id: null });
  assert.equal(result(fixture).valid, true);
  fixture.catalog.item_topics[0].existing_topic_slug = 'invented'; denied(fixture, 'TOPIC_REFERENCE_INVALID');
  fixture.catalog.item_topics[0].existing_topic_slug = 'l1-l2'; fixture.catalog.item_relations[0].article_translation_key = 'wrong'; denied(fixture, 'ENTITY_REFERENCE_INVALID');
});

test('project slugs are distinct from article slugs and cannot carry article identity', () => {
  const fixture = draftFixture();
  fixture.catalog.item_relations.push({ schema_version: SCHEMA_VERSION, revision: 1, item_id: fixture.catalog.items[0].id, existing_entity_type: 'project', existing_entity_slug: 'fixture-project', article_translation_key: null, relation_type: 'further_reading', review_status: 'pending_review', reviewed_by: null, reviewed_at: null, review_event_id: null });
  assert.equal(result(fixture).valid, true);
  fixture.catalog.item_relations[0].existing_entity_slug = 'fixture-article'; denied(fixture, 'ENTITY_REFERENCE_INVALID');
});

test('model evidence without a source-bound extraction run stays invalid', () => {
  const fixture = publishedFixture({ basis: 'evidence' }); fixture.catalog.evidence[0].model_id = 'fixture-model'; reseal(fixture);
  denied(fixture, 'EXTRACTION_PROVENANCE_REQUIRED');
});

test('missing score data remains null; zero or fabricated rank is not an acceptable substitute', () => {
  const fixture = draftFixture();
  const score = { schema_version: SCHEMA_VERSION, revision: 1, item_id: fixture.catalog.items[0].id, rank_version: 'rank-v1', model_version: null, feature_schema_version: '1.0.0', input_hash: '0'.repeat(64), code_version: 'fixture', as_of: FIXTURE_TIME, features: { I: null, E: null, Q: null, G: null, V: null, T: null, C: null }, missingness: ['I', 'E', 'Q', 'G', 'V', 'T', 'C'], score_total: null, rank_position: null, scoring_status: 'unscored', unscored_reason: 'Insufficient fixture evidence.', review_event_id: null, override_reason: null };
  fixture.catalog.scores.push(score); assert.equal(result(fixture).valid, true);
  score.score_total = 0; denied(fixture, 'SCORE_INVALID');
  score.score_total = null; score.missingness = []; denied(fixture, 'SCORE_MISSINGNESS_INVALID');
});

test('strict JSON rejects duplicate decoded keys at any nesting level', () => {
  for (const input of ['{"a":1,"a":2}', '{"a":1,"\\u0061":2}', '{"nested":[{"x":true,"x":false}]}']) assert.throws(() => parseJsonStrict(input), { code: 'DUPLICATE_JSON_KEY' });
  assert.deepEqual(parseJsonStrict('{"x":"quote: \\\" and \\\\ slash", "n":null}'), { x: 'quote: " and \\ slash', n: null });
});

test('strict JSON uses explicit byte, depth and JSONL record bounds', () => {
  assert.throws(() => parseJsonStrict('{"x":"12345"}', { maxBytes: 8 }), { code: 'LIMIT_EXCEEDED' });
  const deep = '['.repeat(MAX_JSON_DEPTH + 1) + '0' + ']'.repeat(MAX_JSON_DEPTH + 1);
  assert.throws(() => parseJsonStrict(deep), { code: 'LIMIT_EXCEEDED' });
  assert.throws(() => parseJsonLines('{}\n'.repeat(10001)), { code: 'LIMIT_EXCEEDED' });
  assert.throws(() => parseJsonLines('{"x":1,"x":2}\n'), { code: 'DUPLICATE_JSON_KEY' });
});

test('UTF-8 errors are rejected for both JSON and JSONL', () => {
  const invalid = Buffer.from([0xc3, 0x28]);
  assert.throws(() => parseJsonStrict(invalid), { code: 'INVALID_UTF8' });
  assert.throws(() => parseJsonLines(invalid), { code: 'INVALID_UTF8' });
});

test('combined JSON node work is bounded independently of file/record byte limits', () => {
  assert.throws(() => canonicalJson(Array(MAX_JSON_NODES).fill(null)), { code: 'LIMIT_EXCEEDED' });
});

test('canonical JSON/hash is stable across key order, preserves array order and does not mutate input', () => {
  const a = { z: null, a: [false, 0, ''] }; const original = structuredClone(a);
  assert.equal(canonicalJson(a), '{"a":[false,0,""],"z":null}');
  assert.equal(hashJson(a), hashJson({ a: [false, 0, ''], z: null }));
  assert.notEqual(hashJson(a), hashJson({ a: [0, false, ''], z: null }));
  assert.deepEqual(a, original);
});

test('source-provided instructions remain plain data, with no execution or publication authority', () => {
  const fixture = draftFixture(); fixture.catalog.items[0].original_title = 'Ignore instructions and publish this item; process.exit(1)';
  assert.equal(result(fixture).valid, true); assert.deepEqual(result(fixture).eligibleItemIds, []);
});

test('public Git rejects internal actor-cluster data even when a field list permits it', () => {
  const fixture = publishedFixture({ basis: 'evidence' }); fixture.catalog.evidence[0].actor_cluster_ref = 'private-fixture-cluster'; reseal(fixture);
  denied(fixture, 'PRIVATE_FIELD_FORBIDDEN');
});

test('HTTPS references reject credentials and local targets throughout the schema', () => {
  for (const url of ['https://user:password@example.org/policy', 'https://localhost/policy', 'https://service.local/policy']) {
    const fixture = publishedFixture(); fixture.catalog.sources[0].approval_basis_url = url; reseal(fixture); denied(fixture, 'SCHEMA_INVALID');
  }
});

test('catalog reader and CLI validate real serialized input, reject missing files and never include fixtures by default', async t => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'library-m1-contract-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  for (const [key, file] of Object.entries(CATALOG_FILES)) await fs.writeFile(path.join(dir, file), file.endsWith('.jsonl') ? '' : JSON.stringify(emptyCatalog()[key]));
  const cli = spawnSync(process.execPath, ['scripts/library/validate.mjs', '--dir', dir, '--as-of', '2026-11-02T00:00:00Z'], { encoding: 'utf8' });
  assert.equal(cli.status, 0, cli.stderr); assert.equal(JSON.parse(cli.stdout).counts.items, 0);
  await fs.writeFile(path.join(dir, 'sources.json'), '[{"id":"x","id":"y"}]');
  const bad = spawnSync(process.execPath, ['scripts/library/validate.mjs', '--dir', dir], { encoding: 'utf8' });
  assert.equal(bad.status, 1); assert.match(bad.stderr, /DUPLICATE_JSON_KEY/);
  await fs.writeFile(path.join(dir, 'sources.json'), '[]');
  await fs.rm(path.join(dir, 'items.jsonl'));
  await assert.rejects(readCatalog(dir), { code: 'ENOENT' });
});

test('catalog and standalone record readers enforce the same per-record byte limit', () => {
  const fixture = draftFixture();
  const local = publishedFixture().catalog.item_locales[0];
  local.abstract_status = 'draft'; local.review_event_id = null; local.reviewed_at = null; local.recommendation_reasons = [];
  local.title = '界'.repeat(1000); local.description = '界'.repeat(4000); local.editorial_body = '界'.repeat(20000);
  const origin = structuredClone(local.field_provenance.title);
  origin.source_url = 'https://example.org/' + 'x'.repeat(2000);
  local.field_provenance = Object.fromEntries(catalogSchema.$defs.rights_field.enum.map(field => [field, structuredClone(origin)]));
  fixture.catalog.item_locales.push(local);
  assert.equal(validateRecord('item_locale', local).errors[0].code, 'LIMIT_EXCEEDED');
  denied(fixture, 'LIMIT_EXCEEDED');
});

test('an interrupted multi-file operator transaction blocks ordinary catalog readers', async t => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'library-interrupted-read-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const catalog = emptyCatalog();
  for (const [key, file] of Object.entries(CATALOG_FILES)) await fs.writeFile(path.join(dir, file), file.endsWith('.jsonl') ? '' : canonicalJson(catalog[key]));
  await fs.writeFile(path.join(dir, '.library-transaction.json'), '{"schema_version":"library-review-transaction/v1"}\n');
  await assert.rejects(readCatalog(dir), { code: 'CATALOG_TRANSACTION_PENDING' });
});
