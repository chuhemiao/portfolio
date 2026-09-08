/// <reference types="@cloudflare/workers-types" />

type SignalStatus = 'on' | 'off' | 'unknown';
type SignalRating = 'S' | 'A' | 'B' | 'C' | 'D' | 'R';
type ListingSequence =
  | 'spot_only'
  | 'perp_only'
  | 'spot_to_perp'
  | 'perp_to_spot'
  | 'full_stack'
  | 'unknown';

interface Env {
  RESEND_API_KEY?: string;
  RESEND_AUDIENCE_ID?: string;
  BTC_SCORE_UPSTREAM?: string;
  ALLOWED_ORIGIN?: string;
}

interface ExchangeListing {
  spot: boolean;
  perp: boolean;
  spotListedAt: number | null;
  perpListedAt: number | null;
  spotPairs: string[];
  perpPairs: string[];
}

interface ListingCoin {
  symbol: string;
  firstSeenAt: number;
  priceUsdt: number | null;
  priceChange24h: number | null;
  volume24h: number | null;
  marketCap: number | null;
  fdv: number | null;
  binance: ExchangeListing;
  okx: ExchangeListing;
  bybit: ExchangeListing;
  bitget: ExchangeListing;
  coinbase: ExchangeListing;
  upbit: ExchangeListing;
  hyperliquid: ExchangeListing;
  spotExchanges: string[];
  perpExchanges: string[];
  listingSequence: ListingSequence;
  signalRating: SignalRating;
  perpWithoutSpot: boolean;
  multiExchangeSpot: boolean;
  perpLed: boolean;
  noteworthy: string;
  binanceAlpha: boolean;
  buySignal: boolean;
}

interface WatchData {
  generatedAt: string;
  fearGreed: { value: number; label: string } | null;
  global: {
    totalMarketCapUsd: number | null;
    btcDominance: number | null;
    ethDominance: number | null;
    marketCapChange24h: number | null;
    activeCryptocurrencies: number | null;
    markets: number | null;
  } | null;
  listings: ListingCoin[];
  lookbackDays: number;
  errors: string[];
}

interface BottomSignal {
  label: string;
  status: SignalStatus;
  detail: string;
}

interface FearDashboardData {
  generatedAt: string;
  sources: Array<{
    name: string;
    status: 'ok' | 'degraded' | 'down';
    detail: string;
  }>;
  layer1: {
    btcPrice: number | null;
    marketCap: number | null;
    realizedCap: number | null;
    realizedPrice: number | null;
    mvrv: number | null;
    mvrvZ: number | null;
    ma200Week: number | null;
    btcPriceSeries: number[];
  };
  layer2: {
    activeAddresses: number | null;
    newAddresses: number | null;
    txCount: number | null;
    mempoolStats: number | null;
    nvt: number | null;
    exchangeReserve: number | null;
    minerFlow: number | null;
    exchangeInflow: number | null;
    exchangeOutflow: number | null;
    activeAddressesRising: boolean | null;
    dormancyFlow: number | null;
    coinDaysDestroyed: number | null;
    lthSopr: number | null;
  };
  layer3: {
    fearGreed: number | null;
    fearGreedClass: string | null;
    fearGreedSeries: number[];
    fundingRate: number | null;
    openInterest: number | null;
    longShortRatio: number | null;
    liquidations: number | null;
  };
  layer4: {
    sp500: number | null;
    nasdaq: number | null;
    gold: number | null;
    crudeOil: number | null;
    dxy: number | null;
    corrBtcSp500: number | null;
    corrBtcGold: number | null;
    corrBtcDxy: number | null;
  };
  layer5: {
    vix: number | null;
    move: number | null;
    yieldCurveSpread: number | null;
    sp500Drawdown: number | null;
    putCallRatio: number | null;
  };
  bottomSignals: BottomSignal[];
  compositeScore: number;
}

interface RawInstrument {
  symbol: string;
  pair: string;
  type: 'spot' | 'perp';
  listedAt: number;
}

type ExchangeKey =
  | 'binance'
  | 'okx'
  | 'bybit'
  | 'bitget'
  | 'coinbase'
  | 'upbit'
  | 'hyperliquid';

const CACHE_HOST = 'https://portfolio-api-cache.kkdemian.local';
const BTC_SCORE_TTL = 15 * 60;
const FEAR_TTL = 30 * 60;
const WATCH_TTL = 30 * 60;
const FETCH_TIMEOUT_MS = 12000;
const MANUAL_FEAR_SNAPSHOT = {
  asOf: '2026-03-05T12:49:00Z',
  layer1: {
    btcPrice: 72981.5,
    marketCap: 1460000000000,
    realizedPrice: 54553,
    mvrv: 1.332,
    ma200Week: null as number | null,
  },
  layer2: {
    activeAddresses: 490000,
    nvt: 20.9,
    exchangeReserve: 2708000,
    lthSopr: 1.0023,
  },
  layer3: {
    fearGreed: 21,
    fearGreedClass: 'Extreme Fear',
    fundingRate: 0.001841,
    openInterest: 99200000000,
    liquidations: 221000000,
  },
  layer4: {
    gold: 5140,
    crudeOil: 75.1,
    dxy: 99.17,
  },
  layer5: {
    vix: 25.16,
  },
  model: {
    compositeScore: 42,
  },
};

