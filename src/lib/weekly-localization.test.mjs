import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { WEEKLY_REPORTS } from '../data/weekly-research.ts';
import { registerHooks } from 'node:module';

registerHooks({ resolve(specifier, context, next) { return next(specifier === './i18n' ? './i18n.ts' : specifier, context); } });
const { getLocalizedWeeklyReport } = await import('./weekly-localization.ts');

const resources = JSON.parse(fs.readFileSync(new URL('../data/weekly-research-localizations.json', import.meta.url)));
const locales = ['zh-CN', 'en', 'ja'];
function stringPaths(value, path = '') {
  if (typeof value === 'string') return [path];
  return Object.entries(value).flatMap(([key, child]) => stringPaths(child, `${path}/${key}`));
}

test('both reports have complete source-bound translations for every nested field', () => {
  assert.equal(WEEKLY_REPORTS.length, 2);
  for (const source of WEEKLY_REPORTS) {
    assert.deepEqual(resources[source.id].source, source);
    for (const locale of locales) {
      const selected = getLocalizedWeeklyReport(source, locale);
      assert.equal(selected.fallbackOriginal, false);
      assert.equal(selected.language, locale);
      assert.deepEqual(stringPaths(selected.report), stringPaths(source));
      assert.equal(selected.report.id, source.id);
      assert.equal(selected.report.generatedAt, source.generatedAt);
      assert.equal(selected.report.mustRead.length, source.mustRead.length);
      for (const value of [selected.report.headline, selected.report.coreMacro, selected.report.coreCrypto]) assert.ok(value.trim());
      if (locale !== 'zh-CN') assert.notEqual(selected.report.coreCrypto, source.coreCrypto);
    }
  }
});

test('future reports and changed source fields reject outdated translations', () => {
  const future = { ...WEEKLY_REPORTS[0], id: '2026-10-13', headline: '新增报告' };
  assert.deepEqual(getLocalizedWeeklyReport(future, 'ja').report, future);
  assert.equal(getLocalizedWeeklyReport(future, 'ja').fallbackOriginal, true);
  for (const source of WEEKLY_REPORTS) {
    const changed = { ...source, coreMacro: `${source.coreMacro} 修订` };
    const selected = getLocalizedWeeklyReport(changed, 'en');
    assert.deepEqual(selected.report, changed);
    assert.equal(selected.fallbackOriginal, true);
    assert.equal(selected.language, 'zh-CN');
  }
});

test('partial nested translations and altered historical identities are rejected', () => {
  for (const damage of [
    (entry) => { entry.translations.ja.mustRead.pop(); },
    (entry) => { entry.translations.ja.coreActions[0] = ''; },
    (entry) => { entry.translations.ja.generatedAt = '10/13'; },
    (entry) => { delete entry.translations.ja.disclaimer; },
  ]) {
    const broken = structuredClone(resources);
    damage(broken[WEEKLY_REPORTS[0].id]);
    assert.equal(getLocalizedWeeklyReport(WEEKLY_REPORTS[0], 'ja', broken).fallbackOriginal, true);
  }
});

test('translations preserve historical prices, identifiers and the original conflicting amounts', () => {
  for (const locale of locales) {
    const may = getLocalizedWeeklyReport(WEEKLY_REPORTS[0], locale).report;
    assert.ok(may.cryptoAssets[0].includes('$78,383'));
    assert.ok(may.cryptoAssets[1].includes('$2,378'));
    assert.ok(may.cryptoAssets[2].includes('$1.41'));
    const april = getLocalizedWeeklyReport(WEEKLY_REPORTS[1], locale).report;
    assert.ok(april.coreCrypto.includes('$75,527'));
    assert.ok(april.coreCrypto.includes('815,061'));
    assert.ok(april.cryptoAssets[0].includes('$25.4B'));
    assert.ok(april.cryptoAssets[3].includes('USDC') && april.cryptoAssets[3].includes('CRCL'));
    assert.ok(locale === 'en' ? april.coreCrypto.includes('$2.54B') : /25\.4\s*[亿億]/.test(april.coreCrypto));
  }
});

test('selecting or editing a returned report never changes the original or resource', () => {
  const sourceBefore = JSON.stringify(WEEKLY_REPORTS);
  const en = getLocalizedWeeklyReport(WEEKLY_REPORTS[1], 'en');
  en.report.coreActions[0] = 'Changed result';
  en.report.mustRead[0].summary = 'Changed result';
  assert.equal(JSON.stringify(WEEKLY_REPORTS), sourceBefore);
  assert.notEqual(getLocalizedWeeklyReport(WEEKLY_REPORTS[1], 'en').report.coreActions[0], 'Changed result');
  assert.equal(getLocalizedWeeklyReport(WEEKLY_REPORTS[1], 'ja').language, 'ja');
});
