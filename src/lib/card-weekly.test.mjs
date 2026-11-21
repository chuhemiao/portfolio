import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import snapshot from '../data/pulse-card-weekly.json' with { type: 'json' };
import { prepareCardWeeklyRefresh } from '../../scripts/sync-pulse-cards.mjs';
import { addCardDays, cardMetrics, cardProjects, compareCardWeeks, readCardWeeks, summarizeCardReceipts, uniqueCardReceipts } from './card-weekly.ts';

const [verified, archived] = readCardWeeks(snapshot);
const weekStart = verified.weekStart;
const abs = (day) => Date.parse(day) / 1000;

function legacyWeek() {
  const [latest, prior] = structuredClone(snapshot);
  for (const [key, value] of Object.entries(latest.projects['collector-crypt'].metrics)) {
    value.previous = prior.projects['collector-crypt'].metrics[key].current;
  }
  latest.comparisonReceipts = prior.receipts;
  return latest;
}

function periods(current, previous) {
  const start = addCardDays(weekStart, -7);
  const split = value => {
    const common = Math.floor(value / 7);
    return Array.from({ length: 7 }, (_, i) => i ? common : value - 6 * common);
  };
  return [...split(previous), ...split(current)].map((value, offset) => [abs(addCardDays(start, offset)), value]);
}

function fixtureCaptures() {
  const reviewed = verified.projects['collector-crypt'].metrics;
  const previous = archived.projects['collector-crypt'].metrics;
  return Object.fromEntries(['packOpenings', 'protocolRevenue', 'holdersRevenue'].map(key => [key, {
    url: reviewed[key].current.source.url,
    payload: { name: 'Collector Crypt', totalDataChart: periods(reviewed[key].current.value, previous[key].current.value) },
  }]));
}

test('reviewed issue pins all project, currency, timing and source distinctions', () => {
  assert.equal(weekStart, '2026-11-09');
  assert.equal(verified.weekEnd, '2026-11-16');
  assert.equal(archived.weekStart, '2026-11-02');
  assert.equal(archived.weekEnd, weekStart);
  assert.equal(readCardWeeks(snapshot.toReversed())[0], verified);
  assert.deepEqual([verified.receipts.length, archived.receipts.length], [3770, 4009]);
  assert.ok([verified, archived].every(week => week.comparisonReceipts === undefined));
  assert.ok(Object.values(archived.projects).every(project => project.milestones.length === 0));
  assert.equal(archived.collaborations.length, 0);
  const cc = compareCardWeeks(verified, archived).projects['collector-crypt'].metrics;
  assert.deepEqual([cc.packOpenings.current.value, cc.packOpenings.previous.value], [29024656, 27213438]);
  assert.deepEqual([cc.protocolRevenue.current.value, cc.protocolRevenue.previous.value], [1607507, 1246257]);
  assert.deepEqual([cc.holdersRevenue.current.value, cc.holdersRevenue.previous.value], [26565, 26796]);
  assert.deepEqual([cc.cardBuybacks.current.value, cc.cardBuybacks.previous.value], [24574942, 20973045]);
  assert.deepEqual(cc.cardBuybacks.current.confidence95, [19381723, 29965550]);
  assert.deepEqual(cc.cardBuybacks.previous.confidence95, [16370841, 25575248]);
  assert.equal(cc.cardBuybacks.previous.source.url, 'https://brich.house/platforms/weekly/2026-11-02');
  assert.ok([verified, archived].every(week => Object.values(week.projects['collector-crypt'].metrics).every(metric => metric.previous === null)));
  assert.equal(cc.secondarySales.current, null);
  assert.equal(cc.secondarySales.previous, null);
  assert.equal(cc.secondarySales.receiptSubtotal.asset, 'USDC');
  assert.equal(cc.tokenBuybacks.current, null);
  assert.equal(cc.tokenBuybacks.previous, null);
  assert.equal(cc.tokenBuybacks.receiptSubtotal.asset, 'USDC');
  for (const project of cardProjects) for (const metric of cardMetrics) assert.ok(verified.projects[project].metrics[metric]);
  assert.ok(Object.values(verified.projects.oripa.metrics).every(metric => metric.current === null && metric.missing === 'prelaunch'));
  assert.equal(verified.projects.oripa.milestones[1].date, '2026-11-25T12:00:00.000Z');
  const renaiss = verified.projects.renaiss.metrics;
  assert.equal(renaiss.packOpenings.receiptSubtotal.asset, 'USDT');
  assert.equal(renaiss.packOpenings.current, null);
  assert.equal(renaiss.packOpenings.previous, null);
  assert.equal(renaiss.secondarySales.current, null);
  assert.equal(renaiss.secondarySales.previous, null);
  assert.equal(renaiss.secondarySales.receiptSubtotal.asset, 'USDT');
  assert.equal(verified.projects.renaiss.milestones[0].end, '2026-11-14T13:30:00.000Z');
  assert.equal(verified.collaborations.length, 1);
  assert.deepEqual(verified.collaborations[0].projects, ['collector-crypt', 'renaiss']);
  assert.deepEqual(verified.receipts[0].paid, { amount: 2.460960, asset: 'USDC' });
  assert.deepEqual(verified.receipts[0].received, { amount: 14.715787, asset: 'CARDS' });
});

