import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isWatchData, loadWatchUpdate } from './watch-client-data.ts';

function snapshot(generatedAt = '2026-10-13T11:00:00Z') {
  const exchange = { spot: false, perp: false, spotListedAt: null, perpListedAt: null, spotPairs: [], perpPairs: [] };
  return {
    generatedAt, lookbackDays: 30, fearGreed: null, global: null, errors: [],
    listings: [{
      symbol: 'TEST', firstSeenAt: null, priceUsdt: null, priceChange24h: null, volume24h: null, marketCap: null, fdv: null,
      binance: { ...exchange }, okx: { ...exchange }, bybit: { ...exchange }, bitget: { ...exchange },
      coinbase: { ...exchange }, upbit: { ...exchange }, hyperliquid: { ...exchange },
      spotExchanges: [], perpExchanges: [], listingSequence: 'unknown', signalRating: 'D',
      perpWithoutSpot: false, multiExchangeSpot: false, perpLed: false, noteworthy: '', binanceAlpha: true, buySignal: false,
    }],
  };
}

test('validates legacy Worker data and nullable Alpha timestamps', () => {
  assert.equal(isWatchData(snapshot()), true);
  const current = snapshot();
  current.sources = { successful: ['alpha'], failed: [] };
  assert.equal(isWatchData(current), true);
  current.listings[0].firstSeenAt = Date.parse(current.generatedAt);
  assert.equal(isWatchData(current), true);
});

test('rejects malformed dates, enum values, numeric data and exchange state before rendering', () => {
  for (const corrupt of [
    data => { data.generatedAt = 'not a date'; },
    data => { data.lookbackDays = 366; },
    data => { data.lookbackDays = 1.5; },
    data => { data.listings[0].signalRating = 'X'; },
    data => { data.listings[0].listingSequence = 'other'; },
    data => { data.listings[0].priceUsdt = Infinity; },
    data => { data.listings[0].binance = null; },
    data => { data.listings[0].spotExchanges = [null]; },
    data => { data.global = {}; },
    data => { data.fearGreed = { value: '57', label: 'Neutral' }; },
  ]) {
    const data = snapshot();
    corrupt(data);
    assert.equal(isWatchData(data), false);
  }
});

test('API failure reads the published snapshot with the same read policy', async t => {
  const fresh = snapshot('2026-10-13T12:00:00Z');
  const urls = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    urls.push(url);
    assert.equal(init.cache, 'no-store');
    assert.ok(init.signal instanceof AbortSignal);
    return url.startsWith('/api/') ? new Response('', { status: 404 }) : Response.json(fresh);
  });
  assert.deepEqual(await loadWatchUpdate(snapshot(), new AbortController().signal), fresh);
  assert.deepEqual(urls, ['/api/watch-data', '/data/watch-data.json']);
});

test('older or malformed responses cannot replace a newer build snapshot', async t => {
  let reads = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    reads++;
    return Response.json(reads === 1 ? snapshot('2026-10-12T12:00:00Z') : { generatedAt: '2026-10-13T12:00:00Z' });
  });
  assert.equal(await loadWatchUpdate(snapshot(), new AbortController().signal), null);
  assert.equal(reads, 2);
});

test('fresh valid API response is accepted without a duplicate static request', async t => {
  const fresh = snapshot('2026-10-13T12:00:00Z');
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json(fresh));
  assert.deepEqual(await loadWatchUpdate(snapshot(), new AbortController().signal), fresh);
  assert.equal(fetch.mock.callCount(), 1);
});

test('cancellation aborts the active read and prevents fallback or late commitment', async t => {
  const controller = new AbortController();
  let requestSignal;
  const fetch = t.mock.method(globalThis, 'fetch', async (_url, init) => {
    requestSignal = init.signal;
    controller.abort();
    return Response.json(snapshot('2026-10-13T12:00:00Z'));
  });
  assert.equal(await loadWatchUpdate(snapshot(), controller.signal), null);
  assert.equal(requestSignal.aborted, true);
  assert.equal(fetch.mock.callCount(), 1);
});

test('total refresh failure preserves initial data rather than publishing an empty failure', async t => {
  const emptyFailure = { ...snapshot('2026-10-13T12:00:00Z'), listings: [], errors: ['upstream failed'] };
  t.mock.method(globalThis, 'fetch', async () => Response.json(emptyFailure));
  assert.equal(await loadWatchUpdate(snapshot(), new AbortController().signal), null);
});

test('read timeout aborts the Worker request and allows bounded static fallback', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const fresh = snapshot('2026-10-13T12:00:00Z');
  let workerSignal;
  const fetch = t.mock.method(globalThis, 'fetch', async (url, init) => {
    if (!url.startsWith('/api/')) return Response.json(fresh);
    workerSignal = init.signal;
    return new Promise((_resolve, reject) => init.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }));
  });
  const update = loadWatchUpdate(snapshot(), new AbortController().signal);
  t.mock.timers.tick(10_000);
  assert.deepEqual(await update, fresh);
  assert.equal(workerSignal.aborted, true);
  assert.equal(fetch.mock.callCount(), 2);
});
