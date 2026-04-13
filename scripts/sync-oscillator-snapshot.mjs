import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
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
} from '../src/lib/oscillator-helpers.ts';

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
const FETCH_CACHE_DIRS = [
  path.resolve(__dirname, '../.next/dev/cache/fetch-cache'),
  path.resolve(__dirname, '../.next/cache/fetch-cache'),
];
const SURF_BIN_DIR = path.join(process.env.HOME ?? '', '.local/bin');
const SURF_CANDIDATES = [
  process.env.SURF_BIN,
  path.join(SURF_BIN_DIR, 'surf'),
  'surf',
].filter(Boolean);

let fetchCacheIndexPromise;
let surfCommandPromise;
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

async function fetchJson(url, init) {
  try {
    const res = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return readFetchCacheJson(url);
    return await res.json();
  } catch {
    return readFetchCacheJson(url);
  }
}

async function getFetchCacheIndex() {
  if (fetchCacheIndexPromise) return fetchCacheIndexPromise;

  fetchCacheIndexPromise = (async () => {
    const index = new Map();

    for (const dir of FETCH_CACHE_DIRS) {
      let entries = [];
      try {
        entries = await fs.readdir(dir);
      } catch {
        continue;
      }

      for (const name of entries) {
        const filePath = path.join(dir, name);

        try {
          const parsed = JSON.parse(await fs.readFile(filePath, 'utf8'));
          const cacheUrl = parsed?.data?.url;
          if (typeof cacheUrl === 'string' && !index.has(cacheUrl)) {
            index.set(cacheUrl, parsed);
          }
        } catch {
          continue;
        }
      }
    }

    return index;
  })();

  return fetchCacheIndexPromise;
}

function decodeFetchCacheBody(entry) {
  const body = entry?.data?.body;
  if (typeof body !== 'string') return null;

  const buffer = Buffer.from(body, 'base64');
  const candidates = [buffer];

  try {
    candidates.push(zlib.gunzipSync(buffer));
  } catch {}

  try {
    candidates.push(zlib.inflateSync(buffer));
  } catch {}

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate.toString('utf8'));
    } catch {
      continue;
    }
  }

  return null;
}

async function readFetchCacheJson(url) {
  const index = await getFetchCacheIndex();
  const entry = index.get(url);
  return entry ? decodeFetchCacheBody(entry) : null;
}