test('the reviewed capture import uses exact UTC day windows and preserves editorial and other sources', () => {
  const captures = fixtureCaptures();
  captures.packOpenings.payload.totalDataChart.push([abs(verified.weekEnd), 1_000_000_000]);
  captures.packOpenings.payload.totalDataChart.unshift([abs('2026-11-01'), 1_000_000_000]);
  assert.deepEqual(prepareCardWeeklyRefresh(snapshot, weekStart, captures).archive, snapshot);

  const before = JSON.stringify(snapshot);
  captures.packOpenings.payload.totalDataChart = periods(0, 8);
  const updated = prepareCardWeeklyRefresh(snapshot, weekStart, captures);
  assert.equal(updated.metrics.packOpenings.current.value, 0);
  assert.equal(updated.metrics.packOpenings.previous.value, 8);
  assert.equal(updated.archive[0].projects['collector-crypt'].metrics.packOpenings.previous, null);
  assert.equal(updated.archive[1].projects['collector-crypt'].metrics.packOpenings.current.value, 8);
  assert.deepEqual(updated.archive.map(week => week.receipts), snapshot.map(week => week.receipts));
  assert.deepEqual(updated.archive[0].projects.renaiss, verified.projects.renaiss);
  assert.deepEqual(updated.archive[0].projects.oripa, verified.projects.oripa);
  assert.deepEqual(updated.archive[0].methods, verified.methods);
  const legacy = prepareCardWeeklyRefresh([legacyWeek()], weekStart, captures).archive[0];
  assert.equal(legacy.projects['collector-crypt'].metrics.packOpenings.previous.value, 8);
  assert.deepEqual(legacy.comparisonReceipts, archived.receipts);
  assert.equal(JSON.stringify(snapshot), before);
});

test('current-only refresh validates all seven selected UTC days and preserves the other reports', () => {
  for (const [index, week] of [verified, archived].entries()) {
    const captures = fixtureCaptures();
    for (const { payload } of Object.values(captures)) {
      payload.totalDataChart = payload.totalDataChart.slice(index === 0 ? 7 : 0, index === 0 ? 14 : 7);
    }
    const projected = prepareCardWeeklyRefresh(snapshot, week.weekStart, captures, { currentOnly: true });
    assert.deepEqual(projected.archive, snapshot);
    assert.equal(projected.metrics.packOpenings.previous, null);
    captures.packOpenings.payload.totalDataChart[0][1] += 1;
    const modified = prepareCardWeeklyRefresh(snapshot, week.weekStart, captures, { currentOnly: true });
    assert.equal(modified.archive[index].projects['collector-crypt'].metrics.packOpenings.current.value,
      week.projects['collector-crypt'].metrics.packOpenings.current.value + 1);
    assert.deepEqual(modified.archive[1 - index], snapshot[1 - index]);
    assert.throws(() => prepareCardWeeklyRefresh(snapshot, week.weekStart, captures), /is missing 7 UTC days/);
    captures.holdersRevenue.payload.totalDataChart.pop();
    assert.throws(() => prepareCardWeeklyRefresh(snapshot, week.weekStart, captures, { currentOnly: true }), /is missing 1 UTC days/);
  }
  const legacy = legacyWeek();
  const refreshed = prepareCardWeeklyRefresh([legacy], weekStart, fixtureCaptures(), { currentOnly: true });
  assert.ok(legacy.projects['collector-crypt'].metrics.packOpenings.previous);
  assert.deepEqual(refreshed.archive, [legacy]);
});

