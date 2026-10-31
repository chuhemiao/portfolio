/**
 * Number formats shared by /stocks and the instrument pages.
 *
 * Turnover is a ratio (24h volume / market cap), rendered as a multiple, not a
 * percentage: bStocks has instruments at 38.46, and "3846%" is unreadable. The
 * four tones differ in lightness as well as hue so the tiers survive the light
 * theme. A missing figure is a dash — never 0, never "n/a".
 */

export const MISSING = '—';

const absent = (value?: number | null) => value === undefined || value === null || !Number.isFinite(value);

export const formatUsd = (value?: number | null) => {
  if (absent(value)) return MISSING;
  const v = value as number;
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v}`;
};

export const formatPrice = (value?: number | null) =>
  absent(value)
    ? MISSING
    : `$${(value as number).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export type TurnoverTone = 'subtle' | 'default' | 'brand' | 'negative';

export const TURNOVER_TONE_CLASS: Record<TurnoverTone, string> = {
  subtle: 'text-subtle',
  default: '',
  brand: 'text-brand',
  negative: 'text-negative',
};

export const turnoverTone = (ratio?: number | null): TurnoverTone => {
  if (absent(ratio)) return 'subtle';
  const r = ratio as number;
  if (r >= 5) return 'negative';
  if (r >= 1) return 'brand';
  if (r >= 0.3) return 'default';
  return 'subtle';
};

export const formatTurnover = (ratio?: number | null) =>
  absent(ratio) ? MISSING : `${(ratio as number).toFixed((ratio as number) >= 5 ? 1 : 2)}×`;

export const formatChange = (pct?: number | null) => {
  if (absent(pct)) return MISSING;
  const p = pct as number;
  const sign = p > 0 ? '+' : p < 0 ? '−' : '';
  return `${sign}${Math.abs(p).toFixed(2)}%`;
};

export const changeToneClass = (pct?: number | null) =>
  absent(pct) ? 'text-subtle' : (pct as number) >= 0 ? 'text-positive' : 'text-negative';

export const formatSupply = (value?: number | null) =>
  absent(value) ? MISSING : Math.round(value as number).toLocaleString('en-US');
