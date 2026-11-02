import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { SCHEMA_VERSION, LOCALES, CATALOG_FILES, canonicalJson, hashJson, validateCatalog, validateRecord, entityKey, parseJsonStrict, reviewContentHash, reviewEventHash, LibraryValidationError } from './contract.mjs';
import { normalizeResource, publicHttpsUrl, resolveLibraryIdentity } from './normalize.mjs';
import { directoryPath, regularFile, writeAtomic, withDirectoryLock } from './files.mjs';

export const RANK_VERSION = 'editorial-v1';
const OWNER = 'kkdemian-library-v1';
const schemaUrl = new URL('../../data/library/schemas/public-snapshot.schema.json', import.meta.url);
const schema = JSON.parse(await fs.readFile(schemaUrl, 'utf8'));
const ajv = new Ajv2020({ strict: true, allErrors: true, coerceTypes: false });
addFormats(ajv); ajv.addFormat('library-public-url', value => { try { publicHttpsUrl(value); return true; } catch { return false; } });
ajv.addSchema(schema);
const validators = new Map();
const fail = (code, message, issues = []) => { throw new LibraryValidationError(code, message, issues); };
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
export function validatePublicRecord(type, value) {
  if (!schema.$defs[type]) fail('UNKNOWN_PUBLIC_TYPE', 'Unknown public Library record type.');
  if (!validators.has(type)) validators.set(type, ajv.getSchema(`${schema.$id}#/$defs/${type}`));
  const valid = validators.get(type);
  if (!valid(value)) fail('PUBLIC_SCHEMA_INVALID', 'Public Library output does not match its Schema.', valid.errors);
  return value;
}
function fileType(name) {
  return ['items', 'rankings', 'facets', 'relations', 'aliases'].includes(name.replace(/\.json$/, '')) ? name.replace(/\.json$/, '') : /^topic-[a-z0-9-]+\.json$/.test(name) ? 'topic' : /^detail-lib_[a-f0-9]{32}\.json$/.test(name) ? 'detail' : fail('INVALID_SNAPSHOT_FILE', 'Snapshot filenames must belong to the Library contract.');
}
function count(name, data) {
  if (Array.isArray(data)) return data.length;
  if (name === 'aliases.json') return Object.keys(data).length;
  if (name.startsWith('topic-')) return data.item_ids.length;
  return name.startsWith('detail-') ? 1 : name === 'rankings.json' ? data.sorts.best.length : Object.keys(data.kinds).reduce((sum, key) => sum + data.kinds[key], 0);
}
function orderedCatalog(catalog) {
  const types = { sources: 'source', candidates: 'candidate', items: 'item', item_locales: 'item_locale', evidence: 'evidence', item_topics: 'item_topic', item_relations: 'item_relation', editorial_selections: 'editorial_selection', scores: 'score' };
  return { schema_version: SCHEMA_VERSION, ...Object.fromEntries(Object.keys(CATALOG_FILES).map(key => [key, types[key] ? [...catalog[key]].sort((a, b) => compare(entityKey(types[key], a), entityKey(types[key], b))) : catalog[key]])) };
}
function orderedContext(context) {
  return { topic_slugs: [...context.topic_slugs].sort(), articles: [...context.articles].sort((a, b) => compare(a.slug, b.slug)), project_slugs: [...context.project_slugs].sort() };
}
export function snapshotInputHash(catalog, context) { return hashJson({ catalog: orderedCatalog(catalog), context: orderedContext(context) }); }
function snapshotIdentity({ schema_version, input_hash, code_version, as_of, rank_version }, payloads) {
  return `sha256-${hashJson({ schema_version, input_hash, code_version, as_of, rank_version, payloads })}`;
}
export async function generatorVersion() {
  const inputs = ['./snapshot.mjs', './contract.mjs', './normalize.mjs', './files.mjs', '../../src/lib/library/normalize.ts', '../../src/lib/library/types.ts', '../../data/library/schemas/catalog.schema.json', '../../data/library/schemas/public-snapshot.schema.json', '../../pnpm-lock.yaml'];
  const hashes = [];
  for (const name of inputs) hashes.push([name, digest(await fs.readFile(new URL(name, import.meta.url)))]);
  return `library-index-v1-${hashJson({ inputs: hashes, node: process.version })}`;
}
function identifiersFor(item) {
  const id = item.identifiers;
  return id.youtube_id ? `youtube:${id.youtube_id}` : id.doi ? `doi:${id.doi}` : id.openlibrary_work ?? id.isbn13 ?? (id.arxiv_id ? `arxiv:${id.arxiv_id}${id.arxiv_version ? `v${id.arxiv_version.replace(/^v/, '')}` : ''}` : id.eip_number && id.version ? `eip:ethereum:${id.eip_number}:${id.version}` : null);
}
function publicPayloads(catalog, result) {
  const sources = new Map(catalog.sources.map(source => [source.id, source]));
  const eligible = new Set(result.eligibleItemIds);
  const publicItems = catalog.items.filter(item => eligible.has(item.id)).sort((a, b) => compare(a.id, b.id)).map(item => {
    const identity = normalizeResource({ kind: item.kind, url: item.canonical_url, identifier: identifiersFor(item), version: item.identifiers.version });
    if (identity.canonical_key !== item.canonical_key || identity.canonical_url !== item.canonical_url) fail('CANONICAL_MISMATCH', 'Published resource identity must be explicitly normalized and reviewed.');
    const evidence = catalog.evidence.filter(record => record.item_id === item.id && record.review_status === 'verified').sort((a, b) => compare(a.id, b.id));
    const selections = catalog.editorial_selections.filter(record => record.item_id === item.id && record.review_event_id !== null).sort((a, b) => compare(a.id, b.id));
    const locals = catalog.item_locales.filter(record => record.item_id === item.id);
    const origins = new Set([item.source_id, ...[item, ...locals, ...evidence, ...selections].flatMap(record => Object.values(record.field_provenance).map(origin => origin.origin_source_id))]);
    return {
      id: item.id, slug: item.slug, kind: item.kind, canonical_key: item.canonical_key, canonical_url: item.canonical_url,
      original_title: item.original_title, creators: [...item.creators], original_language: item.original_language,
      original_published_at: item.original_published_at, date_precision: item.date_precision,
      validity_status: item.validity_status, availability: item.availability, level: item.level, detail_enabled: item.detail_enabled,
      locales: Object.fromEntries(LOCALES.map(locale => {
        const local = locals.find(record => record.locale === locale);
        return [locale, { title: local.title, description: local.description, reasons: local.recommendation_reasons.map(reason => ({ id: reason.id, text: reason.text, basis_type: reason.basis_type, evidence_ids: [...reason.evidence_ids].sort(), editorial_selection_id: reason.editorial_selection_id })), machine_assisted: local.model_version !== null, reviewed_at: local.reviewed_at }];
      })),
      topic_slugs: catalog.item_topics.filter(record => record.item_id === item.id && record.review_status === 'approved').map(record => record.existing_topic_slug).sort(),
      source_hostname: sources.get(item.source_id).hostname,
      attributions: [...origins].sort().map(id => sources.get(id)).filter(source => source.attribution_required).map(source => ({ hostname: source.hostname, license_identifier: source.license_identifier, license_url: source.license_url, text: source.attribution_text })),
      evidence: evidence.map(record => ({ id: record.id, kind: record.evidence_kind, source_url: record.source_url, source_hostname: sources.get(record.source_id).hostname, observed_at: record.observed_at, excerpt: record.evidence_excerpt })),
      editorial_selections: selections.map(record => ({ id: record.id, selected_at: record.selected_at, rationale_locales: { ...record.rationale_locales } })),
      updated_at: item.updated_at, published_at: item.published_at,
    };
  });
  const editorialOrder = [...publicItems].sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at) || compare(a.id, b.id));
  const lastRecommendation = item => Math.max(...item.evidence.filter(record => record.kind === 'recommendation').map(record => Date.parse(record.observed_at)));
  const recent = publicItems.filter(item => result.communityRecommendedItemIds.includes(item.id)).sort((a, b) => lastRecommendation(b) - lastRecommendation(a) || compare(a.id, b.id));
  const payloads = {
    'items.json': publicItems,
    'rankings.json': { rank_version: RANK_VERSION, basis: 'editorial-order; no quality probability', sorts: { best: editorialOrder.map(item => item.id), evergreen: editorialOrder.map(item => item.id), 'recently-recommended': recent.map(item => item.id), 'recently-published': [...publicItems].sort((a, b) => a.original_published_at === null ? b.original_published_at === null ? compare(a.id, b.id) : 1 : b.original_published_at === null ? -1 : compare(b.original_published_at, a.original_published_at) || compare(a.id, b.id)).map(item => item.id) } },
    'facets.json': facetsFor(publicItems),
    'relations.json': catalog.item_relations.filter(record => eligible.has(record.item_id) && record.review_status === 'approved').map(record => ({ item_id: record.item_id, entity_type: record.existing_entity_type, entity_slug: record.existing_entity_slug, article_translation_key: record.article_translation_key, relation_type: record.relation_type })).sort((a, b) => compare(canonicalJson(a), canonicalJson(b))),
    'aliases.json': {},
  };
  for (const topic of Object.keys(payloads['facets.json'].topics)) payloads[`topic-${topic}.json`] = { topic_slug: topic, item_ids: publicItems.filter(item => item.topic_slugs.includes(topic)).map(item => item.id) };
  for (const item of publicItems.filter(record => record.detail_enabled)) payloads[`detail-${item.id}.json`] = { item_id: item.id, locales: Object.fromEntries(LOCALES.map(locale => [locale, { editorial_body: catalog.item_locales.find(record => record.item_id === item.id && record.locale === locale).editorial_body }])) };
  for (const event of catalog.identity_history.filter(record => record.review_event_id !== null)) for (const id of event.from_ids) {
    const resolved = resolveLibraryIdentity(id, catalog.identity_history);
    if (resolved.ids.every(value => eligible.has(value)) && !eligible.has(id)) payloads['aliases.json'][id] = resolved;
  }
  for (const [name, data] of Object.entries(payloads)) validatePublicRecord(fileType(name), data);
  return payloads;
}
export function facetsFor(items) {
  const facets = Object.fromEntries(['kinds', 'topics', 'languages', 'levels', 'years'].map(key => [key, Object.create(null)]));
  const add = (key, value) => { facets[key][value] = (facets[key][value] ?? 0) + 1; };
  for (const item of items) {
    add('kinds', item.kind); add('languages', item.original_language); add('levels', item.level);
    if (item.original_published_at) add('years', item.original_published_at.slice(0, 4));
    for (const slug of item.topic_slugs) add('topics', slug);
  }
  return facets;
}
function validUntil(catalog, eligibleIds) {
  const ids = new Set(eligibleIds); const deadlines = [];
  for (const source of catalog.sources.filter(record => record.status === 'approved')) deadlines.push(source.review_due_at);
  for (const records of [catalog.items, catalog.item_locales, catalog.evidence, catalog.editorial_selections]) for (const record of records.filter(row => ids.has(row.item_id ?? row.id))) {
    if (record.expires_at) deadlines.push(record.expires_at);
    for (const provenance of Object.values(record.field_provenance)) {
      if (provenance.expires_at) deadlines.push(provenance.expires_at);
      const origin = catalog.sources.find(source => source.id === provenance.origin_source_id);
      if (origin?.requires_refresh) deadlines.push(new Date(Date.parse(provenance.fetched_at ?? provenance.observed_at) + origin.refresh_interval_days * 86400000).toISOString());
    }
  }
  return deadlines.length ? new Date(Math.min(...deadlines.filter(Boolean).map(Date.parse))).toISOString() : null;
}
async function ownedOutput(directory, create = true) {
  const root = await directoryPath(directory, { create });
  const marker = path.join(root, '.library-output.json');
  if (await regularFile(marker, { missing: true })) {
    const value = parseJsonStrict(await fs.readFile(marker));
    if (value.owner !== OWNER || value.schema_version !== SCHEMA_VERSION) fail('OUTPUT_NOT_OWNED', 'Output directory belongs to another producer.');
  } else {
    if (!create || (await fs.readdir(root)).length) fail('OUTPUT_NOT_OWNED', 'Refusing to replace a nonempty directory without the Library ownership marker.');
    await writeAtomic(marker, canonicalJson({ owner: OWNER, schema_version: SCHEMA_VERSION }) + '\n');
  }
  return root;
}
async function clearSnapshots(root, keep = null) {
  const snapshots = path.join(root, 'snapshots');
  let names;
  try { await directoryPath(snapshots); names = await fs.readdir(snapshots); } catch (failure) { if (failure.code === 'ENOENT') return; throw failure; }
  for (const name of names) {
    if (!/^sha256-[a-f0-9]{64}$/.test(name)) fail('OUTPUT_NOT_OWNED', 'Unexpected object in the generated snapshot directory.');
    const folder = path.join(snapshots, name);
    await directoryPath(folder);
    if (name !== keep) await fs.rm(folder, { recursive: true });
  }
}
async function suspendUnsafeOutput(directory) {
  try {
    const root = await ownedOutput(directory, false);
    await withDirectoryLock(root, async () => {
      await regularFile(path.join(root, 'manifest.json'), { missing: true });
      await fs.rm(path.join(root, 'manifest.json'), { force: true });
      await clearSnapshots(root);
    });
  } catch (failure) { if (failure.code !== 'ENOENT') throw failure; }
}