test('rejects incomplete, mismatched or duplicate day captures before a publishable update', () => {
  const rejected = [
    captures => captures.packOpenings.payload.totalDataChart.pop(),
    captures => captures.protocolRevenue.payload.totalDataChart.push([abs('2026-11-12'), 1]),
    captures => { captures.holdersRevenue.url = captures.protocolRevenue.url; },
    captures => { captures.packOpenings.payload.totalDataChart[8][0] += 1800; },
    captures => { captures.protocolRevenue.payload.name = 'Renaiss'; },
    captures => { captures.holdersRevenue.payload.totalDataChart[8][1] = null; },
  ];
  const before = JSON.stringify(snapshot);
  for (const change of rejected) {
    const captures = fixtureCaptures();
    change(captures);
    assert.throws(() => prepareCardWeeklyRefresh(snapshot, weekStart, captures));
  }
  assert.throws(() => prepareCardWeeklyRefresh(snapshot, '2026-11-16', fixtureCaptures()), /existing reviewed/);
  assert.equal(JSON.stringify(snapshot), before);
});

test('rejects missing translations, unsupported zeros and duplicate archive or machine identities', () => {
  const rejected = [
    archive => { archive[0].weekStart = '2026-11-10'; },
    archive => { archive[0].weekEnd = '2026-11-15'; },
    archive => { archive[0].receipts[0].settledAt = '2026-11-16T00:00:00.000Z'; },
    archive => { delete archive[0].projects.renaiss.milestones[0].text.ja; },
    archive => { archive[0].projects.oripa.metrics.packOpenings.current = { value: 0, source: verified.methods[0].source }; },
    archive => { archive[0].projects['collector-crypt'].metrics.cardBuybacks.current.confidence95[1] = 24574941; },
    archive => archive[0].collaborations.push(archive[0].collaborations[0]),
    archive => archive.push(archive[0]),
  ];
  for (const change of rejected) {
    const archive = structuredClone(snapshot);
    change(archive);
    assert.throws(() => readCardWeeks(archive));
  }
});

test('matches shared receipts across project sources by normalized transaction and event index', () => {
  const model = { ...verified.receipts[0], chain: 'bsc', transaction: `0x${'ab'.repeat(32)}`, eventIndex: 7 };
  const duplicate = { ...model, project: 'renaiss', transaction: `0x${'AB'.repeat(32)}` };
  assert.deepEqual(uniqueCardReceipts([model, duplicate]), [model]);
  assert.equal(uniqueCardReceipts([model, { ...duplicate, eventIndex: 8 }]).length, 2);
  assert.throws(() => uniqueCardReceipts([model, { ...duplicate, paid: { ...duplicate.paid, amount: 2 } }]), /Conflicting/);
  assert.throws(() => uniqueCardReceipts([model, { ...duplicate, eventIndex: null }]), /Overlapping/);
});

test('a reviewed common checkout can tie distinct records to a single settlement', () => {
  const source = verified.receipts[0];
  const checkout = { service: 'fixture-provider', id: 'same-checkout' };
  const wrapped = { ...source, chain: 'bsc', transaction: `0x${'ab'.repeat(32)}`, eventIndex: 1, project: 'renaiss', checkout };
  assert.deepEqual(uniqueCardReceipts([{ ...source, checkout }, wrapped]).map(entry => entry.project), ['collector-crypt']);
  assert.throws(() => uniqueCardReceipts([{ ...source, checkout }, { ...wrapped, kind: 'packOpenings' }]), /Conflicting/);
  assert.equal(uniqueCardReceipts([source, { ...wrapped, checkout: { ...checkout, id: 'other-checkout' } }]).length, 2);
});

