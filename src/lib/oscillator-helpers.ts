export type ResearchFocusItem = {
  name: string;
  slug: string;
  type: string;
};

export type CoinGeckoMarketCoin = {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number | null;
  current_price: number | null;
  market_cap: number | null;
  total_volume: number | null;
  price_change_percentage_24h: number | null;
  price_change_percentage_7d_in_currency?: number | null;
  price_change_percentage_30d_in_currency?: number | null;
};

export type CoinMarketCapQuote = {
  name?: string;
  price?: number | null;
  marketCap?: number | null;
  volume24h?: number | null;
  percentChange24h?: number | null;
  percentChange7d?: number | null;
  percentChange30d?: number | null;
};

export type CoinMarketCapListing = {
  id: number;
  name: string;
  symbol: string;
  slug?: string;
  cmcRank: number | null;
  marketPairCount?: number | null;
  quotes?: CoinMarketCapQuote[] | null;
};

export type BinanceBtcTicker = {
  symbol: string;
  status?: string;
  baseAsset?: string;
  quoteAsset?: string;
  isSpotTradingAllowed?: boolean;
  lastPrice?: string;
  priceChangePercent?: string;
  quoteVolume?: string;
};

export type BinanceBtcMarket = {
  symbol: string;
  price: number | null;
  priceChangePercent: number | null;
  quoteVolume: number | null;
};

export type MarketSourceCoin = {
  id: string;
  symbol: string;
  name: string;
  coingeckoRank: number | null;
  coinmarketcapRank: number | null;
  dualTop300: boolean;
  researchFocus: boolean;
  researchSlug: string | null;
  researchType: string | null;
  currentPriceUsd: number | null;
  marketCap: number | null;
  volume24h: number | null;
  volumeToMarketCap: number | null;
  change24h: number | null;
  change7d: number | null;
  change30d: number | null;
};

const EXCLUDED_SYMBOLS = new Set([
  'BTC',
  'WBTC',
  'BTCB',
  'CBBTC',
  'TBTC',
  'EBTC',
  'STBTC',
  'LBTC',
  'USDT',
  'USDC',
  'USDS',
  'FDUSD',
  'TUSD',
  'USDE',
  'DAI',
  'USD0',
  'USDD',
  'PYUSD',
  'GHO',
  'FRAX',
]);

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildSymbolIndex(coins: CoinGeckoMarketCoin[]) {
  const index = new Map<string, CoinGeckoMarketCoin[]>();
  for (const coin of coins) {
    const symbol = coin.symbol.toUpperCase();
    const list = index.get(symbol) ?? [];
    list.push(coin);
    index.set(symbol, list);
  }
  return index;
}

export function isExcludedFromAltUniverse(symbol: string, name: string): boolean {
  const upperSymbol = symbol.toUpperCase();
  if (EXCLUDED_SYMBOLS.has(upperSymbol)) return true;

  const lowerName = name.toLowerCase();
  return (
    lowerName.includes('stablecoin') ||
    lowerName.includes('wrapped bitcoin') ||
    lowerName === 'bitcoin'
  );
}

export function mergeMarketSources(
  coingeckoCoins: CoinGeckoMarketCoin[],
  coinmarketcapCoins: CoinMarketCapListing[],
  researchFocusMap: Map<string, ResearchFocusItem>
): MarketSourceCoin[] {
  const symbolIndex = buildSymbolIndex(coingeckoCoins);
  const merged = new Map<string, MarketSourceCoin>();

  for (const coin of coingeckoCoins) {
    if (isExcludedFromAltUniverse(coin.symbol, coin.name)) continue;

    const symbol = coin.symbol.toUpperCase();
    const research = researchFocusMap.get(symbol) ?? null;
    const marketCap = toNumber(coin.market_cap);
    const volume24h = toNumber(coin.total_volume);

    merged.set(symbol, {
      id: coin.id,
      symbol,
      name: coin.name,
      coingeckoRank: coin.market_cap_rank ?? null,
      coinmarketcapRank: null,
      dualTop300: false,
      researchFocus: Boolean(research),
      researchSlug: research?.slug ?? null,
      researchType: research?.type ?? null,
      currentPriceUsd: toNumber(coin.current_price),
      marketCap,
      volume24h,
      volumeToMarketCap:
        marketCap && volume24h ? volume24h / marketCap : null,
      change24h: toNumber(coin.price_change_percentage_24h),
      change7d: toNumber(coin.price_change_percentage_7d_in_currency),
      change30d: toNumber(coin.price_change_percentage_30d_in_currency),
    });
  }

  for (const coin of coinmarketcapCoins) {
    if (isExcludedFromAltUniverse(coin.symbol, coin.name)) continue;

    const symbol = coin.symbol.toUpperCase();
    const research = researchFocusMap.get(symbol) ?? null;
    const candidates = symbolIndex.get(symbol) ?? [];
    const exact = candidates.find(
      (candidate) => normalizeName(candidate.name) === normalizeName(coin.name)
    );
    const match = exact ?? (candidates.length === 1 ? candidates[0] : null);
    const quote = coin.quotes?.[0];
    const existing = merged.get(symbol);
    const marketCap = existing?.marketCap ?? toNumber(quote?.marketCap);
    const volume24h = existing?.volume24h ?? toNumber(quote?.volume24h);

    merged.set(symbol, {
      id: existing?.id ?? match?.id ?? coin.slug ?? symbol.toLowerCase(),
      symbol,
      name: existing?.name ?? match?.name ?? coin.name,
      coingeckoRank: existing?.coingeckoRank ?? match?.market_cap_rank ?? null,
      coinmarketcapRank: coin.cmcRank ?? null,
      dualTop300: Boolean(existing || match),
      researchFocus: existing?.researchFocus ?? Boolean(research),
      researchSlug: existing?.researchSlug ?? research?.slug ?? null,
      researchType: existing?.researchType ?? research?.type ?? null,
      currentPriceUsd:
        existing?.currentPriceUsd ?? toNumber(quote?.price),
      marketCap,
      volume24h,
      volumeToMarketCap:
        marketCap && volume24h ? volume24h / marketCap : null,
      change24h: existing?.change24h ?? toNumber(quote?.percentChange24h),
      change7d: existing?.change7d ?? toNumber(quote?.percentChange7d),
      change30d: existing?.change30d ?? toNumber(quote?.percentChange30d),
    });
  }

  return Array.from(merged.values()).sort((left, right) => {
    const leftResearch = left.researchFocus ? 0 : 1;
    const rightResearch = right.researchFocus ? 0 : 1;
    if (leftResearch !== rightResearch) return leftResearch - rightResearch;

    const leftRank =
      left.coingeckoRank ?? left.coinmarketcapRank ?? Number.MAX_SAFE_INTEGER;
    const rightRank =
      right.coingeckoRank ?? right.coinmarketcapRank ?? Number.MAX_SAFE_INTEGER;
    return leftRank - rightRank;
  });
}

export function pickBinanceBtcMarket(
  baseSymbol: string,
  tickers: BinanceBtcTicker[]
): BinanceBtcMarket | null {
  const upperBase = baseSymbol.toUpperCase();
  const ticker = tickers.find(
    (item) =>
      item.baseAsset?.toUpperCase() === upperBase &&
      item.quoteAsset === 'BTC' &&
      item.isSpotTradingAllowed &&
      item.status === 'TRADING'
  );

  if (!ticker) return null;

  return {
    symbol: ticker.symbol,
    price: toNumber(ticker.lastPrice),
    priceChangePercent: toNumber(ticker.priceChangePercent),
    quoteVolume: toNumber(ticker.quoteVolume),
  };
}
