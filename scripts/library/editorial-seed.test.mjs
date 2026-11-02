import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { canonicalJson, readCatalog, validateCatalog, reviewContentHash, reviewEventHash } from './contract.mjs';
import { loadReferenceContext } from './validate.mjs';
import { buildSnapshot, readSnapshot } from './snapshot.mjs';

const catalog = await readCatalog(path.resolve('data/library'));
const context = await loadReferenceContext(process.cwd(), catalog);
const asOf = catalog.review_log.at(-1).created_at;
const baseline = JSON.parse(await fs.readFile('docs/library/reviews/2026-11-02-editorial/metadata-baseline.json', 'utf8'));
const selected = JSON.parse(await fs.readFile('data/library/seed-selection.json', 'utf8')).selection;
const locales = id => catalog.item_locales.filter(row => row.item_id === id);
const itemByTitle = title => catalog.items.find(item => item.original_title === title);

test('editorial publication preserves every original identity, metadata value and field origin', () => {
  const metadata = catalog.items.map(item => Object.fromEntries(Object.entries(item).filter(([key]) => !baseline.excluded_workflow_fields.includes(key))));
  assert.equal(canonicalJson(metadata), canonicalJson(baseline.items));
  assert.deepEqual(new Set(catalog.items.map(item => item.id)), new Set(selected.map(item => item.item_id)));
  const book = itemByTitle('Mastering Ethereum, 2nd Edition');
  assert.equal(book.identifiers.isbn13, '9781098168414');
  assert.equal(book.creators.length, 5);
  assert.equal(book.original_published_at, '2025-10-01');
  assert.equal(book.date_precision, 'month');
  assert.equal(book.original_language, 'en');
  for (const local of locales(book.id)) {
    assert.ok(local.editorial_body.includes('9781098168414'));
    assert.ok(local.editorial_body.includes('2025-10'));
    for (const creator of book.creators) assert.ok(local.editorial_body.includes(creator));
  }
  assert.equal(itemByTitle('Understanding Bitcoin').identifiers.isbn13, '9781119019169');
});

test('course dates and unknown original languages are not manufactured by translation', () => {
  for (const item of catalog.items.filter(row => row.kind === 'video')) {
    assert.equal(item.original_published_at, null);
    assert.equal(item.date_precision, 'unknown');
    assert.equal(item.original_language, 'und');
    assert.deepEqual(item.creators, []);
    for (const local of locales(item.id)) assert.match(local.editorial_body, /2018/);
  }
  for (const item of catalog.items.filter(row => row.original_language === 'und')) assert.equal(baseline.items.find(row => row.id === item.id).original_language, 'und');
  const flash = itemByTitle('Flash Boys 2.0: Frontrunning, Transaction Reordering, and Consensus Instability in Decentralized Exchanges');
  for (const local of locales(flash.id)) {
    assert.ok(local.editorial_body.includes('1904.05234v1'));
    assert.ok(!local.editorial_body.includes('1904.052341'));
    assert.ok(local.editorial_body.includes('2019-04-10'));
  }
});

