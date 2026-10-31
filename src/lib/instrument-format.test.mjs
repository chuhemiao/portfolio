import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MISSING,
  changeToneClass,
  formatChange,
  formatPrice,
  formatSupply,
  formatTurnover,
  formatUsd,
  turnoverTone,
} from './instrument-format.ts';

// Real bStocks turnover ratios, CMC 2026-10-31T06:06:52Z. The whole point of the
// × scale is that these span two orders of magnitude inside one issuer.
const REAL_TURNOVER = {
  AMATB: 0.12968532,
  CRMB: 0.18291813,
  SPCXB: 0.45793709,
  SNDKB: 1.27035617,
  ALABB: 5.10896612,
  MRNAB: 10.30668276,
  INTWB: 38.45987317,
};

test('turnover renders as a multiple, not a percentage', () => {
  assert.equal(formatTurnover(REAL_TURNOVER.AMATB), '0.13×');
  assert.equal(formatTurnover(REAL_TURNOVER.SPCXB), '0.46×');
  assert.equal(formatTurnover(REAL_TURNOVER.SNDKB), '1.27×');
  assert.equal(formatTurnover(REAL_TURNOVER.INTWB), '38.5×');
});

test('turnover drops to one decimal from 5.00 up', () => {
  assert.equal(formatTurnover(4.99), '4.99×');
  assert.equal(formatTurnover(5), '5.0×');
  assert.equal(formatTurnover(REAL_TURNOVER.ALABB), '5.1×');
  assert.equal(formatTurnover(REAL_TURNOVER.MRNAB), '10.3×');
});

test('turnover tones split at 0.30 / 1.00 / 5.00', () => {
  assert.equal(turnoverTone(0.29), 'subtle');
  assert.equal(turnoverTone(0.3), 'default');
  assert.equal(turnoverTone(0.99), 'default');
  assert.equal(turnoverTone(1), 'brand');
  assert.equal(turnoverTone(4.99), 'brand');
  assert.equal(turnoverTone(5), 'negative');
});

test('turnover tones place the real instruments in four distinct tiers', () => {
  assert.equal(turnoverTone(REAL_TURNOVER.CRMB), 'subtle');
  assert.equal(turnoverTone(REAL_TURNOVER.SPCXB), 'default');
  assert.equal(turnoverTone(REAL_TURNOVER.SNDKB), 'brand');
  assert.equal(turnoverTone(REAL_TURNOVER.INTWB), 'negative');
});

test('a missing figure is a dash, never zero', () => {
  for (const absent of [undefined, null, Number.NaN]) {
    assert.equal(formatUsd(absent), MISSING);
    assert.equal(formatPrice(absent), MISSING);
    assert.equal(formatTurnover(absent), MISSING);
    assert.equal(formatChange(absent), MISSING);
    assert.equal(formatSupply(absent), MISSING);
  }
});

test('usd keeps two decimals at B and one below', () => {
  assert.equal(formatUsd(1_318_380_591), '$1.32B');
  assert.equal(formatUsd(12_819_574.407), '$12.8M');
  assert.equal(formatUsd(873_461_356), '$873.5M');
  assert.equal(formatUsd(9_024.34), '$9.0K');
});

test('price keeps two decimals and thousands separators', () => {
  assert.equal(formatPrice(1155.1957615015583), '$1,155.20');
  assert.equal(formatPrice(136.9754348358997), '$136.98');
  assert.equal(formatPrice(0.9612), '$0.96');
});

test('change carries an explicit sign and a true minus', () => {
  assert.equal(formatChange(4.0370357), '+4.04%');
  assert.equal(formatChange(-7.05699238), '−7.06%');
  assert.equal(formatChange(0), '0.00%');
  assert.equal(changeToneClass(4.04), 'text-positive');
  assert.equal(changeToneClass(-7.06), 'text-negative');
});

test('supply is a whole number of tokens', () => {
  assert.equal(formatSupply(1270026.05045019), '1,270,026');
  assert.equal(formatSupply(2591.57256564), '2,592');
});
