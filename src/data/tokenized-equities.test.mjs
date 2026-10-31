import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ISSUERS,
  ISSUANCE_LABEL,
  VENUE_KIND_LABEL,
  TOP_TOKENS,
  normalizeChain,
  buildExchangeIndex,
} from './tokenized-equities.ts';

const VENUE_KINDS = new Set(['cex', 'dex', 'lending', 'aggregator', 'broker-app']);
const ISSUANCE_MODELS = new Set(['exchange-self', 'exchange-onchain', 'broker-self', 'independent', 'unknown']);

test('every issuer declares a known issuance model', () => {
  for (const issuer of ISSUERS) {
    assert.ok(ISSUANCE_MODELS.has(issuer.issuanceModel), `${issuer.slug}: ${issuer.issuanceModel}`);
    assert.ok(ISSUANCE_LABEL[issuer.issuanceModel], `${issuer.slug} has no label`);
  }
});

test('every venue is typed, and named once per issuer', () => {
  for (const issuer of ISSUERS) {
    const seen = new Set();
    for (const venue of issuer.venues) {
      assert.ok(VENUE_KINDS.has(venue.kind), `${issuer.slug}/${venue.name}: ${venue.kind}`);
      assert.ok(VENUE_KIND_LABEL[venue.kind], `${venue.kind} has no label`);
      assert.ok(!seen.has(venue.name), `${issuer.slug} lists ${venue.name} twice`);
      seen.add(venue.name);
    }
  }
});

// Aave and Morpho take these tokens as collateral and are not places to buy.
// Typing them as lending is what lets the UI keep them out of the buy venues.
test('lending venues are never marked as operated by the issuer', () => {
  for (const issuer of ISSUERS) {
    for (const venue of issuer.venues) {
      if (venue.kind !== 'lending') continue;
      assert.notEqual(venue.operatedByIssuer, true, `${issuer.slug}/${venue.name}`);
    }
  }
});

// A self-issuing exchange sells on its own venue; that is what makes it self-issued.
test('self-issuing exchanges and brokers run at least one of their own venues', () => {
  for (const issuer of ISSUERS) {
    if (issuer.issuanceModel !== 'exchange-self' && issuer.issuanceModel !== 'broker-self') continue;
    assert.ok(
      issuer.venues.some((venue) => venue.operatedByIssuer),
      `${issuer.slug} is ${issuer.issuanceModel} but runs none of its venues`
    );
  }
});

// Coinbase issues its own tokens but lists them nowhere it operates.
test('exchange-onchain issuers run none of their venues', () => {
  for (const issuer of ISSUERS) {
    if (issuer.issuanceModel !== 'exchange-onchain') continue;
    assert.ok(
      issuer.venues.every((venue) => !venue.operatedByIssuer),
      `${issuer.slug} is on-chain only but operates a venue`
    );
    assert.ok(issuer.venues.every((venue) => venue.kind !== 'cex'), `${issuer.slug} lists a CEX`);
  }
});

test('chain names are already normalised in the data', () => {
  for (const issuer of ISSUERS) {
    for (const chain of issuer.chains) {
      assert.equal(chain, normalizeChain(chain), `${issuer.slug} stores the alias ${chain}`);
    }
  }
});

test('normalizeChain folds the BSC alias and leaves others alone', () => {
  assert.equal(normalizeChain('BSC'), 'BNB Chain');
  assert.equal(normalizeChain('BNB Chain'), 'BNB Chain');
  assert.equal(normalizeChain('Solana'), 'Solana');
});

test('token rows point at issuers that exist', () => {
  const slugs = new Set(ISSUERS.map((issuer) => issuer.slug));
  for (const token of TOP_TOKENS) {
    if (token.issuerSlug === null) continue;
    assert.ok(slugs.has(token.issuerSlug), `${token.ticker} -> ${token.issuerSlug}`);
  }
});

// An unrated grade and an unknown issuer are different axes. Backpack is
// unrated because its wrapper, custody, redemption and reserves are all
// undisclosed, yet it is plainly a named exchange issuing on its own venue --
// unlike Remora, where the issuing entity itself cannot be identified. So the
// invariant is only that an unknown issuance model never claims self-operation.
test('an unknown issuance model claims no self-operated venue', () => {
  for (const issuer of ISSUERS) {
    if (issuer.issuanceModel !== 'unknown') continue;
    assert.ok(
      issuer.venues.every((venue) => !venue.operatedByIssuer),
      `${issuer.slug} has an unknown issuer but claims to run ${issuer.venues.find((v) => v.operatedByIssuer)?.name}`
    );
  }
});

// ── buildExchangeIndex ───────────────────────────────────────────────────────

test('the exchange index covers exactly the venues the issuers name', () => {
  const index = buildExchangeIndex(ISSUERS);
  const fromIssuers = new Set(ISSUERS.flatMap((issuer) => issuer.venues.map((venue) => venue.name)));
  const fromIndex = new Set(index.map((view) => view.venue));
  assert.deepEqual([...fromIndex].sort(), [...fromIssuers].sort());
});

