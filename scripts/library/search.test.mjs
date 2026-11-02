import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { readCatalog } from './contract.mjs';
import { buildSnapshot, readSnapshot } from './snapshot.mjs';
import { loadReferenceContext } from './validate.mjs';
import { createLibrarySearch, parseLibraryQuery, serializeLibraryQuery, libraryQueryTerms } from '../../src/lib/library/search.ts';
import { validateEvaluation, evaluateLibrary, cohenKappa, relevanceMetrics } from './evaluate.mjs';

const catalog = await readCatalog('data/library');
const context = await loadReferenceContext(process.cwd(), catalog);
const asOf = catalog.review_log.at(-1).created_at;
const root = await fs.mkdtemp(path.join(os.tmpdir(), 'library-b1-consumer-'));
await buildSnapshot({ catalog, context, directory: root, asOf });
const snapshot = await readSnapshot(root, { currentCatalog: catalog, context, asOf });
await fs.rm(root, { recursive: true, force: true });
const index = createLibrarySearch(snapshot);
const queryBytes = await fs.readFile('data/library/evaluations/functional-queries.v1.json');
const queries = JSON.parse(queryBytes);
const humanProtocol = JSON.parse(await fs.readFile('data/library/evaluations/human-protocol.v1.json', 'utf8'));

test('B1 consumes the actual validated v1 public snapshot and all frozen trilingual functional probes', () => {
  assert.equal(createHash('sha256').update(queryBytes).digest('hex'), '6fd8511611922854fca0df1e2f741359cfa960d7126e9059199f0870631e6658');
  const report = evaluateLibrary({ catalog, snapshot, queries, humanProtocol, repetitions: 1, asOf });
  assert.equal(index.size, 100);
  assert.equal(report.functional.cases, 108); assert.equal(report.functional.language_queries, 324);
  assert.deepEqual(report.functional.failures, []);
  assert.equal(report.functional.is_human_gold, false);
  assert.equal(report.human_evaluation.status, 'not-run');
  for (const key of ['macro_f1', 'verified_evidence_precision', 'cohen_kappa', 'ndcg_at10', 'recall_at20']) assert.equal(report.human_evaluation[key], null);
  assert.equal(report.B3.startsWith('disabled'), true);
});

test('UI locale never changes original-language/date unknowns or uses editorial time as recommendation time', () => {
  const result = index.search({ language: 'en' }, { locale: 'ja', asOf });
  assert.equal(result.total, catalog.items.filter(row => row.original_language === 'en').length);
  assert.ok(result.results.every(hit => hit.item.original_language === 'en'));
  assert.equal(index.search({ language: 'und' }, { locale: 'en', asOf }).total, catalog.items.filter(row => row.original_language === 'und').length);
  assert.equal(index.search({ year: 'unknown' }, { asOf }).total, catalog.items.filter(row => row.original_published_at === null).length);
  assert.equal(index.search({ sort: 'recently-recommended' }, { asOf }).total, 0);
  assert.equal(index.search({ recommendedFrom: '2026-11-02', recommendedTo: '2026-11-02' }, { asOf }).total, 0);
});

test('NFKC, identifier spelling and mixed-script probes have deterministic explanation fields', () => {
  const twenty = catalog.items.find(row => row.identifiers.eip_number === '20').id;
  const a = index.search({ q: 'ＥＲＣ２０ 第三方授权' }, { locale: 'zh-CN', asOf });
  const b = index.search({ q: 'erc-20 第三方授权' }, { locale: 'ja', asOf });
  assert.equal(a.results[0].item.id, twenty);
  assert.deepEqual(a.results.map(row => row.item.id), b.results.map(row => row.item.id));
  assert.ok(a.results[0].matches.some(row => row.field === 'identity' && row.terms.includes('erc-20')));
  assert.ok(libraryQueryTerms('署名 検証 eip712').includes('eip-712'));
  assert.equal(index.search({ q: 'ERC-999999999 authorization' }, { asOf }).total, 0);
  const book = catalog.items.find(row => row.original_title === 'Understanding Bitcoin');
  assert.equal(index.search({ q: book.canonical_url }, { asOf }).results[0].item.id, book.id);
  assert.equal(index.search({ q: '<script>nonexistent_987654321</script>' }, { asOf }).total, 0);
});

