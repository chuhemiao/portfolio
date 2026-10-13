import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { isWatchData } from './watch-client-data';
import { AsyncLocalStorage } from 'node:async_hooks';

export type SignalRating = 'S' | 'A' | 'B' | 'C' | 'D' | 'R';
export type ListingType = 'spot' | 'perp' | 'both' | 'none';
export type ListingSequence =
  | 'spot_only'
  | 'perp_only'
  | 'spot_to_perp'
  | 'perp_to_spot'
  | 'full_stack'
  | 'unknown';

export interface ExchangeListing {
  spot: boolean;
  perp: boolean;
  spotListedAt: number | null; // ms timestamp
  perpListedAt: number | null;
  spotPairs: string[];
  perpPairs: string[];
}

export interface ListingCoin {
  symbol: string; // base coin, e.g. "CHIP"
  firstSeenAt: number | null; // earliest listing timestamp in ms
  priceUsdt: number | null;
  priceChange24h: number | null;
  volume24h: number | null;
  marketCap: number | null;
  fdv: number | null;
  // Per-exchange status
  binance: ExchangeListing;
  okx: ExchangeListing;
  bybit: ExchangeListing;
  bitget: ExchangeListing;
  coinbase: ExchangeListing;
  upbit: ExchangeListing;
  hyperliquid: ExchangeListing;
  // Derived
  spotExchanges: string[];
  perpExchanges: string[];
  listingSequence: ListingSequence;
  signalRating: SignalRating;
  perpWithoutSpot: boolean;
  multiExchangeSpot: boolean;
  perpLed: boolean; // on perp somewhere but no Binance/CB spot
  noteworthy: string;
  // Binance Alpha
  binanceAlpha: boolean; // listed on Binance Alpha (pre-spot DEX program)
  buySignal: boolean;    // (alpha || spot+perp) && mcap < $30M
}

export interface GlobalMarket {
  totalMarketCapUsd: number | null;
  btcDominance: number | null;
  ethDominance: number | null;
  marketCapChange24h: number | null;
  activeCryptocurrencies: number | null;
  markets: number | null;
}

export interface WatchData {
  generatedAt: string;
  fearGreed: { value: number; label: string } | null;
  global: GlobalMarket | null;
  listings: ListingCoin[];
  lookbackDays: number;
  errors: string[];
  sources?: { successful: string[]; failed: string[] };
}

const FETCH_TIMEOUT_MS = 12000;
// ─── Error collection ─────────────────────────────────────────────────────────
// Threads a per-request error list through the whole Promise.all fan-out in
// getWatchData() without changing any of the ~15 fetcher helpers' signatures.

const errorStore = new AsyncLocalStorage<{ errors: string[]; successful: Set<string>; failed: Set<string>; requests: Map<string, Promise<unknown>> }>();

function recordError(source: string, detail: string, failed = true) {
  const store = errorStore.getStore();
  if (!store) return;
  if (failed) store.failed.add(source);
  const message = `${source}: ${detail}`;
  if (!store.errors.includes(message)) store.errors.push(message);
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

function fetchJson<T>(url: string, init: RequestInit = {}): Promise<T | null> {
  const requests = errorStore.getStore()?.requests;
  const key = `${init.method ?? 'GET'}:${url}:${init.body ?? ''}`;
  let pending = requests?.get(key);
  if (!pending) {
    pending = fetchJsonUncached<T>(url, init);
    requests?.set(key, pending);
  }
  return pending as Promise<T | null>;
}

async function fetchJsonUncached<T>(url: string, init: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...init,
      signal: init.signal ?? AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { Accept: 'application/json', ...init.headers },
    });
    if (!res.ok) {
      recordError(url, `HTTP ${res.status}`);
      return null;
    }
    const data = await res.json() as T;
    if (data && typeof data === 'object') {
      const envelope = data as { code?: string | number; retCode?: number };
      if ((envelope.code !== undefined && !['0', '00000'].includes(String(envelope.code))) || (envelope.retCode !== undefined && envelope.retCode !== 0)) {
        recordError(url, 'source rejected the request');
        return null;
      }
    }
    errorStore.getStore()?.successful.add(url);
    return data;
  } catch (err) {
    recordError(url, err instanceof Error ? err.message : String(err));
    return null;
  }
}

// ─── Exchange fetchers ────────────────────────────────────────────────────────

