import { localizedPageMetadata } from '@/lib/localized-metadata';
import { getTranslator, localizeHref, type Locale } from '@/lib/i18n';
import { DATA } from '@/data/resume';
import {
  AAPL_CASE_STUDY,
  ACTIVITY_DIVERGENCE,
  DATA_AS_OF,
  GRADE_RUBRIC,
  ISSUERS,
  MARKET_SNAPSHOTS,
  PERPS_NOTE,
  REGULATORY_NOTES,
  RISKS,
  RISK_WEIGHTS,
  TOP_TOKENS,
  TWO_PATHS,
  UNDERLYING_CONCENTRATION,
  VENUES,
  VETO_CHECKS,
  WATCH_SIGNALS,
  WRAPPER_RUBRIC,
  type Grade,
} from '@/data/tokenized-equities';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = localizedPageMetadata('/stocks', 'en', {
  title: 'Tokenized Equities',
  description:
    'A tracker for tokenized US equities: legal wrapper, custody, proof of reserve, redemption, trading hours and real order-book depth — per issuer, per instrument.',
});

const usd = (value?: number) => {
  if (value === undefined) return '—';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value}`;
};

const GRADE_TONE: Record<Grade, string> = {
  A: 'border-positive text-positive',
  B: 'border-brand text-brand',
  C: 'border-border-strong text-muted-foreground',
  D: 'border-negative text-negative',
  unrated: 'border-border text-subtle',
};

const SEVERITY_TONE = {
  high: 'border-negative text-negative',
  medium: 'border-brand text-brand',
  low: 'border-border text-subtle',
} as const;

const issuerName = (slug: string | null) =>
  slug ? ISSUERS.find((i) => i.slug === slug)?.name ?? slug : null;

const TH = 'border-b border-border-strong px-3 py-2.5 text-left font-mono text-[10.5px] font-normal uppercase tracking-[0.12em] text-subtle';

export default async function Page() { return renderPage('en'); }

export async function renderPage(locale: Locale) {
  const t = getTranslator(locale);
  const href = (url: string) => localizeHref(url, locale);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Tokenized US equities tracker',
    description:
      'Issuer-level and instrument-level attributes for tokenized US equities: legal wrapper, custody, proof of reserve, redemption terms and order-book depth.',
    url: `${DATA.url}${href('/stocks')}`,
    creator: { '@type': 'Person', name: DATA.name, url: DATA.url },
    temporalCoverage: DATA_AS_OF,
  };

  return (
    <div>
      <script type='application/ld+json' suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className='border-b border-border'>
        <div className='mx-auto max-w-[1240px] px-4 pb-12 pt-14 sm:px-8'>
          <div className='mb-6 flex items-center gap-2.5'>
            <span aria-hidden='true' className='block size-1.5 bg-positive' />
            <span className='mono-label'>{t('On-chain equities', '链上美股', 'オンチェーン米国株')}</span>
          </div>

          <h1 className='mb-4 max-w-[820px] text-[30px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[42px] sm:leading-[1.12]'>
            {t('A tokenized stock is not a stock', '代币化股票不是股票', 'トークン化株式は株式ではない')}
          </h1>
          <p className='mb-8 max-w-[700px] text-[15px] leading-[1.75] text-muted-foreground sm:text-base'>
            {t(
              'Most tokenized equities are a claim on the issuer, not the share. An instrument’s identity is underlying + issuer + legal wrapper + chain + contract address + venue — six fields, not a ticker.',
              '大多数链上美股是对发行方的一张债权凭证，不是股票本身。真正的资产身份是：底层股票 + 发行方 + 法律包装 + 链 + 合约地址 + 交易场所 —— 六个字段，不是一个代码。',
              'トークン化株式の多くは株式ではなく発行体への請求権です。資産の正体は、原資産 + 発行体 + 法的ラッパー + チェーン + コントラクトアドレス + 取引場所の六項目です。'
            )}
          </p>

          <div className='rounded border border-brand/40 bg-surface p-4'>
            <div className='mono-label mb-2 text-brand'>{t('Data age', '数据时效', 'データの鮮度')}</div>
            <p className='text-[13.5px] leading-[1.7] text-muted-foreground'>
              {t(
                `Figures measured on or before ${DATA_AS_OF}, except the AAPL case study, which is dated separately. Depth, spread and market share move within days — read these as research snapshots, not live quotes.`,
                `数字观测截止日为 ${DATA_AS_OF}，AAPL 案例另有标注日期。这个赛道的深度、价差和份额以天为单位变化，请当作研究快照而不是实时报价。`,
                `数値は ${DATA_AS_OF} 時点（AAPL のケースは別途記載）。板の厚み・スプレッド・シェアは数日で変わるため、リアルタイムの気配ではなく調査スナップショットとして扱ってください。`
              )}
            </p>
          </div>
        </div>
      </section>

      <div className='mx-auto max-w-[1240px] px-4 sm:px-8'>

        {/* ── 市场规模 ─────────────────────────────────────────── */}
        <section className='border-b border-border py-12'>
          <h2 className='mb-2 text-xl font-semibold tracking-[-0.015em]'>
            {t('Market size', '市场规模', '市場規模')}
          </h2>
          <p className='mb-6 max-w-[700px] text-[14px] leading-[1.7] text-muted-foreground'>
            {t(
              'Two methodologies, two totals. The gap is scope, not error — one counts shares registered on-chain, the other only third-party wrappers.',
              '两种口径，两个总量。差距来自统计范围而不是错误 —— 一个把链上登记的股份也算进来，另一个只统计第三方包装的代币。',
              '二つの基準で総額が異なります。差は誤りではなく範囲 —— 一方はオンチェーン登記株を含み、他方は第三者ラッパーのみを数えます。'
            )}
          </p>

          <div className='mb-6 grid gap-5 sm:grid-cols-2'>
            {MARKET_SNAPSHOTS.map((snap) => (
              <div key={snap.source} className='rounded border border-border bg-surface p-5'>
                <div className='mb-1 flex items-baseline justify-between gap-3'>
                  <span className='tnum font-mono text-[12px] tracking-[0.08em]'>{snap.date}</span>
                  <Link href={snap.sourceUrl} target='_blank' rel='noopener' className='font-mono text-[11px] text-subtle hover:text-foreground'>
                    {snap.source} ↗
                  </Link>
                </div>
                <p className='mb-4 font-mono text-[10.5px] leading-[1.6] text-subtle'>{snap.scope}</p>
                {snap.metrics.map((m) => (
                  <div key={m.label} className='flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-0'>
                    <span className='text-[13px] text-muted-foreground'>{m.label}</span>
                    <span className='flex shrink-0 items-baseline gap-2'>
                      <span className='tnum font-mono text-[13.5px] font-medium'>{m.value}</span>
                      {m.delta && (
                        <span className={`tnum font-mono text-[11px] ${m.delta.startsWith('−') ? 'text-negative' : 'text-positive'}`}>
                          {m.delta}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* 活跃度背离 */}
          <div className='rounded border border-negative/40 bg-surface p-5'>
            <div className='mono-label mb-3 text-negative'>
              {t('Market cap up, usage down', '市值在涨，活跃度在跌', '時価総額は上昇、利用は低下')}
            </div>
            <div className='mb-3 flex flex-wrap gap-8'>
              {[
                { label: t('Market cap', '市值', '時価総額'), value: ACTIVITY_DIVERGENCE.marketCap },
                { label: t('Transfers', '转账量', '送金量'), value: ACTIVITY_DIVERGENCE.transfers },
                { label: t('Active addresses', '月活地址', 'アクティブアドレス'), value: ACTIVITY_DIVERGENCE.activeAddresses },
              ].map((item) => (
                <div key={item.label}>
                  <div className={`tnum font-mono text-[22px] font-medium ${item.value.startsWith('−') ? 'text-negative' : 'text-positive'}`}>
                    {item.value}
                  </div>
                  <div className='mono-label mt-1'>{item.label} · 30d</div>
                </div>
              ))}
            </div>
            <p className='text-[13.5px] leading-[1.7] text-muted-foreground'>{ACTIVITY_DIVERGENCE.reading}</p>
          </div>
        </section>

        {/* ── 你买的到底是什么 ─────────────────────────────────── */}
        <section className='border-b border-border py-12'>
          <h2 className='mb-2 text-xl font-semibold tracking-[-0.015em]'>
            {t('What you actually hold', '你买的到底是什么', '実際に保有するもの')}
          </h2>
          <p className='mb-6 max-w-[700px] text-[14px] leading-[1.7] text-muted-foreground'>
            {t(
              'Four structures sit behind the same ticker. They differ in dividends, voting, collateral and what happens if the issuer fails.',
              '同一个股票代码背后有四种结构。它们在分红、投票权、抵押品，以及发行方违约时你能拿回什么上，完全不同。',
              '同じティッカーの裏に四つの構造があります。配当、議決権、担保、発行体が破綻した場合の扱いが異なります。'
            )}
          </p>
          <div className='grid gap-px border border-border bg-border sm:grid-cols-2'>
            {WRAPPER_RUBRIC.map((item) => (
              <div key={item.kind} className='bg-background p-5'>
                <div className='mb-2 font-mono text-[11px] tracking-[0.12em] text-brand'>{item.label.toUpperCase()}</div>
                <p className='text-[13.5px] leading-[1.7] text-muted-foreground'>{item.meaning}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 发行方 ───────────────────────────────────────────── */}
        <section className='border-b border-border py-12'>
          <h2 className='mb-6 text-xl font-semibold tracking-[-0.015em]'>{t('Issuers', '发行方', '発行体')}</h2>

          <div className='overflow-x-auto'>
            <table className='w-full min-w-[920px] border-collapse border border-border text-[13px]'>
              <thead>
                <tr>
                  {[
                    t('Issuer', '发行方', '発行体'),
                    t('Wrapper', '法律包装', 'ラッパー'),
                    t('Voting', '投票权', '議決権'),
                    t('Dividend', '股息', '配当'),
                    t('Redemption', '赎回', '償還'),
                    t('PoR', '储备证明', '準備金証明'),
                    t('US', '美国', '米国'),
                    t('On-chain', '链上规模', 'オンチェーン'),
                    t('Grade', '评级', '評価'),
                  ].map((h) => <th key={h} className={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {ISSUERS.map((issuer) => (
                  <tr key={issuer.slug} className='border-b border-border align-top last:border-0'>
                    <td className='px-3 py-3'>
                      <div className='font-semibold'>{issuer.name}</div>
                      <div className='mt-0.5 font-mono text-[10.5px] text-subtle'>{issuer.jurisdiction}</div>
                      {issuer.instrumentCount !== undefined && (
                        <div className='tnum mt-0.5 font-mono text-[10.5px] text-subtle'>
                          {issuer.instrumentCount}+ {t('instruments', '个标的', '銘柄')}
                        </div>
                      )}
                    </td>
                    <td className='px-3 py-3 font-mono text-[11px] text-muted-foreground'>{issuer.wrapper}</td>
                    <td className={`px-3 py-3 font-mono text-[11px] ${issuer.voting === 'full' ? 'text-positive' : issuer.voting === 'none' ? 'text-negative' : 'text-muted-foreground'}`}>
                      {issuer.voting}
                    </td>
                    <td className='px-3 py-3 font-mono text-[11px] text-muted-foreground'>{issuer.dividend}</td>
                    <td className='px-3 py-3 font-mono text-[11px] text-muted-foreground'>
                      {issuer.redemption.available === 'unknown' ? 'unknown' : issuer.redemption.available ? 'yes' : 'no'}
                      {issuer.redemption.minimumUsd !== undefined && (
                        <span className='tnum block text-subtle'>min {usd(issuer.redemption.minimumUsd)}</span>
                      )}
                      {issuer.redemption.refusable && <span className='block text-negative'>refusable</span>}
                    </td>
                    <td className='px-3 py-3 font-mono text-[11px] text-muted-foreground'>{issuer.proofOfReserve.kind}</td>
                    <td className={`px-3 py-3 font-mono text-[11px] ${issuer.usPersons === 'accredited' ? 'text-positive' : issuer.usPersons === 'blocked' ? 'text-negative' : 'text-muted-foreground'}`}>
                      {issuer.usPersons}
                    </td>
                    <td className='tnum px-3 py-3 text-right font-mono text-[12px]'>{usd(issuer.onchainValueUsd)}</td>
                    <td className='px-3 py-3'>
                      <span className={`inline-block rounded-sm border px-2 py-0.5 font-mono text-[11px] ${GRADE_TONE[issuer.grade]}`}>{issuer.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='mt-6 grid gap-px border border-border bg-border sm:grid-cols-2'>
            {ISSUERS.filter((i) => i.note).map((issuer) => (
              <div key={issuer.slug} className='bg-background p-5'>
                <div className='mb-1.5 text-[13.5px] font-semibold'>{issuer.name}</div>
                <p className='text-[13px] leading-[1.7] text-muted-foreground'>{issuer.note}</p>
                {issuer.distribution.length > 0 && (
                  <div className='mt-2.5 flex flex-wrap gap-1.5'>
                    {issuer.distribution.map((d) => (
                      <span key={d} className='rounded-sm border border-border px-2 py-0.5 font-mono text-[10.5px] text-subtle'>{d}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── 代币排行 ─────────────────────────────────────────── */}
        <section className='border-b border-border py-12'>
          <div className='mb-2 flex flex-wrap items-baseline justify-between gap-3'>
            <h2 className='text-xl font-semibold tracking-[-0.015em]'>{t('Largest tokens', '代币排行', '主要トークン')}</h2>
            <span className='tnum font-mono text-[11.5px] text-subtle'>2026-10-15 · CoinGecko / Castle Labs</span>
          </div>
          <p className='mb-6 max-w-[700px] text-[14px] leading-[1.7] text-muted-foreground'>
            {t(
              'Turnover separates the issuers more sharply than size does. SPCXB trades roughly its own market cap in a day; STRCX and CRCLON barely move.',
              '换手率比规模更能区分发行方。SPCXB 一天的成交额差不多等于它自己的市值，而 STRCX 和 CRCLON 几乎不动。',
              '回転率は規模以上に発行体を分けます。SPCXB は一日で時価総額に近い出来高、STRCX と CRCLON はほとんど動きません。'
            )}
          </p>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[640px] border-collapse border border-border text-[13px]'>
              <thead>
                <tr>
                  {[
                    t('Token', '代币', 'トークン'),
                    t('Issuer', '发行方', '発行体'),
                    t('Market cap', '市值', '時価総額'),
                    t('24h volume', '24h 成交', '24h 出来高'),
                    t('Turnover', '换手', '回転率'),
                    t('7d', '7 天', '7日'),
                  ].map((h) => <th key={h} className={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {TOP_TOKENS.map((row) => {
                  const turnover = (row.volume24hUsd / row.marketCapUsd) * 100;
                  return (
                    <tr key={row.ticker} className='border-b border-border last:border-0'>
                      <td className='px-3 py-3 font-mono text-[12.5px] font-medium'>{row.ticker}</td>
                      <td className='px-3 py-3 text-[12.5px] text-muted-foreground'>{issuerName(row.issuerSlug)}</td>
                      <td className='tnum px-3 py-3 text-right font-mono text-[12px]'>{usd(row.marketCapUsd)}</td>
                      <td className='tnum px-3 py-3 text-right font-mono text-[12px] text-muted-foreground'>{usd(row.volume24hUsd)}</td>
                      <td className={`tnum px-3 py-3 text-right font-mono text-[12px] ${turnover > 50 ? 'text-brand' : 'text-subtle'}`}>
                        {turnover < 1 ? '<1%' : `${turnover.toFixed(0)}%`}
                      </td>
                      <td className={`tnum px-3 py-3 text-right font-mono text-[12px] ${row.change7dPct >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {row.change7dPct > 0 ? '+' : ''}{row.change7dPct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <h3 className='mb-3 mt-10 text-base font-semibold'>
            {t('Where the demand sits', '需求集中在哪', '需要の集中先')}
          </h3>
          <div className='grid gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-5'>
            {UNDERLYING_CONCENTRATION.map((item) => (
              <div key={item.underlying} className='bg-background p-4'>
                <div className='tnum font-mono text-[17px] font-medium'>{usd(item.valueUsd)}</div>
                <div className='mt-1 text-[12.5px] leading-[1.5] text-muted-foreground'>{item.underlying}</div>
                {item.note && <div className='mt-1 font-mono text-[10px] text-subtle'>{item.note}</div>}
              </div>
            ))}
          </div>
          <p className='mt-3 font-mono text-[11px] leading-[1.7] text-subtle'>
            {t(
              'Crypto-linked names, high-beta tech, and companies an ordinary brokerage cannot reach.',
              '三类资产：加密概念股、高波动科技股，以及普通券商买不到的标的。',
              '暗号資産関連銘柄、高ベータのテック株、一般の証券会社では買えない銘柄の三種類。'
            )}
          </p>
        </section>

        {/* ── 案例 ─────────────────────────────────────────────── */}
        <section className='border-b border-border py-12'>
          <div className='mb-2 flex flex-wrap items-baseline justify-between gap-3'>
            <h2 className='text-xl font-semibold tracking-[-0.015em]'>
              {t('Case study: one stock, four books', '案例：同一只股票，四本账', 'ケース：同じ株、四つの板')}
            </h2>
            <span className='tnum font-mono text-[11.5px] text-subtle'>{AAPL_CASE_STUDY.asOf}</span>
          </div>
          <p className='mb-6 max-w-[740px] text-[14px] leading-[1.7] text-muted-foreground'>
            {t(
              `A Saturday. The underlying last closed at ${AAPL_CASE_STUDY.underlyingClose}, yet all four tokens kept trading. Off-hours quotes are a market maker’s opinion, not a market price.`,
              `周六。底层股票最后收于 ${AAPL_CASE_STUDY.underlyingClose}，但四个代币仍在交易。非交易时段的报价是做市商的意见，不是市场价格。`,
              `土曜日。原資産は ${AAPL_CASE_STUDY.underlyingClose} で引けましたが、四つのトークンは取引を続けています。休場中の気配はマーケットメイカーの提示であり市場価格ではありません。`
            )}
          </p>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[860px] border-collapse border border-border text-[13px]'>
              <thead>
                <tr>
                  {[
                    t('Token', '代币', 'トークン'),
                    t('Issuer', '发行方', '発行体'),
                    t('Venue', '场所', '取引所'),
                    t('24h volume', '24h 成交额', '24h 出来高'),
                    t('Spread', '价差', 'スプレッド'),
                    t('Bid depth', '买盘深度', '買い板'),
                    t('Ask depth', '卖盘深度', '売り板'),
                    t('vs close', '相对收盘', '終値比'),
                  ].map((h) => <th key={h} className={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {AAPL_CASE_STUDY.rows.map((row) => (
                  <tr key={row.ticker} className='border-b border-border last:border-0'>
                    <td className='px-3 py-3'>
                      <div className='font-mono text-[12.5px] font-medium'>{row.ticker}</div>
                      <div className='font-mono text-[10.5px] text-subtle'>{row.chain}</div>
                    </td>
                    <td className='px-3 py-3 text-[12.5px] text-muted-foreground'>
                      {issuerName(row.issuerSlug) ?? <span className='text-negative'>{t('unresolved', '未能解析', '特定不可')}</span>}
                    </td>
                    <td className='px-3 py-3 font-mono text-[11.5px] text-muted-foreground'>{row.venue}</td>
                    <td className='tnum px-3 py-3 text-right font-mono text-[12px]'>{usd(row.volume24hUsd)}</td>
                    <td className={`tnum px-3 py-3 text-right font-mono text-[12px] ${row.spreadBps > 20 ? 'text-negative' : ''}`}>{row.spreadBps} bps</td>
                    <td className='tnum px-3 py-3 text-right font-mono text-[12px] text-muted-foreground'>{usd(row.bidDepthUsd)}</td>
                    <td className='tnum px-3 py-3 text-right font-mono text-[12px] text-muted-foreground'>{usd(row.askDepthUsd)}</td>
                    <td className={`tnum px-3 py-3 text-right font-mono text-[12px] ${row.premiumPct >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {row.premiumPct > 0 ? '+' : ''}{row.premiumPct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='mt-5 space-y-2'>
            {AAPL_CASE_STUDY.rows.map((row) => (
              <p key={row.ticker} className='text-[13px] leading-[1.7] text-muted-foreground'>
                <span className='font-mono text-[12px] text-foreground'>{row.ticker}</span>
                <span className='mx-2 text-subtle'>·</span>{row.note}
              </p>
            ))}
          </div>
          <p className='mt-5 font-mono text-[11px] leading-[1.7] text-subtle'>
            {t(
              'Volume is 24h base quantity × last price. Depth is the top 20 levels converted at mid, not full book depth. Addresses in the data file come from a mapping snapshot marked "observed" — never an issuer whitelist.',
              '成交额为 24h 基础资产数量 × 最新成交价折算；深度为买卖盘前 20 档按中间价估算，不等于完整订单簿。数据文件中的合约地址来自标记为 observed 的映射快照，不是发行方白名单。',
              '出来高は 24h 数量 × 直近価格、板は上位 20 段を仲値換算した推定です。データ内のアドレスは observed 状態であり発行体のホワイトリストではありません。'
            )}
          </p>
        </section>

        {/* ── 交易场所 ─────────────────────────────────────────── */}
        <section className='border-b border-border py-12'>
          <h2 className='mb-6 text-xl font-semibold tracking-[-0.015em]'>{t('Venues', '交易场所', '取引場所')}</h2>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[760px] border-collapse border border-border text-[13px]'>
              <thead>
                <tr>
                  {[
                    t('Venue', '场所', '取引所'),
                    t('Tokens', '交易的代币', '取扱トークン'),
                    t('Terms', '费用 / 特点', '手数料・特徴'),
                    t('Hours', '交易时间', '取引時間'),
                  ].map((h) => <th key={h} className={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {VENUES.map((v) => (
                  <tr key={v.name} className='border-b border-border align-top last:border-0'>
                    <td className='px-3 py-3 font-medium'>{v.name}</td>
                    <td className='px-3 py-3 font-mono text-[11.5px] text-muted-foreground'>{v.tokens}</td>
                    <td className='px-3 py-3 text-[12.5px] leading-[1.6] text-muted-foreground'>{v.terms}</td>
                    <td className='px-3 py-3 font-mono text-[11.5px] text-muted-foreground'>{v.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='mt-6 rounded border border-border-strong bg-surface p-5'>
            <div className='mono-label mb-2 text-brand'>{PERPS_NOTE.title}</div>
            <p className='mb-2 text-[13.5px] leading-[1.75] text-muted-foreground'>{PERPS_NOTE.body}</p>
            <Link href={PERPS_NOTE.url} target='_blank' rel='noopener' className='font-mono text-[11.5px] text-subtle hover:text-foreground'>
              {t('source', '来源', '出典')} ↗
            </Link>
          </div>
        </section>

        {/* ── 两条路线 ─────────────────────────────────────────── */}
        <section className='border-b border-border py-12'>
          <h2 className='mb-2 text-xl font-semibold tracking-[-0.015em]'>{t('Two paths', '两条路线', '二つの路線')}</h2>
          <p className='mb-6 max-w-[700px] text-[14px] leading-[1.7] text-muted-foreground'>
            {t(
              'After the Innovation Exemption and the Nasdaq rule, the contest shifts from "who can route around regulation offshore" to "who can offer full shareholder rights and reach US liquidity".',
              '在 Innovation Exemption 和 Nasdaq 规则之后，竞争重点从「谁能在境外绕开监管」转向「谁能提供完整股东权利并接入美国流动性」。',
              'Innovation Exemption と Nasdaq のルール以降、競争の焦点は「規制を回避できるか」から「完全な株主権を提供し米国の流動性に接続できるか」へ移ります。'
            )}
          </p>
          <div className='grid gap-px border border-border bg-border sm:grid-cols-2'>
            {TWO_PATHS.map((path) => (
              <div key={path.label} className='bg-background p-5'>
                <div className='mb-1 text-[15px] font-semibold'>{path.label}</div>
                <div className='mb-3 font-mono text-[11px] text-subtle'>{path.who}</div>
                <p className='mb-1.5 text-[13px] leading-[1.65] text-positive'>+ {path.pros}</p>
                <p className='text-[13px] leading-[1.65] text-negative'>− {path.cons}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 风险 ─────────────────────────────────────────────── */}
        <section className='border-b border-border py-12'>
          <h2 className='mb-6 text-xl font-semibold tracking-[-0.015em]'>{t('Risks', '风险', 'リスク')}</h2>
          <div className='border border-border'>
            {RISKS.map((row) => (
              <div key={row.risk} className='flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border px-4 py-3 last:border-0'>
                <span className={`shrink-0 rounded-sm border px-2 py-0.5 font-mono text-[10.5px] uppercase ${SEVERITY_TONE[row.severity]}`}>
                  {row.severity}
                </span>
                <span className='text-[13.5px] font-medium'>{row.risk}</span>
                <span className='min-w-0 flex-[1_1_320px] text-[12.5px] leading-[1.6] text-muted-foreground'>{row.detail}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 筛选框架 ─────────────────────────────────────────── */}
        <section className='border-b border-border py-12'>
          <h2 className='mb-6 text-xl font-semibold tracking-[-0.015em]'>{t('Screening framework', '筛选框架', 'スクリーニング基準')}</h2>

          <div className='mb-8 flex flex-wrap gap-8'>
            <div className='min-w-0 flex-[1_1_320px]'>
              <div className='mono-label mb-3'>{t('Risk weights', '风险权重', 'リスク配点')}</div>
              {RISK_WEIGHTS.map((row) => (
                <div key={row.dimension} className='border-b border-border py-2.5 last:border-0'>
                  <div className='flex items-baseline justify-between gap-3'>
                    <span className='text-[13.5px] font-medium'>{row.dimension}</span>
                    <span className='tnum shrink-0 font-mono text-[12px] text-brand'>{row.weight}%</span>
                  </div>
                  <p className='mt-1 text-[12.5px] leading-[1.6] text-subtle'>{row.question}</p>
                </div>
              ))}
            </div>
            <div className='min-w-0 flex-[1_1_320px]'>
              <div className='mono-label mb-3'>{t('Grades', '分级', 'グレード')}</div>
              {GRADE_RUBRIC.map((row) => (
                <div key={row.grade} className='flex gap-3 border-b border-border py-2.5 last:border-0'>
                  <span className={`h-fit shrink-0 rounded-sm border px-2 py-0.5 font-mono text-[11px] ${GRADE_TONE[row.grade]}`}>{row.grade}</span>
                  <p className='text-[12.5px] leading-[1.65] text-muted-foreground'>{row.meaning}</p>
                </div>
              ))}
            </div>
          </div>

          <div className='mono-label mb-3'>{t('Veto checks — any single hit disqualifies', '一票否决项 —— 命中任意一条即排除', '一発除外条件')}</div>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[720px] border-collapse border border-border text-[13px]'>
              <thead>
                <tr>
                  {[t('Check', '检查项', '項目'), t('Pass', '合格条件', '合格条件'), t('Veto', '一票否决信号', '除外シグナル')].map((h) => (
                    <th key={h} className={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {VETO_CHECKS.map((row) => (
                  <tr key={row.check} className='border-b border-border align-top last:border-0'>
                    <td className='px-3 py-3 text-[13px] font-medium'>{row.check}</td>
                    <td className='px-3 py-3 text-[12.5px] leading-[1.6] text-muted-foreground'>{row.pass}</td>
                    <td className='px-3 py-3 text-[12.5px] leading-[1.6] text-negative'>{row.veto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 监管 + 观察信号 ──────────────────────────────────── */}
        <section className='py-12'>
          <h2 className='mb-6 text-xl font-semibold tracking-[-0.015em]'>{t('Regulatory record', '监管进展', '規制の動き')}</h2>
          <div className='space-y-px border border-border bg-border'>
            {REGULATORY_NOTES.map((note) => (
              <div key={note.title} className='bg-background p-5'>
                <div className='mb-2 flex flex-wrap items-baseline gap-3'>
                  <span className='tnum font-mono text-[12px] text-brand'>{note.date}</span>
                  <Link href={note.url} target='_blank' rel='noopener' className='text-[14px] font-semibold hover:text-brand'>
                    {note.title} ↗
                  </Link>
                </div>
                <p className='text-[13.5px] leading-[1.75] text-muted-foreground'>{note.summary}</p>
              </div>
            ))}
          </div>

          <h3 className='mb-3 mt-10 text-base font-semibold'>{t('What to watch next', '接下来看什么', '次に見る指標')}</h3>
          <ol className='border border-border'>
            {WATCH_SIGNALS.map((signal, i) => (
              <li key={signal} className='flex gap-4 border-b border-border px-4 py-3 last:border-0'>
                <span className='tnum shrink-0 font-mono text-[12px] text-brand'>{String(i + 1).padStart(2, '0')}</span>
                <span className='text-[13.5px] leading-[1.65] text-muted-foreground'>{signal}</span>
              </li>
            ))}
          </ol>

          <p className='mt-8 max-w-[760px] font-mono text-[11px] leading-[1.8] text-subtle'>
            {t(
              'Research, not advice. This page makes no judgement about whether readers in any particular jurisdiction may buy, hold, transfer or redeem these instruments — verify that against the issuer’s offering documents.',
              '本页为研究整理，不构成投资建议，也不对任何特定地区读者能否购买、持有、转让或赎回这些产品作法律判断 —— 请自行对照发行方的正式发行文件核实。',
              '本ページは調査であり投資助言ではありません。特定地域の読者がこれらを取得・保有・移転・償還できるかの判断は行いません。発行体の正式書類でご確認ください。'
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
