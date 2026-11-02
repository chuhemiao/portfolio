import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { CATALOG_FILES, SCHEMA_VERSION, canonicalJson, emptyCatalog, entityKey, hashJson, parseJsonStrict, readCatalog, reviewContentHash, reviewEventHash, validateCatalog, validateRecord, LibraryValidationError } from './contract.mjs';
import { normalizeResource, publicHttpsUrl, isbn13 } from './normalize.mjs';
import { importCandidates } from './import.mjs';
import { writeAtomic, withDirectoryLock } from './files.mjs';
import { loadReferenceContext } from './validate.mjs';

const FACT_FILES = ['crossref-books.json', 'oreilly-book.json', 'crossref-defi-papers.json', 'crossref-stablecoin-papers.json', 'ethereum-specs.json', 'ethereum-blog-articles.json', 'mit-course-videos.json', 'foundational-papers.json'];
const POLICY_VERSION = 'metadata-facts-2026-11-02-v1';
const OWNED = 'kkdemian_original_editorial';
const META_FIELDS = ['source_record_id', 'source_url', 'observed_at', 'kind', 'identifier', 'url', 'title_hint', 'canonical_key', 'canonical_url', 'original_title', 'creators', 'original_language', 'original_published_at', 'date_precision'];
const OWNED_FIELDS = ['availability', 'last_checked_at', 'level', 'title', 'description', 'editorial_body', 'recommendation_reasons', 'rationale_locales', 'source_record_id', 'source_url', 'observed_at', 'evidence_kind', 'origin_locator', 'confidence'];
const SOURCES = [
  ['ethereum_improvement_proposals', 'eips.ethereum.org', 'spec', 'manual_json', 'CC0-1.0', 'https://creativecommons.org/publicdomain/zero/1.0/', 'https://eips.ethereum.org/EIPS/eip-1', 'Official index facts and 20 actually read commit-pinned EIP/ERC files; CC0 declarations checked in those files. Does not cover linked third-party content.'],
  ['crossref_bibliographic_metadata', 'api.crossref.org', 'api', 'official_api', null, null, 'https://www.crossref.org/documentation/retrieve-metadata/', 'Finite DOI/ISBN/title/creator/publication-date/type bibliographic facts from the recorded REST endpoints. No abstracts, full text, covers or presumed peer-review status. DOI suffix digits are not inferred ISBNs.'],
  ['oreilly_bibliographic_reference', 'www.oreilly.com', 'manual', 'manual_json', null, null, 'https://www.oreilly.com/terms/', 'One official catalog citation: Mastering Ethereum 2nd Edition, ISBN 9781098168414, five named authors, October 2025 and English. All rights in catalog prose, book text and covers remain with their owners. No ebook/print alias assumed.'],
  ['ethereum_foundation_blog_reference', 'blog.ethereum.org', 'manual', 'manual_json', null, null, 'https://blog.ethereum.org/', '60 finite official-index frontmatter facts: title/date/author/category and URL only. HTML was parsed in memory, not retained. Privacy policy is not a content license. Full text and images remain denied.'],
  ['mit_ocw_course_reference', 'ocw.mit.edu', 'manual', 'manual_json', 'CC-BY-NC-SA-4.0', 'https://ocw.mit.edu/pages/privacy-and-terms-of-use/', 'https://ocw.mit.edu/pages/privacy-and-terms-of-use/', '40 finite official gallery citation links and titles only. The course-content license does not authorize commercial reuse of video, subtitles, images or thumbnails here. Course year is not a video publication date; individual speakers remain unverified.'],
  ['bitcoin_whitepaper_reference', 'bitcoin.org', 'manual', 'manual_json', null, null, 'https://bitcoin.org/en/bitcoin-paper', 'One official-index citation: title, named author, language and PDF URL. No PDF content or third-party redistribution license inferred. Publication date not established by this read.'],
  ['uniswap_whitepaper_reference', 'docs.uniswap.org', 'manual', 'manual_json', null, null, 'https://docs.uniswap.org/contracts/v3/overview', 'One official documentation-index link label and redirected PDF URL. Paper text, precise formal title, authors and publication date were not read or inferred. Website/code licenses do not license this paper.'],
  ['arxiv_bibliographic_metadata', 'arxiv.org', 'manual', 'manual_json', null, null, 'https://arxiv.org/abs/1904.05234', 'One official citation record and explicit v1 history date only. The arXiv nonexclusive distribution grant is not third-party permission to copy full text. No abstract or paper text retained.'],
  [OWNED, 'kkdemian.com', 'owned', 'manual_json', null, null, 'https://kkdemian.com', 'User-authorized original editorial work and explicit unknown availability/level markers. Future original trilingual notes have separate provenance from external metadata. No external prose, assertions of community recommendation or human approval are created by this policy.'],
];
const fail = (code, message, issues = []) => { throw new LibraryValidationError(code, message, issues); };
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const closed = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every(key => keys.includes(key));
function valid(condition, message) { if (!condition) fail('SEED_METADATA_INVALID', message); }
const isoTime = value => {
  valid(typeof value === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)), 'Observation requires a real timestamp or an explicit day-only observation.');
  return new Date(value).toISOString();
};
function publication(parts) {
  if (parts === null) return { original_published_at: null, date_precision: 'unknown' };
  valid(Array.isArray(parts) && parts.length >= 1 && parts.length <= 3 && parts.every(Number.isInteger), 'Publication date parts must keep their source precision.');
  const date = [parts[0], parts[1] ?? 1, parts[2] ?? 1].map((part, index) => String(part).padStart(index ? 2 : 4, '0')).join('-');
  valid(validateRecord('date', date).valid, 'Invalid source calendar date.');
  return { original_published_at: date, date_precision: ['year', 'month', 'day'][parts.length - 1] };
}
function sourcePolicies(plan) {
  const reviewDue = new Date(Date.parse(plan.reviewed_at) + 90 * 86400000).toISOString();
  const policies = SOURCES.map(([id, hostname, source_kind, acquisition_method, license_identifier, license_url, approval_basis_url, scope]) => {
    const fields = id === OWNED ? OWNED_FIELDS : META_FIELDS;
    return {
      schema_version: SCHEMA_VERSION, revision: 1, id, hostname, source_kind, acquisition_method,
      policy_version: POLICY_VERSION, status: 'approved', license_identifier, license_url, approval_basis_url,
      attribution_required: id === 'mit_ocw_course_reference', attribution_text: id === 'mit_ocw_course_reference' ? 'MIT OpenCourseWare — course-gallery bibliographic references. Course materials: CC BY-NC-SA 4.0; no media reproduced.' : null,
      fetch_allowed: false, store_raw_allowed: false, show_excerpt_allowed: false, derivative_analysis_allowed: true,
      allowed_fields: Object.fromEntries(['fetch', 'store', 'display', 'derive', 'public_git', 'public_snapshot'].map(operation => [operation, operation === 'fetch' ? [] : [...fields]])),
      retention_mode: 'permanent', retention_days: null, requires_refresh: false, refresh_interval_days: null, deletion_required: false, public_history_allowed: true,
      approved_by: plan.reviewer_id, approved_at: plan.reviewed_at, last_legal_review_at: plan.reviewed_at, review_due_at: reviewDue, review_event_id: null,
      policy_scope: scope,
      review_notes: 'Codex agent field-policy review under delegated default decisions; not a human or legal-counsel signoff. This approves only the named finite bibliographic facts/original work, not copyrighted source expression. Captures are immutable observations, not live metadata. New network acquisition stays disabled pending explicit per-source execution review.',
    };
  });
  policies.push({ ...policies[0], id: 'youtube_api_enrichment', hostname: 'www.googleapis.com', source_kind: 'api', acquisition_method: 'official_api', status: 'disabled', license_identifier: null, license_url: null, approval_basis_url: 'https://developers.google.com/youtube/terms/developer-policies', allowed_fields: Object.fromEntries(['fetch', 'store', 'display', 'derive', 'public_git', 'public_snapshot'].map(key => [key, []])), derivative_analysis_allowed: false, public_history_allowed: false, retention_mode: 'none', approved_by: null, approved_at: null, last_legal_review_at: null, review_due_at: null, review_event_id: null, policy_scope: 'YouTube API enrichment disabled; no API metadata, captions, thumbnails or media accepted.', review_notes: 'No candidate in this seed uses the YouTube API. MIT reference pages are not a substitute API license.' });
  return policies;
}
function policyEvents(catalog, plan) {
  for (const source of catalog.sources.filter(source => source.status === 'approved')) {
    const event = {
      schema_version: SCHEMA_VERSION, event_id: `source_policy_${hashJson([source.id, source.policy_version]).slice(0, 32)}`,
      entity_type: 'source', entity_id: entityKey('source', source), action: 'approve_rights', from_state: 'pending', to_state: 'approved', expected_revision: 0, next_revision: source.revision,
      subject_hash: reviewContentHash('source', source), redacted_diff: [], reason: `Actual Codex agent review of ${source.id}: ${source.policy_scope} No human approval or full-text license claimed.`,
      reviewer_id: plan.reviewer_id, created_at: plan.reviewed_at, previous_event_hash: catalog.review_log.at(-1)?.event_hash ?? null, event_hash: '0'.repeat(64),
    };
    event.event_hash = reviewEventHash(event); catalog.review_log.push(event); source.review_event_id = event.event_id;
  }
}
function identifierFor(record, pin) {
  if (record.kind === 'spec') return pin ? `eip:ethereum:${record.identifier.eip}:${pin.reviewed_source_version}` : null;
  if (record.kind === 'book') return record.identifier.isbn13;
  if (record.identifier?.doi) return `doi:${record.identifier.doi}`;
  if (record.identifier?.arxiv) return `arxiv:${record.identifier.arxiv}${record.identifier.arxiv_version ?? ''}`;
  return null;
}
function provenance(record, observed, origin = record.source_id) {
  return { origin_source_id: origin, source_record_id: record.source_record_id, source_url: record.url, rights_policy_version: POLICY_VERSION, observed_at: observed, fetched_at: null, expires_at: null };
}
function candidateFor(record, pin, observed) {
  const resource = { kind: record.kind, identifier: identifierFor(record, pin), url: record.url, title_hint: record.title };
  try { resource.url = normalizeResource(resource).canonical_url; }
  catch (error) { if (error.code !== 'VERSION_REQUIRED') throw error; }
  return {
    schema_version: SCHEMA_VERSION, revision: 1, candidate_id: `candidate_${hashJson([record.source_id, record.source_record_id]).slice(0, 32)}`,
    ingestion_id: 'library-real-metadata-2026-11-02-v1', source_id: record.source_id, source_record_id: record.source_record_id, source_url: record.url, observed_at: observed,
    resource, policy_version: POLICY_VERSION,
    field_provenance: Object.fromEntries(['source_record_id', 'source_url', 'observed_at', 'kind', 'identifier', 'url', 'title_hint'].map(field => [field, provenance(record, observed)])), state: 'needs_review',
  };
}
function itemFor(record, pin, observed, plan) {
  const identity = normalizeResource({ kind: record.kind, url: record.url, identifier: identifierFor(record, pin) });
  const id = `lib_${hashJson([record.kind, identity.canonical_key]).slice(0, 32)}`;
  const stem = record.title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 95).replace(/-$/, '') || record.kind;
  const dates = publication(record.kind === 'spec' ? null : record.date_parts);
  const item = {
    schema_version: SCHEMA_VERSION, revision: 1, id, slug: `${stem}-${id.slice(-8)}`, kind: record.kind, ...identity,
    original_title: record.title, creators: [...record.creators], original_language: record.language ?? 'und', ...dates,
    source_id: record.source_id, rights_policy_version: POLICY_VERSION, field_provenance: {}, status: 'draft', rights_status: 'pending', validity_status: 'unknown', availability: 'unknown', last_checked_at: null,
    level: 'unknown', detail_enabled: false, checks: { metadata_valid: { passed: false, review_event_id: null }, rights_checked: { passed: false, review_event_id: null }, evidence_checked: { passed: false, review_event_id: null }, content_status: 'needs_review' },
    created_at: plan.reviewed_at, updated_at: plan.reviewed_at, published_at: null, expires_at: null,
  };
  for (const field of ['kind', 'canonical_key', 'canonical_url', 'original_title', 'creators', 'original_language', 'date_precision', ...(dates.original_published_at ? ['original_published_at'] : [])]) item.field_provenance[field] = provenance(record, observed);
  for (const field of ['availability', 'level']) item.field_provenance[field] = provenance(record, observed, OWNED);
  return item;
}