test('attributes the Renaiss lower bound independently of shared receipt order', () => {
  const archive = structuredClone(snapshot);
  const { receipts, projects } = archive[0];
  const first = receipts.find(entry => entry.project === 'renaiss' && entry.kind === 'secondarySales');
  const basis = projects.renaiss.metrics.secondarySales.receiptSubtotal;
  const expected = { value: 8900.5472, count: 18 };
  assert.deepEqual(summarizeCardReceipts(archive[0]).subtotals.renaiss.secondarySales, expected);
  const duplicate = { ...first, project: 'collector-crypt', transaction: '0x' + first.transaction.slice(2).toUpperCase() };
  receipts.push({ ...first, eventIndex: first.eventIndex + 1, paid: { amount: 1, asset: 'USDC' } });
  for (const [entries, representative] of [[[...receipts, duplicate], first], [[duplicate, ...receipts], duplicate]]) {
    const [week] = readCardWeeks([{ ...archive[0], receipts: entries }]);
    const { settlements, subtotals } = summarizeCardReceipts(week);
    assert.deepEqual(settlements.filter(entry => entry.transaction.toLowerCase() === first.transaction &&
      entry.eventIndex === first.eventIndex), [representative]);
    assert.equal(settlements.length, receipts.length);
    assert.deepEqual(subtotals.renaiss.secondarySales, expected);
  }

  const checkout = { service: 'fixture-provider', id: 'shared-trade' };
  const alias = { ...duplicate, transaction: `0x${'cd'.repeat(32)}` };
  const bridged = receipts.map(entry => entry === first ? { ...first, checkout } : entry);
  bridged.push(alias, { ...alias, checkout });
  const [week] = readCardWeeks([{ ...archive[0], receipts: bridged }]);
  const { settlements, subtotals } = summarizeCardReceipts(week);
  assert.ok(settlements.some(entry => entry.transaction === alias.transaction));
  assert.equal(settlements.length, receipts.length);
  assert.deepEqual(subtotals.renaiss.secondarySales, expected);

  basis.asset = 'SOL';
  assert.throws(() => readCardWeeks(archive), /Invalid card project or receipt subtotal/);
  basis.asset = 'USDT';
  projects.renaiss.metrics.secondarySales.current = { value: 8900.5472, source: basis.source };
  assert.throws(() => readCardWeeks(archive), /Invalid card project or receipt subtotal/);
});

test('rejects shared settlements with multiple eligible native subtotal owners', () => {
  const [week] = structuredClone(snapshot);
  const shared = week.receipts.find(entry => entry.project === 'renaiss' && entry.kind === 'secondarySales');
  const duplicate = { ...shared, project: 'collector-crypt' };
  week.projects['collector-crypt'].metrics.secondarySales = structuredClone(week.projects.renaiss.metrics.secondarySales);
  for (const receipts of [[...week.receipts, duplicate], [duplicate, ...week.receipts]]) {
    assert.throws(() => readCardWeeks([{ ...week, receipts }]), /Ambiguous card receipt subtotal attribution/);
  }
});

test('keeps verified comparison receipts and native subtotals separate, with or without optional evidence', () => {
  const week = legacyWeek();
  const current = {
    'collector-crypt': { secondarySales: { value: 546.31, count: 2 }, tokenBuybacks: { value: 26663.743218, count: 3745 } },
    renaiss: { packOpenings: { value: 140, count: 5 }, secondarySales: { value: 8900.5472, count: 18 } },
  };
  const comparison = {
    'collector-crypt': { secondarySales: { value: 70.4, count: 2 }, tokenBuybacks: { value: 26859.314711, count: 3997 } },
    renaiss: { packOpenings: { value: 140, count: 1 }, secondarySales: { value: 3618.38, count: 9 } },
  };
  const original = summarizeCardReceipts(week);
  assert.deepEqual(original.subtotals, current);
  assert.deepEqual(original.comparisonSubtotals, comparison);
  assert.deepEqual(original.settlements, week.receipts);
  assert.deepEqual(original.comparisonSettlements, week.comparisonReceipts);

  const shared = week.comparisonReceipts.find(entry => entry.project === 'renaiss' && entry.kind === 'secondarySales');
  const duplicate = { ...shared, project: 'collector-crypt', transaction: '0x' + shared.transaction.slice(2).toUpperCase() };
  for (const comparisonReceipts of [[duplicate, ...week.comparisonReceipts], [...week.comparisonReceipts, duplicate]]) {
    const [accepted] = readCardWeeks([{ ...week, comparisonReceipts }]);
    const observed = summarizeCardReceipts(accepted);
    assert.deepEqual(observed.subtotals, current);
    assert.deepEqual(observed.comparisonSubtotals, comparison);
    assert.equal(observed.comparisonSettlements.length, week.comparisonReceipts.length);
  }

  delete week.comparisonReceipts;
  const [legacy] = readCardWeeks([week]);
  assert.deepEqual(summarizeCardReceipts(legacy), {
    settlements: week.receipts, subtotals: current, comparisonSettlements: [], comparisonSubtotals: {},
  });
});