function asNumber(value) {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeSearchName(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function ratioToPct(value, total) {
  if (!total) return null;
  return (value / total) * 100;
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
  const coins = pages.flatMap((page) => page ?? []);

  if ((pages[1]?.length ?? 0) === 0) {
    const legacySecondPage = await fetchJson(
      `${cfg.base}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=2&sparkline=false&price_change_percentage=24h,7d,30d`,
      { headers: cfg.headers }
    );
    coins.push(...(legacySecondPage ?? []));
  }

  return Array.from(new Map(coins.map((coin) => [coin.id, coin])).values()).slice(
    0,
    TOP_UNIVERSE_LIMIT
  );
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
  const primary = data?.data?.cryptoCurrencyList ?? [];
  if (primary.length) return primary;

  const fallback = await fetchJson(
    'https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing?start=1&limit=300&sortBy=market_cap&sortType=desc'
  );
  return fallback?.data?.cryptoCurrencyList ?? [];
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
      if (!ticker.symbol?.endsWith('BTC')) return [];

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
    'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
  );
  if (ticker?.price) {
    const value = Number(ticker.price);
    if (Number.isFinite(value)) return value;
  }

  const cfg = coingeckoConfig();
  const price = await fetchJson(
    `${cfg.base}/simple/price?ids=bitcoin&vs_currencies=usd`,
    { headers: cfg.headers }
  );
  return price?.bitcoin?.usd ?? null;
}

async function fetchCoinGeckoBtcRatios(coinIds) {
  const cfg = coingeckoConfig();
  const ratios = new Map();

  for (let index = 0; index < coinIds.length; index += COINGECKO_RATIO_BATCH) {
    const chunk = coinIds.slice(index, index + COINGECKO_RATIO_BATCH);
    const response = await fetchJson(
      `${cfg.base}/simple/price?ids=${chunk.join(',')}&vs_currencies=btc`,
      { headers: cfg.headers }
    );

    for (const coinId of chunk) {
      const ratio = response?.[coinId]?.btc;
      if (ratio && Number.isFinite(ratio)) {
        ratios.set(coinId, ratio);
      }
    }
  }

  return ratios;
}

function buildHistoryStats(values) {
  const cleaned = values.filter((value) => Number.isFinite(value) && value > 0);

  if (!cleaned.length) {
    return null;
  }

  return {
    currentCyclePeak: Math.max(...cleaned.slice(-730)),
    fiveYearLow: Math.min(...cleaned),
  };
}

async function fetchSurfAltBtcHistory(symbol) {
  const history = await runSurfJson('market-price', [
    '--symbol',
    symbol,
    '--currency',
    'btc',
    '--time-range',
    'max',
  ]);

  if (!Array.isArray(history) || history.length === 0) {
    return null;
  }

  return buildHistoryStats(history.map((point) => asNumber(point.value)));
}

async function fetchAltBtcHistory(coinId, symbol) {
  const surfHistory = await fetchSurfAltBtcHistory(symbol);
  if (surfHistory) {
    return surfHistory;
  }

  const cfg = coingeckoConfig();
  const chart = await fetchJson(
    `${cfg.base}/coins/${coinId}/market_chart?vs_currency=btc&days=1825&interval=daily`,
    { headers: cfg.headers }
  );

  const stats = buildHistoryStats((chart?.prices ?? []).map((point) => point[1]));
  if (stats) {
    return stats;
  }

  return { currentCyclePeak: null, fiveYearLow: null };
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
        observation: `This single-cycle asset is ${aboveFiveYearLow.toFixed(1)}% above its 5-year low, which still looks like a healthy rebound zone. Strength here depends more on narrative durability and liquidity staying alive this cycle.`,
      };
    }

    return {
      grade: 'F',
      action: 'Avoid',
      observation: `This single-cycle asset is only ${aboveFiveYearLow.toFixed(1)}% above its 5-year low and still sits too close to structural weakness. There is no right-side confirmation yet.`,
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
        observation: `This research name is ${aboveFiveYearLow.toFixed(1)}% above its 5-year low. Without a prior-cycle peak anchor, treat it as relatively strong, but still provisional.`,
      };
    }

    if (aboveFiveYearLow > 25) {
      return {
        grade: 'B',
        action: 'Watch',
        observation: `It is ${aboveFiveYearLow.toFixed(1)}% above its 5-year low, but the historical anchor is still weak. More cycle evidence is needed.`,
      };
    }

    return {
      grade: 'F',
      action: 'Avoid',
      observation: `It is too close to the 5-year low (${aboveFiveYearLow.toFixed(1)}%) and still lacks a reliable prior-cycle reference point. The risk/reward setup looks poor.`,
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
        observation: `The drawdown of ${cycleChange.toFixed(1)}% versus the prior cycle top is still manageable, and the ratio remains ${aboveFiveYearLow.toFixed(1)}% above the 5-year low. That is the profile of a healthy relative-strength name.`,
      };
    }

    return {
      grade: 'B',
      action: 'Watch',
      observation: `The ratio is down ${cycleChange.toFixed(1)}% from the prior cycle top. Structure is not broken yet, but it is still too close to the 5-year low for clean confirmation.`,
    };
  }

  return {
    grade: 'B',
    action: 'Watch',
    observation: `The ratio is down ${cycleChange?.toFixed(1) ?? 'N/A'}% and sits in the mid-decay zone. Neither a clean recovery nor full failure has finished playing out.`,
  };
}

