import type { LibraryIdentityEvent, LibraryItem, LibraryKind } from './types';

export class LibraryIdentityError extends Error {
  code: string;
  constructor(code: string, message: string) { super(message); this.name = 'LibraryIdentityError'; this.code = code; }
}
const fail = (code: string, message: string): never => { throw new LibraryIdentityError(code, message); };

export function publicHttpsUrl(value: string): URL {
  if (typeof value !== 'string' || value.length > 2048) return fail('UNSAFE_URL', 'Expected a bounded HTTPS reference.');
  let url: URL;
  try { url = new URL(value); } catch { return fail('UNSAFE_URL', 'Invalid resource URL.'); }
  const host = url.hostname.toLowerCase();
  const numbers = /^\d+\.\d+\.\d+\.\d+$/.test(host) ? host.split('.').map(Number) : null;
  const privateV4 = numbers && (numbers[0] === 0 || numbers[0] === 10 || numbers[0] === 127 || numbers[0] >= 224 || (numbers[0] === 169 && numbers[1] === 254) || (numbers[0] === 172 && numbers[1] >= 16 && numbers[1] <= 31) || (numbers[0] === 192 && (numbers[1] === 168 || numbers[1] === 0)) || (numbers[0] === 100 && numbers[1] >= 64 && numbers[1] <= 127) || (numbers[0] === 198 && [18, 19].includes(numbers[1])));
  const ipv6 = host.replace(/^\[|\]$/g, '');
  const privateV6 = ipv6.includes(':') && (/^(?:::|::1)$/.test(ipv6) || /^(?:fc|fd|fe[89ab]|::ffff:)/i.test(ipv6));
  if (url.protocol !== 'https:' || url.username || url.password || host === 'localhost' || /\.(?:localhost|local|internal)$/.test(host) || (!host.includes('.') && !host.includes(':')) || privateV4 || privateV6) return fail('UNSAFE_URL', 'Resource references must use public HTTPS without credentials.');
  return url;
}

export function normalizeUrl(value: string): string {
  const url = publicHttpsUrl(value);
  for (const key of [...url.searchParams.keys()]) if (/^utm_/i.test(key) || ['fbclid', 'gclid', 'dclid', 'msclkid'].includes(key.toLowerCase())) url.searchParams.delete(key);
  return url.href;
}

export function isbn13(value: string): string {
  let isbn = value.replace(/^isbn(?:-1[03])?:?\s*/i, '').replace(/[\s-]/g, '').toUpperCase();
  if (/^\d{9}[\dX]$/.test(isbn)) {
    if ([...isbn].reduce((sum, digit, index) => sum + (digit === 'X' ? 10 : Number(digit)) * (10 - index), 0) % 11) return fail('INVALID_ISBN', 'ISBN-10 check digit does not match.');
    isbn = '978' + isbn.slice(0, 9);
    isbn += String((10 - [...isbn].reduce((sum, digit, index) => sum + Number(digit) * (index % 2 ? 3 : 1), 0) % 10) % 10);
  }
  if (!/^97[89]\d{10}$/.test(isbn) || [...isbn].reduce((sum, digit, index) => sum + Number(digit) * (index % 2 ? 3 : 1), 0) % 10) return fail('INVALID_ISBN', 'Expected a valid ISBN-13 or ISBN-10.');
  return isbn;
}

export type NormalizedLibraryResource = { canonical_key: string; canonical_url: string; identifiers: LibraryItem['identifiers'] };
export type LibraryResourceInput = { kind: LibraryKind; url: string; identifier?: string | null; version?: string | null };

