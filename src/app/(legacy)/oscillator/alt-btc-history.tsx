'use client';

import { useEffect, useState, useId } from 'react';
import { getTranslator, type Locale } from '@/lib/i18n';
import type { OscillatorResult } from '@/lib/oscillator-data';
import { formatAltBtcRatio } from '@/lib/oscillator-helpers';
import { isOscillatorHistory, UTC_DAY_MS, type OscillatorHistory } from '@/lib/oscillator-history';

const RANGES = [30, 90, 365, 0] as const;

export function historySourceLabel(source: OscillatorResult['historySource'], locale: Locale) {
  const t = getTranslator(locale);
  switch (source) {
    case 'binance': return t('Binance spot BTC pair', 'Binance 现货 BTC 对', 'Binance 現物 BTC ペア');
    case 'binance-cross': return t('Binance same-day USDT closes', 'Binance 同日 USDT 收盘价推导', 'Binance の同日 USDT 終値から算出');
    case 'coingecko': return t('CoinGecko BTC daily observations', 'CoinGecko BTC 计价日度观测', 'CoinGecko の BTC 建て日次観測');
    default: return t('Unavailable', '未取得', '取得できません');
  }
}

function HistoryGraph({ series, range, locale, symbol }: {
  series: OscillatorHistory;
  range: number;
  locale: Locale;
  symbol: string;
}) {
  const t = getTranslator(locale);
  const offset = range ? Math.max(0, series.closes.length - range) : 0;
  const closes = series.closes.slice(offset);
  const values = closes.filter((close): close is number => close !== null);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const plot = closes.flatMap((close, i) => {
    if (close === null) return [];
    const x = 12 + i / Math.max(1, closes.length - 1) * 616;
    const y = lo === hi ? 86 : 158 - (close - lo) / (hi - lo) * 144;
    return [{ command: i > 0 && closes[i - 1] !== null ? 'L' : 'M', x, y }];
  });
  const formatDate = (day: number) => new Date(day).toLocaleDateString(locale, {
    timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric',
  });
  const firstDay = formatDate(series.startDay + offset * UTC_DAY_MS);
  const lastDay = formatDate(series.startDay + (series.closes.length - 1) * UTC_DAY_MS);

  return (
    <figure className='space-y-3'>
      <div className='flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground'>
        <span>{t('Window low / high', '区间低点 / 高点', '期間の安値 / 高値')} {formatAltBtcRatio(lo)} / {formatAltBtcRatio(hi)}</span>
        <span>{t('Latest close', '最近收盘观测', '最新の終値観測')} {formatAltBtcRatio(values.at(-1) ?? null)} BTC</span>
      </div>
      <svg viewBox='0 0 640 172' role='img' aria-label={`${symbol}/BTC · ${firstDay} – ${lastDay}`} className='w-full rounded-xl border border-border text-emerald-600 dark:text-emerald-400'>
        <path d='M12 14H628 M12 86H628 M12 158H628' stroke='currentColor' opacity='0.18' fill='none' />
        <path
          d={plot.map(({ command, x, y }) => `${command}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')}
          stroke='currentColor' strokeWidth='2' fill='none' vectorEffect='non-scaling-stroke'
        />
        {plot.map(({ x, y, command }, i) => command === 'M' && plot[i + 1]?.command !== 'L'
          ? <circle key={x} cx={x} cy={y} r='2.8' fill='currentColor' />
          : null)}
      </svg>
      <figcaption className='flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground'>
        <span>{firstDay} – {lastDay} UTC</span>
        <span>{values.length}/{closes.length} {t('days observed', '天有观测', '日分を取得')}</span>
      </figcaption>
    </figure>
  );
}

export default function AltBtcHistory({ results, asOf, locale }: {
  results: OscillatorResult[];
  asOf: string;
  locale: Locale;
}) {
  const t = getTranslator(locale);
  const fieldId = useId();
  const [selection, setSelection] = useState('');
  const [range, setRange] = useState<number>(90);
  const [loaded, setLoaded] = useState<{ key: string; series: OscillatorHistory | null } | null>(null);
  const result = results.find((row) => row.coin.id === selection) ??
    results.find((row) => row.coin.id === 'ethereum' && (row.historyPointCount ?? 0) > 1) ??
    results.find((row) => (row.historyPointCount ?? 0) > 1) ?? results[0];
  const assetId = result?.coin.id;
  const canLoad = Boolean(assetId && (result?.historyPointCount ?? 0) > 1);
  const key = `${assetId}@${asOf}`;

  useEffect(() => {
    if (!assetId || !canLoad) return;
    const controller = new AbortController();
    const fetchSeries = async () => {
      try {
        const response = await fetch(`/data/oscillator-history/${encodeURIComponent(assetId)}.json?asOf=${encodeURIComponent(asOf)}`, {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]),
        });
        if (!response.ok) throw new Error('History is unavailable');
        const payload = await response.json();
        if (payload?.asOf !== asOf || !isOscillatorHistory(payload.series)) throw new Error('History is unavailable');
        if (!controller.signal.aborted) setLoaded({ key, series: payload.series });
      } catch {
        if (!controller.signal.aborted) setLoaded({ key, series: null });
      }
    };
    void fetchSeries();
    return () => controller.abort();
  }, [asOf, assetId, canLoad, key]);

  if (!result) return null;
  const current = loaded?.key === key ? loaded : null;

  return (
    <section className='space-y-4 rounded-2xl border border-border bg-surface p-4 sm:p-5'>
      <h3 className='text-lg font-semibold tracking-tight'>
        {t('ALT/BTC daily history', 'ALT/BTC 日度历史', 'ALT/BTC の日次履歴')}
      </h3>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <label htmlFor={fieldId} className='space-y-1 text-xs font-medium text-muted-foreground'>
          <span className='block'>{t('Asset', '标的', '資産')}</span>
          <select id={fieldId} value={assetId ?? ''} onChange={(event) => setSelection(event.target.value)}
            className='min-h-9 max-w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground'>
            {[...results].sort((a, b) => a.coin.symbol.localeCompare(b.coin.symbol)).map((row) => (
              <option key={row.coin.id} value={row.coin.id}>{row.coin.symbol} · {row.coin.name}</option>
            ))}
          </select>
        </label>
        <div role='group' aria-label={t('History time range', '历史区间', '履歴の期間')} className='flex flex-wrap gap-2'>
          {RANGES.map((days) => (
            <button key={days} type='button' aria-pressed={days === range} onClick={() => setRange(days)}
              className={`min-h-9 rounded-lg border px-3 text-xs ${days === range ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground'}`}>
              {days ? t(`${days}D`, `${days} 天`, `${days}日`) : t('All', '全部', 'すべて')}
            </button>
          ))}
        </div>
      </div>
      {canLoad && current?.series ? (
        <HistoryGraph series={current.series} range={range} locale={locale} symbol={result.coin.symbol} />
      ) : (
        <p role='status' className='rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground'>
          {canLoad && !current
            ? t('Loading daily observations…', '正在加载日度历史…', '日次履歴を読み込んでいます…')
            : t('Daily history is unavailable for this asset.', '该标的的日度历史暂未取得。', 'この資産の日次履歴は取得できません。')}
        </p>
      )}
      <p className='text-xs leading-relaxed text-muted-foreground'>
        {historySourceLabel(result.historySource, locale)}
        {result.historyMarkets?.length ? ` · ${result.historyMarkets.join(' / ')}` : ''}
        {result.historySource === 'binance-cross' ? t(
          ' · Asset/USDT close ÷ BTC/USDT close for the same UTC day',
          ' · 同一 UTC 日的标的/USDT 收盘价 ÷ BTC/USDT 收盘价',
          ' · 同じ UTC 日の資産/USDT 終値 ÷ BTC/USDT 終値'
        ) : ''}
        {result.historyRetained ? t(' · Previous observations retained', ' · 保留上次取得的观测', ' · 前回取得した観測を表示') : ''}
      </p>
    </section>
  );
}