test('every issuer that names a venue appears under it', () => {
  const index = buildExchangeIndex(ISSUERS);
  for (const issuer of ISSUERS) {
    for (const venue of issuer.venues) {
      const view = index.find((candidate) => candidate.venue === venue.name);
      assert.ok(view, `${venue.name} is missing from the index`);
      assert.ok(
        view.issuers.some((entry) => entry.slug === issuer.slug),
        `${issuer.slug} is missing under ${venue.name}`
      );
    }
  }
});

// The same issuer is reachable at several venues, so this column overlaps by
// design. Asserting the overlap keeps anyone from "fixing" it into a total.
test('reachable value is not additive across venues', () => {
  const index = buildExchangeIndex(ISSUERS);
  const summed = index.reduce((total, view) => total + view.reachableOnchainValueUsd, 0);
  const market = ISSUERS.reduce((total, issuer) => total + (issuer.onchainValueUsd ?? 0), 0);
  assert.ok(summed > market, 'expected venue sums to double-count multi-venue issuers');

  const xstocks = ISSUERS.find((issuer) => issuer.slug === 'xstocks');
  const venuesCarryingIt = index.filter((view) => view.issuers.some((entry) => entry.slug === 'xstocks'));
  assert.equal(venuesCarryingIt.length, xstocks.venues.length);
  for (const view of venuesCarryingIt) {
    assert.ok(view.reachableOnchainValueUsd >= xstocks.onchainValueUsd);
  }
});

test('a venue counts as issuer-operated only when every issuer there self-operates', () => {
  const index = buildExchangeIndex(ISSUERS);
  for (const view of index) {
    const all = ISSUERS.every((issuer) =>
      issuer.venues
        .filter((venue) => venue.name === view.venue)
        .every((venue) => venue.operatedByIssuer === true)
    );
    assert.equal(view.operatedByIssuer, all, view.venue);
  }
  assert.equal(index.find((view) => view.venue === 'Kraken').operatedByIssuer, true);
  assert.equal(index.find((view) => view.venue === 'Bybit').operatedByIssuer, false);
});

test('venues and their issuers are both sorted by size, descending', () => {
  const index = buildExchangeIndex(ISSUERS);
  for (let i = 1; i < index.length; i += 1) {
    assert.ok(index[i - 1].reachableOnchainValueUsd >= index[i].reachableOnchainValueUsd);
  }
  for (const view of index) {
    for (let i = 1; i < view.issuers.length; i += 1) {
      assert.ok((view.issuers[i - 1].onchainValueUsd ?? 0) >= (view.issuers[i].onchainValueUsd ?? 0));
    }
  }
});

test('an issuer with no venues stays out of the index', () => {
  const index = buildExchangeIndex(ISSUERS);
  const placed = new Set(index.flatMap((view) => view.issuers.map((entry) => entry.slug)));
  for (const issuer of ISSUERS) {
    assert.equal(placed.has(issuer.slug), issuer.venues.length > 0, issuer.slug);
  }
});

test('buildExchangeIndex handles an empty roster', () => {
  assert.deepEqual(buildExchangeIndex([]), []);
});

// /stocks renders the quote snapshot for every ingested issuer and these
// hand-collected rows for the rest. A ticker in both places puts two different
// market caps for the same token on one page, which is how CRCLB read as both
// $143.4M and $147.23M before the instrument table moved onto /stocks.
test('hand-collected token rows never cover an ingested issuer', async () => {
  const { issuerSlugsWithInstruments, getAllInstruments } = await import('./instruments.ts');
  const ingested = new Set(issuerSlugsWithInstruments());
  const tickers = new Set(getAllInstruments().map((instrument) => instrument.ticker));

  for (const token of TOP_TOKENS) {
    assert.ok(
      !ingested.has(token.issuerSlug),
      `${token.ticker} belongs to ${token.issuerSlug}, whose full list is rendered from the snapshot`
    );
    assert.ok(!tickers.has(token.ticker), `${token.ticker} is quoted in the snapshot and must not be duplicated here`);
  }
});

test('the book totals are the sum of the ingested instruments', async () => {
  const { getAllInstruments, getBookTotals, getQuote, issuerSlugsWithInstruments } = await import('./instruments.ts');
  const book = getBookTotals();
  const instruments = getAllInstruments();

  assert.equal(book.instrumentCount, instruments.length);
  assert.equal(book.issuerCount, issuerSlugsWithInstruments().length);

  let marketCap = 0;
  let volume = 0;
  let quoted = 0;
  for (const instrument of instruments) {
    const quote = getQuote(instrument.ticker);
    if (!quote) continue;
    marketCap += quote.marketCapUsd;
    volume += quote.volume24hUsd;
    quoted += 1;
  }
  assert.equal(book.quotedCount, quoted);
  assert.equal(book.marketCapUsd, marketCap);
  assert.equal(book.volume24hUsd, volume);
  assert.equal(book.turnover, volume / marketCap);
  // Turnover is a ratio of a 24h flow to a stock, so it is not a percentage and
  // can exceed 1. It must still be finite and positive for a live book.
  assert.ok(book.turnover > 0 && Number.isFinite(book.turnover));
  assert.ok(book.firstListedAt <= book.lastListedAt);
});
