import { INSTRUMENT_GROUPS } from '../src/data/instrument-groups.ts';
import { getInstruments, getQuote, QUOTES_AS_OF, QUOTES_SOURCE, QUOTES_REPORTED_TOTAL } from '../src/data/instruments.ts';

const wanted = process.argv[2];
const group = INSTRUMENT_GROUPS.find((g) => g.slug === wanted || String(g.index) === wanted);

if (!group) {
  console.error(`usage: node scripts/instrument-group-stats.mjs <group-slug|index>\n`);
  console.error('groups:');
  for (const g of INSTRUMENT_GROUPS) console.error(`  ${String(g.index).padStart(2)}  ${g.slug}  ${g.tickers.join(',')}`);
  process.exit(1);
}

const n = (v, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '—');
const usd = (v) => (v >= 1e9 ? `$${n(v / 1e9)}B` : v >= 1e6 ? `$${n(v / 1e6)}M` : `$${n(v / 1e3, 1)}K`);
const asOf = new Date(QUOTES_AS_OF);
const days = (listedAt) => Math.round((asOf - new Date(`${listedAt}T00:00:00Z`)) / 864e5);

const book = getInstruments(group.issuerSlug)
  .map((instrument) => ({ instrument, quote: getQuote(instrument.ticker) }))
  .filter((row) => row.quote);
const bookMc = book.reduce((a, r) => a + r.quote.marketCapUsd, 0);
const bookVol = book.reduce((a, r) => a + r.quote.volume24hUsd, 0);

const line = (label, value) => console.log(`${label.padEnd(26)} ${value}`);

console.log(`\n=== group ${group.index}: ${group.slug} (${group.issuerSlug}) ===`);
console.log(`snapshot ${QUOTES_AS_OF}  source ${QUOTES_SOURCE}  ${asOf.toUTCString().slice(0, 3)}`);
line('issuer reported total', `${QUOTES_REPORTED_TOTAL}, quoted here ${book.length}`);
line('article already written', group.articleSlugs ? Object.values(group.articleSlugs).join(' / ') : 'no');
console.log(`title  ${group.title.join('  |  ')}`);
console.log(`thesis zh  ${group.thesis[1]}`);

console.log('\n--- members ---');
console.log(['ticker', 'underlying', 'kind', 'listed', 'days', 'price', 'mktcap', 'vol24h', 'turn', '24h', '7d', '30d', 'high', 'low', 'width', 'fromHigh', 'inRange', 'mcShare', 'volShare'].join('\t'));
for (const ticker of group.tickers) {
  const instrument = getInstruments(group.issuerSlug).find((i) => i.ticker === ticker);
  const q = getQuote(ticker);
  if (!instrument) { console.log(`${ticker}\tNOT IN ISSUER LIST`); continue; }
  if (!q) { console.log(`${ticker}\t${instrument.underlying.name}\t${instrument.underlying.kind}\t${instrument.listedAt}\tNO QUOTE`); continue; }
  console.log([
    ticker, instrument.underlying.name, instrument.underlying.kind + (instrument.underlying.leverage ? ` ${instrument.underlying.leverage}x` : ''),
    instrument.listedAt, days(instrument.listedAt),
    `$${n(q.priceUsd)}`, usd(q.marketCapUsd), usd(q.volume24hUsd), `${n(q.turnover, 3)}x`,
    `${n(q.change24h)}%`, `${n(q.change7d)}%`, `${n(q.change30d)}%`,
    `$${n(q.listedHigh)}`, `$${n(q.listedLow)}`, `${n(q.listedHigh / q.listedLow, 3)}x`,
    `${n((q.priceUsd / q.listedHigh - 1) * 100, 1)}%`,
    `${n(((q.priceUsd - q.listedLow) / (q.listedHigh - q.listedLow)) * 100, 1)}%`,
    `${n((q.marketCapUsd / bookMc) * 100, 2)}%`, `${n((q.volume24hUsd / bookVol) * 100, 2)}%`,
  ].join('\t'));
}

const inGroup = book.filter((r) => group.tickers.includes(r.instrument.ticker));
const rest = book.filter((r) => !group.tickers.includes(r.instrument.ticker));
const agg = (rows) => {
  const mc = rows.reduce((a, r) => a + r.quote.marketCapUsd, 0);
  const vol = rows.reduce((a, r) => a + r.quote.volume24hUsd, 0);
  return { mc, vol, turn: vol / mc };
};
const g = agg(inGroup);
const r = agg(rest);
console.log('\n--- group vs rest of book ---');
line('group', `mc ${usd(g.mc)} (${n((g.mc / bookMc) * 100, 1)}%)  vol ${usd(g.vol)} (${n((g.vol / bookVol) * 100, 1)}%)  turn ${n(g.turn, 4)}x`);
line(`rest (${rest.length})`, `mc ${usd(r.mc)}  vol ${usd(r.vol)}  turn ${n(r.turn, 4)}x`);
line('whole book', `mc ${usd(bookMc)}  vol ${usd(bookVol)}  turn ${n(bookVol / bookMc, 4)}x`);
line('rest/group turnover', `${n(r.turn / g.turn, 2)}x`);

