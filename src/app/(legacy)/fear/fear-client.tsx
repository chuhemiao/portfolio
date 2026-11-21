'use client';

import type { Locale } from '@/lib/i18n';
import { useDashboardI18n } from '../fear/use-dashboard-i18n';
import { FearTriggerHistory } from './trigger-history';

import type { FearDashboardData, SignalStatus } from '@/lib/fear-data';
import { FEAR_BASE_SCORE, FEAR_SIGNAL_POINTS, summarizeFearScore } from '@/lib/fear-signals';
import {
  FEAR_CORE_STRATEGIES,
  FEAR_EXPANDED_STRATEGIES,
  FEAR_OPERATOR_GUIDELINES
} from '@/data/fear-playbook';
import type { ReactNode } from 'react';

function formatNumber(
  value: number | null,
  locale: Locale,
  options?: Intl.NumberFormatOptions
) {
  if (value === null || Number.isNaN(value)) return 'N/A';
  return new Intl.NumberFormat(locale, options).format(value);
}

function formatCurrency(value: number | null, locale: Locale, digits = 0) {
  if (value === null || Number.isNaN(value)) return 'N/A';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: digits
  }).format(value);
}

function formatPct(value: number | null, digits = 2) {
  if (value === null || Number.isNaN(value)) return 'N/A';
  return `${value.toFixed(digits)}%`;
}

function scoreBand(score: number) {
  if (score < 30) return 'Overvalued';
  if (score < 60) return 'Neutral';
  if (score < 80) return 'Undervalued';
  return 'High rule score';
}

function statusBadge(status: SignalStatus) {
  if (status === 'on') {
    return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
  }
  if (status === 'off') {
    return 'bg-red-500/10 text-red-600 border-red-500/30';
  }
  return 'bg-muted text-muted-foreground border-border';
}

function trafficLight(active: number) {
  if (active >= 5) {
    return {
      label: 'Green',
      text: 'strong accumulation zone',
      className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
    };
  }
  if (active >= 3) {
    return {
      label: 'Yellow',
      text: 'neutral',
      className: 'bg-amber-500/15 text-amber-600 border-amber-500/30'
    };
  }
  return {
    label: 'Red',
    text: 'risk zone',
    className: 'bg-red-500/15 text-red-600 border-red-500/30'
  };
}

