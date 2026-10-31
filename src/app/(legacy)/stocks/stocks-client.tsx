'use client';

import { Fragment, useMemo, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/locale-provider';
import {
  DIVIDEND_LABEL,
  GRADE_LABEL,
  GRADE_RUBRIC,
  DATA_AS_OF,
  ISSUANCE_LABEL,
  ISSUERS,
  POR_LABEL,
  US_LABEL,
  VENUE_KIND_LABEL,
  VOTING_LABEL,
  WRAPPER_LABEL,
  TOP_TOKENS,
  TURNOVER_READING,
  buildExchangeIndex,
  pick,
  type Grade,
  type IssuanceModel,
  type Issuer,
} from '@/data/tokenized-equities';
import { getInstrumentCount, instrumentCountFor } from '@/data/instruments';
import { localizeHref } from '@/lib/i18n';
import {
  TURNOVER_TONE_CLASS,
  changeToneClass,
  formatChange,
  formatTurnover,
  formatUsd as usd,
  turnoverTone,
} from '@/lib/instrument-format';

const TH =
  'border-b border-border-strong px-3.5 py-2.5 text-left font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-subtle';

const GRADE_TONE: Record<Grade, string> = {
  A: 'border-positive text-positive',
  B: 'border-brand text-brand',
  C: 'border-border-strong text-muted-foreground',
  D: 'border-negative text-negative',
  unrated: 'border-border text-subtle',
};

const CHAINS_SHOWN = 4;

type View = 'issuer' | 'venue';
type ModelFilter = IssuanceModel | 'all';

export default function StocksIssuers() {
  const { locale, t } = useI18n();
  const L = <T extends readonly [string, string, string]>(value: T) => pick(value, locale);

  const [view, setView] = useState<View>('issuer');
  const [model, setModel] = useState<ModelFilter>('all');
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);

  const issuers = useMemo(
    () => (model === 'all' ? ISSUERS : ISSUERS.filter((issuer) => issuer.issuanceModel === model)),
    [model]
  );
  const exchanges = useMemo(() => buildExchangeIndex(issuers), [issuers]);

  // Aave and Morpho take these tokens as collateral and are not somewhere to
  // buy, so they get their own heading instead of sitting beside Binance.
  const buyVenues = exchanges.filter((entry) => entry.kind !== 'lending');
  const collateralVenues = exchanges.filter((entry) => entry.kind === 'lending');

  const models: ModelFilter[] = [
    'all',
    ...(['exchange-self', 'exchange-onchain', 'broker-self', 'independent', 'unknown'] as const).filter((candidate) =>
      ISSUERS.some((issuer) => issuer.issuanceModel === candidate)
    ),
  ];

  // The token ranking used to be its own section listing all eight rows with an
  // issuer column. Folded in here instead: each token sits under the issuer that
  // minted it, which is where a reader looks for it anyway.
  const tokensByIssuer = useMemo(() => {
    const grouped = new Map<string, typeof TOP_TOKENS[number][]>();
    for (const token of TOP_TOKENS) {
      if (!token.issuerSlug) continue;
      const list = grouped.get(token.issuerSlug);
      if (list) list.push(token);
      else grouped.set(token.issuerSlug, [token]);
    }
    for (const list of grouped.values()) list.sort((a, b) => b.marketCapUsd - a.marketCapUsd);
    return grouped;
  }, []);

  const toggle = (slug: string) =>
    setOpen((previous) => {
      const next = new Set(previous);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  const isOpen = (slug: string) => expandAll || open.has(slug);

  // The eight fields that used to be their own columns, now shown on expand.
  const detailFields = (issuer: Issuer) => [
    { key: t('Wrapper', '法律包装', 'ラッパー'), value: L(WRAPPER_LABEL[issuer.wrapper]), tone: 'text-muted-foreground' },
    {
      key: t('Voting', '投票权', '議決権'),
      value: L(VOTING_LABEL[issuer.voting]),
      tone: issuer.voting === 'full' ? 'text-positive' : issuer.voting === 'none' ? 'text-negative' : 'text-muted-foreground',
    },
    { key: t('Dividend', '股息', '配当'), value: L(DIVIDEND_LABEL[issuer.dividend]), tone: 'text-muted-foreground' },
    {
      key: t('Redemption', '赎回', '償還'),
      value:
        issuer.redemption.available === 'unknown'
          ? t('unknown', '未知', '不明')
          : issuer.redemption.available
            ? `${t('yes', '支持', '可')}${issuer.redemption.refusable ? t(' · refusable', ' · 可被拒绝', ' · 拒否可能') : ''}`
            : t('no', '不支持', '不可'),
      tone: issuer.redemption.refusable ? 'text-negative' : 'text-muted-foreground',
    },
    {
      key: t('PoR', '储备证明', '準備金証明'),
      value: L(POR_LABEL[issuer.proofOfReserve.kind]),
      tone: issuer.proofOfReserve.kind === 'chainlink-por' ? 'text-positive' : 'text-muted-foreground',
    },
    {
      key: t('US access', '美国准入', '米国アクセス'),
      value: L(US_LABEL[issuer.usPersons]),
      tone: issuer.usPersons === 'accredited' ? 'text-positive' : issuer.usPersons === 'blocked' ? 'text-negative' : 'text-muted-foreground',
    },
    { key: t('Jurisdiction', '司法管辖', '法域'), value: L(issuer.jurisdiction), tone: 'text-muted-foreground' },
  ];

  return (
    <section className='border-b border-border py-12'>
      <h2 className='mb-5 text-xl font-semibold tracking-[-0.015em]'>{t('Issuers', '发行方', '発行体')}</h2>

      <div className='mb-5 flex flex-wrap items-center gap-x-4 gap-y-3'>
        <div className='flex overflow-hidden rounded-sm border border-border-strong'>
          {(['issuer', 'venue'] as const).map((option, index) => (
            <button
              key={option}
              type='button'
              onClick={() => setView(option)}
              aria-pressed={view === option}
              className={`px-4 py-2.5 font-mono text-[11.5px] transition-colors ${index > 0 ? 'border-l border-border-strong' : ''} ${
                view === option ? 'bg-surface-2 text-foreground' : 'text-subtle hover:text-foreground'
              }`}
            >
              {option === 'issuer' ? t('By issuer', '按发行方', '発行体別') : t('By venue', '按交易所', '取引所別')}
            </button>
          ))}
        </div>

        <label className='flex items-center gap-2 font-mono text-[11px] text-subtle'>
          {t('Issuance', '发行模型', '発行モデル')}
          <select
            value={model}
            onChange={(event) => setModel(event.target.value as ModelFilter)}
            className='rounded-sm border border-border bg-surface px-2.5 py-2 font-mono text-[11px] text-foreground'
          >
            {models.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? t('All', '全部', 'すべて') : L(ISSUANCE_LABEL[option])}
              </option>
            ))}
          </select>
        </label>

        {view === 'issuer' && (
          <label className='flex cursor-pointer items-center gap-2 font-mono text-[11px] text-subtle sm:ml-auto'>
            <input
              type='checkbox'
              checked={expandAll}
              onChange={(event) => setExpandAll(event.target.checked)}
              className='size-3.5 accent-brand'
            />
            {t('Expand all', '全部展开', 'すべて展開')}
          </label>
        )}
      </div>

      {issuers.length === 0 ? (
        <p className='rounded border border-border bg-surface p-6 text-center text-[13px] text-subtle'>
          {t('No issuer matches this filter.', '没有发行方符合该筛选。', 'この条件に該当する発行体はありません。')}
        </p>
      ) : view === 'issuer' ? (
        <>
          <div className='border border-border'>
            <table className='w-full border-collapse text-[13px]'>
              <thead>
                <tr>
                  <th className={TH}>{t('Issuer', '发行方', '発行体')}</th>
                  <th className={`${TH} hidden sm:table-cell`}>{t('Issuance', '发行模型', '発行モデル')}</th>
                  <th className={`${TH} text-right`}>{t('On-chain', '链上规模', 'オンチェーン')}</th>
                  <th className={`${TH} text-right`}>{t('Instruments', '标的数', '銘柄数')}</th>
                  <th className={TH}>{t('Grade', '评级', '評価')}</th>
                </tr>
              </thead>
              <tbody>
                {issuers.map((issuer) => {
                  const expanded = isOpen(issuer.slug);
                  return (
                    <Fragment key={issuer.slug}>
                      <tr className={expanded ? 'bg-surface-2' : ''}>
                        <td className={`border-b border-border p-0 ${expanded ? 'border-l-2 border-l-brand' : ''}`}>
                          <button
                            type='button'
                            onClick={() => toggle(issuer.slug)}
                            aria-expanded={expanded}
                            className='flex min-h-11 w-full items-center gap-2.5 px-3.5 py-2.5 text-left'
                          >
                            <span aria-hidden='true' className={`font-mono text-[11px] ${expanded ? 'text-brand' : 'text-subtle'}`}>
                              {expanded ? '−' : '+'}
                            </span>
                            <span className='font-semibold'>{issuer.name}</span>
                            <span className='ml-auto font-mono text-[10px] text-subtle sm:hidden'>
                              {L(ISSUANCE_LABEL[issuer.issuanceModel])}
                            </span>
                          </button>
                        </td>
                        <td className='hidden border-b border-border px-3.5 py-2.5 font-mono text-[11px] text-muted-foreground sm:table-cell'>
                          {L(ISSUANCE_LABEL[issuer.issuanceModel])}
                        </td>
                        <td className='tnum border-b border-border px-3.5 py-2.5 text-right font-mono text-[12px]'>
                          {usd(issuer.onchainValueUsd)}
                        </td>
                        <td className='tnum border-b border-border px-3.5 py-2.5 text-right font-mono text-[12px]'>
                          {(() => {
                            const count = instrumentCountFor(issuer);
                            if (!count) return <span className='text-subtle'>—</span>;
                            // Only a counted figure has a page behind it; the
                            // rest are the issuer's own claim with nothing to open.
                            if (!count.counted) {
                              return (
                                <span
                                  className='text-muted-foreground'
                                  title={t("the issuer's own figure", '发行方自己公布的数字', '発行体の公表値')}
                                >
                                  {count.value}
                                </span>
                              );
                            }
                            return (
                              <Link
                                href={localizeHref(`/stocks/${issuer.slug}`, locale)}
                                title={t('counted from ingested instruments', '按已摄入的标的清单计数', '取り込んだ銘柄一覧から集計')}
                              >
                                {count.value} →
                              </Link>
                            );
                          })()}
                        </td>
                        <td className='border-b border-border px-3.5 py-2.5'>
                          <span className={`inline-block rounded-sm border px-2 py-0.5 font-mono text-[11px] ${GRADE_TONE[issuer.grade]}`}>
                            {L(GRADE_LABEL[issuer.grade])}
                          </span>
                        </td>
                      </tr>
                      {expanded && (
                        <tr className='bg-surface-2'>
                          <td colSpan={5} className='border-b border-border-strong border-l-2 border-l-brand px-4 pb-5 pt-1'>
                            <dl className='mb-3.5 grid grid-cols-2 gap-3 sm:grid-cols-4'>
                              {detailFields(issuer).map((field) => (
                                <div key={field.key}>
                                  <dt className='mono-label mb-1'>{field.key}</dt>
                                  <dd className={`m-0 font-mono text-[11.5px] ${field.tone}`}>{field.value}</dd>
                                </div>
                              ))}
                            </dl>

                            <p className='mb-3 max-w-[860px] text-[12.5px] leading-[1.7] text-muted-foreground'>{L(issuer.note)}</p>

                            <div className='flex flex-wrap items-center gap-1.5'>
                              <span className='mono-label mr-1'>{t('Where to buy', '在哪买', '購入場所')}</span>
                              {issuer.venues.length === 0 ? (
                                <span className='font-mono text-[10.5px] text-subtle'>{t('not disclosed', '未披露', '未開示')}</span>
                              ) : (
                                issuer.venues.map((venue) => (
                                  <span
                                    key={venue.name}
                                    title={L(VENUE_KIND_LABEL[venue.kind])}
                                    className={`rounded-sm border px-2 py-0.5 font-mono text-[10.5px] ${
                                      venue.kind === 'lending'
                                        ? 'border-dashed border-border text-subtle'
                                        : venue.operatedByIssuer
                                          ? 'border-brand text-brand'
                                          : 'border-border-strong text-muted-foreground'
                                    }`}
                                  >
                                    {venue.name}
                                    {venue.kind === 'lending' && <span className='ml-1'>· {L(VENUE_KIND_LABEL.lending)}</span>}
                                    {venue.operatedByIssuer && <span className='ml-1'>· {t('self-run', '自营', '自社')}</span>}
                                  </span>
                                ))
                              )}
                            </div>

                            {/* An ingested issuer gets a labelled way in. The count in
                                the row above is also a link, but a bare numeral is not
                                something a reader can see is clickable. */}
                            {instrumentCountFor(issuer)?.counted && (
                              <Link
                                href={localizeHref(`/stocks/${issuer.slug}`, locale)}
                                className='mt-3.5 flex items-center gap-2 font-mono text-[11.5px] text-brand'
                              >
                                {t(
                                  `All ${getInstrumentCount(issuer.slug)} instruments, with quotes`,
                                  `全部 ${getInstrumentCount(issuer.slug)} 个标的及行情`,
                                  `全 ${getInstrumentCount(issuer.slug)} 銘柄と価格`
                                )}
                                <span aria-hidden='true'>→</span>
                              </Link>
                            )}

                            {(tokensByIssuer.get(issuer.slug) ?? []).length > 0 && (
                              <div className='mt-3.5'>
                                <div className='mono-label mb-1.5'>
                                  {t('Largest tokens', '主要代币', '主要トークン')}
                                  <span className='ml-1.5 text-subtle'>
                                    {t(`hand-collected · ${DATA_AS_OF}`, `人工整理 · ${DATA_AS_OF}`, `手集計 · ${DATA_AS_OF}`)}
                                  </span>
                                </div>
                                <table className='w-full border-collapse border border-border text-[12px]'>
                                  <thead>
                                    <tr>
                                      <th className={TH}>{t('Token', '代币', 'トークン')}</th>
                                      <th className={`${TH} text-right`}>{t('Market cap', '市值', '時価総額')}</th>
                                      <th className={`${TH} text-right`}>{t('24h volume', '24h 成交', '24h 出来高')}</th>
                                      <th className={`${TH} text-right`}>{t('Turnover', '换手', '回転率')}</th>
                                      <th className={`${TH} text-right`}>{t('7d', '7 天', '7日')}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(tokensByIssuer.get(issuer.slug) ?? []).map((token) => {
                                      const turnover = token.volume24hUsd / token.marketCapUsd;
                                      return (
                                        <tr key={token.ticker} className='border-b border-border last:border-0'>
                                          <td className='px-3.5 py-2 font-mono text-[12px] font-medium'>{token.ticker}</td>
                                          <td className='tnum px-3.5 py-2 text-right font-mono text-[11.5px]'>{usd(token.marketCapUsd)}</td>
                                          <td className='tnum px-3.5 py-2 text-right font-mono text-[11.5px] text-muted-foreground'>
                                            {usd(token.volume24hUsd)}
                                          </td>
                                          <td
                                            className={`tnum px-3.5 py-2 text-right font-mono text-[11.5px] ${TURNOVER_TONE_CLASS[turnoverTone(turnover)]}`}
                                          >
                                            {formatTurnover(turnover)}
                                          </td>
                                          <td className={`tnum px-3.5 py-2 text-right font-mono text-[11.5px] ${changeToneClass(token.change7dPct)}`}>
                                            {formatChange(token.change7dPct)}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {issuer.chains.length > 0 && (
                              <div className='mt-3 flex flex-wrap items-center gap-1.5'>
                                <span className='mono-label mr-1'>{t('Chains', '链', 'チェーン')}</span>
                                <span className='font-mono text-[10.5px] text-subtle'>
                                  {issuer.chains.slice(0, CHAINS_SHOWN).join(' · ')}
                                  {issuer.chains.length > CHAINS_SHOWN &&
                                    t(
                                      ` · ${issuer.chains.length - CHAINS_SHOWN} more`,
                                      ` · 再 ${issuer.chains.length - CHAINS_SHOWN} 条`,
                                      ` · ほか ${issuer.chains.length - CHAINS_SHOWN}`
                                    )}
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className='mt-3 max-w-[700px] text-[13px] leading-[1.7] text-muted-foreground'>{L(TURNOVER_READING)}</p>

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
        </>
      ) : (
        <>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[640px] border-collapse border border-border text-[13px]'>
              <thead>
                <tr>
                  <th className={TH}>{t('Venue', '交易场所', '取引場所')}</th>
                  <th className={TH}>{t('Type', '类型', '種別')}</th>
                  <th className={TH}>{t('Issuers available', '可买到的发行方', '購入可能な発行体')}</th>
                  <th className={`${TH} text-right`}>{t('Reachable size', '可达规模', '到達可能な規模')}</th>
                </tr>
              </thead>
              <tbody>
                {buyVenues.map((entry) => (
                  <tr key={entry.venue} className='border-b border-border align-top last:border-0'>
                    <td className='px-3.5 py-2.5'>
                      <div className='font-semibold'>{entry.venue}</div>
                      {entry.operatedByIssuer && (
                        <div className='mt-0.5 font-mono text-[9.5px] text-brand'>{t('self-issued', '自营发行', '自社発行')}</div>
                      )}
                    </td>
                    <td className='px-3.5 py-2.5 font-mono text-[11px] text-muted-foreground'>{L(VENUE_KIND_LABEL[entry.kind])}</td>
                    <td className='px-3.5 py-2.5'>
                      <div className='flex flex-wrap gap-1.5'>
                        {entry.issuers.map((issuer) => (
                          <span
                            key={issuer.slug}
                            title={L(ISSUANCE_LABEL[issuer.issuanceModel])}
                            className={`rounded-sm border px-2 py-0.5 font-mono text-[10.5px] ${GRADE_TONE[issuer.grade]}`}
                          >
                            {issuer.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className='tnum px-3.5 py-2.5 text-right font-mono text-[12px]'>{usd(entry.reachableOnchainValueUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className='mt-2 font-mono text-[10.5px] leading-[1.6] text-subtle'>
            {t(
              'Reachable size is not additive — xStocks counts once under Kraken, Bybit and OKX alike.',
              '可达规模不可相加 —— xStocks 在 Kraken、Bybit、OKX 下各计一次。',
              '到達可能な規模は合計できません —— xStocks は Kraken、Bybit、OKX でそれぞれ一度ずつ数えられます。'
            )}
          </p>

          {collateralVenues.length > 0 && (
            <div className='mt-5 rounded border border-dashed border-border p-4'>
              <div className='mono-label mb-2'>
                {t('Collateral only — not a place to buy', '仅作抵押品 · 不是购买渠道', '担保のみ · 購入場所ではない')}
              </div>
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
