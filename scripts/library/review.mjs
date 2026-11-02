import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { CATALOG_FILES, CATALOG_TRANSACTION_FILE, MAX_FILE_BYTES, canonicalJson, hashJson, parseJsonStrict, readCatalog, validateRecord, validateCatalog, entityKey, reviewContentHash, reviewEventHash, LibraryValidationError } from './contract.mjs';
import { directoryPath, regularFile, withDirectoryLock, writeAtomic } from './files.mjs';
import { buildSnapshot, suspendUnsafeOutput, inspectSnapshotStaging } from './snapshot.mjs';
import { loadReferenceContext } from './validate.mjs';

const COLLECTIONS = { source: 'sources', item: 'items', item_locale: 'item_locales', evidence: 'evidence', editorial_selection: 'editorial_selections', item_topic: 'item_topics', item_relation: 'item_relations' };
const fail = (code, message, issues) => { throw new LibraryValidationError(code, message, issues); };
const digest = text => createHash('sha256').update(text).digest('hex');
const serialized = (catalog, key) => CATALOG_FILES[key].endsWith('.jsonl') ? catalog[key].map(canonicalJson).join('\n') + (catalog[key].length ? '\n' : '') : canonicalJson(catalog[key]) + '\n';
function subject(catalog, type, id) {
  if (type === 'reason') {
    for (const local of catalog.item_locales) for (const reason of local.recommendation_reasons) {
      const identity = { itemId: local.item_id, locale: local.locale };
      if (entityKey(type, reason, identity) === id) return { record: reason, identity, itemId: local.item_id };
    }
    return null;
  }
  const record = catalog[COLLECTIONS[type]]?.find(row => entityKey(type, row) === id);
  return record ? { record, identity: {}, itemId: record.item_id ?? (type === 'item' ? record.id : null) } : null;
}
const revision = (type, record) => type === 'reason' ? record.source_revision : record.revision;
function authorize(command) {
  const { role, action, entity_type: type } = command;
  if (role === 'rights_reviewer' ? action !== 'approve_rights' || !['source', 'item'].includes(type) : role === 'publisher' ? type !== 'item' || !['publish', 'restore', 'takedown', 'archive', 'quarantine'].includes(action) : !['revise', 'approve', 'reject'].includes(action) || type === 'source') fail('REVIEW_ROLE_DENIED', 'The declared operator role does not permit this target/action.');
  if (action !== 'revise' && command.replacement) fail('INVALID_ARGUMENT', 'Replacement content requires an explicit revise operation.');
  if ((command.check && !(type === 'item' && action === 'approve')) || (command.verification_scope && !(type === 'evidence' && action === 'approve'))) fail('INVALID_ARGUMENT', 'Check/scope does not apply to this entity/action.');
}
export function inspectReview(catalog, type, id) {
  const found = subject(catalog, type, id);
  if (!found) fail('ITEM_NOT_FOUND', 'Review target does not exist.');
  return { schema_version: 'library-review-inspect/v1', entity_type: type, entity_id: id, revision: revision(type, found.record), content_hash: reviewContentHash(type, found.record, found.identity), catalog_hash: hashJson(catalog), state: found.record.status ?? found.record.abstract_status ?? found.record.review_status ?? null };
}

