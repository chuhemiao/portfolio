import bstocks from './instruments/bstocks.json' with { type: 'json' };
import snapshot from './instruments/quotes.json' with { type: 'json' };
import type { Instrument } from './tokenized-equities';

/**
 * Access to the instrument layer. Metadata is reviewed and committed; quotes are
 * a committed snapshot refreshed by scripts/sync-instruments.mjs, so every
 * figure on a page can name the moment it was measured.
 *
 * An instrument may have no quote: CMC reports 105 and the payload carries 100.
 * Those render as dashes rather than zeros, so the count of instruments and the
 * count of priced instruments are kept separate everywhere.
 */

export type Quote = {
  priceUsd: number;
  marketCapUsd: number;
  volume24hUsd: number;
  turnover: number;
  circulatingSupply: number;
  change24h: number;
  change7d: number;
  change30d: number;
  listedHigh: number;
  listedLow: number;
};

const BY_ISSUER: Record<string, Instrument[]> = {
  bstocks: bstocks as Instrument[],
};

const QUOTE_ROWS = snapshot.rows as Record<string, Quote>;

export const QUOTES_AS_OF = snapshot.asOf;
export const QUOTES_SOURCE = snapshot.source;
export const QUOTES_REPORTED_TOTAL = snapshot.reportedTotal;

export const getInstruments = (issuerSlug: string): Instrument[] =>
  BY_ISSUER[issuerSlug] ?? [];

export const getInstrumentCount = (issuerSlug: string) => getInstruments(issuerSlug).length;

export const getInstrument = (issuerSlug: string, ticker: string) =>
  getInstruments(issuerSlug).find((instrument) => instrument.ticker === ticker);

export const getQuote = (ticker: string): Quote | undefined => QUOTE_ROWS[ticker];

export type IssuerTotals = {
  instrumentCount: number;
  quotedCount: number;
  marketCapUsd: number;
  volume24hUsd: number;
  turnover: number;
  firstListedAt: string;
  lastListedAt: string;
};

export function getIssuerTotals(issuerSlug: string): IssuerTotals | undefined {
  const instruments = getInstruments(issuerSlug);
  if (instruments.length === 0) return undefined;

  let marketCapUsd = 0;
  let volume24hUsd = 0;
  let quotedCount = 0;

  for (const instrument of instruments) {
    const quote = getQuote(instrument.ticker);
    if (!quote) continue;
    marketCapUsd += quote.marketCapUsd;
    volume24hUsd += quote.volume24hUsd;
    quotedCount += 1;
  }

  const listings = instruments.map((instrument) => instrument.listedAt).sort();

  return {
    instrumentCount: instruments.length,
    quotedCount,
    marketCapUsd,
    volume24hUsd,
    // CMC gives a ratio per instrument but none for a book, so this one is
    // computed — the only turnover figure on the site that is.
    turnover: marketCapUsd === 0 ? 0 : volume24hUsd / marketCapUsd,
    firstListedAt: listings[0],
    lastListedAt: listings[listings.length - 1],
  };
}

export type InstrumentCount = { value: number; counted: boolean };

/**
 * Prefer what we can count. `counted: false` means the figure is the issuer's
 * own claim and nothing on this site can open it.
 */
export function instrumentCountFor(issuer: {
  slug: string;
  reportedInstrumentCount?: number;
}): InstrumentCount | undefined {
  const counted = getInstrumentCount(issuer.slug);
  if (counted > 0) return { value: counted, counted: true };
  if (issuer.reportedInstrumentCount === undefined) return undefined;
  return { value: issuer.reportedInstrumentCount, counted: false };
}

/**
 * Only issuers we have an instrument list for get a page. The other nine would
 * render a copy of their expanded row on /stocks and nothing more.
 */
export const issuerSlugsWithInstruments = () =>
  Object.keys(BY_ISSUER).filter((slug) => BY_ISSUER[slug].length > 0);

export const instrumentRouteParams = () =>
  issuerSlugsWithInstruments().flatMap((issuer) =>
    getInstruments(issuer).map((instrument) => ({ issuer, ticker: instrument.ticker }))
  );