test('uses adjacent UTC windows and rejects canonical receipts duplicated across them', () => {
  const week = legacyWeek();
  const prior = week.comparisonReceipts.find(entry => entry.project === 'renaiss' && entry.kind === 'secondarySales');
  prior.settledAt = '2026-11-02T00:00:00.000Z';
  assert.doesNotThrow(() => readCardWeeks([week]));
  for (const settledAt of ['2026-11-01T23:59:59.999Z', '2026-11-09T00:00:00.000Z']) {
    const comparisonReceipts = [{ ...prior, settledAt }];
    assert.throws(() => readCardWeeks([{ ...week, comparisonReceipts }]), /out-of-week receipt/);
  }
  assert.throws(() => readCardWeeks([{ ...week, comparisonReceipts: null }]), /out-of-week receipt/);
  const current = week.receipts.find(entry => entry.project === 'renaiss' && entry.kind === 'secondarySales');
  const duplicatedAcrossWeeks = { ...current, project: 'collector-crypt', settledAt: prior.settledAt,
    transaction: '0x' + current.transaction.slice(2).toUpperCase() };
  assert.throws(() => readCardWeeks([{ ...week, comparisonReceipts: [duplicatedAcrossWeeks] }]), /Conflicting card receipt/);
  current.checkout = prior.checkout = { service: 'fixture-provider', id: 'one-settlement' };
  assert.throws(() => readCardWeeks([week]), /Conflicting card receipt/);
});

test('derives an adjacent archived report without repeating receipts or comparing changed data sources', () => {
  const expected = {
    'collector-crypt': { secondarySales: { value: 70.4, count: 2 }, tokenBuybacks: { value: 26859.314711, count: 3997 } },
    renaiss: { packOpenings: { value: 140, count: 1 }, secondarySales: { value: 3618.38, count: 9 } },
  };
  const comparison = compareCardWeeks(verified, archived);
  assert.equal(comparison.previous, archived);
  assert.deepEqual(comparison.settlements, verified.receipts);
  assert.deepEqual(comparison.comparisonSettlements, []);
  assert.deepEqual(comparison.comparisonSubtotals, expected);
  assert.deepEqual(compareCardWeeks(archived).subtotals, expected);
  assert.deepEqual(compareCardWeeks(archived).comparisonSubtotals, {});
  assert.equal(compareCardWeeks(verified, { ...archived, weekEnd: '2026-11-02' }).previous, undefined);
  const changed = structuredClone(archived);
  const metrics = changed.projects['collector-crypt'].metrics;
  metrics.protocolRevenue.current.source.url = 'https://api.llama.fi/summary/fees/collector-crypt?dataType=dailyFees';
  metrics.cardBuybacks.current.source.url = 'https://brich.house/other-report/2026-11-02';
  metrics.secondarySales.receiptSubtotal.source.url = 'https://docs.collectorcrypt.com/other-program';
  const blocked = compareCardWeeks(verified, changed);
  assert.equal(blocked.projects['collector-crypt'].metrics.protocolRevenue.previous, null);
  assert.equal(blocked.projects['collector-crypt'].metrics.cardBuybacks.previous, null);
  assert.equal(blocked.comparisonSubtotals['collector-crypt'].secondarySales, undefined);
  assert.deepEqual(blocked.comparisonSubtotals.renaiss, expected.renaiss);
});

test('rejects duplicated authored comparison data and settlement identities in adjacent issues', () => {
  const ownPrevious = structuredClone(verified);
  ownPrevious.projects['collector-crypt'].metrics.packOpenings.previous = archived.projects['collector-crypt'].metrics.packOpenings.current;
  assert.throws(() => readCardWeeks([ownPrevious, archived]), /Duplicate authored card comparison/);
  assert.throws(() => readCardWeeks([{ ...verified, comparisonReceipts: archived.receipts }, archived]), /Duplicate authored card comparison/);
  const [current, prior] = structuredClone(snapshot);
  const entry = current.receipts.find(row => row.project === 'renaiss' && row.kind === 'secondarySales');
  const older = { ...entry, settledAt: '2026-11-08T21:00:00.000Z' };
  prior.receipts.push(older);
  assert.throws(() => readCardWeeks([current, prior]), /Conflicting card receipt/);
  prior.receipts.pop();
  entry.checkout = prior.receipts[0].checkout = { service: 'fixture-provider', id: 'one-settlement' };
  assert.throws(() => readCardWeeks([current, prior]), /Conflicting card receipt/);
});