export function planReview(catalog, command, context) {
  const checked = validateRecord('operator_command', command);
  if (!checked.valid) fail('INVALID_REVIEW_COMMAND', 'Review command does not match its strict schema.', checked.errors);
  authorize(command);
  const commandHash = hashJson(command); const doneId = `operator_${command.id}_done`;
  const old = catalog.review_log.find(event => event.event_id === doneId);
  if (old) {
    if (!old.redacted_diff.some(diff => diff.field === 'operator_command' && diff.after_hash === commandHash)) fail('REVIEW_CONFLICT', 'Operation ID was used for different command bytes.');
    return { catalog, replayed: true, commandHash, changes: [] };
  }
  if (command.expected_catalog_hash !== hashJson(catalog)) fail('REVIEW_CONFLICT', 'Catalog changed after inspection.');
  const next = structuredClone(catalog); const { entity_type: type, entity_id: id, action } = command;
  let found = subject(next, type, id);
  if (found ? revision(type, found.record) !== command.expected_revision || reviewContentHash(type, found.record, found.identity) !== command.expected_content_hash : command.expected_revision !== 0 || command.expected_content_hash !== null) fail('REVIEW_CONFLICT', 'Expected revision/content hash does not match.');
  const append = (targetType, record, eventAction, state, { identity = {}, expected = revision(targetType, record), from = null, final = false, reason = command.reason } = {}) => {
    const event = { schema_version: '1.1.0', event_id: final ? doneId : `operator_${command.id}_${next.review_log.length + 1}`, entity_type: targetType, entity_id: entityKey(targetType, record, identity), action: eventAction, from_state: from, to_state: state, expected_revision: expected, next_revision: revision(targetType, record), subject_hash: reviewContentHash(targetType, record, identity), redacted_diff: final ? [{ field: 'operator_command', before_hash: null, after_hash: commandHash }] : [], reason, reviewer_id: command.actor, reviewer_role: command.role, created_at: command.as_of, previous_event_hash: next.review_log.at(-1)?.event_hash ?? null };
    event.event_hash = reviewEventHash(event); next.review_log.push(event); return event.event_id;
  };
  const invalidateItem = itemId => {
    const item = next.items.find(row => row.id === itemId); if (!item) return;
    const previous = item.revision; const from = item.status; item.revision++; item.updated_at = command.as_of; item.status = 'pending_review'; item.rights_status = 'pending'; item.published_at = null;
    item.checks = { metadata_valid: { passed: false, review_event_id: null }, rights_checked: { passed: false, review_event_id: null }, evidence_checked: { passed: false, review_event_id: null }, content_status: 'needs_review' };
    for (const local of next.item_locales.filter(row => row.item_id === itemId)) {
      const prior = local.revision; const localFrom = local.abstract_status; local.revision++; local.source_revision = item.revision; local.abstract_status = 'draft'; local.review_event_id = null; local.reviewed_at = null;
      for (const reason of local.recommendation_reasons) { reason.source_revision = item.revision; reason.review_event_id = null; }
      append('item_locale', local, 'revise', 'draft', { expected: prior, from: localFrom, reason: 'Dependent trilingual approval invalidated by the explicit item/content revision: ' + command.reason });
    }
    append('item', item, 'revise', 'pending_review', { expected: previous, from, reason: command.reason });
  };
  if (action === 'revise') {
    if (!command.replacement || type === 'reason' || type === 'source') fail('INVALID_ARGUMENT', 'Revise requires a complete supported replacement record.');
    const structure = validateRecord(type, command.replacement);
    if (!structure.valid) fail('INVALID_REPLACEMENT', 'Replacement record is invalid.', structure.errors);
    if (entityKey(type, command.replacement) !== id || command.replacement.revision !== command.expected_revision + 1) fail('REVIEW_CONFLICT', 'Replacement must preserve identity and increment revision once.');
    if (found && type === 'item' && ['id', 'slug', 'kind', 'canonical_key', 'canonical_url', 'identifiers', 'created_at'].some(field => canonicalJson(found.record[field]) !== canonicalJson(command.replacement[field]))) fail('IMMUTABLE_IDENTITY', 'Editorial revision cannot retarget a published identity or slug; use the separate reviewed identity workflow.');
    if (found?.itemId && command.replacement.item_id && found.itemId !== command.replacement.item_id) fail('IMMUTABLE_IDENTITY', 'An existing record cannot be moved to a different item.');
    if (found && ['item', 'item_locale'].includes(type)) {
      const itemId = found.itemId; invalidateItem(itemId);
      if (type === 'item') {
        const item = next.items.find(row => row.id === itemId);
        const workflow = { revision: item.revision, status: item.status, rights_status: item.rights_status, checks: item.checks, updated_at: item.updated_at, published_at: null };
        Object.assign(item, command.replacement, workflow);
      } else {
        const local = next.item_locales.find(row => entityKey(type, row) === id); const item = next.items.find(row => row.id === itemId);
        Object.assign(local, command.replacement, { revision: local.revision, source_revision: item.revision, abstract_status: 'draft', reviewed_at: null, review_event_id: null });
        for (const reason of local.recommendation_reasons) { reason.source_revision = item.revision; reason.review_event_id = null; }
      }
    } else {
      if (!found && !['evidence', 'editorial_selection', 'item_topic', 'item_relation', 'item_locale'].includes(type)) fail('INVALID_ARGUMENT', 'This entity cannot be created by the editorial command.');
      const replacement = structuredClone(command.replacement); replacement.review_event_id = null;
      if ('review_status' in replacement) replacement.review_status = type === 'evidence' ? 'needs_review' : 'pending_review';
      if (type === 'item_locale') { replacement.abstract_status = 'draft'; replacement.reviewed_at = null; for (const reason of replacement.recommendation_reasons) reason.review_event_id = null; }
      const collection = next[COLLECTIONS[type]];
      if (found) collection[collection.indexOf(found.record)] = replacement; else collection.push(replacement);
      if (found && ['evidence', 'editorial_selection'].includes(type)) {
        invalidateItem(found.itemId);
        for (const local of next.item_locales.filter(row => row.item_id === found.itemId)) for (const reason of local.recommendation_reasons) if (id in reason.basis_revisions) reason.basis_revisions[id] = replacement.revision;
      }
    }
    found = subject(next, type, id); append(type, found.record, 'revise', 'needs_review', { identity: found.identity, expected: command.expected_revision, final: true });
  } else {
    if (!found) fail('ITEM_NOT_FOUND', 'Review target does not exist.');
    const record = found.record;
    if (action === 'approve_rights') {
      if (type === 'source') { record.status = 'approved'; record.approved_by = command.actor; record.approved_at = command.as_of; record.last_legal_review_at = command.as_of; record.review_event_id = append(type, record, action, 'approved', { final: true }); }
      else { record.rights_status = 'approved'; record.checks.rights_checked = { passed: true, review_event_id: append(type, record, action, 'approved', { final: true }) }; }
    } else if (type === 'item' && action === 'approve') {
      if (!command.check) fail('INVALID_ARGUMENT', 'Item approval needs an explicit check.');
      if (command.check === 'content_status') {
        const group = next.item_locales.filter(row => row.item_id === id);
        if (group.length !== 3 || group.some(row => row.abstract_status !== 'reviewed' || !row.editorial_body.trim())) fail('TRILINGUAL_CONTENT_REQUIRED', 'Content approval requires three reviewed complete locales.');
        record.checks.content_status = 'approved'; append(type, record, action, 'content_status', { final: true });
      } else record.checks[command.check] = { passed: true, review_event_id: append(type, record, action, command.check, { final: true }) };
    } else if (type === 'item' && ['publish', 'restore', 'takedown', 'quarantine', 'archive', 'reject'].includes(action)) {
      const states = { publish: 'published', restore: 'pending_review', takedown: 'takedown', quarantine: 'quarantined', archive: 'archived', reject: 'rejected' };
      if (action === 'publish' && !['draft', 'pending_review'].includes(record.status)) fail('INVALID_TRANSITION', 'Publish requires a draft/pending item; restore withdrawn items explicitly.');
      if (action === 'restore' && !['takedown', 'archived', 'quarantined', 'rejected'].includes(record.status)) fail('INVALID_TRANSITION', 'Only a withdrawn item can be restored for review.');
      const from = record.status; record.status = states[action]; record.published_at = action === 'publish' ? command.as_of : null;
      if (action !== 'publish') { record.rights_status = 'pending'; record.checks = { metadata_valid: { passed: false, review_event_id: null }, rights_checked: { passed: false, review_event_id: null }, evidence_checked: { passed: false, review_event_id: null }, content_status: 'needs_review' }; }
      append(type, record, action, record.status, { from, final: true });
    } else if (action === 'approve') {
      let state = 'approved';
      if (type === 'item_locale') { record.abstract_status = 'reviewed'; record.reviewed_at = command.as_of; state = 'reviewed'; }
      else if (type === 'reason') state = 'reviewed';
      else if (type === 'evidence') {
        if (!command.verification_scope) fail('VERIFICATION_SCOPE_REQUIRED', 'Evidence approval requires an explicit checked reading scope.');
        const source = next.sources.find(row => row.id === record.source_id);
        if ((command.verification_scope === 'source_text' && !source?.allowed_fields.derive.includes('evidence_kind')) || (record.evidence_kind === 'recommendation' && (command.verification_scope !== 'source_text' || source?.source_kind === 'owned'))) fail('UNVERIFIED_EVIDENCE', 'Metadata-only or owned editorial inputs cannot manufacture outside recommendations.');
        record.review_status = 'verified'; state = 'verified';
      } else if (type === 'editorial_selection') { if (record.reviewer_id !== command.actor) fail('REVIEWER_MISMATCH', 'Editorial selection must name the actual approving actor.'); }
      else { record.review_status = 'approved'; record.reviewed_at = command.as_of; if ('reviewed_by' in record) record.reviewed_by = command.actor; }
      record.review_event_id = append(type, record, action, state, { identity: found.identity, final: true, reason: command.verification_scope ? `[scope:${command.verification_scope}] ${command.reason}` : command.reason });
    } else if (action === 'reject') {
      if (['evidence', 'editorial_selection', 'item_locale', 'reason'].includes(type)) invalidateItem(found.itemId);
      if ('review_status' in record) record.review_status = 'rejected';
      if ('abstract_status' in record) record.abstract_status = 'draft';
      record.review_event_id = null; append(type, record, action, 'rejected', { identity: found.identity, final: true });
    } else fail('INVALID_TRANSITION', 'Unsupported entity/action transition.');
  }
  const result = validateCatalog(next, { asOf: command.as_of, context });
  if (!result.valid) fail('REVIEW_VALIDATION_FAILED', 'The proposed operation cannot bypass current publication, rights or trilingual checks.', result.errors);
  const changes = Object.keys(CATALOG_FILES).filter(key => serialized(catalog, key) !== serialized(next, key)).map(key => ({ collection: key, before_hash: digest(serialized(catalog, key)), after_hash: digest(serialized(next, key)) }));
  return { catalog: next, replayed: false, commandHash, changes };
}

