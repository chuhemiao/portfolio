import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { SCHEMA_VERSION, MAX_FILE_BYTES, MAX_RECORD_BYTES, parseJsonStrict, canonicalJson, hashJson, emptyCatalog, readCatalog, validateRecord, validateCatalog, LibraryValidationError } from './contract.mjs';
import { normalizeResource, normalizeUrl } from './normalize.mjs';
import { directoryPath, regularFile, withDirectoryLock, writeAtomic, within } from './files.mjs';
import { loadReferenceContext } from './validate.mjs';

const JOB_VERSION = 'candidate-import-v1';
const csvFields = ['source_record_id', 'source_url', 'observed_at', 'kind', 'identifier', 'url', 'title_hint'];
const error = (code, message) => new LibraryValidationError(code, message);

export function parseCandidateCsv(input) {
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(input); } catch { throw error('INVALID_UTF8', 'CSV must be UTF-8.'); }
  if (Buffer.byteLength(text) > MAX_FILE_BYTES) throw error('LIMIT_EXCEEDED', 'CSV byte limit exceeded.');
  const rows = []; let row = [], value = '', quoted = false, closed = false;
  for (let i = 0; i <= text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === undefined) throw error('INVALID_CSV', 'Unclosed quoted CSV field.');
      if (c === '"') { if (text[i + 1] === '"') { value += '"'; i++; } else { quoted = false; closed = true; } }
      else value += c;
    } else if (c === '"') {
      if (value || closed) throw error('INVALID_CSV', 'A quote must begin a CSV field.'); quoted = true;
    } else if (c === ',' || c === '\n' || c === undefined) {
      row.push(value); value = ''; closed = false;
      if (c !== ',') { if (row.some(cell => cell !== '')) rows.push(row); row = []; }
    } else {
      if (c === '\r' && text[i + 1] === '\n') continue;
      if (closed) throw error('INVALID_CSV', 'Unexpected characters after a quoted CSV field.'); value += c;
    }
  }
  const headers = rows.shift() ?? [];
  if (headers.length !== new Set(headers).size || headers.length !== csvFields.length || csvFields.some(key => !headers.includes(key))) throw error('INVALID_CSV_HEADER', `CSV headers must contain exactly ${csvFields.join(',')}.`);
  if (rows.length > 10000) throw error('LIMIT_EXCEEDED', 'CSV row limit exceeded.');
  return rows.map((cells, index) => cells.length === headers.length ? { record: Object.fromEntries(headers.map((key, at) => [key, cells[at]])), line: index + 2 } : { failure: { code: 'INVALID_CSV_ROW' }, line: index + 2 });
}
function importRows(bytes, format) {
  if (bytes.byteLength > MAX_FILE_BYTES) throw error('LIMIT_EXCEEDED', 'Import byte limit exceeded.');
  if (format === 'csv') return parseCandidateCsv(bytes);
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { throw error('INVALID_UTF8', 'JSONL must be UTF-8.'); }
  const lines = text.split(/\r?\n/).map((value, index) => ({ value, line: index + 1 })).filter(row => row.value.trim());
  if (lines.length > 10000) throw error('LIMIT_EXCEEDED', 'Import record limit exceeded.');
  return lines.map(({ value, line }) => {
    try { return { line, record: parseJsonStrict(value, { maxBytes: MAX_RECORD_BYTES }) }; }
    catch (failure) { return { line, failure: { code: failure.code ?? 'INVALID_JSON' } }; }
  });
}
function contentKey(record) {
  const content = structuredClone(record);
  for (const key of ['ingestion_id', 'candidate_id', 'revision', 'state']) delete content[key];
  return hashJson(content);
}
function checkCandidateStorage(candidate, sources) {
  const stored = { ...candidate.resource, source_record_id: candidate.source_record_id, source_url: candidate.source_url, observed_at: candidate.observed_at };
  for (const field of Object.keys(stored).filter(key => stored[key] !== null)) {
    const provenance = candidate.field_provenance[field];
    const origin = sources.find(record => record.id === provenance?.origin_source_id);
    if (!origin || provenance.rights_policy_version !== origin.policy_version) throw error('SOURCE_REFERENCE_INVALID', 'Stored candidate fields require their current source policy.');
    if (!origin.allowed_fields.store.includes(field)) throw error('FIELD_RIGHTS_BLOCKED', 'Candidate storage permission is required even for private imports.');
  }
}
function candidateFromRow(row, { source, sourceId, jobId, format }) {
  let candidate;
  if (format === 'csv') {
    const recordId = row.source_record_id;
    const provenance = { origin_source_id: sourceId, source_record_id: recordId, source_url: row.source_url, rights_policy_version: source.policy_version, observed_at: row.observed_at, fetched_at: null, expires_at: null };
    candidate = {
      schema_version: SCHEMA_VERSION, revision: 1, candidate_id: `candidate_${hashJson([sourceId, recordId]).slice(0, 32)}`,
      ingestion_id: jobId, source_id: sourceId, source_record_id: recordId, source_url: row.source_url, observed_at: row.observed_at,
      resource: { kind: row.kind, identifier: row.identifier || null, url: row.url, title_hint: row.title_hint || null },
      policy_version: source.policy_version, field_provenance: Object.fromEntries(['source_record_id', 'source_url', 'observed_at', 'kind', 'identifier', 'url', 'title_hint'].map(field => [field, structuredClone(provenance)])), state: 'needs_review',
    };
  } else candidate = structuredClone(row);
  const shape = validateRecord('candidate', candidate);
  if (!shape.valid) throw error(shape.errors[0].code, 'Candidate does not match its Schema.');
  if (candidate.source_id !== sourceId || candidate.policy_version !== source.policy_version) throw error('SOURCE_REFERENCE_INVALID', 'Candidate source/policy must match the selected source.');
  if (!['new', 'needs_review'].includes(candidate.state) || candidate.revision !== 1) throw error('IMPORT_STATE_FORBIDDEN', 'Imports create unreviewed revision-one candidates only.');
  candidate.source_url = normalizeUrl(candidate.source_url);
  candidate.resource.url = normalizeUrl(candidate.resource.url);
  let identity = null, identityNeedsReview = false;
  try { identity = normalizeResource(candidate.resource); }
  catch (failure) { if (['VERSION_REQUIRED', 'IDENTITY_REVIEW_REQUIRED'].includes(failure.code)) identityNeedsReview = failure.code; else throw failure; }
  if (identity) candidate.resource.url = identity.canonical_url;
  candidate.state = 'needs_review';
  return { candidate, identity, identityNeedsReview };
}

