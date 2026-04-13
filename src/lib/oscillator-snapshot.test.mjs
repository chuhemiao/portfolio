import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

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
  assert.match(normalized.note ?? '', /weekly snapshot/i);
});

test('package.json exposes a sync command for oscillator snapshots', () => {
  assert.equal(typeof packageJson.scripts['sync:oscillator'], 'string');
});

test('oscillator sync script prefers surf-backed market data when available', () => {
  assert.match(syncScriptSource, /market-ranking/);
  assert.match(syncScriptSource, /exchange-price/);
  assert.match(syncScriptSource, /exchange-markets/);
  assert.match(syncScriptSource, /market-price/);
  assert.match(syncScriptSource, /project-detail/);
});

test('oscillator sync script expands the market universe to the top 500', () => {
  assert.match(syncScriptSource, /TOP_UNIVERSE_LIMIT\s*=\s*500/);
  assert.match(syncScriptSource, /\[0,\s*100,\s*200,\s*300,\s*400\]/);
  assert.match(syncScriptSource, /limit=\$\{TOP_UNIVERSE_LIMIT\}/);
});

test('oscillator sync script keeps cache-friendly legacy fallbacks for CG and CMC', () => {
  assert.match(syncScriptSource, /per_page=50&page=2/);
  assert.match(syncScriptSource, /limit=300/);
});
