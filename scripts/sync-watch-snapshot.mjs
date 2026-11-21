import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { registerHooks } from 'node:module';
import { writeSnapshot } from './lib/write-snapshot.mjs';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === './watch-client-data' && context.parentURL?.endsWith('/src/lib/watch-data.ts')) {
      return nextResolve('./watch-client-data.ts', context);
    }
    return nextResolve(specifier, context);
  },
});
const { collectWatchData, WATCH_INVENTORY_SOURCES } = await import('../src/lib/watch-data.ts');
const { isWatchData } = await import('../src/lib/watch-client-data.ts');
const { isBtcScoreData } = await import('../src/lib/btc-score-client-data.ts');

export async function syncWatchSnapshot({ destination = resolve('public/data/watch-data.json'), collect = collectWatchData } = {}) {
  const data = await collect(30);
  const inventoryReady = isWatchData(data) && data.sources && WATCH_INVENTORY_SOURCES.every(source =>
    data.sources.successful.includes(source) && !data.sources.failed.includes(source));
  const age = Date.now() - Date.parse(data?.generatedAt);
  if (!inventoryReady || !data.listings.some(coin => coin.firstSeenAt !== null) || !data.listings.some(coin => coin.priceUsdt !== null) ||
      !Number.isFinite(age) || age < -60_000 || age > 600_000) {
    throw new Error('Watch sync refused incomplete or stale collection; previous snapshot retained');
  }
  await writeSnapshot(destination, data);
  return data;
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
