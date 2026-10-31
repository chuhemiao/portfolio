import test from 'node:test';
import assert from 'node:assert/strict';

import { INSTRUMENT_GROUPS, groupForTicker } from './instrument-groups.ts';
import {
  QUOTES_REPORTED_TOTAL,
  getInstrument,
  getInstrumentCount,
  getInstruments,
  getIssuerTotals,
  getQuote,
  instrumentCountFor,
} from './instruments.ts';

const TICKERS = getInstruments('bstocks').map((instrument) => instrument.ticker);

test('every ingested instrument belongs to exactly one group', () => {
  const seen = new Map();
  for (const group of INSTRUMENT_GROUPS) {
    for (const ticker of group.tickers) {
      assert.ok(!seen.has(ticker), `${ticker} is in both ${seen.get(ticker)} and ${group.slug}`);
      seen.set(ticker, group.slug);
    }
  }
  const unassigned = TICKERS.filter((ticker) => !seen.has(ticker));
  assert.deepEqual(unassigned, [], `unassigned: ${unassigned.join(' ')}`);
});

test('no group points at an instrument that does not exist', () => {
  for (const group of INSTRUMENT_GROUPS) {
    for (const ticker of group.tickers) {
      assert.ok(getInstrument('bstocks', ticker), `${group.slug} references unknown ${ticker}`);
    }
  }
});

test('groups are five instruments each, numbered without gaps', () => {
  const indexes = INSTRUMENT_GROUPS.map((group) => group.index);
  assert.deepEqual(
    indexes,
    Array.from({ length: INSTRUMENT_GROUPS.length }, (_, i) => i + 1)
  );
  for (const group of INSTRUMENT_GROUPS) {
    assert.equal(group.tickers.length, 5, `${group.slug} has ${group.tickers.length}`);
    assert.equal(new Set(group.tickers).size, 5, `${group.slug} repeats a ticker`);
  }
  assert.equal(new Set(INSTRUMENT_GROUPS.map((g) => g.slug)).size, INSTRUMENT_GROUPS.length);
});

test('every group ships all three locales', () => {
  for (const group of INSTRUMENT_GROUPS) {
    for (const field of ['label', 'title', 'thesis']) {
      assert.equal(group[field].length, 3, `${group.slug}.${field}`);
      group[field].forEach((text, i) => {
        assert.ok(text.trim().length > 0, `${group.slug}.${field}[${i}] is empty`);
      });
    }
    // A locale left as a copy of English is the failure this catches.
    assert.notEqual(group.title[0], group.title[1], `${group.slug} zh title is the English one`);
    assert.notEqual(group.title[0], group.title[2], `${group.slug} ja title is the English one`);
    assert.notEqual(group.thesis[0], group.thesis[1], `${group.slug} zh thesis is the English one`);
    assert.notEqual(group.thesis[0], group.thesis[2], `${group.slug} ja thesis is the English one`);
  }
});

test('groupForTicker finds a group and misses cleanly', () => {
  assert.equal(groupForTicker('SPCXB').slug, 'flagship-pricing-anchors');
  assert.equal(groupForTicker('MRNAB').slug, 'pharma-and-consumer');
  assert.equal(groupForTicker('NOPEB'), undefined);
});

test('the instrument count is counted, not written down', () => {
  assert.equal(getInstrumentCount('bstocks'), TICKERS.length);
  assert.deepEqual(instrumentCountFor({ slug: 'bstocks' }), { value: TICKERS.length, counted: true });
  // An issuer with nothing ingested falls back to its own published figure,
  // marked as not counted so the page can say so.
  assert.deepEqual(instrumentCountFor({ slug: 'dinari', reportedInstrumentCount: 724 }), {
    value: 724,
    counted: false,
  });
  assert.equal(instrumentCountFor({ slug: 'nothing-here' }), undefined);
});

test('market cap comes from marketCap, not fully diluted value', () => {
  // NBISB reports totalSupply 0, so its fullyDilluttedMarketCap is 0. Reading
  // that field makes a $12.8M instrument disappear.
  const nbisb = getQuote('NBISB');
  assert.ok(nbisb.marketCapUsd > 12_000_000, `NBISB marketCapUsd is ${nbisb.marketCapUsd}`);
});

test('quotes keep listing-relative extremes, not all-time ones', () => {
  const spcxb = getQuote('SPCXB');
  assert.ok('listedHigh' in spcxb && 'listedLow' in spcxb);
  assert.ok(!('ath' in spcxb) && !('atl' in spcxb));
});

test('issuer totals separate instruments from priced instruments', () => {
  const totals = getIssuerTotals('bstocks');
  assert.equal(totals.instrumentCount, TICKERS.length);
  assert.ok(totals.quotedCount <= totals.instrumentCount);
  assert.ok(totals.marketCapUsd > 1_000_000_000);
  assert.ok(totals.turnover > 0.5 && totals.turnover < 1);
  assert.equal(totals.firstListedAt, '2026-06-11');
  assert.ok(totals.lastListedAt >= totals.firstListedAt);
  // CMC lists more than the payload carries; the gap must stay visible.
  assert.ok(QUOTES_REPORTED_TOTAL >= totals.quotedCount);
});

test('every instrument has a group, so an instrument page always has a next read', () => {
  for (const ticker of TICKERS) {
    const group = groupForTicker(ticker);
    assert.ok(group, `${ticker} has no group`);
    assert.equal(group.tickers.filter((t) => t !== ticker).length, 4);
  }
});

// The sector column and its filter render `label`, not `title`: a headline like
// "Why is a pharma stock second-most traded?" is a sentence, not a sector, and
// two groups sharing a label would make the filter ambiguous.
test('sector labels are short and unique within each locale', () => {
  for (let i = 0; i < 3; i += 1) {
    const seen = new Map();
    for (const group of INSTRUMENT_GROUPS) {
      const label = group.label[i];
      assert.ok(label.length <= 28, `${group.slug} label[${i}] is ${label.length} chars, too long for a cell`);
      assert.ok(!seen.has(label), `${group.slug} and ${seen.get(label)} share the label "${label}"`);
      seen.set(label, group.slug);
      assert.ok(!label.endsWith('?') && !label.endsWith('\uff1f'), `${group.slug} label[${i}] is a question, not a sector`);
    }
  }
});
