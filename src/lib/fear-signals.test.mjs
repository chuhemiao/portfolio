import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';
import {
  DAY_MS,
  FEAR_BITVIEW_TREND_DAYS,
  HOUR_MS,
  buildFearSignalHistory,
  contiguousFundingWindow,
  describeFearArchive,
  evaluateFearSignals,
  findFearTriggers,
  indexFearDays,
  indexFearFunding,
  readClosedBtcDays,
  readFearBitviewDays,
  readFearBitviewTrend,
  readFearBitviewZScores,
  retainFearArchive,
  retainFearBitviewDays,
  retainFearBitviewTrend,
  summarizeFearHistory,
  summarizeFearScore,
  uniqueAddressesRising,
} from './fear-signals.ts';

const t0 = Date.parse('2026-11-20T00:00:00.000Z');
const cutoff = t0 + 10 * HOUR_MS + 60_000;
const candle = (start, close, end = start + DAY_MS - 1) => [start, '', '', '', String(close), '', end];
const bitviewPayload = (date = '2026-11-19') => [
  ['Date', [date]],
  ['OHLCDollars', [[62595.22, 63835, 61733.46, 61858.58]]],
  ['Dollars', [1244243457007.97]],
  ['Dollars', [1074476023901.21]],
  ['Dollars', [53418.45]],
].map(([type, data], index) => ({ version: index + 1, index: 'day1', type, start: 6531, end: 6532, data }));
const bitviewZPayload = (marketCaps, realizedCaps) => [
  ['Date', marketCaps.map((_, i) => new Date(Date.UTC(2009, 0, 1) + i * DAY_MS).toISOString().slice(0, 10))],
  ['Dollars', marketCaps],
  ['Dollars', realizedCaps],
].map(([type, data], index) => ({ version: index + 1, index: 'day1', type, start: 0, end: data.length, data }));
const trendStart = t0 - FEAR_BITVIEW_TREND_DAYS * DAY_MS;
const bitviewTrendPayload = () => {
  const dates = Array.from({ length: FEAR_BITVIEW_TREND_DAYS }, (_, i) => new Date(trendStart + i * DAY_MS).toISOString().slice(0, 10));
  const jumps = { '2026-07-04': 1_000, '2026-07-05': 200, '2026-11-15': 300 };
  const prices = dates.map(date => Array(4).fill(jumps[date] ?? 100));
  return [['Date', dates], ['OHLCDollars', prices]].map(([type, data], index) => ({
    version: index + 1, index: 'day1', type, start: 4952, end: 6532, data,
  }));
};

test('shared Fear rules preserve exact thresholds, weights, unknowns and the score cap', () => {
  const boundary = evaluateFearSignals({
    btcPrice: 70,
    realizedPrice: 70,
    mvrvZ: -1,
    fearGreed: 20,
    dormancyFlow: 450_000,
    vix: 30,
    sp500Drawdown: 20,
  });
  assert.deepEqual(Object.values(boundary), ['off', 'off', 'off', 'off', 'unknown', 'off', 'off', 'unknown']);
  assert.deepEqual(summarizeFearScore(Object.values(boundary)), { raw: 33, score: 33, known: 6 });
  assert.deepEqual(summarizeFearScore(Object.values(evaluateFearSignals({}))), { raw: 45, score: 45, known: 0 });
  assert.deepEqual(summarizeFearScore(['unknown', 'unknown', 'on', 'unknown', 'on', 'off', 'off', 'unknown']), { raw: 57, score: 57, known: 4 });
  assert.deepEqual(summarizeFearScore(Array(8).fill('on')), { raw: 109, score: 100, known: 8 });
});

test('only accepts unambiguous finished UTC candle days', () => {
  assert.deepEqual(readClosedBtcDays([
    candle(t0 - DAY_MS, 60_000),
    candle(t0 - DAY_MS, 60_000),
    candle(t0, 65_000),
    candle(t0 - 2 * DAY_MS, 59_000, t0 - DAY_MS - 2),
    candle(t0 - 3 * DAY_MS, 55_000),
    candle(t0 - 3 * DAY_MS, 55_001),
    candle(t0 - 4 * DAY_MS + 1, 54_000),
    candle(t0 - 5 * DAY_MS, 0),
  ], cutoff), [[t0 - DAY_MS, 60_000]]);
  assert.deepEqual(readClosedBtcDays([candle(t0 - DAY_MS, 60_000)], t0 - 1), []);
});

