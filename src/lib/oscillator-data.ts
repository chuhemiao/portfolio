import { OSCILLATOR_MANUAL_SNAPSHOT } from '../data/oscillator-manual-snapshot';
import { normalizeOscillatorSnapshot } from './oscillator-snapshot';
import type { CoinConfig } from '../data/oscillator-coins';
import type { MarketSourceCoin } from './oscillator-helpers';
import type { OscillatorHistorySource } from './oscillator-history';

export type Grade = 'S' | 'A' | 'B' | 'F';
export type Action = 'Focus' | 'Watch' | 'Avoid';
export type RatioSource = 'binance' | 'coingecko' | 'usd-derived' | 'none';
export type OscillatorDataMode = 'live' | 'snapshot';

export interface MarketBreadthRow extends MarketSourceCoin {
  bestRank: number | null;
  binanceSymbol: string | null;
  binanceListed: boolean;
  currentRatio: number | null;
  currentRatioSource: RatioSource;
  binanceChange24h: number | null;
  binanceQuoteVolume: number | null;
}

export interface OscillatorResult {
  coin: CoinConfig;
  currentRatio: number | null;
  currentRatioSource: RatioSource;
  currentCyclePeak: number | null;
  lastCyclePeak: number | null;
  fiveYearLow: number | null;
  historySource?: OscillatorHistorySource | 'none';
  historyAsOf?: string | null;
  historyStart?: string | null;
  historyPointCount?: number;
  historyMarkets?: string[];
  historyRetained?: boolean;
  cycleChange: number | null;
  aboveFiveYearLow: number | null;
  grade: Grade;
  action: Action;
  observation: string;
  bestRank: number | null;
  coingeckoRank: number | null;
  coinmarketcapRank: number | null;
  dualTop300: boolean;
  marketCap: number | null;
  volume24h: number | null;
  change24h: number | null;
  change7d: number | null;
  change30d: number | null;
  binanceSymbol: string | null;
  researchFocus: boolean;
  researchSlug: string | null;
  researchType: string | null;
}

export interface OscillatorSummary {
  trackedAltcoins: number;
  researchFocusCount: number;
  dualRankedCount: number;
  binanceBtcPairs: number;
  positive7dCount: number;
  positive30dCount: number;
  valid7dCount?: number;
  valid30dCount?: number;
  positive7dBreadth: number | null;
  positive30dBreadth: number | null;
}

export interface OscillatorData {
  generatedAt: string;
  results: OscillatorResult[];
  universe: MarketBreadthRow[];
  summary: OscillatorSummary;
  btcPrice: number | null;
  freshness?: {
    sourceAsOf: Record<string, string>;
    historyAvailable: number;
    historyTotal: number;
    unavailableSources: string[];
  };
  mode: OscillatorDataMode;
  snapshotAsOf: string | null;
  note: string | null;
}

export async function getOscillatorData(): Promise<OscillatorData> {
  return normalizeOscillatorSnapshot(OSCILLATOR_MANUAL_SNAPSHOT);
}

export function getOscillatorHistoryAssetIds(): string[] {
  return Object.keys(OSCILLATOR_MANUAL_SNAPSHOT.history ?? {});
}

export function getOscillatorHistory(asset: string) {
  const history = OSCILLATOR_MANUAL_SNAPSHOT.history;
  if (!history || !Object.hasOwn(history, asset)) return null;
  return { asOf: OSCILLATOR_MANUAL_SNAPSHOT.asOf, series: history[asset] };
}
