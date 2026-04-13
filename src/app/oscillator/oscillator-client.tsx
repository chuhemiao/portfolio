'use client';

import { useState } from 'react';
import type {
  Grade,
  MarketBreadthRow,
  OscillatorData,
  OscillatorResult,
  OscillatorSummary,
} from '@/lib/oscillator-data';

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

function formatRatio(value: number | null): string {
  if (value === null) return 'N/A';
  if (value < 0.0001) return value.toExponential(4);
  return value.toFixed(6);
}

function formatPct(value: number | null): string {
  if (value === null) return 'N/A';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function formatUsd(value: number | null): string {
  if (value === null) return 'N/A';
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function formatVolumeRatio(value: number | null): string {
  if (value === null) return 'N/A';
  return `${(value * 100).toFixed(1)}%`;
}

function formatSnapshotTimestamp(value: string | null): string {
  if (!value) return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatSnapshotAge(value: string | null): string {
  if (!value) return 'Snapshot time unavailable';

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return 'Snapshot time unavailable';

  const diffMs = Date.now() - timestamp;
  if (diffMs < 0) return 'Snapshot scheduled';

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Updated today';
  if (diffDays === 1) return 'Updated 1 day ago';
  if (diffDays < 7) return `Updated ${diffDays} days ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return 'Updated 1 week ago';
  return `Updated ${diffWeeks} weeks ago`;
}

function UpdateNotice({ data }: { data: OscillatorData }) {
  const snapshotTime = data.snapshotAsOf ?? data.generatedAt;

  return (
    <div className='rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm shadow-sm shadow-amber-500/5'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1'>
          <p className='font-semibold text-foreground'>Weekly Snapshot</p>
          <p className='text-muted-foreground'>
            Updates every week. Short-term market moves after the snapshot may not be reflected yet.
          </p>
        </div>
        <div className='shrink-0 rounded-xl border border-amber-500/20 bg-background/70 px-3 py-2 text-xs text-muted-foreground'>
          <p className='font-medium text-foreground'>{formatSnapshotAge(snapshotTime)}</p>
          <p>Snapshot as of {formatSnapshotTimestamp(snapshotTime)}</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className='rounded-2xl border border-border/70 bg-background/75 p-4 shadow-sm'>
      <p className='text-[11px] uppercase tracking-[0.16em] text-muted-foreground'>{label}</p>
      <p className='mt-2 text-2xl font-semibold tracking-tight'>{value}</p>
      <p className='mt-2 text-xs text-muted-foreground'>{hint}</p>
    </div>
  );
}

function SummaryGrid({ summary }: { summary: OscillatorSummary }) {
  return (
    <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
      <StatCard
        label='Tracked Alts'
        value={summary.trackedAltcoins.toString()}
        hint='The top-300 altcoin universe after removing BTC and stablecoins from the CoinGecko + CoinMarketCap ranking set.'
      />
      <StatCard
        label='Research Focus'
        value={summary.researchFocusCount.toString()}
        hint='Tokens tied directly to your current research pipeline and promoted into the focus set.'
      />
      <StatCard
        label='Binance BTC Pairs'
        value={summary.binanceBtcPairs.toString()}
        hint='Assets with a live Binance spot BTC pair, giving us a cleaner ALT/BTC market price.'
      />
      <StatCard
        label='Dual Ranked'
        value={summary.dualRankedCount.toString()}
        hint='Names that appear in both the CoinGecko and CoinMarketCap top-300 ranking sets.'
      />
      <StatCard
        label='7D Breadth'
        value={summary.positive7dBreadth !== null ? `${summary.positive7dBreadth.toFixed(1)}%` : 'N/A'}
        hint={`${summary.positive7dCount} names are positive over 7 days, which helps gauge short-term alt breadth.`}
      />
      <StatCard
        label='30D Breadth'
        value={summary.positive30dBreadth !== null ? `${summary.positive30dBreadth.toFixed(1)}%` : 'N/A'}
        hint={`${summary.positive30dCount} names are positive over 30 days, which helps gauge medium-term breadth expansion.`}
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
  return (
    <div className='flex flex-wrap items-center gap-1.5'>
      {coingeckoRank ? (
        <span className='rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700'>
          CG #{coingeckoRank}
        </span>
      ) : null}
      {coinmarketcapRank ? (
        <span className='rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-700'>
          CMC #{coinmarketcapRank}
        </span>
      ) : null}
    </div>
  );
}

function FocusCoinCard({ result }: { result: OscillatorResult }) {
  const style = GRADE_STYLES[result.grade];
  const actionStyle = ACTION_STYLES[result.action] ?? '';

  return (
    <div className='rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm shadow-black/5 space-y-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='space-y-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-base font-semibold tracking-tight'>{result.coin.symbol}</span>
            <span className='text-sm text-muted-foreground'>{result.coin.name}</span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] ${
                result.coin.category === 'veteran'
                  ? 'border-violet-500/20 bg-violet-500/10 text-violet-700'
                  : 'border-cyan-500/20 bg-cyan-500/10 text-cyan-700'
              }`}
            >
              {result.coin.category === 'veteran' ? 'Veteran' : 'Single-Cycle'}
            </span>
            {result.researchFocus ? (
              <span className='rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-700'>
                Research
              </span>
            ) : null}
            {result.binanceSymbol ? (
              <span className='rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2 py-0.5 text-[10px] text-zinc-700'>
                {result.binanceSymbol}
              </span>
            ) : null}
          </div>
          <RankBadges coingeckoRank={result.coingeckoRank} coinmarketcapRank={result.coinmarketcapRank} />
          {result.researchType ? (
            <p className='text-xs text-muted-foreground'>{result.researchType}</p>
          ) : null}
        </div>

        <div className='flex items-center gap-2'>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${style.bg} ${style.text} ${style.border}`}>
            {result.grade}
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] ${actionStyle}`}>
            {result.action}
          </span>
        </div>
      </div>

      <div className='grid gap-2 sm:grid-cols-3 xl:grid-cols-6'>
        <MetricCard label='Current ALT/BTC' value={formatRatio(result.currentRatio)} accent={result.currentRatioSource} />
        <MetricCard label='24H' value={formatPct(result.change24h)} tone={result.change24h} />
        <MetricCard label='7D' value={formatPct(result.change7d)} tone={result.change7d} />
        <MetricCard label='30D' value={formatPct(result.change30d)} tone={result.change30d} />
        <MetricCard label='Best Rank' value={result.bestRank ? `#${result.bestRank}` : 'N/A'} />
        <MetricCard label='Vol / MCap' value={formatVolumeRatio(result.volume24h && result.marketCap ? result.volume24h / result.marketCap : null)} />
      </div>

      <div className='grid gap-2 sm:grid-cols-2 xl:grid-cols-5'>
        <MetricCard label='Cycle Peak' value={formatRatio(result.currentCyclePeak)} />
        <MetricCard label='VS Last Top' value={result.coin.category === 'veteran' ? formatPct(result.cycleChange) : '—'} tone={result.cycleChange} />
        <MetricCard label='Above 5Y Low' value={formatPct(result.aboveFiveYearLow)} tone={result.aboveFiveYearLow} />
        <MetricCard label='Market Cap' value={formatUsd(result.marketCap)} />
        <MetricCard label='24H Volume' value={formatUsd(result.volume24h)} />
      </div>

      <p className='text-xs leading-relaxed text-muted-foreground'>{result.observation}</p>
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
      <p className='text-[10px] uppercase tracking-[0.14em] text-muted-foreground'>{label}</p>
      <p className={`mt-1 text-sm font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function UniverseTable({ rows }: { rows: MarketBreadthRow[] }) {
  return (
    <div className='overflow-hidden rounded-2xl border border-border/70 bg-background/80 shadow-sm shadow-black/5'>
      <div className='overflow-x-auto'>
        <table className='min-w-[980px] w-full text-sm'>
          <thead className='bg-muted/35 text-left text-[11px] uppercase tracking-[0.16em] text-muted-foreground'>
            <tr>
              <th className='px-4 py-3 font-medium'>Rank</th>
              <th className='px-4 py-3 font-medium'>Asset</th>
              <th className='px-4 py-3 font-medium'>24H</th>
              <th className='px-4 py-3 font-medium'>7D</th>
              <th className='px-4 py-3 font-medium'>30D</th>
              <th className='px-4 py-3 font-medium'>ALT/BTC</th>
              <th className='px-4 py-3 font-medium'>Vol / MCap</th>
              <th className='px-4 py-3 font-medium'>Binance</th>
              <th className='px-4 py-3 font-medium'>Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.symbol} className='border-t border-border/60 align-top'>
                <td className='px-4 py-3 text-xs text-muted-foreground'>
                  <div className='space-y-1'>
                    <p>{row.bestRank ? `#${row.bestRank}` : 'N/A'}</p>
                    <RankBadges coingeckoRank={row.coingeckoRank} coinmarketcapRank={row.coinmarketcapRank} />
                  </div>
                </td>
                <td className='px-4 py-3'>
                  <div className='space-y-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='font-semibold'>{row.symbol}</span>
                      <span className='text-muted-foreground'>{row.name}</span>
                    </div>
                    <div className='flex flex-wrap gap-1.5'>
                      {row.researchFocus ? (
                        <span className='rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-700'>
                          Research
                        </span>
                      ) : null}
                      {row.dualTop300 ? (
                        <span className='rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-700'>
                          Dual
                        </span>
                      ) : null}
                      <span className='rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2 py-0.5 text-[10px] text-zinc-700'>
                        {row.currentRatioSource}
                      </span>
                      {row.researchType ? (
                        <span className='rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground'>
                          {row.researchType}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className={`px-4 py-3 font-medium ${toneClass(row.change24h)}`}>{formatPct(row.change24h)}</td>
                <td className={`px-4 py-3 font-medium ${toneClass(row.change7d)}`}>{formatPct(row.change7d)}</td>
                <td className={`px-4 py-3 font-medium ${toneClass(row.change30d)}`}>{formatPct(row.change30d)}</td>
                <td className='px-4 py-3 font-medium'>{formatRatio(row.currentRatio)}</td>
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
                    <span className='text-muted-foreground'>N/A</span>
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

function toneClass(value: number | null): string {
  if (value === null) return '';
  if (value > 0) return 'text-emerald-600';
  if (value < 0) return 'text-rose-600';
  return '';
}

export default function OscillatorClient({ data }: { data: OscillatorData }) {
  const [focusFilter, setFocusFilter] = useState<FocusFilterTab>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'veteran' | 'single-cycle'>('all');
  const [universeFilter, setUniverseFilter] = useState<UniverseFilterTab>('all');
  const [query, setQuery] = useState('');

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

  return (
    <section className='space-y-10 pb-8'>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>oscillator</h1>
          <p className='max-w-3xl text-sm leading-6 text-muted-foreground sm:text-[15px]'>
            An altcoin strength monitor built in two layers: a focused oscillator watchlist for your highest-conviction names,
            and a broader market table covering the CoinGecko / CoinMarketCap top 300 with Binance BTC-pair context.
          </p>
        </div>
        <UpdateNotice data={data} />
        <div className='flex flex-wrap gap-3 text-xs text-muted-foreground'>
          <span>
            BTC Price: {data.btcPrice ? `$${data.btcPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : 'N/A'}
          </span>
          <span>Data mode: {data.mode === 'snapshot' ? 'Weekly snapshot' : 'Live'}</span>
          <span>
            Snapshot as of: {new Date(data.snapshotAsOf ?? data.generatedAt).toLocaleString('en-US')}
          </span>
        </div>
        {data.note ? <p className='text-xs text-muted-foreground'>{data.note}</p> : null}
      </div>

      <SummaryGrid summary={data.summary} />

      <div className='rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm shadow-black/5 space-y-3'>
        <h2 className='text-sm font-semibold tracking-tight'>How To Read This Page</h2>
        <div className='grid gap-3 text-xs text-muted-foreground sm:grid-cols-2 xl:grid-cols-4'>
          <div className='space-y-1'>
            <p className='font-medium text-foreground'>Focus Cards</p>
            <p>Only the focus set runs through the full ALT/BTC cycle framework, which keeps the page opinionated without overloading historical data calls for all 300 names.</p>
          </div>
          <div className='space-y-1'>
            <p className='font-medium text-foreground'>Breadth Table</p>
            <p>The breadth table covers the top 300 alts and highlights ranking, price performance, ALT/BTC, liquidity efficiency, and Binance tradability.</p>
          </div>
          <div className='space-y-1'>
            <p className='font-medium text-foreground'>Source Priority</p>
            <p>Each weekly refresh prefers Binance spot BTC pairs first. When no usable BTC pair exists or Binance times out, the snapshot falls back to CoinGecko BTC pricing.</p>
          </div>
          <div className='space-y-1'>
            <p className='font-medium text-foreground'>Research Tag</p>
            <p>Names that sit inside your current research pipeline are tagged as `Research`, so content work and market monitoring stay connected.</p>
          </div>
        </div>
      </div>

      <section className='space-y-4'>
        <div className='space-y-1'>
          <h2 className='text-xl font-semibold tracking-tight'>Research Focus</h2>
          <p className='text-sm text-muted-foreground'>
            The focus set keeps the oscillator logic front and center, so you can quickly separate structurally strong names from decaying or still-unproven ones.
          </p>
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
              {tab === 'all' ? 'All Grades' : `${tab} Grade`}
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
              {tab === 'all' ? 'All Types' : tab === 'veteran' ? 'Veteran' : 'Single-Cycle'}
            </button>
          ))}
        </div>

        <div className='space-y-3'>
          {filteredFocus.length === 0 ? (
            <p className='rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground'>
              No focus names match the current filter.
            </p>
          ) : (
            filteredFocus.map((result) => <FocusCoinCard key={result.coin.symbol} result={result} />)
          )}
        </div>
      </section>

      <section className='space-y-4'>
        <div className='space-y-1'>
          <h2 className='text-xl font-semibold tracking-tight'>Altcoin Breadth</h2>
          <p className='text-sm text-muted-foreground'>
            The full-market observation layer. By default it tracks the top 300 alts after removing BTC and stablecoins, and you can switch into research, Binance BTC-pair, or dual-ranked views.
          </p>
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
                {label}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Search token / symbol'
            className='h-10 rounded-full border border-border bg-background px-4 text-sm outline-none transition focus:border-foreground/30'
          />
        </div>

        <p className='text-xs text-muted-foreground'>
          Showing {filteredUniverse.length} / {data.universe.length} altcoins.
        </p>

        <UniverseTable rows={filteredUniverse} />
      </section>

      <div className='border-t pt-4 text-xs text-muted-foreground space-y-1'>
        <p>Data Sources: weekly local snapshot generated from Surf market ranking, Surf BTC pricing, Surf BTC history for focus names, CoinGecko BTC ratios, CoinMarketCap ranking cross-check, and Binance spot BTC pairs when available.</p>
        <p>DYOR — This page is built for market observation and research workflow support, not investment advice.</p>
      </div>
    </section>
  );
}
