import { readFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { parseArgs } from 'node:util';
import { writeSnapshot } from './lib/write-snapshot.mjs';

const { values } = parseArgs({ options: { out: { type: 'string' } } });
if (!values.out) throw new Error('Supply --out <capture.json>');

const indexUrl = 'https://www.sec.gov/files/company_tickers_exchange.json';
const factRoot = 'https://data.sec.gov/api/xbrl/companyfacts';
const sources = {
  'us-gaap': ['Revenues', 'RevenueFromContractWithCustomerExcludingAssessedTax', 'SalesRevenueNet', 'NetIncomeLoss', 'ProfitLoss',
    'OperatingIncomeLoss', 'NetCashProvidedByUsedInOperatingActivities', 'EarningsPerShareDiluted'],
  'ifrs-full': ['Revenue', 'ProfitLoss', 'ProfitLossFromOperatingActivities', 'CashFlowsFromUsedInOperatingActivities',
    'DilutedEarningsLossPerShare'],
};
const userAgent = process.env.SEC_USER_AGENT || 'kkdemian.com Stock Research (https://kkdemian.com)';
const catalog = JSON.parse(await readFile(new URL('../src/data/instruments/bstocks.json', import.meta.url), 'utf8'));
let stopped = false;

async function get(url) {
  if (stopped) throw new Error('SEC rate-limited');
  const response = await fetch(url, { headers: { 'User-Agent': userAgent, Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
  if (response.status === 429) stopped = true;
  if (!response.ok) throw new Error(`SEC HTTP ${response.status}`);
  return response.json();
}

const { fields, data } = await get(indexUrl);
const field = (name) => fields.indexOf(name);
if (!Array.isArray(data) || ['ticker', 'cik', 'exchange'].some((name) => field(name) < 0)) throw new Error('Invalid SEC ticker index');
const index = new Map();
for (const entry of data) {
  const symbol = String(entry[field('ticker')]).replace('-', '.');
  const cik = entry[field('cik')];
  if (!index.has(symbol)) index.set(symbol, new Map());
  index.get(symbol).set(cik, entry[field('exchange')]);
}

const asOf = new Date().toISOString();
const firstYear = Number(asOf.slice(0, 4)) - 4;
const candidates = catalog.flatMap(({ ticker, underlying }) => {
  if (!underlying.symbol) return [];
  const matches = index.get(underlying.symbol);
  if (matches?.size !== 1) return [];
  const [entry] = matches;
  return [{ ticker, symbol: underlying.symbol, cik: entry[0], exchange: entry[1], company: ['common-stock', 'adr'].includes(underlying.kind) }];
});
const rows = {};
const failures = [];
for (let offset = 0; offset < candidates.length && !stopped; offset += 3) {
  await Promise.all(candidates.slice(offset, offset + 3).map(async (item) => {
    const { cik, ticker, company } = item;
    if (!Number.isSafeInteger(cik) || cik < 1) return;
    const source = `${factRoot}/CIK${String(cik).padStart(10, '0')}.json`;
    try {
      const facts = {};
      if (company && ticker !== 'ANTB') {
        const raw = await get(source);
        const returned = typeof raw.cik === 'string' && /^\d{1,10}$/.test(raw.cik) ? Number(raw.cik) : raw.cik;
        if (returned !== cik) throw new Error('SEC CompanyFacts identity mismatch');
        for (const [taxonomy, tags] of Object.entries(sources)) {
          const collected = {};
          for (const tag of tags) {
            const units = raw.facts?.[taxonomy]?.[tag]?.units;
            const recent = Object.fromEntries(Object.entries(units ?? {}).map(([unit, entries]) => [unit,
              entries.filter((entry) => Number(entry.end?.slice(0, 4)) >= firstYear),
            ]));
            if (Object.keys(recent).length) collected[tag] = { units: recent };
          }
          facts[taxonomy] = collected;
        }
      }
      rows[ticker] = { ...item, source, facts };
    } catch (error) {
      failures.push({ ticker, reason: error.message });
    }
  }));
  await delay(420);
}

await writeSnapshot(values.out, { asOf, indexUrl, rows, failures });
console.log(`Captured ${Object.keys(rows).length}/${candidates.length} SEC mappings; ${failures.length} failed; read limited: ${stopped}`);
