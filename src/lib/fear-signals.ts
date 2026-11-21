export type SignalStatus = 'on' | 'off' | 'unknown';

export const FEAR_SIGNAL_LABELS = {
  realizedPrice: 'BTC price below Realized Price',
  mvrvZ: 'MVRV Z-score below -1',
  fearGreed: 'Fear and Greed index below 20',
  dormancyFlow: 'Dormancy flow extremely low',
  uniqueAddresses: 'Unique addresses used rising',
  vix: 'VIX above 30',
  sp500Drawdown: 'S&P 500 drawdown above 20%',
  funding: 'Funding rate negative for extended period',
} as const;

export type FearSignalId = keyof typeof FEAR_SIGNAL_LABELS;
export type FearSignalStates = Record<FearSignalId, SignalStatus>;
export type TimedNumber = [time: number, value: number];

export const FEAR_ARCHIVE_PROVIDERS = {
  funding: 'Hyperliquid settled BTC funding',
  uniqueAddresses: 'Blockchain.com unique addresses used',
} as const;
const ARCHIVE_SIGNALS = ['funding', 'uniqueAddresses'] as const;
type FearArchiveSignal = (typeof ARCHIVE_SIGNALS)[number];

type FearArchiveSource = {
  source: string;
  status: 'ok' | 'degraded' | 'down';
  freshDays: number;
  retainedDays: number;
};

export type FearHistorySources = Record<FearArchiveSignal, FearArchiveSource> & {
  realizedPrice?: FearArchiveSource;
  mvrvZ?: FearArchiveSource;
};
export type FearHistoryPoint = {
  date: string;
  btcClose: number | null;
  signals: FearSignalStates;
  retainedFrom?: Partial<Record<FearArchiveSignal, string>>;
};
type FearBitviewZScore = { value: number; collectedAt: string };
export type FearBitviewDay = {
  date: string;
  collectedAt: string;
  usdClose: number;
  marketCap: number;
  realizedCap: number;
  realizedPrice: number;
  mvrvZ?: FearBitviewZScore;
};
export type FearBitviewTrend = {
  collectedAt: string;
  points: { date: string; usdClose: number; ma200Week: number }[];
};

export const FEAR_SIGNAL_IDS = Object.keys(FEAR_SIGNAL_LABELS) as FearSignalId[];
export const FEAR_BASE_SCORE = 45;
export const FEAR_SIGNAL_POINTS = { on: 8, off: -2, unknown: 0 } as const;
export const FEAR_HISTORY_DAYS = 180;
export const FEAR_BITVIEW_Z_HISTORY_LIMIT = 7000;
const FEAR_WEEKLY_MA_PERIOD = 200;
export const FEAR_BITVIEW_TREND_DAYS = FEAR_WEEKLY_MA_PERIOD * 7 + FEAR_HISTORY_DAYS;
export const HOUR_MS = 3_600_000;
export const DAY_MS = 24 * HOUR_MS;

type FearInputs = Partial<{
  btcPrice: number | null;
  realizedPrice: number | null;
  mvrvZ: number | null;
  fearGreed: number | null;
  dormancyFlow: number | null;
  uniqueAddressesRising: boolean | null;
  vix: number | null;
  sp500Drawdown: number | null;
  fundingWindow: TimedNumber[] | null;
}>;

function state(condition: boolean | null | undefined): SignalStatus {
  return condition == null ? 'unknown' : condition ? 'on' : 'off';
}

export function evaluateFearSignals(inputs: FearInputs): FearSignalStates {
  const { btcPrice, realizedPrice, mvrvZ, fearGreed, dormancyFlow, uniqueAddressesRising, vix, sp500Drawdown, fundingWindow } = inputs;
  return {
    realizedPrice: state(btcPrice != null && realizedPrice != null ? btcPrice < realizedPrice : null),
    mvrvZ: state(mvrvZ != null ? mvrvZ < -1 : null),
    fearGreed: state(fearGreed != null ? fearGreed < 20 : null),
    dormancyFlow: state(dormancyFlow != null ? dormancyFlow < 450_000 : null),
    uniqueAddresses: state(uniqueAddressesRising),
    vix: state(vix != null ? vix > 30 : null),
    sp500Drawdown: state(sp500Drawdown != null ? sp500Drawdown > 20 : null),
    funding: state(fundingWindow?.length === 8 ? fundingWindow.every(([, rate]) => rate < 0) : null),
  };
}