function buildUniverseRows(sourceRows, ratios, binanceTickers) {
  return sourceRows
    .map((row) => {
      const binanceMarket = pickBinanceBtcMarket(row.symbol, binanceTickers);
      const coingeckoRatio = ratios.get(row.id) ?? null;
      const currentRatio = binanceMarket?.price ?? coingeckoRatio;
      const currentRatioSource = binanceMarket?.price
        ? 'binance'
        : coingeckoRatio
          ? 'coingecko'
          : 'none';

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

function buildFocusConfigs(universe) {
  const universeMap = new Map(universe.map((coin) => [coin.symbol, coin]));
  const focusMap = new Map();

  for (const coin of OSCILLATOR_COINS) {
    const fromUniverse = universeMap.get(coin.symbol);
    focusMap.set(coin.symbol, {
      ...coin,
      id: coin.id ?? fromUniverse?.id,
      name: fromUniverse?.name ?? coin.name,
      researchSlug: coin.researchSlug ?? fromUniverse?.researchSlug ?? undefined,
      researchType: coin.researchType ?? fromUniverse?.researchType ?? undefined,
    });
  }

  for (const coin of OSCILLATOR_RESEARCH_FOCUS) {
    const fromUniverse = universeMap.get(coin.symbol);
    if (!fromUniverse) continue;

    const existing = focusMap.get(coin.symbol);
    focusMap.set(coin.symbol, {
      ...coin,
      ...existing,
      id: existing?.id ?? fromUniverse.id,
      name: fromUniverse.name,
      researchSlug: coin.researchSlug ?? existing?.researchSlug,
      researchType: coin.researchType ?? existing?.researchType,
    });
  }

  return Array.from(focusMap.values()).filter((coin) => Boolean(coin.id));
}

async function buildFocusResults(universe) {
  const universeMap = new Map(universe.map((coin) => [coin.symbol, coin]));
  const focusCoins = buildFocusConfigs(universe);
  const results = [];

  for (let index = 0; index < focusCoins.length; index += HISTORY_BATCH_SIZE) {
    const batch = focusCoins.slice(index, index + HISTORY_BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (coin) => {
        const marketRow = universeMap.get(coin.symbol);
        if (!marketRow || !coin.id) return null;

        const history = await fetchAltBtcHistory(coin.id, coin.symbol);
        const currentRatio = marketRow.currentRatio;
        const lastCyclePeak = coin.lastCyclePeak ?? null;

        let cycleChange = null;
        if (
          coin.category === 'veteran' &&
          history.currentCyclePeak !== null &&
          lastCyclePeak !== null &&
          lastCyclePeak > 0
        ) {
          cycleChange = ((history.currentCyclePeak - lastCyclePeak) / lastCyclePeak) * 100;
        }

        let aboveFiveYearLow = null;
        if (
          currentRatio !== null &&
          history.fiveYearLow !== null &&
          history.fiveYearLow > 0
        ) {
          aboveFiveYearLow = ((currentRatio - history.fiveYearLow) / history.fiveYearLow) * 100;
        }

        const gradeInfo = computeGrade(
          cycleChange,
          aboveFiveYearLow,
          coin.category === 'veteran',
          lastCyclePeak !== null
        );

        return {
          coin,
          currentRatio,
          currentRatioSource: marketRow.currentRatioSource,
          currentCyclePeak: history.currentCyclePeak,
          lastCyclePeak,
          fiveYearLow: history.fiveYearLow,
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

  const gradeOrder = { S: 0, A: 1, B: 2, F: 3 };
  results.sort((left, right) => {
    const gradeGap = gradeOrder[left.grade] - gradeOrder[right.grade];
    if (gradeGap !== 0) return gradeGap;

    const leftRank = left.bestRank ?? Number.MAX_SAFE_INTEGER;
    const rightRank = right.bestRank ?? Number.MAX_SAFE_INTEGER;
    return leftRank - rightRank;
  });

  return results;
}

function buildSummary(universe) {
  const trackedAltcoins = universe.length;
  const researchFocusCount = universe.filter((coin) => coin.researchFocus).length;
  const dualRankedCount = universe.filter((coin) => coin.dualTop300).length;
  const binanceBtcPairs = universe.filter((coin) => coin.binanceListed).length;
  const positive7dCount = universe.filter((coin) => (coin.change7d ?? -Infinity) > 0).length;
  const positive30dCount = universe.filter((coin) => (coin.change30d ?? -Infinity) > 0).length;

  return {
    trackedAltcoins,
    researchFocusCount,
    dualRankedCount,
    binanceBtcPairs,
    positive7dCount,
    positive30dCount,
    positive7dBreadth: ratioToPct(positive7dCount, trackedAltcoins),
    positive30dBreadth: ratioToPct(positive30dCount, trackedAltcoins),
  };
}

async function buildSnapshotData() {
  const researchFocusMap = buildResearchFocusMap();

  const [btcPrice, coingeckoCoins, coinmarketcapCoins, surfRanking] = await Promise.all([
    fetchBtcPrice(),
    fetchCoinGeckoTopCoins(),
    fetchCoinMarketCapTopCoins(),
    fetchSurfMarketRanking(),
  ]);

  const rankedRows = applySurfRankingOverlay(
    appendSurfRankingFallbackRows(
      mergeMarketSources(
        coingeckoCoins,
        coinmarketcapCoins,
        researchFocusMap
      ),
      surfRanking,
      researchFocusMap
    ),
    surfRanking
  );
  const surfTokenInfoMap = await fetchSurfTokenInfoMap(rankedRows);
  const sourceRows = applySurfTokenInfoOverlay(rankedRows, surfTokenInfoMap);

  const binanceTickers = await fetchBinanceBtcTickers(
    sourceRows.map((coin) => coin.symbol)
  );
  const ratios = await fetchCoinGeckoBtcRatios(sourceRows.map((coin) => coin.id));
  const universe = buildUniverseRows(sourceRows, ratios, binanceTickers);
  const results = await buildFocusResults(universe);
  const summary = buildSummary(universe);

  return {
    generatedAt: new Date().toISOString(),
    results,
    universe,
    summary,
    btcPrice: asNumber(btcPrice),
  };
}

function serializeSnapshot(snapshot) {
  return `import type { OscillatorSnapshotEnvelope } from '../lib/oscillator-snapshot';

export const OSCILLATOR_MANUAL_SNAPSHOT: OscillatorSnapshotEnvelope = ${JSON.stringify(snapshot, null, 2)};
`;
}

async function main() {
  const data = await buildSnapshotData();

  if (!data.universe.length) {
    throw new Error('Refusing to overwrite oscillator snapshot because the universe is empty.');
  }

  const snapshot = {
    asOf: data.generatedAt,
    data,
  };

  await fs.writeFile(SNAPSHOT_PATH, serializeSnapshot(snapshot), 'utf8');

  console.log(
    `Updated oscillator snapshot at ${snapshot.asOf} with ${data.universe.length} altcoins and ${data.results.length} focus rows.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
