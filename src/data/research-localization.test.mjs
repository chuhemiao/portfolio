import assert from 'node:assert/strict';
import test from 'node:test';
import { PROJECTS } from './research-projects.ts';
import { getResearchCategoryLabel, getResearchDescription } from './research-localization.ts';

const project = (slug) => PROJECTS.find(project => project.slug === slug);

test('every published Research card has real summaries in all three languages', () => {
  for (const item of PROJECTS) {
    for (const locale of ['en', 'zh-CN', 'ja']) {
      const result = getResearchDescription(item, locale);
      assert.equal(result.available, true, `${item.slug} ${locale}`);
      assert.ok(result.text.trim().length > 0);
      if (locale !== 'en') assert.match(result.text, /[\u3040-\u30ff\u3400-\u9fff]/u, `${item.slug} ${locale}`);
    }
  }
});

test('distinct project facts, numbers and protocol identifiers survive localization', () => {
  assert.match(getResearchDescription(project('binance_2025_report'), 'zh-CN').text, /3 亿.*1680 亿美元/u);
  assert.match(getResearchDescription(project('binance_2025_report'), 'ja').text, /3 億.*1,680 億ドル/u);
  for (const locale of ['zh-CN', 'ja']) {
    assert.match(getResearchDescription(project('stonkbrokers-stonkbroker-robinhood-chain-nftfi-diligence'), locale).text, /ERC-6551.*Anvil.*STONKBROKER/u);
    assert.match(getResearchDescription(project('aligned-align-zk-proof-verification-infrastructure-token-value-capture-risk'), locale).text, /EigenLayer AVS/u);
    assert.match(getResearchDescription(project('raydium-ray-solana-dex-clmm-launchpad-value-capture-gap'), locale).text, /CLMM.*RAY/u);
  }
});

test('English UI translates the three Chinese source summaries too', () => {
  for (const slug of ['paypay-report', 'podcasts', 'coinbase-q-day-ryan-babbush-bitcoin']) {
    const text = getResearchDescription(project(slug), 'en').text;
    assert.doesNotMatch(text, /[\u3400-\u9fff]/u);
    assert.notEqual(text, project(slug).description);
  }
});

test('template summaries preserve source classifications and truncation without invented source claims', () => {
  const token = PROJECTS.find(project => project.description.startsWith('Beefy Finance is treated as'));
  assert.match(getResearchDescription(token, 'zh-CN').text, /Beefy Finance.*收益聚合器.*候选项目.*……/u);
  assert.match(getResearchDescription(token, 'ja').text, /Beefy Finance.*利回りアグリゲーター.*候補.*……/u);
  const truncated = PROJECTS.find(project => project.description === 'Tradable NA Post-Settlement Legal Financing Receivables is treated as a DeFi ...');
  const text = getResearchDescription(truncated, 'zh-CN').text;
  assert.match(text, /DeFi 基础设施……$/u);
  assert.doesNotMatch(text, /候选|CoinGecko|CMC|数据来源/u);
});

test('source modifications and new cards fail safely to their current original description', () => {
  const changed = { ...project('binance_2025_report'), description: 'A changed source with new 2027 facts' };
  assert.deepEqual(getResearchDescription(changed, 'ja'), { text: changed.description, available: false });
  assert.deepEqual(getResearchDescription({ slug: 'new-project', description: 'New original' }, 'zh-CN'), { text: 'New original', available: false });
});

test('invalid locales and prototype names cannot select unrelated translations', () => {
  assert.deepEqual(getResearchDescription(project('binance_2025_report'), 'fr'), { text: project('binance_2025_report').description, available: false });
  assert.deepEqual(getResearchDescription({ slug: '__proto__', description: 'Original' }, 'ja'), { text: 'Original', available: false });
  assert.equal(getResearchCategoryLabel('__proto__', 'ja'), '__proto__');
});

test('all actual categories are localized, while established technical acronyms stay intact', () => {
  const acronyms = new Set(['DeFi', 'L1', 'L2', 'Move/L1', 'Bitcoin L2', 'Meme', 'NFT/AI', 'Meme/AI', 'Meme/Utility']);
  for (const category of new Set(PROJECTS.map(project => project.type))) {
    for (const locale of ['zh-CN', 'ja']) {
      const label = getResearchCategoryLabel(category, locale);
      assert.ok(label.length > 0);
      if (!acronyms.has(category)) assert.notEqual(label, category, `${category} ${locale}`);
    }
  }
  assert.equal(getResearchCategoryLabel('Unknown new category', 'ja'), 'Unknown new category');
});