async function journalState(directory, journal) {
  if (journal.schema_version !== 'library-review-transaction/v1' || journal.directory !== directory || typeof journal.output !== 'string' || !path.isAbsolute(journal.output) || !Array.isArray(journal.files) || journal.files.length !== Object.keys(CATALOG_FILES).length) fail('INVALID_TRANSACTION', 'Unexpected transaction target or shape.');
  const names = new Set(Object.values(CATALOG_FILES));
  for (const file of journal.files) {
    if (!names.delete(file.name) || typeof file.before !== 'string' || typeof file.after !== 'string' || digest(file.before) !== file.before_hash || digest(file.after) !== file.after_hash) fail('INVALID_TRANSACTION', 'Transaction files or hashes are invalid.');
    await regularFile(path.join(directory, file.name));
    const actual = digest(await fs.readFile(path.join(directory, file.name)));
    if (actual !== file.before_hash && actual !== file.after_hash) fail('REVIEW_CONFLICT', 'A catalog file changed outside the interrupted transaction; reconcile explicitly.');
  }
  if (names.size) fail('INVALID_TRANSACTION', 'Transaction is incomplete.');
}
async function applyJournal(directory, journal, mode) {
  await journalState(directory, journal);
  for (const file of journal.files.filter(file => file.before_hash !== file.after_hash)) await writeAtomic(path.join(directory, file.name), file[mode]);
}
export async function recoverReview({ directory, output, transactionHash, mode = 'after', write = false, context, asOf = new Date().toISOString(), stagingName = null, stagingHash = null } = {}) {
  const root = await directoryPath(directory);
  if (!['before', 'after'].includes(mode) || !output) fail('INVALID_ARGUMENT', 'Recovery requires an output target and before/after mode.');
  const run = async () => {
    const journal = parseJsonStrict(await fs.readFile(path.join(root, CATALOG_TRANSACTION_FILE)));
    if (hashJson(journal) !== transactionHash) fail('REVIEW_CONFLICT', 'Expected transaction hash does not match.');
    if (path.resolve(output) !== journal.output) fail('REVIEW_CONFLICT', 'Recovery output target differs from the interrupted operation.');
    const residues = await inspectSnapshotStaging(output);
    const stagingReceipt = stagingName || stagingHash ? { name: stagingName, hash: stagingHash } : null;
    if (stagingReceipt && !residues.some(row => row.name === stagingName && row.hash === stagingHash)) fail('REVIEW_CONFLICT', 'Staging name/hash must match the current status observation.');
    if (residues.some(row => row.name !== stagingName)) fail('STAGING_RECONCILIATION_REQUIRED', 'Inspect status and explicitly select one disposable staging directory with its current hash.', residues);
    await journalState(root, journal);
    const current = await readCatalog(root, { transactionHash });
    for (const [key, file] of Object.entries(CATALOG_FILES)) {
      const entry = journal.files.find(row => row.name === file);
      current[key] = file.endsWith('.jsonl') ? entry[mode].trim() ? entry[mode].trim().split('\n').map(line => parseJsonStrict(line)) : [] : parseJsonStrict(entry[mode]);
    }
    const references = context ?? await loadReferenceContext(process.cwd(), current);
    const result = validateCatalog(current, { context: references, asOf });
    if (!result.valid) fail('INVALID_TRANSACTION', 'Recovered content no longer passes its contract.', result.errors);
    if (write) { await suspendUnsafeOutput(output, { create: true, stagingReceipt }); await applyJournal(root, journal, mode); await buildSnapshot({ catalog: current, context: references, directory: output, asOf }); await fs.unlink(path.join(root, CATALOG_TRANSACTION_FILE)); }
    return { schema_version: 'library-review-result/v1', dry_run: !write, recovered: mode, transaction_hash: transactionHash, eligible_after: result.eligibleItemIds.length };
  };
  return write ? withDirectoryLock(root, run) : run();
}
export async function applyReview({ directory, output, command, write = false, context, signal, asOf = new Date().toISOString() } = {}) {
  const root = await directoryPath(directory);
  if (!output) fail('INVALID_ARGUMENT', 'An explicit local public-output target is required.');
  const checked = validateRecord('operator_command', command);
  if (!checked.valid) fail('INVALID_REVIEW_COMMAND', 'Review command does not match its strict schema.', checked.errors);
  authorize(command);
  const run = async () => {
    const catalog = await readCatalog(root); const references = context ?? await loadReferenceContext(process.cwd(), catalog);
    const before = validateCatalog(catalog, { asOf, context: references });
    if (!before.valid) { if (write) await buildSnapshot({ catalog, context: references, directory: output, asOf }); fail('CATALOG_INVALID', 'Current catalog is not eligible for an operator mutation.', before.errors); }
    const planned = planReview(catalog, command, references);
    const validation = validateCatalog(planned.catalog, { asOf, context: references });
    if (!validation.valid) fail('REVIEW_VALIDATION_FAILED', 'Current-time qualification failed.', validation.errors);
    const response = { schema_version: 'library-review-result/v1', dry_run: !write, operation_id: command.id, command_hash: planned.commandHash, replayed: planned.replayed, changes: planned.changes, eligible_before: before.eligibleItemIds.length, eligible_after: validation.eligibleItemIds.length, projection: write ? 'rebuilt' : 'not-written' };
    if (!write) return response;
    if (signal?.aborted) fail('CANCELLED', 'Review cancelled before mutation.');
    if (planned.replayed) { await buildSnapshot({ catalog, context: references, directory: output, asOf }); return response; }
    const changed = new Set(planned.changes.map(row => row.collection));
    const journal = { schema_version: 'library-review-transaction/v1', directory: root, output: path.resolve(output), as_of: asOf, command_hash: planned.commandHash, files: await Promise.all(Object.entries(CATALOG_FILES).map(async ([key, name]) => { const bytes = await fs.readFile(path.join(root, name), 'utf8'); const after = changed.has(key) ? serialized(planned.catalog, key) : bytes; return { name, before: bytes, after, before_hash: digest(bytes), after_hash: digest(after) }; })) };
    const encoded = canonicalJson(journal) + '\n'; if (Buffer.byteLength(encoded) > MAX_FILE_BYTES) fail('LIMIT_EXCEEDED', 'Operator transaction exceeds the bounded recovery-file size.');
    await suspendUnsafeOutput(output, { create: true });
    await writeAtomic(path.join(root, CATALOG_TRANSACTION_FILE), encoded, { mode: 0o600 });
    try {
      for (const file of journal.files.filter(file => file.before_hash !== file.after_hash)) { if (signal?.aborted) fail('CANCELLED', 'Review cancelled during commit.'); await writeAtomic(path.join(root, file.name), file.after); }
      await buildSnapshot({ catalog: planned.catalog, context: references, directory: output, asOf });
      await fs.unlink(path.join(root, CATALOG_TRANSACTION_FILE));
    } catch (error) {
      try { await suspendUnsafeOutput(output); await applyJournal(root, journal, 'before'); await fs.unlink(path.join(root, CATALOG_TRANSACTION_FILE)); error.rolled_back = true; }
      catch (repair) { error.recovery_required = true; error.transaction_hash = hashJson(journal); error.recovery_error = repair.code; }
      throw error;
    }
    return response;
  };
  return write ? withDirectoryLock(root, run) : run();
}

