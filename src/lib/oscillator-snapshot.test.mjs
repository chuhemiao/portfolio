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
      import { registerHooks, syncBuiltinESMExports } from 'node:module';
      childProcess.execFile = () => { throw new Error('Surf must not execute without --with-surf'); };
      syncBuiltinESMExports();
      const mode = ${JSON.stringify(mode)};
      const now = Date.now();
      const day = 86400000;
      const midnight = Math.floor(now / day) * day;
      const hasPrior = ['retained-history', 'partial-ranking', 'missing-only'].includes(mode);
      const history = hasPrior
        ? {ethereum: {source: 'binance', markets: ['ETHBTC'], startDay: midnight - 5 * day, closes: [0.01,0.02]}}
        : {};
      if (mode === 'partial-ranking') history.aave = {source:'binance-cross',markets:['AAVEUSDT','BTCUSDT'],startDay:midnight - 5 * day,closes:[0.002,0.003]};
      const previous = {
        asOf: new Date(midnight - day).toISOString(),
        history,
        data: {
          generatedAt: new Date(midnight - day).toISOString(),
          universe: [
            {id:'ethereum',coingeckoId:'ethereum',symbol:'ETH',name:'Ethereum',currentRatio:0.02},
            {id:'aave',coingeckoId:'aave',symbol:'AAVE',name:'Aave'},
            {id:'kaspa',coingeckoId:'kaspa',symbol:'KAS',name:'Kaspa',currentRatio:null}
          ],
          results: [{coin:{id:'ethereum',symbol:'ETH'},grade:'B'},{coin:{id:'kaspa',symbol:'KAS'},grade:'B'}],
          freshness: {sourceAsOf:{binance:new Date(midnight - day).toISOString()},historyAvailable:1,historyTotal:2,unavailableSources:[]}
        }
      };
      registerHooks({load(url, context, nextLoad) {
        if (!url.endsWith('/src/data/oscillator-manual-snapshot.ts')) return nextLoad(url, context);
        return {format:'module',shortCircuit:true,source:'export const OSCILLATOR_MANUAL_SNAPSHOT = ' + JSON.stringify(previous)};
      }});
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
      if (['cross-history', 'partial-ranking', 'ambiguous-history', 'ambiguous-exact'].includes(mode)) {
        cgCoins[1] = {...cgCoins[1], id:'aave', symbol:'aave', name:'Aave'};
        cgCoins[2] = {...cgCoins[2], id:'dash', symbol:'dash', name:'Dash'};
        cgCoins[3] = {...cgCoins[3], id:'fake-tao', symbol:'tao', name:'Unrelated TAO'};
      }
      if (mode === 'usd-breadth') {
        cgCoins[0].price_change_percentage_7d_in_currency = 0;
        cgCoins[1].price_change_percentage_7d_in_currency = 1;
        cgCoins[2].price_change_percentage_7d_in_currency = ' ';
        cgCoins[1].price_change_percentage_30d_in_currency = -1;
      }
      if (mode.startsWith('cg-history-')) {
        cgCoins[1] = {...cgCoins[1], id:'monero', symbol:'xmr', name:'Monero'};
        cgCoins[2] = {...cgCoins[2], id:'kaspa', symbol:'kas', name:'Kaspa'};
      }
      const requests = new Map();
      globalThis.fetch = async (input) => {
        const url = new URL(input);
        const pair = url.searchParams.get('symbol');
        if (mode === 'missing-only') {
          assertPair(url.pathname);
          const data = url.pathname.endsWith('/coins/kaspa/market_chart')
            ? {prices:[[midnight - day,0.001],[midnight,0.002]]}
            : undefined;
          return {ok:data !== undefined,json:async () => data};
        }
        if (mode === 'failed') throw new Error('Network unavailable');
        let data;
        if (url.pathname.endsWith('/coins/markets')) {
          data = url.searchParams.has('category') ? (mode === 'missing-classification' ? undefined : [{id: 'usd-coin'}]) : cgCoins.slice((Number(url.searchParams.get('page')) - 1) * 250, Number(url.searchParams.get('page')) * 250);
          if (mode === 'partial-ranking') data = data.filter((coin) => coin.id !== 'aave');
        } else if (url.pathname.endsWith('/cryptocurrency/listing') && mode !== 'cg-only' && mode !== 'missing-classification') {
          data = {status: {timestamp}, data: {cryptoCurrencyList: cgCoins.map((coin, index) => ({id: index + 1, name: mode.startsWith('ambiguous-') && coin.id === 'aave' ? 'Unrelated AAVE' : coin.name, symbol: coin.symbol.toUpperCase(), cmcRank: index + 1, lastUpdated: timestamp, tags: ['layer-1']}))}};
        } else if (url.pathname.endsWith('/exchangeInfo') && ['recent-history','cross-history','partial-ranking','ambiguous-history','ambiguous-exact'].includes(mode)) {
          data = {symbols: [
            {symbol:'ETHBTC',baseAsset:'ETH',quoteAsset:'BTC',isSpotTradingAllowed:true,status:'TRADING'},
            {symbol:'AAVEBTC',baseAsset:'AAVE',quoteAsset:'BTC',isSpotTradingAllowed:true,status:mode.startsWith('ambiguous-') ? 'TRADING' : 'BREAK'},
            {symbol:'AAVEUSDT',baseAsset:'AAVE',quoteAsset:'USDT',isSpotTradingAllowed:true,status:'TRADING'},
            {symbol:'DASHUSDT',baseAsset:'DASH',quoteAsset:'USDT',isSpotTradingAllowed:true,status:'TRADING'},
            {symbol:'TAOUSDT',baseAsset:'TAO',quoteAsset:'USDT',isSpotTradingAllowed:true,status:'TRADING'},
            {symbol:'BTCUSDT',baseAsset:'BTC',quoteAsset:'USDT',isSpotTradingAllowed:true,status:'TRADING'},
          ]};
        } else if (url.pathname.endsWith('/klines') && ['recent-history','cross-history','partial-ranking','ambiguous-history','ambiguous-exact'].includes(mode)) {
          assertPair(pair);
          const price = pair === 'BTCUSDT' ? '80000' : pair.endsWith('BTC') ? '0.001' : '80';
          data = Array.from({ length: 31 }, (_, index) => {
            const open = midnight - (30 - index) * day;
            return [open, '0.001', '0.002', '0.0005', price, '10', open + day - 1, '1', 10];
          });
          if (pair === 'AAVEUSDT') data[15][6] -= 10000;
          if (mode === 'cross-history' && pair === 'BTCUSDT' && requests.get(pair) > 1) throw new Error('Shared BTC series fetched twice');
        } else if (pair === 'BTCUSDT') {
          data = {lastPrice: ['invalid-btc', 'malformed-cg-btc'].includes(mode) ? '0' : '80000', closeTime: now};
        } else if (url.pathname.endsWith('/simple/price') && mode === 'malformed-cg-btc' && url.searchParams.get('ids') === 'bitcoin') {
          data = {bitcoin: {usd: 'not-a-number', last_updated_at: Math.floor(now / 1000)}};
        } else if (url.pathname.endsWith('/coins/monero/market_chart') && mode.startsWith('cg-history-')) {
          return {ok:false,status:mode === 'cg-history-rate-limited' ? 429 : 404};
        } else if (url.pathname.endsWith('/coins/kaspa/market_chart') && mode.startsWith('cg-history-')) {
          data = {prices: [[midnight - day, 0.001], [midnight, 0.001]]};
        } else if (url.pathname.endsWith('/coins/aave/market_chart') && mode === 'ambiguous-exact') {
          data = {prices: [[midnight - day, 0.004], [midnight, 0.005]]};
        } else if (url.pathname.endsWith('/market_chart') && mode === 'cg-intraday-history') {
          data = {prices: [[midnight - 86400000, 0.001], [midnight, 0.001], [now, 0.00000001]]};
        } else if (url.pathname.endsWith('/ticker/price') && mode === 'recent-history') {
          data = [{symbol: 'ETHBTC', price: '0.001'}];
        } else if (url.pathname.endsWith('/ticker/24hr') && url.searchParams.has('symbols') && mode === 'recent-history') {
          data = [{symbol: 'ETHBTC', lastPrice: '0.001', closeTime: now, quoteVolume: '1000', priceChangePercent: '1'}];
        }
        return {ok: data !== undefined, json: async () => data};
      };
      function assertPair(pair) {
        requests.set(pair, (requests.get(pair) ?? 0) + 1);
      }
      process.once('beforeExit', () => {
        if (mode === 'cross-history' &&
          (requests.has('TAOUSDT') || requests.has('AAVEBTC') || requests.get('BTCUSDT') !== 1)) {
          throw new Error('History requested a retired or mismatched pair or re-fetched the shared BTC series.');
        }
        if (mode === 'missing-only' && (requests.size !== 1 || requests.get('/api/v3/coins/kaspa/market_chart') !== 1)) {
          throw new Error('Missing-only sync requested data other than the missing Kaspa history.');
        }
      });
      process.argv.push(${dryRun ? "'--dry-run'" : "'--no-op-extra-argument'"});
      if (mode === 'missing-only') process.argv.push('--missing-history');
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