export async function prepareSeed({ directory = path.resolve('data/library') } = {}) {
  const plan = parseJsonStrict(await fs.readFile(path.join(directory, 'seed-plan.json')));
  valid(plan.schema === 'library-seed-plan/v1' && validateRecord('timestamp', plan.reviewed_at).valid && validateRecord('id', plan.reviewer_id).valid && Array.isArray(plan.selection) && plan.selection.length === 100, 'A reviewed finite seed plan is required.');
  const records = []; const factHashes = {}; const dayOnly = new Set();
  for (const name of FACT_FILES) {
    const bytes = await fs.readFile(path.join(directory, 'metadata', name));
    const packet = parseJsonStrict(bytes, { maxBytes: 512 * 1024 });
    valid(closed(packet, ['schema', 'observed_at', 'source_evidence', 'transfer_receipts', 'records', 'limitations', 'supplemental_evidence']) && packet.schema === 'library-source-metadata-facts/v1' && Array.isArray(packet.records), 'Unrecognized metadata envelope.');
    valid(closed(packet.source_evidence, ['source_id', 'index_url', 'index_sha256', 'policy_evidence_urls']), 'Unrecognized source receipt.');
    publicHttpsUrl(packet.source_evidence.index_url);
    for (const record of packet.records) {
      valid(closed(record, ['kind', 'source_id', 'source_record_id', 'url', 'title', 'creators', 'date_parts', 'language', 'status', 'identifier', 'format', 'version', 'read_level', 'source_category', 'course_year', 'source_type', 'source_index_url', 'source_index_sha256', 'observed_at', 'url_aliases', 'source_note']), 'Metadata contains a field outside the finite projection whitelist.');
      valid(SOURCES.some(source => source[0] === record.source_id) && record.source_id !== OWNED && validateRecord('kind', record.kind).valid && validateRecord('id', record.source_record_id).valid && typeof record.title === 'string' && record.title.length > 0 && record.title.length <= 2000 && Array.isArray(record.creators) && record.creators.every(creator => typeof creator === 'string' && creator.length <= 500), 'Invalid bibliographic fact fields.');
      valid(record.read_level === 'metadata_only' && record.format === null, 'Metadata projection cannot imply full-source reading or an unverified book format.');
      publicHttpsUrl(record.url); publication(record.date_parts);
      valid(record.language === null || validateRecord('language', record.language).valid, 'Invalid source language.');
      if (record.kind === 'book') valid(isbn13(record.identifier?.isbn13 ?? '') === record.identifier.isbn13, 'Book identity needs its actual, valid ISBN.');
      if (record.identifier !== null) valid(closed(record.identifier, ['eip', 'doi', 'isbn13', 'arxiv', 'arxiv_version']), 'Unrecognized bibliographic identifier.');
      const sourceTime = record.observed_at ?? packet.observed_at;
      const isDay = /^\d{4}-\d{2}-\d{2}$/.test(sourceTime);
      if (isDay) { valid(validateRecord('date', sourceTime).valid && sourceTime <= plan.reviewed_at.slice(0, 10), 'Invalid day-only observation.'); dayOnly.add(record.source_record_id); }
      const observed = isDay ? plan.reviewed_at : isoTime(sourceTime);
      valid(Date.parse(observed) <= Date.parse(plan.reviewed_at), 'A capture cannot postdate its review.');
      records.push({ record, observed, packet: name });
    }
    factHashes[name] = digest(bytes);
  }
  const pinBytes = await fs.readFile(path.join(directory, 'metadata', 'spec-pins.json'));
  const pinPacket = parseJsonStrict(pinBytes);
  valid(pinPacket.schema === 'library-spec-pins/v1' && Array.isArray(pinPacket.pins) && pinPacket.pins.length === 20, '20 actually checked spec pins are required.');
  factHashes['spec-pins.json'] = digest(pinBytes);
  const pins = new Map(pinPacket.pins.map(pin => [pin.eip_number, pin]));
  valid(pins.size === 20, 'Spec pins must be unique.');
  for (const pin of pins.values()) {
    valid(closed(pin, ['eip_number', 'source_repository', 'source_path', 'source_spec_created', 'source_file_sha256', 'source_file_bytes', 'observed_at', 'source_type', 'source_category', 'requires', 'reviewed_source_version', 'reviewed_source_url', 'read_level', 'read_scope']), 'Spec pin metadata contains a field outside the finite projection whitelist.');
    valid(/^[a-f0-9]{40}$/.test(pin.reviewed_source_version) && /^[a-f0-9]{64}$/.test(pin.source_file_sha256) && Number.isInteger(pin.source_file_bytes) && pin.source_file_bytes > 0 && pin.reviewed_source_url === `https://github.com/${pin.source_repository}/blob/${pin.reviewed_source_version}/${pin.source_path}` && /^(?:ethereum\/EIPs|ethereum\/ERCs)$/.test(pin.source_repository) && /^(?:EIPS\/eip|ERCS\/erc)-\d+\.md$/.test(pin.source_path), 'A reviewed file at the explicit commit is required, not an unverified HEAD.');
  }
  const byId = new Map(records.map(entry => [`${entry.record.source_id}:${entry.record.source_record_id}`, entry]));
  valid(records.length === 300 && byId.size === 300, 'The finite seed must contain 300 distinct upstream candidate records.');
  const expected = { spec: 80, paper: 80, article: 60, book: 40, video: 40 };
  for (const [kind, count] of Object.entries(expected)) valid(records.filter(entry => entry.record.kind === kind).length === count, `Unexpected ${kind} candidate distribution.`);
  const catalog = emptyCatalog(); catalog.sources = sourcePolicies(plan); policyEvents(catalog, plan);
  catalog.candidates = records.map(({ record, observed }) => candidateFor(record, pins.get(record.identifier?.eip), observed));
  const selection = [];
  for (const selected of plan.selection) {
    valid(closed(selected, ['source_id', 'source_record_id', 'topic_slugs', 'rationale']) && Array.isArray(selected.topic_slugs) && selected.topic_slugs.length > 0 && typeof selected.rationale === 'string' && selected.rationale.length > 0, 'Preselection must name real upstream identity, topic suggestions and an internal rationale.');
    const entry = byId.get(`${selected.source_id}:${selected.source_record_id}`);
    valid(Boolean(entry), 'Preselection references an unknown upstream record.');
    const { record, observed } = entry; const pin = pins.get(record.identifier?.eip);
    const item = itemFor(record, pin, observed, plan); catalog.items.push(item);
    for (const topic of selected.topic_slugs) catalog.item_topics.push({ schema_version: SCHEMA_VERSION, revision: 1, item_id: item.id, existing_topic_slug: topic, mapping_method: 'model_suggested', review_status: 'pending_review', reviewed_at: null, review_event_id: null });
    selection.push({ ...selected, item_id: item.id, kind: record.kind, original_title: record.title, source_metadata_file: `metadata/${entry.packet}`, reviewed_source_url: pin?.reviewed_source_url ?? record.source_index_url ?? record.url, reviewed_source_version: pin?.reviewed_source_version ?? record.version, source_file_sha256: pin?.source_file_sha256 ?? null, source_read_level: pin ? 'spec_text' : 'metadata_only', observation_precision: dayOnly.has(record.source_record_id) ? 'day' : 'timestamp', unresolved: ['trilingual_original_editorial', 'recommendation_basis_review', 'publication_checks', ...(record.language === null ? ['original_language_unknown'] : []), ...(record.date_parts === null ? ['publication_date_unknown'] : []), ...(record.kind === 'book' && record.format === null ? ['book_medium_not_verified'] : []), ...(record.kind === 'video' ? ['individual_speakers_and_upload_date_unknown'] : []), ...(record.kind === 'spec' && record.status === 'Draft' ? ['upstream_spec_is_draft'] : [])] });
  }
  valid(new Set(selection.map(entry => entry.item_id)).size === 100, 'The 100 preselected item identities must be distinct.');
  for (const kind of Object.keys(expected)) valid(selection.filter(entry => entry.kind === kind).length === 20, 'Select 20 distinct draft identities of each kind.');
  const context = await loadReferenceContext(process.cwd(), catalog);
  const validation = validateCatalog(catalog, { asOf: plan.reviewed_at, context });
  if (!validation.valid) fail('SEED_CATALOG_INVALID', 'Prepared finite seed did not satisfy the existing catalog contract.', validation.errors);
  return { catalog, context, plan, selection: { schema: 'library-metadata-preselection/v1', reviewed_at: plan.reviewed_at, reviewer_id: plan.reviewer_id, publication_status: 'draft-only; no editorial or publication approval', source_projection_hashes: factHashes, selection }, validation };
}

