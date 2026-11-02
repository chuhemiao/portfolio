import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import ts from 'typescript';

test('export artifacts are outside TypeScript inputs while actual Library source errors remain enforced', () => {
  const root = process.cwd();
  const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
  assert.equal(config.error, undefined);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  assert.deepEqual(parsed.errors, []);
  const normalize = path.join(root, 'src/lib/library/normalize.ts');
  const types = path.join(root, 'src/lib/library/types.ts');
  assert.ok(parsed.fileNames.includes(normalize)); assert.ok(parsed.fileNames.includes(types));
  assert.ok(!parsed.fileNames.some(name => name.startsWith(path.join(root, 'out') + path.sep)));
  const options = { ...parsed.options, incremental: false, noEmit: true };
  const diagnostics = host => ts.getPreEmitDiagnostics(ts.createProgram([normalize, types], options, host));
  assert.deepEqual(diagnostics(ts.createCompilerHost(options)).filter(value => value.category === ts.DiagnosticCategory.Error), []);
  const host = ts.createCompilerHost(options); const original = host.getSourceFile;
  host.getSourceFile = (filename, version, ...rest) => filename === normalize
    ? ts.createSourceFile(filename, ts.sys.readFile(filename) + '\nconst __m4ForbiddenType: number = "source errors must still fail";\n', version, true)
    : original(filename, version, ...rest);
  assert.ok(diagnostics(host).some(value => value.code === 2322 && value.file?.fileName === normalize));
});