function cacheKey(key: string) {
  return new Request(`${CACHE_HOST}/${key}`, { method: 'GET' });
}

function defaultCache() {
  return (caches as CacheStorage & { default: Cache }).default;
}

function addCorsHeaders(headers: Headers, request: Request, env: Env) {
  const origin = request.headers.get('Origin');
  const allowed = new Set([
    'https://kkdemian.com',
    'https://www.kkdemian.com',
    env.ALLOWED_ORIGIN,
  ].filter(Boolean));

  if (
    origin &&
    (allowed.has(origin) ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:'))
  ) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }

  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
}

function jsonResponse(
  request: Request,
  env: Env,
  data: unknown,
  init: ResponseInit = {}
) {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  addCorsHeaders(headers, request, env);
  return new Response(JSON.stringify(data), { ...init, headers });
}

function cachedResponse(request: Request, env: Env, response: Response) {
  const headers = new Headers(response.headers);
  addCorsHeaders(headers, request, env);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function putCache(key: string, data: unknown, ttlSeconds: number) {
  await defaultCache().put(
    cacheKey(key),
    new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': `public, max-age=${ttlSeconds}`,
      },
    })
  );
}

async function getCachedJson(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  key: string,
  ttlSeconds: number,
  refresh: () => Promise<unknown>
) {
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get('refresh') === '1';
  const cached = forceRefresh ? null : await defaultCache().match(cacheKey(key));

  if (cached) {
    return cachedResponse(request, env, cached);
  }

  try {
    const data = await refresh();
    ctx.waitUntil(putCache(key, data, ttlSeconds));
    return jsonResponse(request, env, data, {
      headers: { 'Cache-Control': `public, max-age=${ttlSeconds}` },
    });
  } catch (error) {
    const stale = await defaultCache().match(cacheKey(key));
    if (stale) return cachedResponse(request, env, stale);
    return jsonResponse(
      request,
      env,
      {
        error: 'Upstream unavailable and no Worker cache found',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

async function fetchJson<T>(
  url: string,
  errors: string[],
  init: RequestInit = {}
): Promise<T | null> {
  try {
    const headers = new Headers(init.headers);
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');

    const res = await fetch(url, {
      ...init,
      headers,
      signal: init.signal ?? AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      errors.push(`${url}: HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    errors.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleSubscribe(request: Request, env: Env) {
  let email = '';

  try {
    const body = (await request.json()) as { email?: string };
    email = String(body.email ?? '').trim().toLowerCase();
  } catch {
    return jsonResponse(request, env, { error: 'Invalid request' }, { status: 400 });
  }

  if (!email || !isValidEmail(email)) {
    return jsonResponse(request, env, { error: 'Invalid email address' }, { status: 400 });
  }

  if (env.RESEND_API_KEY && env.RESEND_AUDIENCE_ID) {
    const res = await fetch(
      `https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, unsubscribed: false }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { name?: string };
      if (err.name !== 'contact_already_exists') {
        return jsonResponse(
          request,
          env,
          { error: 'Failed to subscribe, please try again.' },
          { status: 500 }
        );
      }
    }
  }

  return jsonResponse(request, env, { ok: true });
}

async function refreshBtcScore(env: Env) {
  const errors: string[] = [];
  const upstream = env.BTC_SCORE_UPSTREAM || 'https://brief.day1global.xyz/api/btc-score';
  const data = await fetchJson<Record<string, unknown>>(upstream, errors);
  if (!data) {
    throw new Error(errors.join('; ') || 'BTC score upstream unavailable');
  }
  return data;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function average(values: number[]) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function emptyListing(): ExchangeListing {
  return {
    spot: false,
    perp: false,
    spotListedAt: null,
    perpListedAt: null,
    spotPairs: [],
    perpPairs: [],
  };
}

function computeSignal(
  coin: Pick<ListingCoin, 'binance' | 'coinbase' | 'upbit' | 'spotExchanges' | 'perpExchanges'>
): SignalRating {
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

async function fetchOkxSpot(since: number, errors: string[]): Promise<RawInstrument[]> {
  type Resp = { data?: Array<{ instId?: string; listTime?: string }> };
  const data = await fetchJson<Resp>('https://www.okx.com/api/v5/public/instruments?instType=SPOT', errors);
  return (data?.data ?? [])
    .filter((item) => item.listTime && Number(item.listTime) >= since && item.instId)
    .map((item) => ({
      symbol: String(item.instId).split('-')[0].toUpperCase(),
      pair: String(item.instId),
      type: 'spot',
      listedAt: Number(item.listTime),
    }));
}

async function fetchOkxSwap(since: number, errors: string[]): Promise<RawInstrument[]> {
  type Resp = { data?: Array<{ instId?: string; listTime?: string }> };
  const data = await fetchJson<Resp>('https://www.okx.com/api/v5/public/instruments?instType=SWAP', errors);
  return (data?.data ?? [])
    .filter((item) => item.listTime && Number(item.listTime) >= since && item.instId)
    .map((item) => ({
      symbol: String(item.instId).split('-')[0].toUpperCase(),
      pair: String(item.instId),
      type: 'perp',
      listedAt: Number(item.listTime),
    }));
}

async function fetchBybitLinear(since: number, errors: string[]): Promise<RawInstrument[]> {
  type Resp = {
    result?: {
      list?: Array<{
        symbol?: string;
        baseCoin?: string;
        launchTime?: string;
        contractType?: string;
      }>;
    };
  };
  const data = await fetchJson<Resp>(
    'https://api.bybit.com/v5/market/instruments-info?category=linear&limit=1000',
    errors
  );
  return (data?.result?.list ?? [])
    .filter(
      (item) =>
        item.launchTime &&
        Number(item.launchTime) >= since &&
        item.contractType === 'LinearPerpetual' &&
        item.baseCoin &&
        item.symbol
    )
    .map((item) => ({
      symbol: String(item.baseCoin).toUpperCase(),
      pair: String(item.symbol),
      type: 'perp',
      listedAt: Number(item.launchTime),
    }));
}

async function fetchBitgetSpot(since: number, errors: string[]): Promise<RawInstrument[]> {
  type Resp = { data?: Array<{ symbol?: string; baseCoin?: string; openTime?: string }> };
  const data = await fetchJson<Resp>('https://api.bitget.com/api/v2/spot/public/symbols', errors);
  return (data?.data ?? [])
    .filter((item) => item.openTime && Number(item.openTime) >= since && item.baseCoin && item.symbol)
    .map((item) => ({
      symbol: String(item.baseCoin).toUpperCase(),
      pair: String(item.symbol),
      type: 'spot',
      listedAt: Number(item.openTime),
    }));
}

async function fetchCoinbaseSpot(since: number, errors: string[]): Promise<RawInstrument[]> {
  type Resp = {
    products?: Array<{
      product_id?: string;
      base_currency_id?: string;
      new_at?: string | null;
    }>;
  };
  const data = await fetchJson<Resp>(
    'https://api.coinbase.com/api/v3/brokerage/market/products?product_type=SPOT&limit=500',
    errors
  );
  return (data?.products ?? [])
    .filter(
      (item) =>
        item.new_at &&
        new Date(item.new_at).getTime() >= since &&
        item.base_currency_id &&
        item.product_id
    )
    .map((item) => ({
      symbol: String(item.base_currency_id).toUpperCase(),
      pair: String(item.product_id),
      type: 'spot',
      listedAt: new Date(String(item.new_at)).getTime(),
    }));
}

async function fetchBinanceFutures(since: number, errors: string[]): Promise<RawInstrument[]> {
  type Resp = {
    symbols?: Array<{
      symbol?: string;
      baseAsset?: string;
      onboardDate?: number;
      contractType?: string;
    }>;
  };
  const data = await fetchJson<Resp>('https://fapi.binance.com/fapi/v1/exchangeInfo', errors);
  return (data?.symbols ?? [])
    .filter(
      (item) =>
        item.onboardDate &&
        item.onboardDate >= since &&
        item.contractType === 'PERPETUAL' &&
        item.baseAsset &&
        item.symbol
    )
    .map((item) => ({
      symbol: String(item.baseAsset).toUpperCase(),
      pair: String(item.symbol),
      type: 'perp',
      listedAt: Number(item.onboardDate),
    }));
}

async function getBinanceSpotSet(errors: string[]) {
  type Resp = { symbols?: Array<{ baseAsset?: string; status?: string }> };
  const data = await fetchJson<Resp>('https://api.binance.com/api/v3/exchangeInfo', errors);
  const symbols = new Set<string>();
  for (const item of data?.symbols ?? []) {
    if (item.status === 'TRADING' && item.baseAsset) {
      symbols.add(item.baseAsset.toUpperCase());
    }
  }
  return symbols;
}

async function getUpbitSet(errors: string[]) {
  type Item = { market?: string };
  const data = await fetchJson<Item[]>('https://api.upbit.com/v1/market/all', errors);
  const symbols = new Set<string>();
  for (const item of data ?? []) {
    const parts = String(item.market ?? '').split('-');
    if (parts.length === 2) symbols.add(parts[1].toUpperCase());
  }
  return symbols;
}

async function getHyperliquidSet(errors: string[]) {
  type Resp = { universe?: Array<{ name?: string }> };
  const data = await fetchJson<Resp>('https://api.hyperliquid.xyz/info', errors, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'meta' }),
  });
  const symbols = new Set<string>();
  for (const item of data?.universe ?? []) {
    if (item.name) symbols.add(item.name.toUpperCase());
  }
  return symbols;
}

async function getBinanceAlphaSet(errors: string[]) {
  type Item = { symbol?: string };
  const symbols = new Set<string>();
  await Promise.all(
    [1, 2].map(async (page) => {
      const data = await fetchJson<Item[]>(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=binance-alpha-spotlight&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`,
        errors
      );
      for (const item of data ?? []) {
        if (item.symbol) symbols.add(item.symbol.toUpperCase());
      }
    })
  );
  return symbols;
}

async function fetchCoinGeckoMarkets(errors: string[]) {
  type Item = {
    symbol?: string;
    current_price?: number | null;
    market_cap?: number | null;
    fully_diluted_valuation?: number | null;
    total_volume?: number | null;
    price_change_percentage_24h?: number | null;
  };
  const result = new Map<
    string,
    {
      price: number | null;
      change: number | null;
      volume: number | null;
      marketCap: number | null;
      fdv: number | null;
    }
  >();
  await Promise.all(
    [1, 2, 3].map(async (page) => {
      const data = await fetchJson<Item[]>(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`,
        errors
      );
      for (const item of data ?? []) {
        const symbol = item.symbol?.toUpperCase();
        if (!symbol || result.has(symbol)) continue;
        result.set(symbol, {
          price: item.current_price ?? null,
          change: item.price_change_percentage_24h ?? null,
          volume: item.total_volume ?? null,
          marketCap: item.market_cap ?? null,
          fdv: item.fully_diluted_valuation ?? null,
        });
      }
    })
  );
  return result;
}

async function fetchBinancePrices(symbols: string[], errors: string[]) {
  type Item = { symbol?: string; openPrice?: string; lastPrice?: string; quoteVolume?: string };
  const result = new Map<string, { price: number; change: number; volume: number }>();
  const chunkSize = 100;
  const chunks: string[][] = [];
  for (let i = 0; i < symbols.length; i += chunkSize) {
    chunks.push(symbols.slice(i, i + chunkSize));
  }

  await Promise.all(
    chunks.map(async (chunk) => {
      const pairs = chunk.map((symbol) => `"${symbol}USDT"`).join(',');
      const data = await fetchJson<Item[]>(
        `https://api.binance.com/api/v3/ticker/24hr?symbols=[${pairs}]&type=MINI`,
        errors
      );
      for (const item of data ?? []) {
        if (!item.symbol) continue;
        const base = item.symbol.replace(/USDT$/, '');
        const open = Number(item.openPrice);
        const last = Number(item.lastPrice);
        const change = open > 0 ? ((last - open) / open) * 100 : 0;
        result.set(base, {
          price: last,
          change,
          volume: Number(item.quoteVolume),
        });
      }
    })
  );

  return result;
}

async function refreshWatchData(): Promise<WatchData> {
  const errors: string[] = [];
  const generatedAt = new Date().toISOString();
  const lookbackDays = 30;
  const since = Date.now() - lookbackDays * 24 * 3600 * 1000;

  const [
    okxSpot,
    okxSwap,
    bybitPerp,
    bitgetSpot,
    cbSpot,
    bnbFutures,
    bnbSpotSet,
    upbitSet,
    hlSet,
    bnbAlphaSet,
    fngRaw,
    globalRaw,
    markets,
  ] = await Promise.all([
    fetchOkxSpot(since, errors),
    fetchOkxSwap(since, errors),
    fetchBybitLinear(since, errors),
    fetchBitgetSpot(since, errors),
    fetchCoinbaseSpot(since, errors),
    fetchBinanceFutures(since, errors),
    getBinanceSpotSet(errors),
    getUpbitSet(errors),
    getHyperliquidSet(errors),
    getBinanceAlphaSet(errors),
    fetchJson<{ data?: Array<{ value?: string; value_classification?: string }> }>(
      'https://api.alternative.me/fng/?limit=1',
      errors
    ),
    fetchJson<{
      data?: {
        total_market_cap?: Record<string, number>;
        market_cap_percentage?: Record<string, number>;
        market_cap_change_percentage_24h_usd?: number;
        active_cryptocurrencies?: number;
        markets?: number;
      };
    }>('https://api.coingecko.com/api/v3/global', errors),
    fetchCoinGeckoMarkets(errors),
  ]);

  const timed = [...okxSpot, ...okxSwap, ...bybitPerp, ...bitgetSpot, ...cbSpot, ...bnbFutures];
  const symbolSet = new Set(timed.map((item) => item.symbol));
  for (const symbol of bnbAlphaSet) symbolSet.add(symbol);

  const excluded = new Set(['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'FDUSD', 'USD1', 'USDE']);
  for (const symbol of [...symbolSet]) {
    if (excluded.has(symbol) || symbol.endsWith('USD') || symbol.endsWith('USDT')) {
      symbolSet.delete(symbol);
    }
  }

  const coinMap = new Map<
    string,
    Record<ExchangeKey, ExchangeListing> & { firstSeenAt: number }
  >();

  function getOrCreate(symbol: string) {
    let coin = coinMap.get(symbol);
    if (!coin) {
      coin = {
        binance: emptyListing(),
        okx: emptyListing(),
        bybit: emptyListing(),
        bitget: emptyListing(),
        coinbase: emptyListing(),
        upbit: emptyListing(),
        hyperliquid: emptyListing(),
        firstSeenAt: Date.now(),
      };
      coinMap.set(symbol, coin);
    }
    return coin;
  }

  function applyInstrument(inst: RawInstrument, exchange: ExchangeKey) {
    if (!symbolSet.has(inst.symbol)) return;
    const coin = getOrCreate(inst.symbol);
    const listing = coin[exchange];
    if (inst.type === 'spot') {
      listing.spot = true;
      listing.spotListedAt = listing.spotListedAt
        ? Math.min(listing.spotListedAt, inst.listedAt)
        : inst.listedAt;
      if (!listing.spotPairs.includes(inst.pair)) listing.spotPairs.push(inst.pair);
    } else {
      listing.perp = true;
      listing.perpListedAt = listing.perpListedAt
        ? Math.min(listing.perpListedAt, inst.listedAt)
        : inst.listedAt;
      if (!listing.perpPairs.includes(inst.pair)) listing.perpPairs.push(inst.pair);
    }
    coin.firstSeenAt = Math.min(coin.firstSeenAt, inst.listedAt);
  }

  for (const inst of okxSpot) applyInstrument(inst, 'okx');
  for (const inst of okxSwap) applyInstrument(inst, 'okx');
  for (const inst of bybitPerp) applyInstrument(inst, 'bybit');
  for (const inst of bitgetSpot) applyInstrument(inst, 'bitget');
  for (const inst of cbSpot) applyInstrument(inst, 'coinbase');
  for (const inst of bnbFutures) applyInstrument(inst, 'binance');

  for (const symbol of symbolSet) {
    const coin = getOrCreate(symbol);
    if (bnbSpotSet.has(symbol)) coin.binance.spot = true;
    if (upbitSet.has(symbol)) coin.upbit.spot = true;
    if (hlSet.has(symbol)) coin.hyperliquid.perp = true;
  }

  const prices = await fetchBinancePrices([...coinMap.keys()], errors);
  const listings: ListingCoin[] = [];

  for (const [symbol, coin] of coinMap) {
    const spotExchanges = (['binance', 'okx', 'bybit', 'bitget', 'coinbase', 'upbit'] as const)
      .filter((exchange) => coin[exchange].spot);
    const perpExchanges = (['binance', 'okx', 'bybit', 'bitget', 'hyperliquid'] as const)
      .filter((exchange) => coin[exchange].perp);
    const market = markets.get(symbol);
    const price = prices.get(symbol);
    const anySpot = spotExchanges.length > 0;
    const anyPerp = perpExchanges.length > 0;
    const perpWithoutSpot = anyPerp && !anySpot;
    const multiExchangeSpot = spotExchanges.length >= 3;
    const perpLed = anyPerp && !coin.binance.spot && !coin.coinbase.spot;
    const notes: string[] = [];

    if (perpWithoutSpot) notes.push(`Perp only (${perpExchanges.join(', ')}) - no spot`);
    else if (perpLed) notes.push('Perp-led - not on Binance/CB spot yet');
    if (multiExchangeSpot) notes.push(`Spot on ${spotExchanges.length} exchanges`);
    if (!coin.binance.spot && spotExchanges.length >= 2) notes.push('Not on Binance spot yet');
    if (coin.upbit.spot && spotExchanges.length <= 2) notes.push('Upbit KRW - Korean premium risk');
    if (bnbAlphaSet.has(symbol)) notes.unshift('Binance Alpha listed');

    const partial = {
      binance: coin.binance,
      coinbase: coin.coinbase,
      upbit: coin.upbit,
      spotExchanges,
      perpExchanges,
    };

    const buySignal =
      (bnbAlphaSet.has(symbol) || (coin.binance.spot && coin.binance.perp)) &&
      market?.marketCap !== null &&
      market?.marketCap !== undefined &&
      market.marketCap < 30_000_000;

    listings.push({
      symbol,
      firstSeenAt: coin.firstSeenAt,
      priceUsdt: price?.price ?? market?.price ?? null,
      priceChange24h: price?.change ?? market?.change ?? null,
      volume24h: price?.volume ?? market?.volume ?? null,
      marketCap: market?.marketCap ?? null,
      fdv: market?.fdv ?? null,
      binance: coin.binance,
      okx: coin.okx,
      bybit: coin.bybit,
      bitget: coin.bitget,
      coinbase: coin.coinbase,
      upbit: coin.upbit,
      hyperliquid: coin.hyperliquid,
      spotExchanges: [...spotExchanges],
      perpExchanges: [...perpExchanges],
      listingSequence: computeSequence(anySpot, anyPerp),
      signalRating: computeSignal(partial),
      perpWithoutSpot,
      multiExchangeSpot,
      perpLed,
      noteworthy: notes.join(' · '),
      binanceAlpha: bnbAlphaSet.has(symbol),
      buySignal,
    });
  }

  const order: Record<SignalRating, number> = { S: 0, A: 1, B: 2, C: 3, D: 4, R: 5 };
  listings.sort((a, b) => {
    const byRating = order[a.signalRating] - order[b.signalRating];
    return byRating === 0 ? b.firstSeenAt - a.firstSeenAt : byRating;
  });

  return {
    generatedAt,
    fearGreed: fngRaw?.data?.[0]
      ? {
          value: Number(fngRaw.data[0].value),
          label: String(fngRaw.data[0].value_classification ?? ''),
        }
      : null,
    global: {
      totalMarketCapUsd: globalRaw?.data?.total_market_cap?.usd ?? null,
      btcDominance: globalRaw?.data?.market_cap_percentage?.btc ?? null,
      ethDominance: globalRaw?.data?.market_cap_percentage?.eth ?? null,
      marketCapChange24h: globalRaw?.data?.market_cap_change_percentage_24h_usd ?? null,
      activeCryptocurrencies: globalRaw?.data?.active_cryptocurrencies ?? null,
      markets: globalRaw?.data?.markets ?? null,
    },
    listings,
    lookbackDays,
    errors,
  };
}

function buildBottomSignals(data: FearDashboardData): BottomSignal[] {
  const fundingSeries = data.layer3.fundingRate === null ? [] : [data.layer3.fundingRate];

  return [
    {
      label: 'BTC price below Realized Price',
      status:
        data.layer1.btcPrice !== null && data.layer1.realizedPrice !== null
          ? data.layer1.btcPrice < data.layer1.realizedPrice
            ? 'on'
            : 'off'
          : 'unknown',
      detail:
        data.layer1.btcPrice !== null && data.layer1.realizedPrice !== null
          ? `${data.layer1.btcPrice.toFixed(0)} < ${data.layer1.realizedPrice.toFixed(0)}`
          : 'Missing BTC price or realized price',
    },
    {
      label: 'MVRV Z-score below -1',
      status:
        data.layer1.mvrvZ !== null ? (data.layer1.mvrvZ < -1 ? 'on' : 'off') : 'unknown',
      detail:
        data.layer1.mvrvZ !== null
          ? `Current ${data.layer1.mvrvZ.toFixed(2)}`
          : 'Missing MVRV Z-score',
    },
    {
      label: 'Fear and Greed index below 20',
      status:
        data.layer3.fearGreed !== null
          ? data.layer3.fearGreed < 20
            ? 'on'
            : 'off'
          : 'unknown',
      detail:
        data.layer3.fearGreed !== null
          ? `Current ${data.layer3.fearGreed} (${data.layer3.fearGreedClass ?? 'N/A'})`
          : 'Missing fear and greed index',
    },
    {
      label: 'Dormancy flow extremely low',
      status:
        data.layer2.dormancyFlow !== null
          ? data.layer2.dormancyFlow < 450000
            ? 'on'
            : 'off'
          : 'unknown',
      detail:
        data.layer2.dormancyFlow !== null
          ? `Current ${data.layer2.dormancyFlow.toFixed(0)}`
          : 'Missing dormancy flow',
    },
    {
      label: 'Active addresses rising',
      status:
        data.layer2.activeAddressesRising === null
          ? 'unknown'
          : data.layer2.activeAddressesRising
            ? 'on'
            : 'off',
      detail:
        data.layer2.activeAddressesRising === null
          ? 'Need 14-day active address history'
          : data.layer2.activeAddressesRising
            ? '7d average is rising'
            : '7d average is not rising',
    },
    {
      label: 'VIX above 30',
      status:
        data.layer5.vix !== null ? (data.layer5.vix > 30 ? 'on' : 'off') : 'unknown',
      detail:
        data.layer5.vix !== null
          ? `Current ${data.layer5.vix.toFixed(2)}`
          : 'Missing VIX',
    },
    {
      label: 'S&P 500 drawdown above 20%',
      status:
        data.layer5.sp500Drawdown !== null
          ? data.layer5.sp500Drawdown > 20
            ? 'on'
            : 'off'
          : 'unknown',
      detail:
        data.layer5.sp500Drawdown !== null
          ? `Current ${data.layer5.sp500Drawdown.toFixed(2)}%`
          : 'Missing S&P 500 drawdown',
    },
    {
      label: 'Funding rate negative for extended period',
      status:
        fundingSeries.length > 0
          ? fundingSeries.every((value) => value < 0)
            ? 'on'
            : 'off'
          : 'unknown',
      detail:
        fundingSeries.length > 0
          ? `Current ${Math.min(...fundingSeries).toExponential(2)}`
          : 'Need funding data',
    },
  ];
}

function compositeScore(signals: BottomSignal[]) {
  const values: number[] = signals.map((signal) => {
    if (signal.status === 'on') return 100;
    if (signal.status === 'unknown') return 50;
    return 0;
  });
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

async function refreshFearData(): Promise<FearDashboardData> {
  const errors: string[] = [];
  type Coin = { market_data?: { current_price?: { usd?: number }; market_cap?: { usd?: number } } };
  type Chart = { prices?: Array<[number, number]> };
  type Fng = { data?: Array<{ value?: string; value_classification?: string }> };
  type BlockchainChart = { values?: Array<{ x?: number; y?: number }> };
  type HlResp = [
    { universe?: Array<{ name?: string }> },
    Array<{ funding?: string; openInterest?: string; markPx?: string }>
  ];

  const [
    coin,
    btcChart,
    fngNow,
    fngHistory,
    activeAddressesRaw,
    txCountRaw,
    newAddressesRaw,
    mempoolRaw,
    hyperliquidRaw,
  ] = await Promise.all([
    fetchJson<Coin>(
      'https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false',
      errors
    ),
    fetchJson<Chart>(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=180&interval=daily',
      errors
    ),
    fetchJson<Fng>('https://api.alternative.me/fng/?limit=1', errors),
    fetchJson<Fng>('https://api.alternative.me/fng/?limit=180', errors),
    fetchJson<BlockchainChart>('https://api.blockchain.info/charts/n-active-addresses?timespan=180days&format=json', errors),
    fetchJson<BlockchainChart>('https://api.blockchain.info/charts/n-transactions?timespan=180days&format=json', errors),
    fetchJson<BlockchainChart>('https://api.blockchain.info/charts/n-new-addresses?timespan=180days&format=json', errors),
    fetchJson<BlockchainChart>('https://api.blockchain.info/charts/mempool-size?timespan=30days&format=json', errors),
    fetchJson<HlResp>('https://api.hyperliquid.xyz/info', errors, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
    }),
  ]);

  const btcPrices = (btcChart?.prices ?? [])
    .map((point) => asNumber(point[1]))
    .filter((value): value is number => value !== null);
  const activeSeries = (activeAddressesRaw?.values ?? [])
    .map((point) => asNumber(point.y))
    .filter((value): value is number => value !== null);
  const activeRecentAvg = average(activeSeries.slice(-7));
  const activePrevAvg = average(activeSeries.slice(-14, -7));
  const txSeries = (txCountRaw?.values ?? [])
    .map((point) => asNumber(point.y))
    .filter((value): value is number => value !== null);
  const newAddrSeries = (newAddressesRaw?.values ?? [])
    .map((point) => asNumber(point.y))
    .filter((value): value is number => value !== null);
  const mempoolSeries = (mempoolRaw?.values ?? [])
    .map((point) => asNumber(point.y))
    .filter((value): value is number => value !== null);
  const hyperliquidIndex = hyperliquidRaw?.[0]?.universe?.findIndex(
    (item) => item.name?.toUpperCase() === 'BTC'
  ) ?? -1;
  const hyperliquidCtx =
    hyperliquidIndex >= 0 ? hyperliquidRaw?.[1]?.[hyperliquidIndex] : undefined;

  const data: FearDashboardData = {
    generatedAt: new Date().toISOString(),
    sources: [],
    layer1: {
      btcPrice:
        coin?.market_data?.current_price?.usd ??
        btcPrices.at(-1) ??
        MANUAL_FEAR_SNAPSHOT.layer1.btcPrice,
      marketCap:
        coin?.market_data?.market_cap?.usd ?? MANUAL_FEAR_SNAPSHOT.layer1.marketCap,
      realizedCap: null,
      realizedPrice: MANUAL_FEAR_SNAPSHOT.layer1.realizedPrice,
      mvrv: MANUAL_FEAR_SNAPSHOT.layer1.mvrv,
      mvrvZ: null,
      ma200Week: MANUAL_FEAR_SNAPSHOT.layer1.ma200Week,
      btcPriceSeries: btcPrices,
    },
    layer2: {
      activeAddresses: activeSeries.at(-1) ?? MANUAL_FEAR_SNAPSHOT.layer2.activeAddresses,
      newAddresses: newAddrSeries.at(-1) ?? null,
      txCount: txSeries.at(-1) ?? null,
      mempoolStats: mempoolSeries.at(-1) ?? null,
      nvt: MANUAL_FEAR_SNAPSHOT.layer2.nvt,
      exchangeReserve: MANUAL_FEAR_SNAPSHOT.layer2.exchangeReserve,
      minerFlow: null,
      exchangeInflow: null,
      exchangeOutflow: null,
      activeAddressesRising:
        activeRecentAvg !== null && activePrevAvg !== null
          ? activeRecentAvg > activePrevAvg
          : null,
      dormancyFlow: null,
      coinDaysDestroyed: null,
      lthSopr: MANUAL_FEAR_SNAPSHOT.layer2.lthSopr,
    },
    layer3: {
      fearGreed: asNumber(fngNow?.data?.[0]?.value) ?? MANUAL_FEAR_SNAPSHOT.layer3.fearGreed,
      fearGreedClass:
        fngNow?.data?.[0]?.value_classification ??
        MANUAL_FEAR_SNAPSHOT.layer3.fearGreedClass,
      fearGreedSeries: (fngHistory?.data ?? [])
        .map((item) => asNumber(item.value))
        .filter((value): value is number => value !== null)
        .reverse(),
      fundingRate:
        asNumber(hyperliquidCtx?.funding) ?? MANUAL_FEAR_SNAPSHOT.layer3.fundingRate,
      openInterest:
        asNumber(hyperliquidCtx?.openInterest) ?? MANUAL_FEAR_SNAPSHOT.layer3.openInterest,
      longShortRatio: null,
      liquidations: MANUAL_FEAR_SNAPSHOT.layer3.liquidations,
    },
    layer4: {
      sp500: null,
      nasdaq: null,
      gold: MANUAL_FEAR_SNAPSHOT.layer4.gold,
      crudeOil: MANUAL_FEAR_SNAPSHOT.layer4.crudeOil,
      dxy: MANUAL_FEAR_SNAPSHOT.layer4.dxy,
      corrBtcSp500: null,
      corrBtcGold: null,
      corrBtcDxy: null,
    },
    layer5: {
      vix: MANUAL_FEAR_SNAPSHOT.layer5.vix,
      move: null,
      yieldCurveSpread: null,
      sp500Drawdown: null,
      putCallRatio: null,
    },
    bottomSignals: [],
    compositeScore: MANUAL_FEAR_SNAPSHOT.model.compositeScore,
  };

  data.bottomSignals = buildBottomSignals(data);
  data.compositeScore = compositeScore(data.bottomSignals);
  data.sources = [
    {
      name: 'Cloudflare Worker Cache',
      status: 'ok',
      detail: 'Runtime cache refreshed by Worker route and scheduled cron',
    },
    {
      name: 'CoinGecko API',
      status: coin || btcChart ? 'ok' : 'degraded',
      detail: coin || btcChart ? 'BTC market data available' : 'Fallback snapshot in use',
    },
    {
      name: 'Alternative.me API',
      status: fngNow ? 'ok' : 'degraded',
      detail: fngNow ? 'Fear & Greed available' : 'Fallback snapshot in use',
    },
    {
      name: 'Blockchain.com API',
      status: activeAddressesRaw || txCountRaw || newAddressesRaw ? 'ok' : 'degraded',
      detail:
        activeAddressesRaw || txCountRaw || newAddressesRaw
          ? 'On-chain activity available'
          : 'Fallback snapshot in use',
    },
    {
      name: 'Hyperliquid API',
      status: hyperliquidCtx ? 'ok' : 'degraded',
      detail: hyperliquidCtx ? 'BTC perp context available' : 'Fallback snapshot in use',
    },
    {
      name: 'Research Snapshot (Manual)',
      status: 'ok',
      detail: `Manual fallback as of ${MANUAL_FEAR_SNAPSHOT.asOf}`,
    },
    ...(errors.length
      ? [{
          name: 'Fetch Errors',
          status: 'degraded' as const,
          detail: `${errors.length} source fetch error(s) during Worker refresh`,
        }]
      : []),
  ];

  return data;
}

async function refreshAndCache(key: string, ttl: number, refresh: () => Promise<unknown>) {
  const data = await refresh();
  await putCache(key, data, ttl);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      const headers = new Headers();
      addCorsHeaders(headers, request, env);
      return new Response(null, { status: 204, headers });
    }

    if (url.pathname === '/api/subscribe' && request.method === 'POST') {
      return handleSubscribe(request, env);
    }

    if (url.pathname === '/api/btc-score' && request.method === 'GET') {
      return getCachedJson(request, env, ctx, 'btc-score', BTC_SCORE_TTL, () =>
        refreshBtcScore(env)
      );
    }

    if (url.pathname === '/api/fear-data' && request.method === 'GET') {
      return getCachedJson(request, env, ctx, 'fear-data', FEAR_TTL, refreshFearData);
    }

    if (url.pathname === '/api/watch-data' && request.method === 'GET') {
      return getCachedJson(request, env, ctx, 'watch-data', WATCH_TTL, refreshWatchData);
    }

    return jsonResponse(request, env, { error: 'Not found' }, { status: 404 });
  },

  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(refreshAndCache('btc-score', BTC_SCORE_TTL, () => refreshBtcScore(env)));
    ctx.waitUntil(refreshAndCache('fear-data', FEAR_TTL, refreshFearData));
    ctx.waitUntil(refreshAndCache('watch-data', WATCH_TTL, refreshWatchData));
  },
};
