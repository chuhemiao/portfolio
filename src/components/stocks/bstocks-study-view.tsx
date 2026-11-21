import type { ReactNode } from 'react';
import { getBstockStudy, type BstockCorporateAction } from '@/data/bstocks-study';
import type { Instrument } from '@/data/tokenized-equities';
import { getTranslator, type Locale } from '@/lib/i18n';
import { ADGM_PROSPECTUS_DIRECTORY, BEP_677_STANDARD, BINANCE_MARKET_SOURCE, BSC_METRIC_DEPTH, BSC_PANCAKE_INFINITY, BSC_PANCAKE_V2, BSC_UNISWAP_V4, priceIndicators, trailingTwelveMonths, type Close, type ConcentratedLiquidityQuotes, type DexPoolDepth, type Measure, type PancakeV2Reserves } from '@/lib/bstocks-study';
import { MISSING, formatChange } from '@/lib/instrument-format';
import { BinanceUnderlyingQuote } from './binance-underlying-quote';

const BINANCE_SPOT_CHARTS = new Set([
  'AAOIBUSDT', 'ADBEBUSDT', 'AGPUBUSDT', 'ALABBUSDT', 'AMATBUSDT', 'AMDBUSDT',
  'ANTBUSDT', 'APPBUSDT', 'ARMBUSDT', 'ASMLBUSDT', 'ASTSBUSDT', 'AVGOBUSDT',
  'AXTIBUSDT', 'BBBUSDT', 'BEBUSDT', 'BOTBUSDT', 'BRKBBUSDT', 'BSPBUSDT',
  'CBRSBUSDT', 'COHRBUSDT', 'COINBUSDT', 'CRCLBUSDT', 'CRDOBUSDT', 'CRMBUSDT',
  'CRWDBUSDT', 'CRWVBUSDT', 'CYPHBUSDT', 'DELLBUSDT', 'DRAMBUSDT', 'EWZBUSDT',
  'EWZSBUSDT', 'FWDIBUSDT', 'GEVBUSDT', 'GLWBUSDT', 'GPROBUSDT', 'GSBUSDT',
  'HIMSBUSDT', 'HPEBUSDT', 'IBMBUSDT', 'INTWBUSDT', 'IRENBUSDT', 'IWMBUSDT',
  'JPMBUSDT', 'KORUBUSDT', 'LITEBUSDT', 'MDBBUSDT', 'MELIBUSDT', 'MUUBUSDT',
  'MVLLBUSDT', 'NBISBUSDT', 'NUBUSDT', 'ORCLBUSDT', 'PLTRBUSDT', 'PYPLBUSDT',
  'QCOMBUSDT', 'QNTBUSDT', 'RDDTBUSDT', 'RKLBBUSDT', 'SECZBUSDT', 'SHAZBUSDT',
  'SKDDBUSDT', 'SKUUBUSDT', 'SMCIBUSDT', 'SMHBUSDT', 'SNDKBUSDT', 'STXBUSDT',
  'TMFBUSDT', 'USARBUSDT', 'USDEBUSDT', 'UVXYBUSDT', 'VSTBUSDT', 'WDCBUSDT',
  'WENBUSDT', 'ZMBUSDT',
]);
const BINANCE_DISPLAY_UNIT_SOURCE = 'https://www.binance.com/uz-UZ/support/faq/detail/f0c03cd6509a4085b4cce1636f16be38';
const TRADINGVIEW_TECHNICALS = new Map([
  ['NYSE:CRCL', { instrument: 'NYSE-CRCL', localized: true }],
  ['NASDAQ:MUU', { instrument: 'NASDAQ-MUU', localized: true }],
  ['NASDAQ:AAPL', { instrument: 'NASDAQ-AAPL', localized: false }],
  ['AMEX:SPY', { instrument: 'AMEX-SPY', localized: false }],
  ['NASDAQ:SNDK', { instrument: 'NASDAQ-SNDK', localized: false }],
  ['CBOE:DRAM', { instrument: 'CBOE-DRAM', localized: false }],
]);

const METRIC_NAMES = {
  revenue: ['Revenue', '营收', '売上高'],
  contractRevenue: ['Revenue from contracts with customers', '客户合同收入', '顧客との契約から生じる収益'],
  netSales: ['Net sales', '净销售额', '純売上高'],
  reserveIncome: ['Reserve income', '储备收入', '準備資産運用収益'],
  otherRevenue: ['Other revenue', '其他营收', 'その他の売上高'],
  netIncome: ['Net income', '净利润', '純利益'],
  consolidatedNetIncome: ['Consolidated net income', '合并净利润', '連結純利益'],
  operatingIncome: ['Operating income', '营业利润', '営業利益'],
  cashFlow: ['Operating cash flow', '经营现金流', '営業キャッシュフロー'],
  dilutedEps: ['Diluted EPS', '摊薄每股收益', '希薄化後 EPS'],
  dilutedOrdinaryShareEps: ['Diluted EPS per ordinary share', '每普通股摊薄收益', '普通株式1株当たり希薄化後利益'],
  averageUsdc: ['Average USDC supply', 'USDC 平均流通量', 'USDC 平均流通量'],
  periodEndUsdc: ['Period-end USDC supply', 'USDC 期末流通量', 'USDC 期末流通量'],
  reserveReturn: ['Return on reserves', '储备收益率', '準備資産利回り'],
  adjustedEbitda: ['Adjusted EBITDA · non-GAAP', '调整后 EBITDA（非 GAAP）', '調整後 EBITDA（非 GAAP）'],
  safeFairValueChange: ['Notes, derivatives and SAFEs fair-value change', '票据、衍生品与 SAFE 公允价值变动', '社債・デリバティブ・SAFE の公正価値変動'],
  nav: ['NAV per share', '每份基金净值', '1口当たり純資産価額'],
  fundMarketPrice: ['Sponsor-reported market price', '发行方披露的市场价', '運用会社が公表する市場価格'],
  fundMidpoint: ['Sponsor’s 4 p.m. ET midpoint', '发行方记录的美东 16:00 中间价', '運用会社の米東部16時の仲値'],
  netExpense: ['Net expense ratio', '净费率', '純経費率'],
  grossExpense: ['Gross expense ratio', '总费率', '総経費率'],
  annualizedGrossExpense: ['Annualized gross expense ratio for the period', '报告期总费率（年化）', '報告期間の総経費率（年率）'],
  annualizedNetExpense: ['Annualized net expense ratio for the period', '报告期净费率（年化）', '報告期間の純経費率（年率）'],
  dailyTarget: ['Daily target before fees', '费前每日目标倍数', '手数料控除前の日次目標倍率'],
} as const;

function format(value: number | undefined | null, locale: Locale, unit = '', compact = false) {
  if (value === undefined || value === null) return MISSING;
  const formatted = new Intl.NumberFormat(locale, { notation: compact ? 'compact' : 'standard', maximumFractionDigits: compact ? 2 : 6 }).format(value);
  return unit ? `${formatted}${unit === '%' || unit === '×' ? '' : ' '}${unit}` : formatted;
}

