import { FEAR_MANUAL_SNAPSHOT, type FearManualSnapshot } from '@/data/fear-manual-snapshot';
import {
  DAY_MS,
  FEAR_BITVIEW_TREND_DAYS,
  FEAR_BITVIEW_Z_HISTORY_LIMIT,
  FEAR_HISTORY_DAYS,
  FEAR_SIGNAL_IDS,
  FEAR_SIGNAL_LABELS,
  HOUR_MS,
  buildFearSignalHistory,
  contiguousFundingWindow,
  describeFearArchive,
  evaluateFearSignals,
  fearDay,
  fearSourceNumber,
  indexFearDays,
  indexFearFunding,
  readFearBitviewDays,
  readFearBitviewTrend,
  readFearBitviewZScores,
  readClosedBtcDays,
  retainFearBitviewDays,
  summarizeFearScore,
  uniqueAddressesRising,
  utcBucket,
  type FearBitviewDay,
  type FearBitviewTrend,
  type FearHistoryPoint,
  type FearHistorySources,
  type FearSignalId,
  type SignalStatus,
  type TimedNumber,
} from './fear-signals';

export type { SignalStatus } from './fear-signals';

type SignalObservation = { source: string; observedAt?: string };

export interface BottomSignal {
  label: string;
  status: SignalStatus;
  detail: string;
  observations?: SignalObservation[];
}

export interface SourceHealth {
  name: string;
  status: 'ok' | 'degraded' | 'down';
  detail: string;
}

export interface FearDashboardData {
  generatedAt: string;
  observedAt: { btcPrice: string | null; fearGreed: string | null; ma200Week: string | null };
  sources: SourceHealth[];
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
  bitviewValuationHistory?: FearBitviewDay[];
  bitviewTrend?: FearBitviewTrend;
  signalHistory?: FearHistoryPoint[];
  historySources?: FearHistorySources;
}

type CoinGeckoMarketChart = {
  prices: Array<[number, number]>;
  market_caps: Array<[number, number]>;
};

type CoinGeckoCoin = {
  last_updated?: string;
  market_data?: {
    last_updated?: string;
    current_price?: { usd?: number };
    market_cap?: { usd?: number };
  };
};

type BinanceTicker = {
  lastPrice?: string;
  closeTime?: number;
};

type BinanceKlineRow = unknown[];

type BitboChartPoint = Record<string, unknown>;

type BitboChartResponse = {
  status?: string;
  code?: string | number;
  message?: string;
  data?: BitboChartPoint[];
};

type CoinalyzeFutureMarket = {
  symbol?: string;
  exchange?: string;
  base_asset?: string;
  quote_asset?: string;
  is_perpetual?: boolean;
  has_long_short_ratio_data?: boolean;
};

type CoinalyzeValuePoint = {
  symbol?: string;
  value?: number;
  update?: number;
};

type CoinalyzeFundingHistoryItem = {
  t?: number;
  o?: number;
  h?: number;
  l?: number;
  c?: number;
};

type CoinalyzeLongShortHistoryItem = {
  t?: number;
  r?: number;
  l?: number;
  s?: number;
};

type CoinalyzeHistoryEnvelope<T> = {
  symbol?: string;
  history?: T[];
};

type HyperliquidUniverseItem = {
  name?: string;
};

type HyperliquidMeta = {
  universe?: HyperliquidUniverseItem[];
};

type HyperliquidAssetCtx = {
  funding?: string;
  openInterest?: string;
  markPx?: string;
};

type HyperliquidMetaAndAssetCtxResponse = [HyperliquidMeta, HyperliquidAssetCtx[]];

type CryptoQuantPoint = Record<string, unknown>;

type CryptoQuantResponse = {
  result?: {
    data?: CryptoQuantPoint[];
    dataList?: CryptoQuantPoint[];
  };
  data?: CryptoQuantPoint[];
};

type YahooChart = {
  chart?: {
    result?: Array<{
      meta?: { regularMarketPrice?: number };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
        }>;
      };
    }>;
  };
};

type AltFearGreed = {
  data?: Array<{
    value?: string;
    value_classification?: string;
    timestamp?: string;
  }>;
};

type BlockchainChart = {
  values?: Array<{ x: number; y: number }>;
};

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function toDailyKey(timestampMs: number): string {
  return new Date(timestampMs).toISOString().slice(0, 10);
}

function shiftDailyKey(day: string, offsetDays: number): string | null {
  const date = new Date(`${day}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function buildDailyMap(points: Array<[number, number]>): Map<string, number> {
  const map = new Map<string, number>();
  for (const [ts, value] of points) {
    map.set(toDailyKey(ts), value);
  }
  return map;
}

function toReturns(map: Map<string, number>): Map<string, number> {
  const entries = [...map.entries()].sort((a, b) => (a[0] > b[0] ? 1 : -1));
  const ret = new Map<string, number>();
  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1]?.[1];
    const curr = entries[i]?.[1];
    if (!prev || !curr || prev <= 0) continue;
    ret.set(entries[i][0], curr / prev - 1);
  }
  return ret;
}

function correlation(a: number[], b: number[]): number | null {
  if (a.length < 8 || b.length < 8 || a.length !== b.length) return null;
  const meanA = average(a);
  const meanB = average(b);
  if (meanA === null || meanB === null) return null;
  let num = 0;
  let denA = 0;
  let denB = 0;
  for (let i = 0; i < a.length; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  if (denA === 0 || denB === 0) return null;
  return num / Math.sqrt(denA * denB);
}

async function fetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(12000)
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fetchText(
  url: string,
  init?: RequestInit
): Promise<string | null> {
  try {
    const res = await fetch(url, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(12000)
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchBitviewValuation(cutoff: number) {
  const end = utcBucket(cutoff);
  const start = fearDay(end - FEAR_HISTORY_DAYS * DAY_MS);
  const payload = await fetchJson<unknown>(
    `https://bitview.space/api/series/bulk?series=date,price_ohlc,market_cap,realized_cap,realized_price&index=day1&start=${start}&end=${fearDay(end)}&limit=${FEAR_HISTORY_DAYS}&format=json`
  );
  return readFearBitviewDays(payload, cutoff, new Date(Date.now()).toISOString());
}

export async function fetchFearBitviewTrend(cutoff = Date.now()) {
  const end = utcBucket(cutoff);
  const start = fearDay(end - FEAR_BITVIEW_TREND_DAYS * DAY_MS);
  const payload = await fetchJson<unknown>(
    `https://bitview.space/api/series/bulk?series=date,price_ohlc&index=day1&start=${start}&end=${fearDay(end)}&limit=${FEAR_BITVIEW_TREND_DAYS}&format=json`
  );
  return readFearBitviewTrend(payload, cutoff, new Date(Date.now()).toISOString());
}

async function fetchBitviewZInputs(cutoff: number) {
  const end = fearDay(utcBucket(cutoff));
  const payload = await fetchJson<unknown>(
    `https://bitview.space/api/series/bulk?series=date,market_cap,realized_cap&index=day1&start=0&end=${end}&limit=${FEAR_BITVIEW_Z_HISTORY_LIMIT}&format=json`
  );
  return { payload, collectedAt: new Date(Date.now()).toISOString() };
}