interface RawInstrument {
  symbol: string;     // base coin symbol (uppercase)
  pair: string;       // full pair, e.g. CHIP-USDT
  type: 'spot' | 'perp';
  listedAt: number;   // ms timestamp
}

type ExchangeKey = 'binance' | 'okx' | 'bybit' | 'bitget' | 'coinbase' | 'upbit' | 'hyperliquid';

async function fetchOkxSpot(): Promise<RawInstrument[]> {
  type Item = { instId: string; listTime: string; state: string };
  type Resp = { data: Item[] };
  const d = await fetchJson<Resp>('https://www.okx.com/api/v5/public/instruments?instType=SPOT');
  return (d?.data ?? [])
    .filter(x => x.instId && x.state === 'live')
    .map(x => {
      const [base] = x.instId.split('-');
      return { symbol: base.toUpperCase(), pair: x.instId, type: 'spot', listedAt: parseInt(x.listTime) };
    });
}

async function fetchOkxSwap(): Promise<RawInstrument[]> {
  type Item = { instId: string; listTime: string; state: string };
  type Resp = { data: Item[] };
  const d = await fetchJson<Resp>('https://www.okx.com/api/v5/public/instruments?instType=SWAP');
  return (d?.data ?? [])
    .filter(x => x.instId && x.state === 'live')
    .map(x => {
      const [base] = x.instId.split('-');
      return { symbol: base.toUpperCase(), pair: x.instId, type: 'perp', listedAt: parseInt(x.listTime) };
    });
}

async function fetchBybitLinear(): Promise<RawInstrument[]> {
  type Item = { symbol: string; baseCoin: string; launchTime: string; contractType: string; status: string };
  type Resp = { result: { list: Item[] } };
  const d = await fetchJson<Resp>('https://api.bybit.com/v5/market/instruments-info?category=linear&limit=1000');
  return (d?.result?.list ?? [])
    .filter(x => x.contractType === 'LinearPerpetual' && x.status === 'Trading')
    .map(x => ({
      symbol: x.baseCoin.toUpperCase(),
      pair: x.symbol,
      type: 'perp',
      listedAt: parseInt(x.launchTime),
    }));
}

async function fetchBitgetSpot(): Promise<RawInstrument[]> {
  type Item = { symbol: string; baseCoin: string; openTime: string; status: string };
  type Resp = { data: Item[] };
  const d = await fetchJson<Resp>('https://api.bitget.com/api/v2/spot/public/symbols');
  return (d?.data ?? [])
    .filter(x => x.baseCoin && x.symbol && x.status === 'online')
    .map(x => ({
      symbol: x.baseCoin.toUpperCase(),
      pair: x.symbol,
      type: 'spot',
      listedAt: 0,
    }));
}

async function fetchCoinbaseSpot(): Promise<RawInstrument[]> {
  type Item = { product_id: string; base_currency_id: string; new_at: string | null; product_type: string; is_disabled?: boolean; trading_disabled?: boolean };
  type Resp = { products: Item[] };
  const d = await fetchJson<Resp>('https://api.coinbase.com/api/v3/brokerage/market/products?product_type=SPOT&limit=500');
  return (d?.products ?? [])
    .filter(x => x.base_currency_id && x.product_id && !x.is_disabled && !x.trading_disabled)
    .map(x => ({
      symbol: x.base_currency_id.toUpperCase(),
      pair: x.product_id,
      type: 'spot',
      listedAt: x.new_at ? new Date(x.new_at).getTime() : 0,
    }));
}

async function fetchBinanceFutures(): Promise<RawInstrument[]> {
  type Item = { symbol: string; baseAsset: string; onboardDate: number; contractType: string; status: string };
  type Resp = { symbols: Item[] };
  const d = await fetchJson<Resp>('https://fapi.binance.com/fapi/v1/exchangeInfo');
  return (d?.symbols ?? [])
    .filter(x => x.contractType === 'PERPETUAL' && x.status === 'TRADING')
    .map(x => ({
      symbol: x.baseAsset.toUpperCase(),
      pair: x.symbol,
      type: 'perp',
      listedAt: x.onboardDate,
    }));
}

