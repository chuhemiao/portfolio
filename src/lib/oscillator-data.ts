import { OSCILLATOR_MANUAL_SNAPSHOT } from '../data/oscillator-manual-snapshot';
import { normalizeOscillatorSnapshot } from './oscillator-snapshot';
import type { CoinConfig } from '../data/oscillator-coins';
import type { MarketSourceCoin } from './oscillator-helpers';

export type Grade = 'S' | 'A' | 'B' | 'F';
export type Action = 'Focus' | 'Watch' | 'Avoid';
export type RatioSource = 'binance' | 'coingecko' | 'none';
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
  positive7dBreadth: number | null;
  positive30dBreadth: number | null;
}

export interface OscillatorData {
  generatedAt: string;
  results: OscillatorResult[];
  universe: MarketBreadthRow[];
  summary: OscillatorSummary;
  btcPrice: number | null;
  mode: OscillatorDataMode;
  snapshotAsOf: string | null;
  note: string | null;
}

export async function getOscillatorData(): Promise<OscillatorData> {
  return normalizeOscillatorSnapshot(OSCILLATOR_MANUAL_SNAPSHOT);
}