test('renders the independently verified missing state for each report period', async () => {
  const fixture = structuredClone(snapshot);
  const oripa = fixture[0].projects.oripa;
  oripa.state = 'active';
  for (const metric of Object.values(oripa.metrics)) metric.missing = 'unreported';
  const component = new URL('../app/(legacy)/pulse/card-weekly.tsx', import.meta.url);
  const imports = {
    '@/data/pulse-card-weekly.json': 'data:text/javascript,' + encodeURIComponent('export default ' + JSON.stringify(fixture)),
    '@/lib/card-weekly': new URL('./card-weekly.ts', import.meta.url).href,
    '@/lib/i18n': new URL('./i18n.ts', import.meta.url).href,
  };
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      return next(context.parentURL === component.href ? (imports[specifier] ?? specifier) : specifier, context);
    },
    load(url, context, next) {
      if (url !== component.href) return next(url, context);
      return { format: 'module', shortCircuit: true, source: ts.transpile(readFileSync(component, 'utf8'), {
        jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022,
      }, 'card-weekly.tsx') };
    },
  });
  try {
    const { default: CardWeekly } = await import(component.href);
    for (const [locale, unavailable, prelaunch] of [
      ['en', 'Unavailable', 'Prelaunch'], ['zh-CN', '暂无核实数据', '上线前'], ['ja', '確認済みデータなし', '公開前'],
    ]) {
      const markup = renderToStaticMarkup(createElement(CardWeekly, { locale }));
      const evidence = markup.split('data-card-receipt-period="current"')[1].split('</section>')[0];
      const receiptLinks = [...evidence.matchAll(/href="(https:\/\/(?:explorer\.solana\.com|bscscan\.com)\/tx\/[^"]+)"/g)].map(([, url]) => url);
      assert.deepEqual(receiptLinks, verified.receipts.slice(0, 34).map(row => row.source.url), locale);
      const download = {
        en: 'Download all verified receipts for this UTC week (JSON)',
        'zh-CN': '下载该 UTC 周的全部已核实凭证（JSON）',
        ja: 'この UTC 週の確認済み取引をすべてダウンロード（JSON）',
      }[locale];
      const cap = {
        en: 'Showing 9 of 3,745 verified Collector Crypt token buybacks.',
        'zh-CN': '已核实的 3,745 笔 Collector Crypt 代币回购中，此处列出 9 笔。',
        ja: 'Collector Crypt の確認済みトークン買い戻し 3,745 件のうち、9 件を表示しています。',
      }[locale];
      assert.ok(evidence.includes('href="/data/pulse-card-receipts/2026-11-09.json"') && evidence.includes(download));
      assert.ok(evidence.includes(cap));
      assert.ok(Buffer.byteLength(markup, 'utf8') < 85_000, `${locale} embeds the large receipt archive`);
      const tokenRow = markup.split('data-card-metric="tokenBuybacks"')[1].split('</tr>', 1)[0];
      assert.ok(tokenRow.includes('data-amount="26663.743218"') && tokenRow.includes('data-amount="26859.314711"'));
      assert.ok(tokenRow.includes('≥ 26,859.314711 USDC'));
      assert.doesNotMatch(tokenRow, /\d%/u);
      const currentMethod = markup.split('data-card-week="2026-11-09"')[1].split('</article>')[0];
      const priorMethod = markup.split('data-card-week="2026-11-02"')[1].split('</article>')[0];
      const priorEvidence = priorMethod.split('data-card-receipt-period="current"')[1].split('</section>')[0];
      const priorLinks = [...priorEvidence.matchAll(/href="(https:\/\/(?:explorer\.solana\.com|bscscan\.com)\/tx\/[^"]+)"/g)].map(([, url]) => url);
      assert.deepEqual(priorLinks, archived.receipts.slice(0, 21).map(row => row.source.url), locale);
      assert.ok(priorEvidence.includes('href="/data/pulse-card-receipts/2026-11-02.json"') && priorEvidence.includes(download));
      assert.ok(priorEvidence.includes(cap.replace('3,745', '3,997')));
      const citedPool = 'https://explorer.solana.com/address/HnhpJPJgBG2KwniMTNW8cVBHvk1hFog3RC3kjnyc23tD';
      for (const detail of ['20:08 UTC', '3,790', '3,750', '3,745', 'SPL Token', 'swap_v2', citedPool]) assert.ok(currentMethod.includes(detail), locale);
      for (const detail of ['22:35 UTC', '4,051', '4,001', '3,997', 'swap_v2']) assert.ok(priorMethod.includes(detail), locale);
      for (const detail of ['3,790', '3,745', citedPool]) assert.ok(!priorMethod.includes(detail), locale);
      for (const [index, week] of fixture.entries()) {
        const project = markup.split(`data-card-week="${week.weekStart}"`)[1]
          .split('data-card-project="oripa"')[1].split('</section>')[0];
        const cells = [...project.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(([, cell]) => cell.replace(/<[^>]*>/g, ''));
        const expected = index === 0 ? [unavailable, prelaunch] : [prelaunch, unavailable];
        assert.deepEqual(cells, cardMetrics.flatMap(() => expected), `${locale}/${week.weekStart}`);
      }
    }
  } finally {
    hooks.deregister();
  }
});