for (const [locale, q] of Object.entries({
  'zh-CN': '区块链账户权限委托的技术实现涉及交易执行状态更新签名校验授权范围费用结算安全边界重放保护网络升级开发接口资产归属跨链互操作钱包连接合约部署存储访问事件通知以及用户恢复流程 这是关于 ERC999999999 的问题',
  ja: '口座権限の委任、取引実行と状態更新、署名検証と認可範囲、手数料精算、安全境界と再送保護、通信網の更新、開発用インターフェース、資産帰属と相互運用、ウォレット接続、契約配備と記憶参照、事象通知、利用者の回復手順、公開鍵と秘密鍵の管理、承認記録と監査証跡、残高確認と送金受領を調べたい。これは ERC999999999 の質問です。',
})) test(`long ${locale} queries preserve trailing unknown and known identifier constraints`, () => {
  assert.ok(q.length <= 200);
  assert.equal(index.search({ q }, { locale, asOf }).total, 0);
  assert.ok(libraryQueryTerms(q).includes('erc-999999999'));
  const known = q.replace('ERC999999999', 'ERC7702');
  const itemId = catalog.items.find(row => row.identifiers.eip_number === '7702').id;
  const result = index.search({ q: known }, { locale, asOf });
  assert.ok(result.results.some(hit => hit.item.id === itemId));
  assert.ok(result.results.every(hit => hit.matches.some(match => match.terms.includes('erc-7702'))));
});

test('query grammar round-trips only named filters and rejects invalid, duplicate and boundary values', () => {
  const params = new URLSearchParams({ q: 'ERC-7702 委托', type: 'spec', language: 'und', level: 'unknown', year: 'unknown', sort: 'best', page: '2' });
  const query = parseLibraryQuery(params);
  assert.deepEqual(parseLibraryQuery(serializeLibraryQuery(query)), query);
  for (const input of [{ q: 'x'.repeat(201) }, { page: '0' }, { page: '1.2' }, { page: '01' }, { type: 'unknown' }, { sort: 'B3' }, { level: 'expert' }, { recommendedFrom: '2026-02-31' }, { recommendedFrom: '2026-12-02', recommendedTo: '2026-11-02' }, { expression: 'run()' }]) assert.throws(() => parseLibraryQuery(input));
  assert.throws(() => parseLibraryQuery(new URLSearchParams('q=a&q=b')));
  const all = index.search({}, { asOf }); const later = index.search({ page: '99' }, { asOf });
  assert.equal(all.total, 100); assert.equal(all.page_count, 5);
  assert.equal(later.total, 100); assert.deepEqual(later.results, []);
});