test('specification notes retain pins, Draft status and explicit security boundaries', () => {
  for (const item of catalog.items.filter(row => row.kind === 'spec')) {
    assert.equal(item.original_published_at, null);
    for (const local of locales(item.id)) {
      assert.ok(local.editorial_body.includes('spec_text'));
      assert.ok(local.editorial_body.includes(item.identifiers.version));
      assert.match(local.editorial_body, /github\.com\/ethereum\/(?:EIPs|ERCs)\/blob\//);
    }
  }
  const draft = catalog.items.find(row => row.identifiers.eip_number === '8004');
  for (const local of locales(draft.id)) assert.match(local.title + local.editorial_body, /Draft/);
  const japaneseDraft = locales(draft.id).find(row => row.locale === 'ja').editorial_body;
  assert.ok(japaneseDraft.includes('顧客からのフィードバックに基づく評判'));
  assert.ok(!japaneseDraft.includes('顧客の評判情報'));
  const typed = catalog.items.find(row => row.identifiers.eip_number === '712');
  assert.match(locales(typed.id).find(row => row.locale === 'zh-CN').editorial_body, /本身不包含重放保护/);
  assert.match(locales(typed.id).find(row => row.locale === 'en').editorial_body, /does not provide replay protection/);
  assert.match(locales(typed.id).find(row => row.locale === 'ja').editorial_body, /リプレイ防止を含まない/);
  const delegation = catalog.items.find(row => row.identifiers.eip_number === '7702');
  for (const local of locales(delegation.id)) assert.ok(local.editorial_body.includes('0xef0100') && local.editorial_body.includes('0x04') && local.editorial_body.includes('nonce'));
  assert.match(locales(delegation.id).find(row => row.locale === 'en').editorial_body, /not rolled back if that later execution fails/);
});

test('metadata-only notes disclose unread material and do not grant rights or peer-review status', () => {
  for (const item of catalog.items.filter(row => row.kind !== 'spec')) {
    const group = locales(item.id);
    for (const local of group) assert.ok(local.editorial_body.includes('metadata_only'));
    const english = group.find(row => row.locale === 'en').editorial_body;
    if (item.kind === 'paper') {
      assert.match(english, /not the abstract or paper/);
      assert.match(english, /neither peer review/);
      assert.match(english, /not permission to reproduce/);
    } else if (item.kind === 'book') {
      assert.match(english, /not the description, contents or full book/);
      assert.match(english, /no rights to book text or covers/);
    } else if (item.kind === 'article') {
      assert.match(english, /not article text or images/);
      assert.match(english, /not current status/);
    } else {
      assert.match(english, /video and captions were not reviewed/);
      assert.match(english, /individual presenters were not verified/);
    }
  }
  const cryptography = itemByTitle('Session 3: Blockchain Basics & Cryptography');
  const japanese = locales(cryptography.id).find(row => row.locale === 'ja').editorial_body;
  assert.ok(japanese.includes('理解したい暗号プリミティブとその用途'));
  assert.ok(!japanese.includes('理解したい原語と用途'));
});

test('complete trilingual editorial content shares a same-item selection basis without endorsements', () => {
  const result = validateCatalog(catalog, { context, asOf });
  assert.deepEqual(result.errors, []);
  assert.equal(result.eligibleItemIds.length, 100);
  assert.deepEqual(result.communityRecommendedItemIds, []);
  for (const item of catalog.items) {
    const group = locales(item.id);
    assert.deepEqual(group.map(row => row.locale).sort(), ['en', 'ja', 'zh-CN']);
    assert.equal(new Set(group.map(row => row.editorial_body)).size, 3);
    for (const local of group) {
      assert.equal(local.source_revision, item.revision);
      assert.equal(local.editorial_body.split('\n\n').length, 3);
      assert.ok(local.editorial_body.length > 200);
      assert.equal(local.source_id, 'kkdemian_original_editorial');
      assert.equal(local.abstract_status, 'reviewed');
      for (const reason of local.recommendation_reasons) {
        assert.equal(reason.basis_type, 'editorial_selection');
        assert.deepEqual(reason.evidence_ids, []);
        const basis = catalog.editorial_selections.find(row => row.id === reason.editorial_selection_id);
        assert.equal(basis.item_id, item.id);
        assert.equal(reason.basis_revisions[basis.id], basis.revision);
      }
    }
    const signature = row => canonicalJson(row.recommendation_reasons.map(({ id, basis_type, evidence_ids, editorial_selection_id, basis_revisions, source_revision }) => ({ id, basis_type, evidence_ids, editorial_selection_id, basis_revisions, source_revision })));
    assert.equal(new Set(group.map(signature)).size, 1);
  }
});

test('actual agent review attribution and rejected overbroad mappings remain visible', () => {
  assert.deepEqual(new Set(catalog.review_log.map(event => event.reviewer_id)), new Set(['codex-library-m1-real-sources', 'codex-library-m1-trilingual-editorial']));
  let previous = null;
  for (const event of catalog.review_log) {
    assert.equal(event.previous_event_hash, previous);
    assert.equal(event.event_hash, reviewEventHash(event));
    assert.doesNotMatch(event.reason, /Synthetic test approval|human-approved|human reviewer approved|community voted/i);
    previous = event.event_hash;
  }
  assert.equal(catalog.evidence.length, 0);
  const topicSet = new Set(catalog.item_topics.filter(row => row.review_status === 'approved').map(row => row.existing_topic_slug));
  assert.deepEqual([...topicSet].sort(), ['ai-crypto', 'l1-l2', 'rwa', 'stablecoin', 'yield']);
  assert.ok(catalog.item_topics.filter(row => ['perp-dex', 'tokenized-equities', 'cex', 'market-structure'].includes(row.existing_topic_slug)).every(row => row.review_status === 'rejected' && row.review_event_id));
});

test('content edits or reason-basis substitution invalidate actual current approvals', () => {
  const edited = structuredClone(catalog);
  edited.item_locales[0].editorial_body += '\nAn unreviewed claim.';
  assert.notEqual(reviewContentHash('item_locale', edited.item_locales[0]), reviewContentHash('item_locale', catalog.item_locales[0]));
  const invalid = validateCatalog(edited, { context, asOf });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.some(issue => issue.code === 'REVIEW_REQUIRED'));
  assert.deepEqual(invalid.eligibleItemIds, []);
  const substituted = structuredClone(catalog);
  substituted.item_locales[0].recommendation_reasons[0].editorial_selection_id = catalog.editorial_selections.find(row => row.item_id !== substituted.item_locales[0].item_id).id;
  assert.ok(validateCatalog(substituted, { context, asOf }).errors.some(issue => issue.code === 'REASON_BASIS_INVALID'));
});

test('real approved data reaches an independent snapshot consumer without internal review fields', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'library-real-editorial-test-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const built = await buildSnapshot({ catalog, context, directory, asOf });
  assert.equal(built.item_count, 100);
  const snapshot = await readSnapshot(directory, { currentCatalog: catalog, context, asOf });
  assert.equal(snapshot.items.length, 100);
  assert.deepEqual(snapshot.rankings.sorts['recently-recommended'], []);
  const forbidden = new Set(['reviewer_id', 'review_event_id', 'review_log', 'subject_hash', 'event_hash', 'actor_cluster_ref', 'field_provenance', 'input_hash', 'raw', 'model_version']);
  function publicFields(value) {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) { assert.equal(forbidden.has(key), false, key); publicFields(child); }
  }
  publicFields(snapshot.items); publicFields(snapshot.details);
  for (const item of snapshot.items) {
    assert.ok(item.detail_enabled);
    assert.equal(item.evidence.length, 0);
    for (const local of Object.values(item.locales)) assert.equal(local.machine_assisted, true);
  }
  assert.ok(snapshot.items.filter(row => row.kind === 'video').every(row => row.attributions.some(attribution => attribution.hostname === 'ocw.mit.edu')));
});
