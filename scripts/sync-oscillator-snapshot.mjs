import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import {
  OSCILLATOR_COINS,
  OSCILLATOR_RESEARCH_FOCUS,
} from '../src/data/oscillator-coins.ts';
import {
  appendSurfRankingFallbackRows,
  mergeMarketSources,
  pickBinanceBtcMarket,
  usdBreadth,
} from '../src/lib/oscillator-helpers.ts';
import {
  binanceDailyCloses,
  coinGeckoDailySamples,
  historyAnchors,
  isOscillatorHistory,
  makeOscillatorHistory,
  MAX_OSCILLATOR_HISTORY_DAYS,
  ratioByUtcDay,
  UTC_DAY_MS,
} from '../src/lib/oscillator-history.ts';

const COINGECKO_PAGE_SIZE = 250;
const TOP_UNIVERSE_LIMIT = 500;
const COINGECKO_RATIO_BATCH = 80;
const HISTORY_BATCH_SIZE = 4;
const FETCH_TIMEOUT_MS = 12000;
const SURF_TOKEN_INFO_LIMIT = 72;
const SURF_TOKEN_INFO_CONCURRENCY = 6;
const SURF_MARKET_RANKING_OFFSETS = [0, 100, 200, 300, 400];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_PATH = path.resolve(
  __dirname,
  '../src/data/oscillator-manual-snapshot.ts'
);
const SURF_BIN_DIR = path.join(process.env.HOME ?? '', '.local/bin');
const SURF_CANDIDATES = [
  process.env.SURF_BIN,
  path.join(SURF_BIN_DIR, 'surf'),
  'surf',
].filter(Boolean);

const WITH_SURF = process.argv.includes('--with-surf');
const DRY_RUN = process.argv.includes('--dry-run');
const MISSING_HISTORY_ONLY = process.argv.includes('--missing-history');
const MAX_MARKET_AGE_MS = 6 * 60 * 60 * 1000;
const sourceAsOf = {};
const unavailableSources = new Set();
let surfCommandPromise;
let coinGeckoStableClassificationAvailable = false;
const execFileAsync = promisify(execFile);

function coingeckoConfig() {
  const apiKey = process.env.COINGECKO_API_KEY;
  const headers = {};

  if (apiKey) {
    headers['x-cg-pro-api-key'] = apiKey;
    return { base: 'https://pro-api.coingecko.com/api/v3', headers };
  }

  return { base: 'https://api.coingecko.com/api/v3', headers };
}

async function resolveSurfCommand() {
  if (surfCommandPromise) return surfCommandPromise;

  surfCommandPromise = (async () => {
    for (const candidate of SURF_CANDIDATES) {
      try {
        await execFileAsync(candidate, ['version'], {
          env: {
            ...process.env,
            PATH: `${SURF_BIN_DIR}:${process.env.PATH ?? ''}`,
          },
          timeout: FETCH_TIMEOUT_MS,
        });
        return candidate;
      } catch {
        continue;
      }
    }

    return null;
  })();

  return surfCommandPromise;
}

async function runSurfJson(command, args = []) {
  if (!WITH_SURF) return null;
  const surf = await resolveSurfCommand();
  if (!surf) return null;

  try {
    const { stdout } = await execFileAsync(
      surf,
      [command, ...args, '-o', 'json', '-f', 'body.data'],
      {
        env: {
          ...process.env,
          PATH: `${SURF_BIN_DIR}:${process.env.PATH ?? ''}`,
        },
        timeout: FETCH_TIMEOUT_MS,
        maxBuffer: 1024 * 1024 * 16,
      }
    );

    return JSON.parse(stdout);
  } catch {
    return null;
  }
}

async function fetchJson(url, init, onHttpFailure) {
  try {
    const res = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      unavailableSources.add(new URL(url).pathname);
      onHttpFailure?.(res.status);
      return null;
    }
    return await res.json();
  } catch {
    unavailableSources.add(new URL(url).pathname);
    return null;
  }
}

function isFreshTimestamp(value) {
  const timestamp = typeof value === 'number' ? value : Date.parse(value);
  const age = Date.now() - timestamp;
  return Number.isFinite(timestamp) && age >= -5 * 60 * 1000 && age <= MAX_MARKET_AGE_MS;
}

function recordSourceTimestamp(source, value) {
  if (!sourceAsOf[source] || Date.parse(value) < Date.parse(sourceAsOf[source])) {
    sourceAsOf[source] = value;
  }
}