test('Bitview inputs bind exact aligned daily envelopes, ordered series and closed UTC dates', () => {
  const collectedAt = '2026-11-20T16:36:25.000Z';
  assert.deepEqual(readFearBitviewDays(bitviewPayload(), cutoff, collectedAt), [{
    date: '2026-11-19', collectedAt, usdClose: 61858.58, marketCap: 1244243457007.97,
    realizedCap: 1074476023901.21, realizedPrice: 53418.45,
  }]);
  assert.deepEqual(readFearBitviewDays(bitviewPayload('2026-11-20'), cutoff, collectedAt), []);
  assert.deepEqual(readFearBitviewDays(bitviewPayload('2026-05-23'), cutoff, collectedAt), []);
  for (const invalidate of [
    payload => payload.reverse(),
    payload => { payload[2].start -= 1; },
    payload => { payload[1].index = 'hour1'; },
    payload => { payload[3].data = [0]; },
    payload => { payload[3].data = [1, 2]; },
    payload => { payload[4].data = ['53418.45']; },
    payload => { payload[1].data[0][1] = 61000; },
  ]) {
    const payload = bitviewPayload();
    invalidate(payload);
    assert.deepEqual(readFearBitviewDays(payload, cutoff, collectedAt), []);
  }
});

test('Bitview retention accepts a same-day refresh and discards future or invalid observations', () => {
  const collectedAt = '2026-11-20T09:00:00.000Z';
  const previous = readFearBitviewDays(bitviewPayload(), cutoff, collectedAt);
  const afterNextClose = cutoff + DAY_MS;
  const fresh = readFearBitviewDays(bitviewPayload('2026-11-20'), afterNextClose, '2026-11-21T09:00:00.000Z');
  assert.deepEqual(retainFearBitviewDays(fresh, previous, afterNextClose), [...previous, ...fresh]);
  assert.deepEqual(retainFearBitviewDays([], previous, afterNextClose), previous);
  const replacement = { ...previous[0], collectedAt: new Date(cutoff).toISOString(), realizedPrice: 54_000 };
  assert.deepEqual(retainFearBitviewDays([replacement], previous, cutoff), [replacement]);
  assert.deepEqual(retainFearBitviewDays([], [{ ...previous[0], collectedAt: '2026-11-19T18:00:00.000Z' }], cutoff), []);
  assert.deepEqual(retainFearBitviewDays([], fresh, cutoff), []);

  const verified = { ...previous[0], mvrvZ: { value: 0, collectedAt } };
  assert.deepEqual(retainFearBitviewDays([replacement], [verified], cutoff), [{ ...replacement, mvrvZ: verified.mvrvZ }]);
  const changedCaps = { ...replacement, marketCap: replacement.marketCap + 1 };
  assert.deepEqual(retainFearBitviewDays([changedCaps], [verified], cutoff), [changedCaps]);
  const future = { ...verified, mvrvZ: { value: 0, collectedAt: '2026-11-21T09:00:00.000Z' } };
  assert.deepEqual(retainFearBitviewDays([], [future], cutoff), previous);
});

test('Bitview Z-score uses expanding population variance, includes zero and excludes nulls', () => {
  const payload = bitviewZPayload([0, null, 10, 20], [null, null, 5, 5]);
  const capturedAt = '2009-01-05T02:00:00.000Z';
  const end = Date.parse(capturedAt);
  const valuation = [
    { date: '2009-01-03', marketCap: 10, realizedCap: 5 },
    { date: '2009-01-04', marketCap: 20, realizedCap: 5 },
  ];
  assert.deepEqual([...readFearBitviewZScores(payload, valuation, end, capturedAt)], [
    ['2009-01-03', { value: 1, collectedAt: capturedAt }],
    ['2009-01-04', { value: 15 / Math.sqrt(200 / 3), collectedAt: capturedAt }],
  ]);
  assert.equal(readFearBitviewZScores(payload, valuation, end - DAY_MS, capturedAt).size, 0);
  assert.equal(readFearBitviewZScores(null, valuation, end, capturedAt).size, 0);
  assert.equal(readFearBitviewZScores(payload, [valuation[0], { ...valuation[1], realizedCap: 6 }], end, capturedAt).size, 0);
  const missingGenesis = structuredClone(payload);
  for (const envelope of missingGenesis) {
    envelope.start = 1;
    envelope.data.shift();
  }
  assert.equal(readFearBitviewZScores(missingGenesis, valuation, end, capturedAt).size, 0);
  assert.equal(readFearBitviewZScores(bitviewZPayload([20, 20, 20, 20], [5, 5, 5, 5]), [valuation[1]], end, capturedAt).size, 0);
});

