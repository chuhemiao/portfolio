'use client';

import type { Locale } from '@/lib/i18n';
import { useDashboardI18n } from '../fear/use-dashboard-i18n';

import type {
  WatchData,
  ListingCoin,
  ExchangeListing,
  SignalRating,
  ListingSequence,
} from '@/lib/watch-data';
import { useEffect, useState } from 'react';
import { loadWatchUpdate } from '@/lib/watch-client-data';
import { RadioIcon, ZapIcon, SearchIcon, TrendingUpIcon } from 'lucide-react';

// ─── Config ───────────────────────────────────────────────────────────────────

const SIGNAL_CFG: Record<SignalRating, { className: string; desc: string }> = {
  S: { className: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40', desc: 'Binance+Coinbase+Upbit or 4+ spot exchanges' },
  A: { className: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40', desc: 'Binance spot / Coinbase / Upbit confirmed' },
  B: { className: 'bg-violet-500/20 text-violet-600 dark:text-violet-400 border-violet-500/40', desc: '2-3 spot exchanges or Binance futures' },
  C: { className: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40', desc: '1 spot or any derivatives' },
  D: { className: 'bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/30', desc: 'Not on any tracked exchange' },
  R: { className: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40', desc: 'Risk / Delisting event' },
};

const SEQ_LABEL: Record<ListingSequence, string> = {
  spot_only: 'Spot only',
  perp_only: 'Perp only ⚠',
  spot_to_perp: 'Spot→Perp',
  perp_to_spot: 'Perp→Spot',
  full_stack: 'Spot+Perp',
  unknown: '—',
};

const SEQ_COLOR: Record<ListingSequence, string> = {
  spot_only: 'text-emerald-500',
  perp_only: 'text-red-500',
  spot_to_perp: 'text-blue-500',
  perp_to_spot: 'text-amber-500',
  full_stack: 'text-emerald-400',
  unknown: 'text-muted-foreground',
};

const EXCHANGES = [
  { key: 'binance' as const, label: 'Binance', short: 'BNB', note: 'Spot presence + Futures onboardDate' },
  { key: 'okx' as const, label: 'OKX', short: 'OKX', note: 'Spot & Swap listTime' },
  { key: 'bybit' as const, label: 'Bybit', short: 'BBT', note: 'Linear Perp launchTime' },
  { key: 'bitget' as const, label: 'Bitget', short: 'BGT', note: 'Spot presence; listing date unavailable' },
  { key: 'coinbase' as const, label: 'Coinbase', short: 'CB', note: 'Spot new_at' },
  { key: 'upbit' as const, label: 'Upbit', short: 'UPB', note: 'Spot presence' },
  { key: 'hyperliquid' as const, label: 'Hyperliquid', short: 'HL', note: 'Perp presence' },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(v: number | null, locale: Locale) {
  if (v == null || v === 0) return '—';
  if (v >= 1) return `$${v.toLocaleString(locale, { maximumFractionDigits: 4 })}`;
  if (v >= 0.001) return `$${v.toFixed(6)}`;
  return `$${v.toPrecision(3)}`;
}

function fmtVol(v: number | null) {
  if (v == null) return '—';
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function fmtMcap(v: number | null) {
  if (v == null) return '—';
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function fmtRatio(mc: number | null, fdv: number | null) {
  if (!mc || !fdv || fdv === 0) return '—';
  return `${((mc / fdv) * 100).toFixed(0)}%`;
}

function fmtDate(ts: number | null, locale: Locale) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString(locale, { timeZone: 'UTC', month: 'short', day: 'numeric' });
}

function fmtDateFull(ts: number | null, locale: Locale) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SignalBadge({ rating }: { rating: SignalRating }) {
  const { d } = useDashboardI18n();
  const cfg = SIGNAL_CFG[rating];
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded border text-xs font-bold leading-none ${cfg.className}`}
      title={d(cfg.desc)}>
      {rating}
    </span>
  );
}

function PriceChange({ value }: { value: number | null }) {
  const { d } = useDashboardI18n();
  if (value == null) return <span className='text-muted-foreground text-xs'>—</span>;
  const up = value >= 0;
  return (
    <span className={`text-xs font-medium tabular-nums ${up ? 'text-emerald-500' : 'text-red-500'}`}>
      {d(up ? '+' : '')}{value.toFixed(2)}%
    </span>
  );
}

function ExchangeCell({ status }: { status: ExchangeListing }) {
  const { d } = useDashboardI18n();
  if (!status.spot && !status.perp) {
    return <span className='text-subtle text-xs select-none'>—</span>;
  }
  return (
    <div className='flex flex-col gap-0.5 items-center'>
      {status.spot && (
        <span className='text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 leading-none border border-emerald-500/20'> {d("SPOT")} </span>
      )}
      {status.perp && (
        <span className='text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-600 dark:text-violet-400 leading-none border border-violet-500/20'> {d("PERP")} </span>
      )}
    </div>
  );
}

// ─── Filter ───────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'buy_signal' | 'alpha' | 'spot' | 'perp_only' | 'full_stack' | 'notable';

function filterCoins(coins: ListingCoin[], tab: FilterTab): ListingCoin[] {
  switch (tab) {
    case 'buy_signal': return coins.filter(c => c.buySignal);
    case 'alpha': return coins.filter(c => c.binanceAlpha);
    case 'spot': return coins.filter(c => c.spotExchanges.length > 0);
    case 'perp_only': return coins.filter(c => c.perpWithoutSpot);
    case 'full_stack': return coins.filter(c => c.listingSequence === 'full_stack');
    case 'notable': return coins.filter(c => c.noteworthy.length > 0);
    default: return coins;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function WatchClient({ data: initialData }: { data: WatchData }) {
  const { locale, d } = useDashboardI18n();
  const [remoteData, setRemoteData] = useState<WatchData | null>(null);
  const data = remoteData && Date.parse(remoteData.generatedAt) >= Date.parse(initialData.generatedAt) ? remoteData : initialData;
  const { fearGreed, global: g, listings, generatedAt, lookbackDays, errors } = data;
  const [tab, setTab] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'signal' | 'date' | 'mcap'>('signal');
  const [search, setSearch] = useState('');

  const spotCount = listings.filter(c => c.spotExchanges.length > 0).length;
  const perpOnlyCount = listings.filter(c => c.perpWithoutSpot).length;
  const fullStackCount = listings.filter(c => c.listingSequence === 'full_stack').length;
  const notableCount = listings.filter(c => c.noteworthy.length > 0).length;
  const buySignalCount = listings.filter(c => c.buySignal).length;
  const alphaCount = listings.filter(c => c.binanceAlpha).length;
  const snapshotTime = Date.parse(generatedAt);
  const recentListingCount = listings.filter(c => c.firstSeenAt !== null && c.firstSeenAt >= snapshotTime - lookbackDays * 86400000 && c.firstSeenAt <= snapshotTime).length;
  const failedSourceCount = data.sources?.failed.length ?? 0;

  const TABS: { id: FilterTab; label: string; count: number; highlight?: string }[] = [
    { id: 'all', label: 'All', count: listings.length },
    { id: 'buy_signal', label: '买入信号', count: buySignalCount, highlight: 'emerald' },
    { id: 'alpha', label: 'Alpha', count: alphaCount, highlight: 'violet' },
    { id: 'spot', label: 'Has Spot', count: spotCount },
    { id: 'full_stack', label: 'Spot+Perp', count: fullStackCount },
    { id: 'perp_only', label: 'Perp Only ⚠', count: perpOnlyCount },
    { id: 'notable', label: 'Signals', count: notableCount },
  ];

  let filtered = filterCoins(listings, tab);
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(c => c.symbol.toLowerCase().includes(q));
  }
  if (sortBy === 'date') filtered = [...filtered].sort((a, b) => (b.firstSeenAt ?? 0) - (a.firstSeenAt ?? 0));
  else if (sortBy === 'mcap') filtered = [...filtered].sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0));

  const fearColor = fearGreed
    ? fearGreed.value < 25 ? '#ef4444' : fearGreed.value < 45 ? '#f97316' : fearGreed.value < 55 ? '#eab308' : fearGreed.value < 75 ? '#22c55e' : '#10b981'
    : '#eab308';

  useEffect(() => {
    const controller = new AbortController();

    loadWatchUpdate(initialData, controller.signal)
      .then((json) => {
        if (!controller.signal.aborted && json) setRemoteData(json);
      });

    return () => {
      controller.abort();
    };
  }, [initialData]);

  return (
    <div className='relative left-1/2 min-h-[100dvh] w-screen -translate-x-1/2 overflow-x-clip'>

      <main className='relative mx-auto w-full max-w-6xl px-4 pb-dock-safe pt-6 space-y-8 sm:px-6 sm:pb-dock-safe-lg sm:pt-10 lg:px-8'>

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <div className='space-y-4'>
          <div className='inline-flex items-center gap-2 rounded-sm border border-border bg-surface px-3.5 py-1.5 text-[11px] font-medium tracking-[0.16em] text-muted-foreground'>
            <RadioIcon className='size-3' /> {d("Listing Intelligence")} </div>
          <div className='space-y-2'>
            <h1 className='text-3xl font-semibold tracking-[-0.06em] text-foreground sm:text-4xl lg:text-5xl'> {d("Exchange Listing Watch")} </h1>
            <p className='max-w-2xl text-[15px] leading-7 text-muted-foreground'> {d("Coins listed on Binance, OKX, Bybit, Bitget, Coinbase, Upbit or Hyperliquid in the past")}{' '}
              <strong className='text-foreground'>{lookbackDays} {d("days")}</strong>{d(". Data from exchange native APIs.")} </p>
            <p className='max-w-2xl text-xs leading-6 text-muted-foreground'>{d("Also includes the current Binance Alpha inventory. Unknown listing dates are shown as unknown, not as new listings.")}</p>
          </div>
          <p className='text-[11px] text-subtle'> {d("Updated:")} {new Date(generatedAt).toLocaleString(locale, { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' })} {d("UTC")} </p>
          {errors.length > 0 && (
            <div className='rounded-xl border border-amber-500/40 bg-amber-500/20 px-4 py-2.5 text-[12px] leading-5 text-amber-600 dark:text-amber-400'>
              <p>{d("Coverage notes: figures may be incomplete.")}</p>
              {failedSourceCount > 0 ? <p>{failedSourceCount} {d(failedSourceCount === 1 ? 'source' : 'sources')} {d("failed to respond this update. Figures below may be incomplete.")}</p> : null}
              {errors.some(error => error.startsWith('Bitget listing dates:')) ? <p>{d("Bitget does not provide verified listing dates in this inventory; presence is tracked without assigning new listing dates.")}</p> : null}
              {errors.some(error => error.startsWith('Coinbase inventory:')) ? <p>{d("Coinbase coverage is limited to the first 500 public products.")}</p> : null}
            </div>
          )}
        </div>

        {/* ── Market Pulse ─────────────────────────────────────────── */}
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
          {/* Fear & Greed */}
          {fearGreed && (
            <div className='col-span-2 sm:col-span-1 rounded border border-border bg-surface p-4'>
              <p className='text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground'>{d("Fear & Greed")}</p>
              <div className='mt-3 flex items-center gap-3'>
                <div className='relative size-12 flex-shrink-0'>
                  <svg viewBox='0 0 44 44' className='size-full -rotate-90'>
                    <circle cx='22' cy='22' r='18' fill='none' stroke='currentColor' strokeWidth='4' className='text-muted/30' />
                    <circle cx='22' cy='22' r='18' fill='none' stroke={fearColor} strokeWidth='4' strokeDasharray={`${(fearGreed.value / 100) * 113} 113`} strokeLinecap='round' />
                  </svg>
                  <span className='absolute inset-0 flex items-center justify-center text-xs font-bold'>{fearGreed.value}</span>
                </div>
                <div>
                  <p className='text-sm font-semibold' style={{ color: fearColor }}>{d(fearGreed.label)}</p>
                  <p className='text-[10px] text-muted-foreground'>{d("Index")}</p>
                </div>
              </div>
            </div>
          )}
          {/* Total MCap */}
          <div className='rounded border border-border bg-surface p-4'>
            <p className='text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground'>{d("Total MCap")}</p>
            <p className='mt-2 text-xl font-semibold tracking-tight text-foreground'>
              {d(g?.totalMarketCapUsd ? `$${(g.totalMarketCapUsd / 1e12).toFixed(2)}T` : '—')}
            </p>
            <PriceChange value={g?.marketCapChange24h ?? null} />
          </div>
          {/* BTC Dom */}
          <div className='rounded border border-border bg-surface p-4'>
            <p className='text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground'>{d("BTC Dom")}</p>
            <p className='mt-2 text-xl font-semibold tracking-tight text-foreground'>
              {d(g?.btcDominance ? `${g.btcDominance.toFixed(1)}%` : '—')}
            </p>
            <p className='text-xs text-muted-foreground'>{d("ETH")} {d(g?.ethDominance ? `${g.ethDominance.toFixed(1)}%` : '—')}</p>
          </div>
          {/* New Listings */}
          <div className='rounded border border-border bg-surface p-4'>
            <p className='text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground'>{d("New Listings")}</p>
            <p className='mt-2 text-xl font-semibold tracking-tight text-emerald-500'>{recentListingCount}</p>
            <p className='text-xs text-muted-foreground'>{lookbackDays}{d("d window")}</p>
          </div>
          {/* Perp Only */}
          <div className='rounded border border-border bg-surface p-4'>
            <p className='text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground'>{d("Perp Only ⚠")}</p>
            <p className='mt-2 text-xl font-semibold tracking-tight text-red-500'>{perpOnlyCount}</p>
            <p className='text-xs text-muted-foreground'>{d("no spot anywhere")}</p>
          </div>
        </div>

        {/* ── Signal Legend ─────────────────────────────────────────── */}
        <div className='rounded border border-border bg-surface px-5 py-4'>
          <p className='mb-3 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground'>{d("Signal Rating Guide")}</p>
          <div className='flex flex-wrap gap-3'>
            {(Object.keys(SIGNAL_CFG) as SignalRating[]).map(r => (
              <div key={r} className='flex items-center gap-2'>
                <SignalBadge rating={r} />
                <span className='text-[11px] text-muted-foreground hidden sm:block'>{SIGNAL_CFG[r].desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────────────── */}
        <div className='space-y-3'>
          {/* Controls */}
          <div className='flex flex-wrap items-center gap-2 justify-between'>
            <div className='flex flex-wrap gap-1.5'>
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    tab === t.id
                      ? t.highlight === 'emerald'
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : t.highlight === 'violet'
                          ? 'border-violet-500 bg-violet-500 text-white'
                          : 'border-foreground bg-foreground text-background'
                      : t.highlight === 'emerald'
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500/60'
                        : t.highlight === 'violet'
                          ? 'border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:border-violet-500/60'
                          : 'border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground'
                  }`}>
                  {t.id === 'buy_signal' && <TrendingUpIcon className='inline size-3 mr-1' />}
                  {d(t.label)}
                  <span className={`ml-1.5 text-[10px] ${tab === t.id ? 'opacity-70' : 'opacity-50'}`}>{t.count}</span>
                </button>
              ))}
            </div>
            <div className='flex items-center gap-2'>
              {/* Search */}
              <div className='relative'>
                <SearchIcon className='absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-subtle' />
                <input
                  type='text'
                  placeholder={d("Symbol…")}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className='pl-7 pr-3 py-1.5 rounded-sm border border-border bg-surface text-xs text-foreground placeholder:text-subtle outline-none focus:border-border-strong w-24 focus:w-32 transition-all'
                />
              </div>
              {/* Sort */}
              {(['signal', 'date', 'mcap'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    sortBy === s
                      ? 'border-border-strong bg-muted text-foreground'
                      : 'border-border bg-surface text-muted-foreground hover:text-foreground'
                  }`}>
                  {d(s === 'signal' ? 'Signal' : s === 'date' ? 'Newest' : 'MCap')}
                </button>
              ))}
            </div>
          </div>

          <div className='overflow-hidden rounded border border-border bg-surface'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm min-w-[1100px]'>
                <thead>
                  <tr className='border-b border-border bg-muted/20'>
                    <th className='text-left px-4 py-3 font-medium text-muted-foreground text-xs w-[130px]'>{d("Asset")}</th>
                    <th className='text-right px-3 py-3 font-medium text-muted-foreground text-xs'>{d("MCap")}</th>
                    <th className='text-right px-3 py-3 font-medium text-muted-foreground text-xs'>{d("FDV")}</th>
                    <th className='text-right px-3 py-3 font-medium text-muted-foreground text-xs' title={d("Circulating / FDV ratio")}>{d("MC/FDV")}</th>
                    {EXCHANGES.map(e => (
                      <th key={e.key} className='text-center px-2 py-3 font-medium text-muted-foreground text-[11px] min-w-[52px]' title={d(e.note)}>
                        {e.short}
                      </th>
                    ))}
                    <th className='text-left px-3 py-3 font-medium text-muted-foreground text-xs'>{d("Type")}</th>
                    <th className='text-center px-3 py-3 font-medium text-muted-foreground text-xs'>{d("Sig")}</th>
                    <th className='text-left px-3 py-3 font-medium text-muted-foreground text-xs'>{d("First seen")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(coin => (
                    <CoinRow
                      key={coin.symbol}
                      coin={coin}
                      expanded={expandedId === coin.symbol}
                      onToggle={() => setExpandedId(expandedId === coin.symbol ? null : coin.symbol)}
                    />
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={14} className='px-4 py-10 text-center text-muted-foreground text-sm'> {d("No listings in this filter.")} </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className='text-[11px] text-subtle'>
            {filtered.length} {d("of")} {listings.length} {d("coins · Click any row to see full exchange matrix")} </p>
        </div>

        {/* ── Pattern Cards ──────────────────────────────────────────── */}
        {listings.length > 0 && <PatternSummary listings={listings} />}

        {/* ── Data Sources ───────────────────────────────────────────── */}
        <div className='rounded border border-border bg-surface p-5 text-[11px] text-subtle leading-relaxed'>
          <strong className='text-muted-foreground'>{d("Data sources:")}</strong>{' '} {d("OKX")} <code>/api/v5/public/instruments</code> {d("(listTime) · Bybit")} <code>/v5/market/instruments-info?category=linear</code> {d("(launchTime) · Bitget")} <code>/api/v2/spot/public/symbols</code> {d("(presence only) · Coinbase")} <code>/api/v3/brokerage/market/products</code> {d("(new_at) · Binance")} <code>/fapi/v1/exchangeInfo</code> {d("(onboardDate) · Binance Spot / Upbit / Hyperliquid: presence-only. Prices from Binance 24hr mini-ticker. Fear & Greed from alternative.me. Global from CoinGecko.")} </div>
      </main>
    </div>
  );
}

// ─── Coin Row ─────────────────────────────────────────────────────────────────

function CoinRow({ coin, expanded, onToggle }: { coin: ListingCoin; expanded: boolean; onToggle: () => void }) {
  const { locale, d } = useDashboardI18n();
  const hasNote = coin.noteworthy.length > 0;
  return (
    <>
      <tr
        className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer ${
          coin.perpWithoutSpot ? 'bg-red-500/5' : hasNote ? 'bg-amber-500/5' : ''
        }`}
        onClick={onToggle}>
        <td className='px-4 py-2.5'>
          <div className='flex items-center gap-1.5 flex-wrap'>
            <span className='font-semibold text-sm'>{coin.symbol}</span>
            {coin.buySignal && (
              <span className='inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 leading-none'>
                <TrendingUpIcon className='size-2.5' />{d("BUY")} </span>
            )}
            {coin.binanceAlpha && (
              <span className='text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30 leading-none'>
                α
              </span>
            )}
            {coin.perpWithoutSpot && <span className='text-[10px] text-red-500'>⚠</span>}
          </div>
        </td>
        <td className='px-3 py-2.5 text-right text-xs tabular-nums text-muted-foreground'>{fmtMcap(coin.marketCap)}</td>
        <td className='px-3 py-2.5 text-right text-xs tabular-nums text-muted-foreground'>{fmtMcap(coin.fdv)}</td>
        <td className='px-3 py-2.5 text-right text-xs tabular-nums'>
          {coin.marketCap && coin.fdv ? (
            <span className={`font-medium ${(coin.marketCap / coin.fdv) >= 0.8 ? 'text-emerald-500' : (coin.marketCap / coin.fdv) >= 0.4 ? 'text-amber-500' : 'text-red-400'}`}>
              {fmtRatio(coin.marketCap, coin.fdv)}
            </span>
          ) : <span className='text-subtle'>—</span>}
        </td>
        {EXCHANGES.map(e => (
          <td key={e.key} className='px-2 py-2.5 text-center'>
            <ExchangeCell status={coin[e.key]} />
          </td>
        ))}
        <td className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap ${SEQ_COLOR[coin.listingSequence]}`}>
          {d(SEQ_LABEL[coin.listingSequence])}
        </td>
        <td className='px-3 py-2.5 text-center'><SignalBadge rating={coin.signalRating} /></td>
        <td className='px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap'>{coin.firstSeenAt === null ? d("Unknown") : fmtDate(coin.firstSeenAt, locale)}</td>
      </tr>
      {expanded && (
        <tr className='border-b border-border bg-muted/10'>
          <td colSpan={14} className='px-4 py-4'>
            <CoinDetail coin={coin} />
          </td>
        </tr>
      )}
    </>
  );
}

function CoinDetail({ coin }: { coin: ListingCoin }) {
  const { locale, d } = useDashboardI18n();
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs'>
      <div>
        <p className='font-semibold mb-2 text-muted-foreground uppercase tracking-wide text-[11px]'>{d("Exchange Status Matrix")}</p>
        <div className='flex flex-col gap-2'>
          {EXCHANGES.map(e => {
            const s = coin[e.key];
            if (!s.spot && !s.perp) return (
              <div key={e.key} className='flex items-center gap-2 opacity-40'>
                <span className='w-24 font-medium'>{d(e.label)}</span>
                <span className='text-muted-foreground'>—</span>
              </div>
            );
            return (
              <div key={e.key} className='flex items-start gap-2'>
                <span className='w-24 font-medium flex-shrink-0'>{d(e.label)}</span>
                <div className='flex flex-col gap-0.5 min-w-0'>
                  {s.spot && (
                    <div>
                      <span className='text-emerald-600 dark:text-emerald-400 font-medium'>{d("SPOT")}</span>
                      {s.spotListedAt && <span className='ml-2 text-muted-foreground'>{fmtDateFull(s.spotListedAt, locale)}</span>}
                      {s.spotPairs.length > 0 && <span className='ml-2 text-subtle'>{s.spotPairs.slice(0, 4).join(', ')}</span>}
                    </div>
                  )}
                  {s.perp && (
                    <div>
                      <span className='text-violet-600 dark:text-violet-400 font-medium'>{d("PERP")}</span>
                      {s.perpListedAt && <span className='ml-2 text-muted-foreground'>{fmtDateFull(s.perpListedAt, locale)}</span>}
                      {s.perpPairs.length > 0 && <span className='ml-2 text-subtle'>{s.perpPairs.slice(0, 4).join(', ')}</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <p className='font-semibold mb-2 text-muted-foreground uppercase tracking-wide text-[11px]'>{d("Listing Summary")}</p>
        <div className='flex flex-col gap-1.5'>
          <Row label={d("Spot on")} value={coin.spotExchanges.join(', ') || 'None'} />
          <Row label={d("Perp on")} value={coin.perpExchanges.join(', ') || 'None'} />
          <Row label={d("Sequence")} value={SEQ_LABEL[coin.listingSequence]} />
          <Row label={d("Market Cap")} value={fmtMcap(coin.marketCap)} />
          <Row label={d("FDV")} value={fmtMcap(coin.fdv)} />
          <Row label={d("MC / FDV")} value={fmtRatio(coin.marketCap, coin.fdv)} />
          <Row label={d("Perp without spot")} value={coin.perpWithoutSpot ? 'YES ⚠ — high risk' : 'No'} />
          <Row label={d("Multi-ex spot")} value={coin.multiExchangeSpot ? `Yes (${coin.spotExchanges.length} exchanges)` : 'No'} />
          <Row label={d("Perp-led discovery")} value={coin.perpLed ? 'Yes — not on BNB/CB spot' : 'No'} />
          <Row label={d("Binance spot")} value={coin.binance.spot ? 'Listed' : 'Not listed'} />
          <Row label={d("Upbit KRW")} value={coin.upbit.spot ? 'Listed' : 'Not listed'} />
          <Row label={d("Hyperliquid")} value={coin.hyperliquid.perp ? 'Perp listed' : 'Not listed'} />
          <Row label={d("First seen")} value={coin.firstSeenAt === null ? 'Unknown' : fmtDateFull(coin.firstSeenAt, locale)} />
        </div>
      </div>
      {coin.noteworthy && (
        <div>
          <p className='font-semibold mb-2 text-muted-foreground uppercase tracking-wide text-[11px]'>{d("Signal Notes")}</p>
          <p className='text-amber-600 dark:text-amber-400 leading-relaxed'>{d(coin.noteworthy)}</p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const { d } = useDashboardI18n();
  return (
    <div className='flex gap-2 text-xs'>
      <span className='text-muted-foreground w-32 flex-shrink-0'>{d(label)}</span>
      <span className='font-medium'>{d(value)}</span>
    </div>
  );
}

// ─── Pattern Summary ──────────────────────────────────────────────────────────

function PatternSummary({ listings }: { listings: ListingCoin[] }) {
  const { d } = useDashboardI18n();
  const perpLed = listings.filter(c => c.perpLed);
  const perpOnly = listings.filter(c => c.perpWithoutSpot);
  const multiEx = listings.filter(c => c.multiExchangeSpot);
  const notable = listings.filter(c => c.noteworthy.length > 0 && !c.perpLed && !c.perpWithoutSpot && !c.multiExchangeSpot);

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <ZapIcon className='size-4 text-muted-foreground' />
        <h2 className='text-base font-semibold tracking-tight'>{d("Pattern Detectors")}</h2>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
        <PatternCard title={d("Perp-led Discovery")} desc={d("Derivatives present, not on Binance/CB spot")} colorClass='text-violet-500' borderClass='border-violet-500/30' bgClass='bg-violet-500/5' items={perpLed} info='s/d' />
        <PatternCard title={d("Derivatives Only ⚠")} desc={d("Perp traded, zero spot on any exchange")} colorClass='text-red-500' borderClass='border-red-500/30' bgClass='bg-red-500/5' items={perpOnly} info='s/d' />
        <PatternCard title={d("Multi-Exchange Spot")} desc={d("3+ exchanges with spot listing")} colorClass='text-emerald-500' borderClass='border-emerald-500/30' bgClass='bg-emerald-500/5' items={multiEx} info='count' />
        <PatternCard title={d("Cross-Exchange Signals")} desc={d("Notable listing path patterns")} colorClass='text-amber-500' borderClass='border-amber-500/30' bgClass='bg-amber-500/5' items={notable} info='note' />
      </div>
    </div>
  );
}

function PatternCard({ title, desc, colorClass, borderClass, bgClass, items, info }: {
  title: string; desc: string; colorClass: string; borderClass: string; bgClass: string;
  items: ListingCoin[]; info: 's/d' | 'count' | 'note';
}) {
  const { d } = useDashboardI18n();
  return (
    <div className={`rounded border ${borderClass} ${bgClass} p-4 flex flex-col gap-3`}>
      <div>
        <p className={`text-sm font-semibold ${colorClass}`}>{d(title)}</p>
        <p className='text-xs text-muted-foreground mt-0.5'>{d(desc)}</p>
      </div>
      <div className='flex flex-col gap-1.5'>
        {items.length === 0 ? (
          <span className='text-xs text-subtle'>{d("None detected")}</span>
        ) : (
          items.slice(0, 6).map(c => (
            <div key={c.symbol} className='flex items-center justify-between gap-2'>
              <span className='text-xs font-medium'>{c.symbol}</span>
              <span className='text-[10px] text-muted-foreground'>
                {d(info === 's/d' && `${c.spotExchanges.length}S / ${c.perpExchanges.length}D`)}
                {d(info === 'count' && `${c.spotExchanges.length} exchanges`)}
                {info === 'note' && <span className='truncate max-w-[120px] block'>{d(c.noteworthy.split('·')[0])}</span>}
              </span>
            </div>
          ))
        )}
        {items.length > 6 && <span className='text-[10px] text-muted-foreground'>+{d(items.length - 6)} {d("more")}</span>}
      </div>
    </div>
  );
}
