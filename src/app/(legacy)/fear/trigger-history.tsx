'use client';

import { useState } from 'react';
import {
  DAY_MS,
  FEAR_SIGNAL_IDS,
  FEAR_SIGNAL_LABELS,
  findFearTriggers,
  summarizeFearHistory,
  type FearHistoryPoint,
  type FearHistorySources,
} from '@/lib/fear-signals';
import { useDashboardI18n } from './use-dashboard-i18n';

type ScoredDay = ReturnType<typeof summarizeFearHistory>[number];

function line(
  points: ScoredDay[],
  x: (date: string) => number,
  y: (value: number) => number,
  valueOf: (point: ScoredDay) => number | null,
) {
  let previous: number | null = null;
  return points.map(point => {
    const value = valueOf(point);
    if (value === null) {
      previous = null;
      return '';
    }
    const day = Date.parse(point.date);
    const command = previous !== null && day - previous === DAY_MS ? 'L' : 'M';
    previous = day;
    return `${command}${x(point.date).toFixed(2)} ${y(value).toFixed(2)}`;
  }).join(' ');
}

export function FearTriggerHistory({ history, historySources }: {
  history: FearHistoryPoint[];
  historySources?: FearHistorySources;
}) {
  const { locale, d } = useDashboardI18n();
  const [threshold, setThreshold] = useState(55);
  const [consecutive, setConsecutive] = useState(3);
  const points = summarizeFearHistory(history);
  const first = points[0];
  const last = points.at(-1);
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' });
  const moment = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });
  const displayDate = (day: string) => <time dateTime={day}>{date.format(Date.parse(day))}</time>;
  const heading = d('Historical trigger chart');

  if (!first || !last) {
    return (
      <section aria-labelledby='fear-history-title' className='space-y-3 rounded-xl border p-5'>
        <h2 id='fear-history-title' className='text-lg font-semibold'>{heading}</h2>
        <p className='text-sm text-muted-foreground'>{d('Daily observations unavailable')}</p>
      </section>
    );
  }

  const triggers = findFearTriggers(points, threshold, consecutive);
  const paired = points.filter(point => point.btcClose !== null && point.score !== null);
  const minCoverage = Math.min(...points.map(point => point.known));
  const maxCoverage = Math.max(...points.map(point => point.known));
  const prices = points.flatMap(point => point.btcClose === null ? [] : [point.btcClose]);
  const priceMin = prices.length ? Math.min(...prices) : 0;
  const priceMax = prices.length ? Math.max(...prices) : 0;
  const start = Date.parse(first.date);
  const spanDays = (Date.parse(last.date) - start) / DAY_MS + 1;
  const dayWidth = 960 / spanDays;
  const x = (day: string) => (((Date.parse(day) - start) / DAY_MS) + 0.5) * dayWidth;
  const scoreY = (score: number) => 115 - score * 1.1;
  const priceY = (price: number) => 189 - (price - priceMin) / (priceMax - priceMin || 1) * 51;
  const triggerDays = triggers.reduce((sum, item) => sum + item.days - consecutive + 1, 0);
  const signals = FEAR_SIGNAL_IDS.length;

  return (
    <section aria-labelledby='fear-history-title' className='space-y-5 rounded-xl border p-5'>
      <div className='space-y-2'>
        <h2 id='fear-history-title' className='text-lg font-semibold'>{heading}</h2>
        <p className='text-sm text-muted-foreground'>
          {d('Daily scores are reconstructed from observations for each closed UTC day. Missing price or score and date gaps break a streak.')}
        </p>
      </div>

      <div className='flex flex-wrap items-end gap-4'>
        <label className='grid gap-1 text-sm' htmlFor='fear-score-threshold'>
          {d('Score threshold')}
          <select
            id='fear-score-threshold'
            value={threshold}
            onChange={event => setThreshold(Number(event.target.value))}
            className='rounded-md border border-border bg-background px-3 py-2'
          >
            {[45, 50, 55, 60, 65, 70, 75, 80, 90, 100].map(value => <option key={value} value={value}>≥ {number.format(value)}</option>)}
          </select>
        </label>
        <label className='grid gap-1 text-sm' htmlFor='fear-minimum-days'>
          {d('Minimum consecutive days')}
          <select
            id='fear-minimum-days'
            value={consecutive}
            onChange={event => setConsecutive(Number(event.target.value))}
            className='rounded-md border border-border bg-background px-3 py-2'
          >
            {[1, 2, 3, 5, 7, 14].map(value => <option key={value} value={value}>{number.format(value)}</option>)}
          </select>
        </label>
      </div>

      <figure className='space-y-2'>
        <figcaption className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'>
          <span>{d('Bottom Score')} · 0–100</span>
          <span>{d('BTC/USDT daily close')} · {number.format(priceMin)}–{number.format(priceMax)} USDT</span>
          <span className='inline-flex items-center gap-1.5'>
            <span aria-hidden className='size-2.5 rounded-sm bg-emerald-500/50' />
            {d('Days with a confirmed streak')}
          </span>
        </figcaption>
        <svg
          viewBox='0 0 960 194'
          preserveAspectRatio='none'
          role='img'
          aria-label={d('Daily score and BTC/USDT close with confirmed trigger periods')}
          className='h-48 w-full rounded-lg bg-surface sm:h-60'
        >
          {triggers.map(item => (
            <rect key={item.trigger.date} x={x(item.trigger.date) - dayWidth / 2} y={0}
              width={x(item.end.date) - x(item.trigger.date) + dayWidth} height={194} className='fill-emerald-500/20' />
          ))}
          {[0, 25, 50, 75, 100].map(value => (
            <line key={value} x1={0} y1={scoreY(value)} x2={960} y2={scoreY(value)} className='stroke-border' />
          ))}
          <line x1={0} y1={scoreY(threshold)} x2={960} y2={scoreY(threshold)}
            strokeDasharray='5 5' vectorEffect='non-scaling-stroke' className='stroke-amber-600' />
          <line x1={0} y1={127} x2={960} y2={127} className='stroke-border' />
          <path d={line(points, x, scoreY, point => point.score)} fill='none' strokeWidth={2} vectorEffect='non-scaling-stroke' className='stroke-foreground' />
          <path d={line(points, x, priceY, point => point.btcClose)} fill='none' strokeWidth={1.5} vectorEffect='non-scaling-stroke' className='stroke-sky-600 dark:stroke-sky-400' />
        </svg>
        <div className='flex flex-wrap justify-between gap-2 text-xs text-muted-foreground'>
          <span>{displayDate(first.date)} · UTC</span>
          <span>{displayDate(last.date)} · UTC</span>
        </div>
      </figure>

      <p aria-live='polite' className='flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground'>
        <span>{d('Days with price and score')} {number.format(paired.length)}/{number.format(points.length)}</span>
        <span>{d('Signal coverage')} {minCoverage === maxCoverage ? minCoverage : `${minCoverage}–${maxCoverage}`}/{signals}</span>
        <span>{d('Trigger periods')} {number.format(triggers.length)}</span>
        <span>{d('Days with a confirmed streak')} {number.format(triggerDays)}</span>
      </p>

      {historySources ? (
        <div className='space-y-2'>
          <h3 className='text-sm font-semibold'>{d('Historical source refresh status')}</h3>
          <dl className='grid gap-2 text-xs text-muted-foreground sm:grid-cols-2'>
            {Object.values(historySources).map(source => (
              <div key={source.source}>
                <dt className='font-medium text-foreground'>{d(source.source)}</dt>
                <dd className='mt-1 flex flex-wrap gap-x-2'>
                  <span>{d(source.status === 'ok' ? 'Archive refresh complete' : source.status === 'degraded' ? 'Partial archive refresh' : 'No fresh archive windows')}</span>
                  <span>{d('Refreshed days')} {number.format(source.freshDays)}</span>
                  <span>{d('Retained days')} {number.format(source.retainedDays)}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      <div className='space-y-3'>
        <h3 id='fear-trigger-details' className='text-sm font-semibold'>{d('Trigger details')}</h3>
        {triggers.length ? (
          <div role='region' aria-labelledby='fear-trigger-details' tabIndex={0} className='max-w-full overflow-x-auto rounded-md border'>
            <table className='min-w-[760px] w-full border-collapse text-left text-xs [&_td]:p-2.5 [&_th]:p-2.5'>
              <thead className='border-b bg-surface'>
                <tr>
                  {['Streak start', 'Trigger confirmed', 'Last qualifying day', 'Qualifying days', 'Peak score', 'Signal coverage', 'Trigger close', 'Signals on trigger day'].map(label => (
                    <th scope='col' key={label} className='font-medium'>{d(label)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y'>
                {triggers.map(item => (
                  <tr key={item.trigger.date} className='align-top'>
                    <td className='whitespace-nowrap'>{displayDate(item.start.date)}</td>
                    <td className='whitespace-nowrap font-semibold'>{displayDate(item.trigger.date)}</td>
                    <td className='whitespace-nowrap'>{displayDate(item.end.date)}</td>
                    <td>{number.format(item.days)}</td>
                    <td>{number.format(item.peak)}</td>
                    <td className='whitespace-nowrap'>{item.minKnown === item.maxKnown ? item.minKnown : `${item.minKnown}–${item.maxKnown}`}/{signals}</td>
                    <td className='whitespace-nowrap'>{item.trigger.btcClose === null ? '—' : `${number.format(item.trigger.btcClose)} USDT`}</td>
                    <td>
                      <details>
                        <summary className='cursor-pointer whitespace-nowrap'>{item.trigger.known}/{signals}</summary>
                        <ul className='space-y-1 py-2'>
                          {FEAR_SIGNAL_IDS.filter(id => item.trigger.signals[id] !== 'unknown').map(id => {
                            const origin = id === 'funding' || id === 'uniqueAddresses' ? item.trigger.retainedFrom?.[id] : undefined;
                            return (
                              <li key={id}>
                                {d(FEAR_SIGNAL_LABELS[id])} · {d(item.trigger.signals[id].toUpperCase())}
                                {origin ? (
                                  <span className='block text-muted-foreground'>
                                    {d('Retained from snapshot')} <time dateTime={origin}>{moment.format(Date.parse(origin))} UTC</time>
                                  </span>
                                ) : null}
                              </li>
                            );
                          })}
                        </ul>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className='text-sm text-muted-foreground'>{d('No periods meet the current settings.')}</p>}
      </div>

      <p className='flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground'>
        <a className='underline' href='https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/rest-api/market'>{d('Binance closed spot candles')}</a>
        <a className='underline' href='https://alternative.me/crypto/fear-and-greed-index/'>{d('Alternative.me Fear & Greed')}</a>
        <a className='underline' href='https://www.blockchain.com/explorer/charts/n-unique-addresses'>{d('Blockchain.com unique addresses used')}</a>
        <a className='underline' href='https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals'>{d('Hyperliquid settled BTC funding')}</a>
        {historySources?.realizedPrice ? <a className='underline' href='https://bitview.space/'>{d('Bitview BTC valuation')}</a> : null}
      </p>
    </section>
  );
}