test('serves complete canonical weekly receipt files from the same archive as the bounded Pulse display', async () => {
  const route = new URL('../app/(legacy)/data/pulse-card-receipts/[week]/route.ts', import.meta.url);
  const legacyRoute = new URL('?legacy', route);
  const legacy = legacyWeek();
  legacy.receipts = legacy.receipts.slice(0, 34);
  const archiveModule = (fixture) => 'data:text/javascript,' + encodeURIComponent('export default ' + JSON.stringify(fixture));
  const imports = {
    '@/data/pulse-card-weekly.json': archiveModule(snapshot),
    '@/lib/card-weekly': new URL('./card-weekly.ts', import.meta.url).href,
  };
  const hook = registerHooks({
    resolve(specifier, context, next) {
      const parent = context.parentURL && new URL(context.parentURL);
      if (parent?.protocol !== 'file:' || fileURLToPath(parent) !== fileURLToPath(route)) return next(specifier, context);
      if (parent.search === legacyRoute.search && specifier === '@/data/pulse-card-weekly.json') return next(archiveModule([legacy]), context);
      return next(imports[specifier] ?? specifier, context);
    },
  });
  try {
    const { GET, generateStaticParams } = await import(route.href);
    const call = (week) => GET(new Request(`https://example.test/data/pulse-card-receipts/${week}`), { params: Promise.resolve({ week }) });
    assert.deepEqual(generateStaticParams(), [verified, archived].map(week => ({ week: `${week.weekStart}.json` })));
    for (const week of [verified, archived]) {
      const response = await call(`${week.weekStart}.json`);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /^application\/json\b/u);
      assert.deepEqual(await response.json(), {
        weekStart: week.weekStart, weekEnd: week.weekEnd, receipts: summarizeCardReceipts(week).settlements,
      });
    }
    for (const day of ['2026-11-09', '2026-10-26.json', '2026-99-99.json']) assert.equal((await call(day)).status, 404);
    const legacySurface = await import(legacyRoute.href);
    assert.deepEqual(legacySurface.generateStaticParams(), generateStaticParams());
    const comparison = await legacySurface.GET(new Request('https://example.test/'), { params: Promise.resolve({ week: '2026-11-02.json' }) });
    assert.deepEqual(await comparison.json(), {
      weekStart: archived.weekStart, weekEnd: archived.weekEnd, receipts: legacy.comparisonReceipts,
    });
  } finally {
    hook.deregister();
  }
});

test('preserves exact case-sensitive Collector Crypt buyback evidence and CARDS received per week', () => {
  const { settlements } = summarizeCardReceipts(verified);
  for (const [entries, count, paid, received] of [
    [settlements, 3745, 26663743218, 131878135136],
    [summarizeCardReceipts(archived).settlements, 3997, 26859314711, 112363576802],
  ]) {
    const buybacks = entries.filter(entry => entry.project === 'collector-crypt' && entry.kind === 'tokenBuybacks');
    assert.equal(buybacks.length, count);
    assert.equal(new Set(buybacks.map(entry => entry.transaction)).size, count);
    for (const entry of buybacks) {
      assert.equal(entry.chain, 'solana');
      assert.equal(entry.eventIndex, null);
      assert.equal(entry.source.url, 'https://explorer.solana.com/tx/' + entry.transaction);
      assert.equal(entry.paid.asset, 'USDC');
      assert.equal(entry.received.asset, 'CARDS');
      for (const amount of [entry.paid.amount, entry.received.amount]) {
        assert.ok(amount > 0 && Math.round(amount * 1e6) / 1e6 === amount);
      }
    }
    assert.equal(buybacks.reduce((sum, entry) => sum + Math.round(entry.paid.amount * 1e6), 0), paid);
    assert.equal(buybacks.reduce((sum, entry) => sum + Math.round(entry.received.amount * 1e6), 0), received);
  }
  const entry = settlements.find(row => row.transaction.startsWith('Efxsaa1y'));
  const differentlyCased = { ...entry, transaction: 'e' + entry.transaction.slice(1) };
  assert.deepEqual(uniqueCardReceipts([entry, differentlyCased, entry]), [entry, differentlyCased]);
});