test('Bitview USD trend updates a 200-week mean on each fully closed UTC Sunday, including holiday weeks', () => {
  const collectedAt = new Date(cutoff).toISOString();
  const payload = bitviewTrendPayload();
  const trend = readFearBitviewTrend(payload, cutoff, collectedAt);
  assert.equal(trend.collectedAt, collectedAt);
  assert.equal(trend.points.length, 180);
  assert.deepEqual(trend.points[0], { date: '2026-05-24', usdClose: 100, ma200Week: 100 });
  const days = new Map(trend.points.map(point => [point.date, point]));
  assert.deepEqual(days.get('2026-07-04'), { date: '2026-07-04', usdClose: 1_000, ma200Week: 100 });
  assert.deepEqual(days.get('2026-07-05'), { date: '2026-07-05', usdClose: 200, ma200Week: 100.5 });
  assert.equal(days.get('2026-11-14').ma200Week, 100.5);
  assert.equal(days.get('2026-11-15').ma200Week, 101.5);
  assert.deepEqual(trend.points.at(-1), { date: '2026-11-19', usdClose: 100, ma200Week: 101.5 });

  const missingDay = structuredClone(payload);
  missingDay[1].data[5] = null;
  assert.equal(readFearBitviewTrend(missingDay, cutoff, collectedAt), undefined);
  const missingWeek = structuredClone(payload);
  for (const series of missingWeek) {
    series.data = series.data.slice(7);
    series.start += 7;
  }
  assert.equal(readFearBitviewTrend(missingWeek, cutoff, collectedAt), undefined);
  assert.equal(readFearBitviewTrend(payload, cutoff - DAY_MS, collectedAt), undefined);
});

test('Bitview trend fallback keeps verified paired dates and collection time without extending them', () => {
  const collectedAt = new Date(cutoff).toISOString();
  const trend = readFearBitviewTrend(bitviewTrendPayload(), cutoff, collectedAt);
  assert.equal(retainFearBitviewTrend(undefined, cutoff), undefined);
  assert.deepEqual(retainFearBitviewTrend(trend, cutoff), trend);
  assert.deepEqual(retainFearBitviewTrend(trend, cutoff + DAY_MS), { collectedAt, points: trend.points.slice(1) });
  assert.equal(retainFearBitviewTrend(trend, cutoff - DAY_MS), undefined);
  assert.equal(retainFearBitviewTrend(trend, cutoff + 180 * DAY_MS), undefined);
});

test('activity requires exactly 14 consecutive completed source days', () => {
  const addresses = Array.from({ length: 14 }, (_, index) => [t0 - (14 - index) * DAY_MS, 700 + index]);
  const index = indexFearDays([...addresses, [t0, 999]], cutoff);
  assert.equal(uniqueAddressesRising(index, t0 - DAY_MS), true);
  assert.equal(uniqueAddressesRising(index, t0), null);
  assert.equal(uniqueAddressesRising(indexFearDays(addresses.filter((_, i) => i !== 5), cutoff), t0 - DAY_MS), null);
  assert.equal(uniqueAddressesRising(indexFearDays([...addresses, [t0 - 8 * DAY_MS, 999]], cutoff), t0 - DAY_MS), null);
});

test('funding needs eight distinct contiguous reported hours through the cutoff', () => {
  const hour = t0 + 10 * HOUR_MS;
  const settled = Array.from({ length: 8 }, (_, index) => [hour - (7 - index) * HOUR_MS + 2, -0.00001]);
  const available = indexFearFunding([settled[0], ...settled]);
  assert.deepEqual(contiguousFundingWindow(available, cutoff), settled);
  assert.equal(contiguousFundingWindow(available, hour + 1), null);
  assert.equal(contiguousFundingWindow(indexFearFunding([...settled, [hour + 3, -0.00001]]), cutoff), null);
  const withGap = [...settled.filter((_, i) => i !== 3), [hour - 8 * HOUR_MS + 2, -0.00001]];
  assert.equal(contiguousFundingWindow(indexFearFunding(withGap), cutoff), null);
  const flat = [...settled.slice(0, 7), [hour + 2, 0]];
  assert.equal(evaluateFearSignals({ fundingWindow: contiguousFundingWindow(indexFearFunding(flat), cutoff) }).funding, 'off');
});

