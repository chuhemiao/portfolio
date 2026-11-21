import archive from '@/data/pulse-card-weekly.json';
import {
  addCardDays, cardMetrics, cardProjects, cardReceiptFractionDigits, compareCardWeeks, readCardWeeks,
  type CardMetric, type CardProject, type CardReceiptSubtotals, type CardWeek,
} from '@/lib/card-weekly';
import { getTranslator, type Locale } from '@/lib/i18n';

const names: Record<CardProject, string> = {
  'collector-crypt': 'Collector Crypt',
  oripa: 'ORIPA',
  renaiss: 'Renaiss',
};

const labels: Record<CardMetric, [string, string, string]> = {
  packOpenings: ['Gross pack sales', '开包毛流水', 'パック売上総額'],
  secondarySales: ['Secondary sales', '二级市场成交额', '二次流通取引額'],
  cardBuybacks: ['Card buybacks', '卡牌回购额', 'カード買い戻し額'],
  tokenBuybacks: ['Token buybacks', '代币回购额', 'トークン買い戻し額'],
  protocolRevenue: ['Net protocol revenue', '协议净收入', 'プロトコル純収益'],
  holdersRevenue: ['Holders revenue (composite)', '持币人收入（合并口径）', '保有者収益（合算）'],
};

function sourceLink(source: { title: string; url: string }) {
  return <a href={source.url} className='underline underline-offset-2 hover:text-foreground'>{source.title}</a>;
}

function dateRange(start: string, end: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  }).formatRange(new Date(start), new Date(addCardDays(end, -1)));
}

function eventDate(date: string, locale: Locale, end?: string) {
  const format = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium', timeZone: 'UTC', ...(date.length > 10 ? { timeStyle: 'medium' } : {}),
  });
  return end ? format.formatRange(new Date(date), new Date(end)) + ' UTC' :
    format.format(new Date(date)) + (date.length > 10 ? ' UTC' : '');
}

