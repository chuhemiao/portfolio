import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

import { normalizeOscillatorSnapshot } from './oscillator-snapshot.ts';

const packageJson = JSON.parse(
  fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
);
const syncScriptSource = fs.readFileSync(
  new URL('../../scripts/sync-oscillator-snapshot.mjs', import.meta.url),
  'utf8'
);

test('normalizeOscillatorSnapshot marks data as snapshot-backed', () => {
  const normalized = normalizeOscillatorSnapshot({
    asOf: '2026-04-13T08:00:00Z',
    data: {
      generatedAt: '2026-04-13T08:00:00Z',
      results: [],
      universe: [],
      summary: {
        trackedAltcoins: 0,
        researchFocusCount: 0,
        dualRankedCount: 0,
        binanceBtcPairs: 0,
        positive7dCount: 0,
        positive30dCount: 0,
        positive7dBreadth: null,
        positive30dBreadth: null,
      },
      btcPrice: 84000,
    },
  });

  assert.equal(normalized.mode, 'snapshot');
  assert.equal(normalized.snapshotAsOf, '2026-04-13T08:00:00Z');
  assert.match(normalized.note ?? '', /local market snapshot/i);
});

test('package.json exposes a sync command for oscillator snapshots', () => {
  assert.equal(typeof packageJson.scripts['sync:oscillator'], 'string');
});

test('oscillator sync command enables ts stripping for ts module imports', () => {
  assert.match(packageJson.scripts['sync:oscillator'], /--experimental-strip-types/);
});

test('oscillator sync script expands the market universe to the top 500', () => {
  assert.match(syncScriptSource, /TOP_UNIVERSE_LIMIT\s*=\s*500/);
  assert.match(syncScriptSource, /limit=\$\{TOP_UNIVERSE_LIMIT\}/);
});

function runSyncFixture(mode, dryRun = true) {
  const child = spawnSync(process.execPath, [
    '--experimental-strip-types', '--input-type=module', '-e', `
      import childProcess from 'node:child_process';
      import { syncBuiltinESMExports } from 'node:module';
      childProcess.execFile = () => { throw new Error('Surf must not execute without --with-surf'); };
      syncBuiltinESMExports();
      const mode = ${JSON.stringify(mode)};
      const now = Date.now();
      const timestamp = new Date(mode === 'stale' ? now - 7 * 86400000 : now).toISOString();
      const cgCoins = Array.from({ length: 500 }, (_, index) => ({
        id: index === 0 ? 'ethereum' : 'fixture-' + index,
        symbol: index === 0 ? 'eth' : 'FIX' + index,
        name: index === 0 ? 'Ethereum' : 'Fixture ' + index,
        market_cap_rank: index + 1, current_price: 100,
        market_cap: 1000000, total_volume: 10000,
        last_updated: timestamp,
      }));
      if (mode === 'missing-classification') cgCoins[1] = {...cgCoins[1], id: 'usd1', symbol: 'usd1', name: 'World Liberty Financial USD'};
      globalThis.fetch = async (input) => {
        const url = new URL(input);
        if (mode === 'failed') throw new Error('Network unavailable');
        let data;
        if (url.pathname.endsWith('/coins/markets')) {
          data = url.searchParams.has('category') ? (mode === 'missing-classification' ? undefined : [{id: 'usd-coin'}]) : cgCoins.slice((Number(url.searchParams.get('page')) - 1) * 250, Number(url.searchParams.get('page')) * 250);
        } else if (url.pathname.endsWith('/cryptocurrency/listing') && mode !== 'cg-only' && mode !== 'missing-classification') {
          data = {status: {timestamp}, data: {cryptoCurrencyList: cgCoins.map((coin, index) => ({id: index + 1, name: coin.name, symbol: coin.symbol.toUpperCase(), cmcRank: index + 1, lastUpdated: timestamp, tags: ['layer-1']}))}};
        } else if (url.searchParams.get('symbol') === 'BTCUSDT') {
          data = {lastPrice: ['invalid-btc', 'malformed-cg-btc'].includes(mode) ? '0' : '80000', closeTime: now};
        } else if (url.pathname.endsWith('/simple/price') && mode === 'malformed-cg-btc' && url.searchParams.get('ids') === 'bitcoin') {
          data = {bitcoin: {usd: 'not-a-number', last_updated_at: Math.floor(now / 1000)}};
        } else if (url.pathname.endsWith('/market_chart') && mode === 'cg-intraday-history') {
          const midnight = Math.floor(now / 86400000) * 86400000;
          data = {prices: [[midnight - 86400000, 0.001], [midnight, 0.001], [now, 0.00000001]]};
        } else if (url.pathname.endsWith('/ticker/price') && mode === 'recent-history') {
          data = [{symbol: 'ETHBTC', price: '0.001'}];
        } else if (url.pathname.endsWith('/ticker/24hr') && url.searchParams.has('symbols') && mode === 'recent-history') {
          data = [{symbol: 'ETHBTC', lastPrice: '0.001', closeTime: now, quoteVolume: '1000', priceChangePercent: '1'}];
        } else if (url.pathname.endsWith('/klines') && mode === 'recent-history') {
          data = Array.from({ length: 30 }, (_, index) => {
            const close = now - (30 - index) * 86400000;
            return [close - 86399999, '0.001', '0.002', '0.0005', '0.001', '10', close];
          });
        }
        return {ok: data !== undefined, json: async () => data};
      };
      process.argv.push(${dryRun ? "'--dry-run'" : "'--no-op-extra-argument'"});
      await import('./scripts/sync-oscillator-snapshot.mjs');
    `,
  ], {cwd: new URL('../..', import.meta.url), encoding: 'utf8', timeout: 20000});
  return child;
}

