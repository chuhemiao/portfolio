import { SCHEMA_VERSION, catalogSchema, emptyCatalog, entityKey, reviewContentHash, reviewEventHash } from '../contract.mjs';

// Synthetic contract fixtures only. These records never enter data/library or public/.
export const FIXTURE_ONLY = true;
export const FIXTURE_TIME = '2026-11-02T10:00:00Z';
export const FIXTURE_AS_OF = '2026-11-02T12:00:00Z';
export const FIXTURE_ITEM_ID = `lib_${'1'.repeat(32)}`;
const versioned = { schema_version: SCHEMA_VERSION, revision: 1 };
const reviewer = 'fixture-not-a-human';
const fields = catalogSchema.$defs.rights_field.enum;

export function fixtureSource({ approved = false } = {}) {
  return {
    ...versioned, id: 'fixture_owned', hostname: 'example.org', source_kind: 'owned', acquisition_method: 'manual_json',
    policy_version: 'fixture-policy-v1', status: approved ? 'approved' : 'pending', license_identifier: null, license_url: null,
    approval_basis_url: 'https://example.org/fixture-policy', attribution_required: false, attribution_text: null,
    fetch_allowed: false, store_raw_allowed: false, show_excerpt_allowed: false, derivative_analysis_allowed: true,
    allowed_fields: Object.fromEntries(['fetch', 'store', 'display', 'derive', 'public_git', 'public_snapshot'].map(key => [key, key === 'fetch' ? [] : [...fields]])),
    retention_mode: 'permanent', retention_days: null, requires_refresh: false, refresh_interval_days: null,
    deletion_required: false, public_history_allowed: true,
    approved_by: approved ? reviewer : null, approved_at: approved ? FIXTURE_TIME : null,
    last_legal_review_at: approved ? FIXTURE_TIME : null, review_due_at: approved ? '2027-01-01T00:00:00Z' : null,
    review_event_id: null, policy_scope: 'Synthetic fixture policy, not a real authorization.', review_notes: 'Fixture only; no person or source approval is claimed.',
  };
}

export function fixtureProvenance(fieldNames) {
  return Object.fromEntries(fieldNames.map(field => [field, {
    origin_source_id: 'fixture_owned', source_record_id: 'fixture_record_1', source_url: 'https://example.org/fixture-resource',
    rights_policy_version: 'fixture-policy-v1', observed_at: FIXTURE_TIME, fetched_at: null, expires_at: null,
  }]));
}

export function fixtureItem() {
  return {
    ...versioned, id: FIXTURE_ITEM_ID, slug: 'synthetic-fixture-11111111', kind: 'spec', canonical_key: 'web:https://example.org/fixture-resource',
    canonical_url: 'https://example.org/fixture-resource',
    identifiers: Object.fromEntries(['youtube_id', 'doi', 'arxiv_id', 'arxiv_version', 'isbn13', 'openlibrary_work', 'eip_number', 'version'].map(key => [key, null])),
    original_title: 'Synthetic fixture resource', creators: ['Fixture Creator'], original_language: 'en', original_published_at: null, date_precision: 'unknown',
    source_id: 'fixture_owned', rights_policy_version: 'fixture-policy-v1',
    field_provenance: fixtureProvenance(['kind', 'canonical_key', 'canonical_url', 'original_title', 'creators', 'original_language', 'date_precision', 'availability', 'level']),
    status: 'draft', rights_status: 'pending', validity_status: 'unknown', availability: 'unknown', last_checked_at: null,
    level: 'unknown', detail_enabled: false,
    checks: { metadata_valid: { passed: false, review_event_id: null }, rights_checked: { passed: false, review_event_id: null }, evidence_checked: { passed: false, review_event_id: null }, content_status: 'needs_review' },
    created_at: FIXTURE_TIME, updated_at: FIXTURE_TIME, published_at: null, expires_at: null,
  };
}

export function appendFixtureReview(catalog, type, record, { action = 'approve', state = 'approved', identity = {} } = {}) {
  const event = {
    schema_version: SCHEMA_VERSION, event_id: `fixture_review_${catalog.review_log.length + 1}`, entity_type: type,
    entity_id: entityKey(type, record, identity), action, from_state: null, to_state: state,
    expected_revision: 0, next_revision: type === 'reason' ? record.source_revision : record.revision,
    subject_hash: reviewContentHash(type, record, identity), redacted_diff: [], reason: 'Synthetic test approval, not a human review.',
    reviewer_id: reviewer, created_at: FIXTURE_TIME, previous_event_hash: catalog.review_log.at(-1)?.event_hash ?? null,
    event_hash: '0'.repeat(64),
  };
  event.event_hash = reviewEventHash(event);
  catalog.review_log.push(event);
  return event.event_id;
}

