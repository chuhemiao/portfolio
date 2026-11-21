import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { syncWatchSnapshot, syncBtcScoreSnapshot } from './sync-watch-snapshot.mjs';

const { collectWatchData } = await import('../src/lib/watch-data.ts');
const day = 86_400_000;
const now = Date.now();
const stableListedAt = new Date(now - day).toISOString();
const stableProduct = {
  product_id: 'STABLE-USD', base_currency_id: 'STABLE', product_type: 'SPOT',
  new_at: stableListedAt, is_disabled: false, trading_disabled: false,
};

function coinbaseInventory(products) {
  return { products, num_products: products.length, pagination: { has_next: false, has_prev: false, next_cursor: '', prev_cursor: '' } };
}

function sourceFixture(url) {
  if (url.includes('instruments?instType=SPOT')) return { code: '0', data: [{ instId: 'FOO-USDT', state: 'live', listTime: String(now - 60 * day) }, { instId: 'PREOPEN-USDT', state: 'preopen', listTime: String(now - day) }] };
  if (url.includes('instruments?instType=SWAP')) return { code: '0', data: [{ instId: 'EDGE-USDT-SWAP', state: 'live', listTime: String(now - 30 * day) }, { instId: 'OLD-USDT-SWAP', state: 'live', listTime: String(now - 30 * day - 1) }] };
  if (url.includes('category=linear')) return { retCode: 0, result: { list: [{ symbol: 'FOOUSDT', baseCoin: 'FOO', status: 'Trading', launchTime: String(now - day), contractType: 'LinearPerpetual' }, { symbol: 'GONEUSDT', baseCoin: 'GONE', status: 'Closed', launchTime: String(now - day), contractType: 'LinearPerpetual' }] } };
  if (url.includes('category=spot')) return { retCode: 0, result: { list: [] } };
  if (url.includes('spot/public/symbols')) return { code: '00000', data: [{ symbol: 'ALPHAUSDT', baseCoin: 'ALPHA', status: 'halt', openTime: String(now - day) }, { symbol: 'FOOUSDT', baseCoin: 'FOO', status: 'online', openTime: String(now - day) }, { symbol: 'BITGETONLYUSDT', baseCoin: 'BITGETONLY', status: 'online', openTime: String(now - day) }] };
  if (url.includes('mix/market/contracts')) return { code: '00000', data: [] };
  if (url.includes('market/products')) return coinbaseInventory([stableProduct]);
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

async function withSources(run, { fail = false, coinbase, response } = {}) {
  const originalFetch = globalThis.fetch;
  const originalNow = Date.now;
  Date.now = () => now;
  globalThis.fetch = async url => {
    if (fail) return new Response('{}', { status: 503 });
    const source = String(url);
    return response?.(source) ?? Response.json(coinbase && source.includes('market/products') ? coinbase(new URL(source)) : sourceFixture(source));
  };
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

test('collects Coinbase spot pairs and their original date beyond the first public page', async () => {
  const first = coinbaseInventory([{ ...stableProduct, product_id: 'OLDER-USD', base_currency_id: 'OLDER', new_at: null }]);
  first.pagination = { ...first.pagination, has_next: true, next_cursor: 'other-products' };
  const full = coinbaseInventory([...first.products, stableProduct, { ...stableProduct, product_id: 'STABLE-USDC' },
    { ...stableProduct, product_id: 'DISABLED-USD', base_currency_id: 'DISABLED', trading_disabled: true }]);
  const data = await withSources(() => collectWatchData(), {
    coinbase: url => url.searchParams.get('get_all_products') === 'true' ? full : first,
  });
  const stable = data.listings.find(coin => coin.symbol === 'STABLE');
  assert.deepEqual(stable?.coinbase.spotPairs, ['STABLE-USD', 'STABLE-USDC']);
  assert.equal(stable.firstSeenAt, Date.parse(stableListedAt));
  assert.equal(stable.coinbase.spotListedAt, stable.firstSeenAt);
  assert.ok(!data.listings.some(coin => coin.symbol === 'DISABLED'));
  assert.ok(!data.errors.some(error => error.startsWith('Coinbase inventory:')));
});

test('an incomplete or invalid Coinbase inventory cannot replace a Watch snapshot', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'watch-coinbase-test-'));
  const destination = join(directory, 'watch-data.json');
  const previous = '{"previous":true}\n';
  await writeFile(destination, previous);
  const complete = coinbaseInventory([stableProduct]);
  const invalid = [
    { ...complete, pagination: { ...complete.pagination, has_next: true, next_cursor: 'more' } },
    { ...complete, pagination: { ...complete.pagination, has_prev: true, prev_cursor: 'earlier' } },
    { ...complete, num_products: 2 },
    coinbaseInventory([stableProduct, stableProduct]),
    coinbaseInventory([{ ...stableProduct, product_type: 'FUTURE' }]),
    { products: [stableProduct] },
    coinbaseInventory([]),
  ];
  try {
    for (const inventory of invalid) {
      await withSources(() => assert.rejects(syncWatchSnapshot({ destination }), /previous snapshot retained/), {
        coinbase: () => inventory,
      });
      assert.equal(await readFile(destination, 'utf8'), previous);
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('native failure retains existing bytes and timestamp; success replaces one complete snapshot', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'watch-sync-test-'));
  const destination = join(directory, 'watch-data.json');
  const previous = '{"generatedAt":"2026-07-02T00:00:00Z","previous":true}\n';
  await writeFile(destination, previous);
  try {
    await withSources(() => assert.rejects(syncWatchSnapshot({ destination }), /previous snapshot retained/), { fail: true });
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

test('keeps the previous Watch bytes when a presence or discovery source fails', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'watch-inventory-test-'));
  const destination = join(directory, 'watch-data.json');
  try {
    const healthy = await withSources(() => syncWatchSnapshot({ destination }));
    assert.equal(healthy.listings.find(row => row.symbol === 'FOO').binance.spot, true);
    const before = await readFile(destination, 'utf8');
    for (const source of [
      'https://api.binance.com/api/v3/exchangeInfo',
      'https://api.bybit.com/v5/market/instruments-info?category=spot&limit=1000',
      'https://api.bitget.com/api/v2/spot/public/symbols',
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=binance-alpha-spotlight&order=market_cap_desc&per_page=250&page=2&sparkline=false',
    ]) {
      await withSources(() => assert.rejects(syncWatchSnapshot({ destination }), /previous snapshot retained/), {
        response: url => url === source ? new Response('{}', { status: 503 }) : undefined,
      });
      assert.equal(await readFile(destination, 'utf8'), before);
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('rejects an inventory with missing presence data while accepting valid empty inventories', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'watch-envelope-test-'));
  const destination = join(directory, 'watch-data.json');
  const source = 'https://api.binance.com/api/v3/exchangeInfo';
  try {
    const healthy = await withSources(() => syncWatchSnapshot({ destination }));
    assert.ok(healthy.sources.successful.includes('https://api.upbit.com/v1/market/all'));
    const before = await readFile(destination, 'utf8');
    for (const invalid of [{}, { symbols: [{}] }]) {
      const options = { response: url => url === source ? Response.json(invalid) : undefined };
      await withSources(() => assert.rejects(syncWatchSnapshot({ destination }), /previous snapshot retained/), options);
      assert.equal(await readFile(destination, 'utf8'), before);
      const observed = await withSources(() => collectWatchData(), options);
      assert.ok(observed.sources.failed.includes(source));
      assert.ok(!observed.sources.successful.includes(source));
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('a ticker failure leaves valid alternate prices and venue data eligible for publication', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'watch-quote-source-test-'));
  const destination = join(directory, 'watch-data.json');
  const source = 'https://api.binance.com/api/v3/ticker/24hr?type=MINI';
  const valid = { symbol: 'FOOUSDT', openPrice: '5', lastPrice: '10', quoteVolume: '1000' };
  try {
    for (const [ticker, price, failed] of [
      [new Response('{}', { status: 503 }), 2, true],
      [Response.json({}), 2, true],
      [Response.json(null), 2, true],
      [Response.json([{ ...valid, lastPrice: {} }]), 2, true],
      [Response.json([null, valid]), 10, true],
      [Response.json([]), 2, false],
      [Response.json([valid]), 10, false],
    ]) {
      const data = await withSources(() => syncWatchSnapshot({ destination }), {
        response: url => url === source ? ticker : undefined,
      });
      const foo = data.listings.find(row => row.symbol === 'FOO');
      assert.equal(foo.priceUsdt, price);
      assert.equal(foo.binance.spot, true);
      assert.equal(data.sources.failed.includes(source), failed);
      assert.equal(data.sources.successful.includes(source), !failed);
      assert.deepEqual(JSON.parse(await readFile(destination, 'utf8')), data);
    }
    const before = await readFile(destination, 'utf8');
    await withSources(() => assert.rejects(syncWatchSnapshot({ destination }), /previous snapshot retained/), {
      response: url => url === source ? Response.json({}) : url.includes('coins/markets') ? Response.json([]) : undefined,
    });
    assert.equal(await readFile(destination, 'utf8'), before);
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
