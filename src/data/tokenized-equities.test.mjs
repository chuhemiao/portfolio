import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ISSUERS,
  ISSUANCE_LABEL,
  VENUE_KIND_LABEL,
  TOP_TOKENS,
  normalizeChain,
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
