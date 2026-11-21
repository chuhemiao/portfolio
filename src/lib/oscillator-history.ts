export const UTC_DAY_MS = 86_400_000;
export const MAX_OSCILLATOR_HISTORY_DAYS = 1825;

type DailyClose = [day: number, close: number];
export type OscillatorHistorySource = 'binance' | 'binance-cross' | 'coingecko';

export interface OscillatorHistory {
  source: OscillatorHistorySource;
  markets: string[];
  startDay: number;
  closes: (number | null)[];
}

function isDay(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) &&
    value > 0 && value % UTC_DAY_MS === 0 && value < 8.64e15;
}

function isPrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function priceNumber(value: unknown) {
  return typeof value === 'string' && value.trim() ? Number(value) : value;
}

export function binanceDailyCloses(rows: unknown, cutoff: number): DailyClose[] {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row): DailyClose[] => {
    if (!Array.isArray(row)) return [];
    const [open, , , , rawClose, volume, closeTime, , trades] = row;
    const close = priceNumber(rawClose);
    if (!isDay(open) || closeTime !== open + UTC_DAY_MS - 1 || closeTime >= cutoff ||
      !isPrice(close) || !isPrice(priceNumber(volume)) || !Number.isSafeInteger(trades) || trades < 1) return [];
    return [[open, close]];
  });
}

export function coinGeckoDailySamples(rows: unknown, cutoff: number): DailyClose[] {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((sample): DailyClose[] =>
    Array.isArray(sample) && isDay(sample[0]) && sample[0] <= cutoff && isPrice(sample[1])
      ? [[sample[0], sample[1]]]
      : []
  );
}

export function ratioByUtcDay(base: DailyClose[], benchmark: DailyClose[]): DailyClose[] {
  const btcByDay = new Map<number, number>();
  for (const [day, close] of benchmark) {
    if (btcByDay.has(day) && btcByDay.get(day) !== close) return [];
    btcByDay.set(day, close);
  }
  return base.flatMap(([day, price]): DailyClose[] => {
    const btc = btcByDay.get(day);
    if (btc === undefined || !isPrice(price / btc)) return [];
    return [[day, price / btc]];
  });
}

export function makeOscillatorHistory(
  points: DailyClose[],
  source: OscillatorHistorySource,
  markets: string[],
  cutoff: number
): OscillatorHistory | null {
  const firstAllowedDay = Math.floor(cutoff / UTC_DAY_MS) * UTC_DAY_MS -
    (MAX_OSCILLATOR_HISTORY_DAYS - (source === 'coingecko' ? 1 : 0)) * UTC_DAY_MS;
  const quotes = points.filter(([day, close]) => isDay(day) && isPrice(close) && day >= firstAllowedDay && day <= cutoff);
  if (quotes.length < 2) return null;
  const byDay = new Map<number, number>();
  for (const [day, close] of quotes) {
    if (byDay.has(day) && byDay.get(day) !== close) return null;
    byDay.set(day, close);
  }
  const days = [...byDay.keys()].sort((a, b) => a - b);
  const startDay = days[0];
  const latestDay = days.at(-1)!;
  if (days.length < 2 || cutoff - latestDay > 2 * UTC_DAY_MS) return null;
  const closes = Array.from({ length: (latestDay - startDay) / UTC_DAY_MS + 1 }, (_, i) =>
    byDay.get(startDay + i * UTC_DAY_MS) ?? null
  );
  return { source, markets, startDay, closes };
}

export function historyAnchors(history: OscillatorHistory) {
  const twoYears = history.closes.slice(-730);
  const completeTwoYears = twoYears.length === 730 && twoYears.every(isPrice);
  const closes = history.closes.filter(isPrice);
  return {
    currentCyclePeak: completeTwoYears ? Math.max(...twoYears) : null,
    fiveYearLow: Math.min(...closes),
    historyStart: new Date(history.startDay).toISOString(),
    historyAsOf: new Date(history.startDay + (history.closes.length - 1) * UTC_DAY_MS +
      (history.source === 'coingecko' ? 0 : UTC_DAY_MS - 1)).toISOString(),
    historyPointCount: closes.length,
  };
}

export function isOscillatorHistory(value: unknown): value is OscillatorHistory {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<OscillatorHistory>;
  if (!isDay(row.startDay) || !Array.isArray(row.closes) || row.closes.length < 2 ||
    row.closes.length > MAX_OSCILLATOR_HISTORY_DAYS || !isPrice(row.closes[0]) || !isPrice(row.closes.at(-1)) ||
    row.startDay + row.closes.length * UTC_DAY_MS > 8.64e15 ||
    !row.closes.every((close) => close === null || isPrice(close)) || !Array.isArray(row.markets) ||
    !row.markets.every((market) => typeof market === 'string')) return false;
  if (row.source === 'coingecko') return row.markets.length === 0;
  if (row.source === 'binance') return row.markets.length === 1 && /^[A-Z0-9]+BTC$/.test(row.markets[0]);
  return row.source === 'binance-cross' && row.markets.length === 2 &&
    /^[A-Z0-9]+USDT$/.test(row.markets[0]) && row.markets[1] === 'BTCUSDT';
}
