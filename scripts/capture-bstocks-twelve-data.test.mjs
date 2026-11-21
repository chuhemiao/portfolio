import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { twelveDataHistory } from './capture-bstocks-twelve-data.mjs';

const listing = { symbol: 'AAPL', interval: '1day', currency: 'USD', exchange: 'NASDAQ', mic_code: 'XNGS' };
const range = ['2020-08-27', '2020-09-02', '2026-11-20T11:36:21Z'];
const fixture = { status: 'ok', meta: listing, values: [{ datetime: '2020-09-02', close: '127.23' }, { datetime: '2020-08-27', close: '123.45' }] };

test('Twelve Data normalizes validated daily adjusted closes and rejects mismatched listing, duplicate or unfinished rows', () => {
  const parse = (value) => twelveDataHistory(value, 'AAPL', 'NASDAQ', ...range);
  const history = parse(fixture);
  assert.equal(history.adjustment, 'split-and-dividend');
  assert.equal(history.source, 'https://twelvedata.com/docs#time-series');
  assert.deepEqual(history.closes, [{ day: '2020-08-27', adjustedClose: 123.45 }, { day: '2020-09-02', adjustedClose: 127.23 }]);
  for (const meta of [
    { ...listing, symbol: 'APPL' }, { ...listing, currency: 'CAD' }, { ...listing, interval: '1min' }, { ...listing, mic_code: 'XASE' },
  ]) assert.equal(parse({ ...fixture, meta }), null);
  for (const values of [
    [fixture.values[0], fixture.values[0]], [{ datetime: '2020-09-03', close: '1.00' }], [{ datetime: '2020-08-27', close: '0' }],
  ]) assert.equal(parse({ ...fixture, values }), null);
  assert.equal(twelveDataHistory({ ...fixture, meta: { ...listing, symbol: 'DRAM', mic_code: 'XASE' } }, 'DRAM', 'CBOE BZX', ...range), null);
});

test('Twelve Data CLI keeps authentication in the request header and preserves output after request rejection', () => {
  const scratch = mkdtempSync(join(tmpdir(), 'bstocks-provider-'));
  const hook = join(scratch, 'mock-fetch.mjs');
  const out = join(scratch, 'output.json');
  const key = 'fixture-provider-key';
  const run = (mode, extra = {}) => spawnSync(process.execPath, [
    '--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', '--import', hook, 'scripts/capture-bstocks-twelve-data.mjs',
    '--ticker', 'AAPLB', '--from', range[0], '--to', range[1], '--out', out,
  ], { encoding: 'utf8', env: { ...process.env, TWELVE_DATA_API_KEY: key, BSTOCKS_FIXTURE_MODE: mode, ...extra } });
  try {
    writeFileSync(hook, `
      import assert from 'node:assert/strict';
      globalThis.fetch = async (target, options) => {
        const url = new URL(target);
        assert.equal(url.origin, 'https://api.twelvedata.com');
        assert.equal(url.pathname, '/time_series');
        assert.deepEqual(Object.fromEntries(url.searchParams), {
          symbol: 'AAPL', interval: '1day', adjust: 'all', start_date: '2020-08-27', end_date: '2020-09-03', outputsize: '7',
        });
        assert.equal(options.headers.Authorization, 'apikey ' + process.env.TWELVE_DATA_API_KEY);
        assert.equal(options.redirect, 'error');
        assert.ok(options.signal);
        if (process.env.BSTOCKS_FIXTURE_MODE === 'limit') return new Response('', { status: 429 });
        if (process.env.BSTOCKS_FIXTURE_MODE === 'unauthorized') return Response.json({ status: 'error', code: 401, message: process.env.TWELVE_DATA_API_KEY });
        if (process.env.BSTOCKS_FIXTURE_MODE === 'timeout') throw new Error(process.env.TWELVE_DATA_API_KEY);
        return Response.json(${JSON.stringify(fixture)});
      };
    `);
    const first = run('ok');
    assert.equal(first.status, 0, first.stderr);
    assert.match(first.stdout, /1\/1 adjusted bStock histories/);
    const accepted = readFileSync(out, 'utf8');
    assert.equal(JSON.parse(accepted).rows.AAPLB.history.symbol, 'AAPL');
    assert.ok(!accepted.includes(key));

    for (const [mode, message] of [['limit', /rate-limited/], ['unauthorized', /rejected authentication/], ['timeout', /failed or timed out/]]) {
      const result = run(mode);
      assert.equal(result.status, 1);
      assert.match(result.stderr, message);
      assert.ok(!result.stderr.includes(key));
      assert.equal(readFileSync(out, 'utf8'), accepted);
    }
    assert.equal(run('ok', { TWELVE_DATA_API_KEY: '' }).status, 1);
    assert.equal(readFileSync(out, 'utf8'), accepted);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});
