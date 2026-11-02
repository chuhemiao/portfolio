import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { publicHttpsUrl, resolveLibraryIdentity } from './normalize.mjs';
import catalogSchema from '../../data/library/schemas/catalog.schema.json' with { type: 'json' };

export { catalogSchema };

export const SCHEMA_VERSION = '1.1.0';
export const LOCALES = Object.freeze(['zh-CN', 'en', 'ja']);
export const MAX_FILE_BYTES = 16 * 1024 * 1024;
export const MAX_RECORD_BYTES = 128 * 1024;
export const MAX_JSON_DEPTH = 32;
export const MAX_JSON_NODES = 1000000;
export const CATALOG_FILES = Object.freeze({
  sources: 'sources.json', candidates: 'candidates.jsonl', items: 'items.jsonl',
  item_locales: 'item-locales.jsonl', evidence: 'evidence.jsonl', item_topics: 'item-topics.jsonl',
  item_relations: 'item-relations.jsonl', editorial_selections: 'editorial-selections.jsonl',
  identity_history: 'identity-history.jsonl', review_log: 'review-log.jsonl', scores: 'scores.jsonl',
});
const RECORD_TYPES = Object.freeze({
  sources: 'source', candidates: 'candidate', items: 'item', item_locales: 'item_locale',
  evidence: 'evidence', item_topics: 'item_topic', item_relations: 'item_relation',
  editorial_selections: 'editorial_selection', identity_history: 'identity_event',
  review_log: 'review_event', scores: 'score',
});
const ajv = new Ajv2020({ strict: true, allErrors: true, coerceTypes: false, useDefaults: false, removeAdditional: false, ownProperties: true });
addFormats(ajv);
ajv.addFormat('library-https-url', value => {
  try { publicHttpsUrl(value); return true; } catch { return false; }
});
ajv.addSchema(catalogSchema);
const validators = new Map();

export class LibraryValidationError extends Error {
  constructor(code, message, issues = []) {
    super(message);
    this.name = 'LibraryValidationError';
    this.code = code;
    this.issues = issues;
  }
}

export function emptyCatalog() {
  return { schema_version: SCHEMA_VERSION, ...Object.fromEntries(Object.keys(CATALOG_FILES).map(key => [key, []])) };
}

function checkJsonValue(value, depth = 0, seen = new WeakSet(), budget = { nodes: 0 }) {
  if (depth > MAX_JSON_DEPTH || ++budget.nodes > MAX_JSON_NODES) throw new LibraryValidationError('LIMIT_EXCEEDED', 'JSON depth or node limit exceeded.');
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (typeof value !== 'object' || seen.has(value) || (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)) {
    throw new LibraryValidationError('INVALID_JSON_VALUE', 'Expected a finite, acyclic JSON value.');
  }
  seen.add(value);
  for (const child of Object.values(value)) checkJsonValue(child, depth + 1, seen, budget);
  seen.delete(value);
}

export function canonicalJson(value) {
  checkJsonValue(value);
  function ordered(v) {
    if (Array.isArray(v)) return v.map(ordered);
    if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map(key => [key, ordered(v[key])]));
    return v;
  }
  return JSON.stringify(ordered(value));
}

export function hashJson(value) {
  return createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex');
}