function withdrawalSignal(catalog, asOf) {
  const now = Date.parse(asOf);
  const records = key => Array.isArray(catalog?.[key]) ? catalog[key] : [];
  const expired = value => typeof value === 'string' && validateRecord('timestamp', value).valid && Date.parse(value) <= now;
  const referencedSources = new Set(records('items').flatMap(item => [item?.source_id, ...Object.values(item?.field_provenance ?? {}).map(origin => origin?.origin_source_id)]));
  const events = records('review_log');
  let previous = null;
  const latest = new Map();
  for (const event of events) {
    if (!validateRecord('review_event', event).valid) return true;
    if (event.previous_event_hash !== previous || event.event_hash !== reviewEventHash(event)) return true;
    previous = event.event_hash;
    latest.set(`${event.entity_type}:${event.entity_id}`, event);
  }
  if ([...latest.values()].some(event => ['revise', 'reject', 'quarantine', 'archive', 'takedown', 'merge', 'split'].includes(event.action))) return true;
  for (const source of records('sources')) {
    if (source?.status === 'revoked' || (['blocked', 'disabled'].includes(source?.status) && referencedSources.has(source.id)) || (source?.status === 'approved' && expired(source.review_due_at))) return true;
    if (source?.status === 'approved' && validateRecord('source', source).valid) {
      const review = events.find(event => event.event_id === source.review_event_id);
      if (!review || review.subject_hash !== reviewContentHash('source', source)) return true;
    }
  }
  for (const key of ['items', 'item_locales', 'evidence', 'editorial_selections']) {
    if (records(key).some(record => ['takedown', 'quarantined', 'archived'].includes(record?.status) || expired(record?.expires_at))) return true;
  }
  return false;
}