function ProjectReport({ project, report, previousReport, locale, subtotals, comparisonSubtotals }: {
  project: CardProject; report: CardWeek['projects'][CardProject]; previousReport?: CardWeek['projects'][CardProject]; locale: Locale;
  subtotals?: CardReceiptSubtotals; comparisonSubtotals?: CardReceiptSubtotals;
}) {
  const t = getTranslator(locale);
  const { state, metrics, milestones } = report;
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const nativeAmount = new Intl.NumberFormat(locale, { maximumFractionDigits: cardReceiptFractionDigits });
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 2, signDisplay: 'exceptZero' });
  const availableFields: CardMetric[] = [...cardMetrics];
  if (metrics.protocolRevenue) availableFields.push('protocolRevenue');
  if (metrics.holdersRevenue) availableFields.push('holdersRevenue');
  const hasSubtotal = availableFields.some(key => metrics[key]?.receiptSubtotal);

  return (
    <section data-card-project={project} className='space-y-4 rounded-lg border border-border bg-surface p-4 sm:p-5'>
      <div className='flex flex-wrap items-center gap-2'>
        <h4 className='font-semibold'>{names[project]}</h4>
        {state === 'prelaunch' && <span className='rounded border border-border px-2 py-0.5 text-xs text-muted-foreground'>
          {t('Prelaunch this week', '本周处于上线前', '今週は公開前')}
        </span>}
      </div>
      <table className='w-full table-fixed text-left text-xs sm:text-sm' aria-label={names[project]}>
        <thead className='border-b border-border text-muted-foreground'>
          <tr>
            <th className='w-[39%] py-2 pr-2 font-medium' scope='col'>
              {hasSubtotal ? t('Metric', '指标', '指標') : t('Metric (USD)', '指标（美元）', '指標（米ドル）')}
            </th>
            <th className='py-2 pr-2 font-medium' scope='col'>{t('This week', '本期', '今週')}</th>
            <th className='py-2 font-medium' scope='col'>{t('Prior week', '对照周', '比較週')}</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-border'>
          {availableFields.map(key => {
            const metric = metrics[key]!;
            const change = metric.current && !metric.current.confidence95 && metric.previous && metric.previous.value > 0
              ? (metric.current.value - metric.previous.value) / metric.previous.value : null;
            const receiptSubtotals = [subtotals?.[key], comparisonSubtotals?.[key]];
            const cells = [metric.current, metric.previous];
            return (
              <tr key={key} data-card-metric={key}>
                <th className='break-words py-3 pr-2 align-top font-medium' scope='row'>{t(...labels[key])}</th>
                {cells.map((value, index) => {
                  const subtotal = receiptSubtotals[index];
                  const periodMetric = index === 0 ? metric : previousReport?.metrics[key];
                  const basis = (periodMetric ?? metric).receiptSubtotal;
                  const missing = periodMetric?.missing === 'prelaunch' ? t('Prelaunch', '上线前', '公開前') :
                    periodMetric?.missing === 'rate-limited' ? t('Unavailable (429)', '暂缺（429 限流）', '未取得（429）') :
                      t('Unavailable', '暂无核实数据', '確認済みデータなし');
                  return <td key={index} className='break-words py-3 pr-2 align-top tabular-nums'
                    data-amount={subtotal?.value ?? value?.value ?? 'unavailable'}
                    data-asset={subtotal ? basis?.asset : undefined}>
                    {basis && subtotal ? <>
                      <p className='font-semibold'>≥ {nativeAmount.format(subtotal.value)} {basis.asset}</p>
                      <p className='mt-0.5 text-xs text-muted-foreground'>
                        {t(`${subtotal.count} verified settlements`, `已核实 ${subtotal.count} 笔结算`, `確認済みの決済 ${subtotal.count} 件`)}
                      </p>
                      <p className='mt-0.5 text-xs text-muted-foreground'>{sourceLink(basis.source)}</p>
                    </> : value ? <>
                      <p className='font-semibold'>{value.confidence95 ? '≈ ' : ''}{money.format(value.value)}</p>
                      {value.confidence95 && <p className='mt-0.5 text-xs text-muted-foreground'>
                        {t('95% CI', '95% 置信区间', '95% 信頼区間')}{' '}{money.format(value.confidence95[0])}–{money.format(value.confidence95[1])}
                      </p>}
                      {index === 0 && change !== null && <p className='mt-0.5 text-xs text-muted-foreground'>{percent.format(change)}</p>}
                      <p className='mt-0.5 text-xs text-muted-foreground'>{sourceLink(value.source)}</p>
                    </> : <>
                      <p className='text-muted-foreground'>{missing}</p>
                      {metric.source && index === 0 && <p className='mt-0.5 text-xs text-muted-foreground'>{sourceLink(metric.source)}</p>}
                    </>}
                  </td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {milestones.length > 0 && <ul className='space-y-2 text-xs leading-relaxed text-muted-foreground sm:text-sm'>
        {milestones.map(item => (
          <li key={`${item.date}:${item.source.url}`}>
            <time dateTime={item.date} className='font-medium text-foreground'>{eventDate(item.date, locale, item.end)}</time>
            {item.kind === 'planned' ? ` · ${t('Planned', '计划', '予定')}` : ''} · {item.text[locale]} {sourceLink(item.source)}
          </li>
        ))}
      </ul>}
    </section>
  );
}

function Report({ week, previousWeek, locale }: { week: CardWeek; previousWeek?: CardWeek; locale: Locale }) {
  const t = getTranslator(locale);
  const priorStart = addCardDays(week.weekStart, -7);
  const prior = dateRange(priorStart, week.weekStart, locale);
  const amount = new Intl.NumberFormat(locale, {
    minimumFractionDigits: cardReceiptFractionDigits, maximumFractionDigits: cardReceiptFractionDigits,
  });
  const count = new Intl.NumberFormat(locale);
  const { projects, previous, settlements, subtotals, comparisonSettlements, comparisonSubtotals } = compareCardWeeks(week, previousWeek);
  const hasLegacyComparison = !previous && (comparisonSettlements.length > 0 || cardProjects.some(project =>
    Object.values(projects[project].metrics).some(metric => metric?.previous)));
  const evidence = [
    { period: 'current', start: week.weekStart, entries: settlements, title: t('Verified transactions this week', '本期已核实交易', '今週の確認済みの個別取引') },
    { period: 'prior', start: priorStart, entries: comparisonSettlements, title: t('Verified transactions in the prior week', '对照周已核实交易', '比較週の確認済みの個別取引') },
  ];
  const openings = projects['collector-crypt'].metrics.packOpenings;
  const gross = openings.current && new Intl.NumberFormat(locale, {
    style: 'currency', currency: 'USD', maximumFractionDigits: 2, minimumFractionDigits: 0,
  }).format(openings.current.value);
  const delta = openings.current && openings.previous && openings.previous.value > 0
    ? new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 2, signDisplay: 'exceptZero' })
      .format((openings.current.value - openings.previous.value) / openings.previous.value)
    : null;

  return (
    <article id={`card-week-${week.weekStart}`} data-card-week={week.weekStart} className='scroll-mt-6 space-y-5 pt-2'
      aria-label={dateRange(week.weekStart, week.weekEnd, locale)}>
      <header className='space-y-1'>
        <h3 className='font-semibold'>{dateRange(week.weekStart, week.weekEnd, locale)} · UTC</h3>
        <p className='text-sm text-muted-foreground'>
          {t('Comparison week', '对照周', '比較週')} {prior} · UTC
          {previous ? <> · <a href={`#card-week-${previous.weekStart}`} className='underline underline-offset-2 hover:text-foreground'>
            {t('View the archived report and receipts', '查看对照周周报与凭证', '比較週の週報と取引を見る')}
          </a></> : !hasLegacyComparison && <> · {t('No reviewed data', '暂无核实数据', '確認済みデータなし')}</>}
        </p>
        <p className='text-xs text-muted-foreground'>
          {t('Issue reviewed', '本期核对于', '今号の確認日')} <time dateTime={week.reviewedOn}>{eventDate(week.reviewedOn, locale)}</time>
        </p>
        {gross && <p data-card-week-summary className='pt-1 text-sm text-foreground'>
          {delta ? t(`Collector Crypt recorded ${gross} in gross pack sales, ${delta} from the prior week.`,
            `Collector Crypt 本期开包毛流水为 ${gross}，较对照周 ${delta}。`,
            `Collector Crypt のパック売上総額は ${gross}、比較週比 ${delta} でした。`) :
            t(`Collector Crypt recorded ${gross} in gross pack sales.`,
              `Collector Crypt 本期开包毛流水为 ${gross}。`,
              `Collector Crypt のパック売上総額は ${gross} でした。`)}
        </p>}
      </header>
      <div className='grid gap-4 lg:grid-cols-2'>
        {cardProjects.map(project => <ProjectReport key={project} project={project} report={projects[project]}
          previousReport={previous?.projects[project]} locale={locale}
          subtotals={subtotals[project]} comparisonSubtotals={comparisonSubtotals[project]} />)}
      </div>
      <div className='grid gap-4 text-sm text-muted-foreground sm:grid-cols-2'>
        {evidence.some(({ entries }) => entries.length > 0) && <div className='space-y-4'>
          {evidence.map(({ period, start, entries, title }) => {
            if (!entries.length) return null;
            const buybackLimit = 9;
            let buybacks = 0;
            const shown = entries.filter(item => {
              if (item.project !== 'collector-crypt' || item.kind !== 'tokenBuybacks') return true;
              buybacks += 1;
              return buybacks <= buybackLimit;
            });
            const shownCount = count.format(buybackLimit);
            const buybackCount = count.format(buybacks);
            return (
              <section key={period} className='space-y-2' data-card-receipt-period={period} aria-label={title}>
                <h4 className='font-semibold text-foreground'>{title}</h4>
                <ul className='space-y-2'>
                  {shown.map(item => <li key={`${item.chain}:${item.transaction}:${item.eventIndex}`}>
                    {names[item.project]} · {t(...labels[item.kind])} · <time dateTime={item.settledAt}>{eventDate(item.settledAt, locale)}</time>
                    <p>{t('Paid', '支付', '支払額')} {amount.format(item.paid.amount)} {item.paid.asset}
                      {item.received && <> · {t('Received', '收到', '受取額')} {amount.format(item.received.amount)} {item.received.asset}</>}
                      {' · '}{sourceLink(item.source)}</p>
                  </li>)}
                </ul>
                {buybacks > buybackLimit && <p className='text-xs leading-relaxed'>
                  {t(`Showing ${shownCount} of ${buybackCount} verified Collector Crypt token buybacks.`,
                    `已核实的 ${buybackCount} 笔 Collector Crypt 代币回购中，此处列出 ${shownCount} 笔。`,
                    `Collector Crypt の確認済みトークン買い戻し ${buybackCount} 件のうち、${shownCount} 件を表示しています。`)}{' '}
                  <a href={`/data/pulse-card-receipts/${start}.json`} download className='underline underline-offset-2 hover:text-foreground'>
                    {t('Download all verified receipts for this UTC week (JSON)', '下载该 UTC 周的全部已核实凭证（JSON）', 'この UTC 週の確認済み取引をすべてダウンロード（JSON）')}
                  </a>
                </p>}
              </section>
            );
          })}
        </div>}
        {week.collaborations.length > 0 && <section className='space-y-2'>
          <h4 className='font-semibold text-foreground'>{t('Shared machines', '合作机台', '共同運営マシン')}</h4>
          <ul className='space-y-1'>
            {week.collaborations.map(item => <li key={item.machineId} data-card-pack={item.packId}>
              {sourceLink(item.source)} · {item.projects.map(id => names[id]).join(' × ')}
            </li>)}
          </ul>
          <p>{t('Each shared machine has one verified record. Cross-project totals require matching individual settlements.', '每台合作机台保留一条核实记录。跨项目统计需逐笔核对结算记录。', '共同運営のマシンは、確認済みの記録を 1 件にまとめています。プロジェクト横断の集計には個々の決済の照合が必要です。')}</p>
        </section>}
      </div>
      <details className='rounded-lg border border-border bg-surface px-4 py-3 text-sm'>
        <summary className='cursor-pointer font-semibold'>{t('Sources and methodology', '数据来源与口径', '情報源と集計方法')}</summary>
        <ul className='mt-3 space-y-2 leading-relaxed text-muted-foreground'>
          <li>{t('Weeks start on Monday at 00:00 UTC and run until the following Monday at 00:00 UTC, with an exclusive end.', '每周从周一 00:00 UTC 起，统计至次周一 00:00 UTC，结束时点不计入。', '週の集計期間は UTC の月曜 00:00 から翌月曜 00:00 の直前までです。')}</li>
          {week.methods.map(method => <li key={method.source.url}>{method.text[locale]} {sourceLink(method.source)}</li>)}
        </ul>
      </details>
    </article>
  );
}

export default function CardWeekly({ locale }: { locale: Locale }) {
  const t = getTranslator(locale);
  const [current, ...past] = readCardWeeks(archive);
  if (!current) return null;
  const archiveLabel = t('Weekly archive', '周报存档', '週報アーカイブ');

  return (
    <section id='card-weekly' className='space-y-4' aria-labelledby='card-weekly-title'>
      <h2 id='card-weekly-title' className='text-xl font-semibold tracking-tight'>{t('Crypto trading cards weekly', '加密卡牌周报', 'オンチェーンカード週報')}</h2>
      <Report week={current} previousWeek={past[0]} locale={locale} />
      <nav aria-label={archiveLabel} className='space-y-2 border-t border-border pt-3 text-sm'>
        <h3 className='font-semibold'>{archiveLabel}</h3>
        <ul className='flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground'>
          {[current, ...past].map(week => <li key={week.weekStart}>
            <a href={`#card-week-${week.weekStart}`} className='underline underline-offset-2 hover:text-foreground'>
              {dateRange(week.weekStart, week.weekEnd, locale)} · UTC
            </a>
          </li>)}
        </ul>
      </nav>
      {past.map((week, index) => <details key={week.weekStart} className='rounded-lg border border-border p-4'>
        <summary className='cursor-pointer font-medium'>
          {dateRange(week.weekStart, week.weekEnd, locale)} · UTC
        </summary>
        <Report week={week} previousWeek={past[index + 1]} locale={locale} />
      </details>)}
    </section>
  );
}
