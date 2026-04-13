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

export type SurfMarketRankingCoin = {
  symbol?: string;
  name?: string;
  rank?: number | null;
  price_usd?: number | null;
  market_cap_usd?: number | null;
  volume_24h_usd?: number | null;
  change_24h_pct?: number | null;
};

export type MarketSourceCoin = {
  id: string;
  symbol: string;
  name: string;
  coingeckoRank: number | null;
  coinmarketcapRank: number | null;
  marketRank: number | null;
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

export type PaginationSlice<T> = {
  items: T[];
  currentPage: number;
  totalPages: number;
  start: number;
  end: number;
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
const SUBSCRIPT_DIGITS = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
};

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toSubscript(value: number): string {
  return String(value)
    .split('')
    .map((digit) => SUBSCRIPT_DIGITS[digit as keyof typeof SUBSCRIPT_DIGITS] ?? digit)
    .join('');
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

export function formatAltBtcRatio(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return 'N/A';

  const sign = value < 0 ? '-' : '';
  const absolute = Math.abs(value);

  if (absolute === 0) return '0.000000';
  if (absolute >= 0.0001) return `${sign}${absolute.toFixed(6)}`;

  const [mantissa, exponentValue] = absolute.toExponential(12).split('e');
  const exponent = Number(exponentValue);

  if (!Number.isFinite(exponent) || exponent >= 0) {
    return `${sign}${absolute.toFixed(6)}`;
  }

  const zeroCount = Math.abs(exponent) - 1;
  const significantDigits = mantissa.replace('.', '').slice(0, 4).padEnd(4, '0');

  return `${sign}0.0${toSubscript(zeroCount)}${significantDigits}`;
}

export function paginateCollection<T>(
  items: T[],
  currentPage: number,
  pageSize: number
): PaginationSlice<T> {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const totalPages = Math.max(1, Math.ceil(items.length / safePageSize));
  const normalizedPage = Math.min(Math.max(1, Math.floor(currentPage)), totalPages);
  const offset = (normalizedPage - 1) * safePageSize;
  const pageItems = items.slice(offset, offset + safePageSize);

  return {
    items: pageItems,
    currentPage: normalizedPage,
    totalPages,
    start: pageItems.length ? offset + 1 : 0,
    end: pageItems.length ? offset + pageItems.length : 0,
  };
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
      marketRank: coin.market_cap_rank ?? null,
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
      marketRank:
        existing?.marketRank ??
        existing?.coingeckoRank ??
        match?.market_cap_rank ??
        coin.cmcRank ??
        null,
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

    const leftRank = left.marketRank ?? Number.MAX_SAFE_INTEGER;
    const rightRank = right.marketRank ?? Number.MAX_SAFE_INTEGER;
    return leftRank - rightRank;
  });
}

export function appendSurfRankingFallbackRows(
  sourceRows: MarketSourceCoin[],
  surfRows: SurfMarketRankingCoin[],
  researchFocusMap: Map<string, ResearchFocusItem>
): MarketSourceCoin[] {
  if (!surfRows.length) return sourceRows;

  const merged = new Map(sourceRows.map((row) => [row.symbol, row]));

  for (const surfCoin of surfRows) {
    const symbol = String(surfCoin.symbol ?? '').toUpperCase();
    const name = String(surfCoin.name ?? '').trim();

    if (!symbol || !name || merged.has(symbol) || isExcludedFromAltUniverse(symbol, name)) {
      continue;
    }

    const research = researchFocusMap.get(symbol) ?? null;

    merged.set(symbol, {
      id: symbol.toLowerCase(),
      symbol,
      name,
      coingeckoRank: null,
      coinmarketcapRank: null,
      marketRank: toNumber(surfCoin.rank),
      dualTop300: false,
      researchFocus: Boolean(research),
      researchSlug: research?.slug ?? null,
      researchType: research?.type ?? null,
      currentPriceUsd: toNumber(surfCoin.price_usd),
      marketCap: toNumber(surfCoin.market_cap_usd),
      volume24h: toNumber(surfCoin.volume_24h_usd),
      volumeToMarketCap:
        toNumber(surfCoin.market_cap_usd) && toNumber(surfCoin.volume_24h_usd)
          ? Number(surfCoin.volume_24h_usd) / Number(surfCoin.market_cap_usd)
          : null,
      change24h: toNumber(surfCoin.change_24h_pct),
      change7d: null,
      change30d: null,
    });
  }

  return Array.from(merged.values()).sort((left, right) => {
    const leftResearch = left.researchFocus ? 0 : 1;
    const rightResearch = right.researchFocus ? 0 : 1;
    if (leftResearch !== rightResearch) return leftResearch - rightResearch;

    const leftRank = left.marketRank ?? Number.MAX_SAFE_INTEGER;
    const rightRank = right.marketRank ?? Number.MAX_SAFE_INTEGER;
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