console.log('\n--- same-listing-date cohorts (counter-example hunting) ---');
for (const date of [...new Set(group.tickers.map((t) => getInstruments(group.issuerSlug).find((i) => i.ticker === t)?.listedAt))].filter(Boolean).sort()) {
  const cohort = book
    .filter((row) => row.instrument.listedAt === date)
    .map((row) => ({ t: row.instrument.ticker, kind: row.instrument.underlying.kind, w: row.quote.listedHigh / row.quote.listedLow, mc: row.quote.marketCapUsd }))
    .sort((a, b) => b.w - a.w);
  console.log(`${date} (${days(date)}d, ${cohort.length}):`);
  for (const c of cohort) console.log(`  ${group.tickers.includes(c.t) ? '*' : ' '} ${c.t.padEnd(7)} ${c.kind.padEnd(14)} width ${n(c.w, 3)}x  mc ${usd(c.mc)}`);
}

console.log('\n--- book context ---');
const mcs = book.map((row) => row.quote.marketCapUsd).sort((a, b) => b - a);
line('market cap buckets', `>=50M ${mcs.filter((v) => v >= 50e6).length}  >=25M ${mcs.filter((v) => v >= 25e6).length}  <5M ${mcs.filter((v) => v < 5e6).length}  <1M ${mcs.filter((v) => v < 1e6).length}`);
const mid = (sorted) => (sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2);
line('median / smallest', `${usd(mid(mcs.slice().reverse()))} / ${usd(mcs[mcs.length - 1])}`);
const ch30 = book.map((row) => row.quote.change30d).filter(Number.isFinite).sort((a, b) => a - b);
line('book 30d', `median ${n(mid(ch30))}%  negative ${ch30.filter((v) => v < 0).length}/${ch30.length}`);
line('kind mix', Object.entries(book.reduce((a, row) => { a[row.instrument.underlying.kind] = (a[row.instrument.underlying.kind] || 0) + 1; return a; }, {})).map(([k, v]) => `${k} ${v}`).join('  '));
line('chains', [...new Set(book.flatMap((row) => row.instrument.chains))].join(', '));

const mature = book.filter((row) => days(row.instrument.listedAt) >= 100);
console.log(`\nwidth medians among the ${mature.length} listed >=100 days (short windows are mechanically narrow):`);
const byKind = {};
for (const row of mature) (byKind[row.instrument.underlying.kind] ||= []).push(row.quote.listedHigh / row.quote.listedLow);
for (const [kind, widths] of Object.entries(byKind).sort((a, b) => a[1].length - b[1].length)) {
  const sorted = widths.sort((a, b) => a - b);
  console.log(`  ${kind.padEnd(14)} n=${String(sorted.length).padStart(2)}  median ${n(mid(sorted), 3)}x`);
}
const ranked = mature.map((row) => ({ t: row.instrument.ticker, w: row.quote.listedHigh / row.quote.listedLow })).sort((a, b) => a.w - b.w);
console.log(`  narrowest: ${ranked.slice(0, 5).map((x) => `${x.t} ${n(x.w, 3)}x`).join(', ')}`);
console.log(`  widest:    ${ranked.slice(-5).reverse().map((x) => `${x.t} ${n(x.w, 3)}x`).join(', ')}`);
for (const ticker of group.tickers) {
  const at = ranked.findIndex((x) => x.t === ticker);
  if (at >= 0) console.log(`  rank of ${ticker}: ${at + 1} of ${ranked.length}`);
}

console.log('\n--- listing months ---');
const months = {};
for (const row of book) {
  const key = row.instrument.listedAt.slice(0, 7);
  (months[key] ||= { n: 0, mc: 0, vol: 0 }).n++;
  months[key].mc += row.quote.marketCapUsd;
  months[key].vol += row.quote.volume24hUsd;
}
for (const key of Object.keys(months).sort()) {
  const m = months[key];
  console.log(`  ${key}  n=${String(m.n).padStart(2)}  mc ${usd(m.mc).padStart(9)}  turn ${n(m.vol / m.mc, 3)}x`);
}
console.log('\nreminder: no underlying reference price and no dividend multiplier in this data — do not compute a premium.\n');
