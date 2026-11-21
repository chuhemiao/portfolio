import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { adjustedHistory, calendarDay, fields } from '../src/lib/bstocks-study.ts';
import { writeSnapshot } from './lib/write-snapshot.mjs';

const endpoint = 'https://api.twelvedata.com/time_series';
const source = 'https://twelvedata.com/docs#time-series';
const mics = {
  NASDAQ: ['XNAS', 'XNGS', 'XNMS', 'XNCM'],
  NYSE: ['XNYS'],
  'NYSE ARCA': ['ARCX'],
  'CBOE BZX': ['BATS'],
};
const dayMs = 86_400_000;

export function twelveDataHistory(input, symbol, exchange, from, to, observedAt) {
  const result = fields(input);
  const meta = fields(result.meta);
  if (result.status !== 'ok' || meta.symbol !== symbol || meta.currency !== 'USD' || meta.interval !== '1day' ||
    !Object.hasOwn(mics, exchange) || !mics[exchange].includes(meta.mic_code) ||
    !Array.isArray(result.values) || !result.values.length || result.values.length > 1000) return null;

  const closes = [];
  for (const entry of result.values) {
    const { datetime: day, close } = fields(entry);
    if (!calendarDay(day) || day < from || day > to || typeof close !== 'string' || !/^\d+(?:\.\d+)?$/.test(close)) return null;
    closes.push({ day, adjustedClose: Number(close) });
  }
  closes.sort((a, b) => a.day.localeCompare(b.day));
  const history = { symbol, exchange, observedAt, currency: 'USD', adjustment: 'split-and-dividend', source, closes };
  return adjustedHistory(history, symbol, exchange) ? history : null;
}

async function requestHistory(key, symbol, from, exclusiveEnd, outputsize) {
  const query = new URLSearchParams({
    symbol, interval: '1day', adjust: 'all', start_date: from, end_date: exclusiveEnd, outputsize: String(outputsize),
  });
  let response;
  try {
    response = await fetch(`${endpoint}?${query}`, {
      headers: { Authorization: `apikey ${key}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
      redirect: 'error',
    });
  } catch {
    throw new Error('Twelve Data request failed or timed out');
  }
  if (response.status === 429) throw new Error('Twelve Data rate-limited the request');
  if (!response.ok) throw new Error(`Twelve Data HTTP ${response.status}`);
  const result = await response.json().catch(() => { throw new Error('Twelve Data returned invalid JSON'); });
  if (result?.status === 'error' && [401, 403, 429, '401', '403', '429'].includes(result.code)) {
    throw new Error('Twelve Data rejected authentication, market access or request quota');
  }
  return result;
}

async function capture() {
  let values;
  try {
    ({ values } = parseArgs({ options: {
      ticker: { type: 'string', multiple: true }, from: { type: 'string' }, to: { type: 'string' }, out: { type: 'string' },
    } }));
  } catch {
    throw new Error('Supply --ticker <bStock> --from <YYYY-MM-DD> --to <YYYY-MM-DD> --out <capture.json>');
  }
  const key = process.env.TWELVE_DATA_API_KEY;
  if (!key || !/^[A-Za-z0-9_-]{1,128}$/.test(key)) throw new Error('Set TWELVE_DATA_API_KEY in the environment');
  const { ticker: tickers, from, to, out } = values;
  const observedAt = new Date().toISOString();
  const count = (Date.parse(to) - Date.parse(from)) / dayMs + 1;
  if (!tickers?.length || new Set(tickers).size !== tickers.length || !tickers.every((ticker) => /^[A-Z0-9]{1,16}$/.test(ticker)) ||
    !out || !calendarDay(from) || !calendarDay(to) || to >= observedAt.slice(0, 10) || count < 1 || count > 1000) {
    throw new Error('Supply unique bStock tickers, a completed date range up to 1000 days and a capture path');
  }

  const instruments = new URL('../src/data/instruments/', import.meta.url);
  const [catalog, primary, sec] = await Promise.all(['bstocks.json', 'bstocks-primary-facts.json', 'bstocks-sec.json'].map(async (name) =>
    JSON.parse(await readFile(new URL(name, instruments), 'utf8'))));
  const bindings = tickers.map((ticker) => {
    const instrument = catalog.find((item) => item.ticker === ticker);
    const symbol = instrument?.underlying.symbol;
    const verifiedSec = sec[ticker]?.symbol === symbol && sec[ticker]?.isin === instrument?.listing.isin ? sec[ticker] : undefined;
    const exchange = instrument?.underlying.exchange ?? (primary[ticker]?.symbol === symbol ? primary[ticker]?.exchange : verifiedSec?.exchange);
    if (!symbol || !exchange || !Object.hasOwn(mics, exchange)) throw new Error(`Unverified Twelve Data binding for ${ticker}`);
    return { ticker, symbol, exchange };
  });

  const rows = {};
  const exclusiveEnd = new Date(Date.parse(to) + dayMs).toISOString().slice(0, 10);
  for (const { ticker, symbol, exchange } of bindings) {
    const response = await requestHistory(key, symbol, from, exclusiveEnd, count);
    const history = twelveDataHistory(response, symbol, exchange, from, to, observedAt);
    if (history) rows[ticker] = { history };
    else console.warn(`${ticker}: no valid USD daily history for the verified listing`);
  }
  if (!Object.keys(rows).length) throw new Error('No Twelve Data history passed validation');
  await writeSnapshot(out, { rows });
  console.log(`Captured ${Object.keys(rows).length}/${tickers.length} adjusted bStock histories`);
}

if (import.meta.main) {
  try {
    await capture();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
