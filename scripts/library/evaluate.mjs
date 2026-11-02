import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import { readCatalog, parseJsonStrict, hashJson, LibraryValidationError } from './contract.mjs';
import { readSnapshot } from './snapshot.mjs';
import { loadReferenceContext } from './validate.mjs';
import { createLibrarySearch } from '../../src/lib/library/search.ts';

const schema = parseJsonStrict(await fs.readFile(new URL('../../data/library/schemas/evaluation.schema.json', import.meta.url)));
const ajv = new Ajv2020({ strict: true, allErrors: true, coerceTypes: false }); ajv.addSchema(schema);
const fail = (code, message, issues) => { throw new LibraryValidationError(code, message, issues); };
const validators = Object.fromEntries(['functional', 'human'].map(type => [type, ajv.getSchema(`${schema.$id}#/$defs/${type}`)]));
export function validateEvaluation(type, value, catalog) {
  if (!validators[type]?.(value)) fail('EVALUATION_INPUT_INVALID', 'Evaluation input does not match its declared schema.', validators[type]?.errors);
  const candidates = new Map(catalog.candidates.map(row => [row.candidate_id, row]));
  const itemIds = new Set(catalog.items.map(row => row.id));
  const items = new Map(catalog.items.map(row => [row.id, row]));
  if (type === 'functional') {
    if (value.query_case_count !== value.cases.length || new Set(value.cases.map(row => row.id)).size !== value.cases.length) fail('EVALUATION_INPUT_INVALID', 'Functional case counts and unique IDs must agree.');
    for (const row of value.cases) if ((row.expect === 'empty') !== (row.expected_item_ids.length === 0) || new Set(row.expected_item_ids).size !== row.expected_item_ids.length || row.expected_item_ids.some(id => !itemIds.has(id))) fail('EVALUATION_REFERENCE_INVALID', 'Functional expectations must refer to actual resource IDs or an explicit empty result.');
  } else {
    if (new Set(value.samples.map(row => row.candidate_id)).size !== value.samples.length) fail('EVALUATION_INPUT_INVALID', 'Human sample IDs must be distinct.');
    for (const sample of value.samples) {
      const candidate = candidates.get(sample.candidate_id);
      if (!candidate || candidate.resource.kind !== sample.kind || candidate.source_id !== sample.source_id || candidate.source_record_id !== sample.source_record_id || (sample.item_id !== null && !itemIds.has(sample.item_id))) fail('EVALUATION_REFERENCE_INVALID', 'Human samples must match actual candidate source identities.');
      if (sample.item_id !== null) {
        const item = items.get(sample.item_id); const origin = item.field_provenance.original_title;
        if (item.kind !== sample.kind || item.source_id !== sample.source_id || origin?.source_record_id !== sample.source_record_id) fail('EVALUATION_REFERENCE_INVALID', 'A sampled candidate cannot be relabeled as a different resource.');
      }
    }
    if (value.status === 'not-run' && (value.raters.length || value.annotations.length || value.search_judgments.length)) fail('EVALUATION_INPUT_INVALID', 'A not-run protocol cannot carry purported human labels.');
    if (value.status === 'complete') {
      const raters = value.raters.filter(row => row.role === 'rater'); const ids = new Set(raters.map(row => row.id));
      if (raters.length !== 2 || ids.size !== 2 || new Set(value.raters.map(row => row.id)).size !== value.raters.length || value.annotations.length < 120 || new Set(value.annotations.map(row => row.candidate_id)).size !== value.annotations.length) fail('HUMAN_LABELS_INCOMPLETE', 'Complete human evaluation requires two distinct declared raters and at least120 paired samples.');
      const sampled = new Set(value.samples.map(row => row.candidate_id));
      for (const annotation of value.annotations) {
        if (!sampled.has(annotation.candidate_id) || annotation.ratings.length !== 2 || new Set(annotation.ratings.map(row => row.rater_id)).size !== 2 || annotation.ratings.some(row => !ids.has(row.rater_id))) fail('HUMAN_LABELS_INCOMPLETE', 'Each annotation needs the two declared independent rater IDs and a sampled candidate.');
        const [a, b] = annotation.ratings;
        if (a.intent !== b.intent || a.relevance !== b.relevance || a.evidence_verified !== b.evidence_verified) {
          if (!annotation.adjudication || !value.raters.some(row => row.id === annotation.adjudication.rater_id && row.role === 'adjudicator')) fail('HUMAN_LABELS_INCOMPLETE', 'Disagreements require a separately declared adjudicator.');
        }
      }
      for (const query of value.search_judgments) if ((query.filters.page && query.filters.page !== '1') || query.judgments.some(row => !itemIds.has(row.item_id)) || new Set(query.judgments.map(row => row.item_id)).size !== query.judgments.length) fail('EVALUATION_REFERENCE_INVALID', 'Relevance judgments must use distinct actual item IDs and the first result page.');
    }
  }
  return value;
}
export function cohenKappa(pairs) {
  if (!pairs.length) return null;
  const labels = new Set(pairs.flat()); const a = new Map(); const b = new Map(); let agree = 0;
  for (const [x, y] of pairs) { a.set(x, (a.get(x) ?? 0) + 1); b.set(y, (b.get(y) ?? 0) + 1); if (x === y) agree++; }
  const expected = [...labels].reduce((n, label) => n + (a.get(label) ?? 0) * (b.get(label) ?? 0) / pairs.length ** 2, 0);
  return expected === 1 ? null : (agree / pairs.length - expected) / (1 - expected);
}
export function relevanceMetrics(ranked, judgments) {
  const scores = new Map(judgments.map(row => [row.item_id, row.relevance]));
  const relevant = judgments.filter(row => row.relevance > 0).length;
  const dcg = values => values.slice(0, 10).reduce((n, relevance, i) => n + (2 ** relevance - 1) / Math.log2(i + 2), 0);
  const ideal = dcg([...scores.values()].sort((a, b) => b - a));
  return { ndcg_at10: ideal ? dcg(ranked.map(id => scores.get(id) ?? 0)) / ideal : null, recall_at20: relevant ? ranked.slice(0, 20).filter(id => (scores.get(id) ?? 0) > 0).length / relevant : null };
}
export function evaluateLibrary({ catalog, snapshot, queries, humanProtocol, repetitions = 3, asOf = new Date().toISOString() }) {
  validateEvaluation('functional', queries, catalog); validateEvaluation('human', humanProtocol, catalog);
  const eligible = new Set(snapshot.items.map(row => row.id));
  if (humanProtocol.search_judgments.some(query => query.judgments.some(row => !eligible.has(row.item_id)))) fail('EVALUATION_REFERENCE_INVALID', 'Search-quality judgments cannot make an ineligible resource part of the ranked set.');
  if (!Number.isInteger(repetitions) || repetitions < 1 || repetitions > 20) fail('INVALID_ARGUMENT', 'Evaluation repetitions must be between1 and20.');
  const indexStarted = performance.now(); const index = createLibrarySearch(snapshot); const indexMs = performance.now() - indexStarted;
  const latencies = []; const outcomes = [];
  for (let iteration = 0; iteration < repetitions; iteration++) for (const row of queries.cases) for (const locale of ['zh-CN', 'en', 'ja']) {
    const start = performance.now(); const result = index.search({ ...row.filters, q: row.queries[locale] }, { locale, asOf }); latencies.push(performance.now() - start);
    if (iteration === 0) {
      const ids = result.results.map(hit => hit.item.id); const passed = row.expect === 'empty' ? result.total === 0 : row.expected_item_ids.every(id => ids.includes(id));
      outcomes.push({ case_id: row.id, locale, passed, total: result.total, expected_item_ids: row.expected_item_ids, result_ids: ids });
    }
  }
  latencies.sort((a, b) => a - b);
  const human = { status: humanProtocol.status, provenance: 'Declared human labels are not authenticated by this offline program.', samples: humanProtocol.samples.length, paired_annotations: humanProtocol.annotations.length, macro_f1: null, verified_evidence_precision: null, cohen_kappa: null, ndcg_at10: null, recall_at20: null, metric_limitations: ['Automatic extraction/classifier disabled; no classifier F1 claimed.', 'No human-sampled verified recommendation precision available.'] };
  if (humanProtocol.status === 'complete') {
    human.cohen_kappa = cohenKappa(humanProtocol.annotations.map(row => row.ratings.map(rating => rating.intent)));
    const perQuery = humanProtocol.search_judgments.map(query => {
      const results = index.search({ ...query.filters, q: query.q }, { locale: query.locale, asOf }).results;
      return relevanceMetrics(results.map(row => row.item.id), query.judgments);
    });
    for (const key of ['ndcg_at10', 'recall_at20']) { const values = perQuery.map(row => row[key]).filter(value => value !== null); human[key] = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null; }
  }
  const topicDiversity = Object.keys(snapshot.facets.topics).sort().map(topic => {
    const result = index.search({ topic }, { asOf }); const count = Math.min(result.total, 10); const authors = new Map();
    for (const hit of result.results.slice(0, 10)) for (const author of new Set(hit.item.creators)) authors.set(author, (authors.get(author) ?? 0) + 1);
    return { topic, total: result.total, top_count: count, maximum_known_author_count: Math.max(0, ...authors.values()), unknown_author_items: result.results.slice(0, 10).filter(hit => !hit.item.creators.length).length, ...result.diversity };
  });
  return { schema_version: 'library-evaluation-result/v1', as_of: asOf, snapshot_id: snapshot.manifest.snapshot_id, search_version: index.version, selected_mode: 'editorial-selection+B1-keyword', automatic_extraction: 'disabled', B2: 'disabled; no validated independent recommendation ranking', B3: 'disabled; no validated quality advantage', functional: { label_origin: queries.label_origin, is_human_gold: false, dataset_hash: hashJson(queries), cases: queries.cases.length, language_queries: outcomes.length, passed: outcomes.filter(row => row.passed).length, failures: outcomes.filter(row => !row.passed), interpretation: 'Functional probes are agent-authored; this is not human relevance accuracy or an NDCG measurement.' }, performance: { node: process.version, platform: `${process.platform}-${process.arch}`, index_ms: indexMs, searches: latencies.length, p50_ms: latencies[Math.floor(latencies.length * 0.5)], p95_ms: latencies[Math.min(latencies.length - 1, Math.ceil(latencies.length * 0.95) - 1)], max_ms: latencies.at(-1), scope: '100 actual public items; local CPU search only, not network/UI/LCP or user task efficiency.' }, topic_diversity: topicDiversity, human_evaluation: human, quality_claim: 'No human-quality, algorithm-superiority or user-research gate is passed by functional checks.' };
}
export async function main(args = process.argv.slice(2)) {
  const options = { directory: path.resolve('data/library'), snapshot: path.resolve('public/data/library/v1'), queries: path.resolve('data/library/evaluations/functional-queries.v1.json'), gold: path.resolve('data/library/evaluations/human-protocol.v1.json'), asOf: new Date().toISOString() };
  if (args.includes('--help')) { process.stdout.write('library:evaluate [--dir CATALOG --snapshot OUTPUT --queries JSON --gold JSON --as-of UTC]\nReads approved local files only; emits functional/performance results and explicit not-run human metrics.\n'); return 0; }
  for (let i = 0; i < args.length; i++) { const key = { '--dir': 'directory', '--snapshot': 'snapshot', '--queries': 'queries', '--gold': 'gold', '--as-of': 'asOf' }[args[i]]; if (!key || !args[i + 1]) fail('INVALID_ARGUMENT', 'Unknown evaluation flag; use --help.'); options[key] = args[++i]; }
  const catalog = await readCatalog(options.directory); const context = await loadReferenceContext(process.cwd(), catalog);
  const snapshot = await readSnapshot(options.snapshot, { currentCatalog: catalog, context, asOf: options.asOf });
  const result = evaluateLibrary({ catalog, snapshot, queries: parseJsonStrict(await fs.readFile(options.queries)), humanProtocol: parseJsonStrict(await fs.readFile(options.gold)), asOf: options.asOf });
  process.stdout.write(JSON.stringify(result, null, 2) + '\n'); return result.functional.failures.length ? 1 : 0;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().then(code => { process.exitCode = code; }).catch(error => { process.stderr.write(JSON.stringify({ code: error.code ?? 'EVALUATION_FAILED', message: error.message, issues: error.issues }) + '\n'); process.exitCode = 1; });