export async function buildSnapshot({ catalog, directory, asOf, context = { topic_slugs: [], articles: [], project_slugs: [] }, publicGit = true, codeVersion } = {}) {
  const started = performance.now();
  if (!directory || !validateRecord('timestamp', asOf).valid) fail('INVALID_ARGUMENT', 'Snapshot generation needs an output directory and explicit UTC asOf.');
  const validation = validateCatalog(catalog, { asOf, context, publicGit });
  if (!validation.valid) {
    const failure = new LibraryValidationError('CATALOG_INVALID', 'Snapshot refused invalid input; policy/audit failures suspend generated output rather than revive old content.', validation.errors);
    if (withdrawalSignal(catalog, asOf) || validation.errors.some(issue => /^(?:SOURCE_|FIELD_RIGHTS_|PUBLIC_HISTORY_|REVIEW_|ITEM_NOT_APPROVED|CHECK_NOT_PASSED|EXCERPT_|RETENTION_|TRILINGUAL_|REASON_|RECOMMENDATION_)/.test(issue.code))) {
      try { await suspendUnsafeOutput(directory); } catch (cleanup) { failure.cleanup_error = cleanup.code; failure.message += ' Generated-output suspension also failed; reconcile it before publishing.'; }
    }
    throw failure;
  }
  const payloads = publicPayloads(catalog, validation);
  const code = codeVersion ?? await generatorVersion();
  if (typeof code !== 'string' || !code.length || code.length > 200) fail('INVALID_ARGUMENT', 'Expected a bounded generator version.');
  const inputHash = snapshotInputHash(catalog, context);
  const id = snapshotIdentity({ schema_version: SCHEMA_VERSION, input_hash: inputHash, code_version: code, as_of: asOf, rank_version: RANK_VERSION }, payloads);
  const fileBytes = new Map(); const files = {};
  for (const name of Object.keys(payloads).sort()) {
    const wrapper = validatePublicRecord(`${fileType(name)}_file`, { schema_version: SCHEMA_VERSION, snapshot_id: id, data: payloads[name] });
    const bytes = Buffer.from(canonicalJson(wrapper) + '\n');
    fileBytes.set(name, bytes); files[name] = { sha256: digest(bytes), bytes: bytes.byteLength, count: count(name, wrapper.data) };
  }
  const prefix = `/data/library/v1/snapshots/${id}/`;
  const manifest = validatePublicRecord('manifest', { schema_version: SCHEMA_VERSION, snapshot_id: id, generated_at: asOf, as_of: asOf, valid_until: validUntil(catalog, validation.eligibleItemIds), rank_version: RANK_VERSION, items_file: prefix + 'items.json', ranking_file: prefix + 'rankings.json', files, checksum: `sha256-${hashJson(files)}`, input_hash: inputHash, code_version: code });
  const root = await ownedOutput(directory);
  await withDirectoryLock(root, async () => {
    const snapshots = await directoryPath(path.join(root, 'snapshots'), { create: true });
    const target = path.join(snapshots, id);
    const existing = await fs.lstat(target).catch(failure => { if (failure.code === 'ENOENT') return null; throw failure; });
    if (existing) {
      await directoryPath(target);
      for (const [name, bytes] of fileBytes) { await regularFile(path.join(target, name)); if (!(await fs.readFile(path.join(target, name))).equals(bytes)) fail('SNAPSHOT_COLLISION', 'An immutable snapshot has different bytes for the same identity.'); }
    } else {
      const staging = await fs.mkdtemp(path.join(snapshots, '.staging-'));
      let primary;
      try { for (const [name, bytes] of fileBytes) await writeAtomic(path.join(staging, name), bytes); await fs.rename(staging, target); }
      catch (failure) { primary = failure; throw failure; }
      finally { try { await fs.rm(staging, { recursive: true, force: true }); } catch (cleanup) { if (primary) primary.cleanup_error = cleanup.code; else throw cleanup; } }
    }
    await writeAtomic(path.join(root, 'manifest.json'), canonicalJson(manifest) + '\n');
    await clearSnapshots(root, id);
  });
  return { manifest, item_count: payloads['items.json'].length, detail_count: Object.keys(payloads).filter(name => name.startsWith('detail-')).length, bytes: [...fileBytes.values()].reduce((sum, bytes) => sum + bytes.byteLength, Buffer.byteLength(canonicalJson(manifest) + '\n')), generation_ms: performance.now() - started };
}