function asNumber(value) {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeSearchName(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function bestRank(row) {
  return row.marketRank ?? row.coingeckoRank ?? row.coinmarketcapRank ?? null;
}

function buildResearchFocusMap() {
  const all = [...OSCILLATOR_RESEARCH_FOCUS, ...OSCILLATOR_COINS].filter(
    (coin) => coin.researchSlug
  );

  return new Map(
    all.map((coin) => [
      coin.symbol.toUpperCase(),
      {
        id: coin.id,
        name: coin.name,
        slug: coin.researchSlug,
        type: coin.researchType ?? 'Research',
      },
    ])
  );
}

async function fetchCoinGeckoTopCoins() {
  const cfg = coingeckoConfig();
  const pages = await Promise.all(
    Array.from({ length: Math.ceil(TOP_UNIVERSE_LIMIT / COINGECKO_PAGE_SIZE) }, (_, index) =>
      fetchJson(
        `${cfg.base}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${COINGECKO_PAGE_SIZE}&page=${index + 1}&sparkline=false&price_change_percentage=24h,7d,30d`,
        { headers: cfg.headers }
      )
    )
  );
  const stablecoins = await fetchJson(
    `${cfg.base}/coins/markets?vs_currency=usd&category=stablecoins&per_page=250&page=1&sparkline=false`,
    { headers: cfg.headers }
  );
  coinGeckoStableClassificationAvailable = Array.isArray(stablecoins) && stablecoins.length > 0;
  const stablecoinIds = new Set((Array.isArray(stablecoins) ? stablecoins : []).map((coin) => coin.id));
  const coins = pages.flatMap((page) => Array.isArray(page) ? page : [])
    .filter((coin) => !stablecoinIds.has(coin.id));

  return Array.from(new Map(coins
    .filter((coin) => isFreshTimestamp(coin.last_updated))
    .map((coin) => {
      recordSourceTimestamp('coingecko', coin.last_updated);
      return [coin.id, coin];
    })).values()).slice(0, TOP_UNIVERSE_LIMIT);
}

async function fetchSurfMarketRanking() {
  const pages = await Promise.all(
    SURF_MARKET_RANKING_OFFSETS.map((offset) =>
      runSurfJson('market-ranking', [
        '--sort-by',
        'market_cap',
        '--limit',
        '100',
        '--offset',
        String(offset),
      ])
    )
  );

  return pages.flatMap((page) => page ?? []);
}

async function fetchCoinMarketCapTopCoins() {
  const data = await fetchJson(
    `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing?start=1&limit=${TOP_UNIVERSE_LIMIT}&sortBy=market_cap&sortType=desc`
  );
  if (!isFreshTimestamp(data?.status?.timestamp)) return [];
  const coins = (data?.data?.cryptoCurrencyList ?? []).filter((coin) =>
    isFreshTimestamp(coin.lastUpdated ?? coin.quotes?.[0]?.lastUpdated)
  );
  for (const coin of coins) {
    recordSourceTimestamp('coinmarketcap', coin.lastUpdated ?? coin.quotes?.[0]?.lastUpdated);
  }
  return coins;
}

async function fetchSurfBinanceBtcMarkets(symbols) {
  const candidateSymbols = new Set(symbols.map((symbol) => symbol.toUpperCase()));
  const markets = await runSurfJson('exchange-markets', [
    '--exchange',
    'binance',
    '--type',
    'spot',
    '--quote',
    'BTC',
    '--limit',
    '5000',
  ]);

  return (markets ?? []).flatMap((market) => {
    const baseAsset = String(market.base ?? '').toUpperCase();
    const pair = String(market.pair ?? '').toUpperCase().replace('/', '');

    if (!baseAsset || !candidateSymbols.has(baseAsset) || !pair.endsWith('BTC')) {
      return [];
    }

    return [
      {
        symbol: pair,
        status: market.active ? 'TRADING' : 'BREAK',
        baseAsset,
        quoteAsset: 'BTC',
        isSpotTradingAllowed: Boolean(market.active),
      },
    ];
  });
}

async function fetchBinanceBtcTickers(symbols) {
  const surfMarkets = await fetchSurfBinanceBtcMarkets(symbols);
  let livePairs = surfMarkets
    .filter((market) => market.status === 'TRADING' && market.isSpotTradingAllowed)
    .map((market) => market.symbol);

  if (!livePairs.length) {
    const priceTickers = await fetchJson('https://api.binance.com/api/v3/ticker/price');
    const candidatePairs = new Set(symbols.map((symbol) => `${symbol.toUpperCase()}BTC`));
    livePairs = (priceTickers ?? [])
      .map((ticker) => ticker.symbol?.toUpperCase() ?? '')
      .filter((symbol) => candidatePairs.has(symbol));
  }

  if (!livePairs.length) return surfMarkets;

  const tickers = await fetchJson(
    `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(livePairs))}`
  );

  if (!tickers?.length) return surfMarkets;

  const liveTickerMap = new Map(
    (tickers ?? []).flatMap((ticker) => {
      if (!ticker.symbol?.endsWith('BTC') || !isFreshTimestamp(Number(ticker.closeTime))) return [];
      recordSourceTimestamp('binance', new Date(Number(ticker.closeTime)).toISOString());

      return [
        [
          ticker.symbol,
          {
            symbol: ticker.symbol,
            status: 'TRADING',
            baseAsset: ticker.symbol.slice(0, -3),
            quoteAsset: 'BTC',
            isSpotTradingAllowed: true,
            lastPrice: ticker.lastPrice,
            priceChangePercent: ticker.priceChangePercent,
            quoteVolume: ticker.quoteVolume,
          },
        ],
      ];
    })
  );

  if (!surfMarkets.length) {
    return [...liveTickerMap.values()];
  }

  return surfMarkets.map((market) => liveTickerMap.get(market.symbol) ?? market);
}

async function fetchBtcPrice() {
  const surfTicker = await runSurfJson('exchange-price', [
    '--pair',
    'BTC/USDT',
    '--exchange',
    'binance',
  ]);
  const surfLast = asNumber(surfTicker?.[0]?.last);
  if (surfLast !== null) return surfLast;

  const ticker = await fetchJson(
    'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT'
  );
  if (ticker?.lastPrice && isFreshTimestamp(Number(ticker.closeTime))) {
    const value = Number(ticker.lastPrice);
    if (Number.isFinite(value) && value > 0) {
      recordSourceTimestamp('binance', new Date(Number(ticker.closeTime)).toISOString());
      return value;
    }
  }

  const cfg = coingeckoConfig();
  const price = await fetchJson(
    `${cfg.base}/simple/price?ids=bitcoin&vs_currencies=usd&include_last_updated_at=true`,
    { headers: cfg.headers }
  );
  const value = asNumber(price?.bitcoin?.usd);
  const timestamp = Number(price?.bitcoin?.last_updated_at) * 1000;
  if (value !== null && value > 0 && isFreshTimestamp(timestamp)) {
    recordSourceTimestamp('coingecko', new Date(timestamp).toISOString());
    return value;
  }
  return null;
}

async function fetchCoinGeckoBtcRatios(coinIds) {
  const cfg = coingeckoConfig();
  const ratios = new Map();

  for (let index = 0; index < coinIds.length; index += COINGECKO_RATIO_BATCH) {
    const chunk = coinIds.slice(index, index + COINGECKO_RATIO_BATCH);
    const response = await fetchJson(
      `${cfg.base}/simple/price?ids=${chunk.join(',')}&vs_currencies=btc&include_last_updated_at=true`,
      { headers: cfg.headers }
    );

    for (const coinId of chunk) {
      const ratio = response?.[coinId]?.btc;
      if (ratio && Number.isFinite(ratio) && isFreshTimestamp(Number(response?.[coinId]?.last_updated_at) * 1000)) {
        ratios.set(coinId, ratio);
      }
    }
  }

  return ratios;
}

async function fetchBinanceSpotMarkets() {
  const data = await fetchJson('https://api.binance.com/api/v3/exchangeInfo?permissions=SPOT');
  const markets = new Set();
  for (const row of Array.isArray(data?.symbols) ? data.symbols : []) {
    if (row?.status === 'TRADING' && row.isSpotTradingAllowed === true &&
      /^[A-Z0-9]+$/.test(row.baseAsset ?? '') && ['BTC', 'USDT'].includes(row.quoteAsset) &&
      row.symbol === `${row.baseAsset}${row.quoteAsset}`) markets.add(row.symbol);
  }
  return markets;
}

async function fetchBinanceDailyCloses(symbol, cutoff) {
  const points = [];
  let startTime = Math.floor(cutoff / UTC_DAY_MS) * UTC_DAY_MS -
    MAX_OSCILLATOR_HISTORY_DAYS * UTC_DAY_MS;
  for (let page = 0; page < 2; page += 1) {
    const candles = await fetchJson(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=1000&startTime=${startTime}&endTime=${cutoff - 1}`
    );
    if (!Array.isArray(candles) || candles.length > 1000) return [];
    points.push(...binanceDailyCloses(candles, cutoff));
    if (candles.length < 1000) break;
    const nextStart = candles.at(-1)?.[0] + UTC_DAY_MS;
    if (!Number.isSafeInteger(nextStart) || nextStart <= startTime) return [];
    startTime = nextStart;
  }
  return points;
}

let coinGeckoHistoryRateLimited = false;
async function fetchAltBtcHistory(coin, markets, btcCloses, cutoff) {
  const native = `${coin.symbol}BTC`;
  if (markets?.has(native)) {
    const points = await fetchBinanceDailyCloses(native, cutoff);
    const history = makeOscillatorHistory(points, 'binance', [native], cutoff);
    if (history) return history;
  }

  const usdt = `${coin.symbol}USDT`;
  if (markets?.has(usdt) && markets.has('BTCUSDT')) {
    const [base, benchmark] = await Promise.all([fetchBinanceDailyCloses(usdt, cutoff), btcCloses()]);
    const history = makeOscillatorHistory(
      ratioByUtcDay(base, benchmark), 'binance-cross', [usdt, 'BTCUSDT'], cutoff
    );
    if (history) return history;
  }

  if (!coinGeckoHistoryRateLimited) {
    const cfg = coingeckoConfig();
    const days = process.env.COINGECKO_API_KEY ? MAX_OSCILLATOR_HISTORY_DAYS : 365;
    const chart = await fetchJson(
      `${cfg.base}/coins/${encodeURIComponent(coin.id)}/market_chart?vs_currency=btc&days=${days}&interval=daily`,
      { headers: cfg.headers },
      (status) => { if (status === 429) coinGeckoHistoryRateLimited = true; }
    );
    const history = makeOscillatorHistory(coinGeckoDailySamples(chart?.prices, cutoff), 'coingecko', [], cutoff);
    if (history) return history;
  }
  return null;
}

function applySurfRankingOverlay(sourceRows, surfRows) {
  if (!surfRows.length) return sourceRows;

  const surfMap = new Map(
    surfRows.map((coin) => [String(coin.symbol ?? '').toUpperCase(), coin])
  );

  return sourceRows.map((row) => {
    const surfCoin = surfMap.get(row.symbol);
    if (!surfCoin) return row;

    const marketCap = asNumber(surfCoin.market_cap_usd) ?? row.marketCap;
    const volume24h = asNumber(surfCoin.volume_24h_usd) ?? row.volume24h;

    return {
      ...row,
      name: surfCoin.name ?? row.name,
      marketRank: asNumber(surfCoin.rank) ?? row.marketRank,
      currentPriceUsd: asNumber(surfCoin.price_usd) ?? row.currentPriceUsd,
      marketCap,
      volume24h,
      volumeToMarketCap:
        marketCap && volume24h ? volume24h / marketCap : row.volumeToMarketCap,
      change24h: asNumber(surfCoin.change_24h_pct) ?? row.change24h,
    };
  });
}

function buildSurfTokenInfoCandidates(sourceRows) {
  return [...sourceRows]
    .sort((left, right) => {
      if (left.researchFocus !== right.researchFocus) {
        return left.researchFocus ? -1 : 1;
      }

      const leftRank = bestRank(left) ?? Number.MAX_SAFE_INTEGER;
      const rightRank = bestRank(right) ?? Number.MAX_SAFE_INTEGER;
      return leftRank - rightRank;
    })
    .slice(0, SURF_TOKEN_INFO_LIMIT);
}

async function fetchSurfTokenInfoMap(sourceRows) {
  const candidates = buildSurfTokenInfoCandidates(sourceRows);
  const map = new Map();

  for (let index = 0; index < candidates.length; index += SURF_TOKEN_INFO_CONCURRENCY) {
    const batch = candidates.slice(index, index + SURF_TOKEN_INFO_CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (row) => {
        const detail = await runSurfJson('project-detail', [
          '--q',
          row.name,
          '--fields',
          'token_info',
        ]);
        const tokenInfo = detail?.token_info;
        if (!tokenInfo) return null;

        const tokenSymbol = String(tokenInfo.symbol ?? '').toUpperCase();
        const tokenName = normalizeSearchName(tokenInfo.name);
        const rowName = normalizeSearchName(row.name);

        if (tokenSymbol !== row.symbol && tokenName !== rowName) {
          return null;
        }

        return [row.symbol, tokenInfo];
      })
    );

    for (const result of batchResults) {
      if (!result) continue;
      map.set(result[0], result[1]);
    }
  }

  return map;
}

function applySurfTokenInfoOverlay(sourceRows, surfTokenInfoMap) {
  if (!surfTokenInfoMap.size) return sourceRows;

  return sourceRows.map((row) => {
    const tokenInfo = surfTokenInfoMap.get(row.symbol);
    if (!tokenInfo) return row;

    const marketCap = asNumber(tokenInfo.market_cap_usd) ?? row.marketCap;
    const volume24h = asNumber(tokenInfo.volume_24h) ?? row.volume24h;

    return {
      ...row,
      name: tokenInfo.name ?? row.name,
      currentPriceUsd: asNumber(tokenInfo.price_usd) ?? row.currentPriceUsd,
      marketCap,
      volume24h,
      volumeToMarketCap:
        marketCap && volume24h ? volume24h / marketCap : row.volumeToMarketCap,
      change24h: asNumber(tokenInfo.price_change_24h) ?? row.change24h,
      change7d: asNumber(tokenInfo.price_change_7d) ?? row.change7d,
      change30d: asNumber(tokenInfo.price_change_30d) ?? row.change30d,
    };
  });
}

function computeGrade(cycleChange, aboveFiveYearLow, isVeteran, hasLastCyclePeak) {
  if (!isVeteran) {
    if (aboveFiveYearLow === null) {
      return {
        grade: 'B',
        action: 'Watch',
        observation:
          'Single-cycle or newly listed asset with limited historical context. Keep it on the watchlist, but avoid hard conclusions for now.',
      };
    }

    if (aboveFiveYearLow > 25) {
      return {
        grade: 'A',
        action: 'Focus',
        observation: `This single-cycle asset is ${aboveFiveYearLow.toFixed(1)}% above its available-history low, which still looks like a healthy rebound zone. Strength here depends more on narrative durability and liquidity staying alive this cycle.`,
      };
    }

    return {
      grade: 'F',
      action: 'Avoid',
      observation: `This single-cycle asset is only ${aboveFiveYearLow.toFixed(1)}% above its available-history low and still sits too close to structural weakness. There is no right-side confirmation yet.`,
    };
  }

  if (!hasLastCyclePeak) {
    if (aboveFiveYearLow === null) {
      return {
        grade: 'B',
        action: 'Watch',
        observation:
          'There is no reliable prior-cycle peak anchor, so this can only be used as a relative-strength watchlist name for now.',
      };
    }

    if (aboveFiveYearLow > 50) {
      return {
        grade: 'A',
        action: 'Focus',
        observation: `This research name is ${aboveFiveYearLow.toFixed(1)}% above its available-history low. Without a prior-cycle peak anchor, treat it as relatively strong, but still provisional.`,
      };
    }

    if (aboveFiveYearLow > 25) {
      return {
        grade: 'B',
        action: 'Watch',
        observation: `It is ${aboveFiveYearLow.toFixed(1)}% above its available-history low, but the historical anchor is still weak. More cycle evidence is needed.`,
      };
    }

    return {
      grade: 'F',
      action: 'Avoid',
      observation: `It is too close to the available-history low (${aboveFiveYearLow.toFixed(1)}%) and still lacks a reliable prior-cycle reference point. The risk/reward setup looks poor.`,
    };
  }

  if (cycleChange !== null && cycleChange > 0) {
    return {
      grade: 'S',
      action: 'Focus',
      observation: `The ALT/BTC ratio is ${cycleChange.toFixed(1)}% above the previous cycle peak. This asset has already proven it can outperform BTC across cycles.`,
    };
  }

  if (cycleChange !== null && cycleChange < -65) {
    return {
      grade: 'F',
      action: 'Avoid',
      observation: `The ratio is down ${cycleChange.toFixed(1)}% versus the previous cycle top. The oscillator mechanism looks structurally broken.`,
    };
  }

  if (cycleChange !== null && cycleChange >= -35) {
    if (aboveFiveYearLow !== null && aboveFiveYearLow > 25) {
      return {
        grade: 'A',
        action: 'Focus',
        observation: `The drawdown of ${cycleChange.toFixed(1)}% versus the prior cycle top is still manageable, and the ratio remains ${aboveFiveYearLow.toFixed(1)}% above the available-history low. That is the profile of a healthy relative-strength name.`,
      };
    }

    return {
      grade: 'B',
      action: 'Watch',
      observation: `The ratio is down ${cycleChange.toFixed(1)}% from the prior cycle top. Structure is not broken yet, but it is still too close to the available-history low for clean confirmation.`,
    };
  }

  return {
    grade: 'B',
    action: 'Watch',
    observation: `The ratio is down ${cycleChange?.toFixed(1) ?? 'N/A'}% and sits in the mid-decay zone. Neither a clean recovery nor full failure has finished playing out.`,
  };
}

function buildUniverseRows(sourceRows, ratios, binanceTickers, btcPrice) {
  return sourceRows
    .map((row) => {
      const binanceMarket = row.identityAmbiguous ? null : pickBinanceBtcMarket(row.symbol, binanceTickers);
      const coingeckoRatio = ratios.get(row.coingeckoId) ?? null;
      const derivedRatio = row.currentPriceUsd > 0 && btcPrice > 0 ? row.currentPriceUsd / btcPrice : null;
      const currentRatio = binanceMarket?.price ?? coingeckoRatio ?? derivedRatio;
      const currentRatioSource = binanceMarket?.price
        ? 'binance'
        : coingeckoRatio
          ? 'coingecko'
          : derivedRatio ? 'usd-derived' : 'none';

      return {
        ...row,
        bestRank: bestRank(row),
        binanceSymbol: binanceMarket?.symbol ?? null,
        binanceListed: Boolean(binanceMarket),
        currentRatio,
        currentRatioSource,
        binanceChange24h: binanceMarket?.priceChangePercent ?? null,
        binanceQuoteVolume: binanceMarket?.quoteVolume ?? null,
      };
    })
    .sort((left, right) => {
      if (left.researchFocus !== right.researchFocus) {
        return left.researchFocus ? -1 : 1;
      }

      const leftRank = bestRank(left) ?? Number.MAX_SAFE_INTEGER;
      const rightRank = bestRank(right) ?? Number.MAX_SAFE_INTEGER;
      return leftRank - rightRank;
    });
}

function buildFocusConfigs() {
  const focusMap = new Map();
  for (const coin of [...OSCILLATOR_RESEARCH_FOCUS, ...OSCILLATOR_COINS]) {
    const existing = focusMap.get(coin.symbol);
    focusMap.set(coin.symbol, { ...existing, ...coin });
  }
  return [...focusMap.values()].filter((coin) => coin.id);
}

function sortFocusResults(results) {
  const gradeOrder = { S: 0, A: 1, B: 2, F: 3 };
  return results.sort((left, right) =>
    gradeOrder[left.grade] - gradeOrder[right.grade] ||
    (left.bestRank ?? Number.MAX_SAFE_INTEGER) - (right.bestRank ?? Number.MAX_SAFE_INTEGER)
  );
}

async function buildFocusResults(universe, focusCoins, markets, previous) {
  const universeById = new Map(universe.filter((row) => row.coingeckoId).map((row) => [row.coingeckoId, row]));
  const previousUniverseById = new Map(previous.data.universe.filter((row) => row.coingeckoId).map((row) => [row.coingeckoId, row]));
  const lostIds = focusCoins
    .filter((coin) => isOscillatorHistory(previous.history?.[coin.id]) && universeById.get(coin.id)?.symbol !== coin.symbol)
    .map((coin) => coin.id);
  if (lostIds.length) {
    throw new Error(`Refusing to overwrite oscillator snapshot without existing chart identities: ${lostIds.join(', ')}.`);
  }
  const cutoff = Date.now();
  let benchmark;
  const btcCloses = () => benchmark ??= fetchBinanceDailyCloses('BTCUSDT', cutoff);
  const historyById = {};
  const results = [];

  for (let index = 0; index < focusCoins.length; index += HISTORY_BATCH_SIZE) {
    const batch = focusCoins.slice(index, index + HISTORY_BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (coin) => {
        const marketRow = universeById.get(coin.id);
        if (!marketRow || marketRow.symbol !== coin.symbol) return null;

        const venueMarkets = marketRow.identityAmbiguous ? null : markets;
        const fetchedHistory = await fetchAltBtcHistory(coin, venueMarkets, btcCloses, cutoff);
        const prior = previous.history?.[coin.id];
        const previousRow = previousUniverseById.get(coin.id);
        const trustedPrior = isOscillatorHistory(prior) && (
          prior.source === 'coingecko' ||
          (!marketRow.identityAmbiguous && previousRow?.symbol === coin.symbol && !previousRow.identityAmbiguous &&
            prior.markets[0] === `${coin.symbol}${prior.source === 'binance' ? 'BTC' : 'USDT'}`)
        );
        const history = fetchedHistory ?? (trustedPrior ? prior : null);
        if (history) historyById[coin.id] = history;
        const anchors = history ? historyAnchors(history) : {
          currentCyclePeak: null,
          fiveYearLow: null,
          historyStart: null,
          historyAsOf: null,
          historyPointCount: 0,
        };
        const currentRatio = marketRow.currentRatio;
        const lastCyclePeak = coin.lastCyclePeak ?? null;

        let cycleChange = null;
        if (
          coin.category === 'veteran' &&
          anchors.currentCyclePeak !== null &&
          lastCyclePeak !== null &&
          lastCyclePeak > 0
        ) {
          cycleChange = ((anchors.currentCyclePeak - lastCyclePeak) / lastCyclePeak) * 100;
        }

        let aboveFiveYearLow = null;
        if (
          currentRatio !== null &&
          anchors.fiveYearLow !== null &&
          anchors.fiveYearLow > 0
        ) {
          aboveFiveYearLow = ((currentRatio - anchors.fiveYearLow) / anchors.fiveYearLow) * 100;
        }

        const gradeInfo = computeGrade(
          cycleChange,
          aboveFiveYearLow,
          coin.category === 'veteran',
          lastCyclePeak !== null
        );

        return {
          coin: { ...coin, name: marketRow.name },
          currentRatio,
          currentRatioSource: marketRow.currentRatioSource,
          ...anchors,
          lastCyclePeak,
          historySource: history?.source ?? 'none',
          historyMarkets: history?.markets,
          historyRetained: Boolean(history && !fetchedHistory),
          cycleChange,
          aboveFiveYearLow,
          grade: gradeInfo.grade,
          action: gradeInfo.action,
          observation: gradeInfo.observation,
          bestRank: marketRow.bestRank,
          coingeckoRank: marketRow.coingeckoRank,
          coinmarketcapRank: marketRow.coinmarketcapRank,
          dualTop300: marketRow.dualTop300,
          marketCap: marketRow.marketCap,
          volume24h: marketRow.volume24h,
          change24h: marketRow.change24h,
          change7d: marketRow.change7d,
          change30d: marketRow.change30d,
          binanceSymbol: marketRow.binanceSymbol,
          researchFocus: marketRow.researchFocus,
          researchSlug: marketRow.researchSlug,
          researchType: marketRow.researchType,
        };
      })
    );

    results.push(...batchResults.filter(Boolean));
  }

  return { results: sortFocusResults(results), history: historyById };
}

function buildSummary(universe) {
  const trackedAltcoins = universe.length;
  const researchFocusCount = universe.filter((coin) => coin.researchFocus).length;
  const dualRankedCount = universe.filter((coin) => coin.dualTop300).length;
  const binanceBtcPairs = universe.filter((coin) => coin.binanceListed).length;
  const breadth7d = usdBreadth(universe, 'change7d');
  const breadth30d = usdBreadth(universe, 'change30d');

  return {
    trackedAltcoins,
    researchFocusCount,
    dualRankedCount,
    binanceBtcPairs,
    positive7dCount: breadth7d.positive,
    positive30dCount: breadth30d.positive,
    valid7dCount: breadth7d.valid,
    valid30dCount: breadth30d.valid,
    positive7dBreadth: breadth7d.percent,
    positive30dBreadth: breadth30d.percent,
  };
}

async function fillMissingHistory(previous) {
  const existingIds = new Set(previous.data.results.map((row) => row.coin.id));
  const missingCoins = buildFocusConfigs().filter((coin) =>
    existingIds.has(coin.id) && !isOscillatorHistory(previous.history?.[coin.id])
  );
  const update = await buildFocusResults(previous.data.universe, missingCoins, null, previous);
  if (!Object.keys(update.history).length) return previous;

  const history = { ...previous.history, ...update.history };
  const updatedById = new Map(update.results.filter((row) => update.history[row.coin.id]).map((row) => [row.coin.id, row]));
  const results = sortFocusResults(previous.data.results.map((row) => updatedById.get(row.coin.id) ?? row));
  return {
    ...previous,
    history,
    data: {
      ...previous.data,
      results,
      freshness: {
        sourceAsOf: previous.data.freshness?.sourceAsOf ?? {},
        historyAvailable: Object.keys(history).length,
        historyTotal: results.length,
        unavailableSources: previous.data.freshness?.unavailableSources ?? [],
      },
    },
  };
}

async function buildSnapshot(previous) {
  const researchFocusMap = buildResearchFocusMap();
  const focusCoins = buildFocusConfigs();

  const [btcPrice, coingeckoCoins, coinmarketcapCoins, surfRanking] = await Promise.all([
    fetchBtcPrice(),
    fetchCoinGeckoTopCoins(),
    fetchCoinMarketCapTopCoins(),
    fetchSurfMarketRanking(),
  ]);

  if ((!Number.isFinite(btcPrice) || btcPrice <= 0) || Math.max(coingeckoCoins.length, coinmarketcapCoins.length) < COINGECKO_PAGE_SIZE) {
    throw new Error('Refusing to overwrite oscillator snapshot: fresh BTC price and at least 250 fresh ranked market rows are required.');
  }

  if (!coinGeckoStableClassificationAvailable && !coinmarketcapCoins.some((coin) => Array.isArray(coin.tags))) {
    throw new Error('Refusing to overwrite oscillator snapshot: stablecoin classification is unavailable from both CoinGecko and CoinMarketCap.');
  }

  const rankedRows = applySurfRankingOverlay(
    appendSurfRankingFallbackRows(
      mergeMarketSources(
        coingeckoCoins,
        coinmarketcapCoins,
        researchFocusMap,
        new Map(focusCoins.map((coin) => [coin.symbol, coin.id]))
      ),
      surfRanking,
      researchFocusMap
    ),
    surfRanking
  );
  const surfTokenInfoMap = await fetchSurfTokenInfoMap(rankedRows);
  const sourceRows = applySurfTokenInfoOverlay(rankedRows, surfTokenInfoMap)
    .filter((row) => (bestRank(row) ?? Infinity) <= TOP_UNIVERSE_LIMIT)
    .sort((left, right) => (bestRank(left) ?? Infinity) - (bestRank(right) ?? Infinity))
    .slice(0, TOP_UNIVERSE_LIMIT);

  const [binanceTickers, spotMarkets, ratios] = await Promise.all([
    fetchBinanceBtcTickers(sourceRows.map((coin) => coin.symbol)),
    fetchBinanceSpotMarkets(),
    fetchCoinGeckoBtcRatios(sourceRows.flatMap((coin) => coin.coingeckoId ? [coin.coingeckoId] : [])),
  ]);
  const universe = buildUniverseRows(sourceRows, ratios, binanceTickers, btcPrice);
  const { results, history } = await buildFocusResults(universe, focusCoins, spotMarkets, previous);
  const summary = buildSummary(universe);
  const asOf = new Date().toISOString();

  return {
    asOf,
    history,
    data: {
      generatedAt: asOf,
      results,
      universe,
      summary,
      btcPrice: asNumber(btcPrice),
      freshness: {
        sourceAsOf,
        historyAvailable: Object.keys(history).length,
        historyTotal: results.length,
        unavailableSources: Array.from(unavailableSources).sort(),
      },
    },
  };
}

function serializeSnapshot(snapshot) {
  return `import type { OscillatorSnapshotEnvelope } from '../lib/oscillator-snapshot';

export const OSCILLATOR_MANUAL_SNAPSHOT: OscillatorSnapshotEnvelope = ${JSON.stringify(snapshot, null, 2)};
`;
}

async function main() {
  const { OSCILLATOR_MANUAL_SNAPSHOT: previous } = await import('../src/data/oscillator-manual-snapshot.ts');
  const snapshot = MISSING_HISTORY_ONLY ? await fillMissingHistory(previous) : await buildSnapshot(previous);
  const { data } = snapshot;

  if (!data.universe.length) {
    throw new Error('Refusing to overwrite oscillator snapshot because the universe is empty.');
  }

  if (Object.keys(previous.history ?? {}).length && !data.freshness?.historyAvailable) {
    throw new Error('Refusing to overwrite oscillator snapshot because no verified chart history is available.');
  }

  if (DRY_RUN) {
    console.log(JSON.stringify(snapshot));
    return;
  }

  if (snapshot === previous) {
    console.log('No additional exact-ID histories were available. Kept the existing oscillator snapshot.');
    return;
  }

  const tempPath = `${SNAPSHOT_PATH}.${process.pid}.tmp`;
  try {
    await fs.writeFile(tempPath, serializeSnapshot(snapshot), { encoding: 'utf8', flag: 'wx' });
    await fs.rename(tempPath, SNAPSHOT_PATH);
  } finally {
    await fs.rm(tempPath, { force: true }).catch((error) => {
      console.error(`Could not clean up snapshot temporary file: ${error.message}`);
    });
  }

  console.log(
    `Updated oscillator snapshot at ${snapshot.asOf} with ${data.universe.length} altcoins and ${data.results.length} focus rows.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
