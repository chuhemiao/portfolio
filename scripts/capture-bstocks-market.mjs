import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { writeSnapshot } from './lib/write-snapshot.mjs';

const API = 'https://data-api.binance.vision/api/v3';
const { values } = parseArgs({
  options: { out: { type: 'string' }, pilots: { type: 'boolean', default: false } },
});
if (!values.out) throw new Error('Supply --out <capture.json>');

const tickers = values.pilots
  ? ['CRCLB', 'MUUB', 'ANTB']
  : JSON.parse(await readFile(new URL('../src/data/instruments/bstocks.json', import.meta.url), 'utf8'))
      .map((row) => row.ticker);
if (tickers.length > 200 || new Set(tickers).size !== tickers.length || tickers.some((ticker) => !/^[A-Z0-9]{1,16}$/.test(ticker))) {
  throw new Error('Invalid capture roster');
}

let stopped = false;
async function get(path, query) {
  if (stopped) throw new Error('Rate-limited');
  const response = await fetch(`${API}/${path}?${new URLSearchParams(query)}`, { signal: AbortSignal.timeout(8000) });
  if (response.status === 429 || response.status === 418) stopped = true;
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}

const symbols = tickers.map((ticker) => `${ticker}USDT`);
const exchangeInfo = await get('exchangeInfo', { symbols: JSON.stringify(symbols), showPermissionSets: 'false' });
if (!Array.isArray(exchangeInfo.symbols) || exchangeInfo.symbols.length !== symbols.length) {
  throw new Error('Incomplete Binance exchange-info response');
}
const exchangeBySymbol = new Map(exchangeInfo.symbols.map((row) => [row.symbol, row]));
const rawTickers = await get('ticker/24hr', { symbols: JSON.stringify(symbols) });
if (!Array.isArray(rawTickers)) throw new Error('Invalid Binance ticker response');
const tickerBySymbol = new Map(rawTickers.map((row) => [row.symbol, row]));
const asOf = new Date().toISOString();
const rows = {};

for (let offset = 0; offset < tickers.length && !stopped; offset += 5) {
  await Promise.all(tickers.slice(offset, offset + 5).map(async (ticker) => {
    const symbol = `${ticker}USDT`;
    const exchange = exchangeBySymbol.get(symbol);
    if (exchange?.baseAsset !== ticker || exchange.quoteAsset !== 'USDT' || exchange.isSpotTradingAllowed !== true) return;
    const [candles, depth] = await Promise.allSettled([
      get('klines', { symbol, interval: '1d', limit: '251' }),
      exchange.status === 'TRADING' ? get('depth', { symbol, limit: '100' }) : Promise.resolve(null),
    ]);
    rows[ticker] = {
      exchange,
      ticker24h: tickerBySymbol.get(symbol) ?? null,
      candles: candles.status === 'fulfilled' ? candles.value : null,
      depth: depth.status === 'fulfilled' ? depth.value : null,
      depthObservedAt: new Date().toISOString(),
    };
  }));
}

await writeSnapshot(values.out, { asOf, source: API, rows });
console.log(`Captured ${Object.keys(rows).length}/${tickers.length} markets; read limited: ${stopped}`);
