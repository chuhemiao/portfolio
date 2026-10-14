'use client';

import { getTranslator, type Locale } from '@/lib/i18n';
import { getLocalizedWeeklyReport } from '@/lib/weekly-localization';
import { useDashboardI18n } from '../fear/use-dashboard-i18n';

import { useEffect, useState } from 'react';
import type {
  Grade,
  MarketBreadthRow,
  OscillatorData,
  OscillatorResult,
  OscillatorSummary,
} from '@/lib/oscillator-data';
import { formatAltBtcRatio, paginateCollection } from '@/lib/oscillator-helpers';
import { loadBtcScore, type BtcIndicator, type BtcScoreData } from '@/lib/btc-score-client-data';

const GRADE_STYLES: Record<Grade, { bg: string; text: string; border: string; label: string }> = {
  S: { bg: 'bg-emerald-500/15', text: 'text-emerald-600', border: 'border-emerald-500/30', label: 'Outperformed' },
  A: { bg: 'bg-sky-500/15', text: 'text-sky-600', border: 'border-sky-500/30', label: 'Strong Oscillator' },
  B: { bg: 'bg-amber-500/15', text: 'text-amber-600', border: 'border-amber-500/30', label: 'Wait / Track' },
  F: { bg: 'bg-rose-500/15', text: 'text-rose-600', border: 'border-rose-500/30', label: 'Failed / Avoid' },
};

const ACTION_STYLES: Record<string, string> = {
  Focus: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  Watch: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  Avoid: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
};

type FocusFilterTab = 'all' | 'S' | 'A' | 'B' | 'F';
type UniverseFilterTab = 'all' | 'research' | 'binance' | 'dual' | 'positive7d';
type MainTab = 'focus' | 'breadth' | 'heat' | 'weekly';
const UNIVERSE_PAGE_SIZE = 50;

// ── Formatters ──────────────────────────────────────────────────────────────

