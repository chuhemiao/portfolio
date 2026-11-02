import fs from 'node:fs/promises';
import path from 'node:path';
import { readCatalog, hashJson, entityKey } from '../../../scripts/library/contract.mjs';
import { applyReview, inspectReview } from '../../../scripts/library/review.mjs';
import { loadReferenceContext } from '../../../scripts/library/validate.mjs';

const rows = [
  ['eip-7702-signing-flow-from-hash-to-code', 'lib_7f58f540cbcb986317e8999fb359a5bf', 'thoughts', 18, '逐字段授权签名、nonce及外层失败不回滚委托，延伸到固定规范授权处理和代码委托；不混作EIP-712。'],
  ['eip-7702-delegation-one-signature-drains-everything', 'lib_7f58f540cbcb986317e8999fb359a5bf', 'thoughts', 72, 'Nonce降序与持久委托问题延伸回规范逐tuple处理；不是支持攻击归因的证据。'],
  ['tokenized-equity-four-wrappers-and-what-to-watch', 'lib_80bcedb66e7f44af7d500de87e660b4b', 'research', 33, '许可制/KYC登记股份可对照身份及转移资格接口；不把接口当发行人法律合规证明。'],
  ['tokenized-equities-rwa-2026-market-structure-onchain-index-funds', 'lib_808f9296886e584bc36bf3cdc76b3167', 'thoughts', 27, 'ERC-20发行不能解决资产身份、托管及申赎；延伸核对转移授权API与证券权利的层次。'],
  ['reality-bitget-tokenized-equities-rtoken-distribution-custody-risks', 'lib_80bcedb66e7f44af7d500de87e660b4b', 'research', 40, '经济受益权、登记股东与地区准入对照受监管token接口；不声称rToken实际采用ERC-3643。'],
  ['physical-tcg-collector-crypt-courtyard-revenue-token-value-capture', 'lib_8502bf1f6c5f32584d4fadf5bac5151a', 'thoughts', 72, 'NFT持有、转移与实物提取的延伸比较；链上所有权不等于链下托管赎回保障。'],
  ['agent-to-earn-agent-economy-startup-investment-memo', 'lib_689553a2708d6f3c72bafaa5c1a6b332', 'thoughts', 151, '身份、声誉与验证注册表，固定规范版本仍Draft；不创建不存在的日译。'],
  ['uniswap-liquidity-infrastructure-evolution-or-uni-governance-legacy', 'lib_d17689cc681300963c67396775ff8674', 'thoughts', 11, '文章并列v2/v3/v4路由，以官方v3白皮书入口继续比较；仅核metadata，不声称通读机制或验证投资判断。'],
  ['circle-arc-usdc-long-term-settlement-moat', 'lib_7136fed40d309920682c62a757ffd5a9', 'thoughts', 109, '储备规模、利率和分成引出的储备标准、流动性与披露问题；仅核书目，不称论文支持本文判断。'],
  ['popdex-btcusdt-perpetual-clob-megapop-risk-research', 'lib_a9aca77658a75323e97aee44aab3b0c9', 'research', 70, '订单、撤单、撮合及结算与真实成交质量延伸比较二级市场交易所角色；只核课程目录，未观看视频，不验证PopDEX性能。'],
];

const directory = path.resolve('data/library');
const output = path.resolve('public/data/library/v1');
const before = await readCatalog(directory);
const report = { schema_version: 'library-m3-relation-review/v1', actor: 'codex-library-m3-ui', role: 'editor', source_mode: 'local bounded paragraph reads and parent source-backed analysis; no new external reads', first_attempt: { status: 'failed before mutation', cause: 'All 7428 posts overflowed reference_context bytes', correction: 'validate.mjs projects only currently referenced real article/project targets; behavioral RED then GREEN' }, started_at: new Date().toISOString(), source_evidence: [], operations: [] };
try {
  for (const [i, [slug, item, category, line, reason]] of rows.entries()) {
    const filename = `content/blog/2026/${category}/${slug}.mdx`;
    const text = await fs.readFile(filename, 'utf8');
    report.source_evidence.push({ slug, item_id: item, path: filename, line, source_hash: hashJson(text), reading_scope: 'bounded supplied paragraph, not a new full-document review', reason });
    const replacement = { schema_version: '1.1.0', revision: 1, item_id: item, existing_entity_type: 'article', existing_entity_slug: slug, article_translation_key: slug, relation_type: 'further_reading', review_status: 'pending_review', reviewed_by: null, reviewed_at: null, review_event_id: null };
    for (const action of ['revise', 'approve']) {
      const catalog = await readCatalog(directory);
      const id = entityKey('item_relation', replacement);
      const existing = catalog.item_relations.find(record => entityKey('item_relation', record) === id);
      if (existing?.review_status === 'approved' || (existing && action === 'revise')) continue;
      const observed = existing ? inspectReview(catalog, 'item_relation', id) : { revision: 0, content_hash: null, catalog_hash: hashJson(catalog) };
      const command = { schema_version: 'library-review-command/v1', id: `m3-relations-${String(i + 1).padStart(2, '0')}-${action}`, actor: report.actor, role: 'editor', action, entity_type: 'item_relation', entity_id: id, expected_revision: observed.revision, expected_content_hash: observed.content_hash, expected_catalog_hash: observed.catalog_hash, reason, as_of: new Date().toISOString(), ...(action === 'revise' ? { replacement } : {}) };
      const context = await loadReferenceContext(process.cwd(), existing ? catalog : { ...catalog, item_relations: [...catalog.item_relations, replacement] });
      const result = await applyReview({ directory, output, command, context, write: true });
      report.operations.push({ command, result });
    }
    console.log(`Reviewed ${i + 1}/10: ${slug}`);
  }
  const after = await readCatalog(directory);
  report.unchanged_catalog = Object.fromEntries(Object.keys(before).filter(key => !['item_relations', 'review_log'].includes(key)).map(key => [key, hashJson(before[key]) === hashJson(after[key])]));
  report.approved_relations = after.item_relations.filter(record => record.review_status === 'approved').length;
  report.status = 'complete';
} catch (error) {
  report.status = 'failed'; report.error = { code: error.code, message: error.message, issues: error.issues, rolled_back: error.rolled_back, recovery_required: error.recovery_required };
  throw error;
} finally {
  report.completed_at = new Date().toISOString();
  await fs.writeFile(new URL('./relations-review.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
}
