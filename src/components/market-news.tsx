import news from '@/data/market-news.json';
import { getTranslator, type Locale } from '@/lib/i18n';

type MarketPage = keyof typeof news.panels;

export function MarketNews({ page, locale }: { page: MarketPage; locale: Locale }) {
  const t = getTranslator(locale);
  const titles = {
    oscillator: t('Price and open interest alerts', '价格与未平仓量异动', '価格と建玉の急変'),
    watch: t('Exchange announcements', '交易所公告', '取引所からのお知らせ'),
    fear: t('Bitcoin and macro news', '比特币与宏观消息', 'ビットコインとマクロ経済のニュース'),
  };
  const items = news.panels[page];
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });

  return (
    <details className='rounded-lg border border-border bg-surface px-4 py-3' data-market-news={page}>
      <summary className='cursor-pointer text-sm font-semibold text-foreground'>
        {titles[page]} <span className='ml-2 font-normal text-muted-foreground'>({items.length})</span>
      </summary>
      <div className='mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
        <a className='underline underline-offset-2' href='https://eqn.news/'>
          {t('Equation News', '方程式新闻', 'Equation News')}
        </a>
        <span>
          {t('Snapshot collected', '快照采集于', '取得日時')}{' '}
          <time dateTime={news.fetchedAt}>{date.format(new Date(news.fetchedAt))} UTC</time>
        </span>
      </div>
      {items.length ? (
        <ul className='mt-2 divide-y divide-border'>
          {items.map(item => {
            const language = (locale === 'zh-CN' && item.zh) || !item.en ? 'zh-CN' : 'en';
            const caption = language === 'zh-CN' ? item.zh : item.en;
            const languageLabel = language === 'zh-CN'
              ? t('Chinese headline', '中文标题', '中国語見出し')
              : t('English headline', '英文标题', '英語見出し');
            return (
              <li className='py-2.5' key={item.id}>
                <a className='break-words text-sm font-medium hover:underline' href={item.url} lang={language}>{caption}</a>
                <div className='mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground'>
                  <time dateTime={item.publishedAt}>{date.format(new Date(item.publishedAt))} UTC</time>
                  <span>{item.source}</span>
                  {language !== locale ? <span>{languageLabel}</span> : null}
                  {item.sourceUrl ? (
                    <a className='underline underline-offset-2' href={item.sourceUrl}>{t('Source link', '来源链接', '配信元へのリンク')}</a>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className='mt-3 text-sm text-muted-foreground'>
          {t('No items in the seven-day window.', '采集窗口内没有消息。', '直近7日間の配信はありません。')}
        </p>
      )}
    </details>
  );
}