function coingeckoConfig() {
  const apiKey = process.env.COINGECKO_API_KEY;
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['x-cg-pro-api-key'] = apiKey;
    return {
      base: 'https://pro-api.coingecko.com/api/v3',
      headers
    };
  }
  return {
    base: 'https://api.coingecko.com/api/v3',
    headers
  };
}

async function fetchCoinGeckoCoin(): Promise<CoinGeckoCoin | null> {
  const cfg = coingeckoConfig();
  return fetchJson<CoinGeckoCoin>(
    `${cfg.base}/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
    { headers: cfg.headers }
  );
}

async function fetchCoinGeckoChart(days: number): Promise<CoinGeckoMarketChart | null> {
  const cfg = coingeckoConfig();
  return fetchJson<CoinGeckoMarketChart>(
    `${cfg.base}/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`,
    { headers: cfg.headers }
  );
}

async function fetchBinanceBtcTicker(): Promise<BinanceTicker | null> {
  return fetchJson<BinanceTicker>(
    'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT'
  );
}

async function fetchBinanceBtcDailyClosePoints(
  cutoff: number,
  limit = 1000
): Promise<TimedNumber[]> {
  const rows = await fetchJson<unknown>(
    `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=${limit}`
  );
  return readClosedBtcDays(rows, cutoff);
}

async function fetchBinanceBtc200WeekMean(): Promise<{ value: number; asOf: string } | null> {
  const rows = await fetchJson<BinanceKlineRow[]>(
    'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1w&limit=201'
  );
  if (!Array.isArray(rows)) return null;
  const now = Date.now();
  const closed = rows.flatMap(row => {
    if (!Array.isArray(row)) return [];
    const openTime = asNumber(row[0]);
    const closeTime = asNumber(row[6]);
    const price = asNumber(row[4]);
    return openTime !== null && closeTime !== null && closeTime <= now && price !== null && price > 0
      ? [{ openTime, closeTime, price }]
      : [];
  }).sort((a, b) => a.closeTime - b.closeTime).slice(-200);
  const last = closed.at(-1);
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  if (!last || closed.length !== 200 || now - last.closeTime >= weekMs ||
    closed.some((row, i) => row.closeTime - row.openTime + 1 !== weekMs ||
      (i > 0 && row.openTime !== closed[i - 1].closeTime + 1))) return null;
  return { value: closed.reduce((sum, row) => sum + row.price, 0) / closed.length, asOf: new Date(last.closeTime).toISOString() };
}

async function fetchBitboChartData(
  chartId: string
): Promise<BitboChartPoint[]> {
  const apiKey = process.env.BITBO_API_KEY ?? process.env.BITBO_KEY;
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['x-api-key'] = apiKey;
    headers.Authorization = `Bearer ${apiKey}`;
  }
  const payload = await fetchJson<BitboChartResponse>(
    `https://charts.bitbo.io/api/charts/data/${chartId}`,
    { headers }
  );
  return payload?.data ?? [];
}

function pickBitboValue(
  point: BitboChartPoint | undefined,
  preferredKeys: string[]
): number | null {
  if (!point) return null;

  for (const key of preferredKeys) {
    const value = asNumber(point[key]);
    if (value !== null) return value;
  }

  for (const [key, rawValue] of Object.entries(point)) {
    const normalized = key.toLowerCase();
    if (
      normalized.includes('time') ||
      normalized.includes('date') ||
      normalized.includes('timestamp')
    ) {
      continue;
    }
    const value = asNumber(rawValue);
    if (value !== null) return value;
  }

  return null;
}

async function fetchBitboLatestMetric(
  chartId: string,
  preferredKeys: string[]
): Promise<number | null> {
  const data = await fetchBitboChartData(chartId);
  if (!data.length) return null;
  return pickBitboValue(data[data.length - 1], preferredKeys);
}

function parseFredCsvValues(csv: string | null): number[] {
  if (!csv) return [];
  const lines = csv.trim().split('\n');
  if (lines.length <= 1) return [];
  const values: number[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const comma = line.lastIndexOf(',');
    if (comma < 0) continue;
    const raw = line.slice(comma + 1).trim();
    if (!raw || raw === '.') continue;
    const val = Number(raw);
    if (Number.isFinite(val)) values.push(val);
  }
  return values;
}

async function fetchFredSeriesValues(seriesId: string): Promise<number[]> {
  const csv = await fetchText(
    `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`
  );
  return parseFredCsvValues(csv);
}

function parseFredCsvMap(csv: string | null): Map<string, number> {
  const map = new Map<string, number>();
  if (!csv) return map;

  const lines = csv.trim().split('\n');
  if (lines.length <= 1) return map;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const comma = line.lastIndexOf(',');
    if (comma < 0) continue;
    const date = line.slice(0, comma).trim();
    const raw = line.slice(comma + 1).trim();
    if (!date || !raw || raw === '.') continue;
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;
    map.set(date, value);
  }

  return map;
}

async function fetchFredSeriesMap(seriesId: string): Promise<Map<string, number>> {
  const csv = await fetchText(
    `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`
  );
  return parseFredCsvMap(csv);
}

function latestFromSeries(values: number[]): number | null {
  if (!values.length) return null;
  return values[values.length - 1] ?? null;
}

async function fetchCboePutCallRatio(): Promise<number | null> {
  const html = await fetchText('https://www.cboe.com/us/options/market_statistics/market/');
  if (!html) return null;

  const compact = html.replace(/\s+/g, ' ');
  const sectionStart = compact.indexOf('P/C RATIO');
  if (sectionStart < 0) return null;
  const section = compact.slice(sectionStart, sectionStart + 20000);

  const matches = [...section.matchAll(/>(\d{1,2}\.\d{2,4})</g)];
  const candidates = matches
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n) && n > 0 && n < 5);

  if (!candidates.length) {
    // Fallback for markdown-like table text.
    const textMatches = [...section.matchAll(/\|\s*([0-4]\.\d{2,4})\s*(?:<|$)/g)];
    const textValues = textMatches
      .map((m) => Number(m[1]))
      .filter((n) => Number.isFinite(n));
    return textValues.length ? textValues[textValues.length - 1] : null;
  }

  return candidates[candidates.length - 1];
}

async function fetchHyperliquidInfo<T>(
  body: Record<string, unknown>,
  signal?: AbortSignal
): Promise<T | null> {
  return fetchJson<T>('https://api.hyperliquid.xyz/info', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    signal
  });
}

async function fetchHyperliquidBtcFundingHistory(cutoff: number) {
  const points: TimedNumber[] = [];
  const timeout = AbortSignal.timeout(40_000);
  let cursor = utcBucket(cutoff) - FEAR_HISTORY_DAYS * DAY_MS;
  const maxPages = Math.ceil((FEAR_HISTORY_DAYS + 1) * 24 / 500) + 1;
  for (let page = 0; page < maxPages && cursor <= cutoff; page += 1) {
    const rows = await fetchHyperliquidInfo<Array<{ coin?: string; time?: number; fundingRate?: string }>>(
      { type: 'fundingHistory', coin: 'BTC', startTime: cursor, endTime: cutoff },
      AbortSignal.any([timeout, AbortSignal.timeout(8000)])
    );
    if (!Array.isArray(rows) || rows.length > 500) break;
    if (rows.length === 0) return { points, complete: true };
    let lastTime = cursor - 1;
    for (const row of rows) {
      const time = row?.time;
      const rate = fearSourceNumber(row?.fundingRate);
      if (row?.coin !== 'BTC' || typeof time !== 'number' || !Number.isSafeInteger(time) ||
          time < cursor || time > cutoff) continue;
      lastTime = Math.max(lastTime, time);
      if (rate !== null) points.push([time, rate]);
    }
    if (lastTime < cursor) break;
    if (rows.length < 500) return { points, complete: true };
    cursor = lastTime + 1;
  }
  return { points, complete: cursor > cutoff };
}