export async function importCandidates({ directory, input, sourceId, batchKey, format = 'jsonl', write = false, jobDirectory = path.join(os.tmpdir(), 'kkdemian-library-import'), asOf = new Date().toISOString(), context = null, publicGit = true, checkpointEvery = 50, maxAttempts = 3, signal } = {}) {
  if (!directory || !input || !sourceId || !batchKey || !['csv', 'jsonl'].includes(format) || !Number.isInteger(checkpointEvery) || checkpointEvery < 1 || !Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 10) throw error('INVALID_ARGUMENT', 'Import requires catalog, input, source, batch and bounded options.');
  const root = await directoryPath(directory);
  const repository = await fs.realpath(process.cwd());
  if (!publicGit && within(repository, root)) throw error('PRIVATE_CATALOG_IN_REPOSITORY', 'Private imports must remain outside the repository.');
  if (within(repository, path.resolve(jobDirectory)) || within(root, path.resolve(jobDirectory))) throw error('JOB_DIRECTORY_IN_REPOSITORY', 'Import checkpoints and failures must stay outside the repository/catalog.');
  const inputName = path.resolve(input);
  const stat = await regularFile(inputName);
  if (stat.size > MAX_FILE_BYTES) throw error('LIMIT_EXCEEDED', 'Import byte limit exceeded.');
  const bytes = await fs.readFile(inputName);
  const rows = importRows(bytes, format);
  const inputHash = createHash('sha256').update(bytes).digest('hex');
  const jobId = `import_${hashJson([root, sourceId, batchKey, JOB_VERSION]).slice(0, 32)}`;
  const run = async () => {
    const catalog = await readCatalog(root);
    const references = context ?? await loadReferenceContext(process.cwd(), catalog);
    const before = validateCatalog(catalog, { asOf, context: references, publicGit });
    if (!before.valid) throw new LibraryValidationError('CATALOG_INVALID', 'Existing catalog is invalid; import did not change it.', before.errors);
    for (const candidate of catalog.candidates) checkCandidateStorage(candidate, catalog.sources);
    const source = catalog.sources.find(value => value.id === sourceId);
    if (!source) throw error('SOURCE_REFERENCE_INVALID', 'Selected source is not in the catalog.');
    const report = { dry_run: !write, job_id: jobId, input_hash: inputHash, total: rows.length, accepted: 0, duplicates: 0, matched: 0, identity_needs_review: [], failures: [], state: 'completed' };
    let job = { schema_version: SCHEMA_VERSION, id: jobId, source_id: sourceId, batch_key: batchKey, job_version: JOB_VERSION, input_hash: inputHash, state: 'running', cursor: null, attempts: 1, completed_record_ids: [], failures: [], started_at: asOf, finished_at: null };
    if (!validateRecord('job', job).valid) throw error('INVALID_ARGUMENT', 'Import batch/job metadata must satisfy the job Schema before any write.');
    let jobsRoot = null;
    if (write) {
      jobsRoot = await directoryPath(jobDirectory, { create: true });
      if (within(repository, jobsRoot) || within(root, jobsRoot)) throw error('JOB_DIRECTORY_IN_REPOSITORY', 'Import checkpoints and failures must stay outside the repository/catalog.');
      const jobFile = path.join(jobsRoot, `${jobId}.json`);
      if (await regularFile(jobFile, { missing: true })) {
        job = parseJsonStrict(await fs.readFile(jobFile));
        if (!validateRecord('job', job).valid || job.id !== jobId || job.input_hash !== inputHash) throw error('INGEST_CONFLICT', 'This source/batch/version already has different input or an invalid checkpoint.');
        if (job.attempts >= 100) throw error('RETRY_LIMIT', 'Import job retry limit reached; reconcile the checkpoint before replaying.');
        job.attempts += 1; job.state = 'running'; job.finished_at = null;
      }
    }
    const completed = new Set(job.completed_record_ids);
    const failures = new Map(job.failures.map(value => [value.record_id, value]));
    const identities = new Set();
    for (const record of [...catalog.items, ...catalog.candidates]) {
      try {
        const identity = record.resource ? normalizeResource(record.resource) : normalizeResource({ kind: record.kind, url: record.canonical_url, version: record.identifiers.version, identifier: record.identifiers.youtube_id ? `youtube:${record.identifiers.youtube_id}` : record.identifiers.doi ?? (record.identifiers.openlibrary_work ?? record.identifiers.isbn13) });
        identities.add(`${record.kind ?? record.resource.kind}:${identity.canonical_key}`);
      } catch { /* Unresolved existing candidates do not acquire a guessed identity. */ }
    }
    const existing = new Map(catalog.candidates.map(record => [`${record.source_id}:${record.source_record_id}`, record]));
    let dirty = false;
    const checkpoint = async () => {
      if (!write) return;
      if (dirty) {
        const result = validateCatalog(catalog, { asOf, context: references, publicGit });
        if (!result.valid) throw new LibraryValidationError('CATALOG_INVALID', 'Checkpoint refused an invalid catalog.', result.errors);
        const ordered = [...catalog.candidates].sort((a, b) => a.candidate_id.localeCompare(b.candidate_id, 'en'));
        await writeAtomic(path.join(root, 'candidates.jsonl'), ordered.map(record => canonicalJson(record)).join('\n') + (ordered.length ? '\n' : ''));
        dirty = false;
      }
      job.completed_record_ids = [...completed].sort(); job.failures = [...failures.values()];
      const valid = validateRecord('job', job);
      if (!valid.valid) throw new LibraryValidationError('JOB_INVALID', 'Checkpoint does not match its Schema.', valid.errors);
      await writeAtomic(path.join(jobsRoot, `${jobId}.json`), canonicalJson(job) + '\n', { mode: 0o600 });
      await writeAtomic(path.join(jobsRoot, `${jobId}.dlq.jsonl`), job.failures.map(value => canonicalJson(value)).join('\n') + (job.failures.length ? '\n' : ''), { mode: 0o600 });
    };
    for (let at = 0; at < rows.length; at++) {
      if (signal?.aborted) {
        job.state = 'cancelled'; report.state = 'cancelled'; await checkpoint(); return report;
      }
      const entry = rows[at];
      const recordId = entry.record?.source_record_id && /^[a-zA-Z0-9][a-zA-Z0-9_:.\/-]{0,199}$/.test(entry.record.source_record_id) ? entry.record.source_record_id : `line:${entry.line}`;
      const token = `line:${entry.line}`;
      if (completed.has(token)) {
        const prepared = entry.record && candidateFromRow(entry.record, { source, sourceId, jobId, format });
        const prior = prepared && existing.get(`${prepared.candidate.source_id}:${prepared.candidate.source_record_id}`);
        if (prior && contentKey(prior) === contentKey(prepared.candidate)) { report.duplicates++; continue; }
        completed.delete(token);
      }
      const pastFailure = failures.get(token);
      if (pastFailure && pastFailure.attempts >= maxAttempts) { report.failures.push(pastFailure); continue; }
      try {
        if (entry.failure) throw error(entry.failure.code, 'Malformed input row.');
        const { candidate, identity, identityNeedsReview } = candidateFromRow(entry.record, { source, sourceId, jobId, format });
        checkCandidateStorage(candidate, catalog.sources);
        const candidateCatalog = { ...emptyCatalog(), sources: catalog.sources, review_log: catalog.review_log, candidates: [candidate] };
        const result = validateCatalog(candidateCatalog, { asOf, publicGit });
        if (!result.valid) throw new LibraryValidationError(result.errors[0].code, 'Candidate rights or metadata validation failed.', result.errors);
        const key = `${candidate.source_id}:${candidate.source_record_id}`;
        const previous = existing.get(key);
        if (previous) {
          if (contentKey(previous) !== contentKey(candidate)) throw error('RECORD_CONFLICT', 'An existing source record changed; use explicit review/revision instead of overwriting.');
          report.duplicates++;
        } else {
          const identityKey = identity && `${candidate.resource.kind}:${identity.canonical_key}`;
          if (identityKey && identities.has(identityKey)) { candidate.state = 'matched'; report.matched++; }
          if (identityKey) identities.add(identityKey);
          if (catalog.candidates.some(record => record.candidate_id === candidate.candidate_id)) throw error('RECORD_CONFLICT', 'Candidate ID is already in use.');
          catalog.candidates.push(candidate); existing.set(key, candidate); dirty = true; report.accepted++;
        }
        if (identityNeedsReview) report.identity_needs_review.push({ record_id: recordId, code: identityNeedsReview });
        completed.add(token); failures.delete(token);
        const firstPending = rows.findIndex(row => !completed.has(`line:${row.line}`));
        const lastComplete = firstPending === -1 ? rows.at(-1) : rows[firstPending - 1];
        job.cursor = lastComplete ? String(lastComplete.line) : null;
      } catch (failure) {
        const item = { record_id: token, code: failure.code ?? 'IMPORT_FAILED', attempts: (pastFailure?.attempts ?? 0) + 1 };
        failures.set(token, item); report.failures.push(item);
      }
      if (write && (at + 1) % checkpointEvery === 0) { job.state = 'checkpointed'; await checkpoint(); job.state = 'running'; }
    }
    job.state = failures.size ? 'failed' : 'completed'; job.finished_at = asOf; report.state = job.state;
    await checkpoint();
    if (write) report.checkpoint = path.join(jobsRoot, `${jobId}.json`);
    return report;
  };
  return write ? withDirectoryLock(root, run) : run();
}