test('same-day cross history ignores a retired native pair, timeframe truncation and ticker impostors', () => {
  const run = runSyncFixture('cross-history');
  assert.equal(run.status, 0, run.stderr);
  const { data, history } = JSON.parse(run.stdout);
  assert.deepEqual(history.aave.markets, ['AAVEUSDT', 'BTCUSDT']);
  assert.equal(history.aave.source, 'binance-cross');
  assert.equal(history.aave.closes.length, 30);
  assert.equal(history.aave.closes[15], null);
  assert.ok(history.aave.closes.every((close, i) => i === 15 || close === 80 / 80000));
  assert.equal(history.dash.closes.length, 30);
  assert.ok(history.dash.closes.every((close) => close === 80 / 80000));
  assert.equal(history.ethereum.source, 'binance');
  assert.equal(data.results.some((row) => row.coin.symbol === 'TAO'), false);
});

test('unavailable upstream history retains a previous valid series and original observed dates', () => {
  const run = runSyncFixture('retained-history');
  assert.equal(run.status, 0, run.stderr);
  const { data, history } = JSON.parse(run.stdout);
  assert.deepEqual(history.ethereum.closes, [0.01, 0.02]);
  const result = data.results.find((row) => row.coin.id === 'ethereum');
  assert.equal(result.historyRetained, true);
  assert.equal(Date.parse(result.historyAsOf), history.ethereum.startDay + 2 * 86400000 - 1);
  assert.ok(Date.parse(result.historyAsOf) < Date.parse(data.generatedAt));
});

