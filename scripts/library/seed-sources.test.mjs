import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { prepareSeed, seedSources } from './seed-sources.mjs';
import { CATALOG_FILES, canonicalJson, readCatalog, emptyCatalog } from './contract.mjs';
import { normalizeResource } from './normalize.mjs';

const prepared = await prepareSeed();
const byTitle = title => prepared.catalog.items.find(item => item.original_title === title);

test('actual seed retains edition-specific publisher facts instead of the design placeholder', () => {
  const book = byTitle('Mastering Ethereum, 2nd Edition');
  assert.equal(book.identifiers.isbn13, '9781098168414');
  assert.deepEqual(book.creators, ['Carlo Parisi', 'Alessandro Mazza', 'Niccolo Pozzolini', 'Gavin Wood', 'Andreas M. Antonopoulos']);
  assert.equal(book.original_published_at, '2025-10-01'); assert.equal(book.date_precision, 'month');
  assert.equal(book.original_language, 'en');
  const understanding = byTitle('Understanding Bitcoin');
  assert.equal(understanding.canonical_url, 'https://doi.org/10.1002/9781119019138');
  assert.equal(understanding.identifiers.isbn13, '9781119019169');
  assert.equal(prepared.catalog.identity_history.length, 0);
});

test('course year and course-level presenters do not become video dates or per-video creators', () => {
  const videos = prepared.catalog.items.filter(item => item.kind === 'video');
  for (const video of videos) {
    assert.equal(video.original_published_at, null); assert.equal(video.date_precision, 'unknown');
    assert.deepEqual(video.creators, []); assert.equal(video.original_language, 'und');
    assert.equal(video.identifiers.youtube_id, null);
  }
  assert.ok(videos.some(video => video.canonical_url.endsWith('/lec14-ightning-network-and-cross-chain-swaps/')));
  assert.equal(prepared.catalog.candidates.some(candidate => candidate.source_record_id.includes(':session-18-')), false);
});

test('selected specifications have real immutable file pins without conflating created or Draft with publication', async () => {
  const pins = JSON.parse(await fs.readFile('data/library/metadata/spec-pins.json', 'utf8')).pins;
  for (const item of prepared.catalog.items.filter(item => item.kind === 'spec')) {
    const pin = pins.find(pin => String(pin.eip_number) === item.identifiers.eip_number);
    assert.equal(item.identifiers.version, pin.reviewed_source_version);
    assert.match(pin.source_file_sha256, /^[a-f0-9]{64}$/);
    assert.equal(item.original_published_at, null); assert.equal(item.date_precision, 'unknown');
  }
  const agent = byTitle('Trustless Agents');
  assert.equal(agent.status, 'draft');
  assert.ok(prepared.selection.selection.find(row => row.item_id === agent.id).unresolved.includes('upstream_spec_is_draft'));
  const typedData = pins.find(pin => pin.eip_number === 712);
  assert.equal(typedData.source_repository, 'ethereum/EIPs');
  const unpinned = prepared.catalog.candidates.find(candidate => candidate.source_record_id === 'eip:2');
  assert.equal(unpinned.resource.identifier, null); assert.equal(unpinned.state, 'needs_review');
});

test('actual candidate identities are distinct while intellectual-work equivalence remains unclaimed', async () => {
  const catalog = await readCatalog(path.resolve('data/library'));
  assert.equal(catalog.candidates.length, 300); assert.equal(catalog.items.length, 100);
  assert.equal(new Set(catalog.candidates.map(candidate => `${candidate.source_id}:${candidate.source_record_id}`)).size, 300);
  const canonical = catalog.candidates.map(candidate => {
    try { return `${candidate.resource.kind}:${normalizeResource(candidate.resource).canonical_key}`; }
    catch (error) { assert.equal(error.code, 'VERSION_REQUIRED'); return `spec:unversioned:${candidate.source_record_id}`; }
  });
  assert.equal(new Set(canonical).size, 300);
  assert.deepEqual(Object.fromEntries(['spec', 'paper', 'article', 'book', 'video'].map(kind => [kind, catalog.candidates.filter(candidate => candidate.resource.kind === kind).length])), { spec: 80, paper: 80, article: 60, book: 40, video: 40 });
  assert.ok(prepared.catalog.item_topics.every(mapping => mapping.review_status === 'pending_review' && mapping.review_event_id === null));
  assert.ok(new Set(prepared.catalog.item_topics.map(mapping => mapping.existing_topic_slug)).size >= 5);
});

test('metadata rights are field-limited and draft-only; external text, assets and simulated approvals are absent', () => {
  for (const source of prepared.catalog.sources) {
    assert.equal(source.store_raw_allowed, false); assert.equal(source.show_excerpt_allowed, false); assert.equal(source.fetch_allowed, false);
    assert.equal(source.allowed_fields.store.includes('asset_url'), false);
    if (source.source_kind !== 'owned') for (const field of ['description', 'editorial_body', 'recommendation_reasons', 'rationale_locales', 'evidence_excerpt']) assert.equal(source.allowed_fields.store.includes(field), false);
  }
  assert.equal(prepared.catalog.sources.find(source => source.id === 'youtube_api_enrichment').status, 'disabled');
  assert.ok(prepared.catalog.review_log.every(event => event.entity_type === 'source' && event.reviewer_id === 'codex-library-m1-real-sources'));
  assert.equal(prepared.catalog.item_locales.length, 0); assert.equal(prepared.catalog.editorial_selections.length, 0);
  for (const item of prepared.catalog.items) {
    assert.equal(item.status, 'draft'); assert.equal(item.published_at, null);
    assert.ok(['metadata_valid', 'rights_checked', 'evidence_checked'].every(key => !item.checks[key].passed && item.checks[key].review_event_id === null));
  }
  assert.deepEqual(prepared.validation.eligibleItemIds, []);
});

test('finite seed defaults to offline dry-run and rejects forbidden source fields before any write', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'library-seed-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.cp('data/library/metadata', path.join(root, 'metadata'), { recursive: true });
  await fs.copyFile('data/library/seed-plan.json', path.join(root, 'seed-plan.json'));
  const initial = emptyCatalog();
  for (const [key, file] of Object.entries(CATALOG_FILES)) await fs.writeFile(path.join(root, file), file.endsWith('.jsonl') ? '' : canonicalJson(initial[key]) + '\n');
  const original = globalThis.fetch; globalThis.fetch = () => { throw Error('No network in finite seeding'); };
  try {
    const dry = await seedSources({ directory: root });
    assert.equal(dry.dry_run, true); assert.equal(dry.counts.items, 100);
    assert.equal((await readCatalog(root)).sources.length, 0);
    assert.equal((await fs.readdir(root)).includes('.library.lock'), false);
    const file = path.join(root, 'metadata', 'crossref-books.json');
    const bad = JSON.parse(await fs.readFile(file)); bad.records[0].abstract = 'Unlicensed abstract must never be persisted by the consumer';
    await fs.writeFile(file, JSON.stringify(bad));
    await assert.rejects(seedSources({ directory: root, write: true }), { code: 'SEED_METADATA_INVALID' });
    assert.equal((await readCatalog(root)).candidates.length, 0);
  } finally { globalThis.fetch = original; }
});
