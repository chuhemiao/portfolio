import test from 'node:test';
import assert from 'node:assert/strict';

import { LOCALES, localizeHref, stripLocale } from './i18n.ts';
import { instrumentRouteParams, issuerSlugsWithInstruments, getInstrument } from '../data/instruments.ts';

// localizeHref works off a whitelist, so a route it does not recognise keeps
// serving the unprefixed URL. That failure is silent: the page renders, the link
// works, and only the canonical and the hreflang set are wrong.
test('every stocks route depth localizes', () => {
  for (const locale of LOCALES) {
    assert.equal(localizeHref('/stocks', locale), `/${locale}/stocks`);
    assert.equal(localizeHref('/stocks/bstocks', locale), `/${locale}/stocks/bstocks`);
    assert.equal(localizeHref('/stocks/bstocks/SPCXB', locale), `/${locale}/stocks/bstocks/SPCXB`);
  }
});

test('localizing a stocks route is idempotent', () => {
  const once = localizeHref('/stocks/bstocks/SPCXB', 'ja');
  assert.equal(localizeHref(once, 'ja'), once);
  assert.equal(localizeHref(once, 'en'), '/en/stocks/bstocks/SPCXB');
  assert.equal(stripLocale(once), '/stocks/bstocks/SPCXB');
});

test('deeper stocks paths and article slugs stay untouched', () => {
  // Nothing renders a fourth segment; widening the pattern further would start
  // prefixing URLs that have no page.
  assert.equal(localizeHref('/stocks/bstocks/SPCXB/extra', 'ja'), '/stocks/bstocks/SPCXB/extra');
  // Article slugs carry their own language and must not be prefixed here.
  assert.equal(localizeHref('/blog/some-post', 'ja'), '/blog/some-post');
});

test('query and hash survive localization', () => {
  assert.equal(localizeHref('/stocks/bstocks?sort=turnover', 'zh-CN'), '/zh-CN/stocks/bstocks?sort=turnover');
  assert.equal(localizeHref('/stocks/bstocks#table', 'zh-CN'), '/zh-CN/stocks/bstocks#table');
});

test('only issuers with an ingested list get a page', () => {
  const slugs = issuerSlugsWithInstruments();
  assert.deepEqual(slugs, ['bstocks']);
  // The other nine issuers would render a copy of their row on /stocks.
  assert.ok(!slugs.includes('xstocks'));
});

test('instrument route params cover every instrument exactly once', () => {
  const params = instrumentRouteParams();
  assert.equal(params.length, 100);
  assert.equal(new Set(params.map((p) => `${p.issuer}/${p.ticker}`)).size, params.length);
  for (const { issuer, ticker } of params) {
    assert.ok(getInstrument(issuer, ticker), `no instrument behind /stocks/${issuer}/${ticker}`);
  }
});

test('no ticker needs URL escaping', () => {
  for (const { ticker } of instrumentRouteParams()) {
    assert.equal(encodeURIComponent(ticker), ticker, `${ticker} would need escaping in a path`);
    assert.match(ticker, /^[A-Z0-9]+$/);
  }
});

// check-i18n asserts, on the exported site, that every locale-prefixed href
// resolves to a file in out/. It only runs on a full build, so the same
// invariant is stated here at the data level: the breadcrumb and the four
// same-group links an instrument page emits must each have a route behind them.
test('every internal link the stocks pages emit has a route behind it', async () => {
  const { groupForTicker } = await import('../data/instrument-groups.ts');
  const params = instrumentRouteParams();
  const routes = new Set([
    '/stocks',
    ...issuerSlugsWithInstruments().map((issuer) => `/stocks/${issuer}`),
    ...params.map(({ issuer, ticker }) => `/stocks/${issuer}/${ticker}`),
  ]);

  for (const { issuer, ticker } of params) {
    assert.ok(routes.has(`/stocks/${issuer}`), `breadcrumb of ${ticker} points at a missing issuer page`);
    const group = groupForTicker(ticker);
    assert.ok(group, `${ticker} has no group, so its page would have no next read`);
    for (const sibling of group.tickers) {
      assert.ok(routes.has(`/stocks/${issuer}/${sibling}`), `${ticker} links to missing ${sibling}`);
    }
  }

  for (const route of routes) {
    for (const locale of LOCALES) {
      assert.ok(localizeHref(route, locale).startsWith(`/${locale}/`), `${route} does not localize`);
    }
  }
});
