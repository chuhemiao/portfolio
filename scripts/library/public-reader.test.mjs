import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { CATALOG_FILES, canonicalJson } from './contract.mjs';
import { publishedFixture, FIXTURE_AS_OF } from './fixtures/catalog.mjs';
import { buildSnapshot } from './snapshot.mjs';
import { withDirectoryLock } from './files.mjs';
import { loadReferenceContext } from './validate.mjs';
import { readCurrentLibrary } from './public-reader.mjs';

async function setup(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'library-public-reader-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const directory = path.join(root, 'data/library'); await fs.mkdir(directory, { recursive: true });
  const { catalog } = publishedFixture();
  for (const [key, name] of Object.entries(CATALOG_FILES)) await fs.writeFile(path.join(directory, name), name.endsWith('.jsonl') ? catalog[key].map(canonicalJson).join('\n') + (catalog[key].length ? '\n' : '') : canonicalJson(catalog[key]) + '\n');
  const context = await loadReferenceContext(root, catalog);
  const output = path.join(root, 'public/data/library/v1');
  await buildSnapshot({ catalog, context, directory: output, asOf: FIXTURE_AS_OF, codeVersion: 'public-reader-fixture-v1' });
  return { root, directory, output };
}

test('four parallel static-page readers wait for the real exclusive lock and consume the same verified snapshot', async t => {
  const { root, directory } = await setup(t);
  const results = await Promise.allSettled(Array.from({ length: 4 }, () => readCurrentLibrary(root, FIXTURE_AS_OF)));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 4, JSON.stringify(results.map(result => result.status === 'rejected' ? result.reason.code : result.value.items.length)));
  assert.equal(new Set(results.map(result => result.value.manifest.snapshot_id)).size, 1);
  assert.ok(results.every(result => result.value.items.length === 1));
  await assert.rejects(fs.lstat(path.join(directory, '.library.lock')), { code: 'ENOENT' });
});

test('an unreleased lock times out without being removed or read through', { timeout: 15000 }, async t => {
  const { root, directory } = await setup(t);
  const lock = path.join(directory, '.library.lock');
  await withDirectoryLock(directory, async () => {
    const before = await fs.readFile(lock, 'utf8');
    await assert.rejects(readCurrentLibrary(root, FIXTURE_AS_OF), { code: 'WRITE_LOCKED' });
    assert.equal(await fs.readFile(lock, 'utf8'), before);
  });
});

test('checksum errors still fail immediately instead of returning an older or partially verified collection', async t => {
  const { root, output } = await setup(t);
  const manifest = JSON.parse(await fs.readFile(path.join(output, 'manifest.json')));
  const filename = path.join(output, 'snapshots', manifest.snapshot_id, 'items.json');
  const bytes = await fs.readFile(filename); await fs.writeFile(filename, Buffer.concat([bytes, Buffer.from(' ')]));
  await assert.rejects(readCurrentLibrary(root, FIXTURE_AS_OF), { code: 'SNAPSHOT_CHECKSUM_INVALID' });
});

test('interrupted operator transactions remain refused without a retry or partial result', async t => {
  const { root, directory } = await setup(t);
  await fs.writeFile(path.join(directory, '.library-transaction.json'), '{}');
  await assert.rejects(readCurrentLibrary(root, FIXTURE_AS_OF), { code: 'CATALOG_TRANSACTION_PENDING' });
  await assert.rejects(fs.lstat(path.join(directory, '.library.lock')), { code: 'ENOENT' });
});

test('a failed build-process snapshot promise can recover after the observed file failure is repaired', async t => {
  const { root } = await setup(t);
  const moduleUrl = pathToFileURL(path.resolve('src/lib/library/catalog.ts')).href;
  const siteModels = Object.fromEntries(['topics', 'research-projects'].map(name => [`@/data/${name}`, pathToFileURL(path.resolve(`src/data/${name}.ts`)).href]));
  const script = `
    import fs from 'node:fs/promises';
    import {registerHooks} from 'node:module';
    const siteModels=${JSON.stringify(siteModels)};
    registerHooks({resolve(specifier,context,next){return specifier==='server-only'?{url:'data:text/javascript,export%20%7B%7D',shortCircuit:true}:next(siteModels[specifier]??specifier,context);}});
    const RealDate=Date;
    globalThis.Date=class extends RealDate {constructor(...args){super(...(args.length?args:[${JSON.stringify(FIXTURE_AS_OF)}]));}static now(){return new RealDate(${JSON.stringify(FIXTURE_AS_OF)}).getTime();}};
    const {getLibrarySnapshot}=await import(${JSON.stringify(moduleUrl)});
    const manifest='public/data/library/v1/manifest.json';
    await fs.rename(manifest,manifest+'.held');
    let first;try{await getLibrarySnapshot();}catch(error){first=error.code;}
    await fs.rename(manifest+'.held',manifest);
    const restored=await getLibrarySnapshot();
    process.stdout.write(JSON.stringify({first,items:restored.items.length}));
  `;
  const result = await promisify(execFile)(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', '--input-type=module', '-e', script], { cwd: root });
  assert.deepEqual(JSON.parse(result.stdout), { first: 'ENOENT', items: 1 });
});
