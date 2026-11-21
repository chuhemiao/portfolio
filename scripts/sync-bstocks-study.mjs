import { readFile, stat } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { BINANCE_MARKET_SOURCE, adjustedHistory, fields, matchedPremium, nativeMarket, secFundamentals, utcTime } from '../src/lib/bstocks-study.ts';
import { writeSnapshot } from './lib/write-snapshot.mjs';

const { values } = parseArgs({
  options: { market: { type: 'string' }, sec: { type: 'string' }, underlying: { type: 'string' }, 'dry-run': { type: 'boolean' } },
});
if (!values.market && !values.sec && !values.underlying) throw new Error('Supply --market, --sec or --underlying with an input JSON file');

const resolveRepo = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));
const instruments = resolveRepo('src/data/instruments/bstocks.json');
const secDestination = resolveRepo('src/data/instruments/bstocks-sec.json');
const localDestination = resolveRepo('.generated/bstocks-study.json');

async function json(path, optional = false) {
  try {
    if ((await stat(path)).size > 90 * 1024 * 1024) throw new Error('Capture exceeds 90 MiB');
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (optional && error.code === 'ENOENT') return {};
    throw error;
  }
}

const catalog = await json(instruments);
const byTicker = new Map(catalog.map((instrument) => [instrument.ticker, instrument]));
const oldSec = await json(secDestination, true);
const seed = await json(`${dirname(instruments)}/bstocks-primary-facts.json`);
const oldLocal = await json(localDestination, true);
const local = { version: 1, rows: { ...fields(oldLocal.rows) } };
const sec = { ...oldSec };

function captureTime(value) {
  const time = utcTime(value);
  if (time === undefined || time > Date.now() + 60_000) throw new Error('Invalid capture timestamp');
  return time;
}

function updateLocal(instrument, patch) {
  const ticker = instrument.ticker;
  const isin = instrument.listing.isin;
  local.rows[ticker] = { ...(local.rows[ticker]?.isin === isin ? local.rows[ticker] : {}), isin, ...patch };
}

let marketCount = 0;
let secCount = 0;
let underlyingCount = 0;
if (values.market) {
  const current = await json(values.market);
  const capturedAt = captureTime(current.asOf);
  if (current.source !== BINANCE_MARKET_SOURCE) throw new Error('Invalid market capture source');
  for (const [ticker, raw] of Object.entries(fields(current.rows))) {
    const instrument = byTicker.get(ticker);
    if (!instrument?.listing) continue;
    const market = nativeMarket(raw, ticker, current.asOf);
    if (!market) continue;
    const old = local.rows[ticker]?.isin === instrument.listing.isin ? local.rows[ticker].market : undefined;
    if ((utcTime(old?.asOf) ?? 0) > capturedAt) continue;
    updateLocal(instrument, { market: {
      ...market,
      quote: market.quote ?? old?.quote ?? null,
      book: market.status === 'TRADING' ? market.book ?? old?.book ?? null : null,
      closes: market.closes.length ? market.closes : old?.closes ?? [],
    } });
    marketCount += 1;
  }
  if (!marketCount) throw new Error('No current market rows passed validation');
}

if (values.sec) {
  const current = await json(values.sec);
  const capturedAt = captureTime(current.asOf);
  if (current.indexUrl !== 'https://www.sec.gov/files/company_tickers_exchange.json') throw new Error('Invalid SEC roster source');
  for (const [ticker, raw] of Object.entries(fields(current.rows))) {
    const instrument = byTicker.get(ticker);
    if (!instrument?.listing || !instrument.underlying.symbol) continue;
    const result = secFundamentals(raw, ticker, instrument.underlying.symbol, current.asOf.slice(0, 10));
    if (!result || (sec[ticker]?.isin === instrument.listing.isin && (utcTime(sec[ticker].observedAt) ?? 0) > capturedAt)) continue;
    if (!['common-stock', 'adr'].includes(instrument.underlying.kind)) result.filings = [];
    const old = sec[ticker]?.isin === instrument.listing.isin && sec[ticker]?.symbol === result.symbol && sec[ticker].cik === result.cik ? sec[ticker] : undefined;
    if (old?.filings.length && !result.filings.length) continue;
    sec[ticker] = { ...result, isin: instrument.listing.isin, observedAt: current.asOf };
    secCount += 1;
  }
  if (!secCount) throw new Error('No current SEC rows passed validation');
}

if (values.underlying) {
  const current = await json(values.underlying);
  for (const [ticker, raw] of Object.entries(fields(current.rows))) {
    const instrument = byTicker.get(ticker);
    if (!instrument?.listing || !instrument.underlying.symbol) throw new Error(`Unknown underlying for ${ticker}`);
    const symbol = instrument.underlying.symbol;
    const entry = fields(raw);
    const trustedSec = sec[ticker]?.isin === instrument.listing.isin && sec[ticker].symbol === symbol ? sec[ticker] : undefined;
    const exchange = instrument.underlying.exchange ?? (seed[ticker]?.symbol === symbol ? seed[ticker].exchange : trustedSec?.exchange);
    if (!exchange) throw new Error(`Unknown underlying venue for ${ticker}`);
    if (entry.history !== undefined) {
      const history = adjustedHistory(entry.history, symbol, exchange);
      if (!history) throw new Error(`Invalid adjusted history for ${ticker}`);
      const capturedAt = captureTime(history.observedAt);
      const previous = local.rows[ticker];
      const saved = previous?.isin === instrument.listing.isin ? previous.history : undefined;
      if (saved?.symbol === symbol && saved.exchange === exchange && Array.isArray(saved.closes)) {
        const current = adjustedHistory({
          ...saved,
          closes: saved.closes.map((row) => {
            const { day, close, volume } = fields(row);
            return { day, adjustedClose: close, volume };
          }),
        }, symbol, exchange);
        if (current && capturedAt < utcTime(current.observedAt)) throw new Error(`Stale adjusted history for ${ticker}`);
        if (current && (history.closes.length < current.closes.length || history.closes.at(-1).day < current.closes.at(-1).day)) {
          throw new Error(`Reduced adjusted history coverage for ${ticker}`);
        }
      }
      updateLocal(instrument, { history });
    }
    if (entry.premium !== undefined) {
      const premium = matchedPremium(entry.premium, ticker, symbol, exchange);
      if (!premium) throw new Error(`Invalid matched premium for ${ticker}`);
      if (captureTime(premium.at) < (utcTime(local.rows[ticker]?.premium?.at) ?? 0)) throw new Error(`Stale matched premium for ${ticker}`);
      updateLocal(instrument, { premium });
    }
    if (entry.history === undefined && entry.premium === undefined) throw new Error(`Empty underlying capture for ${ticker}`);
    underlyingCount += 1;
  }
  if (!underlyingCount) throw new Error('No underlying rows passed validation');
}

if (!values['dry-run']) {
  if (values.market || values.underlying) await writeSnapshot(localDestination, local);
  if (values.sec) await writeSnapshot(secDestination, sec);
}
console.log(`Stocks study ${values['dry-run'] ? 'validated without writing' : 'updated'}: ${marketCount} local market, ${secCount} public SEC, ${underlyingCount} local underlying`);