export function parseJsonStrict(input, { maxBytes = MAX_FILE_BYTES } = {}) {
  let text;
  try {
    text = typeof input === 'string' ? input : new TextDecoder('utf-8', { fatal: true }).decode(input);
  } catch {
    throw new LibraryValidationError('INVALID_UTF8', 'Expected UTF-8 input.');
  }
  if (Buffer.byteLength(text, 'utf8') > maxBytes) throw new LibraryValidationError('LIMIT_EXCEEDED', 'JSON byte limit exceeded.');
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw new LibraryValidationError('INVALID_JSON', 'Malformed JSON.'); }
  let at = 0;
  const whitespace = () => { while (/\s/.test(text[at] ?? '') && at < text.length) at++; };
  function stringToken() {
    const start = at++;
    while (at < text.length) {
      if (text[at] === '\\') { at += 2; continue; }
      if (text[at++] === '"') break;
    }
    return JSON.parse(text.slice(start, at));
  }
  function value(depth) {
    if (depth > MAX_JSON_DEPTH) throw new LibraryValidationError('LIMIT_EXCEEDED', 'JSON depth limit exceeded.');
    whitespace();
    if (text[at] === '{') {
      at++; whitespace(); const keys = new Set();
      if (text[at] === '}') { at++; return; }
      while (at < text.length) {
        whitespace(); const key = stringToken();
        if (keys.has(key)) throw new LibraryValidationError('DUPLICATE_JSON_KEY', 'Duplicate JSON object key.');
        keys.add(key); whitespace(); at++; value(depth + 1); whitespace();
        if (text[at++] === '}') return;
      }
    } else if (text[at] === '[') {
      at++; whitespace(); if (text[at] === ']') { at++; return; }
      while (at < text.length) { value(depth + 1); whitespace(); if (text[at++] === ']') return; }
    } else if (text[at] === '"') { stringToken(); }
    else { while (at < text.length && !/[\s,\]}]/.test(text[at])) at++; }
  }
  value(0);
  checkJsonValue(parsed);
  return parsed;
}

export function parseJsonLines(input) {
  let text;
  try { text = typeof input === 'string' ? input : new TextDecoder('utf-8', { fatal: true }).decode(input); }
  catch { throw new LibraryValidationError('INVALID_UTF8', 'Expected UTF-8 input.'); }
  if (Buffer.byteLength(text, 'utf8') > MAX_FILE_BYTES) throw new LibraryValidationError('LIMIT_EXCEEDED', 'JSONL byte limit exceeded.');
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length > 10000) throw new LibraryValidationError('LIMIT_EXCEEDED', 'JSONL record limit exceeded.');
  return lines.map((line, index) => {
    try { return parseJsonStrict(line, { maxBytes: MAX_RECORD_BYTES }); }
    catch (error) { throw new LibraryValidationError(error.code ?? 'INVALID_JSON', `Invalid JSONL record on line ${index + 1}.`); }
  });
}

function schemaErrors(validate, prefix = '') {
  return (validate.errors ?? []).slice(0, 100).map(error => ({
    code: 'SCHEMA_INVALID', path: prefix + error.instancePath, message: `${error.keyword}: ${error.message}`,
  }));
}

export function validateRecord(type, record) {
  if (!catalogSchema.$defs[type]) throw new LibraryValidationError('UNKNOWN_RECORD_TYPE', 'Unknown Library record type.');
  try { checkJsonValue(record); } catch (error) { return { valid: false, errors: [{ code: error.code, path: '', message: error.message }] }; }
  if (Buffer.byteLength(canonicalJson(record), 'utf8') > MAX_RECORD_BYTES) return { valid: false, errors: [{ code: 'LIMIT_EXCEEDED', path: '', message: 'Record byte limit exceeded.' }] };
  if (!validators.has(type)) validators.set(type, ajv.getSchema(`${catalogSchema.$id}#/$defs/${type}`));
  const validate = validators.get(type);
  const valid = validate(record);
  return { valid: Boolean(valid), errors: valid ? [] : schemaErrors(validate) };
}

export function entityKey(type, record, context = {}) {
  if (type === 'item_locale') return `${record.item_id}:${record.locale}`;
  if (type === 'reason') return `${context.itemId}:${context.locale}:${record.id}`;
  if (type === 'item_topic') return `${record.item_id}:${record.existing_topic_slug}`;
  if (type === 'item_relation') return `${record.item_id}:${record.existing_entity_type}:${record.existing_entity_slug}:${record.relation_type}`;
  if (type === 'score') return `${record.item_id}:${record.rank_version}`;
  return record.id ?? record.event_id ?? record.candidate_id;
}

export function reviewContentHash(type, record, context = {}) {
  const body = structuredClone(record);
  for (const key of ['review_event_id', 'reviewed_at', 'reviewed_by', 'review_status', 'abstract_status']) delete body[key];
  if (type === 'source') for (const key of ['status', 'approved_by', 'approved_at', 'last_legal_review_at']) delete body[key];
  if (type === 'item') for (const key of ['status', 'rights_status', 'checks', 'published_at']) delete body[key];
  if (type === 'item_locale') body.recommendation_reasons = body.recommendation_reasons.map(reason => {
    const value = { ...reason }; delete value.review_event_id; return value;
  });
  return hashJson({ entity_type: type, entity_id: entityKey(type, record, context), content: body });
}

