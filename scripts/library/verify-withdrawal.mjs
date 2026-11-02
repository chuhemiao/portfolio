import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readCatalog, hashJson, canonicalJson, CATALOG_FILES } from './contract.mjs';
import { inspectReview, applyReview } from './review.mjs';
import { readCurrentLibrary } from './public-reader.mjs';
import { readSnapshot, buildSnapshot } from './snapshot.mjs';
import { loadReferenceContext } from './validate.mjs';
import { resolveGeneratedDir } from '../lib/content/paths.mjs';
import { withDirectoryLock } from './files.mjs';

const evidence = process.argv[2];
if (!evidence || process.env.LIBRARY_CONTROLLED_VM !== '1') throw new Error('This destructive scenario requires LIBRARY_CONTROLLED_VM=1 and a disposable VM source copy.');
const root = process.cwd();
assert.equal(root, '/vercel/portfolio', 'scenario is bound to the assigned disposable VM path');
const directory = path.join(root, 'data/library'); const output = path.join(root, 'public/data/library/v1');
const targetId = 'lib_7f58f540cbcb986317e8999fb359a5bf';
const snapshot = await readCurrentLibrary(root); const target = snapshot.items.find(item => item.id === targetId); assert.ok(target);
const baseline = await readCatalog(directory); const context = await loadReferenceContext(root, baseline);
const baselineFiles = new Map(await Promise.all(Object.values(CATALOG_FILES).map(async name => [name, await fs.readFile(path.join(directory, name))])));
const old = path.join(evidence, 'old-artifact-probe'); await fs.mkdir(old, { recursive: true });
const oldData = path.join(old, 'data'); await fs.cp(output, oldData, { recursive: true });
const report = { schema_version: 'library-withdrawal-check/v1', target_id: targetId, target_slug: target.slug, baseline_snapshot: snapshot.manifest.snapshot_id, baseline_count: snapshot.items.length, operations: [], cases: [], builds: [], production_changed: false, limits: ['Disposable VM copy only. Mac catalog and production/CDN were not mutated.', 'Old static HTML can remain readable in an old deployment or a loaded tab; controlled fresh export consistency does not prove production purge.'] };
report.baseline_file_sha256 = Object.fromEntries([...baselineFiles].map(([name, bytes]) => [name, createHash('sha256').update(bytes).digest('hex')]));
const mark = (name, outcome) => { report.cases.push({ name, ...outcome }); console.log(JSON.stringify(report.cases.at(-1))); };
for (const prefix of ['', '/zh-CN', '/en', '/ja']) { const filename = path.join(root, 'out', `${prefix ? prefix.slice(1) + '/' : ''}library/items/${target.slug}.html`); const bytes = await fs.readFile(filename); await fs.writeFile(path.join(old, `${prefix.slice(1) || 'legacy'}.html`), bytes); }
let operation = 0;
async function command(action, role, check) {
  const catalog = await readCatalog(directory); const observed = inspectReview(catalog, 'item', targetId);
  const value = { schema_version: 'library-review-command/v1', id: `m4-vm-${Date.now()}-${operation++}`, actor: 'codex-library-m4-controlled-validation', role, action, entity_type: 'item', entity_id: targetId, expected_revision: observed.revision, expected_content_hash: observed.content_hash, expected_catalog_hash: observed.catalog_hash, reason: 'Disposable VM validation only: preserve the known source and test actual takedown/restore gates; no production or human research approval.', as_of: new Date().toISOString(), ...(check ? { check } : {}) };
  const result = await applyReview({ directory, output, command: value, write: true }); report.operations.push({ command: value, result });
}
async function run(command, args, logName, env = {}) {
  const start = performance.now(); const log = await fs.open(path.join(evidence, logName), 'w');
  const child = spawn(command, args, { cwd: root, env: { ...process.env, CI: '1', NEXT_TELEMETRY_DISABLED: '1', ...env }, stdio: ['ignore', log.fd, log.fd] });
  const code = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', resolve); }); await log.close();
  const value = { command, args, exit_code: code, wall_seconds: (performance.now() - start) / 1000, log: logName }; report.builds.push(value); assert.equal(code, 0, JSON.stringify(value));
}
try {
  await assert.rejects(readSnapshot(oldData, { currentCatalog: baseline, context, asOf: snapshot.manifest.valid_until }), { code: 'SNAPSHOT_EXPIRED' }); mark('exact-expiry', { status: 'passed' });
  const bad = path.join(evidence, 'bad-hash'); await fs.cp(oldData, bad, { recursive: true }); const itemsFile = path.join(bad, 'snapshots', snapshot.manifest.snapshot_id, 'items.json'); await fs.appendFile(itemsFile, ' ');
  await assert.rejects(readSnapshot(bad, { currentCatalog: baseline, context }), { code: 'SNAPSHOT_CHECKSUM_INVALID' }); mark('bad-hash', { status: 'passed' });
  const mixed = path.join(evidence, 'mixed-version'); await fs.cp(oldData, mixed, { recursive: true }); const mixedFile = path.join(mixed, 'snapshots', snapshot.manifest.snapshot_id, 'items.json'); const wrapper = JSON.parse(await fs.readFile(mixedFile)); wrapper.snapshot_id = 'sha256-' + 'f'.repeat(64); const bytes = Buffer.from(canonicalJson(wrapper) + '\n'); await fs.writeFile(mixedFile, bytes); const mixedManifest = structuredClone(snapshot.manifest); mixedManifest.files['items.json'].sha256 = createHash('sha256').update(bytes).digest('hex'); mixedManifest.files['items.json'].bytes = bytes.length; mixedManifest.checksum = 'sha256-' + hashJson(mixedManifest.files); await fs.writeFile(path.join(mixed, 'manifest.json'), canonicalJson(mixedManifest) + '\n');
  await assert.rejects(readSnapshot(mixed, { currentCatalog: baseline, context }), { code: 'SNAPSHOT_VERSION_MISMATCH' }); mark('mixed-version', { status: 'passed' });
  const revokedOutput = path.join(evidence, 'revoked-source'); await fs.cp(oldData, revokedOutput, { recursive: true }); const revoked = structuredClone(baseline); revoked.sources.find(source => source.id === baseline.items.find(item => item.id === targetId).source_id).status = 'revoked';
  await assert.rejects(buildSnapshot({ catalog: revoked, context, directory: revokedOutput, asOf: new Date().toISOString() }), { code: 'CATALOG_INVALID' }); await assert.rejects(fs.stat(path.join(revokedOutput, 'manifest.json')), { code: 'ENOENT' }); mark('revoked-source-suspends-output', { status: 'passed' });
  await command('takedown', 'publisher'); const withdrawn = await readCurrentLibrary(root); assert.equal(withdrawn.items.length, snapshot.items.length - 1); assert.ok(!withdrawn.items.some(item => item.id === targetId));
  await assert.rejects(readSnapshot(oldData, { currentCatalog: await readCatalog(directory), context }), { code: 'SNAPSHOT_STALE' }); mark('old-approved-snapshot-refused', { status: 'passed' });
  await run('pnpm', ['build'], 'takedown-full-build.log'); await run('node', ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', 'scripts/library/check-export.mjs', path.join(evidence, 'takedown-export.json')], 'takedown-export-check.log');
  for (const prefix of ['', '/zh-CN', '/en', '/ja']) await assert.rejects(fs.stat(path.join(root, 'out', `${prefix ? prefix.slice(1) + '/' : ''}library/items/${target.slug}.html`)), { code: 'ENOENT' });
  const relations = baseline.item_relations.filter(relation => relation.item_id === targetId && relation.existing_entity_type === 'article');
  for (const relation of relations) { const index = JSON.parse(await fs.readFile(path.join(resolveGeneratedDir(root), 'blog-index.json'))); for (const post of index.posts.filter(post => post.translationKey === relation.article_translation_key)) { const html = await fs.readFile(path.join(root, 'out', `${post.language}/blog/${post.slug}.html`), 'utf8'); assert.ok(!html.includes(`/library/items/${target.slug}`)); } }
  const topicSlugs = baseline.item_topics.filter(mapping => mapping.item_id === targetId && mapping.review_status === 'approved').map(mapping => mapping.existing_topic_slug);
  for (const prefix of ['', '/zh-CN', '/en', '/ja']) for (const suffix of ['/library', ...topicSlugs.map(slug => `/topics/${slug}`)]) assert.ok(!(await fs.readFile(path.join(root, 'out', prefix.slice(1), `${suffix.slice(1)}.html`), 'utf8')).includes(`/library/items/${target.slug}`));
  await assert.rejects(fs.stat(path.join(root, 'out/data/library/v1/snapshots', snapshot.manifest.snapshot_id)), { code: 'ENOENT' });
  await run('node', ['scripts/library/verify-stale-state.mjs', evidence, targetId, target.slug], 'stale-state-browser.log');
  mark('real-takedown-export', { status: 'passed', new_library_html_count: JSON.parse(await fs.readFile(path.join(evidence, 'takedown-export.json'))).library_html_count, detail_routes_removed: 4, related_article_groups: relations.length });
  mark('old-html-artifact-limit', { status: 'documented-limitation', old_html_still_contains_editorial_note: (await fs.readFile(path.join(old, 'en.html'), 'utf8')).includes(target.locales.en.title), production_purge: 'not-run' });
  await command('restore', 'publisher'); await command('approve_rights', 'rights_reviewer'); await command('approve', 'editor', 'metadata_valid'); await command('approve', 'editor', 'evidence_checked'); await command('approve', 'editor', 'content_status'); await command('publish', 'publisher');
  assert.equal((await readCurrentLibrary(root)).items.length, snapshot.items.length);
  mark('proper-reviewed-restoration', { status: 'passed', item_count: snapshot.items.length, note: 'Actual lifecycle commands reapproved the revised VM record before resetting this disposable test fixture.' });
  await withDirectoryLock(directory, async () => { for (const [name, bytes] of baselineFiles) await fs.writeFile(path.join(directory, name), bytes); });
  report.restored_file_sha256 = Object.fromEntries(await Promise.all([...baselineFiles.keys()].map(async name => [name, createHash('sha256').update(await fs.readFile(path.join(directory, name))).digest('hex')])));
  assert.deepEqual(report.restored_file_sha256, report.baseline_file_sha256);
  mark('controlled-fixture-baseline-restored', { status: 'passed', note: 'Exact named file bytes restored in this VM only, not a production audit-log rollback. All lifecycle receipts remain in this report.' });
  await run('pnpm', ['build'], 'restore-full-build.log'); await run('node', ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', 'scripts/library/check-export.mjs', path.join(evidence, 'restore-export.json')], 'restore-export-check.log'); mark('known-allowed-source-restored', { status: 'passed', item_count: snapshot.items.length });
  report.status = 'passed';
} catch (error) { report.status = 'failed'; report.error = { message: String(error), stack: error.stack, code: error.code }; throw error; }
finally { await fs.writeFile(path.join(evidence, 'withdrawal-report.json'), JSON.stringify(report, null, 2) + '\n'); }