async function fetchBybitSpot(): Promise<RawInstrument[]> {
  type Resp = { result?: { list?: Array<{ symbol: string; baseCoin: string; status: string }> } };
  const data = await fetchJson<Resp>('https://api.bybit.com/v5/market/instruments-info?category=spot&limit=1000');
  return (data?.result?.list ?? []).filter(x => x.status === 'Trading').map(x => ({ symbol: x.baseCoin.toUpperCase(), pair: x.symbol, type: 'spot', listedAt: 0 }));
}

async function fetchBitgetPerp(): Promise<RawInstrument[]> {
  type Resp = { data?: Array<{ symbol: string; baseCoin: string; symbolStatus: string; symbolType: string }> };
  const data = await fetchJson<Resp>('https://api.bitget.com/api/v2/mix/market/contracts?productType=USDT-FUTURES');
  return (data?.data ?? []).filter(x => x.symbolStatus === 'normal' && x.symbolType === 'perpetual').map(x => ({ symbol: x.baseCoin.toUpperCase(), pair: x.symbol, type: 'perp', listedAt: 0 }));
}

// ─── Existence checkers (no timestamp, just presence) ─────────────────────────

async function getBinanceSpotSet(): Promise<Set<string>> {
  type Item = { baseAsset: string; quoteAsset: string; status: string };
  type Resp = { symbols: Item[] };
  const d = await fetchJson<Resp>('https://api.binance.com/api/v3/exchangeInfo');
  const s = new Set<string>();
  for (const sym of d?.symbols ?? []) {
    if (sym.status === 'TRADING') s.add(sym.baseAsset.toUpperCase());
  }
  return s;
}

async function getUpbitSet(): Promise<Set<string>> {
  type Item = { market: string };
  const d = await fetchJson<Item[]>('https://api.upbit.com/v1/market/all');
  const s = new Set<string>();
  for (const m of d ?? []) {
    // market format: "KRW-BTC", "BTC-ETH", "USDT-XRP"
    const parts = m.market.split('-');
    if (parts.length === 2) s.add(parts[1].toUpperCase());
  }
  return s;
}

