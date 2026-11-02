import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeResource, normalizeUrl, isbn13, resolveLibraryIdentity } from './normalize.mjs';

const normalize = (kind, url, extra = {}) => normalizeResource({ kind, url, ...extra });

test('YouTube URL variants share one video identity without playlist or duplicate-v guessing', () => {
  const id = 'dQw4w9WgXcQ';
  const variants = [`https://youtu.be/${id}?t=3`, `https://www.youtube.com/watch?v=${id}&list=abc`, `https://youtube.com/shorts/${id}`, `https://youtube.com/embed/${id}`];
  assert.deepEqual(variants.map(url => normalize('video', url).canonical_key), variants.map(() => `youtube:${id}`));
  assert.equal(normalize('video', variants[0]).canonical_url, `https://www.youtube.com/watch?v=${id}`);
  for (const url of ['https://youtube.com/playlist?list=abc', `https://youtube.com/watch?v=${id}&v=aaaaaaaaaaa`, 'https://youtu.be/not-an-id']) assert.throws(() => normalize('video', url), { code: 'INVALID_YOUTUBE_ID' });
  assert.throws(() => normalize('video', variants[0], { identifier: 'youtube:aaaaaaaaaaa' }), { code: 'IDENTIFIER_CONFLICT' });
});

test('generic URLs retain identity queries, fragments, path case and cross-domain separation', () => {
  assert.equal(normalizeUrl('https://EXAMPLE.org:443/Path?id=2&ref=edition&utm_source=x&fbclid=z#section'), 'https://example.org/Path?id=2&ref=edition#section');
  assert.notEqual(normalize('article', 'https://a.example.org/Page').canonical_key, normalize('article', 'https://b.example.org/Page').canonical_key);
  assert.notEqual(normalize('article', 'https://example.org/Page?id=1').canonical_key, normalize('article', 'https://example.org/Page?id=2').canonical_key);
});

test('unsafe schemes, credentials and normalized private network addresses are rejected without fetching', () => {
  for (const url of ['file:///etc/passwd', 'javascript:alert(1)', 'http://example.org', 'https://user:secret@example.org', 'https://localhost/a', 'https://test.local/a', 'https://127.0.0.1', 'https://2130706433', 'https://10.0.0.1', 'https://169.254.169.254', 'https://172.20.1.1', 'https://192.168.1.1', 'https://[::1]', 'https://[::ffff:7f00:1]']) assert.throws(() => normalizeUrl(url), { code: 'UNSAFE_URL' });
});

test('DOI casing and arXiv URL variants normalize without conflating explicit paper versions', () => {
  assert.equal(normalize('paper', 'https://doi.org/10.1000/ABC').canonical_key, 'doi:10.1000/abc');
  assert.equal(normalize('paper', 'https://example.org/paper.pdf', { identifier: 'doi:10.1000/ABC' }).canonical_url, 'https://doi.org/10.1000/abc');
  assert.equal(normalize('paper', 'https://arxiv.org/pdf/1904.05234v2.pdf').canonical_key, 'arxiv:1904.05234v2');
  assert.notEqual(normalize('paper', 'https://arxiv.org/abs/1904.05234v1').canonical_key, normalize('paper', 'https://arxiv.org/abs/1904.05234v2').canonical_key);
  assert.throws(() => normalize('paper', 'https://example.org/paper', { identifier: 'made-up' }), { code: 'INVALID_PAPER_ID' });
  assert.throws(() => normalize('paper', 'https://doi.org/10.1000/A', { identifier: 'doi:10.1000/B' }), { code: 'IDENTIFIER_CONFLICT' });
  assert.throws(() => normalize('paper', 'https://arxiv.org/abs/1904.05234v2', { identifier: 'arxiv:1904.05234v1' }), { code: 'IDENTIFIER_CONFLICT' });
  assert.equal(normalize('paper', 'https://arxiv.org/abs/1904.05234v2', { identifier: 'arxiv:1904.05234' }).canonical_key, 'arxiv:1904.05234v2');
});

