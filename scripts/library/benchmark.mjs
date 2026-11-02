import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { pathToFileURL } from 'node:url';
import { buildSnapshot, readSnapshot } from './snapshot.mjs';
import { bulkPublishedFixture } from './fixtures/bulk.mjs';

export async function benchmark(count = 300) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'library-benchmark-'));
  try {
    const fixture = bulkPublishedFixture(count);
    const built = await buildSnapshot({ catalog: fixture.catalog, directory, context: fixture.options.context, asOf: fixture.options.asOf });
    const started = performance.now();
    const read = await readSnapshot(directory, { asOf: fixture.options.asOf, currentCatalog: fixture.catalog, context: fixture.options.context });
    const readMs = performance.now() - started;
    const files = await Promise.all(Object.keys(built.manifest.files).map(name => fs.readFile(path.join(directory, 'snapshots', built.manifest.snapshot_id, name))));
    files.push(await fs.readFile(path.join(directory, 'manifest.json')));
    return {
      synthetic: true, fixture_notice: 'Synthetic published records for performance only; zero real seeds or human approvals are claimed.',
      count, validated_count: read.items.length, node: process.version, platform: `${process.platform}-${process.arch}`, cpus: os.cpus().length,
      generator_version: built.manifest.code_version, snapshot_id: built.manifest.snapshot_id,
      generation_ms: Number(built.generation_ms.toFixed(2)), validated_read_ms: Number(readMs.toFixed(2)),
      public_bytes_raw: built.bytes, public_bytes_gzip_sum: files.reduce((sum, bytes) => sum + gzipSync(bytes).byteLength, 0),
      generation_target_pass: built.generation_ms < 10000, public_raw_budget_pass: built.bytes < 1000000,
    };
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const count = Number(process.argv[2] ?? 300);
  benchmark(count).then(report => { process.stdout.write(JSON.stringify(report, null, 2) + '\n'); process.exitCode = report.generation_target_pass && report.public_raw_budget_pass ? 0 : 1; }).catch(error => { process.stderr.write(`${error.code ?? 'BENCHMARK_FAILED'}: ${error.message}\n`); process.exitCode = 1; });
}
