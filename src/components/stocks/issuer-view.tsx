import Link from 'next/link';
import { notFound } from 'next/navigation';
import InstrumentTable from '@/components/stocks/instrument-table';
import {
  QUOTES_AS_OF,
  QUOTES_REPORTED_TOTAL,
  getInstruments,
  getIssuerTotals,
} from '@/data/instruments';
import { INSTRUMENT_GROUPS } from '@/data/instrument-groups';
import {
  DIVIDEND_LABEL,
  GRADE_LABEL,
  ISSUANCE_LABEL,
  ISSUERS,
  POR_LABEL,
  US_LABEL,
  VOTING_LABEL,
  WRAPPER_LABEL,
  pick,
  type Grade,
  type Issuer,
} from '@/data/tokenized-equities';
import { DATA } from '@/data/resume';
import { getTranslator, localizeHref, type Locale } from '@/lib/i18n';
import { localizedDynamicMetadata } from '@/lib/localized-metadata';
import { formatTurnover, formatUsd } from '@/lib/instrument-format';

const GRADE_TONE: Record<Grade, string> = {
  A: 'border-positive text-positive',
  B: 'border-brand text-brand',
  C: 'border-border-strong text-muted-foreground',
  D: 'border-negative text-negative',
  unrated: 'border-border text-subtle',
};

export const findIssuer = (slug: string): Issuer | undefined =>
  ISSUERS.find((issuer) => issuer.slug === slug);

export function issuerPageMetadata(slug: string, locale: Locale) {
  const issuer = findIssuer(slug);
  const totals = getIssuerTotals(slug);
  if (!issuer || !totals) return localizedDynamicMetadata('/stocks', locale, {
    title: ['Tokenized Equities', '链上美股', 'オンチェーン米国株'],
    description: ['', '', ''],
  });

  const count = totals.instrumentCount;
  return localizedDynamicMetadata(`/stocks/${slug}`, locale, {
    title: [
      `${issuer.name}: ${count} tokenized equities`,
      `${issuer.name}：${count} 个链上美股标的`,
      `${issuer.name}：トークン化株式 ${count} 銘柄`,
    ],
    description: [
      `Every instrument ${issuer.name} has issued, with market cap, 24h volume and turnover, plus the legal wrapper, custody, redemption terms and proof of reserve behind them.`,
      `${issuer.name} 已发行的全部标的，含市值、24h 成交与换手，以及它们背后的法律包装、托管、赎回条款与储备证明。`,
      `${issuer.name} が発行した全銘柄の時価総額・24h出来高・回転率と、その背後にある法的ラッパー、保管、償還条件、準備金証明。`,
    ],
  });
}

