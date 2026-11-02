import type { LibraryLocale, LibraryPublicItem, LibraryPublicRankings, LibrarySnapshotManifest, LibrarySort } from './types';

export const LIBRARY_SEARCH_VERSION = 'b1-keyword-v1';
const PAGE_SIZE = 20;
const SORTS = ['best', 'evergreen', 'recently-recommended', 'recently-published'];
const KINDS = ['book', 'paper', 'article', 'video', 'spec'];
const LEVELS = ['beginner', 'intermediate', 'advanced', 'unknown'];
const KEYS = ['q', 'topic', 'type', 'language', 'level', 'year', 'recommendedFrom', 'recommendedTo', 'sort', 'page'];
const STOP_WORDS = new Set('a an and are as at be by can do does for from how in is it of on or the this to what when which with about study read reading reference should would could どの こと これ その それ ため です ます どう する した には とは について 如何 怎么 什么 哪些 为何 是否 研究 阅读 理解 一个'.split(' '));
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;

export class LibrarySearchError extends Error {
  code: string;
  constructor(message: string, code = 'INVALID_LIBRARY_QUERY') { super(message); this.code = code; }
}
export type LibraryQuery = {
  q: string; topic: string; type: string; language: string; level: string; year: string;
  recommendedFrom: string; recommendedTo: string; sort: LibrarySort; page: number;
};
export function normalizeLibraryText(text: string) {
  return text.normalize('NFKC').toLowerCase().replace(/[‐‑–—]/gu, '-').replace(/\b(erc|eip)\s*-?\s*(\d+)\b/gu, '$1-$2').replace(/\s+/gu, ' ').trim();
}
export function libraryQueryTerms(text: string) {
  const result: string[] = [];
  const normalized = normalizeLibraryText(text);
  for (const part of normalized.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+|[\p{L}\p{N}][\p{L}\p{N}._:/-]*/gu) ?? []) {
    if (STOP_WORDS.has(part)) continue;
    if (/^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+$/u.test(part)) {
      const chars = [...part];
      if (chars.length === 1) result.push(part);
      for (let i = 0; i < chars.length - 1; i++) {
        const term = chars.slice(i, i + 2).join('');
        if (!STOP_WORDS.has(term)) result.push(term);
      }
    } else result.push(part.replace(/\.$/u, ''));
  }
  return [...new Set(result)];
}
function validDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  try { return new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value; } catch { return false; }
}
export function parseLibraryQuery(params: URLSearchParams | Record<string, string | undefined>): LibraryQuery {
  const entries = params instanceof URLSearchParams ? [...params.entries()] : Object.entries(params).filter((entry): entry is [string, string] => entry[1] !== undefined);
  const values: Record<string, string> = {};
  for (const [key, value] of entries) {
    if (!KEYS.includes(key) || key in values || typeof value !== 'string') throw new LibrarySearchError('Unknown or repeated Library query parameter.');
    values[key] = value.trim();
  }
  const query = { q: '', topic: '', type: '', language: '', level: '', year: '', recommendedFrom: '', recommendedTo: '', sort: 'best', ...values, page: values.page ? Number(values.page) : 1 } as LibraryQuery;
  if (query.q.length > 200 || /[\u0000-\u001f\u007f]/u.test(query.q) || !SORTS.includes(query.sort) || (query.type && !KINDS.includes(query.type)) || (query.level && !LEVELS.includes(query.level)) || !Number.isSafeInteger(query.page) || query.page < 1 || (values.page && !/^[1-9]\d*$/.test(values.page))) throw new LibrarySearchError('Invalid query length, type, level, sort or page.');
  if ((query.topic && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(query.topic)) || query.topic.length > 100 || (query.language && !/^(?:und|[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*)$/.test(query.language)) || (query.year && query.year !== 'unknown' && !/^\d{4}$/.test(query.year))) throw new LibrarySearchError('Invalid topic, original language or year.');
  if ((query.recommendedFrom && !validDay(query.recommendedFrom)) || (query.recommendedTo && !validDay(query.recommendedTo)) || (query.recommendedFrom && query.recommendedTo && query.recommendedFrom > query.recommendedTo)) throw new LibrarySearchError('Recommendation dates must be valid ordered UTC calendar days.');
  return query;
}
export function serializeLibraryQuery(query: LibraryQuery) {
  const checked = parseLibraryQuery(Object.fromEntries(Object.entries(query).map(([key, value]) => [key, String(value)])));
  const params = new URLSearchParams();
  for (const key of KEYS) {
    const value = checked[key as keyof LibraryQuery];
    if (value && !(key === 'page' && value === 1) && !(key === 'sort' && value === 'best')) params.set(key, String(value));
  }
  return params;
}

type Match = { field: string; terms: string[]; weight: number };
type SearchHit = { item: LibraryPublicItem; score: number; matches: Match[] };
function identityText(item: LibraryPublicItem) {
  const eip = item.canonical_key.match(/^eip:ethereum:(\d+):/);
  return eip ? `${item.canonical_key} ${item.canonical_url} ERC-${eip[1]} ERC${eip[1]} EIP-${eip[1]} EIP${eip[1]}` : `${item.canonical_key} ${item.canonical_url}`;
}
function diversify(hits: SearchHit[]) {
  const counts = new Map<string, number>(); const front: SearchHit[] = [];
  for (const hit of hits) {
    const creators = [...new Set(hit.item.creators.map(normalizeLibraryText))];
    if (front.length < 10 && !creators.some(creator => (counts.get(creator) ?? 0) >= 4)) { front.push(hit); for (const creator of creators) counts.set(creator, (counts.get(creator) ?? 0) + 1); }
  }
  const missing = Math.max(0, Math.min(10, hits.length) - front.length); const chosen = new Set(front.map(hit => hit.item.id));
  if (missing) for (const hit of hits.filter(hit => !chosen.has(hit.item.id)).slice(0, missing)) { front.push(hit); chosen.add(hit.item.id); }
  return { hits: [...front, ...hits.filter(hit => !chosen.has(hit.item.id))], relaxed: missing > 0, known_author_cap: 4, window: 10 };
}

export function createLibrarySearch(snapshot: { items: LibraryPublicItem[]; rankings: LibraryPublicRankings; manifest: LibrarySnapshotManifest }) {
  const { manifest, rankings } = snapshot;
  const ids = new Set(snapshot.items.map(item => item.id));
  if (manifest.schema_version !== '1.1.0' || manifest.rank_version !== rankings.rank_version || ids.size !== snapshot.items.length || rankings.sorts.best.length !== ids.size || rankings.sorts.best.some(id => !ids.has(id))) throw new LibrarySearchError('Search requires one validated public snapshot.');
  const entries = snapshot.items.map(item => {
    if ('status' in item || 'checks' in item || 'field_provenance' in item || !item.locales || !item.published_at) throw new LibrarySearchError('Catalog records cannot be searched as public items.');
    const fields: [string, string, number][] = [['identity', identityText(item), 24], ['original_title', item.original_title, 12], ['creators', item.creators.join(' '), 6], ['topics', item.topic_slugs.join(' '), 5]];
    for (const locale of ['zh-CN', 'en', 'ja'] as const) {
      if (!item.locales[locale]?.title || !item.locales[locale]?.description) throw new LibrarySearchError('Three public locales are required.');
      fields.push([`title.${locale}`, item.locales[locale].title, 12], [`description.${locale}`, item.locales[locale].description, 4], [`reasons.${locale}`, item.locales[locale].reasons.map(reason => reason.text).join(' '), 3]);
    }
    return { item, fields: fields.map(([field, text, weight]) => ({ field, text: normalizeLibraryText(text), weight })) };
  });
  return {
    version: LIBRARY_SEARCH_VERSION,
    size: entries.length,
    search(input: URLSearchParams | Record<string, string | undefined>, { locale = 'en', asOf = new Date().toISOString() }: { locale?: LibraryLocale; asOf?: string } = {}) {
      if (!['zh-CN', 'en', 'ja'].includes(locale) || !Number.isFinite(Date.parse(asOf))) throw new LibrarySearchError('Unsupported UI locale or invalid clock.');
      if (manifest.valid_until && Date.parse(asOf) >= Date.parse(manifest.valid_until)) throw new LibrarySearchError('The current snapshot has expired.', 'SNAPSHOT_EXPIRED');
      const query = parseLibraryQuery(input); const terms = libraryQueryTerms(query.q); const normalized = normalizeLibraryText(query.q);
      const order = new Map(rankings.sorts[query.sort].map((id, index) => [id, index]));
      const recommended = new Set(rankings.sorts['recently-recommended']);
      let hits: SearchHit[] = [];
      for (const entry of entries) {
        const item = entry.item;
        if ((query.topic && !item.topic_slugs.includes(query.topic)) || (query.type && item.kind !== query.type) || (query.language && item.original_language !== query.language) || (query.level && item.level !== query.level) || (query.year && (query.year === 'unknown' ? item.original_published_at !== null : !item.original_published_at?.startsWith(query.year + '-'))) || (query.sort === 'recently-recommended' && !recommended.has(item.id))) continue;
        if (query.recommendedFrom || query.recommendedTo) {
          if (!recommended.has(item.id) || !item.evidence.some(e => e.kind === 'recommendation' && (!query.recommendedFrom || e.observed_at.slice(0, 10) >= query.recommendedFrom) && (!query.recommendedTo || e.observed_at.slice(0, 10) <= query.recommendedTo))) continue;
        }
        const matches = entry.fields.map(({ field, text, weight }) => ({ field, terms: terms.filter(term => text.includes(term)), weight })).filter(match => match.terms.length);
        if (normalized && (!terms.length || !matches.length)) continue;
        if (terms.some(term => /\d/u.test(term) && !matches.some(match => match.terms.includes(term)))) continue;
        const score = matches.reduce((n, match) => n + match.weight * match.terms.length, 0) + entry.fields.reduce((n, field) => n + (normalized && field.text.includes(normalized) ? field.weight * 2 : 0), 0);
        hits.push({ item, score, matches });
      }
      hits.sort((a, b) => (query.sort === 'best' && normalized ? b.score - a.score : 0) || (order.get(a.item.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.item.id) ?? Number.MAX_SAFE_INTEGER) || compare(a.item.id, b.item.id));
      const diversity = query.topic && (query.sort === 'best' || query.sort === 'evergreen') ? diversify(hits) : null;
      if (diversity) hits = diversity.hits;
      const total = hits.length; const offset = (query.page - 1) * PAGE_SIZE;
      return { version: LIBRARY_SEARCH_VERSION, snapshot_id: manifest.snapshot_id, locale, query, total, page_size: PAGE_SIZE, page_count: Math.ceil(total / PAGE_SIZE), results: hits.slice(offset, offset + PAGE_SIZE), diversity: diversity ? { applied: true, relaxed: diversity.relaxed, known_author_cap: diversity.known_author_cap, window: diversity.window } : { applied: false, relaxed: false, known_author_cap: 4, window: 10 } };
    },
  };
}