async function fetchHyperliquidBtcPerpMetrics(): Promise<{
  fundingRate: number | null;
  openInterest: number | null;
  markPrice: number | null;
}> {
  const payload = await fetchHyperliquidInfo<HyperliquidMetaAndAssetCtxResponse>({
    type: 'metaAndAssetCtxs'
  });
  if (!payload || payload.length < 2) {
    return { fundingRate: null, openInterest: null, markPrice: null };
  }

  const meta = payload[0];
  const assetCtxs = payload[1];
  const universe = meta?.universe ?? [];
  let idx = universe.findIndex((u) => u.name === 'BTC');
  if (idx < 0) {
    idx = universe.findIndex((u) => (u.name ?? '').toUpperCase().includes('BTC'));
  }
  if (idx < 0 || idx >= assetCtxs.length) {
    return { fundingRate: null, openInterest: null, markPrice: null };
  }

  const ctx = assetCtxs[idx];
  return {
    fundingRate: asNumber(ctx?.funding),
    openInterest: asNumber(ctx?.openInterest),
    markPrice: asNumber(ctx?.markPx)
  };
}

async function fetchCoinalyzeJson<T>(
  path: string,
  params: Record<string, string>
): Promise<T | null> {
  const apiKey = process.env.COINALYZE_API_KEY;
  if (!apiKey) return null;
  const q = new URLSearchParams({ ...params, api_key: apiKey });
  return fetchJson<T>(`https://api.coinalyze.net/v1/${path}?${q.toString()}`);
}

async function fetchCoinalyzeFundingRate(
  symbol: string
): Promise<number | null> {
  const rows = await fetchCoinalyzeJson<CoinalyzeValuePoint[]>(
    'funding-rate',
    { symbols: symbol }
  );
  const value = rows?.[0]?.value;
  return asNumber(value);
}

async function fetchCoinalyzeOpenInterest(
  symbol: string
): Promise<number | null> {
  const rows = await fetchCoinalyzeJson<CoinalyzeValuePoint[]>(
    'open-interest',
    { symbols: symbol, convert_to_usd: 'true' }
  );
  const value = rows?.[0]?.value;
  return asNumber(value);
}

async function fetchCoinalyzeFundingHistory(
  symbol: string,
  cutoff: number
): Promise<TimedNumber[]> {
  const now = Math.floor(Date.now() / 1000);
  const from = now - 48 * 60 * 60;
  const rows = await fetchCoinalyzeJson<
    CoinalyzeHistoryEnvelope<CoinalyzeFundingHistoryItem>[]
  >('funding-rate-history', {
    symbols: symbol,
    interval: '1hour',
    from: String(from),
    to: String(now)
  });
  const history = Array.isArray(rows) ? rows.find(row => row?.symbol === symbol)?.history : null;
  if (!Array.isArray(history)) return [];
  return history.flatMap((item): TimedNumber[] => {
    const start = typeof item?.t === 'number' ? item.t * 1000 : NaN;
    const rate = fearSourceNumber(item?.c);
    const end = start + HOUR_MS - 1;
    return start > 0 && start % HOUR_MS === 0 && end <= cutoff && rate !== null ? [[end, rate]] : [];
  });
}

async function fetchCoinalyzeLongShortRatio(
  symbol: string
): Promise<number | null> {
  const now = Math.floor(Date.now() / 1000);
  const from = now - 48 * 60 * 60;
  const rows = await fetchCoinalyzeJson<
    CoinalyzeHistoryEnvelope<CoinalyzeLongShortHistoryItem>[]
  >('long-short-ratio-history', {
    symbols: symbol,
    interval: '1hour',
    from: String(from),
    to: String(now)
  });
  const history = rows?.[0]?.history ?? [];
  for (let i = history.length - 1; i >= 0; i--) {
    const ratio = asNumber(history[i]?.r);
    if (ratio !== null) return ratio;
  }
  return null;
}

async function pickCoinalyzeBtcPerpSymbol(): Promise<string | null> {
  const markets = await fetchCoinalyzeJson<CoinalyzeFutureMarket[]>(
    'future-markets',
    {}
  );
  if (!markets?.length) return 'BTCUSDT_PERP.A';

  const btcPerp = markets.filter(
    (m) => m.base_asset === 'BTC' && m.is_perpetual && m.symbol
  );
  const withLongShort = btcPerp.filter((m) => m.has_long_short_ratio_data);

  const prioritize = (list: CoinalyzeFutureMarket[]) => {
    const binance = list.find((m) =>
      (m.exchange ?? '').toLowerCase().includes('binance')
    );
    if (binance?.symbol) return binance.symbol;
    return list[0]?.symbol ?? null;
  };

  return prioritize(withLongShort.length ? withLongShort : btcPerp);
}

function yyyymmdd(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function extractCryptoQuantList(payload: CryptoQuantResponse | null): CryptoQuantPoint[] {
  if (!payload) return [];
  if (Array.isArray(payload.result?.data)) return payload.result.data;
  if (Array.isArray(payload.result?.dataList)) return payload.result.dataList;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

function pickMetricValue(
  point: CryptoQuantPoint,
  preferredKeys: string[]
): number | null {
  for (const key of preferredKeys) {
    const value = asNumber(point[key]);
    if (value !== null) return value;
  }

  for (const [key, rawValue] of Object.entries(point)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('date') ||
      lowerKey.includes('time') ||
      lowerKey.includes('symbol') ||
      lowerKey.includes('exchange')
    ) {
      continue;
    }
    const value = asNumber(rawValue);
    if (value !== null) return value;
  }

  return null;
}

async function fetchCryptoQuantMetric(
  path: string,
  preferredKeys: string[],
  extraParams: Record<string, string> = {}
): Promise<number | null> {
  const apiKey = process.env.CRYPTOQUANT_API_KEY;
  if (!apiKey) return null;

  const toDate = new Date();
  const fromDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    window: 'day',
    from: yyyymmdd(fromDate),
    to: yyyymmdd(toDate),
    ...extraParams
  });

  const payload = await fetchJson<CryptoQuantResponse>(
    `https://api.cryptoquant.com/v1/${path}?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    }
  );

  const list = extractCryptoQuantList(payload);
  if (!list.length) return null;

  const latest = list[list.length - 1];
  return pickMetricValue(latest, preferredKeys);
}

async function fetchCryptoQuantMetricWithFallback(
  paths: string[],
  preferredKeys: string[],
  extraParams: Record<string, string> = {}
): Promise<number | null> {
  for (const path of paths) {
    const value = await fetchCryptoQuantMetric(path, preferredKeys, extraParams);
    if (value !== null) return value;
  }
  return null;
}

async function fetchYahooChart(symbol: string): Promise<YahooChart | null> {
  return fetchJson<YahooChart>(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1y`
  );
}

