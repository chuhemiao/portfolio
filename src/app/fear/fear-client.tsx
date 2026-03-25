import type { FearDashboardData, SignalStatus } from '@/lib/fear-data';
import {
  FEAR_CORE_STRATEGIES,
  FEAR_EXPANDED_STRATEGIES,
  FEAR_OPERATOR_GUIDELINES
} from '@/data/fear-playbook';

function formatNumber(
  value: number | null,
  options?: Intl.NumberFormatOptions
) {
  if (value === null || Number.isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('en-US', options).format(value);
}

function formatCurrency(value: number | null, digits = 0) {
  if (value === null || Number.isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
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
  return 'High probability bottom zone';
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

function Sparkline({ values }: { values: number[] }) {
  if (!values.length) {
    return <p className='text-xs text-muted-foreground'>No chart data</p>;
  }

  const width = 220;
  const height = 56;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width='100%'
      height='56'
      className='overflow-visible'>
      <polyline
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        points={points}
        className='text-primary'
      />
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
  hint?: string;
}) {
  return (
    <div className='rounded-lg border p-3 bg-background/80'>
      <p className='text-xs text-muted-foreground mb-1'>{title}</p>
      <p className='text-sm font-semibold break-words'>{value}</p>
      {hint && <p className='text-[11px] text-muted-foreground mt-1'>{hint}</p>}
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className='rounded-lg border p-4 bg-background/70'>
      <h3 className='text-sm font-semibold mb-2'>{title}</h3>
      <ul className='space-y-1 text-sm text-muted-foreground'>
        {items.map((item) => (
          <li key={item}>• {item}</li>
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
  return (
    <div className='rounded-xl border p-4 bg-background/80 space-y-4'>
      <div className='space-y-2'>
        <h3 className='text-sm font-semibold'>{title}</h3>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
      <ListBlock title='What to watch' items={checks} />
      <ListBlock title='How to read it' items={interpretation} />
    </div>
  );
}

export default function FearClient({ data }: { data: FearDashboardData }) {
  const activeSignals = data.bottomSignals.filter(
    (s) => s.status === 'on'
  ).length;
  const tl = trafficLight(activeSignals);
  const gaugeDeg = Math.round((data.compositeScore / 100) * 360);

  return (
    <section className='space-y-8 pb-8'>
      <div className='space-y-3'>
        <h1 className='font-medium text-2xl tracking-tighter'>fear</h1>
        <p className='text-sm text-muted-foreground'>
          DYOR, this dashboard is meant to be a comprehensive data reference for
          Bitcoin market conditions, not a trading signal generator. Always
          cross-check with your own research and risk management.
        </p>
        <p className='text-sm text-muted-foreground'>
          Use the playbook below to observe regime shifts, leverage resets,
          liquidity migration, market rotation, and macro spillovers across
          crypto.
        </p>
        <p className='text-xs text-muted-foreground'>
          Last refresh: {new Date(data.generatedAt).toLocaleString('en-US')}
        </p>
      </div>

      <div className='w-full space-y-8'>
        <div className='rounded-xl border p-5 space-y-5'>
          <h2 className='text-lg font-semibold'>Composite Bottom Model</h2>
          <p className='text-sm text-muted-foreground'>
            Combine all indicators into a single bottom probability score.
          </p>
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
                  <span className='text-xs text-muted-foreground'>
                    Bottom Score
                  </span>
                </div>
              </div>
            </div>
            <div className='space-y-3'>
              <p className='text-sm'>
                Current band:{' '}
                <span className='font-semibold'>
                  {scoreBand(data.compositeScore)}
                </span>
              </p>
              <ListBlock
                title='Score range'
                items={[
                  '0 - 30 Overvalued',
                  '30 - 60 Neutral',
                  '60 - 80 Undervalued',
                  '80 - 100 High probability bottom zone'
                ]}
              />
            </div>
          </div>
        </div>

        <div className='rounded-xl border p-5 space-y-5'>
          <h2 className='text-lg font-semibold'>Bottom Alert Engine</h2>
          <p className='text-sm text-muted-foreground'>
            Trigger alert when at least five conditions are met.
          </p>
          <div className='flex items-center justify-between flex-wrap gap-3'>
            <p className='text-sm text-muted-foreground'>
              Active conditions: {activeSignals}/{data.bottomSignals.length}
            </p>
            <div
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${tl.className}`}>
              {tl.label}: {tl.text}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {data.bottomSignals.map((signal) => (
              <div
                key={signal.label}
                className='rounded-lg border p-3 flex items-center justify-between gap-3'>
                <div>
                  <p className='text-sm'>{signal.label}</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {signal.detail}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${statusBadge(signal.status)}`}>
                  {signal.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          <p className='text-xs text-muted-foreground'>
            Traffic light system: Green = strong accumulation zone, Yellow =
            neutral, Red = risk zone.
          </p>
        </div>

        <div className='space-y-4'>
          <h2 className='text-lg font-semibold'>
            Layer 1: Market Price and Core Valuation
          </h2>
          <p className='text-sm text-muted-foreground'>
            Display key valuation metrics for Bitcoin.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
            <MetricCard
              title='Bitcoin Price (real-time)'
              value={formatCurrency(data.layer1.btcPrice, 2)}
            />
            <MetricCard
              title='Market Cap'
              value={formatCurrency(data.layer1.marketCap)}
            />
            <MetricCard
              title='Realized Cap'
              value={formatCurrency(data.layer1.realizedCap)}
              hint='CryptoQuant'
            />
            <MetricCard
              title='Realized Price'
              value={formatCurrency(data.layer1.realizedPrice, 2)}
              hint='CryptoQuant'
            />
            <MetricCard
              title='MVRV Ratio'
              value={
                data.layer1.mvrv === null ? 'N/A' : data.layer1.mvrv.toFixed(2)
              }
              hint='CryptoQuant'
            />
            <MetricCard
              title='MVRV Z-Score'
              value={
                data.layer1.mvrvZ === null
                  ? 'N/A'
                  : data.layer1.mvrvZ.toFixed(2)
              }
              hint='Optional Glassnode fallback'
            />
            <MetricCard
              title='200 Week MA'
              value={formatCurrency(data.layer1.ma200Week, 2)}
            />
            <MetricCard
              title='Bottom Zone Rules'
              value='MVRV<1 / Z<0 / Z<-1'
              hint='Historical bottom highlighting enabled'
            />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
            <div className='rounded-lg border p-4 bg-gradient-to-br from-muted/50 via-muted/20 to-background'>
              <p className='text-sm font-medium mb-2'>
                Price vs Realized Price
              </p>
              <Sparkline values={data.layer1.btcPriceSeries} />
            </div>
            <div className='rounded-lg border p-4 bg-gradient-to-br from-muted/50 via-muted/20 to-background'>
              <p className='text-sm font-medium mb-2'>Price vs 200W MA</p>
              <Sparkline values={data.layer1.btcPriceSeries} />
            </div>
            <div className='rounded-lg border p-4 bg-gradient-to-br from-muted/50 via-muted/20 to-background'>
              <p className='text-sm font-medium mb-2'>MVRV Ratio historical</p>
              <p className='text-xs text-muted-foreground'>
                Waiting for CryptoQuant series
              </p>
            </div>
            <div className='rounded-lg border p-4 bg-gradient-to-br from-muted/50 via-muted/20 to-background'>
              <p className='text-sm font-medium mb-2'>MVRV Z-score cycle</p>
              <p className='text-xs text-muted-foreground'>
                Waiting for Glassnode series
              </p>
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          <h2 className='text-lg font-semibold'>
            Layer 2: On-chain Activity and OG Holder Behavior
          </h2>
          <p className='text-sm text-muted-foreground'>
            Measure network usage and long-term holder conviction.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
            <MetricCard
              title='Active Addresses'
              value={formatNumber(data.layer2.activeAddresses)}
              hint='Blockchain.com'
            />

            <MetricCard
              title='Transaction Count'
              value={formatNumber(data.layer2.txCount)}
              hint='Blockchain.com'
            />
            <MetricCard
              title='Mempool Stats'
              value={formatNumber(data.layer2.mempoolStats, {
                maximumFractionDigits: 2
              })}
              hint='Blockchain.com'
            />
            <MetricCard
              title='NVT'
              value={formatNumber(data.layer2.nvt, {
                maximumFractionDigits: 2
              })}
              hint='Primary API pending, fallback to research snapshot when needed'
            />
            <MetricCard
              title='Exchange Reserve'
              value={formatNumber(data.layer2.exchangeReserve, {
                maximumFractionDigits: 2
              })}
              hint='CryptoQuant'
            />

            <MetricCard
              title='Exchange Inflow'
              value={formatNumber(data.layer2.exchangeInflow, {
                maximumFractionDigits: 2
              })}
              hint='CryptoQuant'
            />
            <MetricCard
              title='Exchange Outflow'
              value={formatNumber(data.layer2.exchangeOutflow, {
                maximumFractionDigits: 2
              })}
              hint='CryptoQuant'
            />
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            <ListBlock
              title='Long-term holder metrics'
              items={[
                'Long Term Holder Supply Ratio (pending source)',
                'Dormancy Flow (pending source)',
                'Coin Days Destroyed (pending source)',
                'LTH-SOPR (pending source)'
              ]}
            />
            <ListBlock
              title='Old OG holder activity'
              items={[
                'Coins > 5 years moved (pending source)',
                'Coins > 10 years moved (pending source)',
                'HODL waves distribution (pending source)'
              ]}
            />
            <ListBlock
              title='Signal logic'
              items={[
                'Low dormancy + rising active addresses => early accumulation phase',
                'Old coins moving aggressively => late-cycle distribution signal'
              ]}
            />
          </div>
        </div>

        <div className='space-y-4'>
          <h2 className='text-lg font-semibold'>
            Layer 3: Market Sentiment Indicators
          </h2>
          <p className='text-sm text-muted-foreground'>
            Add sentiment and behavioral metrics.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
            <MetricCard
              title='Crypto Fear and Greed Index'
              value={
                data.layer3.fearGreed === null
                  ? 'N/A'
                  : `${data.layer3.fearGreed} (${data.layer3.fearGreedClass ?? 'N/A'})`
              }
            />
            <MetricCard
              title='Funding Rate (perpetual futures)'
              value={
                data.layer3.fundingRate === null
                  ? 'N/A'
                  : data.layer3.fundingRate.toExponential(4)
              }
              hint='Hyperliquid / Coinalyze'
            />
            <MetricCard
              title='Open Interest'
              value={formatNumber(data.layer3.openInterest, {
                maximumFractionDigits: 0
              })}
              hint='Hyperliquid / Coinalyze'
            />
            <MetricCard
              title='Long/Short Ratio'
              value={
                data.layer3.longShortRatio === null
                  ? 'N/A'
                  : data.layer3.longShortRatio.toFixed(4)
              }
              hint='Coinalyze'
            />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
            <div className='rounded-lg border p-4 bg-gradient-to-br from-muted/50 via-muted/20 to-background'>
              <p className='text-sm font-medium mb-2'>
                Fear and Greed timeline
              </p>
              <Sparkline values={data.layer3.fearGreedSeries} />
            </div>
            <div className='rounded-lg border p-4 bg-gradient-to-br from-muted/50 via-muted/20 to-background'>
              <p className='text-sm font-medium mb-2'>Funding rate heatmap</p>
              <p className='text-xs text-muted-foreground'>
                Coinalyze series extension pending
              </p>
            </div>
            <div className='rounded-lg border p-4 bg-gradient-to-br from-muted/50 via-muted/20 to-background'>
              <p className='text-sm font-medium mb-2'>Open interest vs price</p>
              <p className='text-xs text-muted-foreground'>
                Coinalyze series extension pending
              </p>
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          <h2 className='text-lg font-semibold'>
            Layer 4: Macro Asset Environment
          </h2>
          <p className='text-sm text-muted-foreground'>
            Track macro assets that historically correlate with Bitcoin cycles.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3'>
            <MetricCard
              title='S&P 500'
              value={formatNumber(data.layer4.sp500, {
                maximumFractionDigits: 2
              })}
            />
            <MetricCard
              title='Nasdaq'
              value={formatNumber(data.layer4.nasdaq, {
                maximumFractionDigits: 2
              })}
            />
            <MetricCard
              title='Gold'
              value={formatNumber(data.layer4.gold, {
                maximumFractionDigits: 2
              })}
            />
            <MetricCard
              title='Crude Oil'
              value={formatNumber(data.layer4.crudeOil, {
                maximumFractionDigits: 2
              })}
            />
            <MetricCard
              title='DXY'
              value={formatNumber(data.layer4.dxy, {
                maximumFractionDigits: 2
              })}
            />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
            <MetricCard
              title='Correlation BTC vs S&P 500 (90d)'
              value={formatPct(
                data.layer4.corrBtcSp500 === null
                  ? null
                  : data.layer4.corrBtcSp500 * 100
              )}
            />
            <MetricCard
              title='Correlation BTC vs Gold (90d)'
              value={formatPct(
                data.layer4.corrBtcGold === null
                  ? null
                  : data.layer4.corrBtcGold * 100
              )}
            />
            <MetricCard
              title='Correlation BTC vs DXY (90d)'
              value={formatPct(
                data.layer4.corrBtcDxy === null
                  ? null
                  : data.layer4.corrBtcDxy * 100
              )}
            />
          </div>
        </div>

        <div className='space-y-4'>
          <h2 className='text-lg font-semibold'>
            Layer 5: Volatility and Risk Indicators
          </h2>
          <p className='text-sm text-muted-foreground'>
            Track systemic market stress.
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
            <MetricCard
              title='VIX Index'
              value={formatNumber(data.layer5.vix, {
                maximumFractionDigits: 2
              })}
            />
            <MetricCard
              title='MOVE Index (bond vol)'
              value={formatNumber(data.layer5.move, {
                maximumFractionDigits: 2
              })}
              hint='FRED'
            />
            <MetricCard
              title='Yield Curve (10Y-2Y)'
              value={formatNumber(data.layer5.yieldCurveSpread, {
                maximumFractionDigits: 2
              })}
              hint='FRED'
            />
            <MetricCard
              title='S&P 500 Drawdown'
              value={formatPct(data.layer5.sp500Drawdown)}
            />
            <MetricCard
              title='Put/Call Ratio'
              value={formatNumber(data.layer5.putCallRatio, {
                maximumFractionDigits: 3
              })}
              hint='Cboe'
            />
          </div>
          <ListBlock
            title='Bear market detection rules'
            items={[
              'S&P 500 below 200 day moving average',
              'Yield curve inversion',
              'VIX > 30'
            ]}
          />
        </div>

        <div className='rounded-xl border p-5 space-y-5'>
          <div className='space-y-2'>
            <h2 className='text-lg font-semibold'>Observation Playbook</h2>
            <p className='text-sm text-muted-foreground'>
              Extract the current fear-page strategy first, then extend it into
              a broader crypto market observation workflow.
            </p>
          </div>

          <div className='space-y-4'>
            <div>
              <h3 className='text-sm font-semibold'>Current page strategy</h3>
              <p className='text-sm text-muted-foreground mt-1'>
                The existing implementation is a bottom-observation framework
                built around layered evidence and a risk-first operating rule.
              </p>
            </div>
            <div className='grid grid-cols-1 xl:grid-cols-3 gap-4'>
              {FEAR_CORE_STRATEGIES.map((strategy) => (
                <StrategyCard key={strategy.title} {...strategy} />
              ))}
            </div>
          </div>

          <div className='space-y-4'>
            <div>
              <h3 className='text-sm font-semibold'>
                Expanded crypto market observation strategies
              </h3>
              <p className='text-sm text-muted-foreground mt-1'>
                These strategies make the dashboard more useful for daily and
                weekly market review beyond pure bottom-fishing.
              </p>
            </div>
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
              {FEAR_EXPANDED_STRATEGIES.map((strategy) => (
                <StrategyCard key={strategy.title} {...strategy} />
              ))}
            </div>
          </div>

          <ListBlock
            title='Operator rules'
            items={FEAR_OPERATOR_GUIDELINES}
          />
        </div>

        <div className='rounded-xl border p-5 space-y-4'>
          <h2 className='text-lg font-semibold'>
            Historical Backtesting Module
          </h2>
          <p className='text-sm text-muted-foreground'>
            Overlay all indicators during 2015, 2018, 2020, 2022 to visually
            compare cycle bottoms.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
            <div className='rounded-lg border p-4'>
              <p className='text-xs text-muted-foreground mb-1'>2015</p>
              <p className='text-sm font-semibold mb-2'>
                Post-2013 capitulation recovery
              </p>
              <p className='text-xs text-muted-foreground'>
                Focus: valuation compression + low activity base.
              </p>
            </div>
            <div className='rounded-lg border p-4'>
              <p className='text-xs text-muted-foreground mb-1'>2018</p>
              <p className='text-sm font-semibold mb-2'>
                ICO bust and long consolidation
              </p>
              <p className='text-xs text-muted-foreground'>
                Focus: leverage reset + deep fear regime.
              </p>
            </div>
            <div className='rounded-lg border p-4'>
              <p className='text-xs text-muted-foreground mb-1'>2020</p>
              <p className='text-sm font-semibold mb-2'>
                COVID liquidity shock
              </p>
              <p className='text-xs text-muted-foreground'>
                Focus: macro stress spike + rapid mean reversion.
              </p>
            </div>
            <div className='rounded-lg border p-4'>
              <p className='text-xs text-muted-foreground mb-1'>2022</p>
              <p className='text-sm font-semibold mb-2'>
                Leverage unwind cycle
              </p>
              <p className='text-xs text-muted-foreground'>
                Focus: systemic deleveraging + prolonged bear.
              </p>
            </div>
          </div>
        </div>

        <div className='pt-2 border-t text-xs text-muted-foreground space-y-1'>
          <p>API Sources</p>
          <p>{data.sources.map((source) => source.name).join(' / ')}</p>
        </div>
      </div>
    </section>
  );
}