test('book work and edition identity are distinct and ISBN check digits are enforced', () => {
  assert.equal(isbn13('0-306-40615-2'), '9780306406157');
  assert.equal(normalize('book', 'https://example.org/book', { identifier: 'ISBN:9780306406157' }).canonical_key, 'isbn13:edition:9780306406157');
  assert.equal(normalize('book', 'https://openlibrary.org/works/OL12345W/title').canonical_key, 'openlibrary:work:OL12345W');
  assert.notEqual(normalize('book', 'https://openlibrary.org/works/OL12345W').canonical_key, normalize('book', 'https://example.org/book', { identifier: '9780306406157' }).canonical_key);
  for (const value of ['9780306406158', '0306406153', 'not-an-isbn']) assert.throws(() => isbn13(value), { code: 'INVALID_ISBN' });
  assert.throws(() => normalize('book', 'https://openlibrary.org/works/OL12345W', { identifier: 'OL98765W' }), { code: 'IDENTIFIER_CONFLICT' });
  assert.throws(() => normalize('book', 'https://openlibrary.org/works/OL12345W', { identifier: '9780306406157' }), { code: 'IDENTITY_REVIEW_REQUIRED' });
});

test('EIP identity requires a reviewed version and does not silently change chains or commits', () => {
  const result = normalize('spec', 'https://eips.ethereum.org/EIPS/eip-7702', { version: 'abc12345' });
  assert.equal(result.canonical_key, 'eip:ethereum:7702:abc12345');
  assert.equal(normalize('spec', 'https://ercs.ethereum.org/ERCS/erc-4626', { identifier: 'eip:ethereum:4626:abc12345' }).identifiers.eip_number, '4626');
  assert.throws(() => normalize('spec', 'https://eips.ethereum.org/EIPS/eip-7702'), { code: 'VERSION_REQUIRED' });
  assert.throws(() => normalize('spec', 'https://eips.ethereum.org/EIPS/eip-7702', { version: 'main' }), { code: 'VERSION_REQUIRED' });
  assert.throws(() => normalize('spec', 'https://eips.ethereum.org/EIPS/eip-7702', { identifier: 'eip:ethereum:1:abc12345' }), { code: 'IDENTIFIER_CONFLICT' });
});

test('book URL and explicit ISBN must identify the same edition after ISBN-10 conversion', () => {
  assert.throws(() => normalize('book', 'https://openlibrary.org/isbn/9780306406157', { identifier: '9780140328721' }), { code: 'IDENTIFIER_CONFLICT' });
  assert.equal(normalize('book', 'https://openlibrary.org/isbn/9780306406157', { identifier: '0-306-40615-2' }).canonical_key, 'isbn13:edition:9780306406157');
  assert.equal(normalize('book', 'https://openlibrary.org/isbn/0306406152', { identifier: '9780306406157' }).canonical_key, 'isbn13:edition:9780306406157');
  assert.throws(() => normalize('book', 'https://openlibrary.org/isbn/9780306406157', { identifier: 'OL12345W' }), { code: 'IDENTITY_REVIEW_REQUIRED' });
  assert.equal(normalize('book', 'https://doi.org/10.1002/9781119019138', { identifier: '9781119019169' }).canonical_key, 'isbn13:edition:9781119019169');
  assert.equal(normalize('book', 'https://www.oreilly.com/library/view/mastering-ethereum-2nd/9781098168414/', { identifier: '9781098168414' }).canonical_key, 'isbn13:edition:9781098168414');
  assert.throws(() => normalize('book', 'https://www.oreilly.com/library/view/mastering-ethereum-2nd/9781098168414/', { identifier: '9780306406157' }), { code: 'IDENTIFIER_CONFLICT' });
});

test('reviewed aliases and merges resolve old IDs; splits require a choice, cycles fail and unreviewed plans do not apply', () => {
  const event = (action, from_ids, to_ids, reviewed = true) => ({ action, from_ids, to_ids, review_event_id: reviewed ? 'review_1' : null });
  assert.deepEqual(resolveLibraryIdentity('a', [event('alias', ['a'], ['b']), event('merge', ['b', 'c'], ['d'])]), { status: 'resolved', ids: ['d'] });
  assert.deepEqual(resolveLibraryIdentity('a', [event('split', ['a'], ['b', 'c'])]), { status: 'split', ids: ['b', 'c'] });
  assert.deepEqual(resolveLibraryIdentity('a', [event('alias', ['a'], ['b'], false)]), { status: 'resolved', ids: ['a'] });
  assert.throws(() => resolveLibraryIdentity('a', [event('alias', ['a'], ['b']), event('alias', ['b'], ['a'])]), { code: 'IDENTITY_CYCLE' });
});
