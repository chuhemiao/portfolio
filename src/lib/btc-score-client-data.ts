export interface BtcIndicator {
  name: string;
  value: number | null;
  score: number;
  weight: number;
  group: string;
}

export interface BtcScoreData {
  btcPrice: number;
  score: number;
  dailyScore: number;
  weeklyScore: number;
  level: string;
  suggestion: string;
  indicators: BtcIndicator[];
  timestamp: string;
  _cached?: boolean;
  _snapshot?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;
}

export function isBtcScoreData(value: unknown): value is BtcScoreData {
  return isRecord(value) && typeof value.btcPrice === 'number' && Number.isFinite(value.btcPrice) && value.btcPrice > 0 &&
    isScore(value.score) && isScore(value.dailyScore) && isScore(value.weeklyScore) &&
    typeof value.level === 'string' && typeof value.suggestion === 'string' &&
    typeof value.timestamp === 'string' && Number.isFinite(Date.parse(value.timestamp)) &&
    (value._cached === undefined || typeof value._cached === 'boolean') &&
    Array.isArray(value.indicators) && value.indicators.length > 0 && value.indicators.every(indicator =>
      isRecord(indicator) && typeof indicator.name === 'string' &&
      (indicator.value === null || (typeof indicator.value === 'number' && Number.isFinite(indicator.value))) &&
      isScore(indicator.score) && typeof indicator.weight === 'number' && Number.isFinite(indicator.weight) && indicator.weight >= 0 &&
      (indicator.group === 'daily' || indicator.group === 'weekly'));
}

export async function loadBtcScore(signal: AbortSignal): Promise<BtcScoreData | null> {
  async function readCandidate(url: string): Promise<BtcScoreData | null> {
    if (signal.aborted) return null;
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener('abort', abort, { once: true });
    const timeout = setTimeout(abort, 10_000);
    try {
      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) return null;
      const json: unknown = await response.json();
      if (!signal.aborted && !controller.signal.aborted && isBtcScoreData(json)) return { ...json, _snapshot: url.endsWith('.json') };
    } catch {
      // The other source remains available when this read fails.
    } finally {
      clearTimeout(timeout);
      signal.removeEventListener('abort', abort);
    }
    return null;
  }
  const candidates = await Promise.all(['/api/btc-score', '/data/btc-score.json'].map(readCandidate));
  if (signal.aborted) return null;
  return candidates.reduce<BtcScoreData | null>((latest, candidate) =>
    candidate && (!latest || Date.parse(candidate.timestamp) > Date.parse(latest.timestamp)) ? candidate : latest, null);
}