export function renderIssuerPage(slug: string, locale: Locale) {
  const issuer = findIssuer(slug);
  const totals = getIssuerTotals(slug);
  if (!issuer || !totals) notFound();

  const t = getTranslator(locale);
  const L = <T extends readonly [string, string, string]>(value: T) => pick(value, locale);
  const href = (url: string) => localizeHref(url, locale);

  const groups = INSTRUMENT_GROUPS.filter((group) => group.issuerSlug === slug);
  const unpriced = totals.instrumentCount - totals.quotedCount;
  const missingFromPayload = QUOTES_REPORTED_TOTAL - totals.instrumentCount;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('Tokenized Equities', '链上美股', 'オンチェーン米国株'), item: `${DATA.url}${href('/stocks')}` },
      { '@type': 'ListItem', position: 2, name: issuer.name, item: `${DATA.url}${href(`/stocks/${slug}`)}` },
    ],
  };

  const metrics: { label: string; value: string; note?: string }[] = [
    {
      label: t('Instruments', '标的数', '銘柄数'),
      value: String(totals.instrumentCount),
      note: missingFromPayload > 0 ? t(`${QUOTES_REPORTED_TOTAL} listed upstream`, `上游列出 ${QUOTES_REPORTED_TOTAL} 个`, `上流では ${QUOTES_REPORTED_TOTAL} 銘柄`) : undefined,
    },
    { label: t('Combined market cap', '合计市值', '時価総額合計'), value: formatUsd(totals.marketCapUsd) },
    { label: t('24h volume', '24h 成交', '24h 出来高'), value: formatUsd(totals.volume24hUsd) },
    {
      label: t('Book turnover', '整体换手', '全体回転率'),
      value: formatTurnover(totals.turnover),
      note: t('computed, not reported', '现算，非上游提供', '上流提供ではなく算出値'),
    },
    { label: t('First listing', '首发', '初上場'), value: totals.firstListedAt },
    { label: t('Latest listing', '最新上线', '最新上場'), value: totals.lastListedAt },
  ];

  const facts: { label: string; value: string }[] = [
    { label: t('Wrapper', '法律包装', '法的ラッパー'), value: L(WRAPPER_LABEL[issuer.wrapper]) },
    { label: t('Voting', '投票权', '議決権'), value: L(VOTING_LABEL[issuer.voting]) },
    { label: t('Dividend', '分红', '配当'), value: L(DIVIDEND_LABEL[issuer.dividend]) },
    {
      label: t('Redemption', '赎回', '償還'),
      value:
        issuer.redemption.available === 'unknown'
          ? t('unknown', '未知', '不明')
          : issuer.redemption.available
            ? [
                t('available', '可赎回', '可能'),
                issuer.redemption.kyc === true ? t('KYC', '需 KYC', 'KYC必須') : undefined,
                issuer.redemption.minimumUsd === undefined ? undefined : `≥$${issuer.redemption.minimumUsd}`,
              ]
                .filter(Boolean)
                .join(' · ')
            : t('not available', '不可赎回', '不可'),
    },
    { label: t('Proof of reserve', '储备证明', '準備金証明'), value: L(POR_LABEL[issuer.proofOfReserve.kind]) },
    { label: t('US persons', '美国准入', '米国アクセス'), value: L(US_LABEL[issuer.usPersons]) },
    { label: t('Chains', '链', 'チェーン'), value: issuer.chains.join(' · ') },
    {
      label: t('Venues', '交易场所', '取引場所'),
      value: issuer.venues
        .map((venue) => (venue.operatedByIssuer ? `${venue.name} (${t('self-run', '自营', '自社')})` : venue.name))
        .join(' · '),
    },
  ];

  return (
    <div>
      <script type='application/ld+json' suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className='border-b border-border'>
        <div className='mx-auto max-w-[1240px] px-4 pb-10 pt-8 sm:px-8'>
          <nav aria-label={t('Breadcrumb', '面包屑', 'パンくず')} className='mb-6 font-mono text-[11px] text-subtle'>
            <Link href={href('/stocks')}>{t('Tokenized Equities', '链上美股', 'オンチェーン米国株')}</Link>
            <span aria-hidden='true' className='px-2'>
              /
            </span>
            <span className='text-foreground'>{issuer.name}</span>
          </nav>

          <div className='mb-5 flex flex-wrap items-baseline gap-x-3.5 gap-y-2'>
            <h1 className='text-[30px] font-semibold tracking-[-0.03em] sm:text-[38px]'>{issuer.name}</h1>
            <span className={`inline-block rounded-sm border px-2 py-0.5 font-mono text-[11px] ${GRADE_TONE[issuer.grade]}`}>
              {t('Grade', '评级', '評価')} {L(GRADE_LABEL[issuer.grade])}
            </span>
            <span className='inline-block rounded-sm border border-border-strong px-2 py-0.5 font-mono text-[11px] text-muted-foreground'>
              {L(ISSUANCE_LABEL[issuer.issuanceModel])}
            </span>
          </div>

          {issuer.entity && (
            <div className='mb-4 font-mono text-[11.5px] text-subtle'>
              {issuer.entity} · {L(issuer.jurisdiction)}
            </div>
          )}

          <p className='max-w-[760px] text-[14.5px] leading-[1.75] text-muted-foreground'>{L(issuer.note)}</p>
        </div>
      </section>

      <section className='border-b border-border'>
        <div className='mx-auto flex max-w-[1240px] flex-wrap gap-x-10 gap-y-6 px-4 py-8 sm:px-8'>
          {metrics.map((metric) => (
            <div key={metric.label}>
              <div className='mono-label'>{metric.label}</div>
              <div className='tnum mt-1.5 font-mono text-[22px]'>{metric.value}</div>
              {metric.note && <div className='mt-1 font-mono text-[10.5px] text-subtle'>{metric.note}</div>}
            </div>
          ))}
        </div>
      </section>

      <section className='border-b border-border'>
        <div className='mx-auto max-w-[1240px] px-4 py-8 sm:px-8'>
          <h2 className='mono-label mb-4'>{t('Wrapper and custody', '法律包装与托管', '法的ラッパーと保管')}</h2>
          <dl className='grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4'>
            {facts.map((fact) => (
              <div key={fact.label} className='bg-surface px-4 py-3'>
                <dt className='font-mono text-[10px] uppercase tracking-[0.08em] text-subtle'>{fact.label}</dt>
                <dd className='mt-1 text-[12.5px]'>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className='border-b border-border'>
        <div className='mx-auto max-w-[1240px] px-4 py-8 sm:px-8'>
          <div className='mb-5 flex flex-wrap items-baseline justify-between gap-3'>
            <h2 className='mono-label'>{t('All instruments', '全部标的', '全銘柄')}</h2>
            <span className='font-mono text-[10.5px] text-subtle'>
              {t('Quotes as of', '行情截至', '価格時点')} {QUOTES_AS_OF}
            </span>
          </div>

          <InstrumentTable issuerSlug={slug} />

          <p className='mt-4 max-w-[820px] text-[11.5px] leading-[1.75] text-subtle'>
            {missingFromPayload > 0 &&
              t(
                `The upstream source lists ${QUOTES_REPORTED_TOTAL} instruments and this page holds ${totals.instrumentCount}; the remaining ${missingFromPayload} are not here yet rather than being worth nothing. `,
                `上游列出 ${QUOTES_REPORTED_TOTAL} 个标的，本页收录 ${totals.instrumentCount} 个；缺的 ${missingFromPayload} 个是还没收进来，不是值为零。`,
                `上流は ${QUOTES_REPORTED_TOTAL} 銘柄を掲載し、このページは ${totals.instrumentCount} 銘柄。残る ${missingFromPayload} 銘柄は未収録であり、価値がゼロなのではありません。`
              )}
            {unpriced > 0 &&
              t(
                `${unpriced} of the instruments here carry no quote and show a dash. `,
                `本页有 ${unpriced} 个标的没有行情，显示破折号。`,
                `このページの ${unpriced} 銘柄には価格がなく、ダッシュで表示されます。`
              )}
            {t(
              'No premium or discount is shown: a token is not one share, and the multiple is not even constant within one issuer, so there is no single ratio to divide by.',
              '本页不给溢价/折价：一个代币不等于一股，而且倍数在同一家发行方内部都不一致，没有一个可用的统一比例。',
              'プレミアム/ディスカウントは表示しません。1トークンは1株ではなく、倍率は同一発行体の中でも一定ではないため、割るべき比率が存在しません。'
            )}
          </p>
        </div>
      </section>

      {groups.length > 0 && (
        <section className='border-b border-border'>
          <div className='mx-auto max-w-[1240px] px-4 py-8 sm:px-8'>
            <h2 className='mono-label mb-4'>
              {t('Research groups', '研报分组', 'リサーチグループ')} · {groups.length}
            </h2>
            <ul className='grid gap-px border border-border bg-border sm:grid-cols-2'>
              {groups.map((group) => (
                <li key={group.slug} className='bg-surface px-4 py-3.5'>
                  <div className='font-mono text-[10px] uppercase tracking-[0.08em] text-subtle'>
                    {String(group.index).padStart(2, '0')}
                  </div>
                  <div className='mt-1 text-[13px] font-medium'>{L(group.title)}</div>
                  <div className='mt-1.5 font-mono text-[10.5px] text-subtle'>{group.tickers.join(' · ')}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

export const issuerPageSlugs = () =>
  ISSUERS.filter((issuer) => getInstruments(issuer.slug).length > 0).map((issuer) => issuer.slug);