function MetricGrid({ items }: { items: { label: string; value: ReactNode; detail?: string }[] }) {
  return (
    <dl className='grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4'>
      {items.map(({ label, value, detail }) => (
        <div key={label} className='min-w-0 bg-surface px-3 py-3.5 sm:px-4'>
          <dt className='text-[11px] leading-4 text-muted-foreground'>{label}</dt>
          <dd className='mt-1 break-words font-mono text-[13px] tnum sm:text-[15px]' title={detail}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Source({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target='_blank' rel='noopener noreferrer' className='text-brand underline-offset-4 hover:underline'>{children} ↗</a>;
}

function UtcTime({ timestamp }: { timestamp: string }) {
  return <time dateTime={timestamp}>{timestamp.replace('T', ' ').replace(/(?:\.000)?Z$/, ' UTC')}</time>;
}

function CorporateActionTimeline({ action, locale }: { action: BstockCorporateAction; locale: Locale }) {
  const t = getTranslator(locale);
  const { before, after } = action;
  const split = action.kind === 'split';
  const dividend = !split && format(action.dividendPerShareUsd, locale, 'USD');
  return (
    <section className='space-y-2 border border-border bg-surface px-4 py-3' data-bstock-corporate-action={action.kind}>
      <h3 className='text-sm font-semibold'>{split ? t('SanDisk split timeline', 'SanDisk 拆股时间线', 'SanDisk 株式分割の時系列')
        : t('Micron dividend timeline', 'Micron 股息调整时间线', 'Micron 配当調整の時系列')}</h3>
      <ol className='space-y-2 text-xs text-muted-foreground'>
        <li>
          {split ? <>
            <UtcTime timestamp={action.legalAt} /> · {t(`Underlying ${action.sharesAfterSplit}-for-1 split legally effective`, `原股票 1 拆 ${action.sharesAfterSplit} 法定生效`, `原株式の1株を${action.sharesAfterSplit}株にする分割が法的に発効`)}{' · '}
            <Source href={action.issuerSource}>{t('SanDisk SEC filing', 'SanDisk 的 SEC 文件', 'SanDisk の SEC 提出書類')}</Source>
          </> : <>
            <time dateTime={action.declaredOn}>{action.declaredOn}</time> · {t(`Micron declared a dividend of ${dividend} per underlying share`, `Micron 宣布原股票每股派息 ${dividend}`, `Micron が原株式1株当たり ${dividend} の配当を発表`)}{' · '}
            <Source href={action.issuerSource}>{t('Micron announcement', 'Micron 公告', 'Micron の発表')}</Source>
          </>}
        </li>
        <li>
          <UtcTime timestamp={action.snapshotAt} /> · <Source href={action.announcement}>{t('Binance eligibility snapshot', 'Binance 资格快照', 'Binance の対象判定スナップショット')}</Source>
          {!split && <p className='mt-1'>{t(
            'Binance announced that dividends net of applicable taxes and costs would be reinvested. For on-chain holders, reinvestment is reflected in an adjustment to the display multiplier. The notice said MUB/USDT spot trading would continue as usual.',
            'Binance 公告称，股息扣除适用税费和成本后将再投资。对链上持有者，这笔再投资体现为显示乘数调整。MUB/USDT 现货交易按公告照常进行。',
            'Binance は、適用される税金と費用を差し引いた配当を再投資すると発表しました。オンチェーン保有者の再投資分は、表示倍率の調整に反映されます。同社の発表では、MUB/USDT の現物取引は通常どおり継続します。',
          )}</p>}
        </li>
        <li>
          {t('BNB Chain display units per raw token', 'BNB Chain 每个原始代币的显示单位', 'BNB Chain の未調整トークン1枚あたりの表示単位')}{' '}
          <span className='break-words font-mono'>{before.displayUnits} → {after.displayUnits}</span>
          <p className='mt-1 flex flex-wrap gap-x-3 gap-y-1'>
            <span><Source href={`https://bnbscan.com/blocks/${before.number}`}>{t('Prior block', '前一区块', '直前のブロック')} {before.number}</Source> · <UtcTime timestamp={before.timestamp} /></span>
            <span><Source href={`https://bnbscan.com/blocks/${after.number}`}>{t('First updated block', '首个已更新区块', '更新後の最初のブロック')} {after.number}</Source> · <UtcTime timestamp={after.timestamp} /></span>
          </p>
        </li>
        {split && <li><UtcTime timestamp={action.scheduledResumeAt} /> · {t('Binance scheduled trading resumption', 'Binance 公告的计划复牌时间', 'Binance が発表した取引再開予定')}{' · '}
          <Source href={action.announcement}>{t('SanDisk split and trading pause', 'SanDisk 拆股及暂停交易', 'SanDisk の株式分割と取引停止')}</Source></li>}
      </ol>
    </section>
  );
}

function PriceHistory({ closes, currency, locale, volumeUnit, availableIndicators = true }: { closes: Close[]; currency: string; locale: Locale; volumeUnit?: string; availableIndicators?: boolean }) {
  const t = getTranslator(locale);
  const first = closes[0];
  const last = closes.at(-1);
  if (!first || !last) return <p className='text-sm text-muted-foreground'>{t('No verified daily closes are available.', '当前缺少已核实的日线收盘价。', '確認できる日足終値はありません。')}</p>;
  const prices = closes.map((point) => point.close);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const span = Date.parse(last.day) - Date.parse(first.day);
  const maxVolume = Math.max(...closes.map(({ volume }) => volume ?? 0));
  const position = (day: string) => span ? 15 + (Date.parse(day) - Date.parse(first.day)) / span * 670 : 350;
  const points = closes.map((point) => {
    const x = position(point.day);
    const y = high === low ? 80 : 12 + (high - point.close) / (high - low) * 136;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const indicators = priceIndicators(closes);
  const label = t(`Daily closes in ${currency}`, `日线收盘价（${currency}）`, `日足終値（${currency}）`);
  return (
    <div className='space-y-3'>
      <figure className='border border-border bg-surface px-3 pb-3 pt-2'>
        <svg viewBox={`0 0 700 ${maxVolume ? 200 : 160}`} role='img' aria-label={label} className='h-auto w-full text-brand'>
          <path d='M15 12H685 M15 80H685 M15 148H685' className='stroke-border' strokeWidth='1' />
          {closes.length > 1
            ? <polyline points={points.join(' ')} fill='none' stroke='currentColor' strokeWidth='2' vectorEffect='non-scaling-stroke' />
            : <circle cx='350' cy='80' r='4' fill='currentColor' />}
          {maxVolume > 0 && closes.map(({ day, volume }) => {
            if (!volume) return null;
            const width = Math.min(8, 500 / closes.length);
            const height = volume / maxVolume * 34;
            return <rect key={day} x={position(day) - width / 2} y={193 - height} width={width} height={height} fill='currentColor' opacity='0.4' />;
          })}
        </svg>
        <figcaption className='flex flex-wrap items-baseline justify-between gap-1.5 text-[11px] text-muted-foreground'>
          <span>{label} · {closes.length} {t('observations', '个观测', '件の観測')} · {first.day} – {last.day}</span>
          <span className='font-mono'>{t('Latest close', '最近收盘', '最終終値')} {format(last.close, locale, currency)}</span>
          {last.volume !== undefined && <span className='font-mono'>{t('Latest daily volume', '最近日线成交量', '最終日足の出来高')} {format(last.volume, locale, volumeUnit ?? t('shares', '股', '口'))}</span>}
        </figcaption>
      </figure>
      {availableIndicators && (
        <MetricGrid items={[
          { label: 'MA20', value: format(indicators.ma20, locale, currency) },
          { label: 'MA50', value: format(indicators.ma50, locale, currency) },
          { label: 'MA200', value: format(indicators.ma200, locale, currency) },
          { label: 'RSI14', value: format(indicators.rsi14 === null ? null : Number(indicators.rsi14.toFixed(2)), locale) },
          { label: t('Drawdown from window high', '距窗口内最高收盘价', '対象期間の最高終値からの下落率'), value: formatChange(indicators.drawdownPct) },
        ]} />
      )}
    </div>
  );
}

function TradingViewChart({ symbol, exchange, locale, split }: {
  symbol: string; exchange: string; locale: Locale; split?: { day: string; label: string; url: string };
}) {
  const t = getTranslator(locale);
  const venue = exchange === 'NYSE ARCA' ? 'AMEX' : exchange === 'CBOE BZX' ? 'CBOE' : exchange;
  const spot = venue === 'BINANCE' && BINANCE_SPOT_CHARTS.has(symbol);
  if (!spot && (!['NASDAQ', 'NYSE', 'AMEX', 'CBOE'].includes(venue) || !/^[A-Z0-9.]{1,10}$/.test(symbol))) return null;
  const widgetLocale = locale === 'zh-CN' ? 'zh_CN' : locale;
  const title = spot
    ? t(`${symbol} Binance Spot price and volume`, `${symbol} Binance 现货价格与成交量`, `${symbol} Binance 現物の価格と出来高`)
    : t(`${symbol} underlying chart`, `${symbol} 原资产走势图`, `${symbol} 原資産チャート`);
  const summary = spot
    ? t('Open token price and volume chart', '展开代币价格与成交量图', 'トークンの価格・出来高チャートを表示')
    : t('Open underlying chart', '展开原资产走势图', '原資産チャートを表示');
  const source = spot ? `https://www.tradingview.com/symbols/${symbol}/?exchange=BINANCE`
    : `https://www.tradingview.com/symbols/${venue}-${symbol.replaceAll('.', '-')}/`;
  const config = { autosize: true, symbol: `${venue}:${symbol}`, interval: 'D', timezone: 'Etc/UTC', theme: 'light',
    style: '1', locale: widgetLocale, allow_symbol_change: false, hide_side_toolbar: true,
    studies: spot ? ['MASimple@tv-basicstudies'] : ['MASimple@tv-basicstudies', 'RSI@tv-basicstudies'],
    withdateranges: spot ? undefined : true };
  const technicals = TRADINGVIEW_TECHNICALS.get(config.symbol);
  const technicalsHost = technicals?.localized ? t('www', 'cn', 'jp') : 'www';
  const checkedSplit = config.symbol === 'NASDAQ:MUU' && config.interval === 'D' && config.timezone === 'Etc/UTC' ? split : undefined;
  const url = `https://www.tradingview-widget.com/embed-widget/advanced-chart/?locale=${widgetLocale}#${encodeURIComponent(JSON.stringify(config))}`;
  return (
    <div className='space-y-2' data-underlying-symbol={spot ? undefined : config.symbol}>
      <details className='border border-border bg-surface'>
        <summary className='cursor-pointer px-4 py-3 text-sm font-medium'>{summary}</summary>
        {!spot && (
          <p className='px-4 pb-2 text-xs text-muted-foreground'>
            {t('Moving average and RSI (14) are enabled by default. Values appear when enough history is available. Use the Indicators menu to customize the chart.', '图表默认开启均线和 RSI（14），历史样本充足时显示数值，可在「指标」菜单中调整。', '初期設定で移動平均線と RSI（14）が有効になり、履歴データが十分な場合に値が表示されます。「インジケーター」メニューで変更できます。')}{' '}
            {t('If ADJ appears at the bottom of the chart, select it to adjust for dividends.', '若图表底部显示 ADJ，可点击开启股息复权。', 'チャート下部に ADJ が表示される場合は、選択すると配当調整を適用できます。')}
          </p>
        )}
        <iframe src={url} title={title} loading='lazy' referrerPolicy='no-referrer' className='h-[420px] w-full border-0' />
      </details>
      <p className='text-[11px] text-muted-foreground'>
        <Source href={source}>TradingView</Source>
        {' · '}{spot ? t('Binance Spot chart', 'Binance 现货图表', 'Binance 現物チャート')
          : exchange === 'NYSE ARCA' ? 'NYSE Arca' : exchange === 'CBOE BZX' ? 'Cboe BZX' : exchange}
        {technicals && <>{' · '}
          <Source href={`https://${technicalsHost}.tradingview.com/symbols/${technicals.instrument}/technicals/`}>
            {t('View technical indicators on TradingView', '在 TradingView 查看技术指标', 'TradingView でテクニカル指標を見る')}
          </Source>
        </>}
        {' · '}{t('Data delay follows the vendor chart.', '行情延迟以图表提供方标注为准。', 'データの遅延は提供元の表示に従います。')}
        {!spot && !checkedSplit && <> {t('Adjustment basis is unverified for this embed.', '该嵌入图表的复权口径待核实。', 'この埋め込みチャートの調整基準は未確認です。')}</>}
      </p>
      {checkedSplit && (
        <p className='text-xs leading-relaxed text-muted-foreground'>
          {t(
            `TradingView reflects MUU’s ${checkedSplit.label} effective ${checkedSplit.day}. This was verified using the July 14 and July 15 daily closes.`,
            `TradingView 的 MUU 日线已反映 ${checkedSplit.day} 的 ${checkedSplit.label}。核验使用了 7 月 14 日与 15 日的收盘价。`,
            `TradingView の MUU 日足で、${checkedSplit.day} に実施された${checkedSplit.label}が反映されていることを、7月14日と15日の終値で確認しました。`,
          )} <Source href={checkedSplit.url}>{t('Direxion split notice', 'Direxion 拆股公告', 'Direxion の分割公告')}</Source>
        </p>
      )}
    </div>
  );
}

function exactPoolAmount(amount: string, numbers: Intl.NumberFormat) {
  const [whole, fraction] = amount.split('.');
  return `${numbers.format(BigInt(whole))}${fraction ? `.${fraction}` : ''}`;
}

function OnchainMarket({ ticker, address, venue, quote, depth, locale, hasChart = true, comparison }: {
  ticker: string; address: string; venue: string; quote: string; depth: DexPoolDepth | null; locale: Locale; hasChart?: boolean;
  comparison?: { feePips: number; registry: string; manager?: string };
}) {
  const t = getTranslator(locale);
  const pair = `${ticker}/${quote}`;
  const source = `https://www.geckoterminal.com/bsc/pools/${address}`;
  const title = t(`${pair} ${venue} pool chart`, `${pair} ${venue} 池走势图`, `${pair} ${venue} プールのチャート`);
  const numbers = new Intl.NumberFormat(locale);
  const decimal = (amount: string) => exactPoolAmount(amount, numbers);
  return (
    <section className='space-y-3' data-pool-depth-comparison={comparison ? true : undefined}>
      {!comparison && <h2 className='text-xl font-semibold'>{t('On-chain market', '链上市场', 'オンチェーン市場')}</h2>}
      {depth && (
        <div className='space-y-2'>
          <h3 className='text-sm font-semibold'>{depth.kind === 'marginal'
            ? t(`${venue} pool depth at ±1%`, `${venue} 交易池 ±1% 深度`, `${venue} プールの ±1% 取引深度`)
            : t('Metric pool depth by price band', 'Metric 分档深度', 'Metric の価格帯別取引深度')}</h3>
          <dl className='grid grid-cols-2 gap-px border border-border bg-border'>
            {[
              { side: 'buy', label: depth.kind === 'marginal' ? t(`Buy to +1% · ${quote} paid`, `买入至 +1% · 支付 ${quote}`, `買いで +1% 到達 · 支払う ${quote}`)
                : t('Buy · USDT paid', '买入 · 支付 USDT', '買い · 支払う USDT'), amount: depth.buyInQuote },
              { side: 'sell', label: depth.kind === 'marginal' ? t(`Sell to −1% · ${quote} received`, `卖出至 −1% · 收到 ${quote}`, `売りで −1% 到達 · 受け取る ${quote}`)
                : t('Sell · USDT received', '卖出 · 收到 USDT', '売り · 受け取る USDT'), amount: depth.sellOutQuote },
            ].map(({ side, label, amount }) => {
              const band = depth.kind === 'bands' ? (side === 'buy' ? depth.buy : depth.sell) : null;
              return (
                <div key={label} className='min-w-0 bg-surface px-3 py-3.5 sm:px-4'>
                  <dt className='text-[11px] leading-4 text-muted-foreground'>{label}</dt>
                  <dd className='mt-1'>
                    <span className='break-all font-mono text-[13px] tnum sm:text-[15px]'>{decimal(amount)} {quote}</span>
                    {band && <span className='mt-1 block break-words text-[11px] leading-4 text-muted-foreground'>
                      {t('Farthest simulated band', '最远试算档位', '試算した最遠の価格帯')} {band.farthestSimulatedBin} · ≈ {decimal(band.lowerPriceUsdt)}–{decimal(band.upperPriceUsdt)} USDT/{ticker}
                      <span className='block'>{t(`${band.simulatedBands} of ${band.returnedBands} returned bands independently simulated`, `返回 ${band.returnedBands} 档，实际独立试算 ${band.simulatedBands} 档`, `取得した ${band.returnedBands} 価格帯のうち ${band.simulatedBands} 件を個別に試算`)}</span>
                    </span>}
                  </dd>
                </div>
              );
            })}
          </dl>
          <p className='text-[11px] leading-relaxed text-muted-foreground'>
            <Source href={`https://bscscan.com/block/${depth.block.number}`}>{t('BNB Chain block', 'BNB Chain 区块', 'BNB Chain ブロック')} {numbers.format(depth.block.number)}</Source> · <time dateTime={depth.block.timestamp}>{depth.block.timestamp.replace('T', ' ').replace('Z', ' UTC')}</time>
          </p>
          <p className='text-[11px] leading-relaxed text-muted-foreground'>{depth.kind === 'marginal'
            ? t('These simulated swaps include pool fees. The ±1% limits refer to the pool’s marginal price.', '按该区块状态模拟交易，包含池手续费。±1% 以池内边际价格计。', 'このブロックの状態で手数料込みのスワップを試算しています。±1% はプールの限界価格を基準とします。')
            : <>{t('Cumulative amounts through each side’s farthest independently simulated band. Price bands include pool fees.', '金额累计至各方向最远的独立试算档位，价格区间已计入池手续费。', '売買それぞれで個別試算できた最遠の価格帯までの累計額です。価格帯には手数料を含みます。')} · <Source href={BSC_METRIC_DEPTH.ladder}>{t('Metric liquidity ladder', 'Metric 分档方法', 'Metric の価格帯計算')}</Source></>}
          </p>
        </div>
      )}
      {hasChart && <details className='border border-border bg-surface'>
        <summary className='cursor-pointer px-4 py-3 text-sm font-medium'>{t(`${venue} pool price and volume`, `${venue} 池价格与成交量`, `${venue} プールの価格と出来高`)}</summary>
        <iframe src={`${source}?embed=1&info=0&swaps=0&resolution=1d`} title={title} loading='lazy' referrerPolicy='no-referrer' className='h-[420px] w-full border-0' />
      </details>}
      <p className='text-[11px] text-muted-foreground'>{pair} · BNB Chain · {hasChart ? <Source href={source}>GeckoTerminal</Source>
        : <Source href={`https://bscscan.com/address/${comparison?.manager ?? address}`}>{comparison?.manager
          ? t('Pool manager', '池管理合约', 'プールの管理コントラクト') : t('Pool contract', '池合约', 'プールコントラクト')}</Source>}
        {comparison?.manager && <>{' · '}{t('Pool ID', '池 ID', 'プール ID')} <code className='break-all'>{address}</code></>}
        {comparison && <>{' · '}{t('Swap fee', '交易费率', 'スワップ手数料')} {format(comparison.feePips / 10_000, locale, '%')}{' · '}
          <Source href={comparison.registry}>{t('BNB Chain deployment', 'BNB Chain 部署信息', 'BNB Chain のデプロイ情報')}</Source></>}
      </p>
      {hasChart && quote === 'WBNB' && <p className='text-[11px] text-muted-foreground'>{t('GeckoTerminal uses a different symbol for this base token. See the chart for its price unit.', 'GeckoTerminal 对同一代币使用另一个简称。价格单位以图表显示为准。', 'GeckoTerminal では同じトークンが別の記号で表示されます。価格単位はチャート内の表示に従います。')}</p>}
    </section>
  );
}

function V2ReserveMarket({ ticker, reserves, locale }: { ticker: string; reserves: PancakeV2Reserves; locale: Locale }) {
  const t = getTranslator(locale);
  const { block, pool, quote, baseReserve, quoteReserve, buyInQuote, sellOutQuote, lastReserveAt } = reserves;
  const numbers = new Intl.NumberFormat(locale);
  const value = (amount: string | null, unit: string) => amount ? `${exactPoolAmount(amount, numbers)} ${unit}` : MISSING;
  const time = (timestamp: string) => <time dateTime={timestamp}>{timestamp.replace('T', ' ').replace(/(?:\.000)?Z$/, ' UTC')}</time>;
  return (
    <section className='space-y-3' data-v2-reserves>
      <div className='flex flex-wrap items-baseline justify-between gap-2'>
        <h2 className='text-xl font-semibold'>{t('PancakeSwap v2 pool reserves', 'PancakeSwap v2 池储备', 'PancakeSwap v2 のプールリザーブ')}</h2>
        <span className='text-xs text-muted-foreground'>{ticker}/{quote} · BNB Chain</span>
      </div>
      <MetricGrid items={[
        { label: t('Raw token reserve', '原始代币储备', '未調整トークンのリザーブ'), value: value(baseReserve, ticker) },
        { label: t('Quote asset reserve', '计价资产储备', '建値資産のリザーブ'), value: value(quoteReserve, quote) },
        { label: t('Modeled quote paid within +1%', '上移不超过 1% 的试算支出', '上昇 1% 以内の支払額試算'), value: value(buyInQuote, quote) },
        { label: t('Modeled quote received within −1%', '下移不超过 1% 的试算收入', '下落 1% 以内の受取額試算'), value: value(sellOutQuote, quote) },
      ]} />
      <p className='text-[11px] leading-relaxed text-muted-foreground'>
        <Source href={`https://bscscan.com/block/${block.number}`}>{t('Finalized BNB Chain block', 'BNB Chain 终局区块', 'BNB Chain の確定ブロック')} {numbers.format(block.number)}</Source> · {time(block.timestamp)} · {t('Last reserve update', '储备最近更新时间', 'リザーブの最終更新')} {time(lastReserveAt)} · <Source href={`https://bscscan.com/address/${pool}`}>{t('Pool contract', '池合约', 'プールコントラクト')}</Source>
      </p>
      <p className='text-[11px] leading-relaxed text-muted-foreground'>
        {t('The model uses changes in the reserve ratio at this block, the 0.25% pool fee and integer rounding. Actual execution depends on transfer rules and the pool state at trade time.', '试算以该区块的储备比值为基准，计入 0.25% 池手续费和整数舍入。实际成交取决于转账规则及成交时的池状态。', 'このブロックのリザーブ比率の変化を基準に、プール手数料 0.25% と整数丸めで試算しています。実際の約定はトークンの転送条件と取引時のプールの状態に左右されます。')}{' '}
        <Source href={BSC_PANCAKE_V2.model}>{t('PancakeSwap v2 model', 'PancakeSwap v2 计算方法', 'PancakeSwap v2 の計算方法')}</Source>
      </p>
    </section>
  );
}

function ConcentratedLiquidityMarket({ ticker, quotes, locale, venue }: {
  ticker: string; quotes: ConcentratedLiquidityQuotes; locale: Locale; venue: 'PancakeSwap Infinity CL' | 'Uniswap v4';
}) {
  const t = getTranslator(locale);
  const { block, poolId, lpFeePips, swapFeePips, fixedBuyOut, fixedSellOut, marginal } = quotes;
  const isUniswap = venue === 'Uniswap v4';
  const source = isUniswap ? BSC_UNISWAP_V4 : BSC_PANCAKE_INFINITY;
  const mode = marginal ? 'marginal' : 'fixed';
  const numbers = new Intl.NumberFormat(locale);
  const amount = (value: string, unit: string) => `${exactPoolAmount(value, numbers)} ${unit}`;
  const sides = marginal ? [
    { label: t('Buy to +1% · USDT paid', '买入至 +1% · 支付 USDT', '買いで +1% 到達 · 支払う USDT'), value: amount(marginal.buyInUsdt, 'USDT') },
    { label: t('Sell to −1% · USDT received', '卖出至 −1% · 收到 USDT', '売りで −1% 到達 · 受け取る USDT'), value: amount(marginal.sellOutUsdt, 'USDT') },
  ] : [
    { label: t(`Spend 1 USDT · Raw ${ticker} received`, `支付 1 USDT · 收到的 ${ticker} 原始数量`, `1 USDT を支払う · 受取 ${ticker} の未調整数量`), value: amount(fixedBuyOut, ticker) },
    { label: t(`Sell 0.01 ${ticker} in raw units · USDT received`, `卖出 0.01 ${ticker} 原始单位 · 收到 USDT`, `未調整の 0.01 ${ticker} を売却 · 受取 USDT`), value: amount(fixedSellOut, 'USDT') },
  ];
  return (
    <section className='space-y-3' data-infinity-quotes={isUniswap ? undefined : mode} data-uniswap-v4-quotes={isUniswap ? mode : undefined}>
      <div className='flex flex-wrap items-baseline justify-between gap-2'>
        <h2 className='text-xl font-semibold'>{marginal
          ? t(`${venue} depth at ±1%`, `${venue} ±1% 深度`, `${venue} の ±1% 取引深度`)
          : t(`${venue} fixed-size quotes`, `${venue} 固定金额报价`, `${venue} の固定数量見積もり`)}</h2>
        <span className='text-xs text-muted-foreground'>{ticker}/USDT · BNB Chain</span>
      </div>
      <MetricGrid items={[
        ...sides,
        { label: t('Pool LP fee', '池 LP 手续费', 'プールの LP 手数料'), value: format(lpFeePips / 10_000, locale, '%') },
        { label: swapFeePips >= 500_000 ? t('High total swap fee (incl. protocol)', '高额交易总费率（含协议费）', '高いスワップ手数料（プロトコル手数料込み）')
          : t('Total swap fee (incl. protocol)', '交易总费率（含协议费）', 'スワップ手数料（プロトコル手数料込み）'), value: format(swapFeePips / 10_000, locale, '%') },
      ]} />
      <p className='text-[11px] leading-relaxed text-muted-foreground'>
        <Source href={`https://bscscan.com/block/${block.number}`}>{t('Finalized BNB Chain block', 'BNB Chain 终局区块', 'BNB Chain の確定ブロック')} {numbers.format(block.number)}</Source>{' · '}
        <UtcTime timestamp={block.timestamp} />{' · '}
        <Source href={`https://bscscan.com/address/${source.manager}`}>{t('Pool manager', '池管理合约', 'プールの管理コントラクト')}</Source>{' · '}
        {t('Pool ID', '池 ID', 'プール ID')} <code className='break-all'>{poolId}</code>
      </p>
      <p className='text-[11px] leading-relaxed text-muted-foreground'>
        {marginal && <>{t('Each side uses the smallest input that reaches the 1% change in the pool’s marginal price.', '买卖各取使池内边际价格达到 1% 变动的最小输入量。', '売買それぞれで、プールの限界価格が 1% 変動する最小の入力数量を使用しています。')}{' '}</>}
        {t('The simulation includes pool fees and uses raw ERC-20 token units at this block.', '本次模拟按该区块状态计算，计入池手续费，代币数量按 ERC-20 合约原始单位计。', 'このブロックの状態でプール手数料を含めて試算し、ERC-20 トークンの未調整単位を使用しています。')}{' '}
        <Source href={source.abi}>{isUniswap ? 'V4Quoter' : 'CLQuoter'}</Source>
        {isUniswap && <>{' · '}<Source href={source.registry}>{t('BNB Chain deployment', 'BNB Chain 部署信息', 'BNB Chain のデプロイ情報')}</Source></>}
      </p>
    </section>
  );
}

export function BstocksStudyView({ instrument, locale }: { instrument: Instrument; locale: Locale }) {
  const data = getBstockStudy(instrument);
  if (!data) return null;
  const { market, facts, filings, exchange, history, premium, pool, depth, supplementalDepth, poolDepthComparison, v2Reserves, infinityQuotes, uniswapQuotes, displayUnits, certificate, prospectuses, corporateAction, binanceUnderlying } = data;
  const { ticker, underlying } = instrument;
  const t = getTranslator(locale);
  const certificateText = certificate && {
    share: t(`One effective certificate represents one ${certificate.symbol} share.`, `每份有效凭证对应 1 股 ${certificate.symbol}。`, `有効な証券1口は ${certificate.symbol} の1株に相当します。`),
    'fund-unit': t(`One effective certificate represents one unit in the ${certificate.symbol} fund.`, `每份有效凭证对应 1 份 ${certificate.symbol} 基金份额。`, `有効な証券1口は ${certificate.symbol} ファンドの1口に相当します。`),
    adr: t(`One effective certificate represents one ${certificate.symbol} ADR.`, `每份有效凭证对应 1 份 ${certificate.symbol} 美国存托凭证（ADR）。`, `有効な証券1口は ${certificate.symbol} の米国預託証券（ADR）1口に相当します。`),
    ads: t(`One effective certificate represents one ${certificate.symbol} ADS.`, `每份有效凭证对应 1 份 ${certificate.symbol} 美国存托股份（ADS）。`, `有効な証券1口は ${certificate.symbol} の米国預託株式（ADS）1口に相当します。`),
  }[certificate.kind];
  const fundSplit = facts?.fund?.split;
  const verifiedSplit = ticker === 'MUUB' && fundSplit?.day === '2026-07-15' && fundSplit.ratio === '20:1'
    ? { ...fundSplit, label: t('20-for-1 forward split', '1 拆 20', '1口を20口にする分割') }
    : undefined;
  const metricItems = (metrics: Measure[]) => metrics.flatMap(({ key, amount, unit }) => {
    const labels = METRIC_NAMES[key as keyof typeof METRIC_NAMES];
    return labels ? [{ label: t(labels[0], labels[1], labels[2]), value: format(amount, locale, unit, Math.abs(amount) >= 1_000_000), detail: format(amount, locale, unit) }] : [];
  });
  const trailing = (['revenue', 'netIncome'] as const).flatMap((key) => {
    const result = trailingTwelveMonths(filings, key);
    if (!result) return [];
    const label = key === 'revenue' ? t('Trailing 12-month revenue', '过去 12 个月营收', '直近12カ月の売上高')
      : t('Trailing 12-month net income', '过去 12 个月净利润', '直近12カ月の純利益');
    return [{ ...result, label }];
  });
  const filingPeriods = new Map<string, typeof filings>();
  for (const filing of filings) {
    const interval = `${filing.period}/${filing.start}/${filing.end}`;
    const period = filingPeriods.get(interval) ?? [];
    period.push(filing);
    filingPeriods.set(interval, period);
  }
  const book = market?.book;
  const quote = market?.quote;
  const closes = market?.closes ?? [];
  const spotSymbol = `${ticker}USDT`;
  const issuerUrl = facts?.cik ? `https://www.sec.gov/edgar/browse/?CIK=${facts.cik}` : undefined;
  const status = market?.status === 'TRADING' ? t('Trading', '交易中', '取引中') : market ? t('Trading paused', '暂停交易', '取引停止中') : t('Status unavailable', '交易状态待确认', '取引状況は未確認');

  return (
    <section aria-label={t('Instrument research detail', '标的研究详情', '銘柄の調査詳細')} data-study-ticker={ticker} className='border-b border-border'>
      <div className='mx-auto max-w-[1240px] space-y-8 px-4 py-8 sm:px-8'>
        <section className='space-y-3'>
          <div className='flex flex-wrap items-baseline justify-between gap-2'>
            <h2 className='text-xl font-semibold'>{t('Token market', '代币市场', 'トークン市場')}</h2>
            <span className='text-xs text-muted-foreground'><Source href={`https://www.binance.com/en/trade/${ticker}_USDT`}>Binance Spot</Source> · {ticker}/USDT · {status}</span>
          </div>
          <MetricGrid items={[
            { label: t('Last price', '最近成交价', '最終約定価格'), value: format(quote?.price, locale, 'USDT') },
            { label: t('24h change', '24h 涨跌', '24時間騰落率'), value: formatChange(quote?.change) },
            { label: t('24h quote volume', '24h 计价成交额', '24時間の取引代金'), value: format(quote?.quoteVolume, locale, 'USDT', true), detail: format(quote?.quoteVolume, locale, 'USDT') },
            { label: t('24h units traded', '24h 代币成交数量', '24時間出来高'), value: format(quote?.baseVolume, locale, ticker, true) },
            { label: t('Best bid / ask', '最优买价 / 卖价', '最良買い / 売り気配'), value: book ? `${format(book.bestBid, locale)} / ${format(book.bestAsk, locale, 'USDT')}` : MISSING },
            { label: t('Bid–ask spread', '买卖价差', '売買スプレッド'), value: format(book ? Number(book.spreadBps.toFixed(2)) : undefined, locale, 'bps') },
            { label: t('Bid depth within 1%', '中间价下方 1% 的买盘深度', '仲値から下1%以内の買い板'), value: format(book?.bidDepth, locale, 'USDT', true), detail: format(book?.bidDepth, locale, 'USDT') },
            { label: t('Ask depth within 1%', '中间价上方 1% 的卖盘深度', '仲値から上1%以内の売り板'), value: format(book?.askDepth, locale, 'USDT', true), detail: format(book?.askDepth, locale, 'USDT') },
          ]} />
          <p className='text-[11px] leading-relaxed text-muted-foreground'>
            {market && `${t('Market status checked', '市场状态核验于', '市場状況の確認日時')} ${market.asOf} · `}
            {quote ? `${t('24h window ended', '24h 窗口截至', '24時間集計の終了時刻')} ${quote.observedAt} · ${format(quote.trades, locale)} ${t('trades', '笔成交', '件の約定')} · ` : ''}
            {book ? `${t('Book observed', '盘口观测于', '板の取得時刻')} ${book.observedAt} · ${book.bidLevels}/${book.askLevels} ${t('bid/ask levels', '档买盘/卖盘', '買い/売り気配段数')} · ` : ''}
            {book && (!book.bidCoversWindow || !book.askCoversWindow)
              ? t('Depth covers the returned levels within 1%. One or both sides stop within the window.', '深度为已返回档位中落在 1% 窗口内的金额，至少一侧档位未覆盖窗口外缘。', '板の厚みは取得した気配のうち1%以内の金額です。少なくとも片側は範囲の端まで取得できていません。')
              : market ? t('Dated Binance spot observations.', '以上为 Binance 现货分时观测。', 'Binance 現物の取得時点の値です。')
                : t('A Binance market snapshot is unavailable for this export.', '本次导出暂缺 Binance 市场观测。', '今回のエクスポートには Binance 市場の観測値がありません。')}
            {market && <> · <Source href={`${BINANCE_MARKET_SOURCE}/exchangeInfo?symbol=${market.symbol}`}>{t('Market identity', '市场身份', '市場データ')}</Source></>}
          </p>
          {instrument.chains.includes('BNB Chain') && <div className='space-y-1 border border-border bg-surface px-4 py-3' data-bstock-display-units>
            <h3 className='text-sm font-semibold'>{t('Display units per raw on-chain token', '每个链上原始代币对应的显示单位', 'オンチェーンの未調整トークン1枚あたりの表示単位')} <span className='ml-1 break-all font-mono'>{displayUnits?.multiplier ?? MISSING}</span></h3>
            {displayUnits ? <>
              <p className='text-xs text-muted-foreground'>
                <Source href={`https://bscscan.com/block/${displayUnits.block.number}`}>{t('Finalized BNB Chain block', 'BNB Chain 终局区块', 'BNB Chain の確定ブロック')} {displayUnits.block.number}</Source> · <UtcTime timestamp={displayUnits.block.timestamp} /> · <Source href={BEP_677_STANDARD}>BEP-677</Source>
              </p>
              <p className='text-xs text-muted-foreground'>{t('Binance uses display units for balances and spot trades.', 'Binance 的余额和现货交易采用显示单位。', 'Binance の残高と現物取引には表示単位が使われます。')}{' '}<Source href={BINANCE_DISPLAY_UNIT_SOURCE}>{t('Binance unit definitions', 'Binance 单位说明', 'Binance の単位定義')}</Source></p>
            </> : <p className='text-xs text-muted-foreground'>{t('The token’s display multiplier is unavailable at a verified block.', '暂缺该代币在已核实区块的显示单位系数。', '確認済みのブロックでトークンの表示倍率を取得できていません。')}</p>}
            {certificate && <p className='text-xs text-muted-foreground'>
              {certificateText}{' '}
              <Source href={certificate.url}>{t('Issuer prospectus', '发行方招股文件', '発行体の目論見書')}</Source>
            </p>}
          </div>}
          {corporateAction && <CorporateActionTimeline action={corporateAction} locale={locale} />}
          {!closes.length && BINANCE_SPOT_CHARTS.has(spotSymbol)
            ? <TradingViewChart symbol={spotSymbol} exchange='BINANCE' locale={locale} />
            : <PriceHistory closes={closes} currency='USDT' locale={locale} volumeUnit={ticker} availableIndicators={market?.status === 'TRADING'} />}
          {!!closes.length && <p className='text-[11px] text-muted-foreground'>{t('Token series uses closed UTC spot candles with trades. Moving averages and drawdown use the displayed price window in native units.', '代币走势采用 UTC 已收盘且有成交的现货日线。均线和回撤基于图示窗口及原生计价单位。', 'トークンの推移は UTC 日足が確定し約定がある現物データです。移動平均と下落率は表示期間と元の建値で計算します。')}</p>}
        </section>

        {pool && <OnchainMarket ticker={ticker} address={pool.pool} venue={pool.venue} quote={pool.quote.symbol} depth={depth} locale={locale} />}
        {supplementalDepth && <OnchainMarket ticker={ticker} address={supplementalDepth.pool} venue={supplementalDepth.venue} quote='USDT' depth={supplementalDepth.proof} locale={locale} hasChart={false} />}
        {poolDepthComparison && <OnchainMarket ticker={ticker} address={poolDepthComparison.address} venue={poolDepthComparison.venue}
          quote={poolDepthComparison.quote} depth={poolDepthComparison.proof} locale={locale} hasChart={false} comparison={poolDepthComparison} />}
        {v2Reserves && <V2ReserveMarket ticker={ticker} reserves={v2Reserves} locale={locale} />}
        {infinityQuotes && <ConcentratedLiquidityMarket ticker={ticker} quotes={infinityQuotes} locale={locale} venue='PancakeSwap Infinity CL' />}
        {uniswapQuotes && <ConcentratedLiquidityMarket ticker={ticker} quotes={uniswapQuotes} locale={locale} venue='Uniswap v4' />}

        <section className='space-y-3'>
          <h2 className='text-xl font-semibold'>{t('Underlying market', '原资产行情', '原資産の相場')}{underlying.symbol ? ` · ${underlying.symbol}` : ''}</h2>
          {history ? (
            <>
              <p className='text-xs text-muted-foreground'>{history.adjustment === 'split-and-dividend' ? t('Split and dividend adjusted', '拆股与股息复权', '分割・配当調整済み') : t('Split adjusted', '拆股复权', '分割調整済み')} · <Source href={history.source}>{t('Price source', '价格来源', '価格の出典')}</Source> · {history.observedAt}</p>
              <PriceHistory closes={history.closes} currency={history.currency} locale={locale} />
            </>
          ) : (
            <>
              <p className='text-sm text-muted-foreground'>{t('This site’s snapshot has no adjusted underlying closes for calculating its own indicators.', '本站快照暂缺原资产复权收盘价及据此计算的指标。', 'サイト内のスナップショットでは、原資産の調整済み終値と、それに基づく指標が未取得です。')}</p>
              {underlying.symbol && exchange && <TradingViewChart symbol={underlying.symbol} exchange={exchange} locale={locale} split={verifiedSplit} />}
            </>
          )}
          {binanceUnderlying && <div className='space-y-2' data-binance-underlying-quote={binanceUnderlying}>
            <BinanceUnderlyingQuote key={binanceUnderlying} symbol={binanceUnderlying} locale={locale} />
            <p className='text-[11px] text-muted-foreground'>
              {t('USD quotes and trading sessions follow Binance. The widget is displayed in English.', '美元报价和交易时段以 Binance 为准。组件内容为英文。', '米ドル建ての価格と取引時間は Binance の表示に従います。ウィジェットは英語で表示されます。')}{' '}
              <Source href={`https://www.binance.com/en/stocks/EQ_${binanceUnderlying}`}>{t('View the underlying on Binance', '在 Binance 查看原资产', 'Binance で原資産を確認')}</Source>
            </p>
          </div>}
          <div className='border border-border bg-surface px-4 py-3'>
            <h3 className='text-sm font-semibold'>{t('Token premium / discount', '代币溢折价', 'トークンのプレミアム・ディスカウント')} <span className='ml-2 font-mono'>{formatChange(premium?.percent)}</span></h3>
            {premium ? (
              <div className='mt-2 space-y-1 text-xs text-muted-foreground'>
                {premium.basis === 'period-end' && <p>{t('Token and USDT/USD use the last completed minute before the equity close', '代币及 USDT/USD 采用原资产收盘前最后一个完整分钟的收盘价', 'トークンと USDT/USD は原資産の取引終了直前に確定した1分足の終値を使用')} · {premium.windowStart} – {premium.at}</p>}
                <p>{t('Equity close', '原资产收盘', '原資産の取引終了')} {premium.at} · <Source href={premium.tokenSource}>{format(premium.tokenPrice, locale, 'USDT')}</Source> × <Source href={premium.fxSource}>{format(premium.usdPerUsdt, locale, 'USD/USDT')}</Source> / (<Source href={premium.equitySource}>{format(premium.equityPrice, locale, 'USD')}</Source> × <Source href={premium.ratioSource}>{premium.sharesPerToken} {t('underlying units per quoted token unit', '原资产份额 / 代币报价单位', 'トークンの提示価格1単位当たりの原資産口数')}</Source>) − 1</p>
              </div>
            ) : <p className='mt-1 text-xs text-muted-foreground'>{t('This calculation requires the raw equity close, corresponding token and USDT/USD quotes at the same instant or from the last completed minute, and an effective conversion ratio.', '计算需要原资产未复权收盘价、同一时点或收盘前最后一个完整分钟的代币和 USDT/USD 报价，以及有效换算比例。', '計算には原資産の未調整終値、同時刻または取引終了直前の確定した1分間のトークンと USDT/USD の価格、有効な換算比率が必要です。')}</p>}
          </div>
        </section>

        <section className='space-y-3'>
          <h2 className='text-xl font-semibold'>{t('Underlying fundamentals', '原资产基本面', '原資産のファンダメンタルズ')}</h2>
          {prospectuses && <div data-bstock-prospectuses className='space-y-2 border border-border bg-surface px-4 py-3'>
            <div className='flex flex-wrap items-baseline justify-between gap-2'>
              <h3 className='text-sm font-semibold'>{t('Issuer prospectuses', '发行方招股文件', '発行体の目論見書')}</h3>
              <span className='text-xs text-muted-foreground'><Source href={ADGM_PROSPECTUS_DIRECTORY}>{t('ADGM directory', 'ADGM 目录', 'ADGM の一覧')}</Source></span>
            </div>
            <ul className='space-y-1 text-xs text-muted-foreground'>
              {[prospectuses.primary, ...prospectuses.supplementary].map(({ url, approvalDay }, index) => <li key={url}>
                <Source href={url}>{index === 0 ? t('Primary prospectus', '主招股文件', '本目論見書')
                  : t('Supplementary prospectus', '补充招股文件', '補足目論見書')}</Source>
                {' · '}{t('ADGM approval date', 'ADGM 核准日期', 'ADGM の承認日')} <time dateTime={approvalDay}>{approvalDay}</time>
              </li>)}
            </ul>
          </div>}
          {facts?.fund && (
            <div className='space-y-2'>
              <p className='text-xs text-muted-foreground'>
                {facts.fund.structure === 'closed-end' && `${t('Closed-end fund', '封闭式基金', 'クローズドエンド型ファンド')} · `}
                <Source href={facts.fund.url}>{t('Fund issuer', '基金发行方', 'ファンド運用会社')}</Source> · {facts.fund.day}
                {facts.fund.benchmark && <> · {t('Reference asset or index', '参考标的或指数', '参照資産・指数')} {facts.fund.benchmark}</>}
                {facts.fund.feeSource && <> · <Source href={facts.fund.feeSource}>{t('Expense ratio source', '费率来源', '経費率の出典')}</Source></>}
              </p>
              <MetricGrid items={metricItems(facts.fund.metrics)} />
              {fundSplit && <p className='text-xs text-muted-foreground'><Source href={fundSplit.url}>{t('Underlying fund split', '底层基金拆股', '原資産ファンドの分割')}</Source> · {fundSplit.day} · {verifiedSplit?.label ?? fundSplit.ratio}</p>}
            </div>
          )}
          {!!filings.length && (
            <div className='space-y-2'>
              {!!trailing.length && (
                <>
                  <MetricGrid items={trailing.map(({ label, amount, end, unit }) => ({
                    label: `${label} · ${end}`, value: format(amount, locale, unit, true), detail: format(amount, locale, unit),
                  }))} />
                  <details className='border border-border bg-background'>
                    <summary className='cursor-pointer px-4 py-3 text-xs font-medium'>{t('Calculation and filing sources', '计算明细与财报来源', '計算明細と提出書類の出典')}</summary>
                    <div className='space-y-3 px-4 pb-4 text-xs text-muted-foreground'>
                      {trailing.map(({ label, start, end, tag, method, components }) => (
                        <div key={label} className='space-y-1.5'>
                          <p className='font-medium'>{label} · {start} – {end}</p>
                          <p>{method === 'four-quarters' ? t('Four consecutive fiscal quarters', '四个连续财季', '連続する4四半期')
                            : t('Prior fiscal year + current year to date − comparable prior year to date', '上一完整财年 + 本财年累计 − 上财年同期累计', '前事業年度 + 当年度累計 − 前年度同期間の累計')} · <code>{tag}</code></p>
                          <ul className='space-y-1'>
                            {components.map(({ filing, amount, unit, sign }) => (
                              <li key={`${filing.start}/${filing.end}`}>{sign === 1 ? '+' : '−'} {format(amount, locale, unit)} · {filing.start} – {filing.end} · <Source href={filing.url}>{filing.form}</Source></li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </details>
                </>
              )}
              {[...filingPeriods.entries()].map(([interval, [filing, ...supplements]], index) => (
                <details key={interval} open={index === 0} className='border border-border bg-background'>
                  <summary className='cursor-pointer px-4 py-3 text-sm font-medium'>
                    {filing.period === 'quarter' ? t('Quarter', '单季', '四半期') : filing.period === 'year' ? t('Fiscal year', '财年', '事業年度') : t('Interim period', '中期报告期间', '期中')} · {filing.start} – {filing.end}
                  </summary>
                  <div className='space-y-3 px-4 pb-4'>
                    {[filing, ...supplements].map((source) => (
                      <div key={`${source.url}/${source.metrics[0]?.unit}`} className='space-y-2'>
                        <p className='text-xs text-muted-foreground'>
                          {t('Filed', '披露于', '提出日')} {source.filed} · <Source href={source.url}>{source.form}</Source>
                          {(source.unaudited || source.form === '424B4') && ` · ${source.period === 'year'
                            ? t('Unaudited full-year statement', '未经审计的全年财务报表', '未監査の通期財務諸表')
                            : t('Unaudited interim statement', '未经审计的中期报表', '未監査の期中財務諸表')}`}
                        </p>
                        <MetricGrid items={metricItems(source.metrics)} />
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          )}
          {!facts?.fund && !filings.length && <p className='text-sm text-muted-foreground'>{t('Structured issuer figures are unavailable for this underlying.', '当前缺少该原资产的可核实结构化财务数据。', 'この原資産の構造化された財務データは未取得です。')}{issuerUrl && <> · <Source href={issuerUrl}>SEC EDGAR</Source></>}</p>}
        </section>
      </div>
    </section>
  );
}