export async function main(args = process.argv.slice(2)) {
  if (args[0] === '--help') { process.stdout.write('library:review inspect --type TYPE --id ID [--dir DIR]\nlibrary:review apply --input command.json [--dir DIR --out OUTPUT --write]\nlibrary:review status [--dir DIR]\nlibrary:review recover --transaction-hash SHA --mode before|after [--dir DIR --out OUTPUT --staging NAME --staging-hash SHA --write]\n'); return 0; }
  const action = args.shift(); const options = { directory: path.resolve('data/library'), output: path.resolve('public/data/library/v1'), write: false };
  for (let i = 0; i < args.length; i++) {
    const key = { '--dir': 'directory', '--out': 'output', '--input': 'input', '--type': 'type', '--id': 'id', '--transaction-hash': 'transactionHash', '--mode': 'mode', '--staging': 'stagingName', '--staging-hash': 'stagingHash' }[args[i]];
    if (key && args[i + 1]) options[key] = args[++i]; else if (args[i] === '--write') options.write = true; else if (args[i] === '--dry-run') options.write = false; else fail('INVALID_ARGUMENT', 'Unknown or incomplete review argument; use --help.');
  }
  if (options.write && path.resolve(options.directory) !== path.resolve('data/library') && path.resolve(options.output) === path.resolve('public/data/library/v1') && !args.includes('--out')) fail('INVALID_ARGUMENT', 'A nondefault catalog requires an explicit --out target when writing.');
  if (action !== 'recover' && (options.stagingName || options.stagingHash)) fail('INVALID_ARGUMENT', 'Staging reconciliation flags apply only to explicit recovery.');
  const controller = new AbortController(); const cancel = () => controller.abort(); process.once('SIGINT', cancel); process.once('SIGTERM', cancel);
  try {
    let result;
    if (action === 'inspect') result = inspectReview(await readCatalog(options.directory), options.type, options.id);
    else if (action === 'status') { const journal = parseJsonStrict(await fs.readFile(path.join(options.directory, CATALOG_TRANSACTION_FILE))); result = { schema_version: 'library-review-status/v1', state: 'recovery-required', transaction_hash: hashJson(journal), as_of: journal.as_of, staging: await inspectSnapshotStaging(journal.output) }; }
    else if (action === 'recover') result = await recoverReview(options);
    else if (action === 'apply' && options.input) result = await applyReview({ ...options, command: parseJsonStrict(await fs.readFile(options.input)), signal: controller.signal });
    else fail('INVALID_ARGUMENT', 'Use inspect, apply, status or recover; see --help.');
    process.stdout.write(JSON.stringify(result, null, 2) + '\n'); return 0;
  } finally { process.removeListener('SIGINT', cancel); process.removeListener('SIGTERM', cancel); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().then(code => { process.exitCode = code; }).catch(error => { process.stderr.write(JSON.stringify({ code: error.code ?? 'REVIEW_FAILED', message: error.message, issues: error.issues, rolled_back: error.rolled_back, recovery_required: error.recovery_required, transaction_hash: error.transaction_hash }) + '\n'); process.exitCode = error.code === 'CANCELLED' ? 130 : 1; });