function formatPct(value: number | null): string {
  if (value === null || value === undefined) return 'N/A';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function formatUsd(value: number | null): string {
  if (value === null || value === undefined) return 'N/A';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function formatVolumeRatio(value: number | null): string {
  if (value === null || value === undefined) return 'N/A';
  return `${(value * 100).toFixed(2)}%`;
}

function formatSnapshotTimestamp(value: string | null, locale: Locale): string {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString(locale, {
    timeZone: 'UTC', month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatSnapshotAge(value: string | null): string {
  if (!value) return 'N/A';
  const now = Date.now();
  const ts = new Date(value).getTime();
  const diffMs = now - ts;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Updated today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

// ── Shared sub-components ────────────────────────────────────────────────────

function UpdateNotice({ data }: { data: OscillatorData }) {
  const { locale, d } = useDashboardI18n();
  const snapshotTime = data.snapshotAsOf ?? data.generatedAt;

  return (
    <div className='rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm shadow-sm shadow-amber-500/5'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1'>
          <p className='font-semibold text-foreground'>{d("Market Snapshot")}</p>
          <p className='text-muted-foreground'> {d("Updated by an explicit snapshot refresh. Market moves after the source timestamps are not reflected yet.")} </p>
          {data.freshness ? <p className='text-xs text-muted-foreground'>{d("Available history:")} {data.freshness.historyAvailable}/{data.freshness.historyTotal} {d("focus assets. Missing history remains unavailable.")}</p> : null}
        </div>
        <div className='shrink-0 rounded-xl border border-amber-500/20 bg-background/70 px-3 py-2 text-xs text-muted-foreground'>
          <p className='font-medium text-foreground'>{d(formatSnapshotAge(snapshotTime))}</p>
          <p>{d("Snapshot as of")} {formatSnapshotTimestamp(snapshotTime, locale)}</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  const { d } = useDashboardI18n();
  return (
    <div className='rounded-2xl border border-border/70 bg-background/75 p-4 shadow-sm'>
      <p className='text-[11px] uppercase tracking-[0.16em] text-muted-foreground'>{d(label)}</p>
      <p className='mt-2 text-2xl font-semibold tracking-tight'>{d(value)}</p>
      <p className='mt-2 text-xs text-muted-foreground'>{d(hint)}</p>
    </div>
  );
}

function SummaryGrid({ summary }: { summary: OscillatorSummary }) {
  const { d } = useDashboardI18n();
  return (
    <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
      <StatCard
        label={d("Tracked Alts")}
        value={summary.trackedAltcoins.toString()}
        hint={d("The top-500 altcoin universe after removing BTC and stablecoins from the CoinGecko + CoinMarketCap ranking set.")}
      />
      <StatCard
        label={d("Research Focus")}
        value={summary.researchFocusCount.toString()}
        hint={d("Tokens tied directly to your current research pipeline and promoted into the focus set.")}
      />
      <StatCard
        label={d("Binance BTC Pairs")}
        value={summary.binanceBtcPairs.toString()}
        hint={d("Assets with a live Binance spot BTC pair, giving us a cleaner ALT/BTC market price.")}
      />
      <StatCard
        label={d("Dual Ranked")}
        value={summary.dualRankedCount.toString()}
        hint={d("Names that appear in both the CoinGecko and CoinMarketCap top-300 ranking sets.")}
      />
      <StatCard
        label={d("7D Breadth")}
        value={summary.positive7dBreadth !== null ? `${summary.positive7dBreadth.toFixed(1)}%` : 'N/A'}
        hint={d(`${summary.positive7dCount} names are positive over 7 days, which helps gauge short-term alt breadth.`)}
      />
      <StatCard
        label={d("30D Breadth")}
        value={summary.positive30dBreadth !== null ? `${summary.positive30dBreadth.toFixed(1)}%` : 'N/A'}
        hint={d(`${summary.positive30dCount} names are positive over 30 days, which helps gauge medium-term breadth expansion.`)}
      />
    </div>
  );
}

function RankBadges({
  coingeckoRank,
  coinmarketcapRank,
}: {
  coingeckoRank: number | null;
  coinmarketcapRank: number | null;
}) {
  const { d } = useDashboardI18n();
  return (
    <div className='flex flex-wrap items-center gap-1.5'>
      {coingeckoRank ? (
        <span className='rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700'> {d("CG #")}{coingeckoRank}
        </span>
      ) : null}
      {coinmarketcapRank ? (
        <span className='rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-700'> {d("CMC #")}{coinmarketcapRank}
        </span>
      ) : null}
    </div>
  );
}

function FocusCoinCard({ result }: { result: OscillatorResult }) {
  const { locale, d } = useDashboardI18n();
  const style = GRADE_STYLES[result.grade];
  const actionStyle = ACTION_STYLES[result.action] ?? '';

  return (
    <div className='rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm shadow-black/5 space-y-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='space-y-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-base font-semibold tracking-tight'>{result.coin.symbol}</span>
            <span className='text-sm text-muted-foreground'>{d(result.coin.name)}</span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] ${
                result.coin.category === 'veteran'
                  ? 'border-violet-500/20 bg-violet-500/10 text-violet-700'
                  : 'border-cyan-500/20 bg-cyan-500/10 text-cyan-700'
              }`}
            >
              {d(result.coin.category === 'veteran' ? 'Veteran' : 'Single-Cycle')}
            </span>
            {result.researchFocus ? (
              <span className='rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-700'> {d("Research")} </span>
            ) : null}
            {result.binanceSymbol ? (
              <span className='rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2 py-0.5 text-[10px] text-zinc-700'>
                {result.binanceSymbol}
              </span>
            ) : null}
          </div>
          <RankBadges coingeckoRank={result.coingeckoRank} coinmarketcapRank={result.coinmarketcapRank} />
          {result.researchType ? (
            <p className='text-xs text-muted-foreground'>{d(result.researchType)}</p>
          ) : null}
        </div>

        <div className='flex items-center gap-2'>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${style.bg} ${style.text} ${style.border}`}>
            {result.grade}
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] ${actionStyle}`}>
            {d(result.action)}
          </span>
        </div>
      </div>

      <div className='grid gap-2 sm:grid-cols-3 xl:grid-cols-6'>
        <MetricCard label={d("Current ALT/BTC")} value={formatAltBtcRatio(result.currentRatio)} accent={result.currentRatioSource} />
        <MetricCard label={d("24H")} value={formatPct(result.change24h)} tone={result.change24h} />
        <MetricCard label={d("7D")} value={formatPct(result.change7d)} tone={result.change7d} />
        <MetricCard label={d("30D")} value={formatPct(result.change30d)} tone={result.change30d} />
        <MetricCard label={d("Best Rank")} value={result.bestRank ? `#${result.bestRank}` : 'N/A'} />
        <MetricCard label={d("Vol / MCap")} value={formatVolumeRatio(result.volume24h && result.marketCap ? result.volume24h / result.marketCap : null)} />
      </div>

      <div className='grid gap-2 sm:grid-cols-2 xl:grid-cols-5'>
        <MetricCard label={d("2Y Close Peak")} value={formatAltBtcRatio(result.currentCyclePeak)} />
        <MetricCard label={d("VS Last Top")} value={result.coin.category === 'veteran' ? formatPct(result.cycleChange) : '—'} tone={result.cycleChange} />
        <MetricCard label={d("Above Available Low")} value={formatPct(result.aboveFiveYearLow)} tone={result.aboveFiveYearLow} />
        <MetricCard label={d("Market Cap")} value={formatUsd(result.marketCap)} />
        <MetricCard label={d("24H Volume")} value={formatUsd(result.volume24h)} />
      </div>

      <p className='text-[11px] leading-relaxed text-muted-foreground'>
        {d("Current ratio source:")} {d(result.currentRatioSource === 'usd-derived' ? 'USD-derived ALT/BTC' : result.currentRatioSource)}
        {' · '}{d("Daily-close history:")} {d(result.historySource ?? 'none')}
        {result.historyStart && result.historyAsOf ? ` · ${formatSnapshotTimestamp(result.historyStart, locale)} — ${formatSnapshotTimestamp(result.historyAsOf, locale)}` : null}
      </p>
      <p className='text-xs leading-relaxed text-muted-foreground'>{d(result.observation)}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
  accent,
}: {
  label: string;
  value: string;
  tone?: number | null;
  accent?: string;
}) {
  const { d } = useDashboardI18n();
  const toneClass =
    tone === undefined || tone === null
      ? ''
      : tone > 0
        ? 'text-emerald-600'
        : tone < 0
          ? 'text-rose-600'
          : '';
  const accentClass =
    accent === 'binance'
      ? 'border-amber-500/20'
      : accent === 'coingecko'
        ? 'border-emerald-500/20'
        : 'border-border';

  return (
    <div className={`rounded-xl border bg-background/60 p-3 ${accentClass}`}>
      <p className='text-[10px] uppercase tracking-[0.14em] text-muted-foreground'>{d(label)}</p>
      <p className={`mt-1 text-sm font-semibold ${toneClass}`}>{d(value)}</p>
    </div>
  );
}

function UniverseTable({ rows }: { rows: MarketBreadthRow[] }) {
  const { d } = useDashboardI18n();
  return (
    <div className='overflow-hidden rounded-2xl border border-border/70 bg-background/80 shadow-sm shadow-black/5'>
      <div className='overflow-x-auto'>
        <table className='min-w-[980px] w-full text-sm'>
          <thead className='bg-muted/35 text-left text-[11px] uppercase tracking-[0.16em] text-muted-foreground'>
            <tr>
              <th className='px-4 py-3 font-medium'>{d("Rank")}</th>
              <th className='px-4 py-3 font-medium'>{d("Asset")}</th>
              <th className='px-4 py-3 font-medium'>{d("24H")}</th>
              <th className='px-4 py-3 font-medium'>{d("7D")}</th>
              <th className='px-4 py-3 font-medium'>{d("30D")}</th>
              <th className='px-4 py-3 font-medium'>{d("ALT/BTC")}</th>
              <th className='px-4 py-3 font-medium'>{d("Vol / MCap")}</th>
              <th className='px-4 py-3 font-medium'>{d("Binance")}</th>
              <th className='px-4 py-3 font-medium'>{d("Market Cap")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.symbol} className='border-t border-border/60 align-top'>
                <td className='px-4 py-3 text-xs text-muted-foreground'>
                  <div className='space-y-1'>
                    <p>{d(row.bestRank ? `#${row.bestRank}` : 'N/A')}</p>
                    <RankBadges coingeckoRank={row.coingeckoRank} coinmarketcapRank={row.coinmarketcapRank} />
                  </div>
                </td>
                <td className='px-4 py-3'>
                  <div className='space-y-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='font-semibold'>{row.symbol}</span>
                      <span className='text-muted-foreground'>{d(row.name)}</span>
                    </div>
                    <div className='flex flex-wrap gap-1.5'>
                      {row.researchFocus ? (
                        <span className='rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-700'> {d("Research")} </span>
                      ) : null}
                      {row.dualTop300 ? (
                        <span className='rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-700'> {d("Dual")} </span>
                      ) : null}
                      <span className='rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2 py-0.5 text-[10px] text-zinc-700'>
                        {d(row.currentRatioSource === 'usd-derived' ? 'USD-derived ALT/BTC' : row.currentRatioSource)}
                      </span>
                      {row.researchType ? (
                        <span className='rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground'>
                          {d(row.researchType)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className={`px-4 py-3 font-medium ${toneClass(row.change24h)}`}>{formatPct(row.change24h)}</td>
                <td className={`px-4 py-3 font-medium ${toneClass(row.change7d)}`}>{formatPct(row.change7d)}</td>
                <td className={`px-4 py-3 font-medium ${toneClass(row.change30d)}`}>{formatPct(row.change30d)}</td>
                <td className='px-4 py-3 font-medium'>{formatAltBtcRatio(row.currentRatio)}</td>
                <td className='px-4 py-3 font-medium'>
                  {formatVolumeRatio(row.volume24h && row.marketCap ? row.volume24h / row.marketCap : null)}
                </td>
                <td className='px-4 py-3 text-xs'>
                  {row.binanceSymbol ? (
                    <div className='space-y-1'>
                      <p className='font-medium'>{row.binanceSymbol}</p>
                      <p className={toneClass(row.binanceChange24h)}>{formatPct(row.binanceChange24h)}</p>
                    </div>
                  ) : (
                    <span className='text-muted-foreground'>{d("N/A")}</span>
                  )}
                </td>
                <td className='px-4 py-3 font-medium'>{formatUsd(row.marketCap)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function toneClass(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  if (value > 0) return 'text-emerald-600';
  if (value < 0) return 'text-rose-600';
  return '';
}

const INDICATOR_NAME_EN: Record<string, string> = {
  'ETF 每日净流入': 'ETF Daily Net Flow',
  'Funding Rate': 'Funding Rate',
  '多空比': 'Long/Short Ratio',
  '恐惧贪婪指数': 'Fear & Greed Index',
  'LTH-MVRV': 'LTH-MVRV',
  'NUPL': 'NUPL',
  'LTH-SOPR': 'LTH-SOPR',
  'STH-SOPR': 'STH-SOPR',
  'LTH 持有者占比': 'LTH Supply %',
  '365日均线倍数': '365D MA Ratio',
  '200周均线倍数': '200W MA Multiplier',
  '周线 RSI': 'Weekly RSI',
  '成交量变化': 'Volume Change',
};



const INDICATOR_DESCRIPTIONS: Record<string, string> = {
  'ETF 每日净流入': 'Net daily USD flow into spot Bitcoin ETFs (e.g. BlackRock IBIT, Fidelity FBTC). Large inflows signal institutional buying pressure; large outflows signal selling.',
  'Funding Rate': 'Periodic payment between longs and shorts in perpetual futures. Positive = longs pay shorts (bullish bias). Negative = shorts pay longs (bearish). High positive rates indicate crowded long positions.',
  '多空比': 'Ratio of long to short positions on major exchanges. Above 1.0 = more longs. Extreme long crowding (>2.0) is vulnerable to liquidation cascades.',
  '恐惧贪婪指数': 'Composite sentiment index (0–100) aggregating volatility, volume, social media, surveys, dominance, and Google Trends. <15 = extreme fear; >80 = extreme greed.',
  'LTH-MVRV': 'Market Value to Realized Value for Long-Term Holders (coins held >155 days). <1.0 means LTH are underwater — historically only seen at major cycle bottoms.',
  'NUPL': 'Net Unrealized Profit/Loss = (Market Cap − Realized Cap) / Market Cap. Negative = network-wide losses (capitulation). >0.75 = euphoria (likely top).',
  'LTH-SOPR': 'Spent Output Profit Ratio for Long-Term Holders. <1.0 means LTH are selling at a loss — extremely rare and a powerful bottom signal.',
  'STH-SOPR': 'Spent Output Profit Ratio for Short-Term Holders (coins held <155 days). Persistently <1.0 means recent buyers are panic selling — a bear market signal.',
  'LTH 持有者占比': 'Percentage of total BTC supply held by Long-Term Holders. High % = accumulation phase (coins in strong hands). Low % = distribution phase (coins moving to speculators). Inverted indicator.',
  '365日均线倍数': 'Current BTC price divided by its 365-day moving average. <1.0 means price is below the annual average — historically a bear market accumulation zone.',
  '200周均线倍数': 'Current BTC price divided by the 200-week moving average. The 200WMA has acted as the ultimate floor in every Bitcoin cycle. Ratios >3.5x have marked cycle tops.',
  '周线 RSI': '14-period Relative Strength Index on the weekly chart. <30 = historically rare oversold levels seen only at major cycle bottoms. >80 = late-stage bull market tops.',
  '成交量变化': 'Current 24h trading volume vs. 30-day average. Volume dry-up after a crash signals selling exhaustion. Extreme volume spikes after a rally can indicate a blow-off top.',
};

// ── BTC Heat components ──────────────────────────────────────────────────────

function heatLevelStyle(score: number): { color: string; label: string; dot: string } {
  if (score <= 15) return { color: 'text-blue-600', label: 'Extreme Fear', dot: 'bg-blue-500' };
  if (score <= 30) return { color: 'text-emerald-600', label: 'Fear', dot: 'bg-emerald-500' };
  if (score <= 45) return { color: 'text-emerald-500', label: 'Moderate Fear', dot: 'bg-emerald-400' };
  if (score <= 55) return { color: 'text-muted-foreground', label: 'Neutral', dot: 'bg-zinc-400' };
  if (score <= 70) return { color: 'text-amber-600', label: 'Moderate Greed', dot: 'bg-amber-500' };
  if (score <= 85) return { color: 'text-orange-600', label: 'Greed', dot: 'bg-orange-500' };
  return { color: 'text-rose-600', label: 'Extreme Greed', dot: 'bg-rose-500' };
}

function HeatScoreBar({ score }: { score: number }) {
  const { d } = useDashboardI18n();
  const style = heatLevelStyle(score);
  return (
    <div className='space-y-2'>
      <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
        <div
          className='h-full rounded-full transition-all'
          style={{
            width: `${score}%`,
            background: 'linear-gradient(90deg, #3b82f6 0%, #22c55e 30%, #eab308 60%, #f97316 80%, #ef4444 100%)',
          }}
        />
      </div>
      <div className='flex justify-between text-[10px] text-muted-foreground'>
        <span>{d("0 Extreme Fear")}</span>
        <span>{d("50 Neutral")}</span>
        <span>{d("100 Extreme Greed")}</span>
      </div>
    </div>
  );
}

function BtcHeatIndicatorCard({ indicator }: { indicator: BtcIndicator }) {
  const { d } = useDashboardI18n();
  const pct = Math.round(indicator.score);
  const style = heatLevelStyle(pct);
  const nameEn = INDICATOR_NAME_EN[indicator.name] ?? indicator.name;
  const description = INDICATOR_DESCRIPTIONS[indicator.name];
  const rawDisplay =
    indicator.value !== null && indicator.value !== undefined
      ? typeof indicator.value === 'number'
        ? indicator.value.toFixed(Math.abs(indicator.value) < 10 ? 3 : 1)
        : String(indicator.value)
      : '—';

  return (
    <div className='group relative rounded-xl border border-border/70 bg-background/60 p-3 space-y-2'>
      <div className='flex items-start justify-between gap-2'>
        <p className={`text-[11px] leading-tight text-muted-foreground ${description ? 'cursor-help underline decoration-dashed underline-offset-2' : ''}`}>
          {d(nameEn)}
        </p>
        <span className='shrink-0 text-[10px] text-muted-foreground'>×{indicator.weight}</span>
      </div>
      <div className='flex items-end justify-between'>
        <p className={`text-lg font-semibold ${style.color}`}>{pct}</p>
        <p className='text-[10px] text-muted-foreground'>{rawDisplay}</p>
      </div>
      <div className='h-1 w-full rounded-full bg-muted overflow-hidden'>
        <div
          className='h-full rounded-full'
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #3b82f6 0%, #22c55e 30%, #eab308 60%, #f97316 80%, #ef4444 100%)',
          }}
        />
      </div>
      {description ? (
        <div className='pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-64 rounded-xl border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100'>
          {d(description)}
        </div>
      ) : null}
    </div>
  );
}

function BtcHeatTab() {
  const { locale, d } = useDashboardI18n();
  const [data, setData] = useState<BtcScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    loadBtcScore(controller.signal)
      .then((json) => {
        if (controller.signal.aborted) return;
        setData(json);
        if (!json) setError('Data unavailable');
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <p className='text-sm text-muted-foreground animate-pulse'>{d("Loading BTC Market Heat...")}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className='rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground'> {d("Unable to load BTC heat data —")} {d(error ?? 'unknown error')}{d(". Try refreshing.")} </div>
    );
  }

  const levelStyle = heatLevelStyle(data.score);
  const dailyIndicators = data.indicators.filter((i) => i.group === 'daily');
  const weeklyIndicators = data.indicators.filter((i) => i.group === 'weekly');
  const levelLabel = levelStyle.label;

  return (
    <div className='space-y-6'>
      <p className='text-xs text-muted-foreground'>{d("Source timestamps (UTC):")} {new Date(data.timestamp).toLocaleString(locale, { timeZone: 'UTC' })}</p>
      {data._snapshot ? (
        <div className='rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700'>{d("Live API unavailable — showing the synchronized snapshot.")}</div>
      ) : data._cached ? (
        <div className='rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700'> {d("Live API unavailable — showing last cached data")}{d(data.timestamp ? ` (as of ${new Date(data.timestamp).toLocaleString(locale, { timeZone: 'UTC' })})` : '')}.
        </div>
      ) : null}

      {/* Score header */}
      <div className='rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm shadow-black/5 space-y-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-1'>
            <p className='text-[11px] uppercase tracking-[0.16em] text-muted-foreground'>{d("Market Heat Score")}</p>
            <div className='flex items-baseline gap-3'>
              <span className={`text-4xl font-semibold ${levelStyle.color}`}>{Math.round(data.score)}</span>
              <span className='text-lg text-muted-foreground'>/ 100</span>
              <span className={`flex items-center gap-1.5 text-sm font-medium ${levelStyle.color}`}>
                <span className={`size-2 rounded-full ${levelStyle.dot}`} />
                {d(levelLabel)}
              </span>
            </div>
          </div>
          <div className='flex gap-4 text-xs text-muted-foreground'>
            <div className='text-center'>
              <p className='text-lg font-semibold text-foreground'>{Math.round(data.dailyScore)}</p>
              <p>{d("Daily / 32")}</p>
            </div>
            <div className='text-center'>
              <p className='text-lg font-semibold text-foreground'>{Math.round(data.weeklyScore)}</p>
              <p>{d("Weekly / 68")}</p>
            </div>
            <div className='text-center'>
              <p className='text-lg font-semibold text-foreground'>
                {d(data.btcPrice ? `$${data.btcPrice.toLocaleString(locale, { maximumFractionDigits: 0 })}` : '—')}
              </p>
              <p>{d("BTC Price")}</p>
            </div>
          </div>
        </div>
        <HeatScoreBar score={data.score} />
        {data.suggestion ? (
          <p className='text-sm text-muted-foreground border-t border-border/50 pt-3'>
            {d(data.score <= 15
              ? 'Extreme fear — historically a strong accumulation window. Consider building 60–80% of planned BTC allocation.'
              : data.score <= 30
                ? 'Market is fearful and undervalued. Batch accumulation recommended (40–60% of allocation).'
                : data.score <= 45
                  ? 'Cool market with emerging opportunity. Begin building position (20–40% of allocation).'
                  : data.score <= 55
                    ? 'Neutral sentiment. Hold current position and monitor for a directional shift.'
                    : data.score <= 70
                      ? 'Market running hot. Tighten stops and consider trimming 10–20%.'
                      : data.score <= 85
                        ? 'Overheated — distribution phase likely. Gradually take profits, reduce to 40–60% of peak position.'
                        : 'Extreme greed — historic top signal. Aggressive profit-taking recommended, reduce to 20% or less.')}
          </p>
        ) : null}
      </div>

      {/* Daily Pulse */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <h3 className='text-sm font-semibold tracking-tight'>{d("Daily Pulse")}</h3>
          <span className='text-xs text-muted-foreground'>{d("4 indicators · 32 pts")}</span>
        </div>
        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          {dailyIndicators.map((ind) => (
            <BtcHeatIndicatorCard key={ind.name} indicator={ind} />
          ))}
        </div>
      </div>

      {/* Weekly Structure */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <h3 className='text-sm font-semibold tracking-tight'>{d("Weekly Structure")}</h3>
          <span className='text-xs text-muted-foreground'>{d("9 indicators · 68 pts")}</span>
        </div>
        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          {weeklyIndicators.map((ind) => (
            <BtcHeatIndicatorCard key={ind.name} indicator={ind} />
          ))}
        </div>
      </div>

      {/* BTC Heat FAQ */}
      <FaqSection items={BTC_HEAT_FAQ} />
    </div>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────────────────

interface FaqItem {
  q: string;
  a: string;
}

function FaqSection({ items }: { items: FaqItem[] }) {
  const { d } = useDashboardI18n();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className='rounded-2xl border border-border/70 bg-background/80 shadow-sm shadow-black/5 overflow-hidden'>
      <div className='px-5 py-4 border-b border-border/50'>
        <h3 className='text-sm font-semibold tracking-tight'>{d("FAQ")}</h3>
      </div>
      <div className='divide-y divide-border/50'>
        {items.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className='w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium hover:bg-muted/30 transition-colors'
            >
              <span>{d(item.q)}</span>
              <span className='shrink-0 text-muted-foreground text-lg leading-none'>
                {d(open === i ? '−' : '+')}
              </span>
            </button>
            {open === i ? (
              <div className='px-5 pb-4 text-sm text-muted-foreground leading-relaxed'>
                {d(item.a)}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

const FOCUS_FAQ: FaqItem[] = [
  {
    q: 'What is the Research Focus set?',
    a: 'The focus set is a hand-curated watchlist of high-conviction altcoins that run through the full ALT/BTC cycle framework. Each name is scored, graded (S/A/B/F), and given an action label (Focus / Watch / Avoid) based on its oscillator position relative to historical cycle peaks.',
  },
  {
    q: 'What do the grades mean?',
    a: 'S = outperforming BTC this cycle. A = structurally strong oscillator. B = not yet confirmed, worth tracking. F = failed or still in decline — avoid until structure improves.',
  },
  {
    q: 'What is Veteran vs Single-Cycle?',
    a: 'Veteran coins have existed across multiple Bitcoin halving cycles and have historical peak data to compare against. Single-Cycle names only have data from the current or most recent cycle, so VS Last Top comparisons are not applicable.',
  },
  {
    q: 'How often does this data update?',
    a: 'The focus set updates when a new snapshot is synchronized. Short-term price moves between refreshes will not be reflected immediately.',
  },
];

const BREADTH_FAQ: FaqItem[] = [
  {
    q: 'What is Altcoin Breadth?',
    a: 'The breadth table covers the top ~500 altcoins from CoinGecko and CoinMarketCap (after removing BTC and stablecoins). It gives a market-wide view of how alts are performing relative to BTC.',
  },
  {
    q: 'What does the Research tag mean in the table?',
    a: 'Research-tagged coins are ones that appear in both this breadth universe and your current research pipeline (the focus set). It keeps content work and market monitoring connected in one view.',
  },
  {
    q: 'What does Dual mean?',
    a: 'Dual means the token is ranked in the top 300 on both CoinGecko and CoinMarketCap simultaneously.',
  },
  {
    q: 'What is ALT/BTC and why does it matter?',
    a: 'ALT/BTC is the exchange rate between an altcoin and Bitcoin. When ALT/BTC is rising, the altcoin is outperforming BTC. USD price is influenced by BTC movements — ALT/BTC strips that out to show real relative strength.',
  },
];

const BTC_HEAT_FAQ: FaqItem[] = [
  {
    q: 'What is the Market Heat Score?',
    a: 'A weighted composite score from 0 to 100 combining 13 on-chain, sentiment, and market indicators. 0 = Extreme Fear (historically the best accumulation windows). 100 = Extreme Greed (historically the best distribution windows).',
  },
  {
    q: 'What is the difference between Daily Pulse and Weekly Structure?',
    a: 'Daily Pulse (4 indicators, 32 pts) tracks fast-moving signals like ETF flows, funding rates, and sentiment. Weekly Structure (9 indicators, 68 pts) tracks slow-moving on-chain cycle signals like MVRV, NUPL, and SOPR. Weekly indicators are weighted heavier because they have a better track record for identifying cycle extremes.',
  },
  {
    q: 'How should I use this score?',
    a: 'Use the score as one input among many, not as a trading signal. Low scores suggest the market is undervalued and fearful — historically better times to accumulate. High scores suggest the market is overheated — historically better times to reduce exposure. Always DCA rather than going all-in.',
  },
  {
    q: 'How often does this data refresh?',
    a: 'BTC Heat requests the Worker API when the tab opens and uses the synchronized Day1Global snapshot if unavailable. Check the source timestamp before using the figures.',
  },
];

// ── Weekly Research ───────────────────────────────────────────────────────────

import { type WeeklyReport, WEEKLY_REPORTS } from '@/data/weekly-research';

const NEWS_CATEGORY_STYLE: Record<string, string> = {
  加密: 'border-sky-500/30 bg-sky-500/10 text-sky-600',
  宏观: 'border-violet-500/30 bg-violet-500/10 text-violet-600',
  科技: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600',
  地缘: 'border-rose-500/30 bg-rose-500/10 text-rose-600',
  政策: 'border-amber-500/30 bg-amber-500/10 text-amber-600',
};
const NEWS_CATEGORY_KEYS: Record<string, string> = {
  Crypto: '加密', 暗号資産: '加密', Macro: '宏观', マクロ: '宏观',
  Tech: '科技', 技術: '科技', Geopolitics: '地缘', 地政学: '地缘',
};

function SectionLabel({ icon, label }: { icon: string; label: string }) {
  const { d } = useDashboardI18n();
  return (
    <div className='flex items-center gap-2 py-3 px-5 border-b border-border/50 bg-muted/20'>
      <span className='text-sm'>{icon}</span>
      <span className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>{d(label)}</span>
    </div>
  );
}

function BulletList({ items, dot }: { items: string[]; dot: string }) {

  return (
    <ul className='space-y-2 px-5 py-4'>
      {items.map((item, i) => (
        <li key={i} className='flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed'>
          <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
          <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-medium">$1</strong>') }} />
        </li>
      ))}
    </ul>
  );
}

function WeeklyReportCard({ report, defaultOpen, language, fallbackOriginal }: { report: WeeklyReport; defaultOpen: boolean; language: Locale; fallbackOriginal: boolean }) {
  const { d, locale } = useDashboardI18n();
  const t = getTranslator(locale);
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div lang={language} className='rounded-2xl border border-border/70 bg-background/80 shadow-sm shadow-black/5 overflow-hidden'>
      {fallbackOriginal && <p className='px-5 pt-3 text-xs text-muted-foreground' lang={locale}>{t('Translation pending · original report', '译文待补充 · 显示原报告', '翻訳準備中 · 原文のレポートを表示')}</p>}
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className='w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/20 transition-colors'
      >
        <div className='flex items-center gap-3 min-w-0'>
          <span className='shrink-0 rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-600'> {d("日报")} </span>
          <div className='min-w-0'>
            <p className='text-[11px] font-medium tracking-widest text-muted-foreground uppercase leading-none mb-1'>
              {report.dateRange}{report.generatedAt ? ` · ${report.generatedAt}` : ''}
            </p>
            <p className='text-sm font-semibold leading-snug tracking-tight truncate'>{report.headline}</p>
          </div>
        </div>
        <span className='shrink-0 text-muted-foreground text-base leading-none'>{d(open ? '−' : '+')}</span>
      </button>

      {open ? (
        <div className='border-t border-border/50 divide-y divide-border/40'>

          {/* Core Judgment */}
          {(report.coreMacro || report.coreCrypto || (report.coreActions && report.coreActions.length > 0)) ? (
            <div>
              <SectionLabel icon='🧠' label={d("今日核心判断")} />
              <div className='px-5 py-4 space-y-3'>
                {report.coreMacro ? (
                  <div className='space-y-1'>
                    <p className='text-[10px] font-semibold uppercase tracking-widest text-violet-600'>{d("宏观")}</p>
                    <p className='text-sm text-muted-foreground leading-relaxed'>{report.coreMacro}</p>
                  </div>
                ) : null}
                {report.coreCrypto ? (
                  <div className='space-y-1'>
                    <p className='text-[10px] font-semibold uppercase tracking-widest text-sky-600'>{d("加密")}</p>
                    <p className='text-sm text-muted-foreground leading-relaxed'>{report.coreCrypto}</p>
                  </div>
                ) : null}
                {report.coreActions && report.coreActions.length > 0 ? (
                  <div className='rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 space-y-1.5'>
                    <p className='text-[10px] font-semibold uppercase tracking-widest text-amber-600'>{d("操作建议")}</p>
                    <ul className='space-y-1.5'>
                      {report.coreActions.map((action, i) => (
                        <li key={i} className='flex items-start gap-2 text-sm text-muted-foreground leading-relaxed'>
                          <span className='mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/60' />
                          {action}
                        </li>
                      ))}
                    </ul>
                    {report.disclaimer ? (
                      <p className='text-[11px] text-muted-foreground/60 pt-1'>⚠️ {report.disclaimer}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* US Stocks */}
          {report.usStocks && report.usStocks.length > 0 ? (
            <div>
              <SectionLabel icon='📊' label={d("美股标的动态")} />
              <BulletList items={report.usStocks} dot='bg-violet-500/60' />
            </div>
          ) : null}

          {/* Crypto Assets */}
          {report.cryptoAssets && report.cryptoAssets.length > 0 ? (
            <div>
              <SectionLabel icon='🪙' label={d("加密标的动态")} />
              <BulletList items={report.cryptoAssets} dot='bg-sky-500/60' />
            </div>
          ) : null}

          {/* Geopolitics */}
          {report.geopolitics && report.geopolitics.length > 0 ? (
            <div>
              <SectionLabel icon='🌍' label={d("地缘政治专题")} />
              <div className='divide-y divide-border/40'>
                {report.geopolitics.map((geo, i) => (
                  <div key={i} className='px-5 py-4 space-y-2'>
                    <div>
                      <span className='inline-block rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-rose-600'>
                        {geo.title}
                      </span>
                      <p className='mt-1 text-xs font-medium text-muted-foreground'>{geo.subtitle}</p>
                    </div>
                    <p className='text-sm text-muted-foreground leading-relaxed'>{geo.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Must Read */}
          {report.mustRead && report.mustRead.length > 0 ? (
            <div>
              <SectionLabel icon='📰' label={d("推荐阅读")} />
              <div className='divide-y divide-border/30'>
                {report.mustRead.map((news, i) => (
                  <div key={i} className='px-5 py-3.5 space-y-1.5'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex items-center gap-2 flex-wrap'>
                        <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider ${NEWS_CATEGORY_STYLE[NEWS_CATEGORY_KEYS[news.category] ?? news.category] ?? 'border-border bg-muted/50 text-muted-foreground'}`}>
                          {news.category}
                        </span>
                        <span className='text-sm font-medium leading-snug'>{news.title}</span>
                      </div>
                      <span className='shrink-0 text-[10px] text-muted-foreground/60 mt-0.5'>{news.source}</span>
                    </div>
                    <p className='text-xs text-muted-foreground leading-relaxed'>{news.summary}</p>
                    {news.action ? (
                      <p className='text-xs text-foreground/70 leading-relaxed'>
                        <span className='text-amber-600 font-medium'>👉 </span>{news.action}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

        </div>
      ) : null}
    </div>
  );
}

function WeeklyResearchTab() {
  const { d, locale } = useDashboardI18n();
  const t = getTranslator(locale);
  return (
    <div className='space-y-6'>
      <div className='space-y-1'>
        <h2 className='text-xl font-semibold tracking-tight'>{d("Weekly Research")}</h2>
        <p className='text-xs text-muted-foreground'>{t('Historical reports follow the selected language; dates and original views are preserved.', '历史报告按所选语言显示，保留原发布日期和观点。', '過去のレポートを選択言語で表示し、公開日と当時の見解を保持します。')}</p>
        <p className='text-sm text-muted-foreground'> {d("加密货币、宏观经济与 AI 科技领域的研究更新，覆盖核心判断 · 美股 · 加密 · 地缘 · 推荐阅读。")} </p>
      </div>
      {WEEKLY_REPORTS.length === 0 ? (
        <p className='rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground'> {d("暂无周报内容。")} </p>
      ) : (
        <div className='space-y-3'>
          {WEEKLY_REPORTS.map((source, i) => {
            const localized = getLocalizedWeeklyReport(source, locale);
            return <WeeklyReportCard key={source.id} {...localized} defaultOpen={i === 0} />;
          })}
        </div>
      )}
    </div>
  );
}

// ── Tab pill ─────────────────────────────────────────────────────────────────

function TabPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {

  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function OscillatorClient({ data }: { data: OscillatorData }) {
  const { locale, d } = useDashboardI18n();
  const [activeTab, setActiveTab] = useState<MainTab>('focus');
  const [focusFilter, setFocusFilter] = useState<FocusFilterTab>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'veteran' | 'single-cycle'>('all');
  const [universeFilter, setUniverseFilter] = useState<UniverseFilterTab>('all');
  const [query, setQuery] = useState('');
  const [universePage, setUniversePage] = useState(1);

  const filteredFocus = data.results.filter((row) => {
    if (focusFilter !== 'all' && row.grade !== focusFilter) return false;
    if (categoryFilter !== 'all' && row.coin.category !== categoryFilter) return false;
    return true;
  });

  const filteredUniverse = data.universe.filter((row) => {
    if (universeFilter === 'research' && !row.researchFocus) return false;
    if (universeFilter === 'binance' && !row.binanceListed) return false;
    if (universeFilter === 'dual' && !row.dualTop300) return false;
    if (universeFilter === 'positive7d' && (row.change7d ?? -Infinity) <= 0) return false;
    if (query) {
      const normalized = query.trim().toLowerCase();
      const haystack = `${row.symbol} ${row.name}`.toLowerCase();
      if (!haystack.includes(normalized)) return false;
    }
    return true;
  });

  useEffect(() => {
    setUniversePage(1);
  }, [query, universeFilter]);

  const paginatedUniverse = paginateCollection(filteredUniverse, universePage, UNIVERSE_PAGE_SIZE);
  const totalTracked = data.universe.length;

  return (
    <section className='space-y-8 pb-8'>
      {/* Header */}
      <div className='space-y-4'>
        <div className='space-y-4'>
          <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.18em] text-muted-foreground shadow-sm backdrop-blur-md'>
            <span className='h-1.5 w-1.5 rounded-full bg-amber-500' /> {d("Market monitor")} </div>
          <h1 className='text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl'>{d("oscillator")}</h1>
          <p className='max-w-3xl text-[15px] leading-7 text-muted-foreground'> {d("An altcoin strength monitor built in two layers: a focused oscillator watchlist for your highest-conviction names, and a broader market table covering the CoinGecko / CoinMarketCap top 500 with Binance BTC-pair context.")} </p>
        </div>
        <UpdateNotice data={data} />
        <div className='flex flex-wrap gap-3 text-xs text-muted-foreground'>
          <span> {d("BTC Price:")} {d(data.btcPrice ? `$${data.btcPrice.toLocaleString(locale, { maximumFractionDigits: 2 })}` : 'N/A')}
          </span>
          <span>{d("Data mode:")} {d(data.mode === 'snapshot' ? 'Market Snapshot' : 'Live')}</span>
          <span> {d("Snapshot as of:")} {new Date(data.snapshotAsOf ?? data.generatedAt).toLocaleString(locale, { timeZone: 'UTC' })}
          </span>
        </div>
        {data.note ? <p className='text-xs text-muted-foreground'>{d(data.note)}</p> : null}
      </div>

      {/* Summary — always visible */}
      <SummaryGrid summary={data.summary} />

      {/* Tab switcher */}
      <div className='flex flex-wrap gap-2'>
        <TabPill active={activeTab === 'focus'} onClick={() => setActiveTab('focus')}> {d("Research Focus")} </TabPill>
        <TabPill active={activeTab === 'breadth'} onClick={() => setActiveTab('breadth')}> {d("Altcoin Breadth")} </TabPill>
        <TabPill active={activeTab === 'heat'} onClick={() => setActiveTab('heat')}> {d("BTC Market Heat")} </TabPill>
        <TabPill active={activeTab === 'weekly'} onClick={() => setActiveTab('weekly')}> {d("Weekly Research")} </TabPill>
      </div>

      {/* Tab: Research Focus */}
      {activeTab === 'focus' ? (
        <div className='space-y-6'>
          <div className='space-y-1'>
            <h2 className='text-xl font-semibold tracking-tight'>{d("Research Focus")}</h2>
            <p className='text-sm text-muted-foreground'> {d("The focus set keeps the oscillator logic front and center, so you can quickly separate structurally strong names from decaying or still-unproven ones.")} </p>
          </div>

          <div className='flex flex-wrap gap-2'>
            {(['all', 'S', 'A', 'B', 'F'] as FocusFilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFocusFilter(tab)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  focusFilter === tab
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-muted-foreground hover:border-foreground/30'
                }`}
              >
                {d(tab === 'all' ? 'All Grades' : `${tab} Grade`)}
              </button>
            ))}
            <div className='mx-1 w-px bg-border' />
            {(['all', 'veteran', 'single-cycle'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setCategoryFilter(tab)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  categoryFilter === tab
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-muted-foreground hover:border-foreground/30'
                }`}
              >
                {d(tab === 'all' ? 'All Types' : tab === 'veteran' ? 'Veteran' : 'Single-Cycle')}
              </button>
            ))}
          </div>

          <div className='space-y-3'>
            {filteredFocus.length === 0 ? (
              <p className='rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground'> {d("No focus names match the current filter.")} </p>
            ) : (
              filteredFocus.map((result) => <FocusCoinCard key={result.coin.symbol} result={result} />)
            )}
          </div>

          <FaqSection items={FOCUS_FAQ} />
        </div>
      ) : null}

      {/* Tab: Altcoin Breadth */}
      {activeTab === 'breadth' ? (
        <div className='space-y-4'>
          <div className='space-y-1'>
            <h2 className='text-xl font-semibold tracking-tight'>{d("Altcoin Breadth")}</h2>
            <p className='text-sm text-muted-foreground'> {d("The full-market observation layer. By default it tracks the top 500 alts after removing BTC and stablecoins, and you can switch into research, Binance BTC-pair, or dual-ranked views.")} </p>
          </div>

          <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
            <div className='flex flex-wrap gap-2'>
              {([
                ['all', 'All'],
                ['research', 'Research'],
                ['binance', 'Binance BTC'],
                ['dual', 'CG + CMC'],
                ['positive7d', '7D > 0'],
              ] as const).map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setUniverseFilter(tab)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    universeFilter === tab
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-muted-foreground hover:border-foreground/30'
                  }`}
                >
                  {d(label)}
                </button>
              ))}
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={d("Search token / symbol")}
              className='h-10 rounded-full border border-border bg-background px-4 text-sm outline-none transition focus:border-foreground/30'
            />
          </div>

          <p className='text-xs text-muted-foreground'>
            {d(filteredUniverse.length === 0
              ? `Showing 0 of ${totalTracked} tracked altcoins.`
              : `Showing ${paginatedUniverse.start}-${paginatedUniverse.end} of ${filteredUniverse.length} matched altcoins${
                  filteredUniverse.length === totalTracked ? '' : ` (${totalTracked} tracked)`
                }.`)}
          </p>

          <UniverseTable rows={paginatedUniverse.items} />

          {paginatedUniverse.totalPages > 1 ? (
            <div className='flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-xs text-muted-foreground'> {d("Page")} {paginatedUniverse.currentPage} {d("of")} {paginatedUniverse.totalPages} · {UNIVERSE_PAGE_SIZE} {d("rows per page")} </p>
              <div className='flex flex-wrap items-center gap-2'>
                <button
                  onClick={() => setUniversePage((page) => Math.max(1, page - 1))}
                  disabled={paginatedUniverse.currentPage === 1}
                  className='h-9 rounded-full border border-border bg-background px-4 text-xs text-foreground transition hover:border-foreground/30 disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:border-border'
                > {d("Previous")} </button>
                {Array.from({ length: paginatedUniverse.totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setUniversePage(page)}
                    className={`size-9 rounded-full border text-xs transition-colors ${
                      page === paginatedUniverse.currentPage
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-background text-muted-foreground hover:border-foreground/30'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setUniversePage((page) => Math.min(paginatedUniverse.totalPages, page + 1))
                  }
                  disabled={paginatedUniverse.currentPage === paginatedUniverse.totalPages}
                  className='h-9 rounded-full border border-border bg-background px-4 text-xs text-foreground transition hover:border-foreground/30 disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:border-border'
                > {d("Next")} </button>
              </div>
            </div>
          ) : null}

          <FaqSection items={BREADTH_FAQ} />
        </div>
      ) : null}

      {/* Tab: BTC Market Heat */}
      {activeTab === 'heat' ? <BtcHeatTab /> : null}

      {/* Tab: Weekly Research */}
      {activeTab === 'weekly' ? <WeeklyResearchTab /> : null}

      {/* Footer */}
      <div className='border-t pt-4 text-xs text-muted-foreground space-y-1'>
        <p>{d("Data Sources: synchronized local snapshot from CoinGecko and CoinMarketCap rankings, Binance spot BTC pairs and BTC pricing. USD-derived ALT/BTC divides the current asset USD price by BTC USD price. BTC Market Heat uses the Day1Global API when available.")}</p>
        <p>{d("Historical anchors use available closed daily candles in a window of up to five years, not intraday lows. Recently listed assets may have shorter histories. The 2Y close peak requires a complete two-year window; missing history is left unavailable. Prior-cycle reference peaks come from the configured research anchors.")}</p>
        {data.freshness ? <p>{d("Source timestamps (UTC):")} {Object.entries(data.freshness.sourceAsOf).map(([source, timestamp]) => `${source}: ${new Date(timestamp).toLocaleString(locale, { timeZone: 'UTC' })}`).join(' · ')}</p> : null}
        <p>{d("DYOR — This page is built for market observation and research workflow support, not investment advice.")}</p>
      </div>
    </section>
  );
}