test('sync dry-run uses fresh markets and derived ratios without Surf or prior ranks', () => {
  const before = fs.readFileSync(new URL('../data/oscillator-manual-snapshot.ts', import.meta.url), 'utf8');
  const run = runSyncFixture('cg-only');
  assert.equal(run.status, 0, run.stderr);
  const snapshot = JSON.parse(run.stdout);
  assert.equal(snapshot.data.universe.length, 500);
  assert.equal(snapshot.data.btcPrice, 80000);
  assert.equal(snapshot.data.summary.dualRankedCount, 0);
  assert.equal(snapshot.data.universe[0].coinmarketcapRank, null);
  assert.equal(snapshot.data.universe[0].currentRatioSource, 'usd-derived');
  assert.equal(snapshot.data.universe[0].currentRatio, 100 / 80000);
  assert.equal(snapshot.data.results[0].historySource, 'none');
  assert.equal(snapshot.data.results[0].fiveYearLow, null);
  assert.equal(snapshot.data.results[0].currentCyclePeak, null);
  assert.equal(snapshot.data.freshness.historyAvailable, 0);
  assert.equal(fs.readFileSync(new URL('../data/oscillator-manual-snapshot.ts', import.meta.url), 'utf8'), before);
});

for (const mode of ['failed', 'stale', 'invalid-btc']) {
  test('sync refuses ' + mode + ' market data and preserves the existing snapshot', () => {
    const target = new URL('../data/oscillator-manual-snapshot.ts', import.meta.url);
    const before = fs.readFileSync(target, 'utf8');
    const run = runSyncFixture(mode, false);
    assert.equal(run.status, 1, run.stderr);
    assert.match(run.stderr, /Refusing to overwrite oscillator snapshot/);
    assert.equal(fs.readFileSync(target, 'utf8'), before);
  });
}

test('sync reports limited recent history without inventing a full cycle peak', () => {
  const run = runSyncFixture('recent-history');
  assert.equal(run.status, 0, run.stderr);
  const snapshot = JSON.parse(run.stdout);
  assert.equal(snapshot.data.freshness.historyAvailable, 1);
  assert.equal(snapshot.data.results[0].historySource, 'binance');
  assert.equal(snapshot.data.results[0].currentCyclePeak, null);
  assert.equal(snapshot.data.results[0].cycleChange, null);
  assert.equal(snapshot.data.results[0].fiveYearLow, 0.001);
  assert.ok(Date.parse(snapshot.data.results[0].historyStart) > Date.now() - 31 * 86400000);
});

for (const mode of ['malformed-cg-btc', 'missing-classification']) {
  test('sync refuses ' + mode + ' without publishing a misleading refresh', () => {
    const run = runSyncFixture(mode);
    assert.equal(run.status, 1, run.stderr);
    assert.match(run.stderr, /Refusing to overwrite oscillator snapshot/);
  });
}

test('CoinGecko historical anchors exclude the unfinished intraday price sample', () => {
  const run = runSyncFixture('cg-intraday-history');
  assert.equal(run.status, 0, run.stderr);
  const snapshot = JSON.parse(run.stdout);
  const result = snapshot.data.results[0];
  assert.equal(result.historySource, 'coingecko');
  assert.equal(result.fiveYearLow, 0.001);
  assert.equal(Date.parse(result.historyAsOf) % 86400000, 0);
  assert.equal(result.currentCyclePeak, null);
});