export function draftFixture() {
  const catalog = emptyCatalog();
  catalog.sources.push(fixtureSource()); catalog.items.push(fixtureItem());
  return { catalog, options: { asOf: FIXTURE_AS_OF, publicGit: false, context: { topic_slugs: ['l1-l2'], articles: [{ slug: 'fixture-article', translation_key: 'fixture-group' }], project_slugs: ['fixture-project'] } } };
}

export function publishedFixture({ basis = 'editorial_selection' } = {}) {
  const fixture = draftFixture();
  const { catalog } = fixture;
  const source = fixtureSource({ approved: true });
  catalog.sources[0] = source;
  source.review_event_id = appendFixtureReview(catalog, 'source', source, { action: 'approve_rights' });
  const item = catalog.items[0];
  item.status = 'published'; item.rights_status = 'approved'; item.detail_enabled = true; item.published_at = FIXTURE_TIME;
  item.checks.content_status = 'approved';
  for (const key of ['metadata_valid', 'rights_checked', 'evidence_checked']) item.checks[key] = { passed: true, review_event_id: appendFixtureReview(catalog, 'item', item, { action: key === 'rights_checked' ? 'approve_rights' : 'approve', state: key === 'rights_checked' ? 'approved' : key }) };
  appendFixtureReview(catalog, 'item', item, { action: 'publish', state: 'published' });
  const sourceFields = { source_id: source.id, rights_policy_version: source.policy_version };
  let basisId;
  if (basis === 'editorial_selection') {
    const selection = { ...versioned, id: 'fixture_selection_1', item_id: item.id, reviewer_id: reviewer, rationale_locales: { 'zh-CN': '仅测试使用的合成说明。', en: 'A synthetic explanation for tests only.', ja: 'テスト専用の合成説明。' }, selected_at: FIXTURE_TIME, review_event_id: null, ...sourceFields, field_provenance: fixtureProvenance(['rationale_locales']) };
    selection.review_event_id = appendFixtureReview(catalog, 'editorial_selection', selection);
    catalog.editorial_selections.push(selection); basisId = selection.id;
  } else {
    const evidence = { ...versioned, id: 'fixture_evidence_1', item_id: item.id, ...sourceFields, field_provenance: fixtureProvenance(['source_record_id', 'source_url', 'evidence_kind', 'observed_at']), source_record_id: 'fixture_record_1', source_url: 'https://example.org/fixture-evidence', origin_locator: null, actor_cluster_ref: null, evidence_kind: 'recommendation', observed_at: FIXTURE_TIME, confidence: null, review_status: 'verified', evidence_excerpt: null, extractor_version: 'manual-fixture-v1', model_id: null, prompt_version: null, run_id: null, input_hash: null, expires_at: null, review_event_id: null };
    evidence.review_event_id = appendFixtureReview(catalog, 'evidence', evidence, { state: 'verified' });
    catalog.evidence.push(evidence); basisId = evidence.id;
  }
  for (const [locale, title, text] of [['zh-CN', '虚构测试资源', '仅用于验证数据契约。'], ['en', 'Synthetic test resource', 'Only for validating the contract.'], ['ja', '架空のテスト資料', 'データ契約の検証専用です。']]) {
    const reason = { id: 'fixture_reason_1', text, basis_type: basis, evidence_ids: basis === 'evidence' ? [basisId] : [], editorial_selection_id: basis === 'editorial_selection' ? basisId : null, basis_revisions: { [basisId]: 1 }, source_revision: 1, review_event_id: null };
    reason.review_event_id = appendFixtureReview(catalog, 'reason', reason, { state: 'reviewed', identity: { itemId: item.id, locale } });
    const local = { ...versioned, item_id: item.id, locale, title, description: text, editorial_body: text, recommendation_reasons: [reason], summary_language: locale, abstract_status: 'reviewed', model_version: null, reviewed_at: FIXTURE_TIME, review_event_id: null, source_revision: 1, ...sourceFields, field_provenance: fixtureProvenance(['title', 'description', 'editorial_body', 'recommendation_reasons']) };
    local.review_event_id = appendFixtureReview(catalog, 'item_locale', local, { state: 'reviewed' });
    catalog.item_locales.push(local);
  }
  fixture.options.publicGit = true;
  return fixture;
}