export function summarizeFearScore(states: SignalStatus[]) {
  const raw = states.reduce((score, value) => score + FEAR_SIGNAL_POINTS[value], FEAR_BASE_SCORE);
  return {
    raw,
    score: Math.max(0, Math.min(100, raw)),
    known: states.filter(value => value !== 'unknown').length,
  };
}

export function fearSourceNumber(value: unknown) {
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function utcBucket(time: number, length = DAY_MS) {
  return Math.floor(time / length) * length;
}

export function fearDay(time: number) {
  return new Date(time).toISOString().slice(0, 10);
}

function positiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function bitviewDailyClose(value: unknown) {
  if (!Array.isArray(value) || value.length !== 4 || !value.every(positiveNumber)) return null;
  const [open, high, low, close] = value;
  return low <= Math.min(open, close) && high >= Math.max(open, close) ? close : null;
}

function readBitviewSeries(payload: unknown, expectedTypes: string[], limit: number) {
  if (!Array.isArray(payload) || payload.length !== expectedTypes.length) return null;
  const start = payload[0]?.start;
  const end = payload[0]?.end;
  if (!Number.isSafeInteger(start) || start < 0 || !Number.isSafeInteger(end) || end <= start ||
      end - start > limit || payload.some((series, index) =>
        series?.index !== 'day1' || series.type !== expectedTypes[index] ||
        !Number.isSafeInteger(series.version) || series.start !== start || series.end !== end ||
        !Array.isArray(series.data) || series.data.length !== end - start
      )) return null;
  return { start, values: payload.map(series => series.data as unknown[]) };
}

export function readFearBitviewDays(payload: unknown, cutoff: number, collectedAt: string): FearBitviewDay[] {
  const series = readBitviewSeries(payload, ['Date', 'OHLCDollars', 'Dollars', 'Dollars', 'Dollars'], FEAR_HISTORY_DAYS);
  if (!series) return [];

  const [dates, prices, marketCaps, realizedCaps, realizedPrices] = series.values;
  const endDay = utcBucket(cutoff);
  const first = typeof dates[0] === 'string' ? Date.parse(dates[0]) : NaN;
  if (!Number.isFinite(first) || first < endDay - FEAR_HISTORY_DAYS * DAY_MS ||
      first + dates.length * DAY_MS > endDay) return [];

  const days: FearBitviewDay[] = [];
  for (let i = 0; i < dates.length; i += 1) {
    const date = fearDay(first + i * DAY_MS);
    const usdClose = bitviewDailyClose(prices[i]);
    const marketCap = marketCaps[i];
    const realizedCap = realizedCaps[i];
    const realizedPrice = realizedPrices[i];
    if (dates[i] !== date || usdClose === null || !positiveNumber(marketCap) || !positiveNumber(realizedCap) ||
        !positiveNumber(realizedPrice) || !positiveNumber(marketCap / realizedCap)) return [];
    days.push({ date, collectedAt, usdClose, marketCap, realizedCap, realizedPrice });
  }
  return days;
}

export function readFearBitviewTrend(payload: unknown, cutoff: number, collectedAt: string): FearBitviewTrend | undefined {
  const series = readBitviewSeries(payload, ['Date', 'OHLCDollars'], FEAR_BITVIEW_TREND_DAYS);
  if (!series) return undefined;
  const [dates, prices] = series.values;
  if (dates.length !== FEAR_BITVIEW_TREND_DAYS) return undefined;
  const first = utcBucket(cutoff) - dates.length * DAY_MS;
  const sundayCloses: number[] = [];
  const points: FearBitviewTrend['points'] = [];
  let ma200Week: number | null = null;
  for (let i = 0; i < dates.length; i += 1) {
    const day = first + i * DAY_MS;
    const date = fearDay(day);
    const usdClose = bitviewDailyClose(prices[i]);
    if (dates[i] !== date || usdClose === null) return undefined;
    if (new Date(day).getUTCDay() === 0) {
      sundayCloses.push(usdClose);
      if (sundayCloses.length >= FEAR_WEEKLY_MA_PERIOD) {
        ma200Week = sundayCloses.slice(-FEAR_WEEKLY_MA_PERIOD).reduce((sum, close) => sum + close, 0) / FEAR_WEEKLY_MA_PERIOD;
      }
    }
    if (i >= dates.length - FEAR_HISTORY_DAYS) {
      if (!positiveNumber(ma200Week)) return undefined;
      points.push({ date, usdClose, ma200Week });
    }
  }
  return { collectedAt, points };
}

export function retainFearBitviewTrend(previous: FearBitviewTrend | undefined, cutoff: number): FearBitviewTrend | undefined {
  if (!previous || typeof previous.collectedAt !== 'string' || !Array.isArray(previous.points) ||
      !previous.points.length || previous.points.length > FEAR_HISTORY_DAYS) return undefined;
  const collected = timestamp(previous.collectedAt);
  const first = Date.parse(previous.points[0]?.date);
  if (!Number.isFinite(collected) || collected > cutoff || !Number.isFinite(first) ||
      first + previous.points.length * DAY_MS > collected ||
      previous.points.some((point, i) => !point || point.date !== fearDay(first + i * DAY_MS) ||
        !positiveNumber(point.usdClose) || !positiveNumber(point.ma200Week))) return undefined;
  const start = fearDay(utcBucket(cutoff) - FEAR_HISTORY_DAYS * DAY_MS);
  const points = previous.points.filter(point => point.date >= start);
  return points.length ? { collectedAt: previous.collectedAt, points } : undefined;
}

export function readFearBitviewZScores(
  payload: unknown, valuation: FearBitviewDay[], cutoff: number, collectedAt: string,
): Map<string, FearBitviewZScore> {
  const scores = new Map<string, FearBitviewZScore>();
  const series = readBitviewSeries(payload, ['Date', 'Dollars', 'Dollars'], FEAR_BITVIEW_Z_HISTORY_LIMIT);
  if (!series || series.start !== 0) return scores;
  const [dates, marketCaps, realizedCaps] = series.values;
  const genesis = Date.UTC(2009, 0, 1);
  if (genesis + dates.length * DAY_MS > utcBucket(cutoff)) return scores;

  const valuationByDate = new Map(valuation.map(day => [day.date, day]));
  let count = 0;
  let mean = 0;
  let sumSquares = 0;
  for (let i = 0; i < dates.length; i += 1) {
    const date = fearDay(genesis + i * DAY_MS);
    const marketCap = marketCaps[i];
    if (dates[i] !== date || (marketCap !== null && marketCap !== 0 && !positiveNumber(marketCap))) return new Map();
    if (typeof marketCap === 'number') {
      count += 1;
      const difference = marketCap - mean;
      mean += difference / count;
      sumSquares += difference * (marketCap - mean);
      if (!Number.isFinite(sumSquares)) return new Map();
    }
    const day = valuationByDate.get(date);
    if (!day) continue;
    if (day.marketCap !== marketCap || day.realizedCap !== realizedCaps[i]) return new Map();
    const deviation = Math.sqrt(sumSquares / count);
    const value = (day.marketCap - day.realizedCap) / deviation;
    if (Number.isFinite(value)) scores.set(date, { value, collectedAt });
  }
  return scores;
}

export function retainFearBitviewDays(fresh: FearBitviewDay[], previous: FearBitviewDay[], cutoff: number) {
  const end = utcBucket(cutoff);
  const start = end - FEAR_HISTORY_DAYS * DAY_MS;
  const days = new Map<string, FearBitviewDay>();
  if (Array.isArray(previous) && previous.length <= FEAR_HISTORY_DAYS) {
    for (const row of previous) {
      if (!row || typeof row.date !== 'string' || typeof row.collectedAt !== 'string') continue;
      const day = Date.parse(row.date);
      const collected = timestamp(row.collectedAt);
      if (!Number.isFinite(day) || day < start || day >= end || row.date !== fearDay(day) ||
          !Number.isFinite(collected) || collected < day + DAY_MS || collected > cutoff ||
          ![row.usdClose, row.marketCap, row.realizedCap, row.realizedPrice, row.marketCap / row.realizedCap]
            .every(positiveNumber)) continue;
      const { mvrvZ, ...valuation } = row;
      const zCollected = typeof mvrvZ?.collectedAt === 'string' ? timestamp(mvrvZ.collectedAt) : NaN;
      days.set(row.date, mvrvZ && Number.isFinite(mvrvZ.value) && zCollected >= day + DAY_MS && zCollected <= cutoff
        ? row : valuation);
    }
  }
  for (const row of fresh) {
    const prior = days.get(row.date);
    days.set(row.date, prior?.mvrvZ && prior.marketCap === row.marketCap && prior.realizedCap === row.realizedCap
      ? { ...row, mvrvZ: prior.mvrvZ } : row);
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function addDatedValue(values: Map<number, number | null>, time: number, value: number) {
  values.set(time, values.has(time) && values.get(time) !== value ? null : value);
}

export function readClosedBtcDays(payload: unknown, cutoff: number): TimedNumber[] {
  const values = new Map<number, number | null>();
  if (!Array.isArray(payload) || payload.length > 1000) return [];
  for (const row of payload) {
    if (!Array.isArray(row)) continue;
    const start = fearSourceNumber(row[0]);
    const end = fearSourceNumber(row[6]);
    const close = fearSourceNumber(row[4]);
    if (start === null || start < 0 || start % DAY_MS !== 0 || end === null ||
        end !== start + DAY_MS - 1 || end >= cutoff || close === null || close <= 0) continue;
    addDatedValue(values, start, close);
  }
  return [...values].flatMap(([time, value]): TimedNumber[] => value === null ? [] : [[time, value]])
    .sort((a, b) => a[0] - b[0]);
}

export function indexFearDays(points: TimedNumber[], cutoff: number) {
  const values = new Map<number, number | null>();
  for (const [time, value] of points) {
    if (time >= 0 && time % DAY_MS === 0 && time + DAY_MS - 1 < cutoff && Number.isFinite(value)) {
      addDatedValue(values, time, value);
    }
  }
  return values;
}

export function uniqueAddressesRising(values: ReadonlyMap<number, number | null>, lastDay: number) {
  let recentTotal = 0;
  let priorTotal = 0;
  for (let offset = 0; offset < 14; offset += 1) {
    const count = values.get(lastDay - offset * DAY_MS);
    if (count == null) return null;
    if (offset < 7) recentTotal += count;
    else priorTotal += count;
  }
  return recentTotal > priorTotal;
}

export function indexFearFunding(points: TimedNumber[]) {
  const buckets = new Map<number, TimedNumber | null>();
  for (const point of points) {
    const [time, rate] = point;
    if (!Number.isSafeInteger(time) || time <= 0 || !Number.isFinite(rate)) continue;
    const hour = utcBucket(time, HOUR_MS);
    const previous = buckets.get(hour);
    buckets.set(hour, previous === undefined || (previous !== null && previous[0] === time && previous[1] === rate) ? point : null);
  }
  return buckets;
}

export function contiguousFundingWindow(
  buckets: ReadonlyMap<number, TimedNumber | null>,
  cutoff: number,
): TimedNumber[] | null {
  const lastHour = utcBucket(cutoff, HOUR_MS);
  const points: TimedNumber[] = [];
  for (let offset = 7; offset >= 0; offset -= 1) {
    const point = buckets.get(lastHour - offset * HOUR_MS);
    if (!point || point[0] > cutoff) return null;
    points.push(point);
  }
  return points;
}

export function buildFearSignalHistory(
  cutoff: number,
  closes: TimedNumber[],
  fearGreed: ReadonlyMap<number, number | null>,
  addresses: ReadonlyMap<number, number | null>,
  funding: ReadonlyMap<number, TimedNumber | null>,
  valuation: FearBitviewDay[] = [],
): FearHistoryPoint[] {
  const firstDay = utcBucket(cutoff) - FEAR_HISTORY_DAYS * DAY_MS;
  const priceByDay = new Map(closes);
  const valuationByDay = new Map(valuation.map(point => [point.date, point]));
  return Array.from({ length: FEAR_HISTORY_DAYS }, (_, index) => {
    const day = firstDay + index * DAY_MS;
    const date = fearDay(day);
    const bitview = valuationByDay.get(date);
    return {
      date,
      btcClose: priceByDay.get(day) ?? null,
      signals: evaluateFearSignals({
        btcPrice: bitview?.usdClose,
        realizedPrice: bitview?.realizedPrice,
        mvrvZ: bitview?.mvrvZ?.value,
        fearGreed: fearGreed.get(day),
        uniqueAddressesRising: uniqueAddressesRising(addresses, day),
        fundingWindow: contiguousFundingWindow(funding, day + DAY_MS - 1),
      }),
    };
  });
}

export function describeFearArchive(points: FearHistoryPoint[], signal: FearArchiveSignal, complete: boolean): FearArchiveSource {
  const freshDays = points.filter(day => day.signals[signal] !== 'unknown').length;
  return {
    source: FEAR_ARCHIVE_PROVIDERS[signal],
    status: freshDays === 0 ? 'down' : complete ? 'ok' : 'degraded',
    freshDays,
    retainedDays: 0,
  };
}

type FearArchiveSnapshot = {
  generatedAt: string;
  signalHistory?: FearHistoryPoint[];
  historySources?: FearHistorySources;
};

function timestamp(value: string) {
  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === value ? milliseconds : NaN;
}

function knownState(value: SignalStatus | undefined): value is 'on' | 'off' {
  return value === 'on' || value === 'off';
}

export function retainFearArchive(
  current: Required<FearArchiveSnapshot>,
  previous: FearArchiveSnapshot | null,
) {
  const { signalHistory, historySources } = current;
  if (previous?.signalHistory === undefined) return { signalHistory, historySources };

  const collected = timestamp(previous.generatedAt);
  if (!Array.isArray(previous.signalHistory) || previous.signalHistory.length > FEAR_HISTORY_DAYS ||
      !Number.isFinite(collected) || collected > timestamp(current.generatedAt)) {
    throw new Error('Incompatible previous Fear archive snapshot');
  }
  const priorByDay = new Map<string, FearHistoryPoint>();
  for (const day of previous.signalHistory) {
    const start = Date.parse(day?.date);
    if (!Number.isFinite(start) || day.date !== fearDay(start) || start + DAY_MS > collected ||
        priorByDay.has(day.date) || !day.signals ||
        FEAR_SIGNAL_IDS.some(key => day.signals[key] !== 'unknown' && !knownState(day.signals[key]))) {
      throw new Error('Incompatible previous Fear archive day');
    }
    priorByDay.set(day.date, day);
  }

  if (priorByDay.size && !signalHistory.some(day => priorByDay.has(day.date)) &&
      ARCHIVE_SIGNALS.some(key => historySources[key].status !== 'ok' &&
        previous.signalHistory?.some(day => knownState(day.signals[key])))) {
    throw new Error('Previous Fear archive has no overlapping closed days');
  }

  const retained = { funding: 0, uniqueAddresses: 0 };
  const merged = signalHistory.map(day => {
    const prior = priorByDay.get(day.date);
    if (!prior) return day;
    const signals = { ...day.signals };
    const retainedFrom: FearHistoryPoint['retainedFrom'] = {};
    for (const key of ARCHIVE_SIGNALS) {
      const oldState = prior.signals[key];
      if (signals[key] !== 'unknown' || !knownState(oldState)) continue;
      if (previous.historySources !== undefined && previous.historySources?.[key]?.source !== historySources[key].source) {
        throw new Error(`Incompatible previous Fear archive source for ${key}`);
      }
      const origin = prior.retainedFrom?.[key] ?? previous.generatedAt;
      const observedAt = timestamp(origin);
      if (!Number.isFinite(observedAt) || observedAt < Date.parse(day.date) + DAY_MS || observedAt > collected) {
        throw new Error(`Incompatible previous Fear archive timestamp for ${key}`);
      }
      signals[key] = oldState;
      retainedFrom[key] = origin;
      retained[key] += 1;
    }
    return Object.keys(retainedFrom).length ? { ...day, signals, retainedFrom } : day;
  });
  const sources = { ...historySources };
  for (const key of ARCHIVE_SIGNALS) {
    if (!retained[key]) continue;
    sources[key] = {
      ...sources[key],
      status: sources[key].freshDays ? 'degraded' : 'down',
      retainedDays: retained[key],
    };
  }
  return { signalHistory: merged, historySources: sources };
}

export function summarizeFearHistory(points: FearHistoryPoint[]) {
  return points.map(point => {
    const { score, known } = summarizeFearScore(Object.values(point.signals));
    return { ...point, score: known ? score : null, known };
  });
}

type ScoredDay = ReturnType<typeof summarizeFearHistory>[number];

export function findFearTriggers(points: ScoredDay[], threshold: number, consecutive: number) {
  const runs: ScoredDay[][] = [];
  let run: ScoredDay[] = [];
  for (const point of points) {
    if (point.score === null || point.score < threshold || point.btcClose === null) {
      run = [];
      continue;
    }
    const previous = run.at(-1);
    if (!previous || Date.parse(point.date) - Date.parse(previous.date) !== DAY_MS) {
      run = [];
      runs.push(run);
    }
    run.push(point);
  }
  return runs.filter(days => days.length >= consecutive).map(days => ({
    start: days[0],
    trigger: days[consecutive - 1],
    end: days[days.length - 1],
    days: days.length,
    peak: Math.max(...days.map(day => day.score ?? 0)),
    minKnown: Math.min(...days.map(day => day.known)),
    maxKnown: Math.max(...days.map(day => day.known)),
  }));
}