test('history uses exact completed days without filling missing sources', () => {
  const priorDay = t0 - DAY_MS;
  const points = buildFearSignalHistory(
    cutoff,
    [[priorDay, 61_986.73]],
    indexFearDays([[priorDay, 10], [t0, 12]], cutoff),
    new Map(),
    new Map(),
  );
  const scored = summarizeFearHistory(points);
  assert.equal(scored.length, 180);
  assert.equal(scored.at(-2).score, null);
  assert.deepEqual({
    date: scored.at(-1).date,
    price: scored.at(-1).btcClose,
    score: scored.at(-1).score,
    coverage: scored.at(-1).known,
    knownConditions: Object.entries(scored.at(-1).signals).filter(([, state]) => state !== 'unknown'),
  }, {
    date: '2026-11-19',
    price: 61_986.73,
    score: 53,
    coverage: 1,
    knownConditions: [['fearGreed', 'on']],
  });
});

test('realized-price history compares same-day Bitview USD values without changing the Binance chart', () => {
  const priorDay = t0 - DAY_MS;
  const points = buildFearSignalHistory(
    cutoff,
    [[priorDay, 40_000]],
    new Map(),
    new Map(),
    new Map(),
    [
      { date: '2026-11-17', usdClose: 51_000, realizedPrice: 53_000, mvrvZ: { value: -1.01 } },
      { date: '2026-11-19', usdClose: 62_000, realizedPrice: 53_000 },
    ],
  );
  assert.equal(points.at(-1).signals.realizedPrice, 'off');
  assert.equal(points.at(-1).signals.mvrvZ, 'unknown');
  assert.equal(points.at(-1).btcClose, 40_000);
  assert.equal(points.at(-2).signals.realizedPrice, 'unknown');
  assert.equal(points.at(-3).signals.realizedPrice, 'on');
  assert.equal(points.at(-3).signals.mvrvZ, 'on');
  assert.equal(summarizeFearHistory(points).at(-3).score, 61);
});

test('streak confirmation is not backdated and gaps split qualifying periods', () => {
  const dated = (date, score, btcClose = 70_000) => ({ date: `2026-11-${date}`, score, btcClose, known: 3 });
  const points = [
    dated('01', 55), dated('02', 56), dated('03', 60), dated('04', null), dated('05', 56),
    dated('07', 59), dated('08', 59), dated('09', 50), dated('10', 60), dated('11', 61, null), dated('12', 59),
  ];
  const results = findFearTriggers(points, 55, 2);
  assert.deepEqual(results.map(run => [run.start.date, run.trigger.date, run.end.date, run.days, run.peak]), [
    ['2026-11-01', '2026-11-02', '2026-11-03', 3, 60],
    ['2026-11-07', '2026-11-08', '2026-11-08', 2, 59],
  ]);
  assert.deepEqual(findFearTriggers(points, 55, 3).map(run => run.trigger.date), ['2026-11-03']);
  assert.deepEqual(findFearTriggers(points, 90, 1), []);
});

test('archive recovery preserves verified original days and timestamps without extending coverage into a new day', () => {
  const row = (date, optionalSignals = {}) => ({
    date,
    btcClose: 62000,
    signals: { ...evaluateFearSignals({ fearGreed: 10 }), ...optionalSignals },
  });
  const archive = (generatedAt, signalHistory) => ({
    generatedAt,
    signalHistory,
    historySources: {
      funding: describeFearArchive(signalHistory, 'funding', true),
      uniqueAddresses: describeFearArchive(signalHistory, 'uniqueAddresses', true),
    },
  });
  const original = archive('2026-11-20T10:00:00.000Z', [
    row('2026-11-18', { funding: 'on', uniqueAddresses: 'on' }),
    row('2026-11-19', { funding: 'off', uniqueAddresses: 'on' }),
  ]);
  const update = archive('2026-11-21T10:00:00.000Z', [
    row('2026-11-18', { funding: 'off' }),
    row('2026-11-19'),
    row('2026-11-20'),
  ]);
  const updated = retainFearArchive(update, original);
  assert.deepEqual(updated.signalHistory.map(day => [day.signals.funding, day.signals.uniqueAddresses]), [
    ['off', 'on'], ['off', 'on'], ['unknown', 'unknown'],
  ]);
  assert.equal(updated.signalHistory[1].retainedFrom.funding, original.generatedAt);
  assert.equal(updated.signalHistory[2].retainedFrom, undefined);
  assert.equal(updated.historySources.funding.status, 'degraded');
  assert.equal(updated.historySources.funding.retainedDays, 1);
  assert.equal(updated.historySources.uniqueAddresses.status, 'down');
  assert.equal(updated.historySources.uniqueAddresses.retainedDays, 2);
  assert.deepEqual(retainFearArchive(update, { ...update, ...updated }), updated);
  const incompatible = structuredClone(original);
  incompatible.historySources.funding.source = 'Different funding history';
  assert.throws(() => retainFearArchive(update, incompatible), /archive source for funding/);
  incompatible.historySources.funding.source = original.historySources.funding.source;
  incompatible.signalHistory[1].retainedFrom = { funding: '2026-11-19T10:00:00.000Z' };
  assert.throws(() => retainFearArchive(update, incompatible), /archive timestamp for funding/);
});