export function reviewEventHash(event) {
  const value = { ...event }; delete value.event_hash; return hashJson(value);
}

export const CATALOG_TRANSACTION_FILE = '.library-transaction.json';
async function transactionGuard(directory, recoveryHash) {
  const filename = path.join(directory, CATALOG_TRANSACTION_FILE);
  const stat = await fs.lstat(filename).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
  if (!stat) {
    if (recoveryHash) throw new LibraryValidationError('REVIEW_CONFLICT', 'The expected recovery transaction no longer exists.');
    return null;
  }
  if (!recoveryHash) throw new LibraryValidationError('CATALOG_TRANSACTION_PENDING', 'An interrupted operator transaction requires explicit recovery before reading this catalog.');
  if (stat.isSymbolicLink() || !stat.isFile() || stat.size > MAX_FILE_BYTES || hashJson(parseJsonStrict(await fs.readFile(filename))) !== recoveryHash) throw new LibraryValidationError('REVIEW_CONFLICT', 'Recovery transaction hash or file does not match.');
  return recoveryHash;
}
export async function readCatalog(directory, { transactionHash = null } = {}) {
  await transactionGuard(directory, transactionHash);
  const catalog = emptyCatalog();
  const initial = new Map();
  for (const file of Object.values(CATALOG_FILES)) {
    const stat = await fs.lstat(path.join(directory, file), { bigint: true });
    if (stat.isSymbolicLink() || !stat.isFile() || stat.size > BigInt(MAX_FILE_BYTES)) throw new LibraryValidationError('LIMIT_EXCEEDED', `Invalid or oversized catalog file: ${file}.`);
    initial.set(file, `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeNs}`);
  }
  for (const [key, file] of Object.entries(CATALOG_FILES)) {
    const filename = path.join(directory, file);
    const buffer = await fs.readFile(filename);
    catalog[key] = file.endsWith('.jsonl') ? parseJsonLines(buffer) : parseJsonStrict(buffer);
  }
  await transactionGuard(directory, transactionHash);
  for (const file of Object.values(CATALOG_FILES)) {
    const stat = await fs.lstat(path.join(directory, file), { bigint: true });
    if (initial.get(file) !== `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeNs}`) throw new LibraryValidationError('CATALOG_CHANGED_DURING_READ', 'Catalog files changed during the read; retry from a stable state.');
  }
  return catalog;
}

