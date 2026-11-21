'use client';

import { useState } from 'react';
import { getTranslator, type Locale } from '@/lib/i18n';
import { filterWatchListingEvents, watchEventRegion, watchEventStatus, type WatchListingEvent } from '@/lib/watch-listing-events';

const defaultFilters = { market: '', venue: '', region: '', status: '' };

export function ListingEvents({ events, reviewedAt, locale }: { events: WatchListingEvent[]; reviewedAt: string; locale: Locale }) {
  const t = getTranslator(locale);
  const [filters, setFilters] = useState(defaultFilters);
  const filtered = filterWatchListingEvents(events, filters, reviewedAt);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'UTC', hourCycle: 'h23' });
  const marketLabels = {
    spot: t('Spot', '现货', '現物'),
    perp: t('Perpetual', '永续合约', '無期限先物'),
    alpha: 'Binance Alpha',
  };
  const regionLabels = {
    kr: t('South Korea', '韩国', '韓国'),
    international: t('International venue', '国际平台', '国際取引所'),
  };
  const statusLabels = {
    verified: t('Verified effective time', '生效时间已核实', '発効日時を確認済み'),
    observed: t('Trading observed', '已观察到成交', '取引を観測済み'),
    announced: t('Announced', '已公告', '発表済み'),
    scheduled: t('Scheduled', '已排期', '予定あり'),
    pending: t('Awaiting verification', '待核实', '確認待ち'),
    postponed: t('Postponed', '已延期', '延期'),
    removed: t('Pair removal corroborated', '交易对移除已核对', '取引ペアの廃止を確認済み'),
    discovered: t('Alpha discovery', 'Alpha 收录', 'Alpha 掲載を検出'),
  };
  const actionLabels = {
    listing: t('Listing', '上市', '上場'),
    delisting: t('Pair removal', '交易对移除', '取引ペア廃止'),
    postponement: t('Listing postponement', '上市延期', '上場延期'),
    discovery: t('Token discovery', '代币收录', 'トークン掲載'),
  };
  const assetLabels = {
    crypto: t('Crypto', '加密资产', '暗号資産'),
    'tokenized-equity': t('Tokenized security', '代币化证券', 'トークン化証券'),
    'equity-linked': t('Equity-linked contract', '股票挂钩合约', '株式連動型契約'),
  };
  const evidenceLabels = {
    'first-trade': t('First trade', '首笔成交', '初回約定'),
    'onboard-date': t('Exchange instrument timestamp', '交易所合约上线时间', '取引所の銘柄登録時刻'),
    'minute-bar': t('First observed 1-minute bar', '最早观察到的 1 分钟 K 线', '観測範囲で最初の1分足'),
    'pair-break': t('Pair status BREAK', '交易对状态为 BREAK', 'ペアの状態は BREAK'),
  };
  const controls = [
    { key: 'market', label: t('Market', '市场类型', '市場区分'), options: Object.entries(marketLabels) },
    { key: 'venue', label: t('Venue', '交易场所', '取引所'), options: Array.from(new Set(events.map(event => event.venue))).sort().map(venue => [venue, venue]) },
    { key: 'region', label: t('Region', '地区', '地域'), options: Object.entries(regionLabels) },
    { key: 'status', label: t('Event status', '事件状态', 'イベントの状態'), options: Object.entries(statusLabels).filter(([status]) => events.some(event => watchEventStatus(event, reviewedAt) === status)) },
  ] as const;

  function time(value: string | null | undefined) {
    return value ? <time dateTime={value} title={value} className='tabular-nums'>{date.format(new Date(value))} UTC</time> : <span>{t('Unavailable', '暂无', '未取得')}</span>;
  }

  return (
    <details className='rounded-lg border border-border bg-surface' data-watch-listing-events>
      <summary className='cursor-pointer px-4 py-3 text-sm font-semibold text-foreground'>
        {t('Listing event timeline', '上市事件时间线', '上場イベントのタイムライン')}
        <span className='ml-2 font-normal text-muted-foreground'>({events.length})</span>
      </summary>
      <div className='space-y-4 border-t border-border px-4 py-4'>
        <p className='text-xs leading-relaxed text-muted-foreground'>
          {t('Evidence checked through', '证据核对截至', '照合日時')}{' '}{time(reviewedAt)}
        </p>
        <div className='grid grid-cols-2 gap-2.5 sm:grid-cols-4'>
          {controls.map(({ key, label, options }) => (
            <label className='grid min-w-0 gap-1 text-xs font-medium text-muted-foreground' key={key}>
              {label}
              <select
                className='w-full min-w-0 rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground'
                value={filters[key]}
                onChange={event => setFilters({ ...filters, [key]: event.currentTarget.value })}>
                <option value=''>{t('All', '全部', 'すべて')}</option>
                {options.map(([value, title]) => <option key={value} value={value}>{title}</option>)}
              </select>
            </label>
          ))}
        </div>

        {filtered.length ? (
          <ol className='grid gap-3 lg:grid-cols-2'>
            {filtered.map(event => {
              const { notice, eqn, effective, observed, previousSchedule } = event;
              const status = watchEventStatus(event, reviewedAt);
              return (
                <li key={event.id} className='min-w-0 rounded-lg border border-border bg-background p-3.5' data-listing-event={event.id}>
                  <div className='flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1'>
                    <h3 className='min-w-0 break-words text-sm font-semibold'>{event.instruments.join(' · ')}</h3>
                    <span className='rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground'>{statusLabels[status]}</span>
                  </div>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    {event.venue} · {marketLabels[event.market]} · {regionLabels[watchEventRegion(event.venue)]} · {actionLabels[event.action]}
                    {event.assetKind === 'crypto' ? null : ` · ${assetLabels[event.assetKind]}`}
                    {event.chain ? ` · ${event.chain}` : ''}
                  </p>
                  {event.contractAddress ? <code className='mt-1 block break-all text-xs text-muted-foreground'>{event.contractAddress}</code> : null}
                  <dl className='mt-3 grid min-w-0 grid-cols-1 gap-x-3 gap-y-3 text-xs sm:grid-cols-2'>
                    <div className='space-y-1'>
                      <dt className='font-medium text-muted-foreground'>{t('Exchange publication', '交易所公告发布时间', '取引所の発表日時')}</dt>
                      <dd data-event-time='publication'>
                        {time(notice?.publishedAt)}
                        {notice?.displayedPublication ? (
                          <span className='block text-muted-foreground'>
                            {notice.displayedPublication} · {notice.displayedPublication.includes(' ')
                              ? t('source time zone unspecified', '来源未标时区', '時刻帯の記載なし')
                              : t('date supplied by the source', '来源仅提供日期', '出典には日付のみ記載')}
                          </span>
                        ) : null}
                      </dd>
                    </div>
                    {eqn ? (
                      <div className='space-y-1'>
                        <dt className='font-medium text-muted-foreground'>{t('EQN report time', 'EQN 报道时间', 'EQN の配信日時')}</dt>
                        <dd data-event-time='eqn'>{time(eqn.publishedAt)}</dd>
                      </div>
                    ) : null}
                    <div className='space-y-1'>
                      <dt className='font-medium text-muted-foreground'>{t('Scheduled time', '公告计划时间', '予定日時')}</dt>
                      <dd data-event-time='schedule'>{time(event.scheduledAt)}</dd>
                    </div>
                    {previousSchedule ? (
                      <div className='space-y-1'>
                        <dt className='font-medium text-muted-foreground'>{t('Superseded schedule', '已取消原排期', '変更前の予定日時')}</dt>
                        <dd data-event-time='previous-schedule'>{time(previousSchedule.at)}</dd>
                      </div>
                    ) : null}
                    <div className='space-y-1'>
                      <dt className='font-medium text-muted-foreground'>{t('Verified effective time', '已核实生效时间', '確認済みの発効日時')}</dt>
                      <dd data-event-time='effective'>
                        {time(effective?.effectiveAt)}
                        {effective ? <span className='block text-muted-foreground'>{evidenceLabels[effective.basis]}</span> : null}
                      </dd>
                    </div>
                    {observed ? (
                      <div className='space-y-1'>
                        <dt className='font-medium text-muted-foreground'>{t('Market observation', '市场观察时间', '市場の観測日時')}</dt>
                        <dd data-event-time='observed'>
                          {time(observed.firstObservedAt)}
                          <span className='block text-muted-foreground'>{evidenceLabels[observed.basis]}</span>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  <div className='mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-2'>
                    {notice ? <a href={notice.url}>{t('Exchange notice', '交易所原公告', '取引所の告知')}</a> : null}
                    {notice?.publicationSourceUrl ? <a href={notice.publicationSourceUrl}>{t('Publication data', '发布时间来源', '発表日時の出典')}</a> : null}
                    {eqn ? <a href={eqn.url}>{t('EQN report', 'EQN 报道', 'EQN の配信記事')}</a> : null}
                    {previousSchedule ? <a href={previousSchedule.url}>{t('Earlier notice', '旧公告', '変更前の告知')}</a> : null}
                    {event.productUrl ? <a href={event.productUrl}>{t('Product page', '产品页', '商品ページ')}</a> : null}
                    {effective && effective.url !== observed?.url ? <a href={effective.url}>{t('Effective time source', '生效时间来源', '発効日時の出典')}</a> : null}
                    {observed ? <a href={observed.url}>{t('Market data', '市场数据', '市場データ')}</a> : null}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p role='status' className='text-sm text-muted-foreground'>
            {t('No listing events match these filters.', '当前筛选下没有上市事件。', '条件に一致する上場イベントはありません。')}
          </p>
        )}
      </div>
    </details>
  );
}
