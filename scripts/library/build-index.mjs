import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { readCatalog, LibraryValidationError } from './contract.mjs';
import { buildSnapshot } from './snapshot.mjs';
import { loadReferenceContext } from './validate.mjs';
import { directoryPath, withDirectoryLock } from './files.mjs';

export async function main(args = process.argv.slice(2)) {
  const options = { input: path.resolve('data/library'), output: path.resolve('public/data/library/v1'), asOf: new Date().toISOString() };
  for (let i = 0; i < args.length; i++) {
    const name = { '--dir': 'input', '--out': 'output', '--as-of': 'asOf' }[args[i]];
    if (!name || !args[i + 1]) throw new LibraryValidationError('INVALID_ARGUMENT', 'Usage: library:build [--dir catalog] [--out generated-directory] [--as-of UTC]');
    options[name] = args[++i];
  }
  const input = await directoryPath(options.input);
  return withDirectoryLock(input, async () => {
    const catalog = await readCatalog(input);
    const context = await loadReferenceContext(process.cwd(), catalog);
    const result = await buildSnapshot({ catalog, context, directory: options.output, asOf: options.asOf });
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    return 0;
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().then(code => { process.exitCode = code; }).catch(error => { process.stderr.write(`${error.code ?? 'LIBRARY_BUILD_FAILED'}: ${error.message}\n`); process.exitCode = 1; });
