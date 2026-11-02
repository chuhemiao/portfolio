import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishedFixture, FIXTURE_AS_OF } from './fixtures/catalog.mjs';
import { hashJson, validateCatalog } from './contract.mjs';
import { inspectReview, planReview } from './review.mjs';

function manualEvidence({ kind = 'citation', model = false } = {}) {
  const fixture = publishedFixture(); fixture.catalog.items[0].status = 'draft'; fixture.catalog.items[0].published_at = null;
  const evidence = structuredClone(publishedFixture({ basis: 'evidence' }).catalog.evidence[0]);
  evidence.evidence_kind = kind; evidence.review_status = 'needs_review'; evidence.review_event_id = null;
  if (model) Object.assign(evidence, { model_id: 'synthetic-agent-draft', prompt_version: 'fixture-v1', run_id: 'fixture-run', input_hash: 'a'.repeat(64) });
  fixture.catalog.evidence.push(evidence);
  assert.equal(validateCatalog(fixture.catalog, fixture.options).valid, true);
  const inspected = inspectReview(fixture.catalog, 'evidence', evidence.id);
  const command = { schema_version: 'library-review-command/v1', id: 'manual_evidence', actor: 'fixture_editor', role: 'editor', action: 'approve', entity_type: 'evidence', entity_id: evidence.id, expected_revision: inspected.revision, expected_content_hash: inspected.content_hash, expected_catalog_hash: hashJson(fixture.catalog), reason: 'Explicit synthetic manual record review; not automatic extraction.', as_of: FIXTURE_AS_OF, verification_scope: 'metadata_only' };
  return { ...fixture, evidence, command };
}

test('explicit manual citation review preserves metadata-only scope and never publishes an item', () => {
  const f = manualEvidence(); const result = planReview(f.catalog, f.command, f.options.context);
  assert.equal(result.catalog.evidence[0].review_status, 'verified');
  assert.deepEqual(validateCatalog(result.catalog, f.options).eligibleItemIds, []);
  assert.match(result.catalog.review_log.at(-1).reason, /scope:metadata_only/);
});

test('a provenance-complete agent draft still requires and permits explicit manual verification', () => {
  const f = manualEvidence({ model: true });
  const result = planReview(f.catalog, f.command, f.options.context);
  assert.equal(result.catalog.evidence[0].review_status, 'verified');
  assert.equal(result.catalog.evidence[0].model_id, 'synthetic-agent-draft');
  assert.deepEqual(validateCatalog(result.catalog, f.options).communityRecommendedItemIds, []);
});

test('metadata-only and owned material cannot manufacture external recommendation verification', () => {
  for (const scope of ['metadata_only', 'source_text']) {
    const f = manualEvidence({ kind: 'recommendation' });
    assert.throws(() => planReview(f.catalog, { ...f.command, verification_scope: scope }, f.options.context), { code: 'UNVERIFIED_EVIDENCE' });
  }
});

test('a missing verification scope and unlicensed evidence expression remain rejected', () => {
  const f = manualEvidence(); const missing = { ...f.command }; delete missing.verification_scope;
  assert.throws(() => planReview(f.catalog, missing, f.options.context), { code: 'VERIFICATION_SCOPE_REQUIRED' });
  f.catalog.sources[0].show_excerpt_allowed = false;
  f.evidence.evidence_excerpt = 'This expression has no approved storage permission.';
  f.command.expected_catalog_hash = hashJson(f.catalog);
  f.command.expected_content_hash = inspectReview(f.catalog, 'evidence', f.evidence.id).content_hash;
  assert.throws(() => planReview(f.catalog, f.command, f.options.context), { code: 'REVIEW_VALIDATION_FAILED' });
});
