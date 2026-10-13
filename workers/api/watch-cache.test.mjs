import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === '../../../src/lib/watch-client-data' && context.parentURL?.endsWith('/workers/api/src/index.ts')) {
      return nextResolve('../../../src/lib/watch-client-data.ts', context);
    }
    return nextResolve(specifier, context);
  },
});
const { default: worker } = await import('./src/index.ts');
const previous = { generatedAt: '2026-10-13T11:18:01.366Z', listings: [{ symbol: 'OLD' }], errors: [] };
const watchCacheUrl = 'https://portfolio-api-cache.kkdemian.local/watch-data';

function fixture(url, denied = false) {
  const now = Date.now();
  const recent = String(now - 86_400_000);
  if (url.includes('instruments?instType=SPOT')) return { code: denied === true ? '500' : '0', data: [{ instId: 'FOO-USDT', state: 'live', listTime: String(now - 60 * 86_400_000) }] };
  if (url.includes('instruments?instType=SWAP')) return { code: denied === true ? '500' : '0', data: [{ instId: 'FOO-USDT-SWAP', state: 'live', listTime: recent }] };
  if (url.includes('category=linear')) return { retCode: denied === true ? 10001 : 0, result: { list: [{ symbol: 'BARUSDT', baseCoin: 'BAR', status: 'Trading', launchTime: recent, contractType: 'LinearPerpetual' }] } };
  if (url.includes('category=spot')) return { retCode: 0, result: { list: [] } };
  if (url.includes('spot/public/symbols')) return { code: '00000', data: [{ symbol: 'FOOUSDT', baseCoin: 'FOO', status: 'online' }] };
  if (url.includes('mix/market/contracts')) return { code: '00000', data: [] };
  if (url.includes('market/products')) return { products: [{ product_id: 'FOO-USD', base_currency_id: 'FOO', new_at: new Date(now - 86_400_000).toISOString(), is_disabled: true }, { product_id: 'DISABLED-USD', base_currency_id: 'DISABLED', new_at: new Date(now - 86_400_000).toISOString(), trading_disabled: true }] };
  if (url.includes('/exchangeInfo')) return { symbols: [] };
  if (url.includes('/market/all')) return [];
  if (url.includes('hyperliquid')) return { universe: [] };
  if (url.includes('coins/markets')) return [];
  if (url.includes('/ticker/24hr')) return [{ symbol: 'FOOUSDT', openPrice: '5', lastPrice: '10', quoteVolume: '1000' }, { symbol: 'BARUSDT', openPrice: '5', lastPrice: '5', quoteVolume: '1000' }];
  if (url.includes('/fng/')) return { data: [{ value: denied === 'invalid' ? 'NaN' : '57', value_classification: 'Greed' }] };
  if (url.endsWith('/global')) return { data: {} };
  return {};
}

async function withWorkerState({ initial = true, mode = '503' } = {}, run) {
  const originalFetch = globalThis.fetch;
  const originalCaches = globalThis.caches;
  const originalWarn = console.warn;
  const rows = new Map(initial ? [[watchCacheUrl, JSON.stringify(previous)]] : []);
  const writes = [];
  const background = [];
  globalThis.caches = { default: {
    async match(request) { return rows.has(request.url) ? new Response(rows.get(request.url), { headers: { 'Content-Type': 'application/json' } }) : undefined; },
    async put(request, response) { const body = await response.text(); writes.push(request.url); rows.set(request.url, body); },
  } };
  globalThis.fetch = async url => mode === '503' ? new Response('{}', { status: 503 }) : Response.json(fixture(String(url), mode === 'invalid' ? 'invalid' : mode === 'denied'));
  console.warn = () => {};
  const ctx = { waitUntil(promise) { background.push(promise); } };
  try { return await run({ rows, writes, ctx, background }); }
  finally { globalThis.fetch = originalFetch; globalThis.caches = originalCaches; console.warn = originalWarn; }
}

test('forced native outage returns the previous timestamp and marks cache without overwriting it', async () => {
  await withWorkerState({}, async ({ rows, writes, ctx, background }) => {
    const response = await worker.fetch(new Request('https://kkdemian.com/api/watch-data?refresh=1'), {}, ctx);
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.generatedAt, previous.generatedAt);
    assert.equal(result._cached, true);
    await Promise.all(background);
    assert.equal(rows.get(watchCacheUrl), JSON.stringify(previous));
    assert.deepEqual(writes, []);
  });
});

test('native outage without prior cache returns 503 and never caches an empty current snapshot', async () => {
  await withWorkerState({ initial: false }, async ({ writes, ctx, background }) => {
    const response = await worker.fetch(new Request('https://kkdemian.com/api/watch-data?refresh=1'), {}, ctx);
    assert.equal(response.status, 503);
    await Promise.all(background);
    assert.deepEqual(writes, []);
  });
});

test('cron native outage retains the prior Watch cache bytes and settles its background task', async () => {
  await withWorkerState({}, async ({ rows, writes, ctx, background }) => {
    await worker.scheduled({}, {}, ctx);
    const results = await Promise.allSettled(background);
    assert.ok(results.every(result => result.status === 'fulfilled'));
    assert.equal(rows.get(watchCacheUrl), JSON.stringify(previous));
    assert.ok(!writes.includes(watchCacheUrl));
  });
});

test('HTTP 200 rejected source envelopes retain the prior cache despite populated rejected rows', async () => {
  await withWorkerState({ mode: 'denied' }, async ({ rows, writes, ctx, background }) => {
    const response = await worker.fetch(new Request('https://kkdemian.com/api/watch-data?refresh=1'), {}, ctx);
    const result = await response.json();
    assert.equal(result.generatedAt, previous.generatedAt);
    assert.equal(result._cached, true);
    await Promise.all(background);
    assert.equal(rows.get(watchCacheUrl), JSON.stringify(previous));
    assert.deepEqual(writes, []);
  });
});

test('healthy complete inventories persist quotes while disabled Coinbase products contribute no presence or new event', async () => {
  await withWorkerState({ initial: false, mode: 'healthy' }, async ({ rows, ctx, background }) => {
    const response = await worker.fetch(new Request('https://kkdemian.com/api/watch-data?refresh=1'), {}, ctx);
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.listings.find(coin => coin.symbol === 'FOO').coinbase.spot, false);
    assert.ok(!result.listings.some(coin => coin.symbol === 'DISABLED'));
    assert.equal(result.listings.find(coin => coin.symbol === 'FOO').priceUsdt, 10);
    await Promise.all(background);
    assert.equal(JSON.parse(rows.get(watchCacheUrl)).generatedAt, result.generatedAt);
  });
});


test('malformed market payload cannot publish a fresh cache even with sufficient live inventories and quotes', async () => {
  await withWorkerState({ mode: 'invalid' }, async ({ rows, writes, ctx, background }) => {
    const response = await worker.fetch(new Request('https://kkdemian.com/api/watch-data?refresh=1'), {}, ctx);
    const result = await response.json();
    assert.equal(result.generatedAt, previous.generatedAt);
    assert.equal(result._cached, true);
    await Promise.all(background);
    assert.equal(rows.get(watchCacheUrl), JSON.stringify(previous));
    assert.deepEqual(writes, []);
  });
});
