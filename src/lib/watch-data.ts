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
  firstSeenAt: number; // earliest listing timestamp in ms
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
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchJson<T>(url: string, opts?: RequestInit & { revalidate?: number }): Promise<T | null> {
  const { revalidate = 900, ...init } = opts ?? {};
  try {
    const res = await fetch(url, {
      ...init,
      next: { revalidate },
      headers: { Accept: 'application/json', ...init.headers },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
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

async function fetchOkxSpot(since: number): Promise<RawInstrument[]> {
  type Item = { instId: string; listTime: string };
  type Resp = { data: Item[] };
  const d = await fetchJson<Resp>('https://www.okx.com/api/v5/public/instruments?instType=SPOT');
  return (d?.data ?? [])
    .filter(x => x.listTime && parseInt(x.listTime) >= since)
    .map(x => {
      const [base] = x.instId.split('-');
      return { symbol: base.toUpperCase(), pair: x.instId, type: 'spot', listedAt: parseInt(x.listTime) };
    });
}

async function fetchOkxSwap(since: number): Promise<RawInstrument[]> {
  type Item = { instId: string; listTime: string };
  type Resp = { data: Item[] };
  const d = await fetchJson<Resp>('https://www.okx.com/api/v5/public/instruments?instType=SWAP');
  return (d?.data ?? [])
    .filter(x => x.listTime && parseInt(x.listTime) >= since)
    .map(x => {
      const [base] = x.instId.split('-');
      return { symbol: base.toUpperCase(), pair: x.instId, type: 'perp', listedAt: parseInt(x.listTime) };
    });
}

async function fetchBybitLinear(since: number): Promise<RawInstrument[]> {
  type Item = { symbol: string; baseCoin: string; launchTime: string; contractType: string };
  type Resp = { result: { list: Item[] } };
  const d = await fetchJson<Resp>('https://api.bybit.com/v5/market/instruments-info?category=linear&limit=1000');
  return (d?.result?.list ?? [])
    .filter(x => x.launchTime && parseInt(x.launchTime) >= since && x.contractType === 'LinearPerpetual')
    .map(x => ({
      symbol: x.baseCoin.toUpperCase(),
      pair: x.symbol,
      type: 'perp',
      listedAt: parseInt(x.launchTime),
    }));
}

async function fetchBitgetSpot(since: number): Promise<RawInstrument[]> {
  type Item = { symbol: string; baseCoin: string; openTime: string };
  type Resp = { data: Item[] };
  const d = await fetchJson<Resp>('https://api.bitget.com/api/v2/spot/public/symbols');
  return (d?.data ?? [])
    .filter(x => x.openTime && parseInt(x.openTime) >= since)
    .map(x => ({
      symbol: x.baseCoin.toUpperCase(),
      pair: x.symbol,
      type: 'spot',
      listedAt: parseInt(x.openTime),
    }));
}

async function fetchCoinbaseSpot(since: number): Promise<RawInstrument[]> {
  type Item = { product_id: string; base_currency_id: string; new_at: string | null; product_type: string };
  type Resp = { products: Item[] };
  const d = await fetchJson<Resp>('https://api.coinbase.com/api/v3/brokerage/market/products?product_type=SPOT&limit=500');
  return (d?.products ?? [])
    .filter(x => x.new_at && new Date(x.new_at).getTime() >= since)
    .map(x => ({
      symbol: x.base_currency_id.toUpperCase(),
      pair: x.product_id,
      type: 'spot',
      listedAt: new Date(x.new_at!).getTime(),
    }));
}

async function fetchBinanceFutures(since: number): Promise<RawInstrument[]> {
  type Item = { symbol: string; baseAsset: string; onboardDate: number; contractType: string };
  type Resp = { symbols: Item[] };
  const d = await fetchJson<Resp>('https://fapi.binance.com/fapi/v1/exchangeInfo');
  return (d?.symbols ?? [])
    .filter(x => x.onboardDate && x.onboardDate >= since && x.contractType === 'PERPETUAL')
    .map(x => ({
      symbol: x.baseAsset.toUpperCase(),
      pair: x.symbol,
      type: 'perp',
      listedAt: x.onboardDate,
    }));
}

// ─── Existence checkers (no timestamp, just presence) ─────────────────────────

async function getBinanceSpotSet(): Promise<Set<string>> {
  type Item = { baseAsset: string; quoteAsset: string; status: string };
  type Resp = { symbols: Item[] };
  // exchangeInfo is ~22MB — skip Next.js cache to avoid the 2MB limit error
  const d = await fetchJson<Resp>('https://api.binance.com/api/v3/exchangeInfo', { cache: 'no-store' });
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
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=binance-alpha-spotlight&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`,
      { revalidate: 1800 }
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

async function fetchCoinGeckoMarkets(): Promise<Map<string, { marketCap: number; fdv: number | null }>> {
  type Item = { symbol: string; market_cap: number | null; fully_diluted_valuation: number | null };
  const result = new Map<string, { marketCap: number; fdv: number | null }>();
  const pages = [1, 2, 3];
  await Promise.all(pages.map(async (page) => {
    const d = await fetchJson<Item[]>(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`,
      { revalidate: 900 }
    );
    for (const item of d ?? []) {
      const sym = item.symbol.toUpperCase();
      if (!result.has(sym) && item.market_cap) {
        result.set(sym, { marketCap: item.market_cap, fdv: item.fully_diluted_valuation ?? null });
      }
    }
  }));
  return result;
}

