import { mkdir, open, rename, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === './watch-client-data' && context.parentURL?.endsWith('/src/lib/watch-data.ts')) {
      return nextResolve('./watch-client-data.ts', context);
    }
    return nextResolve(specifier, context);
  },
});
const { collectWatchData } = await import('../src/lib/watch-data.ts');
const { isWatchData } = await import('../src/lib/watch-client-data.ts');
const { isBtcScoreData } = await import('../src/lib/btc-score-client-data.ts');

const listingSources = [
  'https://www.okx.com/api/v5/public/instruments?instType=SPOT',
  'https://www.okx.com/api/v5/public/instruments?instType=SWAP',
  'https://api.bybit.com/v5/market/instruments-info?category=linear&limit=1000',
  'https://api.bitget.com/api/v2/spot/public/symbols',
  'https://api.coinbase.com/api/v3/brokerage/market/products?product_type=SPOT&limit=500',
  'https://fapi.binance.com/fapi/v1/exchangeInfo',
];

export async function syncWatchSnapshot({ destination = resolve('public/data/watch-data.json'), collect = collectWatchData } = {}) {
  const data = await collect(30);
  const successful = new Set(data?.sources?.successful ?? []);
  const liveListingSources = listingSources.filter(source => successful.has(source)).length;
  const recentCount = data?.listings?.filter(coin => coin.firstSeenAt !== null).length ?? 0;
  const pricedCount = data?.listings?.filter(coin => coin.priceUsdt !== null).length ?? 0;
  const age = Date.now() - Date.parse(data?.generatedAt);
  if (!isWatchData(data) || liveListingSources < 3 || recentCount < 1 || pricedCount < 1 || !Number.isFinite(age) || age < -60_000 || age > 600_000) {
    throw new Error('Watch sync refused incomplete or stale collection; previous snapshot retained');
  }
  await writeSnapshot(destination, data);
  return data;
}

async function writeSnapshot(destination, data) {
  await mkdir(dirname(destination), { recursive: true });
  const temporary = `${destination}.${randomUUID()}.tmp`;
  const handle = await open(temporary, 'wx', 0o644);
  try {
    await handle.writeFile(`${JSON.stringify(data, null, 2)}\n`);
    await handle.sync();
    await handle.close();
    await rename(temporary, destination);
  } catch (error) {
    await handle.close().catch(() => {});
    await unlink(temporary).catch(() => {});
    throw error;
  }
}

export async function syncBtcScoreSnapshot({ destination = resolve('public/data/btc-score.json') } = {}) {
  const response = await fetch('https://brief.day1global.xyz/api/btc-score', { signal: AbortSignal.timeout(12_000), cache: 'no-store' });
  if (!response.ok) throw new Error(`BTC heat sync HTTP ${response.status}; previous snapshot retained`);
  const data = await response.json();
  const age = Date.now() - Date.parse(data?.timestamp);
  if (!isBtcScoreData(data) || age < -60_000 || age > 86_400_000) throw new Error('BTC heat sync refused incomplete or stale data; previous snapshot retained');
  await writeSnapshot(destination, data);
  return data;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const data = await syncWatchSnapshot();
    console.log(JSON.stringify({ generatedAt: data.generatedAt, listings: data.listings.length, datedListings: data.listings.filter(coin => coin.firstSeenAt !== null).length, pricedListings: data.listings.filter(coin => coin.priceUsdt !== null).length, errors: data.errors, successfulSources: data.sources.successful.length, snapshot: 'public/data/watch-data.json' }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
  try {
    const heat = await syncBtcScoreSnapshot();
    console.log(JSON.stringify({ btcHeat: { timestamp: heat.timestamp, score: heat.score, indicators: heat.indicators.length, snapshot: 'public/data/btc-score.json' } }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
