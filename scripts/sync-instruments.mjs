#!/usr/bin/env node
/**
 * Turn a CoinMarketCap RWA payload into the two files the instrument pages read.
 *
 *   src/data/instruments/<issuer>.json   reviewed metadata, committed
 *   src/data/instruments/quotes.json     price snapshot, committed
 *
 * Both are committed rather than written into the content cache. The cache
 * directory needs resolveGeneratedDir(), which already has two copies that must
 * stay in sync (scripts/lib/content/paths.mjs and src/data/blog.ts) — a third
 * broke the Vercel build once. These files are ~30 KB, so importing them like
 * src/data/weekly-research-localizations.json keeps the static export
 * network-free and puts every refresh in git history with its asOf.
 *
 * Usage:
 *   node scripts/sync-instruments.mjs --from <payload.json> [--issuer bstocks]
 *   node scripts/sync-instruments.mjs --from <payload.json> --metadata
 *
 * --metadata rewrites the issuer file. Reviewed fields (underlying.symbol, kind,
 * leverage) are never clobbered: they are merged from the existing file and from
 * an optional src/data/instruments/<issuer>.review.json.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'src', 'data', 'instruments');

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const has = (name) => args.includes(`--${name}`);

const issuerSlug = flag('issuer') ?? 'bstocks';
const payloadPath = flag('from') ?? process.env.CMC_RWA_PAYLOAD;

const quotesFile = path.join(OUT_DIR, 'quotes.json');
const metaFile = path.join(OUT_DIR, `${issuerSlug}.json`);
const reviewFile = path.join(OUT_DIR, `${issuerSlug}.review.json`);

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
};

const bail = (message) => {
  // A refresh that cannot reach its source must not fail the build: the pages
  // keep serving the committed snapshot and show its asOf.
  process.stderr.write(`sync-instruments: ${message}\n`);
  const existing = readJson(quotesFile);
  if (existing) {
    process.stderr.write(`sync-instruments: keeping the snapshot from ${existing.asOf}\n`);
  } else {
    process.stderr.write('sync-instruments: no snapshot on disk either\n');
  }
  process.exit(0);
};

if (!payloadPath) bail('no payload given (--from <file> or CMC_RWA_PAYLOAD)');

const payload = readJson(payloadPath);
if (!payload) bail(`could not read ${payloadPath}`);

const list = payload?.data?.cryptoCurrencyList;
if (!Array.isArray(list) || list.length === 0) bail(`no cryptoCurrencyList in ${payloadPath}`);

const asOf = payload?.status?.timestamp ?? new Date().toISOString();
const reportedTotal = Number(payload?.data?.totalCount ?? list.length);

const SUFFIX = ' Tokenized bStocks';

/** CMC omits underlyingRwaName for some rows; the display name carries it. */
const underlyingName = (row) => {
  if (row.underlyingRwaName) return { name: row.underlyingRwaName, source: 'cmc' };
  const name = row.name.endsWith(SUFFIX) ? row.name.slice(0, -SUFFIX.length) : row.name;
  return { name, source: 'derived' };
};

/**
 * Only the mechanical cases. A leveraged or inverse ETF says so in its name and
 * the multiple is part of the product, so getting it from the name is reading a
 * label, not guessing. Anything else stays 'unknown' until a human reviews it —
 * whether an underlying is a listed common stock, an ADR or still private is not
 * in this payload, and a wrong guess reads as a fact on the page.
 */
const classify = (name) => {
  const text = name.toLowerCase();
  const isEtf = /\betf\b|\btrust\b|\bindex\b|shares\b/.test(text);
  const multiple = text.match(/(\d)\s?x\b/);
  const ultraPro = /ultrapro/.test(text);
  const ultra = /\bultra\b/.test(text) && !ultraPro;
  // "Short-Term" is a futures maturity, not a short position: ProShares Ultra
  // VIX Short-Term Futures is 2x LONG volatility.
  const short = /\bbear\b|\binverse\b|\bshort\b(?![\s-]?term)/.test(text);

  let leverage;
  if (multiple) leverage = Number(multiple[1]);
  else if (ultraPro) leverage = 3;
  else if (ultra) leverage = 2;

  if (leverage !== undefined) {
    return short
      ? { kind: 'inverse-etf', leverage: -leverage }
      : { kind: 'leveraged-etf', leverage };
  }
  if (/\b-\s?adr\b|\badr\b/.test(text)) return { kind: 'adr' };
  if (isEtf) return { kind: 'etf' };
  return { kind: 'unknown' };
};

