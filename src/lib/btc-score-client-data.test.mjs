import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isBtcScoreData, loadBtcScore } from './btc-score-client-data.ts';

function scoreData() {
  return {
    timestamp: '2026-10-13T11:11:35Z', btcPrice: 120000, score: 38.2, dailyScore: 50, weeklyScore: 35,
    level: 'Moderate Fear', suggestion: 'Observe',
    indicators: [{ name: 'AHR999', value: 0.5204, score: 17, weight: 10, group: 'daily' }],
  };
}

test('validates scores including unavailable indicator values and rejects malformed wire data', () => {
  assert.equal(isBtcScoreData(scoreData()), true);
  const nullable = scoreData();
  nullable.indicators[0].value = null;
  assert.equal(isBtcScoreData(nullable), true);
  for (const corrupt of [
    data => { data.score = 101; },
    data => { data.btcPrice = NaN; },
    data => { data.timestamp = 'unknown'; },
    data => { data.indicators[0].score = '17'; },
    data => { data.indicators[0].weight = Infinity; },
    data => { data.indicators[0].group = 'other'; },
    data => { data.indicators = []; },
  ]) {
    const data = scoreData();
    corrupt(data);
    assert.equal(isBtcScoreData(data), false);
  }
});

test('missing API reads the static score and marks its provenance', async t => {
  const urls = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    urls.push(url);
    assert.equal(init.cache, 'no-store');
    return url.startsWith('/api/') ? new Response('', { status: 404 }) : Response.json(scoreData());
  });
  assert.deepEqual(await loadBtcScore(new AbortController().signal), { ...scoreData(), _snapshot: true });
  assert.deepEqual(urls, ['/api/btc-score', '/data/btc-score.json']);
});

test('invalid API and missing snapshot leave heat data unavailable', async t => {
  t.mock.method(globalThis, 'fetch', async url => url.startsWith('/api/') ? Response.json({ score: 38.2 }) : new Response('', { status: 404 }));
  assert.equal(await loadBtcScore(new AbortController().signal), null);
});

test('unmount cancellation rejects late completion and skips fallback', async t => {
  const controller = new AbortController();
  const fetch = t.mock.method(globalThis, 'fetch', async (_url, init) => {
    controller.abort();
    assert.equal(init.signal.aborted, true);
    return Response.json(scoreData());
  });
  assert.equal(await loadBtcScore(controller.signal), null);
  assert.equal(fetch.mock.callCount(), 1);
});

test('API timeout falls back to the static score within the read policy', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    if (!url.startsWith('/api/')) return Response.json(scoreData());
    return new Promise((_resolve, reject) => init.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }));
  });
  const pending = loadBtcScore(new AbortController().signal);
  await new Promise(setImmediate);
  t.mock.timers.tick(10_000);
  assert.equal((await pending)._snapshot, true);
});

test('a newer synchronized snapshot replaces a valid older API cache', async t => {
  const older = { ...scoreData(), timestamp: '2026-10-12T11:00:00Z', _cached: true };
  t.mock.method(globalThis, 'fetch', async url => Response.json(url.startsWith('/api/') ? older : scoreData()));
  const selected = await loadBtcScore(new AbortController().signal);
  assert.equal(selected.timestamp, scoreData().timestamp);
  assert.equal(selected._snapshot, true);
});

test('a newer API cache wins over the older snapshot and retains cache provenance', async t => {
  const newer = { ...scoreData(), timestamp: '2026-10-13T12:00:00Z', _cached: true };
  t.mock.method(globalThis, 'fetch', async url => Response.json(url.startsWith('/api/') ? newer : scoreData()));
  const selected = await loadBtcScore(new AbortController().signal);
  assert.equal(selected.timestamp, newer.timestamp);
  assert.equal(selected._snapshot, false);
  assert.equal(selected._cached, true);
});
