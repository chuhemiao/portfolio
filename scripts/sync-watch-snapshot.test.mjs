import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { syncWatchSnapshot, syncBtcScoreSnapshot } from './sync-watch-snapshot.mjs';

const { collectWatchData } = await import('../src/lib/watch-data.ts');
const day = 86_400_000;
const now = Date.now();

function sourceFixture(url) {
  if (url.includes('instruments?instType=SPOT')) return { code: '0', data: [{ instId: 'FOO-USDT', state: 'live', listTime: String(now - 60 * day) }, { instId: 'PREOPEN-USDT', state: 'preopen', listTime: String(now - day) }] };
  if (url.includes('instruments?instType=SWAP')) return { code: '0', data: [{ instId: 'EDGE-USDT-SWAP', state: 'live', listTime: String(now - 30 * day) }, { instId: 'OLD-USDT-SWAP', state: 'live', listTime: String(now - 30 * day - 1) }] };
  if (url.includes('category=linear')) return { retCode: 0, result: { list: [{ symbol: 'FOOUSDT', baseCoin: 'FOO', status: 'Trading', launchTime: String(now - day), contractType: 'LinearPerpetual' }, { symbol: 'GONEUSDT', baseCoin: 'GONE', status: 'Closed', launchTime: String(now - day), contractType: 'LinearPerpetual' }] } };
  if (url.includes('category=spot')) return { retCode: 0, result: { list: [] } };
  if (url.includes('spot/public/symbols')) return { code: '00000', data: [{ symbol: 'ALPHAUSDT', baseCoin: 'ALPHA', status: 'halt', openTime: String(now - day) }, { symbol: 'FOOUSDT', baseCoin: 'FOO', status: 'online', openTime: String(now - day) }, { symbol: 'BITGETONLYUSDT', baseCoin: 'BITGETONLY', status: 'online', openTime: String(now - day) }] };
  if (url.includes('mix/market/contracts')) return { code: '00000', data: [] };
  if (url.includes('market/products')) return { products: [] };
  if (url.includes('fapi/v1/exchangeInfo')) return { symbols: [{ symbol: 'FUTUREUSDT', baseAsset: 'FUTURE', status: 'TRADING', onboardDate: now + 1, contractType: 'PERPETUAL' }, { symbol: 'SETTLEDUSDT', baseAsset: 'SETTLED', status: 'SETTLING', onboardDate: now - day, contractType: 'PERPETUAL' }] };
  if (url.includes('api/v3/exchangeInfo')) return { symbols: [{ baseAsset: 'FOO', status: 'TRADING' }] };
  if (url.includes('/market/all')) return [];
  if (url.includes('hyperliquid')) return { universe: [] };
  if (url.includes('/fng/')) return { data: [{ value: '57', value_classification: 'Greed' }] };
  if (url.endsWith('/global')) return { data: { total_market_cap: { usd: 1 }, market_cap_percentage: { btc: 58, eth: 12 }, market_cap_change_percentage_24h_usd: 1, active_cryptocurrencies: 1, markets: 1 } };
  if (url.includes('coins/markets')) {
    if (['2', '3'].includes(new URL(url).searchParams.get('page'))) return [];
    const coins = [{ symbol: 'alpha', current_price: 2, price_change_percentage_24h: -2, total_volume: 100, market_cap: 20_000_000, fully_diluted_valuation: 30_000_000 }];
    if (!url.includes('category=')) coins.push({ ...coins[0], symbol: 'foo' });
    return coins;
  }
  if (url.includes('/ticker/24hr')) {
    assert.equal(url, 'https://api.binance.com/api/v3/ticker/24hr?type=MINI', 'unsupported symbols never enter the Binance request');
    return [{ symbol: 'FOOUSDT', openPrice: '5', lastPrice: '10', quoteVolume: '1000' }, { symbol: 'FOOBTC', openPrice: '1', lastPrice: '20', quoteVolume: '1' }];
  }
  throw new Error(`Unexpected source ${url}`);
}

async function withSources(run, fail = false) {
  const originalFetch = globalThis.fetch;
  const originalNow = Date.now;
  Date.now = () => now;
  globalThis.fetch = async url => fail ? new Response('{}', { status: 503 }) : Response.json(sourceFixture(String(url)));
  try { return await run(); } finally { globalThis.fetch = originalFetch; Date.now = originalNow; }
}

