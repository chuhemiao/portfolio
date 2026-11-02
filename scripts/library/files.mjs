import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { LibraryValidationError } from './contract.mjs';

export function within(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
}
export async function directoryPath(value, { create = false } = {}) {
  const resolved = path.resolve(value);
  if (create) await fs.mkdir(resolved, { recursive: true });
  const stat = await fs.lstat(resolved);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new LibraryValidationError('INVALID_DIRECTORY', 'Expected an owned directory, not a link or file.');
  return fs.realpath(resolved);
}
export async function regularFile(filename, { missing = false } = {}) {
  try {
    const stat = await fs.lstat(filename);
    if (stat.isSymbolicLink() || !stat.isFile()) throw new LibraryValidationError('INVALID_FILE', 'Expected a regular file without symlink indirection.');
    return stat;
  } catch (error) { if (missing && error.code === 'ENOENT') return null; throw error; }
}
export async function writeAtomic(filename, data, { mode = 0o644 } = {}) {
  const directory = await directoryPath(path.dirname(filename));
  const target = path.join(directory, path.basename(filename));
  await regularFile(target, { missing: true });
  const temporary = path.join(directory, `.library-${randomUUID()}.tmp`);
  const handle = await fs.open(temporary, 'wx', mode);
  try {
    await handle.writeFile(data); await handle.sync(); await handle.close();
    await fs.rename(temporary, target);
  } catch (error) {
    await handle.close().catch(() => {});
    await fs.rm(temporary, { force: true }).catch(cleanup => { error.cleanup_error = cleanup.code; });
    throw error;
  }
}
export async function withDirectoryLock(directory, operation) {
  const root = await directoryPath(directory);
  const filename = path.join(root, '.library.lock');
  let handle;
  try { handle = await fs.open(filename, 'wx', 0o600); }
  catch (error) { if (error.code === 'EEXIST') throw new LibraryValidationError('WRITE_LOCKED', 'Another writer or an unreconciled interrupted write holds this directory lock.'); throw error; }
  const identity = await handle.stat();
  let primary;
  try { await handle.writeFile(JSON.stringify({ pid: process.pid }) + '\n'); return await operation(); }
  catch (failure) { primary = failure; throw failure; }
  finally {
    try {
      await handle.close();
      const current = await fs.lstat(filename).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
      if (current && current.ino === identity.ino && current.dev === identity.dev && !current.isSymbolicLink()) await fs.unlink(filename);
    } catch (cleanup) { if (primary) primary.cleanup_error = cleanup.code; else throw cleanup; }
  }
}
