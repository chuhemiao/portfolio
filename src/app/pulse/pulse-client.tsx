'use client';

import type {
  PulseData,
  IntelItem,
  InjuryItem,
  FixtureItem,
  MarketDynamic,
  ContentIdea,
  CompetitorActivity,
  CompetitorNarrative,
  CompetitorPost,
  MindshareRank,
  SimpleEntry,
  MemePost,
  RiskItem,
} from '@/lib/pulse-data';
import {
  ActivityIcon,
  TrophyIcon,
  RadarIcon,
  Building2Icon,
  LinkIcon,
  UsersIcon,
  MegaphoneIcon,
  BrainCircuitIcon,
  SmileIcon,
  ShieldAlertIcon,
  ListChecksIcon,
  ArrowUpRightIcon,
  HeartIcon,
  Repeat2Icon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
} from 'lucide-react';

// ─── Shared atoms ─────────────────────────────────────────────────────────────

const CARD =
  'rounded-[1.5rem] border border-border/60 bg-background/78 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.5)] backdrop-blur-sm';
const EYEBROW =
  'text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground';

function Empty({ msg = '本周暂无数据' }: { msg?: string }) {
  return (
    <div className='px-5 py-10 text-center text-muted-foreground text-sm'>
      {msg}
    </div>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          {icon}
          <h2 className='text-base font-semibold tracking-tight'>{title}</h2>
        </div>
        {subtitle && (
          <span className='text-[10px] text-muted-foreground/60 uppercase tracking-widest'>
            {subtitle}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function Link({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return <>{children}</>;
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='inline-flex items-center gap-0.5 hover:text-foreground transition-colors'>
      {children}
      <ArrowUpRightIcon className='size-3' />
    </a>
  );
}

function XSource({ href, label = 'X source' }: { href?: string; label?: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground/70 hover:text-foreground transition-colors'>
      <LinkIcon className='size-3' />
      {label}
    </a>
  );
}

function Engagement({ likes, retweets }: { likes?: number; retweets?: number }) {
  if (likes == null && retweets == null) return null;
  return (
    <div className='flex items-center gap-3 text-[10px] text-muted-foreground/70'>
      {likes != null && (
        <span className='inline-flex items-center gap-0.5'>
          <HeartIcon className='size-3' /> {likes.toLocaleString()}
        </span>
      )}
      {retweets != null && (
        <span className='inline-flex items-center gap-0.5'>
          <Repeat2Icon className='size-3' /> {retweets.toLocaleString()}
        </span>
      )}
    </div>
  );
}

function TrendIcon({ trend }: { trend?: string }) {
  if (trend === 'up')
    return <TrendingUpIcon className='size-3.5 text-emerald-500' />;
  if (trend === 'down')
    return <TrendingDownIcon className='size-3.5 text-red-500' />;
  return <MinusIcon className='size-3.5 text-muted-foreground/60' />;
}

// ─── Part 1: World Cup ────────────────────────────────────────────────────────

function WorldCupBlock({ data }: { data: PulseData['worldCup'] }) {
  const { topIntel, injuries, fixtures, marketDynamics, contentIdeas } = data;
  const empty =
    topIntel.length === 0 &&
    injuries.length === 0 &&
    fixtures.length === 0 &&
    marketDynamics.length === 0 &&
    contentIdeas.length === 0;

  return (
    <Section
      icon={<TrophyIcon className='size-4 text-amber-500' />}
      title='世界杯 · 业务场景'
      subtitle='Predict markets'>
      <div className={CARD}>
        {empty ? (
          <Empty />
        ) : (
          <div className='divide-y divide-border/40'>
            {topIntel.length > 0 && (
              <div className='p-4 space-y-2'>
                <p className={EYEBROW}>Top intel</p>
                <ul className='space-y-2'>
                  {topIntel.map((i, idx) => (
                    <IntelRow key={idx} item={i} />
                  ))}
                </ul>
              </div>
            )}
            {injuries.length > 0 && (
              <div className='p-4 space-y-2'>
                <p className={EYEBROW}>伤病 / 阵容</p>
                <ul className='space-y-1.5'>
                  {injuries.map((i, idx) => (
                    <li key={idx} className='text-sm leading-snug'>
                      <span className='font-semibold'>{i.team}</span>
                      <span className='text-muted-foreground'> · {i.change}</span>
                      {i.impact && (
                        <span className='text-[11px] text-amber-500'> → {i.impact}</span>
                      )}
                      <span className='ml-2'>
                        <XSource href={i.link} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {fixtures.length > 0 && (
              <div className='p-4 space-y-2'>
                <p className={EYEBROW}>赛程</p>
                <ul className='space-y-1.5'>
                  {fixtures.map((f, idx) => (
                    <FixtureRow key={idx} item={f} />
                  ))}
                </ul>
              </div>
            )}
            {marketDynamics.length > 0 && (
              <div className='p-4 space-y-2'>
                <p className={EYEBROW}>市场动态</p>
                <ul className='space-y-1.5'>
                  {marketDynamics.map((m, idx) => (
                    <li key={idx} className='text-sm leading-snug'>
                      <span className='font-semibold'>{m.market}</span>
                      {m.volumeChange && (
                        <span className='text-emerald-500 text-xs ml-2 tabular-nums'>
                          {m.volumeChange}
                        </span>
                      )}
                      {m.reason && (
                        <p className='text-xs text-muted-foreground/80 mt-0.5'>{m.reason}</p>
                      )}
                      <div className='mt-1'>
                        <XSource href={m.link} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {contentIdeas.length > 0 && (
              <div className='p-4 space-y-2'>
                <p className={EYEBROW}>内容选题</p>
                <ul className='space-y-2'>
                  {contentIdeas.map((c, idx) => (
                    <li key={idx} className='text-sm leading-snug'>
                      <span className='text-[9px] font-bold px-1.5 py-0.5 rounded border bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30 leading-none mr-2'>
                        {c.type}
                      </span>
                      {c.idea}
                      {c.example && (
                        <p className='text-xs text-muted-foreground/70 mt-0.5'>
                          e.g. {c.example}
                        </p>
                      )}
                      <div className='mt-1'>
                        <XSource href={c.link} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}

function IntelRow({ item }: { item: IntelItem }) {
  return (
    <li className='text-sm leading-snug'>
      <div className='flex items-start justify-between gap-2'>
        <p className='flex-1'>
          <Link href={item.link}>
            <span className='font-medium'>{item.source}</span>
          </Link>
          <span className='text-muted-foreground'> — {item.content}</span>
        </p>
        <Engagement likes={item.likes} retweets={item.retweets} />
      </div>
      {item.impact && (
        <p className='text-[11px] text-amber-500 mt-0.5'>影响：{item.impact}</p>
      )}
      {item.why && (
        <p className='text-[11px] text-muted-foreground/70 mt-0.5'>{item.why}</p>
      )}
    </li>
  );
}

function FixtureRow({ item }: { item: FixtureItem }) {
  return (
    <li className='text-sm leading-snug flex items-center gap-3 flex-wrap'>
      <span className='text-[11px] text-muted-foreground tabular-nums'>{item.time}</span>
      <span className='font-medium'>{item.match}</span>
      {item.prediction && (
        <span className='text-xs text-muted-foreground'>预测：{item.prediction}</span>
      )}
      {item.polymarketOdds && (
        <span className='text-[10px] font-bold px-1.5 py-0.5 rounded border bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 leading-none'>
          PM {item.polymarketOdds}
        </span>
      )}
      <XSource href={item.link} />
    </li>
  );
}

// ─── Generic list cards ───────────────────────────────────────────────────────

function IntelList({ items }: { items: IntelItem[] }) {
  return (
    <div className={CARD}>
      {items.length === 0 ? (
        <Empty />
      ) : (
        <ul className='divide-y divide-border/40'>
          {items.map((i, idx) => (
            <li key={idx} className='p-4'>
              <IntelRow item={i} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SimpleList({ items }: { items: SimpleEntry[] }) {
  return (
    <div className={CARD}>
      {items.length === 0 ? (
        <Empty />
      ) : (
        <ul className='divide-y divide-border/40'>
          {items.map((s, idx) => (
            <li key={idx} className='p-4 text-sm leading-snug'>
              <div className='flex items-start justify-between gap-2'>
                <p className='flex-1'>
                  <Link href={s.link}>
                    <span className='font-medium'>{s.source}</span>
                  </Link>
                  <span className='text-muted-foreground'> — {s.summary}</span>
                </p>
              </div>
              {s.view && (
                <p className='text-[11px] text-muted-foreground/70 mt-0.5'>{s.view}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Part 5: Competitors ──────────────────────────────────────────────────────

function CompetitorsBlock({ data }: { data: PulseData['competitors'] }) {
  const { activity, narratives, topPosts, mindshare } = data;
  const empty =
    activity.length === 0 &&
    narratives.length === 0 &&
    topPosts.length === 0 &&
    mindshare.length === 0;

  return (
    <Section
      icon={<UsersIcon className='size-4 text-muted-foreground' />}
      title='竞品 / 同行'
      subtitle='Crypto KOL × project'>
      {empty ? (
        <div className={CARD}>
          <Empty />
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
          {/* Activity */}
          <div className={CARD + ' p-4 space-y-2'}>
            <p className={EYEBROW}>活跃度</p>
            {activity.length === 0 ? (
              <p className='text-muted-foreground text-sm'>—</p>
            ) : (
              <ul className='space-y-1.5'>
                {activity.map((a, idx) => (
                  <li key={idx} className='flex items-center justify-between gap-2 text-sm'>
                    <Link href={a.link}>
                      <span className='font-medium'>@{a.handle}</span>
                    </Link>
                    <span className='flex items-center gap-2 text-xs text-muted-foreground tabular-nums'>
                      {a.followers != null && <span>{a.followers.toLocaleString()} fans</span>}
                      {a.posts7d != null && <span>{a.posts7d} posts/7d</span>}
                      {a.level && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border leading-none ${
                            a.level === 'high'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : a.level === 'medium'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : 'bg-slate-500/15 text-slate-500 border-slate-500/30'
                          }`}>
                          {a.level}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Narratives */}
          <div className={CARD + ' p-4 space-y-2'}>
            <p className={EYEBROW}>叙事方向</p>
            {narratives.length === 0 ? (
              <p className='text-muted-foreground text-sm'>—</p>
            ) : (
              <ul className='space-y-1.5'>
                {narratives.map((n, idx) => (
                  <li key={idx} className='text-sm leading-snug'>
                    <Link href={n.link}>
                      <span className='font-medium'>@{n.handle}</span>
                    </Link>
                    <span className='text-muted-foreground'> — {n.narrative}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Top posts */}
          <div className={CARD + ' p-4 space-y-2'}>
            <p className={EYEBROW}>热门帖</p>
            {topPosts.length === 0 ? (
              <p className='text-muted-foreground text-sm'>—</p>
            ) : (
              <ul className='space-y-2'>
                {topPosts.map((p, idx) => (
                  <li key={idx} className='text-sm leading-snug'>
                    <div className='flex items-start justify-between gap-2'>
                      <p className='flex-1'>
                        <Link href={p.link}>
                          <span className='font-medium'>@{p.handle}</span>
                        </Link>
                        <span className='text-muted-foreground'> — {p.content}</span>
                      </p>
                      <Engagement likes={p.likes} retweets={p.retweets} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Mindshare */}
          <div className={CARD + ' p-4 space-y-2'}>
            <p className={EYEBROW}>Mindshare 排行</p>
            {mindshare.length === 0 ? (
              <p className='text-muted-foreground text-sm'>—</p>
            ) : (
              <ul className='space-y-1.5'>
                {mindshare.map((m, idx) => (
                  <MindshareRankRow key={idx} item={m} />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Section>
  );
}

function MindshareRankRow({ item }: { item: MindshareRank }) {
  return (
    <li className='flex items-center gap-3 text-sm'>
      <span className='w-6 text-xs text-muted-foreground/60 tabular-nums text-right'>
        {item.rank}
      </span>
      <Link href={item.link}>
        <span className='flex-1 font-medium'>{item.project}</span>
      </Link>
      <span className='flex-1' />
      <TrendIcon trend={item.trend} />
    </li>
  );
}

// ─── Part 8: Memes ────────────────────────────────────────────────────────────

function MemesBlock({ data }: { data: PulseData['memes'] }) {
  const { sentiment, hotMeme, borrowable, topPosts } = data;
  const empty =
    !sentiment && !hotMeme && !borrowable && topPosts.length === 0;

  const sentimentColor =
    sentiment === 'optimistic'
      ? 'text-emerald-500'
      : sentiment === 'pessimistic'
      ? 'text-red-500'
      : 'text-muted-foreground';

  return (
    <Section
      icon={<SmileIcon className='size-4 text-muted-foreground' />}
      title='Meme / 情绪'
      subtitle='Crypto Twitter vibe'>
      {empty ? (
        <div className={CARD}>
          <Empty />
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-3 lg:grid-cols-3'>
          <div className={CARD + ' p-4 space-y-2 lg:col-span-1'}>
            <p className={EYEBROW}>市场情绪</p>
            <p className={`text-xl font-semibold ${sentimentColor}`}>
              {sentiment ?? '—'}
            </p>
            {hotMeme && (
              <div className='pt-2'>
                <p className={EYEBROW + ' mb-1'}>本周 Meme</p>
                <p className='text-sm'>{hotMeme}</p>
              </div>
            )}
            {borrowable && (
              <div className='pt-2'>
                <p className={EYEBROW + ' mb-1'}>可借用梗</p>
                <p className='text-sm text-muted-foreground'>{borrowable}</p>
              </div>
            )}
            <div className='pt-2'>
              <XSource href={data.sourceLink} />
            </div>
          </div>
          <div className={CARD + ' p-4 space-y-2 lg:col-span-2'}>
            <p className={EYEBROW}>热门 meme 帖</p>
            {topPosts.length === 0 ? (
              <p className='text-muted-foreground text-sm'>—</p>
            ) : (
              <ul className='divide-y divide-border/40'>
                {topPosts.map((m, idx) => (
                  <li key={idx} className='py-2 text-sm leading-snug'>
                    <div className='flex items-start justify-between gap-2'>
                      <p className='flex-1'>
                        <Link href={m.link}>
                          <span className='font-medium'>{m.source}</span>
                        </Link>
                        <span className='text-muted-foreground'> — {m.summary}</span>
                      </p>
                      <Engagement likes={m.likes} retweets={m.retweets} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Section>
  );
}

// ─── Part 9: Risks ────────────────────────────────────────────────────────────

const RISK_COLOR: Record<string, string> = {
  security:
    'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
  regulation:
    'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  competitor:
    'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
};

function RisksBlock({ items }: { items: RiskItem[] }) {
  return (
    <Section
      icon={<ShieldAlertIcon className='size-4 text-red-500' />}
      title='风险预警'
      subtitle='Heads up'>
      <div className={CARD}>
        {items.length === 0 ? (
          <Empty msg='本周暂无风险信号' />
        ) : (
          <ul className='divide-y divide-border/40'>
            {items.map((r, idx) => (
              <li key={idx} className='p-4 text-sm leading-snug flex items-start gap-2.5'>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded border leading-none uppercase ${
                    RISK_COLOR[r.type] ?? 'bg-muted/60 text-muted-foreground border-border/50'
                  }`}>
                  {r.type}
                </span>
                <p className='flex-1'>
                  {r.description}
                  {r.link && (
                    <span className='ml-2'>
                      <Link href={r.link}>详情</Link>
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}

// ─── Part 10: Ops ─────────────────────────────────────────────────────────────

function OpsBlock({ data }: { data: PulseData['ops'] }) {
  const { todayContent, weekFollow, narrativeOpportunity } = data;
  const empty = !todayContent && !weekFollow && !narrativeOpportunity;

  return (
    <Section
      icon={<ListChecksIcon className='size-4 text-emerald-500' />}
      title='今日 / 本周操作'
      subtitle="Operator's notes">
      {empty ? (
        <div className={CARD}>
          <Empty />
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
          <OpsCard label='今天发什么内容' body={todayContent} />
          <OpsCard label='本周跟进什么' body={weekFollow} />
          <OpsCard label='叙事窗口期' body={narrativeOpportunity} />
        </div>
      )}
    </Section>
  );
}

function OpsCard({ label, body }: { label: string; body: string }) {
  return (
    <div className={CARD + ' p-4 space-y-2'}>
      <p className={EYEBROW}>{label}</p>
      <p className='text-sm leading-relaxed whitespace-pre-wrap'>
        {body || <span className='text-muted-foreground'>—</span>}
      </p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PulseClient({ data }: { data: PulseData }) {
  return (
    <div className='relative left-1/2 min-h-[100dvh] w-screen -translate-x-1/2 overflow-x-clip'>
      <div className='pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(241,245,249,0.92)_38%,rgba(248,250,252,1)_100%)] dark:bg-[linear-gradient(180deg,rgba(2,6,23,1)_0%,rgba(7,17,33,0.96)_38%,rgba(2,6,23,1)_100%)]' />
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_6%_12%,rgba(99,102,241,0.14),transparent_24%),radial-gradient(circle_at_88%_10%,rgba(14,165,233,0.10),transparent_22%)] dark:bg-[radial-gradient(circle_at_6%_12%,rgba(139,92,246,0.16),transparent_24%),radial-gradient(circle_at_88%_10%,rgba(56,189,248,0.12),transparent_22%)]' />

      <main className='relative mx-auto w-full max-w-6xl px-4 pb-28 pt-6 space-y-10 sm:px-6 sm:pb-32 sm:pt-10 lg:px-8'>
        {/* Hero */}
        <div className='space-y-4'>
          <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.16em] text-muted-foreground backdrop-blur'>
            <ActivityIcon className='size-3' />
            Weekly Pulse
          </div>
          <div className='space-y-2'>
            <h1 className='text-3xl font-semibold tracking-[-0.06em] text-foreground sm:text-4xl lg:text-5xl'>
              Pulse · {data.weekOf}
            </h1>
            <p className='max-w-2xl text-[15px] leading-7 text-muted-foreground'>
              {data.context}
            </p>
          </div>
          <p className='text-[11px] text-muted-foreground/50'>
            Updated:{' '}
            {new Date(data.updatedAt).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>

        {/* Part 1 */}
        <WorldCupBlock data={data.worldCup} />

        {/* Part 2 */}
        <Section
          icon={<RadarIcon className='size-4 text-muted-foreground' />}
          title='本周加密情报 Top'
          subtitle='What moved the room'>
          <IntelList items={data.topIntel} />
        </Section>

        {/* Part 3 */}
        <Section
          icon={<Building2Icon className='size-4 text-muted-foreground' />}
          title='交易所动态'
          subtitle='CEX desk'>
          <SimpleList items={data.exchanges} />
        </Section>

        {/* Part 4 */}
        <Section
          icon={<LinkIcon className='size-4 text-muted-foreground' />}
          title='公链 / L1·L2'
          subtitle='Chain layer'>
          <SimpleList items={data.chains} />
        </Section>

        {/* Part 5 */}
        <CompetitorsBlock data={data.competitors} />

        {/* Part 6 */}
        <Section
          icon={<MegaphoneIcon className='size-4 text-muted-foreground' />}
          title='KOL / 媒体'
          subtitle='Signal voices'>
          <SimpleList items={data.kolMedia} />
        </Section>

        {/* Part 7 */}
        <Section
          icon={<BrainCircuitIcon className='size-4 text-muted-foreground' />}
          title='AI × Web3'
          subtitle='Agent narrative'>
          <SimpleList items={data.aiWeb3} />
        </Section>

        {/* Part 8 */}
        <MemesBlock data={data.memes} />

        {/* Part 9 */}
        <RisksBlock items={data.risks} />

        {/* Part 10 */}
        <OpsBlock data={data.ops} />
      </main>
    </div>
  );
}
