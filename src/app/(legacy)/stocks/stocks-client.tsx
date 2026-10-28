'use client';

import { useMemo, useState } from 'react';
import { useI18n } from '@/components/locale-provider';
import {
  DIVIDEND_LABEL,
  GRADE_LABEL,
  GRADE_RUBRIC,
  ISSUANCE_LABEL,
  ISSUERS,
  POR_LABEL,
  US_LABEL,
  VENUE_KIND_LABEL,
  VOTING_LABEL,
  WRAPPER_LABEL,
  buildExchangeIndex,
  pick,
  type Grade,
  type IssuanceModel,
} from '@/data/tokenized-equities';

const TH =
  'border-b border-border-strong px-3 py-2.5 text-left font-mono text-[10.5px] font-normal uppercase tracking-[0.12em] text-subtle';

const GRADE_TONE: Record<Grade, string> = {
  A: 'border-positive text-positive',
  B: 'border-brand text-brand',
  C: 'border-border-strong text-muted-foreground',
  D: 'border-negative text-negative',
  unrated: 'border-border text-subtle',
};

const usd = (value?: number) => {
  if (value === undefined) return '—';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value}`;
};

const CHIP = 'rounded-sm border px-2.5 py-1 font-mono text-[11px] transition-colors';
const CHIP_ON = 'border-border-strong bg-surface-2 text-foreground';
const CHIP_OFF = 'border-border text-subtle hover:border-border-strong hover:text-foreground';

type View = 'issuer' | 'venue';
type ModelFilter = IssuanceModel | 'all';

export default function StocksIssuers() {
  const { locale, t } = useI18n();
  const L = <T extends readonly [string, string, string]>(value: T) => pick(value, locale);

  const [view, setView] = useState<View>('issuer');
  const [model, setModel] = useState<ModelFilter>('all');

  const issuers = useMemo(
    () => (model === 'all' ? ISSUERS : ISSUERS.filter((issuer) => issuer.issuanceModel === model)),
    [model]
  );
  const exchanges = useMemo(() => buildExchangeIndex(issuers), [issuers]);

  // Aave and Morpho take these tokens as collateral and are not somewhere to
  // buy, so they are kept out of the venues list rather than listed beside
  // Binance, which is how the previous single list misread.
  const buyVenues = exchanges.filter((entry) => entry.kind !== 'lending');
  const collateralVenues = exchanges.filter((entry) => entry.kind === 'lending');

  // Only offer a filter that still matches something.
  const models: ModelFilter[] = [
    'all',
    ...(['exchange-self', 'exchange-onchain', 'broker-self', 'independent', 'unknown'] as const).filter((candidate) =>
      ISSUERS.some((issuer) => issuer.issuanceModel === candidate)
    ),
  ];

  return (
    <section className='border-b border-border py-12'>
      <div className='mb-5 flex flex-wrap items-baseline justify-between gap-3'>
        <h2 className='text-xl font-semibold tracking-[-0.015em]'>{t('Issuers', '发行方', '発行体')}</h2>
        <div className='flex gap-1.5'>
          {(['issuer', 'venue'] as const).map((option) => (
            <button
              key={option}
              type='button'
              onClick={() => setView(option)}
              aria-pressed={view === option}
              className={`${CHIP} ${view === option ? CHIP_ON : CHIP_OFF}`}
            >
              {option === 'issuer'
                ? t('By issuer', '按发行方', '発行体別')
                : t('By venue', '按交易所', '取引所別')}
            </button>
          ))}
        </div>
      </div>

      <div className='mb-5 flex flex-wrap gap-1.5'>
        {models.map((option) => (
          <button
            key={option}
            type='button'
            onClick={() => setModel(option)}
            aria-pressed={model === option}
            className={`${CHIP} ${model === option ? CHIP_ON : CHIP_OFF}`}
          >
            {option === 'all' ? t('All', '全部', 'すべて') : L(ISSUANCE_LABEL[option])}
          </button>
        ))}
      </div>

      {issuers.length === 0 ? (
        <p className='rounded border border-border bg-surface p-6 text-center text-[13px] text-subtle'>
          {t('No issuer matches this filter.', '没有发行方符合该筛选。', 'この条件に該当する発行体はありません。')}
        </p>
      ) : view === 'issuer' ? (
        <>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[960px] border-collapse border border-border text-[13px]'>
              <thead>
                <tr>
                  {[
                    t('Issuer', '发行方', '発行体'),
                    t('Issuance', '发行模型', '発行モデル'),
                    t('Wrapper', '法律包装', 'ラッパー'),
                    t('Voting', '投票权', '議決権'),
                    t('Dividend', '股息', '配当'),
                    t('Redemption', '赎回', '償還'),
                    t('PoR', '储备证明', '準備金証明'),
                    t('US', '美国', '米国'),
                    t('On-chain', '链上规模', 'オンチェーン'),
                    t('Grade', '评级', '評価'),
                  ].map((heading) => (
                    <th key={heading} className={TH}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {issuers.map((issuer) => (
                  <tr key={issuer.slug} className='border-b border-border align-top last:border-0'>
                    <td className='px-3 py-3'>
                      <div className='font-semibold'>{issuer.name}</div>
                      <div className='mt-0.5 font-mono text-[10.5px] text-subtle'>{L(issuer.jurisdiction)}</div>
                      {issuer.instrumentCount !== undefined && (
                        <div className='tnum mt-0.5 font-mono text-[10.5px] text-subtle'>
                          {issuer.instrumentCount}+ {t('instruments', '个标的', '銘柄')}
                        </div>
                      )}
                    </td>
                    <td className='px-3 py-3 font-mono text-[11px] text-muted-foreground'>
                      {L(ISSUANCE_LABEL[issuer.issuanceModel])}
                    </td>
                    <td className='px-3 py-3 font-mono text-[11px] text-muted-foreground'>{L(WRAPPER_LABEL[issuer.wrapper])}</td>
                    <td
                      className={`px-3 py-3 font-mono text-[11px] ${issuer.voting === 'full' ? 'text-positive' : issuer.voting === 'none' ? 'text-negative' : 'text-muted-foreground'}`}
                    >
                      {L(VOTING_LABEL[issuer.voting])}
                    </td>
                    <td className='px-3 py-3 font-mono text-[11px] text-muted-foreground'>{L(DIVIDEND_LABEL[issuer.dividend])}</td>
                    <td className='px-3 py-3 font-mono text-[11px] text-muted-foreground'>
                      {issuer.redemption.available === 'unknown'
                        ? t('unknown', '未知', '不明')
                        : issuer.redemption.available
                          ? t('yes', '支持', '可')
                          : t('no', '不支持', '不可')}
                      {issuer.redemption.minimumUsd !== undefined && (
                        <span className='tnum block text-subtle'>
                          {t('min', '最低', '最低')} {usd(issuer.redemption.minimumUsd)}
                        </span>
                      )}
                      {issuer.redemption.refusable && (
                        <span className='block text-negative'>{t('refusable', '可被拒绝', '拒否可能')}</span>
                      )}
                    </td>
                    <td className='px-3 py-3 font-mono text-[11px] text-muted-foreground'>{L(POR_LABEL[issuer.proofOfReserve.kind])}</td>
                    <td
                      className={`px-3 py-3 font-mono text-[11px] ${issuer.usPersons === 'accredited' ? 'text-positive' : issuer.usPersons === 'blocked' ? 'text-negative' : 'text-muted-foreground'}`}
                    >
                      {L(US_LABEL[issuer.usPersons])}
                    </td>
                    <td className='tnum px-3 py-3 text-right font-mono text-[12px]'>{usd(issuer.onchainValueUsd)}</td>
                    <td className='px-3 py-3'>
                      <span className={`inline-block rounded-sm border px-2 py-0.5 font-mono text-[11px] ${GRADE_TONE[issuer.grade]}`}>
                        {L(GRADE_LABEL[issuer.grade])}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className='mt-3 flex flex-wrap gap-x-5 gap-y-1.5'>
            {GRADE_RUBRIC.map((row) => (
              <div key={row.grade} className='flex items-baseline gap-2'>
                <dt className={`shrink-0 rounded-sm border px-1.5 font-mono text-[10.5px] ${GRADE_TONE[row.grade]}`}>
                  {L(GRADE_LABEL[row.grade])}
                </dt>
                <dd className='m-0 text-[11.5px] text-subtle'>{L(row.short)}</dd>
              </div>
            ))}
          </dl>

          <div className='mt-6 grid gap-px border border-border bg-border sm:grid-cols-2'>
            {issuers.map((issuer) => (
              <div key={issuer.slug} className='bg-background p-5'>
                <div className='mb-1.5 text-[13.5px] font-semibold'>{issuer.name}</div>
                <p className='text-[13px] leading-[1.7] text-muted-foreground'>{L(issuer.note)}</p>
                <div className='mt-2.5 flex flex-wrap items-center gap-1.5'>
                  <span className='rounded-sm border border-border-strong px-2 py-0.5 font-mono text-[10.5px] text-foreground'>
                    {L(ISSUANCE_LABEL[issuer.issuanceModel])}
                  </span>
                  {issuer.venues.map((venue) => (
                    <span
                      key={venue.name}
                      title={L(VENUE_KIND_LABEL[venue.kind])}
                      className={`rounded-sm border px-2 py-0.5 font-mono text-[10.5px] ${
                        venue.kind === 'lending' ? 'border-dashed border-border text-subtle' : 'border-border text-subtle'
                      }`}
                    >
                      {venue.name}
                      {venue.kind === 'lending' && <span className='ml-1'>·{L(VENUE_KIND_LABEL.lending)}</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[720px] border-collapse border border-border text-[13px]'>
              <thead>
                <tr>
                  {[
                    t('Venue', '交易场所', '取引場所'),
                    t('Type', '类型', '種別'),
                    t('Issuers available', '可买到的发行方', '購入可能な発行体'),
                    t('Reachable size', '可达规模', '到達可能な規模'),
                  ].map((heading) => (
                    <th key={heading} className={TH}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buyVenues.map((entry) => (
                  <tr key={entry.venue} className='border-b border-border align-top last:border-0'>
                    <td className='px-3 py-3'>
                      <div className='font-semibold'>{entry.venue}</div>
                      {entry.operatedByIssuer && (
                        <div className='mt-0.5 font-mono text-[10.5px] text-brand'>
                          {t('runs its own issuance', '自营发行', '自社で発行')}
                        </div>
                      )}
                    </td>
                    <td className='px-3 py-3 font-mono text-[11px] text-muted-foreground'>{L(VENUE_KIND_LABEL[entry.kind])}</td>
                    <td className='px-3 py-3'>
                      <div className='flex flex-wrap gap-1.5'>
                        {entry.issuers.map((issuer) => (
                          <span
                            key={issuer.slug}
                            className={`rounded-sm border px-2 py-0.5 font-mono text-[10.5px] ${GRADE_TONE[issuer.grade]}`}
                            title={L(ISSUANCE_LABEL[issuer.issuanceModel])}
                          >
                            {issuer.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className='tnum px-3 py-3 text-right font-mono text-[12px]'>{usd(entry.reachableOnchainValueUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className='mt-2 font-mono text-[10.5px] leading-[1.6] text-subtle'>
            {t(
              'Reachable size is the on-chain value an issuer brings to that venue. It is not additive — xStocks counts once under Kraken, Bybit and OKX alike.',
              '可达规模是该发行方带到这个场所的链上规模，不可相加 —— xStocks 在 Kraken、Bybit、OKX 下各计一次。',
              '到達可能な規模はその発行体がその場所にもたらすオンチェーン規模です。合計はできません —— xStocks は Kraken、Bybit、OKX のそれぞれで一度ずつ数えられます。'
            )}
          </p>

          {collateralVenues.length > 0 && (
            <div className='mt-6 rounded border border-dashed border-border p-5'>
              <div className='mono-label mb-2'>{t('Collateral only — not a place to buy', '仅作抵押品 · 不是购买渠道', '担保のみ · 購入場所ではない')}</div>
              <div className='flex flex-wrap gap-1.5'>
                {collateralVenues.map((entry) => (
                  <span key={entry.venue} className='rounded-sm border border-border px-2 py-0.5 font-mono text-[10.5px] text-subtle'>
                    {entry.venue} · {entry.issuers.map((issuer) => issuer.name).join(', ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