export async function seedSources({ directory = path.resolve('data/library'), write = false, jobDirectory } = {}) {
  const prepared = await prepareSeed({ directory });
  const report = { dry_run: !write, as_of: prepared.plan.reviewed_at, counts: prepared.validation.counts, eligible: prepared.validation.eligibleItemIds.length, sources: [], selection_hash: hashJson(prepared.selection), metadata_hashes: prepared.selection.source_projection_hashes };
  if (!write) return report;
  const current = await readCatalog(directory);
  for (const [key, records] of Object.entries(current)) {
    if (key === 'schema_version' || key === 'candidates') continue;
    if (records.length && hashJson(records) !== hashJson(prepared.catalog[key])) fail('SEED_CONFLICT', 'Seeding never overwrites later editorial work, reviews or unrelated catalog records.');
  }
  await withDirectoryLock(directory, async () => {
    await writeAtomic(path.join(directory, CATALOG_FILES.sources), canonicalJson(prepared.catalog.sources) + '\n');
    await writeAtomic(path.join(directory, CATALOG_FILES.review_log), prepared.catalog.review_log.map(canonicalJson).join('\n') + '\n');
  });
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'library-finite-seed-'));
  try {
    for (const source of prepared.catalog.sources) {
      const rows = prepared.catalog.candidates.filter(candidate => candidate.source_id === source.id);
      if (!rows.length) continue;
      const input = path.join(temporary, `${source.id}.jsonl`);
      await writeAtomic(input, rows.map(canonicalJson).join('\n') + '\n');
      const options = { directory, input, sourceId: source.id, batchKey: 'real-metadata-2026-11-02-v1', asOf: prepared.plan.reviewed_at, context: prepared.context, jobDirectory: jobDirectory ?? path.join(temporary, 'jobs') };
      const dry = await importCandidates(options);
      const first = await importCandidates({ ...options, write: true });
      const replay = await importCandidates({ ...options, write: true });
      if (dry.failures.length || first.failures.length || replay.failures.length || replay.accepted !== 0) fail('SEED_IMPORT_FAILED', 'Finite import or idempotency check failed.');
      report.sources.push({ source_id: source.id, input_hash: first.input_hash, records: rows.length, dry_accepted: dry.accepted, write_accepted: first.accepted, replay_accepted: replay.accepted, replay_duplicates: replay.duplicates });
    }
  } finally { await fs.rm(temporary, { recursive: true, force: true }); }
  await withDirectoryLock(directory, async () => {
    const imported = await readCatalog(directory);
    valid(hashJson([...imported.candidates].sort((a, b) => a.candidate_id.localeCompare(b.candidate_id, 'en'))) === hashJson([...prepared.catalog.candidates].sort((a, b) => a.candidate_id.localeCompare(b.candidate_id, 'en'))), 'Actual imported candidate set differs from the planned finite data.');
    for (const key of ['items', 'item_topics']) {
      const rows = prepared.catalog[key];
      await writeAtomic(path.join(directory, CATALOG_FILES[key]), rows.map(canonicalJson).join('\n') + (rows.length ? '\n' : ''));
    }
    await writeAtomic(path.join(directory, 'seed-selection.json'), canonicalJson(prepared.selection) + '\n');
  });
  const validation = validateCatalog(await readCatalog(directory), { asOf: prepared.plan.reviewed_at, context: prepared.context });
  if (!validation.valid) fail('SEED_CATALOG_INVALID', 'Written metadata seed failed existing contract validation.', validation.errors);
  return report;
}

export async function main(args = process.argv.slice(2)) {
  const options = {};
  for (let at = 0; at < args.length; at++) {
    if (args[at] === '--write') options.write = true;
    else if (args[at] === '--dry-run') options.write = false;
    else if (args[at] === '--dir' && args[at + 1]) options.directory = path.resolve(args[++at]);
    else if (args[at] === '--job-dir' && args[at + 1]) options.jobDirectory = path.resolve(args[++at]);
    else fail('INVALID_ARGUMENT', 'Usage: node scripts/library/seed-sources.mjs [--dir catalog] [--dry-run|--write] [--job-dir outside-repo]');
  }
  process.stdout.write(JSON.stringify(await seedSources(options), null, 2) + '\n');
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => { process.stderr.write(`${error.code ?? 'SEED_FAILED'}: ${error.message}\n${error.issues ? JSON.stringify(error.issues) + '\n' : ''}`); process.exitCode = 1; });