export async function main(args = process.argv.slice(2)) {
  const options = { directory: path.resolve('data/library') };
  for (let i = 0; i < args.length; i++) {
    const key = { '--dir': 'directory', '--input': 'input', '--source': 'sourceId', '--batch': 'batchKey', '--format': 'format', '--job-dir': 'jobDirectory', '--as-of': 'asOf' }[args[i]];
    if (key && args[i + 1]) options[key] = args[++i];
    else if (args[i] === '--write') options.write = true;
    else if (args[i] === '--dry-run') options.write = false;
    else if (args[i] === '--private') options.publicGit = false;
    else throw error('INVALID_ARGUMENT', 'Usage: library:import --input file --source id --batch key [--format jsonl|csv] [--dir directory] [--job-dir outside-repo] [--as-of UTC] [--write|--dry-run] [--private]');
  }
  const controller = new AbortController(); const cancel = () => controller.abort();
  process.once('SIGINT', cancel); process.once('SIGTERM', cancel);
  try {
    const result = await importCandidates({ ...options, signal: controller.signal });
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    return result.state === 'cancelled' ? 130 : result.failures.length ? 1 : 0;
  } finally { process.removeListener('SIGINT', cancel); process.removeListener('SIGTERM', cancel); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().then(code => { process.exitCode = code; }).catch(failure => { process.stderr.write(`${failure.code ?? 'IMPORT_FAILED'}: ${failure.message}\n`); process.exitCode = 1; });