export function validateCatalog(catalog, { asOf = new Date().toISOString(), context = { topic_slugs: [], articles: [], project_slugs: [] }, publicGit = true } = {}) {
  const errors = [];
  const add = (code, target, message) => { if (errors.length < 200) errors.push({ code, path: target, message }); };
  const counts = Object.fromEntries(Object.keys(CATALOG_FILES).map(key => [key, Array.isArray(catalog?.[key]) ? catalog[key].length : 0]));
  const finish = (eligible = [], community = []) => ({ valid: errors.length === 0, errors, counts, eligibleItemIds: errors.length ? [] : eligible, communityRecommendedItemIds: errors.length ? [] : community });
  try { checkJsonValue(catalog); } catch (error) { add(error.code, '', error.message); return finish(); }
  if (Buffer.byteLength(canonicalJson(catalog), 'utf8') > MAX_FILE_BYTES) { add('LIMIT_EXCEEDED', '', 'Catalog byte limit exceeded.'); return finish(); }
  const validate = ajv.getSchema(catalogSchema.$id);
  if (!validate(catalog)) { errors.push(...schemaErrors(validate)); return finish(); }
  for (const collection of Object.keys(CATALOG_FILES)) {
    catalog[collection].forEach((record, index) => {
      if (Buffer.byteLength(canonicalJson(record), 'utf8') > MAX_RECORD_BYTES) add('LIMIT_EXCEEDED', `/${collection}/${index}`, 'Record byte limit exceeded.');
    });
  }
  if (errors.length) return finish();
  const time = validateRecord('timestamp', asOf);
  if (!time.valid) { add('INVALID_AS_OF', '', 'asOf must be a UTC timestamp.'); return finish(); }
  const references = validateRecord('reference_context', context);
  if (!references.valid) { errors.push(...references.errors.map(error => ({ ...error, path: `/context${error.path}` }))); return finish(); }
  const now = Date.parse(asOf);
  const makeIndex = (records, getKey, prefix) => {
    const map = new Map();
    records.forEach((record, index) => {
      const key = getKey(record);
      if (map.has(key)) add('DUPLICATE_IDENTITY', `/${prefix}/${index}`, 'Duplicate entity identity.');
      else map.set(key, record);
    });
    return map;
  };
  const sources = makeIndex(catalog.sources, record => record.id, 'sources');
  const items = makeIndex(catalog.items, record => record.id, 'items');
  const evidence = makeIndex(catalog.evidence, record => record.id, 'evidence');
  const selections = makeIndex(catalog.editorial_selections, record => record.id, 'editorial_selections');
  const events = makeIndex(catalog.review_log, record => record.event_id, 'review_log');
  const eventPositions = new Map(catalog.review_log.map((event, index) => [event.event_id, index]));
  const lastInvalidation = new Map();
  for (const event of catalog.review_log) {
    if (['revise', 'reject', 'quarantine', 'archive', 'takedown', 'merge', 'split'].includes(event.action)) lastInvalidation.set(`${event.entity_type}:${event.entity_id}`, eventPositions.get(event.event_id));
  }
  for (const [collection, type] of Object.entries(RECORD_TYPES)) {
    if (['sources', 'items', 'evidence', 'editorial_selections', 'review_log'].includes(collection)) continue;
    makeIndex(catalog[collection], record => entityKey(type, record), collection);
  }
  makeIndex(catalog.items, record => `${record.kind}:${record.canonical_key}`, 'items');
  makeIndex(catalog.items, record => record.slug, 'items');
  makeIndex(catalog.evidence, record => `${record.source_id}:${record.source_record_id}:${record.item_id}:${record.evidence_kind}`, 'evidence');
  let previousHash = null;
  let previousTime = -Infinity;
  catalog.review_log.forEach((event, index) => {
    if (event.previous_event_hash !== previousHash || event.event_hash !== reviewEventHash(event)) add('REVIEW_CHAIN_INVALID', `/review_log/${index}`, 'Review event hash or append-only chain does not match.');
    if (Date.parse(event.created_at) > now || Date.parse(event.created_at) < previousTime || event.expected_revision > event.next_revision) add('REVIEW_EVENT_INVALID', `/review_log/${index}`, 'Invalid review time or revision transition.');
    previousHash = event.event_hash; previousTime = Date.parse(event.created_at);
  });
  const review = (type, record, eventId, target, { actions = ['approve'], states = null, identity = {}, required = true } = {}) => {
    if (eventId === null && !required) return null;
    const event = events.get(eventId);
    const revision = type === 'reason' ? record.source_revision : record.revision;
    const key = entityKey(type, record, identity);
    if (!event || event.entity_type !== type || event.entity_id !== key || event.next_revision !== revision || event.subject_hash !== reviewContentHash(type, record, identity) || !actions.includes(event.action) || (states && !states.includes(event.to_state)) || (lastInvalidation.get(`${type}:${key}`) ?? -1) > (eventPositions.get(eventId) ?? -1)) {
      add('REVIEW_REQUIRED', target, 'A matching current-revision, content-bound review event is required.'); return null;
    }
    return event;
  };
  const policyActive = (source, target) => {
    if (!source || source.status !== 'approved' || !source.approved_by || !source.approved_at || !source.last_legal_review_at || !source.review_due_at || !source.approval_basis_url || !source.policy_scope || Date.parse(source.approved_at) > now || Date.parse(source.last_legal_review_at) > now || Date.parse(source.review_due_at) <= now) {
      add('SOURCE_POLICY_BLOCKED', target, 'Source policy is unapproved, expired or incomplete.'); return false;
    }
    const event = review('source', source, source.review_event_id, target, { actions: ['approve_rights'], states: ['approved'] });
    if (event && (event.reviewer_id !== source.approved_by || event.created_at !== source.approved_at)) add('SOURCE_POLICY_BLOCKED', target, 'Source approval attribution does not match its review event.');
    return Boolean(event);
  };
  for (const [index, source] of catalog.sources.entries()) {
    if (source.attribution_required && !source.attribution_text) add('ATTRIBUTION_REQUIRED', `/sources/${index}`, 'Source attribution is required.');
    if ((source.retention_mode === 'time_limited') !== (source.retention_days !== null) || source.requires_refresh !== (source.refresh_interval_days !== null)) add('SOURCE_POLICY_INVALID', `/sources/${index}`, 'Retention and refresh modes must have explicit matching durations.');
    if ((source.retention_mode === 'time_limited' || source.deletion_required) && source.public_history_allowed) add('PUBLIC_HISTORY_FORBIDDEN', `/sources/${index}`, 'Expiring or deletion-bound data cannot be committed to permanent public history.');
    if (source.status === 'approved') policyActive(source, `/sources/${index}`);
  }
  const controlled = (type, record) => {
    const fields = catalogSchema.$defs.rights_field.enum;
    const data = type === 'candidate' ? { ...record.resource, source_record_id: record.source_record_id, source_url: record.source_url, observed_at: record.observed_at } : record;
    return Object.keys(data).filter(key => fields.includes(key) && data[key] !== null && key !== 'actor_cluster_ref');
  };
  const checkRights = (type, record, target, operation, active) => {
    const source = sources.get(record.source_id);
    const version = record.rights_policy_version ?? record.policy_version;
    if (!source || version !== source.policy_version) { add('SOURCE_REFERENCE_INVALID', target, 'Source and current policy version must exist.'); return; }
    if (!active) return;
    policyActive(source, target);
    for (const field of controlled(type, record)) {
      const provenance = record.field_provenance[field];
      if (!provenance) { add('PROVENANCE_REQUIRED', target, `Field provenance required for ${field}.`); continue; }
      const origin = sources.get(provenance.origin_source_id);
      if (!origin || provenance.rights_policy_version !== origin.policy_version) { add('SOURCE_REFERENCE_INVALID', target, 'Field origin policy is missing or stale.'); continue; }
      policyActive(origin, target);
      if (!origin.allowed_fields[operation].includes(field) || !origin.allowed_fields.store.includes(field) || (operation === 'public_snapshot' && !origin.allowed_fields.display.includes(field))) add('FIELD_RIGHTS_BLOCKED', target, `Field ${field} is not allowed for ${operation}.`);
      if (operation === 'public_git' && (!origin.public_history_allowed || origin.retention_mode !== 'permanent')) add('PUBLIC_HISTORY_FORBIDDEN', target, 'Field origin forbids permanent public history.');
      if (provenance.expires_at && Date.parse(provenance.expires_at) <= now) add('SOURCE_DATA_EXPIRED', target, 'Field origin has expired.');
      const anchor = Date.parse(provenance.fetched_at ?? provenance.observed_at);
      if (!Number.isFinite(anchor) || Date.parse(provenance.observed_at) > now || (provenance.fetched_at && Date.parse(provenance.fetched_at) > now)) add('SOURCE_DATA_TIME_INVALID', target, 'Field observation/fetch times must be known and cannot be in the future.');
      if (origin.requires_refresh && now >= anchor + origin.refresh_interval_days * 86400000) add('SOURCE_REFRESH_REQUIRED', target, 'Field data must be refreshed before its declared refresh deadline.');
      if (origin.retention_mode === 'time_limited') {
        if (!provenance.expires_at || Date.parse(provenance.expires_at) > anchor + origin.retention_days * 86400000) add('RETENTION_INVALID', target, 'Time-limited fields require a bounded expiry.');
      }
      if (field === 'evidence_excerpt' && !origin.show_excerpt_allowed) add('EXCERPT_FORBIDDEN', target, 'The source does not permit excerpts.');
    }
    if (record.expires_at && Date.parse(record.expires_at) <= now) add('SOURCE_DATA_EXPIRED', target, 'Record has expired.');
  };
  const recordPublished = record => items.get(record.item_id ?? record.id)?.status === 'published';
  for (const [collection, type] of Object.entries(RECORD_TYPES)) {
    catalog[collection].forEach((record, index) => {
      const target = `/${collection}/${index}`;
      if (record.item_id && !items.has(record.item_id)) add('ITEM_REFERENCE_INVALID', target, 'Referenced Library item does not exist.');
      if (publicGit && record.actor_cluster_ref !== undefined && record.actor_cluster_ref !== null) add('PRIVATE_FIELD_FORBIDDEN', target, 'Actor-cluster data must stay outside the public repository.');
      if (['candidate', 'item', 'item_locale', 'evidence', 'editorial_selection'].includes(type)) {
        checkRights(type, record, target, publicGit ? 'public_git' : 'public_snapshot', publicGit || recordPublished(record));
      }
      for (const value of [record.canonical_url, record.source_url, ...(record.field_provenance ? Object.values(record.field_provenance).map(p => p.source_url) : [])].filter(Boolean)) {
        const url = new URL(value);
        if (url.username || url.password || url.hostname === 'localhost' || url.hostname.endsWith('.local')) add('UNSAFE_URL', target, 'URLs must be HTTPS public references without credentials.');
      }
    });
  }
  const topicSlugs = new Set(context.topic_slugs);
  const articles = new Map(context.articles.map(record => [record.slug, record.translation_key]));
  const projects = new Set(context.project_slugs);
  catalog.item_topics.forEach((record, index) => {
    const target = `/item_topics/${index}`;
    if (!topicSlugs.has(record.existing_topic_slug)) add('TOPIC_REFERENCE_INVALID', target, 'Topic.slug does not exist in the supplied current site context.');
    if (record.review_status === 'approved') {
      review('item_topic', record, record.review_event_id, target, { states: ['approved'] });
      if (!record.reviewed_at) add('REVIEW_REQUIRED', target, 'Approved topic mappings require a review timestamp.');
    }
  });
  catalog.item_relations.forEach((record, index) => {
    const target = `/item_relations/${index}`;
    if (record.existing_entity_type === 'article' ? articles.get(record.existing_entity_slug) !== record.article_translation_key : !projects.has(record.existing_entity_slug) || record.article_translation_key !== null) add('ENTITY_REFERENCE_INVALID', target, 'Article translationKey/slug or project slug does not match the site context.');
    if (record.review_status === 'approved') {
      const event = review('item_relation', record, record.review_event_id, target, { states: ['approved'] });
      if (!record.reviewed_at || !record.reviewed_by || (event && event.reviewer_id !== record.reviewed_by)) add('REVIEW_REQUIRED', target, 'Approved relations require matching review attribution.');
    }
  });
  catalog.identity_history.forEach((record, index) => {
    const target = `/identity_history/${index}`;
    if ([...record.from_ids, ...record.to_ids].some(id => !items.has(id))) add('IDENTITY_REFERENCE_INVALID', target, 'Identity history must preserve known source and target records.');
    const cardinality = record.action === 'alias' ? record.from_ids.length === 1 && record.to_ids.length === 1 : record.action === 'merge' ? record.from_ids.length >= 2 && record.to_ids.length === 1 : record.from_ids.length === 1 && record.to_ids.length >= 2;
    if (!cardinality || record.from_ids.some(id => record.to_ids.includes(id)) || Date.parse(record.at) > now) add('IDENTITY_GRAPH_INVALID', target, 'Identity action cardinality, time or source/target separation is invalid.');
    if (record.review_event_id !== null) {
      review('identity_event', record, record.review_event_id, target, { actions: record.action === 'alias' ? ['approve'] : [record.action], states: ['approved'] });
      if (record.from_ids.some(id => items.get(id)?.status === 'published')) add('IDENTITY_SOURCE_ACTIVE', target, 'Retire source identities before applying their reviewed alias, merge or split.');
    }
  });
  try {
    for (const record of catalog.identity_history) for (const id of record.from_ids) resolveLibraryIdentity(id, catalog.identity_history);
  } catch { add('IDENTITY_GRAPH_INVALID', '/identity_history', 'Reviewed identity history must not contain cycles.'); }
  catalog.evidence.forEach((record, index) => {
    const target = `/evidence/${index}`;
    if (record.model_id && (!record.prompt_version || !record.run_id || !record.input_hash)) add('EXTRACTION_PROVENANCE_REQUIRED', target, 'Model output requires prompt, run and input provenance.');
    if (record.review_status === 'verified') review('evidence', record, record.review_event_id, target, { states: ['verified'] });
  });
  catalog.editorial_selections.forEach((record, index) => {
    const event = review('editorial_selection', record, record.review_event_id, `/editorial_selections/${index}`, { states: ['approved'], required: record.review_event_id !== null || recordPublished(record) });
    if (event && event.reviewer_id !== record.reviewer_id) add('REVIEW_REQUIRED', `/editorial_selections/${index}`, 'Editorial attribution must match the approval event.');
  });
  const localeGroups = new Map();
  catalog.item_locales.forEach((record, index) => {
    const target = `/item_locales/${index}`;
    const item = items.get(record.item_id);
    if (!localeGroups.has(record.item_id)) localeGroups.set(record.item_id, new Map());
    localeGroups.get(record.item_id).set(record.locale, record);
    if (record.summary_language !== record.locale) add('LOCALE_MISMATCH', target, 'Summary language must equal the editor locale.');
    if (record.abstract_status === 'reviewed') {
      review('item_locale', record, record.review_event_id, target, { states: ['reviewed'] });
      if (!record.reviewed_at || record.source_revision !== item?.revision) add('REVIEW_REQUIRED', target, 'Reviewed locale must match the item revision and have a review time.');
    }
    const reasonIds = new Set();
    for (const reason of record.recommendation_reasons) {
      if (reasonIds.has(reason.id)) add('DUPLICATE_REASON', target, 'Reason IDs must be unique per locale.');
      reasonIds.add(reason.id);
      const basisIds = reason.basis_type === 'evidence' ? reason.evidence_ids : [reason.editorial_selection_id];
      if (reason.basis_type === 'evidence' ? reason.evidence_ids.length === 0 || reason.editorial_selection_id !== null : reason.evidence_ids.length !== 0 || reason.editorial_selection_id === null) add('REASON_BASIS_INVALID', target, 'Reason basis must use exactly one explicit evidence or editorial path.');
      if (Object.keys(reason.basis_revisions).sort().join('\0') !== basisIds.filter(Boolean).sort().join('\0')) add('REASON_BASIS_INVALID', target, 'Every reason basis requires an exact revision binding.');
      for (const id of basisIds) {
        const basis = reason.basis_type === 'evidence' ? evidence.get(id) : selections.get(id);
        if (!basis || basis.item_id !== record.item_id || basis.revision !== reason.basis_revisions[id]) add('REASON_BASIS_INVALID', target, 'Reason basis must belong to this item at the bound revision.');
        else if (record.abstract_status === 'reviewed' && reason.basis_type === 'evidence' && (basis.review_status !== 'verified' || basis.evidence_kind !== 'recommendation')) add('RECOMMENDATION_BASIS_REQUIRED', target, 'Recommendation reasons require verified recommendation evidence; mention, citation and criticism are not endorsements.');
        else if (record.abstract_status === 'reviewed' && !basis.review_event_id) add('REVIEW_REQUIRED', target, 'Reviewed reasons require approved basis records.');
      }
      if (record.abstract_status === 'reviewed') {
        if (reason.source_revision !== item?.revision) add('REASON_REVISION_INVALID', target, 'Reason item revision is stale.');
        review('reason', reason, reason.review_event_id, target, { states: ['reviewed'], identity: { itemId: record.item_id, locale: record.locale } });
      }
    }
  });
  const eligible = [];
  const community = [];
  for (const [index, item] of catalog.items.entries()) {
    const target = `/items/${index}`;
    if ((item.original_published_at === null) !== (item.date_precision === 'unknown')) add('DATE_PRECISION_INVALID', target, 'Unknown publication dates must remain null.');
    if (item.original_published_at && ((item.date_precision === 'year' && !item.original_published_at.endsWith('-01-01')) || (item.date_precision === 'month' && !item.original_published_at.endsWith('-01')))) add('DATE_PRECISION_INVALID', target, 'Partial dates must use the documented first-day placeholder.');
    if (Date.parse(item.updated_at) < Date.parse(item.created_at)) add('DATE_ORDER_INVALID', target, 'updated_at cannot precede created_at.');
    for (const key of ['metadata_valid', 'rights_checked', 'evidence_checked']) {
      if (item.checks[key].passed) review('item', item, item.checks[key].review_event_id, target, { actions: key === 'rights_checked' ? ['approve_rights'] : ['approve'], states: [key === 'rights_checked' ? 'approved' : key] });
    }
    if (item.status !== 'published') continue;
    const before = errors.length;
    if (item.rights_status !== 'approved' || item.checks.content_status !== 'approved' || !item.published_at) add('ITEM_NOT_APPROVED', target, 'Published items require rights/content approval and a publication time.');
    for (const key of ['metadata_valid', 'rights_checked', 'evidence_checked']) {
      if (!item.checks[key].passed) add('CHECK_NOT_PASSED', target, 'Published items require all checks.');
    }
    const publishedEvent = catalog.review_log.findLast(event => event.entity_type === 'item' && event.entity_id === item.id && event.action === 'publish' && event.to_state === 'published' && event.next_revision === item.revision && event.subject_hash === reviewContentHash('item', item));
    if (!publishedEvent || publishedEvent.created_at !== item.published_at) add('REVIEW_REQUIRED', target, 'Published item requires a matching publish event.');
    const latestState = catalog.review_log.findLast(event => event.entity_type === 'item' && event.entity_id === item.id && ['publish', 'revise', 'reject', 'quarantine', 'archive', 'takedown', 'restore', 'merge', 'split'].includes(event.action));
    if (!latestState || latestState.event_id !== publishedEvent?.event_id) add('REVIEW_STATE_STALE', target, 'Published records cannot override a newer lifecycle event.');
    checkRights('item', item, target, 'public_snapshot', true);
    const group = localeGroups.get(item.id) ?? new Map();
    for (const locale of LOCALES) {
      const record = group.get(locale);
      if (!record || record.abstract_status !== 'reviewed' || record.recommendation_reasons.length < 1 || (item.detail_enabled && !record.editorial_body.trim())) add('TRILINGUAL_CONTENT_REQUIRED', target, 'Published items require three reviewed locales, reasons and curated detail bodies.');
      if (record) checkRights('item_locale', record, target, 'public_snapshot', true);
    }
    const signatures = [...group.values()].map(record => canonicalJson(record.recommendation_reasons.map(reason => ({ id: reason.id, basis_type: reason.basis_type, evidence_ids: [...reason.evidence_ids].sort(), editorial_selection_id: reason.editorial_selection_id, basis_revisions: reason.basis_revisions, source_revision: reason.source_revision })).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)));
    if (new Set(signatures).size > 1) add('TRILINGUAL_BASIS_MISMATCH', target, 'Reason IDs and basis must agree across locales.');
    const verified = catalog.evidence.filter(record => record.item_id === item.id && record.review_status === 'verified');
    const editorial = catalog.editorial_selections.filter(record => record.item_id === item.id && record.review_event_id !== null);
    if (!verified.length && !editorial.length) add('EVIDENCE_REQUIRED', target, 'Published items require verified evidence or an approved editorial selection.');
    for (const record of [...verified, ...editorial]) checkRights(record.evidence_kind ? 'evidence' : 'editorial_selection', record, target, 'public_snapshot', true);
    if (errors.length === before) {
      eligible.push(item.id);
      if (verified.some(record => record.evidence_kind === 'recommendation' && record.actor_cluster_ref !== null)) community.push(item.id);
    }
  }
  catalog.scores.forEach((record, index) => {
    const target = `/scores/${index}`;
    const missing = Object.keys(record.features).filter(key => record.features[key] === null).sort();
    if (canonicalJson(missing) !== canonicalJson([...record.missingness].sort())) add('SCORE_MISSINGNESS_INVALID', target, 'Missing feature names must match nullable features.');
    if (record.scoring_status === 'scored') {
      if (record.score_total === null || record.rank_position === null || record.unscored_reason !== null || missing.length) add('SCORE_INVALID', target, 'Scored records require complete finite features and a real score/rank.');
      review('score', record, record.review_event_id, target, { states: ['approved'] });
    } else if (record.score_total !== null || record.rank_position !== null || !record.unscored_reason) add('SCORE_INVALID', target, 'Unscored records require null score/rank and an explicit reason.');
  });
  return finish(eligible.sort(), community.sort());
}