export function normalizeResource(input: LibraryResourceInput): NormalizedLibraryResource {
  if (!['video', 'book', 'paper', 'spec', 'article'].includes(input.kind)) return fail('INVALID_KIND', 'Unknown Library resource kind.');
  const url = publicHttpsUrl(normalizeUrl(input.url));
  const identifiers: LibraryItem['identifiers'] = { youtube_id: null, doi: null, arxiv_id: null, arxiv_version: null, isbn13: null, openlibrary_work: null, eip_number: null, version: null };
  const result = (key: string, canonicalUrl = url.href): NormalizedLibraryResource => ({ canonical_key: key, canonical_url: canonicalUrl, identifiers });
  const identifier = input.identifier?.trim() ?? '';
  const host = url.hostname.replace(/^www\./, '');
  if (input.kind === 'video' && ['youtube.com', 'm.youtube.com', 'youtu.be', 'youtube-nocookie.com'].includes(host)) {
    const ids = url.searchParams.getAll('v');
    const id = host === 'youtu.be' ? url.pathname.slice(1) : /^\/(?:shorts|embed|live)\//.test(url.pathname) ? url.pathname.split('/')[2] : url.pathname === '/watch' && ids.length === 1 ? ids[0] : '';
    if (!/^[\w-]{11}$/.test(id ?? '')) return fail('INVALID_YOUTUBE_ID', 'A single 11-character YouTube video ID is required.');
    if (identifier && identifier.replace(/^youtube:/, '') !== id) return fail('IDENTIFIER_CONFLICT', 'Video URL and explicit identifier disagree.');
    identifiers.youtube_id = id;
    return result(`youtube:${id}`, `https://www.youtube.com/watch?v=${id}`);
  }
  if (input.kind === 'book') {
    const statedWork = identifier.match(/^(?:openlibrary:work:)?(OL\d+W)$/i)?.[1]?.toUpperCase();
    const linkedWork = (host === 'openlibrary.org' ? url.pathname.match(/^\/works\/(OL\d+W)(?:\/|$)/i)?.[1] : null)?.toUpperCase();
    if (statedWork && linkedWork && statedWork !== linkedWork) return fail('IDENTIFIER_CONFLICT', 'Book work identifiers disagree.');
    if (linkedWork && identifier && !statedWork) return fail('IDENTITY_REVIEW_REQUIRED', 'Work and edition association requires explicit review, not an automatic merge.');
    const linkedIsbn = host === 'openlibrary.org' ? url.pathname.match(/^\/isbn\/([^/]+)/)?.[1] : host === 'oreilly.com' ? url.pathname.match(/^\/library\/view\/[^/]+\/(\d{13})\/?$/)?.[1] : null;
    if (linkedIsbn && statedWork) return fail('IDENTITY_REVIEW_REQUIRED', 'Edition and work association requires explicit review, not an automatic merge.');
    const work = statedWork ?? linkedWork;
    if (linkedIsbn && identifier && isbn13(linkedIsbn) !== isbn13(identifier)) return fail('IDENTIFIER_CONFLICT', 'Book URL and explicit ISBN identify different editions.');
    const isbnValue = identifier && !work ? identifier : linkedIsbn;
    if (isbnValue) identifiers.isbn13 = isbn13(isbnValue);
    if (work) { identifiers.openlibrary_work = work; return result(`openlibrary:work:${work}`, `https://openlibrary.org/works/${work}`); }
    if (identifiers.isbn13) return result(`isbn13:edition:${identifiers.isbn13}`);
  }
  if (input.kind === 'paper') {
    const statedDoi = identifier.replace(/^doi:/i, '').match(/^10\.\d{4,9}\/\S+$/)?.[0];
    const linkedDoi = ['doi.org', 'dx.doi.org'].includes(host) ? decodeURIComponent(url.pathname.slice(1)) : null;
    if (statedDoi && linkedDoi && statedDoi.toLowerCase() !== linkedDoi.toLowerCase()) return fail('IDENTIFIER_CONFLICT', 'Paper DOI identifiers disagree.');
    const doi = statedDoi ?? linkedDoi;
    if (doi) {
      if (!/^10\.\d{4,9}\/\S+$/.test(doi)) return fail('INVALID_DOI', 'Invalid DOI.');
      identifiers.doi = doi.toLowerCase();
      return result(`doi:${identifiers.doi}`, `https://doi.org/${identifiers.doi}`);
    }
    const arxivPattern = /^(\d{4}\.\d{4,5}|[a-z-]+(?:\.[A-Z]{2})?\/\d{7})(?:v([1-9]\d*))?$/i;
    const statedArxiv = identifier.replace(/^arxiv:/i, '').match(arxivPattern);
    const linkedArxiv = (['arxiv.org', 'export.arxiv.org'].includes(host) ? url.pathname.replace(/^\/(?:abs|pdf)\//, '').replace(/\.pdf$/, '') : '').match(arxivPattern);
    if (statedArxiv && linkedArxiv && (statedArxiv[1] !== linkedArxiv[1] || (statedArxiv[2] && linkedArxiv[2] && statedArxiv[2] !== linkedArxiv[2]))) return fail('IDENTIFIER_CONFLICT', 'Paper arXiv identifiers or explicit versions disagree.');
    const match = statedArxiv?.[2] ? statedArxiv : linkedArxiv ?? statedArxiv;
    if (match) {
      identifiers.arxiv_id = match[1]; identifiers.arxiv_version = match[2] ?? null;
      const suffix = match[2] ? `v${match[2]}` : '';
      return result(`arxiv:${match[1]}${suffix}`, `https://arxiv.org/abs/${match[1]}${suffix}`);
    }
    if (identifier || ['arxiv.org', 'export.arxiv.org'].includes(host)) return fail('INVALID_PAPER_ID', 'Explicit paper identifiers must be DOI or arXiv identifiers.');
  }
  if (input.kind === 'spec' && ['eips.ethereum.org', 'ercs.ethereum.org'].includes(host)) {
    const number = url.pathname.match(/^\/(?:EIPS\/eip|ERCS\/erc)-(\d+)\/?$/i)?.[1];
    if (!number) return fail('INVALID_EIP', 'Expected an individual EIP/ERC resource.');
    const explicit = identifier.match(/^(?:eip|erc):ethereum:(\d+):([\w.-]+)$/i);
    if (identifier && (!explicit || Number(explicit[1]) !== Number(number))) return fail('IDENTIFIER_CONFLICT', 'EIP URL and explicit identifier disagree.');
    const version = input.version ?? explicit?.[2];
    if (!version || !/^[\w.-]{1,100}$/.test(version) || /^(?:latest|main|master|head)$/i.test(version)) return fail('VERSION_REQUIRED', 'EIP/ERC identity requires an explicit reviewed commit or version.');
    if (input.version && explicit && input.version !== explicit[2]) return fail('IDENTIFIER_CONFLICT', 'Explicit EIP versions disagree.');
    identifiers.eip_number = String(Number(number)); identifiers.version = /^[a-f0-9]{40}$/i.test(version) ? version.toLowerCase() : version;
    return result(`eip:ethereum:${identifiers.eip_number}:${identifiers.version}`);
  }
  if (identifier) return fail('UNSUPPORTED_IDENTIFIER', 'This resource requires manual identity matching; the identifier was not silently discarded.');
  return result(`web:${url.href}`);
}

export function resolveLibraryIdentity(id: string, history: LibraryIdentityEvent[]): { status: 'resolved' | 'split'; ids: string[] } {
  const edges = new Map<string, string[]>();
  for (const event of history) {
    if (!event.review_event_id) continue;
    for (const from of event.from_ids) edges.set(from, event.to_ids);
  }
  const visit = (key: string, seen: Set<string>): string[] => {
    if (seen.has(key)) return fail('IDENTITY_CYCLE', 'Identity history contains a cycle.');
    const next = edges.get(key);
    if (!next) return [key];
    return next.flatMap(value => visit(value, new Set([...seen, key])));
  };
  const ids = [...new Set(visit(id, new Set()))].sort();
  return { status: ids.length > 1 ? 'split' : 'resolved', ids };
}