test('preserves Collector Crypt marketplace settlement proof in both UTC windows', () => {
  for (const [week, amounts] of [[verified, [11.31, 535]], [archived, [53, 17.4]]]) {
    const { settlements: entries } = summarizeCardReceipts(week);
    const trades = entries.filter(entry => entry.project === 'collector-crypt' && entry.kind === 'secondarySales');
    assert.deepEqual(trades.map(entry => entry.paid.amount), amounts);
    for (const trade of trades) {
      assert.equal(trade.chain, 'solana');
      assert.equal(trade.eventIndex, 1);
      assert.equal(trade.paid.asset, 'USDC');
      assert.deepEqual(trade.received, { amount: 1, asset: 'COLLECTOR' });
      assert.equal(trade.source.url, 'https://explorer.solana.com/tx/' + trade.transaction);
    }
  }
});

test('counts verified Fair gacha payments for each week and keeps reveal proof separate', () => {
  const { settlements, comparisonSubtotals, subtotals } = compareCardWeeks(verified, archived);
  const checkouts = settlements.filter(entry => entry.project === 'renaiss' && entry.kind === 'packOpenings');
  const [opening] = checkouts;
  const transaction = '0x682e1b36a7cb4cd9ae3f3a2480b69aae81ce756c0765f9f22bde1c86d83c03d7';
  const basis = verified.projects.renaiss.metrics.packOpenings.receiptSubtotal.source;
  assert.equal(basis.url, 'https://fair.renaiss.xyz/whitepaper');
  const reveal = verified.methods.find(method => method.source.url === 'https://fair.renaiss.xyz/verify-a-rip?tx=' + transaction);
  assert.ok(reveal && Object.values(reveal.text).every(text => text.includes('186104')));
  assert.equal(opening.transaction, transaction);
  assert.equal(opening.chain, 'bsc');
  assert.equal(opening.eventIndex, 54);
  assert.equal(opening.settledAt, '2026-11-15T23:48:29.000Z');
  assert.deepEqual(checkouts.map(receipt => receipt.eventIndex), [54, 134, 127, 96, 197]);
  for (const receipt of checkouts) {
    assert.deepEqual(receipt.paid, { amount: 28, asset: 'USDT' });
    assert.equal(receipt.received, null);
    assert.equal(receipt.source.url, 'https://bscscan.com/tx/' + receipt.transaction);
  }
  assert.deepEqual(subtotals.renaiss.packOpenings, { value: 140, count: 5 });
  assert.deepEqual(comparisonSubtotals.renaiss.packOpenings, { value: 140, count: 1 });
  const prior = summarizeCardReceipts(archived).settlements.filter(entry => entry.project === 'renaiss' && entry.kind === 'packOpenings');
  const priorTransaction = '0x91a42c9ef4d80ebb70cbb8068bfccc53da3e1b29a88763a7d6f4ff7731076317';
  assert.deepEqual(prior, [{
    project: 'renaiss', kind: 'packOpenings', chain: 'bsc', transaction: priorTransaction, eventIndex: 106,
    settledAt: '2026-11-08T23:40:08.000Z', paid: { amount: 140, asset: 'USDT' }, received: null,
    source: { title: 'PANDORA 28 · BscScan', url: 'https://bscscan.com/tx/' + priorTransaction },
  }]);
  const batch = archived.methods.find(method => method.source.url === basis.url);
  assert.ok(batch && Object.values(batch.text).every(text => text.includes('166625–166629')));
  assert.ok(archived.methods.every(method => method.source.url !== reveal.source.url));
});
