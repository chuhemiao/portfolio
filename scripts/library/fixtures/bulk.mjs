import { emptyCatalog, entityKey, reviewContentHash, reviewEventHash } from '../contract.mjs';
import { publishedFixture } from './catalog.mjs';

// Synthetic workload only; never a seed generator or a source of real approvals.
export function bulkPublishedFixture(count = 300) {
  if (!Number.isInteger(count) || count < 1 || count > 1000) throw new Error('Fixture count must be 1–1000.');
  const first = publishedFixture();
  const catalog = emptyCatalog();
  catalog.sources = structuredClone(first.catalog.sources);
  catalog.review_log.push(structuredClone(first.catalog.review_log[0]));
  for (let index = 0; index < count; index++) {
    const fixture = publishedFixture();
    const originalId = fixture.catalog.items[0].id;
    const id = `lib_${(index + 1).toString(16).padStart(32, '0')}`;
    const change = value => typeof value === 'string' ? value.replaceAll(originalId, id).replaceAll('fixture_selection_1', `fixture_selection_${index + 1}`).replace(/^fixture_review_(\d+)$/, `bulk_review_${index + 1}_$1`) : value;
    const walk = value => Array.isArray(value) ? value.map(walk) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, child]) => [change(key), walk(child)])) : change(value);
    for (const [key, records] of Object.entries(fixture.catalog)) {
      if (['schema_version', 'sources'].includes(key)) continue;
      catalog[key].push(...records.filter(record => key !== 'review_log' || record.entity_type !== 'source').map(walk));
    }
    const item = catalog.items.at(-1);
    item.slug = `synthetic-resource-${index + 1}-${id.slice(-8)}`;
    item.canonical_url = `https://example.org/synthetic-${index + 1}`;
    item.canonical_key = `web:${item.canonical_url}`;
  }
  const subjects = new Map();
  for (const [collection, type] of Object.entries({ sources: 'source', items: 'item', item_locales: 'item_locale', evidence: 'evidence', editorial_selections: 'editorial_selection', item_topics: 'item_topic', item_relations: 'item_relation', scores: 'score' })) for (const record of catalog[collection]) subjects.set(`${type}:${entityKey(type, record)}`, { type, record, identity: {} });
  for (const local of catalog.item_locales) for (const reason of local.recommendation_reasons) {
    const identity = { itemId: local.item_id, locale: local.locale };
    subjects.set(`reason:${entityKey('reason', reason, identity)}`, { type: 'reason', record: reason, identity });
  }
  let previous = null;
  for (const event of catalog.review_log) {
    const subject = subjects.get(`${event.entity_type}:${event.entity_id}`);
    event.subject_hash = reviewContentHash(subject.type, subject.record, subject.identity);
    event.previous_event_hash = previous; event.event_hash = reviewEventHash(event); previous = event.event_hash;
  }
  return { catalog, options: first.options };
}