async function fetchFearGreed(limit: number): Promise<AltFearGreed | null> {
  return fetchJson<AltFearGreed>(
    `https://api.alternative.me/fng/?limit=${limit}&format=json`
  );
}

async function fetchBlockchainChart(metric: string): Promise<BlockchainChart | null> {
  return fetchJson<BlockchainChart>(
    `https://api.blockchain.info/charts/${metric}?timespan=120days&format=json`
  );
}

async function fetchBlockchainChartWithFallback(
  metrics: string[]
): Promise<BlockchainChart | null> {
  for (const metric of metrics) {
    const data = await fetchBlockchainChart(metric);
    if (data?.values?.length) return data;
  }
  return null;
}

function parseYahooSeries(data: YahooChart | null): {
  current: number | null;
  points: Array<[number, number]>;
  drawdown: number | null;
} {
  const result = data?.chart?.result?.[0];
  const current = asNumber(result?.meta?.regularMarketPrice);
  const ts = result?.timestamp ?? [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const points: Array<[number, number]> = [];
  for (let i = 0; i < ts.length; i++) {
    const close = asNumber(closes[i]);
    if (close !== null) points.push([ts[i] * 1000, close]);
  }
  const prices = points.map((p) => p[1]);
  const high = prices.length ? Math.max(...prices) : null;
  const last = prices.length ? prices[prices.length - 1] : null;
  const drawdown =
    high && last && high > 0 ? ((high - last) / high) * 100 : null;
  return { current, points, drawdown };
}

function drawdownFromSeries(values: number[]): number | null {
  if (!values.length) return null;
  const high = Math.max(...values);
  const last = values[values.length - 1];
  if (!Number.isFinite(high) || !Number.isFinite(last) || high <= 0) return null;
  return ((high - last) / high) * 100;
}

async function fetchGlassnodeMetric(path: string): Promise<number | null> {
  const apiKey = process.env.GLASSNODE_API_KEY;
  if (!apiKey) return null;
  const url = `https://api.glassnode.com/v1/metrics/${path}?a=BTC&i=24h&api_key=${apiKey}`;
  const payload = await fetchJson<Array<{ t: number; v: number }>>(url);
  if (!payload?.length) return null;
  return asNumber(payload[payload.length - 1]?.v);
}

function metricStatus(n: number | null): SignalStatus {
  if (n === null) return 'unknown';
  return Number.isFinite(n) ? 'on' : 'unknown';
}

function pickApiOrManual<T>(
  fieldKey: string,
  apiValue: T | null | undefined,
  manualValue: T | null | undefined,
  manualFallbackFields: string[]
): T | null {
  if (apiValue !== null && apiValue !== undefined) return apiValue;
  if (manualValue !== null && manualValue !== undefined) {
    manualFallbackFields.push(fieldKey);
    return manualValue;
  }
  return null;
}

function recentObservation(timestamp: number, maxAgeMs: number): string | null {
  const age = Date.now() - timestamp;
  return age >= -60_000 && age <= maxAgeMs ? new Date(timestamp).toISOString() : null;
}

export async function getFearDashboardData({ useManualFallback = true, previousBitviewDays = [] }: {
  useManualFallback?: boolean;
  previousBitviewDays?: FearBitviewDay[];
} = {}): Promise<FearDashboardData> {
  const cutoff = Date.now();
  const coinalyzeSymbol = await pickCoinalyzeBtcPerpSymbol();

  const [
    hyperliquidMetrics,
    hyperliquidFunding,
    binanceTicker,
    coin,
    btcChart,
    btcBinanceDailyPoints,
    btc200WeekMean,
    freshBitviewDays,
    bitviewZInputs,
    bitviewTrend,
    fearGreedNow,
    fearGreedHistory,
    sp500Raw,
    nasdaqRaw,
    goldRaw,
    crudeRaw,
    dxyRaw,
    vixRaw,
    uniqueAddressesRaw,
    txCountRaw,
    newAddressesRaw,
    mempoolRaw,
    realizedCap,
    realizedPrice,
    mvrv,
    exchangeReserve,
    minerFlow,
    exchangeInflow,
    exchangeOutflow,
    fundingRate,
    openInterest,
    longShortRatio,
    coinalyzeFunding,
    nasdaqFredSeries,
    goldFredSeries,
    oilFredSeries,
    dxyFredSeries,
    vixFredMap,
    moveFredSeries,
    yieldCurveSeries,
    sp500FredMap,
    goldFredMap,
    dxyFredMap,
    putCallRatio,
    mvrvZ,
    bitboMvrv,
    bitboMvrvZ,
    bitboRealizedPrice,
    bitbo200WeekMa
  ] = await Promise.all([
    fetchHyperliquidBtcPerpMetrics(),
    fetchHyperliquidBtcFundingHistory(cutoff),
    fetchBinanceBtcTicker(),
    fetchCoinGeckoCoin(),
    fetchCoinGeckoChart(2000),
    fetchBinanceBtcDailyClosePoints(cutoff),
    fetchBinanceBtc200WeekMean(),
    fetchBitviewValuation(cutoff),
    fetchBitviewZInputs(cutoff),
    fetchFearBitviewTrend(cutoff),
    fetchFearGreed(1),
    fetchFearGreed(FEAR_HISTORY_DAYS + 1),
    fetchYahooChart('^GSPC'),
    fetchYahooChart('^IXIC'),
    fetchYahooChart('GC=F'),
    fetchYahooChart('CL=F'),
    fetchYahooChart('DX-Y.NYB'),
    fetchYahooChart('^VIX'),
    fetchJson<BlockchainChart>(
      `https://api.blockchain.info/charts/n-unique-addresses?timespan=${FEAR_HISTORY_DAYS + 14}days&sampled=false&format=json`
    ),
    fetchBlockchainChart('n-transactions'),
    fetchBlockchainChart('n-new-addresses'),
    fetchBlockchainChartWithFallback([
      'mempool-size',
      'mempool-count',
      'unconfirmed-transactions'
    ]),
    fetchCryptoQuantMetricWithFallback(
      ['btc/market-data/realized-cap', 'btc/market-indicator/realized-cap'],
      ['realizedCap', 'realized_cap', 'value']
    ),
    fetchCryptoQuantMetric('btc/market-indicator/realized-price', [
      'realizedPrice',
      'realized_price',
      'value'
    ]),
    fetchCryptoQuantMetric('btc/market-indicator/mvrv', ['mvrv', 'value']),
    fetchCryptoQuantMetric(
      'btc/exchange-flows/reserve',
      ['reserve', 'reserve_usd', 'value'],
      { exchange: 'all_exchange' }
    ),
    fetchCryptoQuantMetric('btc/miner-flows/outflow', [
      'outflow_total',
      'outflow_mean',
      'outflow',
      'value'
    ]),
    fetchCryptoQuantMetric(
      'btc/exchange-flows/inflow',
      ['inflow_total', 'inflow_mean', 'inflow', 'value'],
      { exchange: 'all_exchange' }
    ),
    fetchCryptoQuantMetric(
      'btc/exchange-flows/outflow',
      ['outflow_total', 'outflow_mean', 'outflow', 'value'],
      { exchange: 'all_exchange' }
    ),
    coinalyzeSymbol ? fetchCoinalyzeFundingRate(coinalyzeSymbol) : Promise.resolve(null),
    coinalyzeSymbol ? fetchCoinalyzeOpenInterest(coinalyzeSymbol) : Promise.resolve(null),
    coinalyzeSymbol ? fetchCoinalyzeLongShortRatio(coinalyzeSymbol) : Promise.resolve(null),
    coinalyzeSymbol ? fetchCoinalyzeFundingHistory(coinalyzeSymbol, cutoff) : Promise.resolve([]),
    fetchFredSeriesValues('NASDAQCOM'),
    fetchFredSeriesValues('GOLDAMGBD228NLBM'),
    fetchFredSeriesValues('DCOILWTICO'),
    fetchFredSeriesValues('DTWEXBGS'),
    fetchFredSeriesMap('VIXCLS'),
    fetchFredSeriesValues('MOVEINDEX'),
    fetchFredSeriesValues('T10Y2Y'),
    fetchFredSeriesMap('SP500'),
    fetchFredSeriesMap('GOLDAMGBD228NLBM'),
    fetchFredSeriesMap('DTWEXBGS'),
    fetchCboePutCallRatio(),
    fetchGlassnodeMetric('market/mvrv_z_score'),
    fetchBitboLatestMetric('mvrv', ['mvrv']),
    fetchBitboLatestMetric('mvrv-z-score', ['mvrv-z-score', 'mvrv_z_score']),
    fetchBitboLatestMetric('realized-price', [
      'realized-price',
      'realized_price'
    ]),
    fetchBitboLatestMetric('200-week-moving-average-heatmap', [
      '200-week-moving-average-heatmap',
      '200_week_moving_average_heatmap'
    ])
  ]);

  const btcBinanceAsOf = recentObservation(binanceTicker?.closeTime ?? NaN, 600_000);
  const coinGeckoAsOf = recentObservation(Date.parse(coin?.market_data?.last_updated ?? coin?.last_updated ?? ''), 600_000);
  const btcPriceFromBinance = btcBinanceAsOf ? asNumber(binanceTicker?.lastPrice) : null;
  const btcPriceFromCoinGecko = coinGeckoAsOf ? asNumber(coin?.market_data?.current_price?.usd) : null;
  const btcPrice = btcPriceFromBinance ?? btcPriceFromCoinGecko;
  const marketCap = coinGeckoAsOf ? asNumber(coin?.market_data?.market_cap?.usd) : null;
  const bitviewDays = retainFearBitviewDays(freshBitviewDays, previousBitviewDays, cutoff);
  const zScores = readFearBitviewZScores(bitviewZInputs.payload, bitviewDays, cutoff, bitviewZInputs.collectedAt);
  const bitviewValuationHistory = bitviewDays.map(day => {
    const mvrvZ = zScores.get(day.date);
    return mvrvZ ? { ...day, mvrvZ } : day;
  });
  const latestBitview = bitviewValuationHistory.at(-1);
  const currentBitview = latestBitview?.date === fearDay(utcBucket(cutoff) - DAY_MS) ? latestBitview : undefined;
  const mvrvUnified = latestBitview ? latestBitview.marketCap / latestBitview.realizedCap : mvrv ?? bitboMvrv;
  const realizedPriceUnified = latestBitview?.realizedPrice ?? realizedPrice ?? bitboRealizedPrice;

  const btcHistoryPoints =
    (btcChart?.prices?.length ?? 0) > 0 ? btcChart?.prices ?? [] : btcBinanceDailyPoints;

  const btcPrices = btcHistoryPoints
    .map((p) => asNumber(p[1]))
    .filter((v): v is number => v !== null);
  const ma200Week = btc200WeekMean?.value ?? bitbo200WeekMa;
  const btcPriceSeries = btcPrices.slice(-180);

  const fearGreedPoint = fearGreedNow?.data?.[0];
  const fearGreedAsOf = recentObservation(Number(fearGreedPoint?.timestamp) * 1000, 36 * 3_600_000);
  const latestFearGreed = fearSourceNumber(fearGreedPoint?.value);
  const fearGreed = fearGreedAsOf && latestFearGreed !== null && latestFearGreed >= 0 && latestFearGreed <= 100
    ? latestFearGreed
    : null;
  const fearGreedClass = fearGreedAsOf ? fearGreedPoint?.value_classification ?? null : null;
  const fearGreedPoints = Array.isArray(fearGreedHistory?.data) ? fearGreedHistory.data.flatMap((point): TimedNumber[] => {
    const seconds = fearSourceNumber(point?.timestamp);
    const value = fearSourceNumber(point?.value);
    return seconds !== null && Number.isSafeInteger(seconds) && value !== null && value >= 0 && value <= 100
      ? [[seconds * 1000, value]] : [];
  }) : [];
  const fearGreedDays = indexFearDays(fearGreedPoints, cutoff);
  const fearGreedSeries = fearGreedPoints.sort((a, b) => a[0] - b[0]).slice(-FEAR_HISTORY_DAYS).map(([, value]) => value);

  const sp500 = parseYahooSeries(sp500Raw);
  const nasdaq = parseYahooSeries(nasdaqRaw);
  const gold = parseYahooSeries(goldRaw);
  const crude = parseYahooSeries(crudeRaw);
  const dxy = parseYahooSeries(dxyRaw);
  const vix = parseYahooSeries(vixRaw);
  const sp500FredSeries = [...sp500FredMap.values()];
  const latestSp500FredDay = [...sp500FredMap.keys()].at(-1);
  const latestVixFred = [...vixFredMap.entries()].at(-1);

  const sp500Value = latestFromSeries(sp500FredSeries) ?? sp500.current;
  const nasdaqValue = latestFromSeries(nasdaqFredSeries) ?? nasdaq.current;
  const goldValue = latestFromSeries(goldFredSeries) ?? gold.current;
  const crudeValue = latestFromSeries(oilFredSeries) ?? crude.current;
  // Prefer ICE DXY (Yahoo: DX-Y.NYB). FRED DTWEXBGS is trade-weighted dollar index, not DXY.
  const dxyValue = dxy.current ?? latestFromSeries(dxyFredSeries);
  const vixValue = latestVixFred?.[1] ?? vix.current;
  const moveValue = latestFromSeries(moveFredSeries);
  const yieldCurve = latestFromSeries(yieldCurveSeries);

  const btcDailyMap = buildDailyMap(btcHistoryPoints);
  const spxDailyMap =
    sp500FredMap.size > 30 ? sp500FredMap : buildDailyMap(sp500.points);
  const goldDailyMap =
    goldFredMap.size > 30 ? goldFredMap : buildDailyMap(gold.points);
  const dxyDailyMap =
    dxy.points.length > 30 ? buildDailyMap(dxy.points) : dxyFredMap;

  const btcRet = toReturns(btcDailyMap);
  const spxRet = toReturns(spxDailyMap);
  const goldRet = toReturns(goldDailyMap);
  const dxyRet = toReturns(dxyDailyMap);

  function alignedCorrelation(series: Map<string, number>): number | null {
    const aExact: number[] = [];
    const bExact: number[] = [];
    for (const [date, ret] of btcRet.entries()) {
      const other = series.get(date);
      if (other === undefined) continue;
      aExact.push(ret);
      bExact.push(other);
    }

    const exactCorr = correlation(aExact.slice(-90), bExact.slice(-90));
    if (exactCorr !== null) return exactCorr;

    // Trading calendars differ (BTC 7d vs macro assets 5d); allow nearest-day fallback.
    const aFuzzy: number[] = [];
    const bFuzzy: number[] = [];
    for (const [date, ret] of btcRet.entries()) {
      let other = series.get(date);
      if (other === undefined) {
        for (const offset of [-1, -2, -3, 1]) {
          const shifted = shiftDailyKey(date, offset);
          if (!shifted) continue;
          const candidate = series.get(shifted);
          if (candidate !== undefined) {
            other = candidate;
            break;
          }
        }
      }
      if (other === undefined) continue;
      aFuzzy.push(ret);
      bFuzzy.push(other);
    }

    return correlation(aFuzzy.slice(-90), bFuzzy.slice(-90));
  }

  const addressPoints = Array.isArray(uniqueAddressesRaw?.values) ? uniqueAddressesRaw.values.flatMap((point): TimedNumber[] => {
    const seconds = fearSourceNumber(point?.x);
    const count = fearSourceNumber(point?.y);
    return seconds !== null && Number.isSafeInteger(seconds) && count !== null && Number.isSafeInteger(count) && count >= 0
      ? [[seconds * 1000, count]] : [];
  }) : [];
  const addressDays = indexFearDays(addressPoints, cutoff);
  const latestAddressDay = [...addressDays.keys()].filter(day => addressDays.get(day) !== null).sort((a, b) => b - a)[0];
  const activeAddresses = addressDays.get(latestAddressDay) ?? null;
  const activeAddressesRising = latestAddressDay === undefined ? null : uniqueAddressesRising(addressDays, latestAddressDay);
  const fundingBuckets = indexFearFunding(hyperliquidFunding.points);
  const latestHyperliquidFunding = contiguousFundingWindow(fundingBuckets, cutoff);
  const latestCoinalyzeFunding = latestHyperliquidFunding ? null
    : contiguousFundingWindow(indexFearFunding(coinalyzeFunding), utcBucket(cutoff, HOUR_MS) - 1);
  const fundingWindow = latestHyperliquidFunding ?? latestCoinalyzeFunding;

  const txSeries = (txCountRaw?.values ?? [])
    .map((v) => asNumber(v.y))
    .filter((v): v is number => v !== null);
  const txCount = txSeries.length > 0 ? txSeries[txSeries.length - 1] : null;

  const newAddrSeries = (newAddressesRaw?.values ?? [])
    .map((v) => asNumber(v.y))
    .filter((v): v is number => v !== null);
  const newAddresses =
    newAddrSeries.length > 0 ? newAddrSeries[newAddrSeries.length - 1] : null;

  const mempoolSeries = (mempoolRaw?.values ?? [])
    .map((v) => asNumber(v.y))
    .filter((v): v is number => v !== null);
  const mempoolStats =
    mempoolSeries.length > 0 ? mempoolSeries[mempoolSeries.length - 1] : null;

  const fundingRateUnified = hyperliquidMetrics.fundingRate ?? fundingRate;
  const { openInterest: hyperliquidOpenInterest, markPrice } = hyperliquidMetrics;
  const openInterestUsd = hyperliquidOpenInterest !== null && markPrice !== null
    ? hyperliquidOpenInterest * markPrice
    : openInterest;
  const manual: FearManualSnapshot = useManualFallback ? FEAR_MANUAL_SNAPSHOT : { asOf: FEAR_MANUAL_SNAPSHOT.asOf };
  const manualFallbackFields: string[] = [];

  const layer1: FearDashboardData['layer1'] = {
    btcPrice: pickApiOrManual(
      'layer1.btcPrice',
      btcPrice,
      manual.layer1?.btcPrice,
      manualFallbackFields
    ),
    marketCap: pickApiOrManual(
      'layer1.marketCap',
      marketCap,
      manual.layer1?.marketCap,
      manualFallbackFields
    ),
    realizedCap: pickApiOrManual(
      'layer1.realizedCap',
      latestBitview?.realizedCap ?? realizedCap,
      manual.layer1?.realizedCap,
      manualFallbackFields
    ),
    realizedPrice: pickApiOrManual(
      'layer1.realizedPrice',
      realizedPriceUnified,
      manual.layer1?.realizedPrice,
      manualFallbackFields
    ),
    mvrv: pickApiOrManual(
      'layer1.mvrv',
      mvrvUnified,
      manual.layer1?.mvrv,
      manualFallbackFields
    ),
    mvrvZ: latestBitview ? currentBitview?.mvrvZ?.value ?? null : pickApiOrManual(
      'layer1.mvrvZ',
      mvrvZ ?? bitboMvrvZ,
      manual.layer1?.mvrvZ,
      manualFallbackFields
    ),
    ma200Week: pickApiOrManual(
      'layer1.ma200Week',
      ma200Week,
      manual.layer1?.ma200Week,
      manualFallbackFields
    ),
    btcPriceSeries
  };

  const layer2: FearDashboardData['layer2'] = {
    activeAddresses: pickApiOrManual(
      'layer2.activeAddresses',
      activeAddresses,
      manual.layer2?.activeAddresses,
      manualFallbackFields
    ),
    newAddresses: pickApiOrManual(
      'layer2.newAddresses',
      newAddresses,
      manual.layer2?.newAddresses,
      manualFallbackFields
    ),
    txCount: pickApiOrManual(
      'layer2.txCount',
      txCount,
      manual.layer2?.txCount,
      manualFallbackFields
    ),
    mempoolStats: pickApiOrManual(
      'layer2.mempoolStats',
      mempoolStats,
      manual.layer2?.mempoolStats,
      manualFallbackFields
    ),
    nvt: pickApiOrManual(
      'layer2.nvt',
      null,
      manual.layer2?.nvt,
      manualFallbackFields
    ),
    exchangeReserve: pickApiOrManual(
      'layer2.exchangeReserve',
      exchangeReserve,
      manual.layer2?.exchangeReserve,
      manualFallbackFields
    ),
    minerFlow: pickApiOrManual(
      'layer2.minerFlow',
      minerFlow,
      manual.layer2?.minerFlow,
      manualFallbackFields
    ),
    exchangeInflow: pickApiOrManual(
      'layer2.exchangeInflow',
      exchangeInflow,
      manual.layer2?.exchangeInflow,
      manualFallbackFields
    ),
    exchangeOutflow: pickApiOrManual(
      'layer2.exchangeOutflow',
      exchangeOutflow,
      manual.layer2?.exchangeOutflow,
      manualFallbackFields
    ),
    activeAddressesRising: pickApiOrManual(
      'layer2.activeAddressesRising',
      activeAddressesRising,
      manual.layer2?.activeAddressesRising,
      manualFallbackFields
    ),
    dormancyFlow: pickApiOrManual(
      'layer2.dormancyFlow',
      null,
      manual.layer2?.dormancyFlow,
      manualFallbackFields
    ),
    coinDaysDestroyed: pickApiOrManual(
      'layer2.coinDaysDestroyed',
      null,
      manual.layer2?.coinDaysDestroyed,
      manualFallbackFields
    ),
    lthSopr: pickApiOrManual(
      'layer2.lthSopr',
      null,
      manual.layer2?.lthSopr,
      manualFallbackFields
    )
  };

  const layer3: FearDashboardData['layer3'] = {
    fearGreed: pickApiOrManual(
      'layer3.fearGreed',
      fearGreed,
      manual.layer3?.fearGreed,
      manualFallbackFields
    ),
    fearGreedClass: pickApiOrManual(
      'layer3.fearGreedClass',
      fearGreedClass,
      manual.layer3?.fearGreedClass,
      manualFallbackFields
    ),
    fearGreedSeries,
    fundingRate: pickApiOrManual(
      'layer3.fundingRate',
      fundingRateUnified,
      manual.layer3?.fundingRate,
      manualFallbackFields
    ),
    openInterest: pickApiOrManual(
      'layer3.openInterest',
      openInterestUsd,
      manual.layer3?.openInterest,
      manualFallbackFields
    ),
    longShortRatio: pickApiOrManual(
      'layer3.longShortRatio',
      longShortRatio,
      manual.layer3?.longShortRatio,
      manualFallbackFields
    ),
    liquidations: pickApiOrManual(
      'layer3.liquidations',
      null,
      manual.layer3?.liquidations,
      manualFallbackFields
    )
  };

  const layer4: FearDashboardData['layer4'] = {
    sp500: pickApiOrManual(
      'layer4.sp500',
      sp500Value,
      manual.layer4?.sp500,
      manualFallbackFields
    ),
    nasdaq: pickApiOrManual(
      'layer4.nasdaq',
      nasdaqValue,
      manual.layer4?.nasdaq,
      manualFallbackFields
    ),
    gold: pickApiOrManual(
      'layer4.gold',
      goldValue,
      manual.layer4?.gold,
      manualFallbackFields
    ),
    crudeOil: pickApiOrManual(
      'layer4.crudeOil',
      crudeValue,
      manual.layer4?.crudeOil,
      manualFallbackFields
    ),
    dxy: pickApiOrManual(
      'layer4.dxy',
      dxyValue,
      manual.layer4?.dxy,
      manualFallbackFields
    ),
    corrBtcSp500: pickApiOrManual(
      'layer4.corrBtcSp500',
      alignedCorrelation(spxRet),
      manual.layer4?.corrBtcSp500,
      manualFallbackFields
    ),
    corrBtcGold: pickApiOrManual(
      'layer4.corrBtcGold',
      alignedCorrelation(goldRet),
      manual.layer4?.corrBtcGold,
      manualFallbackFields
    ),
    corrBtcDxy: pickApiOrManual(
      'layer4.corrBtcDxy',
      alignedCorrelation(dxyRet),
      manual.layer4?.corrBtcDxy,
      manualFallbackFields
    )
  };

  const layer5: FearDashboardData['layer5'] = {
    vix: pickApiOrManual(
      'layer5.vix',
      vixValue,
      manual.layer5?.vix,
      manualFallbackFields
    ),
    move: pickApiOrManual(
      'layer5.move',
      moveValue,
      manual.layer5?.move,
      manualFallbackFields
    ),
    yieldCurveSpread: pickApiOrManual(
      'layer5.yieldCurveSpread',
      yieldCurve,
      manual.layer5?.yieldCurveSpread,
      manualFallbackFields
    ),
    sp500Drawdown: pickApiOrManual(
      'layer5.sp500Drawdown',
      drawdownFromSeries(sp500FredSeries) ?? sp500.drawdown,
      manual.layer5?.sp500Drawdown,
      manualFallbackFields
    ),
    putCallRatio: pickApiOrManual(
      'layer5.putCallRatio',
      putCallRatio,
      manual.layer5?.putCallRatio,
      manualFallbackFields
    )
  };

  const signalStates = evaluateFearSignals({
    btcPrice: currentBitview?.usdClose,
    realizedPrice: currentBitview?.realizedPrice,
    mvrvZ: layer1.mvrvZ,
    fearGreed: layer3.fearGreed,
    dormancyFlow: layer2.dormancyFlow,
    uniqueAddressesRising: layer2.activeAddressesRising,
    vix: layer5.vix,
    sp500Drawdown: layer5.sp500Drawdown,
    fundingWindow,
  });
  const details: Record<FearSignalId, string> = {
    realizedPrice: currentBitview
      ? `${currentBitview.usdClose.toFixed(2)} ${signalStates.realizedPrice === 'on' ? '<' : '≥'} ${currentBitview.realizedPrice.toFixed(2)} USD/BTC`
      : 'Need a matched BTC close and realized price for the last closed UTC day',
    mvrvZ: layer1.mvrvZ !== null ? `Current ${layer1.mvrvZ.toFixed(2)}` : 'Missing MVRV Z-score',
    fearGreed: layer3.fearGreed !== null
      ? `Current ${layer3.fearGreed} (${layer3.fearGreedClass ?? 'N/A'})`
      : 'Missing fear and greed index',
    dormancyFlow: layer2.dormancyFlow !== null
      ? `Current ${layer2.dormancyFlow.toFixed(0)}`
      : 'Missing dormancy flow',
    uniqueAddresses: layer2.activeAddressesRising === null
      ? 'Need 14 consecutive daily address counts'
      : layer2.activeAddressesRising ? '7d average is rising' : '7d average is not rising',
    vix: layer5.vix !== null ? `Current ${layer5.vix.toFixed(2)}` : 'Missing VIX',
    sp500Drawdown: layer5.sp500Drawdown !== null ? `Current ${layer5.sp500Drawdown.toFixed(2)}%` : 'Missing S&P 500 drawdown',
    funding: fundingWindow
      ? `Last 8h max=${Math.max(...fundingWindow.map(([, rate]) => rate)).toExponential(2)}`
      : 'Need 8 consecutive hourly funding observations',
  };
  const observations: Record<FearSignalId, SignalObservation[]> = {
    realizedPrice: currentBitview ? [{ source: 'Bitview', observedAt: currentBitview.date }] : [],
    mvrvZ: currentBitview?.mvrvZ ? [{ source: 'Bitview', observedAt: currentBitview.date }]
      : latestBitview ? [] : mvrvZ !== null ? [{ source: 'Glassnode' }] : bitboMvrvZ !== null ? [{ source: 'Bitbo' }] : [],
    fearGreed: fearGreed !== null && fearGreedAsOf ? [{ source: 'Alternative.me', observedAt: fearGreedAsOf }] : [],
    dormancyFlow: [],
    uniqueAddresses: latestAddressDay === undefined ? [] : [{ source: 'Blockchain.com', observedAt: fearDay(latestAddressDay) }],
    vix: latestVixFred ? [{ source: 'FRED VIXCLS', observedAt: latestVixFred[0] }]
      : vix.current !== null ? [{ source: 'Yahoo Finance' }] : [],
    sp500Drawdown: latestSp500FredDay ? [{ source: 'FRED SP500', observedAt: latestSp500FredDay }]
      : sp500.drawdown !== null ? [{ source: 'Yahoo Finance' }] : [],
    funding: fundingWindow
      ? [{ source: latestHyperliquidFunding ? 'Hyperliquid BTC perpetual' : 'Coinalyze BTC perpetual',
          observedAt: new Date(fundingWindow[7][0]).toISOString() }]
      : [],
  };
  const bottomSignals: BottomSignal[] = FEAR_SIGNAL_IDS.map(id => ({
    label: FEAR_SIGNAL_LABELS[id],
    status: signalStates[id],
    detail: details[id],
    observations: observations[id],
  }));
  const { score: compositeScore } = summarizeFearScore(Object.values(signalStates));
  const signalHistory = buildFearSignalHistory(cutoff, btcBinanceDailyPoints, fearGreedDays, addressDays, fundingBuckets, bitviewValuationHistory);
  const bitviewStatus = freshBitviewDays.length === FEAR_HISTORY_DAYS ? 'ok' : freshBitviewDays.length ? 'degraded' : 'down';
  const historySources: FearHistorySources = {
    funding: describeFearArchive(signalHistory, 'funding', hyperliquidFunding.complete),
    uniqueAddresses: describeFearArchive(signalHistory, 'uniqueAddresses', Array.isArray(uniqueAddressesRaw?.values)),
    realizedPrice: {
      source: 'Bitview BTC valuation',
      status: bitviewStatus,
      freshDays: freshBitviewDays.length,
      retainedDays: bitviewValuationHistory.length - freshBitviewDays.length,
    },
    mvrvZ: {
      source: 'Bitview inputs for calculated MVRV Z-score',
      status: zScores.size === FEAR_HISTORY_DAYS ? 'ok' : zScores.size ? 'degraded' : 'down',
      freshDays: zScores.size,
      retainedDays: bitviewValuationHistory.filter(day => day.mvrvZ).length - zScores.size,
    },
  };

  const sources: SourceHealth[] = [
    {
      name: 'Bitview',
      status: bitviewStatus,
      detail: 'Daily BTC valuation (CC BY 4.0)',
    },
    {
      name: 'Hyperliquid API',
      status:
        hyperliquidMetrics.fundingRate !== null ||
        hyperliquidMetrics.openInterest !== null
          ? 'ok'
          : 'degraded',
      detail:
        hyperliquidMetrics.fundingRate !== null ||
        hyperliquidMetrics.openInterest !== null
          ? 'BTC perp funding/open-interest'
          : 'Unavailable, fallback to Coinalyze'
    },
    {
      name: 'Binance API',
      status: btcPriceFromBinance !== null ? 'ok' : 'degraded',
      detail:
        btcPriceFromBinance !== null
          ? btcBinanceDailyPoints.length
            ? 'Live BTCUSDT ticker price + daily history fallback'
            : 'Live BTCUSDT ticker price'
          : 'No response, fallback to CoinGecko if available'
    },
    {
      name: 'CoinGecko API',
      status:
        marketCap !== null || btcChart?.prices?.length
          ? 'ok'
          : btcPriceFromCoinGecko !== null
            ? 'degraded'
            : 'down',
      detail:
        marketCap !== null || btcChart?.prices?.length
          ? 'Market cap and historical BTC series available'
          : btcPriceFromCoinGecko !== null
            ? 'Partial response'
            : 'No response'
    },
    {
      name: 'CryptoQuant API',
      status:
        mvrv !== null ||
        realizedPrice !== null ||
        exchangeReserve !== null ||
        minerFlow !== null ||
        exchangeInflow !== null ||
        exchangeOutflow !== null
          ? 'ok'
          : process.env.CRYPTOQUANT_API_KEY
            ? 'degraded'
            : 'down',
      detail: process.env.CRYPTOQUANT_API_KEY
        ? 'MVRV / realized price / exchange & miner flows'
        : 'Set CRYPTOQUANT_API_KEY to enable key on-chain metrics'
    },
    {
      name: 'Coinalyze API',
      status:
        fundingRate !== null || openInterest !== null || longShortRatio !== null
          ? 'ok'
          : process.env.COINALYZE_API_KEY
            ? 'degraded'
            : 'down',
      detail: process.env.COINALYZE_API_KEY
        ? `Long/short + derivatives fallback via ${coinalyzeSymbol ?? 'BTC perp symbol'}`
        : 'Set COINALYZE_API_KEY to enable derivatives metrics'
    },
    {
      name: 'Yahoo Finance API',
      status: metricStatus(sp500.current) === 'on' ? 'ok' : 'degraded',
      detail:
        sp500.current !== null
          ? 'Macro assets + volatility available'
          : 'Partial or no macro data'
    },
    {
      name: 'FRED API',
      status:
        sp500FredSeries.length ||
        nasdaqFredSeries.length ||
        vixFredMap.size ||
        moveFredSeries.length
          ? 'ok'
          : 'degraded',
      detail:
        'Macro benchmark series (SP500, NASDAQ, VIX, MOVE, DXY, rates), correlation aligned by FRED dates'
    },
    {
      name: 'Cboe Market Statistics',
      status: putCallRatio !== null ? 'ok' : 'degraded',
      detail: putCallRatio !== null ? 'Put/Call ratio available' : 'Put/Call unavailable'
    },
    {
      name: 'Alternative.me API',
      status: fearGreed !== null ? 'ok' : 'degraded',
      detail: fearGreed !== null ? 'Fear & Greed available' : 'No response'
    },
    {
      name: 'Blockchain.com API',
      status:
        activeAddresses !== null || txCount !== null || newAddresses !== null
          ? 'ok'
          : 'degraded',
      detail:
        activeAddresses !== null || txCount !== null || newAddresses !== null
          ? 'On-chain activity + mempool stats available'
          : 'On-chain activity unavailable'
    },
    {
      name: 'Glassnode API',
      status:
        mvrvZ !== null
          ? 'ok'
          : process.env.GLASSNODE_API_KEY
            ? 'degraded'
            : 'down',
      detail: process.env.GLASSNODE_API_KEY
        ? 'Using only MVRV Z-score fallback'
        : 'Optional fallback for MVRV Z-score'
    },
    {
      name: 'Bitbo API',
      status:
        bitboMvrv !== null ||
        bitboMvrvZ !== null ||
        bitboRealizedPrice !== null ||
        bitbo200WeekMa !== null
          ? 'ok'
          : process.env.BITBO_API_KEY || process.env.BITBO_KEY
            ? 'degraded'
            : 'down',
      detail:
        bitboMvrv !== null ||
        bitboMvrvZ !== null ||
        bitboRealizedPrice !== null ||
        bitbo200WeekMa !== null
          ? 'MVRV / MVRV Z / Realized Price / 200W MA backup source'
          : process.env.BITBO_API_KEY || process.env.BITBO_KEY
            ? 'Authorized but no metric response'
            : 'Set BITBO_API_KEY (or BITBO_KEY) if your Bitbo plan requires auth'
    }
  ];

  if (manualFallbackFields.length > 0) {
    sources.push({
      name: 'Research Snapshot (Manual)',
      status: 'degraded',
      detail: `Fallback for ${manualFallbackFields.length} fields, as of ${manual.asOf}`
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    observedAt: {
      btcPrice: btcPriceFromBinance !== null ? btcBinanceAsOf : btcPriceFromCoinGecko !== null ? coinGeckoAsOf : null,
      fearGreed: fearGreed !== null ? fearGreedAsOf : null,
      ma200Week: btc200WeekMean?.asOf ?? null
    },
    sources,
    layer1,
    layer2,
    layer3,
    layer4,
    layer5,
    bottomSignals,
    compositeScore,
    bitviewValuationHistory,
    bitviewTrend,
    signalHistory,
    historySources
  };
}
