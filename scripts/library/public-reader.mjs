import path from 'node:path';
import { readCatalog } from './contract.mjs';
import { withDirectoryLock } from './files.mjs';
import { readSnapshot } from './snapshot.mjs';
import { loadReferenceContext } from './validate.mjs';

export async function readCurrentLibrary(root, asOf) {
  const directory = path.join(root, 'data/library');
  const deadline = performance.now() + 10_000;
  while (true) {
    try {
      return await withDirectoryLock(directory, async () => {
        const currentCatalog = await readCatalog(directory);
        const context = await loadReferenceContext(root, currentCatalog);
        return readSnapshot(path.join(root, 'public/data/library/v1'), { currentCatalog, context, asOf: asOf ?? new Date().toISOString() });
      });
    } catch (error) {
      if (error.code !== 'WRITE_LOCKED' || performance.now() >= deadline) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.min(25, Math.max(1, deadline - performance.now()))));
    }
  }
}
