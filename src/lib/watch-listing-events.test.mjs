import assert from 'node:assert/strict';
import { test } from 'node:test';
import snapshot from '../data/watch-listing-events.json' with { type: 'json' };
import news from '../data/market-news.json' with { type: 'json' };
import { filterWatchListingEvents, readWatchListingEvents, watchEventStatus } from './watch-listing-events.ts';

const timeline = readWatchListingEvents(snapshot);
const byId = id => timeline.events.find(event => event.id === id);

test('records exact Binance spot and perpetual evidence independently of announcement times', () => {
  assert.ok(timeline.events.length >= 7);
  const antb = byId('binance-spot-antb');
  assert.deepEqual(antb.instruments, ['ANTB/USDT']);
  assert.equal(antb.assetKind, 'tokenized-equity');
  assert.equal(antb.notice.publishedAt, null);
  assert.equal(antb.notice.displayedPublication, '2026-11-19 16:52');
  assert.equal(antb.eqn.publishedAt, '2026-11-19T16:52:17.812Z');
  assert.equal(antb.effective.effectiveAt, '2026-11-19T18:00:00.000Z');
  assert.equal(antb.observed.firstObservedAt, antb.effective.effectiveAt);
  assert.equal(new URL(antb.effective.url).searchParams.get('symbol'), 'ANTBUSDT');
  const jnj = byId('binance-usdm-jnj-perpetual');
  assert.equal(jnj.market, 'perp');
  assert.equal(jnj.assetKind, 'equity-linked');
  assert.equal(jnj.effective.basis, 'onboard-date');
  assert.equal(jnj.effective.effectiveAt, '2026-11-20T09:30:00.000Z');
  assert.equal(jnj.observed.basis, 'minute-bar');
  assert.equal(watchEventStatus(jnj, timeline.reviewedAt), 'verified');
});

test('keeps the Bithumb opening schedule, observed bar and effective time separate', () => {
  const kntq = byId('bithumb-spot-kntq-krw');
  assert.equal(kntq.notice.publishedAt, '2026-11-19T02:58:59.000Z');
  assert.equal(kntq.scheduledAt, '2026-11-19T07:00:00.000Z');
  assert.equal(kntq.observed.firstObservedAt, '2026-11-19T07:05:00.000Z');
  assert.equal(kntq.effective, null);
  assert.equal(watchEventStatus(kntq, timeline.reviewedAt), 'observed');
});

test('does not promote a postponed date, a future removal, pair status or Alpha to an effective timestamp', () => {
  const predict = byId('binance-spot-predict-postponement');
  assert.equal(predict.previousSchedule.at, '2026-10-30T10:00:00.000Z');
  assert.equal(predict.scheduledAt, null);
  assert.equal(predict.effective, null);
  assert.equal(watchEventStatus(predict, timeline.reviewedAt), 'postponed');

  const bybit = byId('bybit-spot-nov27-delistings');
  assert.equal(bybit.notice.publishedAt, '2026-11-20T08:00:03.000Z');
  assert.equal(bybit.scheduledAt, '2026-11-27T08:00:00.000Z');
  assert.equal(bybit.effective, null);
  assert.equal(watchEventStatus(bybit, timeline.reviewedAt), 'scheduled');
  assert.equal(watchEventStatus(bybit, '2026-11-28T00:00:00.000Z'), 'pending');

  const gas = byId('binance-spot-gas-try-removal');
  assert.deepEqual(gas.instruments, ['GAS/TRY']);
  assert.equal(gas.effective, null);
  assert.equal(gas.observed.firstObservedAt, '2026-11-20T09:47:24.428Z');
  assert.equal(watchEventStatus(gas, timeline.reviewedAt), 'removed');

  const clear = byId('binance-alpha-clear-ethereum');
  assert.equal(clear.effective, null);
  assert.equal(clear.market, 'alpha');
  assert.equal(watchEventStatus(clear, timeline.reviewedAt), 'discovered');
});

test('combines the market, venue, region and event status filters', () => {
  const ids = (filter) => filterWatchListingEvents(timeline.events, { market: '', venue: '', region: '', status: '', ...filter }, timeline.reviewedAt).map(event => event.id);
  assert.deepEqual(ids({ market: 'perp', status: 'verified' }), ['binance-usdm-jnj-perpetual']);
  assert.deepEqual(ids({ market: 'alpha', venue: 'Binance' }), ['binance-alpha-clear-ethereum']);
  assert.deepEqual(ids({ market: 'spot', venue: 'Bithumb', region: 'kr', status: 'observed' }), ['bithumb-spot-kntq-krw']);
  assert.deepEqual(ids({ region: 'kr', status: 'postponed' }), []);
});

test('uses archived EQN evidence when the current roundup is missing or mismatched', () => {
  assert.deepEqual(readWatchListingEvents(snapshot, { unavailable: true }).events, timeline.events);
  assert.equal(readWatchListingEvents(snapshot, news.panels.watch).events.length, timeline.events.length);
  const antb = byId('binance-spot-antb');
  const changed = { ...antb.eqn, publishedAt: '2026-11-19T16:52:17.811Z' };
  const wrongNotice = { ...changed, url: 'https://eqn.news/main/16038' };
  assert.deepEqual(readWatchListingEvents(snapshot, [wrongNotice]).events, timeline.events);
  const updated = readWatchListingEvents(snapshot, [changed]).events.find(event => event.id === antb.id);
  assert.deepEqual(updated.eqn, changed);
  assert.deepEqual(updated.notice, antb.notice);
  assert.deepEqual(updated.effective, antb.effective);
});

test('rejects ambiguous UTC times, conflicting event identity and non-authoritative evidence', () => {
  for (const alter of [
    data => { data.events[0].effective.effectiveAt = '2026-11-19T16:52:17.812Z'; },
    data => { data.events[1].notice.publishedAt = '2026-11-19 11:58:59'; },
    data => { data.events[1].observed.firstObservedAt = '2026-02-29T09:17:00.000Z'; },
    data => { data.events[0].effective.url = 'https://eqn.news/monitor/16038'; },
    data => { data.events[0].notice.url = 'https://www.binance.com@example.net/notices/1'; },
    data => { data.events[0].eqn.url = 'https://eqn.news/monitor/16165'; },
    data => { data.events[6].market = 'spot'; data.events[6].instruments = ['CLEAR/USDT']; },
    data => { data.events.push(data.events[0]); },
  ]) {
    const copy = structuredClone(snapshot);
    alter(copy);
    assert.equal(readWatchListingEvents(copy, news.panels.watch), null);
  }
  assert.equal(readWatchListingEvents(null, []), null);
  assert.deepEqual(readWatchListingEvents({ reviewedAt: snapshot.reviewedAt, events: [] }, []).events, []);
});