/* ── quotes ─────────────────────────────────────────────────────────────── */

const rows = {};
for (const row of list) {
  const usd = row.quotes?.find((q) => q.name === 'USD');
  if (!usd) continue;
  rows[row.symbol] = {
    // marketCap, never fullyDilluttedMarketCap: NBISB reports that as 0.
    priceUsd: usd.price,
    marketCapUsd: usd.marketCap,
    volume24hUsd: usd.volume24h,
    // CMC's own ratio. Recomputing it from volume/marketCap drifts, because the
    // two figures are stamped at slightly different times.
    turnover: usd.turnover,
    circulatingSupply: row.circulatingSupply,
    change24h: usd.percentChange24h,
    change7d: usd.percentChange7d,
    change30d: usd.percentChange30d,
    // These tokens began in June 2026, so ath/atl are since listing. Naming
    // them ath/atl on the page would read as the underlying's own history.
    listedHigh: row.ath,
    listedLow: row.atl,
  };
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(
  quotesFile,
  `${JSON.stringify({ asOf, source: 'coinmarketcap', reportedTotal, rows }, null, 2)}\n`
);

/* ── metadata ───────────────────────────────────────────────────────────── */

let metaCount = 0;
if (has('metadata')) {
  const previous = readJson(metaFile) ?? [];
  const reviewed = readJson(reviewFile) ?? {};
  const byTicker = new Map(previous.map?.((i) => [i.ticker, i]) ?? []);

  const instruments = list
    .map((row) => {
      const { name, source } = underlyingName(row);
      const guess = classify(name);
      const kept = byTicker.get(row.symbol);
      const override = reviewed[row.symbol] ?? {};

      // Presence, not truthiness: a review that deliberately sets symbol to
      // null (SpaceX is private, SK Hynix has no US ticker) must win.
      const from = (field, fallback) => {
        if (field in override) return override[field];
        if (kept?.underlying && field in kept.underlying) return kept.underlying[field];
        return fallback;
      };

      const kind = from('kind', guess.kind);
      const leverage = from('leverage', guess.leverage);
      const symbol = from('symbol', null);

      return {
        ticker: row.symbol,
        issuerSlug,
        underlying: {
          symbol,
          name: override.name ?? name,
          kind,
          ...(leverage === undefined ? {} : { leverage }),
        },
        listedAt: row.dateAdded.slice(0, 10),
        chains: ['BNB Chain'],
        cmcId: row.id,
        cmcSlug: row.slug,
        ...(source === 'derived' ? { nameSource: 'derived' } : {}),
      };
    })
    .sort((a, b) => a.ticker.localeCompare(b.ticker));

  metaCount = instruments.length;
  fs.writeFileSync(metaFile, `${JSON.stringify(instruments, null, 2)}\n`);
}

/* ── report ─────────────────────────────────────────────────────────────── */

const quoted = Object.keys(rows).length;
process.stdout.write(
  `sync-instruments: ${quoted} quotes of ${reportedTotal} reported, asOf ${asOf}\n`
);
if (quoted < reportedTotal) {
  process.stdout.write(
    `sync-instruments: ${reportedTotal - quoted} instruments have no quote and will render as —\n`
  );
}
if (has('metadata')) {
  process.stdout.write(`sync-instruments: wrote ${metaCount} instruments to ${path.relative(ROOT, metaFile)}\n`);
  const meta = readJson(metaFile) ?? [];
  const unknown = meta.filter((i) => i.underlying.kind === 'unknown');
  const nameless = meta.filter((i) => i.nameSource === 'derived');
  const unsymbolled = meta.filter((i) => i.underlying.symbol === null);
  process.stdout.write(
    `sync-instruments: needs review — ${unknown.length} kind=unknown, ${unsymbolled.length} without an underlying symbol, ${nameless.length} name derived from the token name\n`
  );
}