function Sparkline({ values, comparison = [], label }: {
  values: (number | null)[];
  comparison?: (number | null)[];
  label?: string;
}) {
  const { d } = useDashboardI18n();
  const observed = [...values, ...comparison].filter((value): value is number => value !== null);
  if (!observed.length) {
    return <p className='text-xs text-muted-foreground'>{d("No chart data")}</p>;
  }

  const width = 220;
  const height = 56;
  const min = Math.min(...observed);
  const max = Math.max(...observed);
  const range = max - min || 1;

  const line = (series: (number | null)[]) => series.map((value, index) => {
    if (value === null) return '';
    const x = index * width / Math.max(values.length - 1, 1);
    const y = height - (value - min) * height / range;
    return `${series[index - 1] == null ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width='100%'
      height='56'
      role={label ? 'img' : undefined}
      aria-label={label}
      className='overflow-visible'>
      <path
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        d={line(values)}
        className='text-primary'
      />
      {comparison.length ? (
        <path fill='none' stroke='currentColor' strokeWidth='2' strokeDasharray='4 3'
          d={line(comparison)} className='text-amber-700 dark:text-amber-400' />
      ) : null}
    </svg>
  );
}

function MetricCard({
  title,
  value,
  hint
}: {
  title: string;
  value: string;
  hint?: ReactNode;
}) {
  const { d } = useDashboardI18n();
  return (
    <div className='rounded-lg border p-3 bg-surface'>
      <p className='text-xs text-muted-foreground mb-1'>{d(title)}</p>
      <p className='text-sm font-semibold break-words'>{d(value)}</p>
      {hint && <p className='text-[11px] text-muted-foreground mt-1'>{typeof hint === 'string' ? d(hint) : hint}</p>}
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  const { d } = useDashboardI18n();
  return (
    <div className='rounded-lg border p-4 bg-surface'>
      <h3 className='text-sm font-semibold mb-2'>{d(title)}</h3>
      <ul className='space-y-1 text-sm text-muted-foreground'>
        {items.map((item) => (
          <li key={item}>• {d(item)}</li>
        ))}
      </ul>
    </div>
  );
}

function StrategyCard({
  title,
  description,
  checks,
  interpretation
}: {
  title: string;
  description: string;
  checks: string[];
  interpretation: string[];
}) {
  const { d } = useDashboardI18n();
  return (
    <div className='rounded-xl border p-4 bg-surface space-y-4'>
      <div className='space-y-2'>
        <h3 className='text-sm font-semibold'>{d(title)}</h3>
        <p className='text-sm text-muted-foreground'>{d(description)}</p>
      </div>
      <ListBlock title={d("What to watch")} items={checks} />
      <ListBlock title={d("How to read it")} items={interpretation} />
    </div>
  );
}

export default function FearClient({
  data,
  children
}: {
  data: FearDashboardData;
  children?: ReactNode;
}) {
  const { locale, d } = useDashboardI18n();
  const activeSignals = data.bottomSignals.filter(s => s.status === 'on').length;
  const { raw, known: observedSignals } = summarizeFearScore(data.bottomSignals.map(signal => signal.status));
  const tl = trafficLight(activeSignals);
  const gaugeDeg = Math.round((data.compositeScore / 100) * 360);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });
  const day = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' });
  const signedPoints = new Intl.NumberFormat(locale, { signDisplay: 'exceptZero' });
  const latestValuation = data.bitviewValuationHistory?.at(-1);
  const latestZ = data.bitviewValuationHistory?.findLast(point => point.mvrvZ)?.mvrvZ;
  const valuationByDay = new Map(data.bitviewValuationHistory?.map(point => [point.date, point]));
  const valuationDays = data.signalHistory?.map(point => valuationByDay.get(point.date)) ?? [];
  const trendByDay = new Map(data.bitviewTrend?.points.map(point => [point.date, point]));
  const trendDays = data.signalHistory?.map(point => trendByDay.get(point.date)) ?? data.bitviewTrend?.points ?? [];

  return (
    <section className='space-y-8 pb-8'>
      <div className='space-y-3'>
        <h1 className='font-medium text-2xl tracking-tighter'>{d("fear")}</h1>
        <p className='text-sm text-muted-foreground'> {d("DYOR, this dashboard is meant to be a comprehensive data reference for Bitcoin market conditions, not a trading signal generator. Always cross-check with your own research and risk management.")} </p>
        <p className='text-sm text-muted-foreground'> {d("Use the playbook below to observe regime shifts, leverage resets, liquidity migration, market rotation, and macro spillovers across crypto.")} </p>
        <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'>
          <span>{d("Last refresh:")} <time dateTime={data.generatedAt}>{date.format(new Date(data.generatedAt))} UTC</time></span>
          {data.observedAt.btcPrice ? (
            <span>{d("BTC quote observed")} <time dateTime={data.observedAt.btcPrice}>{date.format(new Date(data.observedAt.btcPrice))} UTC</time></span>
          ) : null}
          {data.observedAt.fearGreed ? (
            <span>{d("Fear & Greed observation")} <time dateTime={data.observedAt.fearGreed}>{date.format(new Date(data.observedAt.fearGreed))} UTC</time></span>
          ) : null}
        </div>
      </div>

      {children}

      <div className='w-full space-y-8'>
        <div className='rounded-xl border p-5 space-y-5'>
          <h2 className='text-lg font-semibold'>{d("Composite Bottom Model")}</h2>
          <p className='text-sm text-muted-foreground'>
            {d("The bottom score summarizes the available signals.")} {d("Signals with data")} {observedSignals}/{data.bottomSignals.length}
          </p>
          <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'>
            <span>{d('Base score')} {FEAR_BASE_SCORE}</span>
            <span>{d('ON')} {signedPoints.format(FEAR_SIGNAL_POINTS.on)}</span>
            <span>{d('OFF')} {signedPoints.format(FEAR_SIGNAL_POINTS.off)}</span>
            <span>{d('UNKNOWN')} {signedPoints.format(FEAR_SIGNAL_POINTS.unknown)}</span>
            {raw !== data.compositeScore ? <span>{d('Score limited to 0–100')} · {raw} → {data.compositeScore}</span> : null}
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-center'>
            <div className='flex justify-center'>
              <div
                className='size-44 rounded-full p-3'
                style={{
                  background: `conic-gradient(#16a34a ${gaugeDeg}deg, rgba(148,163,184,0.25) 0deg)`
                }}>
                <div className='size-full rounded-full bg-background border flex flex-col items-center justify-center text-center'>
                  <span className='text-4xl font-semibold'>
                    {data.compositeScore}
                  </span>
                  <span className='text-xs text-muted-foreground'> {d("Bottom Score")} </span>
                </div>
              </div>
            </div>
            <div className='space-y-3'>
              <p className='text-sm'> {d("Current band:")}{' '}
                <span className='font-semibold'>
                  {d(scoreBand(data.compositeScore))}
                </span>
              </p>
              <ListBlock
                title={d("Score range")}
                items={[
                  '0 - 30 Overvalued',
                  '30 - 60 Neutral',
                  '60 - 80 Undervalued',
                  '80 - 100 High rule score'
                ]}
              />
            </div>
          </div>
        </div>

        <div className='rounded-xl border p-5 space-y-5'>
          <h2 className='text-lg font-semibold'>{d("Bottom Alert Engine")}</h2>
          <p className='text-sm text-muted-foreground'> {d("Trigger alert when at least five conditions are met.")} </p>
          <div className='flex items-center justify-between flex-wrap gap-3'>
            <p className='text-sm text-muted-foreground'> {d("Active conditions:")} {activeSignals}/{data.bottomSignals.length}
            </p>
            <div
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${tl.className}`}>
              {d(tl.label)}: {d(tl.text)}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {data.bottomSignals.map((signal) => (
              <div
                key={signal.label}
                className='rounded-lg border p-3 flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <p className='text-sm'>{d(signal.label)}</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {d(signal.detail)}
                  </p>
                  {signal.observations?.length ? (
                    <ul className='mt-1.5 space-y-0.5 text-[11px] text-muted-foreground'>
                      {signal.observations.map(observation => (
                        <li key={observation.source}>
                          {observation.source === 'Alternative.me' ? (
                            <a href='https://alternative.me/crypto/fear-and-greed-index/' className='underline'>{observation.source}</a>
                          ) : observation.source === 'Bitview' ? (
                            <a href='https://bitview.space/' className='underline'>Bitview</a>
                          ) : observation.source}
                          {observation.observedAt && Number.isFinite(Date.parse(observation.observedAt)) ? (
                            <> · <time dateTime={observation.observedAt}>
                              {(observation.observedAt.length === 10 ? day : date).format(Date.parse(observation.observedAt))}
                            </time> UTC</>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <div className='grid shrink-0 gap-1 text-right text-xs'>
                  <span className={`px-2 py-1 rounded-full border ${statusBadge(signal.status)}`}>
                    {d(signal.status.toUpperCase())}
                  </span>
                  <span className='text-muted-foreground'>{d('Contribution')} {signedPoints.format(FEAR_SIGNAL_POINTS[signal.status])}</span>
                </div>
              </div>
            ))}
          </div>

          <p className='text-xs text-muted-foreground'> {d("Traffic light system: Green = strong accumulation zone, Yellow = neutral, Red = risk zone.")} </p>
        </div>

        <FearTriggerHistory history={data.signalHistory ?? []} historySources={data.historySources} />

        <div className='space-y-4'>
          <h2 className='text-lg font-semibold'> {d("Layer 1: Market Price and Core Valuation")} </h2>
          <p className='text-sm text-muted-foreground'> {d("Display key valuation metrics for Bitcoin.")} </p>
          {latestValuation ? (
            <p className='flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground'>
              <span><a href='https://bitview.space/' className='underline'>Bitview (bitview.space)</a> · <a href='https://creativecommons.org/licenses/by/4.0/' className='underline'>CC BY 4.0</a></span>
              <span>{d('Valuation observation')} <time dateTime={latestValuation.date}>{day.format(Date.parse(latestValuation.date))} UTC</time></span>
              <span>{d('Source data collected')} <time dateTime={latestValuation.collectedAt}>{date.format(Date.parse(latestValuation.collectedAt))} UTC</time></span>
              <span>{d('MVRV is calculated as Bitview market cap divided by realized cap.')}</span>
            </p>
          ) : null}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
            <MetricCard
              title={d("Bitcoin Price (real-time)")}
              value={formatCurrency(data.layer1.btcPrice, locale, 2)}
            />
            <MetricCard
              title={d("Market Cap")}
              value={formatCurrency(latestValuation ? latestValuation.marketCap : data.layer1.marketCap, locale)}
            />
            <MetricCard
              title={d("Realized Cap")}
              value={formatCurrency(data.layer1.realizedCap, locale)}
            />
            <MetricCard
              title={d("Realized Price")}
              value={formatCurrency(data.layer1.realizedPrice, locale, 2)}
            />
            <MetricCard
              title={d("MVRV Ratio")}
              value={
                data.layer1.mvrv === null ? 'N/A' : data.layer1.mvrv.toFixed(2)
              }
            />
            <MetricCard
              title={d("MVRV Z-Score")}
              value={
                data.layer1.mvrvZ === null
                  ? 'N/A'
                  : data.layer1.mvrvZ.toFixed(2)
              }
              hint={latestValuation ? undefined : d("Optional Glassnode fallback")}
            />
            <MetricCard
              title={d("200 Week MA")}
              value={formatCurrency(data.layer1.ma200Week, locale, 2)}
              hint={data.observedAt.ma200Week
                ? `${d("200 closed Binance BTC/USDT weeks")} · ${date.format(new Date(data.observedAt.ma200Week))} UTC`
                : undefined}
            />
            <MetricCard
              title={d("Bottom Zone Rules")}
              value='MVRV<1 / Z<0 / Z<-1'
              hint={d("Historical bottom highlighting enabled")}
            />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
            <div className='rounded-lg border p-4 bg-gradient-to-br from-muted/50 via-muted/20 to-background'>
              <p className='text-sm font-medium mb-2'> {d("Price vs Realized Price")} </p>
              <Sparkline
                values={valuationDays.map(point => point?.usdClose ?? null)}
                comparison={valuationDays.map(point => point?.realizedPrice ?? null)}
                label={d('Price vs Realized Price')}
              />
              {latestValuation ? (
                <p className='mt-2 flex flex-wrap gap-x-2 text-[11px]'>
                  <span className='text-primary'>{d('Bitview BTC/USD daily close')}</span>
                  <span className='text-amber-700 dark:text-amber-400'>{d('Realized Price')}</span>
                </p>
              ) : null}
            </div>
            <div className='rounded-lg border p-4 bg-gradient-to-br from-muted/50 via-muted/20 to-background'>
              <p className='text-sm font-medium mb-2'>{d("Price vs 200W MA")}</p>
              <Sparkline
                values={trendDays.map(point => point?.usdClose ?? null)}
                comparison={trendDays.map(point => point?.ma200Week ?? null)}
                label={d('Price vs 200W MA')}
              />
              {data.bitviewTrend ? (
                <div className='mt-2 space-y-1 text-[11px] text-muted-foreground'>
                  <p className='flex flex-wrap gap-x-2'>
                    <span className='text-primary'>{d('Bitview BTC/USD daily close')}</span>
                    <span className='text-amber-700 dark:text-amber-400'>{d('Bitview 200-week MA')} · USD/BTC</span>
                  </p>
                  <p>{d('Each daily value averages the latest 200 Sunday UTC closes.')}</p>
                  <p>
                    <a href='https://bitview.space/' className='underline'>Bitview (bitview.space)</a> · <a href='https://creativecommons.org/licenses/by/4.0/' className='underline'>CC BY 4.0</a>
                    {' · '}{d('Source data collected')} <time dateTime={data.bitviewTrend.collectedAt}>{date.format(Date.parse(data.bitviewTrend.collectedAt))} UTC</time>
                  </p>
                </div>
              ) : null}
            </div>
            <div className='rounded-lg border p-4 bg-gradient-to-br from-muted/50 via-muted/20 to-background'>
              <p className='text-sm font-medium mb-2'>{d("MVRV Ratio historical")}</p>
              <Sparkline values={valuationDays.map(point => point ? point.marketCap / point.realizedCap : null)} label={d('MVRV Ratio historical')} />
            </div>
            <div className='rounded-lg border p-4 bg-gradient-to-br from-muted/50 via-muted/20 to-background'>
              <p className='text-sm font-medium mb-2'>{d("MVRV Z-score cycle")}</p>
              <Sparkline values={valuationDays.map(point => point?.mvrvZ?.value ?? null)} label={d('MVRV Z-score cycle')} />
              {data.historySources?.mvrvZ ? (
                <p className='mt-2 space-y-1 text-[11px] text-muted-foreground'>
                  <span className='block'>{d('Z-score uses the difference between market cap and realized cap, divided by the population standard deviation of market cap through that day.')}</span>
                  <a className='block underline' href='https://github.com/bitcoinresearchkit/mono/blob/main/showcases/studio/presets.js#L651-L659'>{d("Calculated here using Bitview's published method")}</a>
                  {latestZ ? <span className='block'>{d('Source data collected')} <time dateTime={latestZ.collectedAt}>{date.format(Date.parse(latestZ.collectedAt))} UTC</time></span> : null}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          <h2 className='text-lg font-semibold'> {d("Layer 2: On-chain Activity and OG Holder Behavior")} </h2>
          <p className='text-sm text-muted-foreground'> {d("Measure network usage and long-term holder conviction.")} </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
            <MetricCard
              title={d("Unique addresses used")}
              value={formatNumber(data.layer2.activeAddresses, locale)}
              hint={d("Blockchain.com")}
            />

            <MetricCard
              title={d("Transaction Count")}
              value={formatNumber(data.layer2.txCount, locale)}
              hint={d("Blockchain.com")}
            />
            <MetricCard
              title={d("Mempool Stats")}
              value={formatNumber(data.layer2.mempoolStats, locale, {
                maximumFractionDigits: 2
              })}
              hint={d("Blockchain.com")}
            />
            <MetricCard
              title={d("NVT")}
              value={formatNumber(data.layer2.nvt, locale, {
                maximumFractionDigits: 2
              })}
              hint={d("Primary API pending, fallback to research snapshot when needed")}
            />
            <MetricCard
              title={d("Exchange Reserve")}
              value={formatNumber(data.layer2.exchangeReserve, locale, {
                maximumFractionDigits: 2
              })}
              hint={d("CryptoQuant")}
            />

            <MetricCard
              title={d("Exchange Inflow")}
              value={formatNumber(data.layer2.exchangeInflow, locale, {
                maximumFractionDigits: 2
              })}
              hint={d("CryptoQuant")}
            />
            <MetricCard
              title={d("Exchange Outflow")}
              value={formatNumber(data.layer2.exchangeOutflow, locale, {
                maximumFractionDigits: 2
              })}
              hint={d("CryptoQuant")}
            />
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            <ListBlock
              title={d("Long-term holder metrics")}
              items={[
                'Long Term Holder Supply Ratio (pending source)',
                'Dormancy Flow (pending source)',
                'Coin Days Destroyed (pending source)',
                'LTH-SOPR (pending source)'
              ]}
            />
            <ListBlock
              title={d("Old OG holder activity")}
              items={[
                'Coins > 5 years moved (pending source)',
                'Coins > 10 years moved (pending source)',
                'HODL waves distribution (pending source)'
              ]}
            />
            <ListBlock
              title={d("Signal logic")}
              items={[
                'Low dormancy + rising active addresses => early accumulation phase',
                'Old coins moving aggressively => late-cycle distribution signal'
              ]}
            />
          </div>
        </div>

        <div className='space-y-4'>
          <h2 className='text-lg font-semibold'> {d("Layer 3: Market Sentiment Indicators")} </h2>
          <p className='text-sm text-muted-foreground'> {d("Add sentiment and behavioral metrics.")} </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
            <MetricCard
              title={d("Crypto Fear and Greed Index")}
              value={
                data.layer3.fearGreed === null
                  ? 'N/A'
                  : `${data.layer3.fearGreed} (${data.layer3.fearGreedClass ?? 'N/A'})`
              }
              hint={<a className='underline' href='https://alternative.me/crypto/fear-and-greed-index/'>Alternative.me</a>}
            />
            <MetricCard
              title={d("Funding Rate (perpetual futures)")}
              value={
                data.layer3.fundingRate === null
                  ? 'N/A'
                  : data.layer3.fundingRate.toExponential(4)
              }
              hint={d("Hyperliquid / Coinalyze")}
            />
            <MetricCard
              title={d("BTC perpetual open interest (USD)")}
              value={formatCurrency(data.layer3.openInterest, locale)}
              hint={d("Hyperliquid / Coinalyze")}
            />
            <MetricCard
              title={d("Long/Short Ratio")}
              value={
                data.layer3.longShortRatio === null
                  ? 'N/A'
                  : data.layer3.longShortRatio.toFixed(4)
              }
              hint={d("Coinalyze")}
            />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
            <div className='rounded-lg border p-4 bg-gradient-to-br from-muted/50 via-muted/20 to-background'>
              <p className='text-sm font-medium mb-2'> {d("Fear and Greed timeline")} </p>
              <Sparkline values={data.layer3.fearGreedSeries} />
            </div>
            <div className='rounded-lg border p-4 bg-gradient-to-br from-muted/50 via-muted/20 to-background'>
              <p className='text-sm font-medium mb-2'>{d("Funding rate heatmap")}</p>
              <p className='text-xs text-muted-foreground'> {d("Coinalyze series extension pending")} </p>
            </div>
            <div className='rounded-lg border p-4 bg-gradient-to-br from-muted/50 via-muted/20 to-background'>
              <p className='text-sm font-medium mb-2'>{d("Open interest vs price")}</p>
              <p className='text-xs text-muted-foreground'> {d("Coinalyze series extension pending")} </p>
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          <h2 className='text-lg font-semibold'> {d("Layer 4: Macro Asset Environment")} </h2>
          <p className='text-sm text-muted-foreground'> {d("Track macro assets that historically correlate with Bitcoin cycles.")} </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3'>
            <MetricCard
              title={d("S&P 500")}
              value={formatNumber(data.layer4.sp500, locale, {
                maximumFractionDigits: 2
              })}
            />
            <MetricCard
              title={d("Nasdaq")}
              value={formatNumber(data.layer4.nasdaq, locale, {
                maximumFractionDigits: 2
              })}
            />
            <MetricCard
              title={d("Gold")}
              value={formatNumber(data.layer4.gold, locale, {
                maximumFractionDigits: 2
              })}
            />
            <MetricCard
              title={d("Crude Oil")}
              value={formatNumber(data.layer4.crudeOil, locale, {
                maximumFractionDigits: 2
              })}
            />
            <MetricCard
              title={d("DXY")}
              value={formatNumber(data.layer4.dxy, locale, {
                maximumFractionDigits: 2
              })}
            />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
            <MetricCard
              title={d("Correlation BTC vs S&P 500 (90d)")}
              value={formatPct(
                data.layer4.corrBtcSp500 === null
                  ? null
                  : data.layer4.corrBtcSp500 * 100
              )}
            />
            <MetricCard
              title={d("Correlation BTC vs Gold (90d)")}
              value={formatPct(
                data.layer4.corrBtcGold === null
                  ? null
                  : data.layer4.corrBtcGold * 100
              )}
            />
            <MetricCard
              title={d("Correlation BTC vs DXY (90d)")}
              value={formatPct(
                data.layer4.corrBtcDxy === null
                  ? null
                  : data.layer4.corrBtcDxy * 100
              )}
            />
          </div>
        </div>

        <div className='space-y-4'>
          <h2 className='text-lg font-semibold'> {d("Layer 5: Volatility and Risk Indicators")} </h2>
          <p className='text-sm text-muted-foreground'> {d("Track systemic market stress.")} </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
            <MetricCard
              title={d("VIX Index")}
              value={formatNumber(data.layer5.vix, locale, {
                maximumFractionDigits: 2
              })}
            />
            <MetricCard
              title={d("MOVE Index (bond vol)")}
              value={formatNumber(data.layer5.move, locale, {
                maximumFractionDigits: 2
              })}
              hint={d("FRED")}
            />
            <MetricCard
              title={d("Yield Curve (10Y-2Y)")}
              value={formatNumber(data.layer5.yieldCurveSpread, locale, {
                maximumFractionDigits: 2
              })}
              hint={d("FRED")}
            />
            <MetricCard
              title={d("S&P 500 Drawdown")}
              value={formatPct(data.layer5.sp500Drawdown)}
            />
            <MetricCard
              title={d("Put/Call Ratio")}
              value={formatNumber(data.layer5.putCallRatio, locale, {
                maximumFractionDigits: 3
              })}
              hint={d("Cboe")}
            />
          </div>
          <ListBlock
            title={d("Bear market detection rules")}
            items={[
              'S&P 500 below 200 day moving average',
              'Yield curve inversion',
              'VIX > 30'
            ]}
          />
        </div>

        <div className='rounded-xl border p-5 space-y-5'>
          <div className='space-y-2'>
            <h2 className='text-lg font-semibold'>{d("Observation Playbook")}</h2>
            <p className='text-sm text-muted-foreground'> {d("Extract the current fear-page strategy first, then extend it into a broader crypto market observation workflow.")} </p>
          </div>

          <div className='space-y-4'>
            <div>
              <h3 className='text-sm font-semibold'>{d("Current page strategy")}</h3>
              <p className='text-sm text-muted-foreground mt-1'> {d("The existing implementation is a bottom-observation framework built around layered evidence and a risk-first operating rule.")} </p>
            </div>
            <div className='grid grid-cols-1 xl:grid-cols-3 gap-4'>
              {FEAR_CORE_STRATEGIES.map((strategy) => (
                <StrategyCard key={strategy.title} {...strategy} />
              ))}
            </div>
          </div>

          <div className='space-y-4'>
            <div>
              <h3 className='text-sm font-semibold'> {d("Expanded crypto market observation strategies")} </h3>
              <p className='text-sm text-muted-foreground mt-1'> {d("These strategies make the dashboard more useful for daily and weekly market review beyond pure bottom-fishing.")} </p>
            </div>
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
              {FEAR_EXPANDED_STRATEGIES.map((strategy) => (
                <StrategyCard key={strategy.title} {...strategy} />
              ))}
            </div>
          </div>

          <ListBlock
            title={d("Operator rules")}
            items={FEAR_OPERATOR_GUIDELINES}
          />
        </div>

        <div className='rounded-xl border p-5 space-y-4'>
          <h2 className='text-lg font-semibold'> {d("Historical cycle notes")} </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
            <div className='rounded-lg border p-4'>
              <p className='text-xs text-muted-foreground mb-1'>2015</p>
              <p className='text-sm font-semibold mb-2'> {d("Post-2013 capitulation recovery")} </p>
              <p className='text-xs text-muted-foreground'> {d("Focus: valuation compression + low activity base.")} </p>
            </div>
            <div className='rounded-lg border p-4'>
              <p className='text-xs text-muted-foreground mb-1'>2018</p>
              <p className='text-sm font-semibold mb-2'> {d("ICO bust and long consolidation")} </p>
              <p className='text-xs text-muted-foreground'> {d("Focus: leverage reset + deep fear regime.")} </p>
            </div>
            <div className='rounded-lg border p-4'>
              <p className='text-xs text-muted-foreground mb-1'>2020</p>
              <p className='text-sm font-semibold mb-2'> {d("COVID liquidity shock")} </p>
              <p className='text-xs text-muted-foreground'> {d("Focus: macro stress spike + rapid mean reversion.")} </p>
            </div>
            <div className='rounded-lg border p-4'>
              <p className='text-xs text-muted-foreground mb-1'>2022</p>
              <p className='text-sm font-semibold mb-2'> {d("Leverage unwind cycle")} </p>
              <p className='text-xs text-muted-foreground'> {d("Focus: systemic deleveraging + prolonged bear.")} </p>
            </div>
          </div>
        </div>

        <div className='pt-2 border-t text-xs text-muted-foreground space-y-1'>
          <p>{d("API Sources")}</p>
          <p>{data.sources.map((source) => source.name).join(' / ')}</p>
        </div>
      </div>
    </section>
  );
}
