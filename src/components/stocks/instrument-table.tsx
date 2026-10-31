'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/locale-provider';
import { getInstruments, getQuote } from '@/data/instruments';
import { UNDERLYING_KIND_LABEL, pick, type UnderlyingKind } from '@/data/tokenized-equities';
import { localizeHref } from '@/lib/i18n';
import {
  MISSING,
  TURNOVER_TONE_CLASS,
  changeToneClass,
  formatChange,
  formatPrice,
  formatTurnover,
  formatUsd,
  turnoverTone,
} from '@/lib/instrument-format';

const TH =
  'border-b border-border-strong px-3.5 py-2.5 text-left font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-subtle';

const SORTS = ['marketCap', 'volume', 'turnover', 'listed'] as const;
type Sort = (typeof SORTS)[number];

/** Leveraged products sit on their own filter: their turnover runs an order of
 *  magnitude above the spot names, so one sorted list is all leverage at the top. */
const KIND_ORDER: UnderlyingKind[] = [
  'common-stock',
  'adr',
  'etf',
  'leveraged-etf',
  'inverse-etf',
  'pre-ipo',
  'unknown',
];

export default function InstrumentTable({ issuerSlug }: { issuerSlug: string }) {
  const { locale, t } = useI18n();
  const [sort, setSort] = useState<Sort>('marketCap');
  const [kind, setKind] = useState<UnderlyingKind | 'all'>('all');

  const instruments = getInstruments(issuerSlug);

  const kinds = useMemo(() => {
    const present = new Set(instruments.map((instrument) => instrument.underlying.kind));
    return KIND_ORDER.filter((value) => present.has(value));
  }, [instruments]);

  const rows = useMemo(() => {
    const picked = instruments.filter(
      (instrument) => kind === 'all' || instrument.underlying.kind === kind
    );
    const value = (ticker: string, key: 'marketCapUsd' | 'volume24hUsd' | 'turnover') =>
      getQuote(ticker)?.[key];

    return picked.slice().sort((a, b) => {
      if (sort === 'listed') {
        return b.listedAt.localeCompare(a.listedAt) || a.ticker.localeCompare(b.ticker);
      }
      const key = sort === 'marketCap' ? 'marketCapUsd' : sort === 'volume' ? 'volume24hUsd' : 'turnover';
      const av = value(a.ticker, key);
      const bv = value(b.ticker, key);
      // An instrument with no quote sorts last rather than as a zero.
      if (av === undefined && bv === undefined) return a.ticker.localeCompare(b.ticker);
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      return bv - av || a.ticker.localeCompare(b.ticker);
    });
  }, [instruments, kind, sort]);

  const chip = (active: boolean) =>
    `min-h-11 rounded-full border px-3.5 py-2 font-mono text-[11.5px] transition-colors ${
      active ? 'border-brand bg-surface-2 text-brand' : 'border-border text-subtle hover:text-foreground'
    }`;

  const sortLabel: Record<Sort, string> = {
    marketCap: t('Market cap', '市值', '時価総額'),
    volume: t('24h volume', '24h 成交', '24h 出来高'),
    turnover: t('Turnover', '换手', '回転率'),
    listed: t('Listed', '上线日', '上場日'),
  };

  return (
    <div>
      <div className='mb-5 flex flex-wrap gap-x-7 gap-y-4'>
        <div>
          <div className='mono-label mb-2'>{t('Sort', '排序', '並び順')}</div>
          <div className='flex flex-wrap gap-1.5'>
            {SORTS.map((option) => (
              <button
                key={option}
                type='button'
                onClick={() => setSort(option)}
                aria-pressed={sort === option}
                className={chip(sort === option)}
              >
                {sortLabel[option]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className='mono-label mb-2'>{t('Type', '类型', '種類')}</div>
          <div className='flex flex-wrap gap-1.5'>
            <button
              type='button'
              onClick={() => setKind('all')}
              aria-pressed={kind === 'all'}
              className={chip(kind === 'all')}
            >
              {t('All', '全部', 'すべて')}
            </button>
            {kinds.map((option) => (
              <button
                key={option}
                type='button'
                onClick={() => setKind(option)}
                aria-pressed={kind === option}
                className={chip(kind === option)}
              >
                {pick(UNDERLYING_KIND_LABEL[option], locale)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='overflow-x-auto border border-border'>
        <table className='w-full min-w-[820px] border-collapse text-[12.5px]'>
          <caption className='sr-only'>
            {t('Instruments issued by this issuer', '该发行方已发行的标的', 'この発行体が発行した銘柄')}
          </caption>
          <thead>
            <tr>
              <th scope='col' className={TH}>
                {t('Token', '代币', 'トークン')}
              </th>
              <th scope='col' className={TH}>
                {t('Underlying', '标的', '原資産')}
              </th>
              <th scope='col' className={TH}>
                {t('Type', '类型', '種類')}
              </th>
              <th scope='col' className={`${TH} text-right`}>
                {t('Price', '价格', '価格')}
              </th>
              <th scope='col' className={`${TH} text-right`}>
                {t('Market cap', '市值', '時価総額')}
              </th>
              <th scope='col' className={`${TH} text-right`}>
                {t('24h volume', '24h 成交', '24h 出来高')}
              </th>
              <th scope='col' className={`${TH} text-right`}>
                {t('Turnover', '换手', '回転率')}
              </th>
              <th scope='col' className={`${TH} text-right`}>
                {t('7d', '7 天', '7日')}
              </th>
              <th scope='col' className={`${TH} text-right`}>
                {t('Listed', '上线', '上場')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((instrument) => {
              const quote = getQuote(instrument.ticker);
              const leverage = instrument.underlying.leverage;
              return (
                <tr key={instrument.ticker} className='border-b border-border last:border-0'>
                  <td className='px-3.5 py-2.5 font-mono text-[12px] font-medium'>
                    <Link href={localizeHref(`/stocks/${issuerSlug}/${instrument.ticker}`, locale)}>
                      {instrument.ticker}
                    </Link>
                  </td>
                  <td className='px-3.5 py-2.5'>
                    {instrument.underlying.name}
                    {instrument.underlying.symbol && (
                      <span className='ml-1.5 font-mono text-[10.5px] text-subtle'>
                        {instrument.underlying.symbol}
                      </span>
                    )}
                  </td>
                  <td className='px-3.5 py-2.5 font-mono text-[11px] text-muted-foreground'>
                    {pick(UNDERLYING_KIND_LABEL[instrument.underlying.kind], locale)}
                    {leverage !== undefined && <span className='ml-1 text-subtle'>{leverage}x</span>}
                  </td>
                  <td className='tnum px-3.5 py-2.5 text-right font-mono text-[11.5px]'>
                    {formatPrice(quote?.priceUsd)}
                  </td>
                  <td className='tnum px-3.5 py-2.5 text-right font-mono text-[11.5px]'>
                    {formatUsd(quote?.marketCapUsd)}
                  </td>
                  <td className='tnum px-3.5 py-2.5 text-right font-mono text-[11.5px] text-muted-foreground'>
                    {formatUsd(quote?.volume24hUsd)}
                  </td>
                  <td
                    className={`tnum px-3.5 py-2.5 text-right font-mono text-[11.5px] ${TURNOVER_TONE_CLASS[turnoverTone(quote?.turnover)]}`}
                  >
                    {formatTurnover(quote?.turnover)}
                  </td>
                  <td
                    className={`tnum px-3.5 py-2.5 text-right font-mono text-[11.5px] ${changeToneClass(quote?.change7d)}`}
                  >
                    {formatChange(quote?.change7d)}
                  </td>
                  <td className='tnum px-3.5 py-2.5 text-right font-mono text-[11px] text-subtle'>
                    {instrument.listedAt}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className='px-3.5 py-5 font-mono text-[11.5px] text-subtle'>
                  {t('No instruments of this type', '没有这个类型的标的', 'この種類の銘柄はありません')}{' '}
                  {MISSING}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
