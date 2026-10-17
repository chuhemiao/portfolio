// Next 16 writes a client Segment Cache payload per route segment into the
// static export: files named `__next.<segment>.txt`, used to prefetch parts of
// a route before it is visited. At this site's size that is 124k files and
// 2.2 GB — 80% of the exported file count and a third of its weight — all of
// which Vercel has to upload on every deploy.
//
// Next 16.1 has no flag to turn the Segment Cache off, so the files are pruned
// after the export instead. Navigation still works: the per-route RSC payloads
// (`<route>.txt`) are left intact, and the router falls back to those. The one
// visible cost is that prefetch requests for the pruned files 404 in the
// browser console.
import fs from 'node:fs/promises';
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'out');
const SEGMENT_FILE = /^__next\..*\.txt$/;

async function prune(dir) {
  let removed = 0;
  let bytes = 0;

  const entries = await fs.readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const nested = await prune(full);
        removed += nested.removed;
        bytes += nested.bytes;
        return;
      }
      if (!entry.isFile() || !SEGMENT_FILE.test(entry.name)) return;
      const { size } = await fs.stat(full);
      await fs.rm(full);
      removed += 1;
      bytes += size;
    })
  );

  return { removed, bytes };
}

async function main() {
  try {
    await fs.access(OUT_DIR);
  } catch {
    // Nothing to prune when the build did not produce a static export.
    console.log('prune-segment-cache: no out/ directory, skipping.');
    return;
  }

  const started = Date.now();
  const { removed, bytes } = await prune(OUT_DIR);
  const elapsed = ((Date.now() - started) / 1000).toFixed(2);
  console.log(
    `prune-segment-cache: removed ${removed.toLocaleString('en-US')} segment files ` +
      `(${(bytes / 1024 ** 3).toFixed(2)} GB) in ${elapsed}s.`
  );
}

main().catch((error) => {
  console.error('prune-segment-cache failed:', error);
  process.exit(1);
});