test('native collection retains old spot presence, valid quotes, window edges and unknown Alpha dates', async () => {
  const data = await withSources(() => collectWatchData());
  const foo = data.listings.find(coin => coin.symbol === 'FOO');
  assert.equal(foo.okx.spot, true);
  assert.equal(foo.bybit.perp, true);
  assert.equal(foo.perpWithoutSpot, false);
  assert.equal(foo.firstSeenAt, now - day);
  assert.equal(foo.priceUsdt, 10);
  assert.equal(foo.priceChange24h, 100);
  const alpha = data.listings.find(coin => coin.symbol === 'ALPHA');
  assert.equal(alpha.firstSeenAt, null);
  assert.equal(alpha.bitget.spot, false);
  assert.equal(foo.bitget.spot, true);
  assert.equal(foo.firstSeenAt, now - day, 'deprecated Bitget openTime never supplies a recent event');
  assert.equal(alpha.priceUsdt, 2, 'CoinGecko covers an unsupported Binance symbol');
  assert.ok(data.listings.some(coin => coin.symbol === 'EDGE'));
  assert.ok(!data.listings.some(coin => ['OLD', 'FUTURE', 'GONE', 'PREOPEN', 'SETTLED', 'BITGETONLY'].includes(coin.symbol)));
  assert.ok(data.sources.successful.length >= 3);
});

test('native failure retains existing bytes and timestamp; success replaces one complete snapshot', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'watch-sync-test-'));
  const destination = join(directory, 'watch-data.json');
  const previous = '{"generatedAt":"2026-07-02T00:00:00Z","previous":true}\n';
  await writeFile(destination, previous);
  try {
    await withSources(() => assert.rejects(syncWatchSnapshot({ destination }), /previous snapshot retained/), true);
    assert.equal(await readFile(destination, 'utf8'), previous);
    assert.deepEqual(await readdir(directory), ['watch-data.json']);
    const saved = await withSources(() => syncWatchSnapshot({ destination }));
    assert.equal(JSON.parse(await readFile(destination, 'utf8')).generatedAt, saved.generatedAt);
    assert.deepEqual(await readdir(directory), ['watch-data.json']);
    for (const malformed of [{ ...saved, generatedAt: '2020-01-01T00:00:00Z' }, { ...saved, global: {} }, { ...saved, listings: saved.listings.map(coin => ({ ...coin, priceUsdt: NaN })) }]) {
      const before = await readFile(destination, 'utf8');
      await assert.rejects(syncWatchSnapshot({ destination, collect: async () => malformed }), /previous snapshot retained/);
      assert.equal(await readFile(destination, 'utf8'), before);
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('lookback rejects invalid ranges before invoking a source', async () => {
  for (const value of [0, -1, 1.5, 366, NaN]) await assert.rejects(collectWatchData(value), /lookbackDays/);
});


test('BTC heat source failure or stale data retains its prior snapshot independently', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'btc-heat-test-'));
  const destination = join(directory, 'btc-score.json');
  const previous = '{"timestamp":"2026-07-02T00:00:00Z"}\n';
  const originalFetch = globalThis.fetch;
  await writeFile(destination, previous);
  const sample = { timestamp: new Date().toISOString(), btcPrice: 100000, score: 38.2, dailyScore: 38, weeklyScore: 39, level: 'Low', suggestion: 'Observe', indicators: [{ name: 'AHR999', value: 0.52, score: 17, weight: 10, group: 'daily' }] };
  try {
    globalThis.fetch = async () => new Response('{}', { status: 503 });
    await assert.rejects(syncBtcScoreSnapshot({ destination }), /previous snapshot retained/);
    assert.equal(await readFile(destination, 'utf8'), previous);
    globalThis.fetch = async () => Response.json({ ...sample, timestamp: '2020-01-01T00:00:00Z' });
    await assert.rejects(syncBtcScoreSnapshot({ destination }), /previous snapshot retained/);
    assert.equal(await readFile(destination, 'utf8'), previous);
    globalThis.fetch = async () => Response.json(sample);
    await syncBtcScoreSnapshot({ destination });
    assert.deepEqual(JSON.parse(await readFile(destination, 'utf8')), sample);
    assert.deepEqual(await readdir(directory), ['btc-score.json']);
  } finally { globalThis.fetch = originalFetch; await rm(directory, { recursive: true, force: true }); }
});