// ─── Price fetcher ────────────────────────────────────────────────────────────

async function fetchBinancePrices(symbols: string[]): Promise<Map<string, { price: number; change: number; volume: number }>> {
  const result = new Map<string, { price: number; change: number; volume: number }>();
  if (!symbols.length) return result;

  // Binance batch limit is 100 symbols
  const CHUNK = 100;
  type Item = { symbol: string; openPrice: string; lastPrice: string; quoteVolume: string };
  const chunks: string[][] = [];
  for (let i = 0; i < symbols.length; i += CHUNK) chunks.push(symbols.slice(i, i + CHUNK));

  await Promise.all(chunks.map(async (chunk) => {
    const pairs = chunk.map(s => `"${s}USDT"`).join(',');
    const d = await fetchJson<Item[]>(
      `https://api.binance.com/api/v3/ticker/24hr?symbols=[${pairs}]&type=MINI`,
      { revalidate: 300 }
    );
    for (const item of d ?? []) {
      const base = item.symbol.replace('USDT', '');
      const open = parseFloat(item.openPrice);
      const last = parseFloat(item.lastPrice);
      const change = open > 0 ? ((last - open) / open) * 100 : 0;
      result.set(base, { price: last, change, volume: parseFloat(item.quoteVolume) });
    }
  }));

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

function computeSequence(binanceSpot: boolean, anySpot: boolean, anyPerp: boolean): ListingSequence {
  if (anySpot && anyPerp) return 'full_stack';
  if (anySpot) return 'spot_only';
  if (anyPerp) return 'perp_only';
  return 'unknown';
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function getWatchData(lookbackDays = 30): Promise<WatchData> {
  const generatedAt = new Date().toISOString();
  const since = Date.now() - lookbackDays * 24 * 3600 * 1000;

  // Fetch everything in parallel
  const [
    okxSpot, okxSwap, bybitPerp, bitgetSpot, cbSpot, bnbFutures,
    bnbSpotSet, upbitSet, hlSet, bnbAlphaSet,
    fngRaw, globalRaw, cgMarkets,
  ] = await Promise.all([
    fetchOkxSpot(since),
    fetchOkxSwap(since),
    fetchBybitLinear(since),
    fetchBitgetSpot(since),
    fetchCoinbaseSpot(since),
    fetchBinanceFutures(since),
    getBinanceSpotSet(),
    getUpbitSet(),
    getHyperliquidSet(),
    getBinanceAlphaSet(),
    fetchJson<{ data: Array<{ value: string; value_classification: string }> }>('https://api.alternative.me/fng/?limit=1'),
    fetchJson<{ data: { total_market_cap: Record<string, number>; market_cap_percentage: Record<string, number>; market_cap_change_percentage_24h_usd: number; active_cryptocurrencies: number; markets: number } }>('https://api.coingecko.com/api/v3/global'),
    fetchCoinGeckoMarkets(),
  ]);

  const fearGreed = fngRaw?.data?.[0]
    ? { value: parseInt(fngRaw.data[0].value, 10), label: fngRaw.data[0].value_classification }
    : null;

  const global: GlobalMarket = {
    totalMarketCapUsd: globalRaw?.data?.total_market_cap?.usd ?? null,
    btcDominance: globalRaw?.data?.market_cap_percentage?.btc ?? null,
    ethDominance: globalRaw?.data?.market_cap_percentage?.eth ?? null,
    marketCapChange24h: globalRaw?.data?.market_cap_change_percentage_24h_usd ?? null,
    activeCryptocurrencies: globalRaw?.data?.active_cryptocurrencies ?? null,
    markets: globalRaw?.data?.markets ?? null,
  };

  // Collect all unique symbols from timed sources
  const allRecent = [...okxSpot, ...okxSwap, ...bybitPerp, ...bitgetSpot, ...cbSpot, ...bnbFutures];
  const symbolSet = new Set(allRecent.map(x => x.symbol));

  // Include Binance Alpha-only tokens so they appear in the Alpha tab even if
  // not yet listed on any CEX. Use current time as firstSeenAt placeholder.
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
    hyperliquid: ExchangeListing; firstSeenAt: number;
  }>();

  function getOrCreate(sym: string) {
    if (!coinMap.has(sym)) {
      coinMap.set(sym, {
        binance: emptyListing(), okx: emptyListing(), bybit: emptyListing(),
        bitget: emptyListing(), coinbase: emptyListing(), upbit: emptyListing(),
        hyperliquid: emptyListing(), firstSeenAt: Date.now(),
      });
    }
    return coinMap.get(sym)!;
  }

  // Apply timed data
  for (const inst of okxSpot) {
    if (!symbolSet.has(inst.symbol)) continue;
    const c = getOrCreate(inst.symbol);
    c.okx.spot = true;
    c.okx.spotListedAt = inst.listedAt;
    c.okx.spotPairs.push(inst.pair);
    if (inst.listedAt < c.firstSeenAt) c.firstSeenAt = inst.listedAt;
  }
  for (const inst of okxSwap) {
    if (!symbolSet.has(inst.symbol)) continue;
    const c = getOrCreate(inst.symbol);
    c.okx.perp = true;
    c.okx.perpListedAt = inst.listedAt;
    c.okx.perpPairs.push(inst.pair);
    if (inst.listedAt < c.firstSeenAt) c.firstSeenAt = inst.listedAt;
  }
  for (const inst of bybitPerp) {
    if (!symbolSet.has(inst.symbol)) continue;
    const c = getOrCreate(inst.symbol);
    c.bybit.perp = true;
    c.bybit.perpListedAt = inst.listedAt;
    c.bybit.perpPairs.push(inst.pair);
    if (inst.listedAt < c.firstSeenAt) c.firstSeenAt = inst.listedAt;
  }
  for (const inst of bitgetSpot) {
    if (!symbolSet.has(inst.symbol)) continue;
    const c = getOrCreate(inst.symbol);
    c.bitget.spot = true;
    c.bitget.spotListedAt = inst.listedAt;
    c.bitget.spotPairs.push(inst.pair);
    if (inst.listedAt < c.firstSeenAt) c.firstSeenAt = inst.listedAt;
  }
  for (const inst of cbSpot) {
    if (!symbolSet.has(inst.symbol)) continue;
    const c = getOrCreate(inst.symbol);
    c.coinbase.spot = true;
    c.coinbase.spotListedAt = inst.listedAt;
    c.coinbase.spotPairs.push(inst.pair);
    if (inst.listedAt < c.firstSeenAt) c.firstSeenAt = inst.listedAt;
  }
  for (const inst of bnbFutures) {
    if (!symbolSet.has(inst.symbol)) continue;
    const c = getOrCreate(inst.symbol);
    c.binance.perp = true;
    c.binance.perpListedAt = inst.listedAt;
    c.binance.perpPairs.push(inst.pair);
    if (inst.listedAt < c.firstSeenAt) c.firstSeenAt = inst.listedAt;
  }

  // Apply presence-only data
  for (const [sym, c] of coinMap) {
    if (bnbSpotSet.has(sym)) c.binance.spot = true;
    if (upbitSet.has(sym)) c.upbit.spot = true;
    if (hlSet.has(sym)) c.hyperliquid.perp = true;
  }

  // Fetch prices for all symbols (Binance batch)
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

    const partial = { symbol, firstSeenAt: c.firstSeenAt, priceUsdt: px?.price ?? null, priceChange24h: px?.change ?? null, volume24h: px?.volume ?? null, marketCap: mcap, fdv: cg?.fdv ?? null, binance: c.binance, okx: c.okx, bybit: c.bybit, bitget: c.bitget, coinbase: c.coinbase, upbit: c.upbit, hyperliquid: c.hyperliquid, spotExchanges, perpExchanges, binanceAlpha, buySignal };
    const signalRating = computeSignal(partial);
    const listingSequence = computeSequence(c.binance.spot, anySpot, anyPerp);

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
    return rd !== 0 ? rd : b.firstSeenAt - a.firstSeenAt;
  });

  return { generatedAt, fearGreed, global, listings, lookbackDays };
}