test('collector replay rejects the unfinished candle and two sparse live signals', async () => {
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if (context.parentURL?.endsWith('/src/lib/fear-data.ts')) {
        if (specifier === '@/data/fear-manual-snapshot') {
          return nextResolve(new URL('../data/fear-manual-snapshot.ts', import.meta.url).href, context);
        }
        if (specifier === './fear-signals') return nextResolve(new URL('./fear-signals.ts', import.meta.url).href, context);
      }
      return nextResolve(specifier, context);
    },
  });
  const { getFearDashboardData } = await import('./fear-data.ts');
  const originalFetch = globalThis.fetch;
  const originalNow = Date.now;
  const previousKey = process.env.COINALYZE_API_KEY;
  process.env.COINALYZE_API_KEY = 'fear-regression-fixture';
  Date.now = () => cutoff;
  const dates = Array.from({ length: 14 }, (_, index) => ({ x: (t0 - (14 - index) * DAY_MS) / 1000, y: 200 + index }));
  dates.splice(3, 1);
  const bitviewRequests = [];
  let bitviewFailure = null;
  let bitviewZFailure = false;
  const marketCaps = Array(6532).fill(0);
  const realizedCaps = Array(6532).fill(null);
  marketCaps[6530] = 800_000_000_000;
  marketCaps[6531] = 1244243457007.97;
  realizedCaps[6531] = 1074476023901.21;
  globalThis.fetch = async rawUrl => {
    const url = new URL(rawUrl);
    if (url.hostname === 'bitview.space') {
      bitviewRequests.push(url);
      if (bitviewFailure === 'timeout') throw new DOMException('Timeout', 'TimeoutError');
      if (bitviewFailure) return Response.json({}, { status: bitviewFailure });
      if (url.searchParams.get('start') === '0') {
        return bitviewZFailure ? Response.json({}, { status: 429 }) : Response.json(bitviewZPayload(marketCaps, realizedCaps));
      }
      if (url.searchParams.get('series') === 'date,price_ohlc') return Response.json(bitviewTrendPayload());
      return Response.json(bitviewPayload());
    }
    if (url.pathname.endsWith('/future-markets')) return Response.json([{ base_asset: 'BTC', is_perpetual: true, exchange: 'Binance', symbol: 'BTCUSDT_PERP.A' }]);
    if (url.pathname.endsWith('/funding-rate-history')) {
      return Response.json([{ symbol: 'BTCUSDT_PERP.A', history: [9, 8, 7, 6, 5, 3, 2, 1].map(n => ({ t: (t0 + (10 - n) * HOUR_MS) / 1000, c: -0.0001 })) }]);
    }
    if (url.hostname === 'api.binance.com' && url.pathname.endsWith('/klines') && url.searchParams.get('interval') === '1d') {
      return Response.json([candle(t0 - DAY_MS, 60_000), candle(t0, 65_000)]);
    }
    if (url.hostname === 'api.binance.com' && url.pathname.endsWith('/ticker/24hr')) {
      return Response.json({ lastPrice: '40000', closeTime: cutoff });
    }
    if (url.pathname.endsWith('/n-unique-addresses') || url.pathname.endsWith('/n-active-addresses')) return Response.json({ values: dates });
    return Response.json({}, { status: 503 });
  };
  try {
    const data = await getFearDashboardData({ useManualFallback: false });
    assert.deepEqual(data.layer1.btcPriceSeries, [60_000]);
    assert.deepEqual(data.bottomSignals.filter(signal => /addresses .*rising|Funding rate negative/.test(signal.label)).map(signal => signal.status), ['unknown', 'unknown']);
    assert.equal(bitviewRequests.length, 3);
    assert.deepEqual(Object.fromEntries(bitviewRequests[0].searchParams), {
      series: 'date,price_ohlc,market_cap,realized_cap,realized_price', index: 'day1', start: '2026-05-24',
      end: '2026-11-20', limit: '180', format: 'json',
    });
    assert.deepEqual(Object.fromEntries(bitviewRequests[1].searchParams), {
      series: 'date,market_cap,realized_cap', index: 'day1', start: '0', end: '2026-11-20', limit: '7000', format: 'json',
    });
    assert.deepEqual(Object.fromEntries(bitviewRequests[2].searchParams), {
      series: 'date,price_ohlc', index: 'day1', start: '2022-07-24', end: '2026-11-20', limit: '1580', format: 'json',
    });
    assert.equal(data.bitviewTrend.points.at(-1).ma200Week, 101.5);
    assert.equal(data.layer1.btcPrice, 40_000);
    assert.equal(data.layer1.realizedPrice, 53418.45);
    assert.equal(data.layer1.realizedCap, 1074476023901.21);
    assert.equal(data.layer1.mvrv, 1244243457007.97 / 1074476023901.21);
    assert.ok(Number.isFinite(data.layer1.mvrvZ) && data.layer1.mvrvZ > 0);
    assert.equal(data.signalHistory.at(-1).signals.realizedPrice, 'off');
    assert.equal(data.signalHistory.at(-1).signals.mvrvZ, 'off');
    assert.deepEqual(data.bottomSignals[0], {
      label: 'BTC price below Realized Price', status: 'off', detail: '61858.58 ≥ 53418.45 USD/BTC',
      observations: [{ source: 'Bitview', observedAt: '2026-11-19' }],
    });

    bitviewZFailure = true;
    const noZ = await getFearDashboardData({ useManualFallback: false });
    assert.equal(noZ.layer1.mvrv, data.layer1.mvrv);
    assert.equal(noZ.layer1.mvrvZ, null);
    assert.equal(noZ.bottomSignals[0].status, 'off');
    assert.equal(noZ.bottomSignals[1].status, 'unknown');

    bitviewFailure = 429;
    const refreshed = await getFearDashboardData({ useManualFallback: false, previousBitviewDays: data.bitviewValuationHistory });
    assert.deepEqual(refreshed.bitviewValuationHistory, data.bitviewValuationHistory);
    assert.equal(refreshed.bottomSignals[0].status, 'off');
    assert.equal(refreshed.historySources.realizedPrice.freshDays, 0);
    assert.equal(refreshed.historySources.realizedPrice.retainedDays, 1);
    assert.equal(refreshed.historySources.mvrvZ.freshDays, 0);
    assert.equal(refreshed.historySources.mvrvZ.retainedDays, 1);
    assert.equal(refreshed.layer1.mvrvZ, data.layer1.mvrvZ);
    assert.equal(refreshed.bitviewTrend, undefined);

    bitviewFailure = 'timeout';
    Date.now = () => cutoff + DAY_MS;
    const stale = await getFearDashboardData({ useManualFallback: false, previousBitviewDays: data.bitviewValuationHistory });
    assert.deepEqual(stale.bitviewValuationHistory, data.bitviewValuationHistory);
    assert.equal(stale.layer1.realizedPrice, 53418.45);
    assert.equal(stale.bottomSignals[0].status, 'unknown');
    assert.equal(stale.signalHistory.at(-1).signals.realizedPrice, 'unknown');
    assert.equal(stale.signalHistory.at(-2).signals.realizedPrice, 'off');
    assert.equal(stale.signalHistory.at(-1).signals.mvrvZ, 'unknown');
    assert.equal(stale.signalHistory.at(-2).signals.mvrvZ, 'off');
  } finally {
    globalThis.fetch = originalFetch;
    Date.now = originalNow;
    if (previousKey === undefined) delete process.env.COINALYZE_API_KEY;
    else process.env.COINALYZE_API_KEY = previousKey;
  }
});