test('snapshot USD breadth counts a finite flat return and excludes missing data', () => {
  const run = runSyncFixture('usd-breadth');
  assert.equal(run.status, 0, run.stderr);
  const { data: { summary } } = JSON.parse(run.stdout);
  assert.equal(summary.valid7dCount, 2);
  assert.equal(summary.positive7dCount, 1);
  assert.equal(summary.positive7dBreadth, 50);
  assert.equal(summary.valid30dCount, 1);
  assert.equal(summary.positive30dBreadth, 0);
});

test('an asset-specific CoinGecko failure leaves its other exact-ID histories available', () => {
  const run = runSyncFixture('cg-history-asset-error');
  assert.equal(run.status, 0, run.stderr);
  const { history } = JSON.parse(run.stdout);
  assert.equal(history.monero, undefined);
  assert.equal(history.kaspa.source, 'coingecko');
});

test('a CoinGecko 429 stops later history batches', () => {
  const run = runSyncFixture('cg-history-rate-limited');
  assert.equal(run.status, 0, run.stderr);
  const { history } = JSON.parse(run.stdout);
  assert.equal(history.monero, undefined);
  assert.equal(history.kaspa, undefined);
});

test('a partial ranking cannot displace a previous chart with a same-symbol CMC row', () => {
  const run = runSyncFixture('partial-ranking');
  assert.equal(run.status, 1, run.stderr);
  assert.match(run.stderr, /existing chart identities.*aave/);
});

for (const mode of ['ambiguous-history', 'ambiguous-exact']) {
  test(`an ambiguous venue identity uses only validated exact-ID data (${mode})`, () => {
    const run = runSyncFixture(mode);
    assert.equal(run.status, 0, run.stderr);
    const { history, data } = JSON.parse(run.stdout);
    const aave = data.results.find((row) => row.coin.id === 'aave');
    assert.equal(aave.binanceSymbol, null);
    assert.equal(aave.historySource, mode === 'ambiguous-exact' ? 'coingecko' : 'none');
    assert.deepEqual(history.aave?.closes, mode === 'ambiguous-exact' ? [0.004, 0.005] : undefined);
  });
}

test('a missing-history refresh adds only the missing series and preserves market dates', () => {
  const run = runSyncFixture('missing-only');
  assert.equal(run.status, 0, run.stderr);
  const { asOf, history, data } = JSON.parse(run.stdout);
  assert.equal(asOf, data.generatedAt);
  assert.equal(asOf, data.freshness.sourceAsOf.binance);
  assert.ok(Date.now() - Date.parse(asOf) > 86400000);
  assert.deepEqual(history.ethereum.closes, [0.01, 0.02]);
  assert.deepEqual(history.kaspa.closes, [0.001, 0.002]);
  assert.equal(data.freshness.historyAvailable, 2);
  assert.equal(data.results.find((row) => row.coin.id === 'kaspa').historySource, 'coingecko');
});