function syntheticDiversitySnapshot(creators) {
  const base = snapshot.items[0];
  const items = creators.map((author, i) => ({ ...structuredClone(base), id: `lib_${(i + 1).toString(16).padStart(32, '0')}`, slug: `synthetic-${i}`, canonical_key: `url:https://example.org/synthetic/${i}`, canonical_url: `https://example.org/synthetic/${i}`, creators: author ? [author] : [], topic_slugs: ['synthetic-topic'] }));
  const ids = items.map(row => row.id);
  return { items, manifest: snapshot.manifest, rankings: { rank_version: 'editorial-v1', basis: 'editorial-order; no quality probability', sorts: { best: ids, evergreen: ids, 'recently-recommended': [], 'recently-published': ids } } };
}
test('Topic author cap applies to the first ten without losing eligible resources on later pages', () => {
  const data = syntheticDiversitySnapshot([...Array(17).fill('Synthetic Author A'), ...Array(4).fill('Synthetic Author B'), ...Array(4).fill('Synthetic Author C')]);
  const search = createLibrarySearch(data); const first = search.search({ topic: 'synthetic-topic' }, { asOf });
  assert.equal(first.total, 25); assert.equal(first.diversity.relaxed, false);
  const authors = first.results.slice(0, 10).map(row => row.item.creators[0]);
  for (const author of new Set(authors)) assert.ok(authors.filter(value => value === author).length <= 4);
  const second = search.search({ topic: 'synthetic-topic', page: '2' }, { asOf });
  assert.equal(new Set([...first.results, ...second.results].map(row => row.item.id)).size, 25);
  assert.equal(first.results.length, 20); assert.equal(second.results.length, 5);
  const narrow = createLibrarySearch(syntheticDiversitySnapshot(Array(12).fill('Synthetic Author'))).search({ topic: 'synthetic-topic' }, { asOf });
  assert.equal(narrow.total, 12); assert.equal(narrow.diversity.relaxed, true);
  const unknown = createLibrarySearch(syntheticDiversitySnapshot(Array(12).fill(null))).search({ topic: 'synthetic-topic' }, { asOf });
  assert.equal(unknown.diversity.relaxed, false); assert.equal(unknown.total, 12);
});

test('raw catalog items and expired public snapshots cannot enter a current B1 result set', () => {
  assert.throws(() => createLibrarySearch({ ...snapshot, items: catalog.items }));
  assert.throws(() => index.search({}, { asOf: snapshot.manifest.valid_until }), { code: 'SNAPSHOT_EXPIRED' });
  const justBefore = new Date(Date.parse(snapshot.manifest.valid_until) - 1).toISOString();
  assert.equal(index.search({}, { asOf: justBefore }).total, 100);
});

test('evaluation protocol samples actual public and nonpublic candidates without inventing raters', () => {
  validateEvaluation('human', humanProtocol, catalog);
  assert.equal(humanProtocol.samples.length, 120);
  assert.ok(humanProtocol.samples.some(row => row.item_id === null));
  assert.deepEqual(humanProtocol.raters, []); assert.deepEqual(humanProtocol.annotations, []);
  const fake = structuredClone(humanProtocol); fake.status = 'complete';
  assert.throws(() => validateEvaluation('human', fake, catalog), { code: 'HUMAN_LABELS_INCOMPLETE' });
  const falselyRun = structuredClone(humanProtocol); falselyRun.raters.push({ id: 'synthetic-agent', kind: 'agent', role: 'rater' });
  assert.throws(() => validateEvaluation('human', falselyRun, catalog), { code: 'EVALUATION_INPUT_INVALID' });
  const unknown = structuredClone(queries); unknown.cases[0].expected_item_ids = ['lib_' + 'f'.repeat(32)];
  assert.throws(() => validateEvaluation('functional', unknown, catalog), { code: 'EVALUATION_REFERENCE_INVALID' });
  const cross = structuredClone(humanProtocol); const mapped = cross.samples.find(row => row.item_id);
  mapped.item_id = catalog.items.find(row => row.id !== mapped.item_id).id;
  assert.throws(() => validateEvaluation('human', cross, catalog), { code: 'EVALUATION_REFERENCE_INVALID' });
});

test('metric arithmetic stays separate from actual not-run human evidence', () => {
  assert.equal(cohenKappa([]), null); assert.equal(cohenKappa([['citation', 'citation']]), null);
  assert.equal(cohenKappa([['citation', 'citation'], ['mention', 'mention']]), 1);
  const judgments = [{ item_id: 'synthetic-a', relevance: 3 }, { item_id: 'synthetic-b', relevance: 1 }];
  assert.deepEqual(relevanceMetrics(['synthetic-a', 'synthetic-b'], judgments), { ndcg_at10: 1, recall_at20: 1 });
  assert.equal(relevanceMetrics([], []).ndcg_at10, null);
});