export async function readSnapshot(directory, { asOf = new Date().toISOString(), currentCatalog = null, context = { topic_slugs: [], articles: [], project_slugs: [] }, publicGit = true } = {}) {
  if (!validateRecord('timestamp', asOf).valid) fail('INVALID_ARGUMENT', 'Snapshot reads require a UTC clock.');
  const root = await ownedOutput(directory, false);
  const filename = path.join(root, 'manifest.json'); await regularFile(filename);
  const manifest = validatePublicRecord('manifest', parseJsonStrict(await fs.readFile(filename)));
  if (Date.parse(manifest.as_of) > Date.parse(asOf) || (manifest.valid_until && Date.parse(asOf) >= Date.parse(manifest.valid_until))) fail('SNAPSHOT_EXPIRED', 'Snapshot is from the future or no longer allowed to serve.');
  if (manifest.checksum !== `sha256-${hashJson(manifest.files)}`) fail('SNAPSHOT_CHECKSUM_INVALID', 'Manifest file map checksum does not match.');
  const prefix = `/data/library/v1/snapshots/${manifest.snapshot_id}/`;
  if (manifest.items_file !== prefix + 'items.json' || manifest.ranking_file !== prefix + 'rankings.json') fail('SNAPSHOT_PATH_INVALID', 'Snapshot paths must be bound to one content-addressed version.');
  if (currentCatalog) {
    const current = validateCatalog(currentCatalog, { asOf, context, publicGit });
    if (!current.valid || snapshotInputHash(currentCatalog, context) !== manifest.input_hash) fail('SNAPSHOT_STALE', 'Current source policy, review state or catalog differs; historical snapshots cannot bypass current eligibility.');
  }
  const snapshotRoot = await directoryPath(path.join(root, 'snapshots', manifest.snapshot_id));
  const data = {};
  for (const [name, info] of Object.entries(manifest.files)) {
    const file = path.join(snapshotRoot, name); const stat = await regularFile(file);
    if (stat.size !== info.bytes || stat.size > 16 * 1024 * 1024) fail('SNAPSHOT_CHECKSUM_INVALID', 'Snapshot file size does not match the manifest.');
    const bytes = await fs.readFile(file);
    if (digest(bytes) !== info.sha256) fail('SNAPSHOT_CHECKSUM_INVALID', 'Snapshot content hash does not match.');
    const wrapper = validatePublicRecord(`${fileType(name)}_file`, parseJsonStrict(bytes));
    if (wrapper.snapshot_id !== manifest.snapshot_id) fail('SNAPSHOT_VERSION_MISMATCH', 'Snapshot files cannot be mixed across versions.');
    if (count(name, wrapper.data) !== info.count) fail('SNAPSHOT_COUNT_INVALID', 'Manifest counts do not match data.');
    data[name] = wrapper.data;
  }
  const items = data['items.json']; const ids = new Set(items.map(item => item.id));
  if (ids.size !== items.length || new Set(items.map(item => item.slug)).size !== items.length) fail('SNAPSHOT_REFERENCE_INVALID', 'Public item IDs and slugs must be unique.');
  if (canonicalJson(facetsFor(items)) !== canonicalJson(data['facets.json'])) fail('SNAPSHOT_REFERENCE_INVALID', 'Facets must count only the published set.');
  for (const values of Object.values(data['rankings.json'].sorts)) if (values.some(id => !ids.has(id))) fail('SNAPSHOT_REFERENCE_INVALID', 'Rankings cannot reference missing items.');
  if (data['rankings.json'].sorts.best.length !== ids.size || data['rankings.json'].sorts.evergreen.length !== ids.size || data['rankings.json'].sorts['recently-published'].length !== ids.size) fail('SNAPSHOT_REFERENCE_INVALID', 'Complete rankings must cover the published set.');
  for (const relation of data['relations.json']) if (!ids.has(relation.item_id)) fail('SNAPSHOT_REFERENCE_INVALID', 'Relations cannot reference missing items.');
  for (const alias of Object.values(data['aliases.json'])) if (alias.ids.some(id => !ids.has(id))) fail('SNAPSHOT_REFERENCE_INVALID', 'Aliases cannot restore an unpublished target.');
  for (const item of items) {
    const detail = data[`detail-${item.id}.json`];
    if (Boolean(detail) !== item.detail_enabled || (detail && detail.item_id !== item.id)) fail('SNAPSHOT_REFERENCE_INVALID', 'Curated detail eligibility does not match the item.');
    const signatures = new Set(Object.values(item.locales).map(local => canonicalJson(local.reasons.map(reason => ({ id: reason.id, basis_type: reason.basis_type, evidence_ids: reason.evidence_ids, editorial_selection_id: reason.editorial_selection_id })).sort((a, b) => compare(a.id, b.id)))));
    if (signatures.size !== 1 || new Set(item.evidence.map(record => record.id)).size !== item.evidence.length || new Set(item.editorial_selections.map(record => record.id)).size !== item.editorial_selections.length) fail('SNAPSHOT_REFERENCE_INVALID', 'Trilingual reasons must share one unambiguous basis.');
    for (const local of Object.values(item.locales)) for (const reason of local.reasons) {
      if (reason.basis_type === 'evidence' ? !reason.evidence_ids.length || reason.editorial_selection_id !== null || reason.evidence_ids.some(id => !item.evidence.some(record => record.id === id && record.kind === 'recommendation')) : reason.evidence_ids.length !== 0 || !item.editorial_selections.some(record => record.id === reason.editorial_selection_id)) fail('SNAPSHOT_REFERENCE_INVALID', 'Each reason must resolve to its same-item public recommendation/editorial basis.');
    }
  }
  for (const [name, value] of Object.entries(data)) {
    if (name.startsWith('topic-') && (name !== `topic-${value.topic_slug}.json` || canonicalJson(value.item_ids) !== canonicalJson(items.filter(item => item.topic_slugs.includes(value.topic_slug)).map(item => item.id)))) fail('SNAPSHOT_REFERENCE_INVALID', 'Topic files must match the published item mapping.');
    if (name.startsWith('detail-') && !ids.has(value.item_id)) fail('SNAPSHOT_REFERENCE_INVALID', 'Unexpected detail for an unpublished resource.');
  }
  for (const topic of Object.keys(data['facets.json'].topics)) if (!data[`topic-${topic}.json`]) fail('SNAPSHOT_REFERENCE_INVALID', 'Published topic mappings need a matching topic shard.');
  if (snapshotIdentity(manifest, data) !== manifest.snapshot_id) fail('SNAPSHOT_IDENTITY_INVALID', 'Snapshot content address does not match its payload, input, generator or clock.');
  return { manifest, items, rankings: data['rankings.json'], facets: data['facets.json'], relations: data['relations.json'], aliases: data['aliases.json'], details: Object.fromEntries(Object.entries(data).filter(([name]) => name.startsWith('detail-')).map(([, value]) => [value.item_id, value])) };
}
