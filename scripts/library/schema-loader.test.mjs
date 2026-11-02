import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { catalogSchema, parseJsonStrict, validateRecord } from './contract.mjs';
import publicSchema from '../../data/library/schemas/public-snapshot.schema.json' with { type: 'json' };

test('trusted static schema imports preserve the exact JSON values used by the Node CLI', async () => {
  assert.deepEqual(catalogSchema, JSON.parse(await fs.readFile('data/library/schemas/catalog.schema.json', 'utf8')));
  assert.deepEqual(publicSchema, JSON.parse(await fs.readFile('data/library/schemas/public-snapshot.schema.json', 'utf8')));
  assert.equal(validateRecord('timestamp', '2026-11-02T12:00:00Z').valid, true);
  assert.equal(validateRecord('timestamp', 'invalid-date').valid, false);
  assert.throws(() => parseJsonStrict('{"untrusted":1,"untrusted":2}'), { code: 'DUPLICATE_JSON_KEY' });
});
