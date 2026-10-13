import type { WatchData } from './watch-data';

const exchangeKeys = ['binance', 'okx', 'bybit', 'bitget', 'coinbase', 'upbit', 'hyperliquid'] as const;
const ratings = ['S', 'A', 'B', 'C', 'D', 'R'];
const sequences = ['spot_only', 'perp_only', 'spot_to_perp', 'perp_to_spot', 'full_stack', 'unknown'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStrings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function isNumberOrNull(value: unknown) {
  return value === null || (typeof value === 'number' && Number.isFinite(value));
}

export function isWatchData(value: unknown): value is WatchData {
  if (!isRecord(value) || typeof value.generatedAt !== 'string' || !Number.isFinite(Date.parse(value.generatedAt)) ||
      typeof value.lookbackDays !== 'number' || !Number.isInteger(value.lookbackDays) || value.lookbackDays <= 0 || value.lookbackDays > 365 ||
      !isStrings(value.errors) || !Array.isArray(value.listings)) return false;
  if (value.fearGreed !== null && (!isRecord(value.fearGreed) || typeof value.fearGreed.value !== 'number' ||
      !Number.isFinite(value.fearGreed.value) || typeof value.fearGreed.label !== 'string')) return false;
  const global = value.global;
  if (global !== null && (!isRecord(global) ||
      !['totalMarketCapUsd', 'btcDominance', 'ethDominance', 'marketCapChange24h', 'activeCryptocurrencies', 'markets']
        .every(key => isNumberOrNull(global[key])))) return false;
  if (value.sources !== undefined && (!isRecord(value.sources) || !isStrings(value.sources.successful) || !isStrings(value.sources.failed))) return false;
  return value.listings.every(coin => isRecord(coin) && typeof coin.symbol === 'string' &&
    typeof coin.noteworthy === 'string' && isNumberOrNull(coin.firstSeenAt) &&
    ['priceUsdt', 'priceChange24h', 'volume24h', 'marketCap', 'fdv'].every(key => isNumberOrNull(coin[key])) &&
    ['perpWithoutSpot', 'multiExchangeSpot', 'perpLed', 'binanceAlpha', 'buySignal'].every(key => typeof coin[key] === 'boolean') &&
    typeof coin.signalRating === 'string' && ratings.includes(coin.signalRating) &&
    typeof coin.listingSequence === 'string' && sequences.includes(coin.listingSequence) &&
    isStrings(coin.spotExchanges) && isStrings(coin.perpExchanges) &&
    exchangeKeys.every(key => {
      const exchange = coin[key];
      return isRecord(exchange) && typeof exchange.spot === 'boolean' && typeof exchange.perp === 'boolean' &&
        isNumberOrNull(exchange.spotListedAt) && isNumberOrNull(exchange.perpListedAt) &&
        isStrings(exchange.spotPairs) && isStrings(exchange.perpPairs);
    }));
}

export async function loadWatchUpdate(initialData: WatchData, signal: AbortSignal): Promise<WatchData | null> {
  for (const url of ['/api/watch-data', '/data/watch-data.json']) {
    if (signal.aborted) return null;
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener('abort', abort, { once: true });
    const timeout = setTimeout(abort, 10_000);
    try {
      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) continue;
      const json: unknown = await response.json();
      if (!signal.aborted && !controller.signal.aborted && isWatchData(json) && Date.parse(json.generatedAt) >= Date.parse(initialData.generatedAt) &&
          (json.listings.length > 0 || json.errors.length === 0)) return json;
    } catch {
      // Try the published snapshot, then preserve the build snapshot if both reads fail.
    } finally {
      clearTimeout(timeout);
      signal.removeEventListener('abort', abort);
    }
  }
  return null;
}