async function getBinanceAlphaSet(): Promise<Set<string>> {
  // Binance Alpha: pre-spot DEX listing on Binance Web3 Wallet
  // Data source: CoinGecko "binance-alpha-spotlight" category (covers all chains: BSC, ETH, SOL, Base, ARB, SUI, TRON)
  // Old Binance BAPI endpoints (/bapi/defi/v1/public/alpha/token/list) are 404 as of 2026-05
  type Item = { symbol: string };
  const s = new Set<string>();

  // Fetch up to 2 pages (250 tokens) — CoinGecko free tier allows this without a key
  await Promise.all([1, 2].map(async (page) => {
    const d = await fetchJson<Item[]>(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=binance-alpha-spotlight&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`
    );
    for (const item of d ?? []) {
      const sym = (item.symbol || '').toUpperCase();
      if (sym) s.add(sym);
    }
  }));

  return s;
}

async function getHyperliquidSet(): Promise<Set<string>> {
  type Resp = { universe: Array<{ name: string }> };
  const d = await fetchJson<Resp>('https://api.hyperliquid.xyz/info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'meta' }),
  });
  const s = new Set<string>();
  for (const m of d?.universe ?? []) s.add(m.name.toUpperCase());
  return s;
}

// ─── CoinGecko market cap / FDV fetcher ───────────────────────────────────────

type MarketQuote = { price: number | null; change: number | null; volume: number | null; marketCap: number | null; fdv: number | null };

async function fetchCoinGeckoMarkets(): Promise<Map<string, MarketQuote>> {
  type Item = { symbol: string; current_price: number | null; price_change_percentage_24h: number | null; total_volume: number | null; market_cap: number | null; fully_diluted_valuation: number | null };
  const urls = [1, 2, 3].map(page => `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`);
  urls.push(...[1, 2].map(page => `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=binance-alpha-spotlight&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`));
  const pages = await Promise.all(urls.map(url => fetchJson<Item[]>(url)));
  const result = new Map<string, MarketQuote>();
  for (const item of pages.flatMap(page => page ?? [])) {
    const symbol = item.symbol?.toUpperCase();
    if (!symbol || result.has(symbol)) continue;
    result.set(symbol, { price: item.current_price, change: item.price_change_percentage_24h, volume: item.total_volume, marketCap: item.market_cap, fdv: item.fully_diluted_valuation });
  }
  return result;
}

// ─── Price fetcher ────────────────────────────────────────────────────────────

async function fetchBinancePrices(symbols: string[]): Promise<Map<string, { price: number; change: number; volume: number }>> {
  type Item = { symbol: string; openPrice: string; lastPrice: string; quoteVolume: string };
  const result = new Map<string, { price: number; change: number; volume: number }>();
  const wanted = new Set(symbols);
  if (!wanted.size) return result;
  const data = await fetchJson<Item[]>('https://api.binance.com/api/v3/ticker/24hr?type=MINI');
  for (const item of data ?? []) {
    if (!item.symbol.endsWith('USDT')) continue;
    const base = item.symbol.slice(0, -4);
    if (!wanted.has(base)) continue;
    const open = Number(item.openPrice), last = Number(item.lastPrice), volume = Number(item.quoteVolume);
    if (!(open > 0) || !(last > 0) || !Number.isFinite(volume)) continue;
    result.set(base, { price: last, change: (last - open) / open * 100, volume });
  }
  return result;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyListing(): ExchangeListing {
  return { spot: false, perp: false, spotListedAt: null, perpListedAt: null, spotPairs: [], perpPairs: [] };
}

function computeSignal(coin: Omit<ListingCoin, 'signalRating' | 'listingSequence' | 'perpWithoutSpot' | 'multiExchangeSpot' | 'perpLed' | 'noteworthy'>): SignalRating {
  const spotCount = coin.spotExchanges.length;
  const perpCount = coin.perpExchanges.length;
  if (coin.binance.spot && coin.coinbase.spot && coin.upbit.spot) return 'S';
  if (spotCount >= 4) return 'S';
  if (coin.binance.spot || (coin.coinbase.spot && spotCount >= 2)) return 'A';
  if (coin.upbit.spot && spotCount >= 1) return 'A';
  if (spotCount >= 2 || coin.binance.perp) return 'B';
  if (spotCount >= 1 || perpCount >= 1) return 'C';
  return 'D';
}

function computeSequence(anySpot: boolean, anyPerp: boolean): ListingSequence {
  if (anySpot && anyPerp) return 'full_stack';
  if (anySpot) return 'spot_only';
  if (anyPerp) return 'perp_only';
  return 'unknown';
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function getWatchData(lookbackDays = 30): Promise<WatchData> {
  try {
    const snapshot = JSON.parse(await readFile(resolve(process.cwd(), 'public/data/watch-data.json'), 'utf8')) as WatchData;
    if (isWatchData(snapshot) && snapshot.lookbackDays === lookbackDays) return snapshot;
  } catch { /* A first build can collect live data before a snapshot exists. */ }
  return collectWatchData(lookbackDays);
}

export async function collectWatchData(lookbackDays = 30): Promise<WatchData> {
  if (!Number.isInteger(lookbackDays) || lookbackDays < 1 || lookbackDays > 365) throw new Error('lookbackDays must be an integer between 1 and 365');
  return errorStore.run({ errors: [], successful: new Set(), failed: new Set(), requests: new Map() }, () => getWatchDataInner(lookbackDays));
}

async function getWatchDataInner(lookbackDays: number): Promise<WatchData> {
  const now = Date.now();
  const generatedAt = new Date(now).toISOString();
  const since = now - lookbackDays * 24 * 3600 * 1000;
  const [okxSpot, okxSwap, bybitPerp, bitgetSpot, cbSpot, bnbFutures, bnbSpotSet, upbitSet, hlSet, bnbAlphaSet, fngRaw, globalRaw, cgMarkets, bybitSpot, bitgetPerp] = await Promise.all([
    fetchOkxSpot(), fetchOkxSwap(), fetchBybitLinear(), fetchBitgetSpot(), fetchCoinbaseSpot(), fetchBinanceFutures(),
    getBinanceSpotSet(), getUpbitSet(), getHyperliquidSet(), getBinanceAlphaSet(),
    fetchJson<{ data: Array<{ value: string; value_classification: string }> }>('https://api.alternative.me/fng/?limit=1'),
    fetchJson<{ data: { total_market_cap: Record<string, number>; market_cap_percentage: Record<string, number>; market_cap_change_percentage_24h_usd: number; active_cryptocurrencies: number; markets: number } }>('https://api.coingecko.com/api/v3/global'),
    fetchCoinGeckoMarkets(), fetchBybitSpot(), fetchBitgetPerp(),
  ]);
  recordError('Bitget listing dates', 'legacy spot inventory does not supply verified listing dates', false);
  if (cbSpot.length >= 500) recordError('Coinbase inventory', 'coverage limited to the first 500 public products', false);
  const fearGreed = fngRaw?.data?.[0] ? { value: Number(fngRaw.data[0].value), label: fngRaw.data[0].value_classification } : null;

  const global: GlobalMarket = {
    totalMarketCapUsd: globalRaw?.data?.total_market_cap?.usd ?? null,
    btcDominance: globalRaw?.data?.market_cap_percentage?.btc ?? null,
    ethDominance: globalRaw?.data?.market_cap_percentage?.eth ?? null,
    marketCapChange24h: globalRaw?.data?.market_cap_change_percentage_24h_usd ?? null,
    activeCryptocurrencies: globalRaw?.data?.active_cryptocurrencies ?? null,
    markets: globalRaw?.data?.markets ?? null,
  };

  // Collect all unique symbols from timed sources
  const allRecent = [...okxSpot, ...okxSwap, ...bybitPerp, ...bitgetSpot, ...cbSpot, ...bnbFutures].filter(x => Number.isFinite(x.listedAt) && x.listedAt >= since && x.listedAt <= now);
  const symbolSet = new Set(allRecent.map(x => x.symbol));

  // Alpha inventory has no verified listing date; retain null for those entries.
  for (const sym of bnbAlphaSet) symbolSet.add(sym);

  // Exclude stablecoins and noise
  const EXCLUDE = new Set(['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'FDUSD', 'USD1', 'USDE', 'USDС']);
  for (const sym of [...symbolSet]) {
    if (EXCLUDE.has(sym) || sym.endsWith('USD') || sym.endsWith('USDT')) symbolSet.delete(sym);
  }

  // Build per-symbol listings
  const coinMap = new Map<string, {
    binance: ExchangeListing; okx: ExchangeListing; bybit: ExchangeListing;
    bitget: ExchangeListing; coinbase: ExchangeListing; upbit: ExchangeListing;
    hyperliquid: ExchangeListing; firstSeenAt: number | null;
  }>();

  function getOrCreate(sym: string) {
    if (!coinMap.has(sym)) {
      coinMap.set(sym, {
        binance: emptyListing(), okx: emptyListing(), bybit: emptyListing(),
        bitget: emptyListing(), coinbase: emptyListing(), upbit: emptyListing(),
        hyperliquid: emptyListing(), firstSeenAt: null,
      });
    }
    return coinMap.get(sym)!;
  }

  function applyInstrument(inst: RawInstrument, exchange: ExchangeKey) {
    if (!symbolSet.has(inst.symbol) || inst.listedAt > now) return;
    const coin = getOrCreate(inst.symbol);
    const listing = coin[exchange];
    const time = Number.isFinite(inst.listedAt) && inst.listedAt > 0 ? inst.listedAt : null;
    if (inst.type === 'spot') {
      listing.spot = true;
      if (time !== null) listing.spotListedAt = listing.spotListedAt === null ? time : Math.min(time, listing.spotListedAt);
      if (!listing.spotPairs.includes(inst.pair)) listing.spotPairs.push(inst.pair);
    } else {
      listing.perp = true;
      if (time !== null) listing.perpListedAt = listing.perpListedAt === null ? time : Math.min(time, listing.perpListedAt);
      if (!listing.perpPairs.includes(inst.pair)) listing.perpPairs.push(inst.pair);
    }
    if (time !== null && time >= since && (coin.firstSeenAt === null || time < coin.firstSeenAt)) coin.firstSeenAt = time;
  }
  for (const inst of okxSpot) applyInstrument(inst, 'okx');
  for (const inst of okxSwap) applyInstrument(inst, 'okx');
  for (const inst of bybitPerp) applyInstrument(inst, 'bybit');
  for (const inst of bitgetSpot) applyInstrument(inst, 'bitget');
  for (const inst of cbSpot) applyInstrument(inst, 'coinbase');
  for (const inst of bnbFutures) applyInstrument(inst, 'binance');
  for (const inst of bybitSpot) {
    if (!symbolSet.has(inst.symbol)) continue;
    const listing = getOrCreate(inst.symbol).bybit;
    listing.spot = true;
    listing.spotPairs.push(inst.pair);
  }
  for (const inst of bitgetPerp) {
    if (!symbolSet.has(inst.symbol)) continue;
    const listing = getOrCreate(inst.symbol).bitget;
    listing.perp = true;
    listing.perpPairs.push(inst.pair);
  }
  for (const symbol of symbolSet) getOrCreate(symbol);

  // Apply presence-only data
  for (const [sym, c] of coinMap) {
    if (bnbSpotSet.has(sym)) c.binance.spot = true;
    if (upbitSet.has(sym)) c.upbit.spot = true;
    if (hlSet.has(sym)) c.hyperliquid.perp = true;
  }

  // Fetch a complete ticker inventory; unsupported pairs cannot poison valid quotes.
  const allSymbols = [...coinMap.keys()];
  const prices = await fetchBinancePrices(allSymbols);

  // Build final listings
  const listings: ListingCoin[] = [];

  for (const [symbol, c] of coinMap) {
    const spotExchanges = (['binance', 'okx', 'bybit', 'bitget', 'coinbase', 'upbit'] as const)
      .filter(k => c[k].spot).map(k => k);
    const perpExchanges = (['binance', 'okx', 'bybit', 'bitget', 'hyperliquid'] as const)
      .filter(k => c[k].perp).map(k => k);

    const px = prices.get(symbol);
    const cg = cgMarkets.get(symbol);
    const anySpot = spotExchanges.length > 0;
    const anyPerp = perpExchanges.length > 0;

    const perpWithoutSpot = anyPerp && !anySpot;
    const multiExchangeSpot = spotExchanges.length >= 3;
    const perpLed = anyPerp && !c.binance.spot && !c.coinbase.spot;

    const notes: string[] = [];
    if (perpWithoutSpot) notes.push(`Perp only (${perpExchanges.join(', ')}) — no spot`);
    else if (perpLed) notes.push(`HL/DEX perp-led — not on Binance/CB spot yet`);
    if (multiExchangeSpot) notes.push(`Spot on ${spotExchanges.length} exchanges`);
    if (!c.binance.spot && spotExchanges.length >= 2) notes.push(`Not on Binance spot yet`);
    if (c.upbit.spot && spotExchanges.length <= 2) notes.push(`Upbit KRW — Korean premium risk`);

    const binanceAlpha = bnbAlphaSet.has(symbol);
    const mcap = cg?.marketCap ?? null;
    // Buy signal: (Alpha OR Binance Spot+Perp) AND mcap < $30M
    const buySignal = (binanceAlpha || (c.binance.spot && c.binance.perp)) && mcap !== null && mcap < 30_000_000;

    if (binanceAlpha && !notes.some(n => n.includes('Alpha'))) {
      notes.unshift('Binance Alpha listed');
    }

    const partial = { symbol, firstSeenAt: c.firstSeenAt, priceUsdt: px?.price ?? cg?.price ?? null, priceChange24h: px?.change ?? cg?.change ?? null, volume24h: px?.volume ?? cg?.volume ?? null, marketCap: mcap, fdv: cg?.fdv ?? null, binance: c.binance, okx: c.okx, bybit: c.bybit, bitget: c.bitget, coinbase: c.coinbase, upbit: c.upbit, hyperliquid: c.hyperliquid, spotExchanges, perpExchanges, binanceAlpha, buySignal };
    const signalRating = computeSignal(partial);
    const listingSequence = computeSequence(anySpot, anyPerp);

    listings.push({
      ...partial,
      listingSequence,
      signalRating,
      perpWithoutSpot,
      multiExchangeSpot,
      perpLed,
      noteworthy: notes.join(' · '),
    });
  }

  // Sort: signal rating, then most recently listed first
  const ratingOrder: Record<SignalRating, number> = { S: 0, A: 1, B: 2, C: 3, D: 4, R: 5 };
  listings.sort((a, b) => {
    const rd = ratingOrder[a.signalRating] - ratingOrder[b.signalRating];
    return rd !== 0 ? rd : (b.firstSeenAt ?? 0) - (a.firstSeenAt ?? 0);
  });

  const errors = errorStore.getStore()?.errors ?? [];

  const context = errorStore.getStore();
  return { generatedAt, fearGreed, global, listings, lookbackDays, errors, sources: { successful: [...context!.successful], failed: [...context!.failed] } };
}
