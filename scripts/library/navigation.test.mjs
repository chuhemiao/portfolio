import test from 'node:test';
import assert from 'node:assert/strict';
import { libraryPathScope, libraryDocumentNavigation, librarySafeReferrer } from '../../src/lib/library/navigation.ts';

test('analytics path classification covers legacy, every locale, details, missing and encoded routes', () => {
  for (const path of ['/library', '/library/', '/library/items/missing', '/zh-CN/library', '/en/library/items/foo', '/ja/library/not-real', '/%6cibrary', '/%65n/%6cibrary/items/foo', '/en%2flibrary']) assert.equal(libraryPathScope(path), 'library', path);
  for (const path of [null, '', '/en/%zz', '/library?secret', '/en/%256cibrary']) assert.equal(libraryPathScope(path), 'unknown', String(path));
  for (const path of ['/', '/en', '/en/blog/foo', '/libraryish', '/en/research']) assert.equal(libraryPathScope(path), 'other', path);
});

test('entering, leaving or resolving a Library path requires a document navigation', () => {
  assert.equal(libraryDocumentNavigation('/en/blog/foo', '/en/library?q=private#results'), true);
  assert.equal(libraryDocumentNavigation('/ja/library', '/ja/topics/l1-l2'), true);
  assert.equal(libraryDocumentNavigation('/library/items/missing', '/en'), true);
  assert.equal(libraryDocumentNavigation(null, '/en/research'), true);
  assert.equal(libraryDocumentNavigation('/en/blog/foo', '/en/topics'), false);
});

test('a Library referrer can only reach analytics as its origin root without path, query or fragment', () => {
  for (const referrer of ['https://kkdemian.com/en/library?q=private&page=2#saved', 'https://kkdemian.com/%6cibrary/items/foo?x=y', 'https://kkdemian.com/ja/library/missing?q=secret', 'https://kkdemian.com/%zz?q=secret']) assert.equal(librarySafeReferrer(referrer), 'https://kkdemian.com/');
  assert.equal(librarySafeReferrer('https://kkdemian.com/en/blog/foo?q=existing'), undefined);
  assert.equal(librarySafeReferrer(''), undefined);
  assert.equal(librarySafeReferrer('invalid referrer'), '');
});
