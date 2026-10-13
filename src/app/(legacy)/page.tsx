import { localizedPageMetadata } from '@/lib/localized-metadata';
import { categoryLabel, formatLocaleDate, getTranslator, localizeHref, type Locale } from '@/lib/i18n';
import { PROJECTS } from '@/data/research-projects';
import BlurFade from '@/components/magicui/blur-fade';
import { DATA } from '@/data/resume';
import { TOPICS, localizedTopic } from '@/data/topics';
import { WEEKLY_REPORTS } from '@/data/weekly-research';
import { getBlogPosts, getLocalizedPosts, getPostHref } from '@/data/blog';
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  RadioIcon,
  SearchIcon,
  LayoutGridIcon,
  ActivityIcon,
  TrendingUpIcon,
  RssIcon,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NewsletterForm from '@/components/newsletter-form';

const BLUR_FADE_DELAY = 0.04;

export const metadata: Metadata = localizedPageMetadata('/', 'en', {
  title: 'Home',
  description:
    'Professional Crypto Research, Market Structure, and Thesis Discovery. Track emerging protocols, understand DeFi, exchanges, stablecoins, AI×Crypto, and capital allocation.',
  alternates: { canonical: DATA.url },
  openGraph: {
    title: 'kkdemian — Crypto Research Hub',
    description:
      'Professional Crypto Research, Market Structure, and Thesis Discovery.',
    url: DATA.url,
    siteName: 'kkdemian',
    locale: 'en_US',
    type: 'website',
    images: [{ url: `${DATA.url}/og.svg`, width: 1200, height: 630, alt: 'kkdemian Crypto Research Hub' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'kkdemian — Crypto Research Hub',
    description: 'Professional Crypto Research, Market Structure, and Thesis Discovery.',
    creator: '@0xkkdemian',
    images: [`${DATA.url}/og.svg`],
  },
});

const FEATURED_RESEARCH = [
  {
    name: 'Binance',
    type: 'CEX',
    slug: 'binance_2025_report',
    description: "World's largest exchange · 300M+ users · $168B daily volume",
    color: '#F0B90B',
    initial: 'BN',
    logoUrl: '/research-logos/binance_2025_report.png',
  },
  {
    name: 'Hyperliquid',
    type: 'Perp DEX',
    slug: 'hyperliquid_report_2026',
    description: 'On-chain order book perpetuals · $10B+ daily volume',
    color: '#00C2FF',
    initial: 'HL',
    logoUrl: '/research-logos/hyperliquid_report_2026.png',
  },
  {
    name: 'Coinbase',
    type: 'CEX',
    slug: 'coinbase_report_2026',
    description: 'US-regulated exchange evolving into diversified financial platform',
    color: '#0052FF',
    initial: 'CB',
    logoUrl: '/research-logos/coinbase_report_2026.png',
  },
  {
    name: 'Solana',
    type: 'L1',
    slug: 'solana-sol-monolithic-execution-powerhouse-or-fragile-high-beta-trading',
    description: 'High-throughput L1 · DeFi, NFT, and payments hub',
    color: '#9945FF',
    initial: 'SOL',
    logoUrl: '/research-logos/solana-sol-monolithic-execution-powerhouse-or-fragile-high-beta-trading.png',
  },
];

export default async function Page() { return renderPage('en'); }

export async function renderPage(locale: Locale) {
  const t = getTranslator(locale);
  const href = (url: string) => localizeHref(url, locale);
  // blog-index.json is already sorted newest-first by the content compiler.
  const allPosts = await getBlogPosts();
  const localizedPosts = getLocalizedPosts(allPosts, locale);
  const latestPosts = localizedPosts.slice(0, 4);
  const postBySlug = new Map(allPosts.map(post => [post.slug, post]));
  const SITE_STATS = [
    { value: localizedPosts.length.toLocaleString(locale), label: t('Articles', '文章', '記事') },
    { value: PROJECTS.length.toLocaleString(locale), label: t('Projects', '项目', 'プロジェクト') },
    { value: TOPICS.length.toLocaleString(locale), label: t('Topics', '主题', 'トピック') },
    { value: t('Weekly', '每周', '毎週'), label: t('Updates', '更新', '更新') },
  ];
  const HERO_CTAS = [
    { label: t('Explore Research', '探索研究', 'リサーチを見る'), href: '/research', icon: SearchIcon },
    { label: t('Browse Topics', '浏览主题', 'トピックを見る'), href: '/topics', icon: LayoutGridIcon },
    { label: t('Track Listings', '追踪上币', '上場情報を追う'), href: '/watch', icon: RadioIcon },
    { label: t('Oscillator', '震荡指标', 'オシレーター'), href: '/oscillator', icon: ActivityIcon },
  ];
  const featuredDescriptions: Record<string, string> = {
    Binance: t("World's largest exchange · 300M+ users · $168B daily volume", '全球最大交易所 · 3 亿以上用户 · 日交易量 1680 亿美元', '世界最大の取引所 · ユーザー 3 億人以上 · 日次取引量 1680 億ドル'),
    Hyperliquid: t('On-chain order book perpetuals · $10B+ daily volume', '链上订单簿永续合约 · 日交易量超 100 亿美元', 'オンチェーン注文板の無期限先物 · 日次取引量 100 億ドル以上'),
    Coinbase: t('US-regulated exchange evolving into diversified financial platform', '美国受监管交易所，向多元金融平台发展', '米国の規制に準拠する取引所から総合金融プラットフォームへ'),
    Solana: t('High-throughput L1 · DeFi, NFT, and payments hub', '高吞吐量 L1 · DeFi、NFT 与支付生态', '高スループット L1 · DeFi、NFT、決済の拠点'),
  };
  const weeklyBrief = WEEKLY_REPORTS[0];

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'kkdemian',
    url: `${DATA.url}${href('/')}`,
    inLanguage: locale,
    description: t('Professional Crypto Research, Market Structure, and Thesis Discovery.', '专业加密研究、市场结构与投资观点发现。', '暗号資産リサーチ、市場構造、投資テーマの発見。'),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${DATA.url}${href('/research')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className='relative left-1/2 min-h-[100dvh] w-screen -translate-x-1/2 overflow-x-clip'>
      {/* Background */}
      <div className='pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(241,245,249,0.92)_38%,rgba(248,250,252,1)_100%)] dark:bg-[linear-gradient(180deg,rgba(2,6,23,1)_0%,rgba(7,17,33,0.96)_38%,rgba(2,6,23,1)_100%)]' />
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(circle_at_10%_14%,rgba(14,165,233,0.16),transparent_26%),radial-gradient(circle_at_88%_12%,rgba(16,185,129,0.12),transparent_22%),radial-gradient(circle_at_48%_18%,rgba(59,130,246,0.10),transparent_28%)] dark:bg-[radial-gradient(circle_at_10%_14%,rgba(56,189,248,0.18),transparent_26%),radial-gradient(circle_at_88%_12%,rgba(16,185,129,0.16),transparent_22%),radial-gradient(circle_at_48%_18%,rgba(29,78,216,0.18),transparent_28%)]' />

      <main className='relative mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col gap-6 px-4 pb-dock-safe pt-6 sm:gap-8 sm:px-6 sm:pb-dock-safe-lg sm:pt-10 lg:px-8'>
        <script
          type='application/ld+json'
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />

        {/* ── HERO ───────────────────────────────────────────────── */}
        <section
          id='hero'
          className='grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_21rem]'>

          <BlurFade delay={BLUR_FADE_DELAY}>
            <div className='relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/78 p-6 shadow-[0_28px_80px_-46px_rgba(15,23,42,0.45)] backdrop-blur-md sm:p-8 lg:p-10'>
              <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.10),transparent_26%)]' />
              <div className='relative space-y-8'>
                {/* Badge */}
                <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.16em] text-muted-foreground shadow-sm backdrop-blur'>
                  <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                  {t("Crypto Research Hub · kkdemian", "加密研究中心 · kkdemian", "暗号資産リサーチハブ · kkdemian")}
                </div>

                {/* Headline */}
                <div className='space-y-4'>
                  <h1 className='max-w-3xl text-3xl font-semibold tracking-[-0.06em] text-foreground sm:text-[2.75rem] sm:leading-tight lg:text-[3.1rem] lg:leading-[1.08]'>
                    {t("Professional Crypto Research, Market Structure & Thesis Discovery", "专业加密研究、市场结构与投资观点发现", "暗号資産リサーチ、市場構造、投資テーマの発見")}
                  </h1>
                  <p className='max-w-2xl text-[15px] leading-8 text-muted-foreground sm:text-[17px]'>
                    {t("Track emerging protocols, understand market structure, and explore research-driven views across DeFi, exchanges, stablecoins, AI×Crypto, and capital allocation.", "追踪新兴协议，理解市场结构，探索 DeFi、交易所、稳定币、AI × Crypto 与资本配置的研究观点。", "新しいプロトコルと市場構造を追い、DeFi、取引所、ステーブルコイン、AI × Crypto、資本配分の研究を読む。")}
                  </p>
                </div>

                {/* CTAs */}
                <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                  {HERO_CTAS.map((cta) => (
                    <Link
                      key={cta.label}
                      href={href(cta.href)}
                      className='group flex items-center justify-between rounded-[1.25rem] border border-border/60 bg-background/78 px-4 py-3 shadow-[0_10px_26px_-20px_rgba(15,23,42,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_18px_34px_-22px_rgba(15,23,42,0.6)]'>
                      <div className='flex items-center gap-2.5'>
                        <cta.icon className='size-4 text-foreground' />
                        <span className='text-sm font-medium text-foreground'>{cta.label}</span>
                      </div>
                      <ArrowRightIcon className='size-3.5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5' />
                    </Link>
                  ))}
                </div>

                {/* Stats strip */}
                <div className='grid grid-cols-4 gap-3'>
                  {SITE_STATS.map((s) => (
                    <div
                      key={s.label}
                      className='rounded-[1.15rem] border border-border/60 bg-background/72 px-4 py-3'>
                      <div className='text-xl font-semibold tracking-[-0.05em] text-foreground sm:text-2xl'>
                        {s.value}
                      </div>
                      <div className='mt-0.5 text-xs tracking-[0.08em] text-muted-foreground'>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </BlurFade>

          {/* Right column */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-1'>
            {/* Profile card */}
            <BlurFade delay={BLUR_FADE_DELAY * 2}>
              <div className='rounded-[1.75rem] border border-border/60 bg-background/78 p-5 shadow-[0_22px_48px_-36px_rgba(15,23,42,0.55)] backdrop-blur-sm'>
                <div className='flex items-center gap-4'>
                  <div className='rounded-[1.3rem] bg-white/95 p-1 ring-1 ring-black/5 shadow-[0_10px_24px_-16px_rgba(15,23,42,0.4)]'>
                    <Avatar className='size-16 rounded-[1.1rem] bg-background'>
                      <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
                      <AvatarFallback>{DATA.initials}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className='min-w-0'>
                    <div className='text-base font-semibold text-foreground'>{DATA.name}</div>
                    <p className='mt-0.5 text-sm leading-6 text-muted-foreground'>
                      {t("Web3 Product Engineer · Researcher", "Web3 产品工程师 · 研究者", "Web3 プロダクトエンジニア · リサーチャー")}
                    </p>
                  </div>
                </div>
                <div className='mt-4 flex flex-wrap gap-2'>
                  {[DATA.contact.social.X, DATA.contact.social.GitHub, DATA.contact.social.TelegramChannel, DATA.contact.social.Youtube].map((s) => (
                    <Link
                      key={s.name}
                      href={s.url}
                      target='_blank'
                      className='inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-foreground/15'>
                      <s.icon className='size-3.5' />
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            </BlurFade>

            {/* Quick entry links */}
            <BlurFade delay={BLUR_FADE_DELAY * 3}>
              <div className='rounded-[1.75rem] border border-border/60 bg-background/78 p-5 shadow-[0_22px_48px_-36px_rgba(15,23,42,0.55)] backdrop-blur-sm'>
                <div className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>
                  {t("Quick access", "快捷入口", "クイックアクセス")}
                </div>
                <div className='mt-3 space-y-2'>
                  {[
                    { title: t("Research archive", "研究归档", "リサーチアーカイブ"), href: '/research', text: t("Long-form theses on exchanges, DeFi, infra, AI, and market structure", "交易所、DeFi、基础设施、AI 与市场结构的深度研究", "取引所、DeFi、基盤、AI、市場構造の詳細なリサーチ") },
                    { title: t("Capital map", "资本地图", "資本マップ"), href: '/fund', text: t("Assets, sectors, and platforms I keep tracking", "持续跟踪的资产、赛道与平台", "継続的に追う資産、分野、プラットフォーム") },
                    { title: t("Thought stream", "思考动态", "考察ストリーム"), href: '/thoughts', text: t("Shorter notes and recurring market observations", "短篇笔记与持续市场观察", "短いメモと日々の市場観察") },
                  ].map((item) => (
                    <Link
                      key={item.title}
                      href={href(item.href)}
                      className='group block rounded-[1.15rem] border border-border/60 bg-background/75 px-4 py-3 transition-all duration-300 hover:border-foreground/15 hover:bg-background/90'>
                      <div className='flex items-center justify-between gap-3'>
                        <div className='text-sm font-semibold text-foreground'>{item.title}</div>
                        <ArrowUpRightIcon className='size-3.5 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
                      </div>
                      <p className='mt-1 text-xs leading-5 text-muted-foreground'>{item.text}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </BlurFade>
          </div>
        </section>

        {/* ── TOPICS NAVIGATION ──────────────────────────────────── */}
        <section id='topics'>
          <BlurFade delay={BLUR_FADE_DELAY * 4}>
            <div className='rounded-[1.9rem] border border-border/60 bg-background/76 p-6 shadow-[0_22px_54px_-38px_rgba(15,23,42,0.55)] backdrop-blur-sm sm:p-8'>
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-muted-foreground'>
                    <span className='h-1.5 w-1.5 rounded-full bg-sky-500' />
                    {t("Topics", "主题", "トピック")}
                  </div>
                  <h2 className='text-base font-semibold tracking-[-0.03em] text-foreground'>
                    {t("Browse by Theme", "按主题浏览", "テーマ別に閲覧")}
                  </h2>
                </div>
                <Link
                  href={href('/topics')}
                  className='inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground'>
                  {t("View all", "查看全部", "すべて見る")}
                  <ArrowRightIcon className='size-3.5' />
                </Link>
              </div>

              <div className='mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4'>
                {TOPICS.map(topic => localizedTopic(topic, locale)).map((topic) => (
                  <Link
                    key={topic.slug}
                    href={href(`/topics/${topic.slug}`)}
                    className='group rounded-[1.35rem] border border-border/60 bg-background/78 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_16px_36px_-22px_rgba(15,23,42,0.5)]'>
                    <div className='text-xl'>{topic.emoji}</div>
                    <div className='mt-2 text-sm font-semibold text-foreground'>{topic.name}</div>
                    <p className='mt-1 text-xs leading-5 text-muted-foreground line-clamp-2'>
                      {topic.tagline}
                    </p>
                    <div className='mt-3 flex flex-wrap gap-1.5'>
                      {topic.postCount > 0 && (
                        <span className='rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground'>
                          {topic.postCount} {t('posts', '篇文章', '記事')}
                        </span>
                      )}
                      {topic.projectCount > 0 && (
                        <span className='rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground'>
                          {topic.projectCount} {t('projects', '个项目', 'プロジェクト')}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </BlurFade>
        </section>

        {/* ── FEATURED RESEARCH ──────────────────────────────────── */}
        <section id='research' className='space-y-5'>
          <BlurFade delay={BLUR_FADE_DELAY * 5}>
            <div className='flex items-center justify-between gap-4'>
              <div className='space-y-1'>
                <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-muted-foreground'>
                  <span className='h-1.5 w-1.5 rounded-full bg-violet-500' />
                  {t("Research Map", "研究地图", "リサーチマップ")}
                </div>
                <h2 className='text-2xl font-semibold tracking-[-0.05em] text-foreground sm:text-3xl'>
                  {t(`${PROJECTS.length.toLocaleString(locale)} projects analyzed`, `已研究 ${PROJECTS.length.toLocaleString(locale)} 个项目`, `${PROJECTS.length.toLocaleString(locale)} プロジェクトを分析`)}
                </h2>
              </div>
              <Link
                href={href('/research')}
                className='inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground'>
                {t("Explore all", "探索全部", "すべて見る")}
                <ArrowRightIcon className='size-4' />
              </Link>
            </div>
          </BlurFade>

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {FEATURED_RESEARCH.map((project, id) => (
              <BlurFade key={project.slug} delay={BLUR_FADE_DELAY * 6 + id * 0.04}>
                <Link
                  href={postBySlug.has(project.slug) ? getPostHref(postBySlug.get(project.slug)!, locale) : `/blog/${project.slug}`}
                  className='group block h-full rounded-[1.6rem] border border-border/60 bg-background/78 p-5 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-foreground/15 hover:shadow-[0_24px_48px_-28px_rgba(15,23,42,0.65)]'>
                  {/* Logo */}
                  <div
                    className='flex size-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm'
                    style={{ backgroundColor: project.color }}>
                    {project.initial}
                  </div>
                  <div className='mt-4 space-y-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-semibold text-foreground'>{project.name}</span>
                      <span className='rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground'>
                        {project.type}
                      </span>
                    </div>
                    <p className='text-xs leading-5 text-muted-foreground line-clamp-3'>
                      {featuredDescriptions[project.name] ?? project.description}
                    </p>
                  </div>
                  <div className='mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground'>
                    {t("Read research", "阅读研究", "リサーチを読む")}
                    <ArrowUpRightIcon className='size-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
                  </div>
                </Link>
              </BlurFade>
            ))}
          </div>
        </section>

        {/* ── CONTENT ROW: Latest Posts + Weekly Brief ────────────── */}
        <section
          id='content'
          className='grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]'>

          {/* Latest Posts */}
          <BlurFade delay={BLUR_FADE_DELAY * 7}>
            <div className='h-full rounded-[1.9rem] border border-border/60 bg-background/76 p-6 shadow-[0_22px_54px_-38px_rgba(15,23,42,0.55)] backdrop-blur-sm sm:p-8'>
              <div className='flex items-center justify-between gap-4'>
                <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-muted-foreground'>
                  <BookOpenIcon className='size-3' />
                  {t("Latest from the blog", "最新文章", "最新の記事")}
                </div>
                <Link
                  href={href('/blog')}
                  className='inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground'>
                  {t('All posts', '全部文章', 'すべての記事')} <ArrowRightIcon className='size-3.5' />
                </Link>
              </div>
              <div className='mt-5 space-y-3'>
                {latestPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={getPostHref(post, locale)}
                    className='group block rounded-[1.25rem] border border-border/60 bg-background/80 px-4 py-3.5 transition-all duration-300 hover:border-foreground/15 hover:bg-background/95'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <div className='truncate text-sm font-semibold text-foreground'>
                          {post.metadata.title}
                          {post.metadata.language !== locale && <span className='ml-2 text-[10px] font-normal text-muted-foreground'>{t('Original', '原文', '原文')}: {post.metadata.language}</span>}
                        </div>
                        <p className='mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground'>
                          {post.metadata.summary}
                        </p>
                      </div>
                      <ArrowUpRightIcon className='mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
                    </div>
                    <div className='mt-2 flex items-center gap-2'>
                      {post.metadata.category && (
                        <span className='rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground'>
                          {categoryLabel(post.metadata.category, locale)}
                        </span>
                      )}
                      <span className='text-[10px] text-muted-foreground'>
                        {formatLocaleDate(post.metadata.publishedAt, locale, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </BlurFade>

          {/* Weekly Brief */}
          <BlurFade delay={BLUR_FADE_DELAY * 8}>
            <div className='flex h-full flex-col gap-5'>
              {weeklyBrief && (
                <div className='flex-1 rounded-[1.75rem] border border-border/60 bg-background/76 p-5 shadow-[0_22px_48px_-36px_rgba(15,23,42,0.55)] backdrop-blur-sm sm:p-6'>
                  <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-muted-foreground'>
                    <TrendingUpIcon className='size-3' />
                    {t("Weekly Brief", "每周简报", "ウィークリーブリーフ")}
                  </div>
                  <div className='mt-4 space-y-2'>
                    <div className='text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground'>
                      {formatLocaleDate(weeklyBrief.id, locale)} · {t('Original: 中文', '中文原文', '原文: 中文')}
                    </div>
                    <h3 className='text-base font-semibold tracking-[-0.03em] text-foreground leading-snug'>
                      {weeklyBrief.headline}
                    </h3>
                  </div>
                  {weeklyBrief.coreCrypto && (
                    <div className='mt-4 rounded-[1.1rem] border border-border/60 bg-background/80 px-3.5 py-2.5'>
                      <p className='text-xs leading-6 text-muted-foreground line-clamp-4'>
                        {weeklyBrief.coreCrypto}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Market tools */}
              <div className='rounded-[1.75rem] border border-border/60 bg-background/76 p-5 shadow-[0_20px_46px_-38px_rgba(15,23,42,0.55)] backdrop-blur-sm'>
                <div className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>
                  {t("Market tools", "市场工具", "市場ツール")}
                </div>
                <div className='mt-3 space-y-2'>
                  {[
                    { label: t("Oscillator", "震荡指标", "オシレーター"), href: '/oscillator', desc: t("ALT/BTC strength & breadth", "ALT/BTC 强度与市场广度", "ALT/BTC の強さと市場の広がり"), icon: ActivityIcon },
                    { label: t("Watch", "上币追踪", "上場ウォッチ"), href: '/watch', desc: t("Exchange listing signals", "交易所上币信号", "取引所の上場シグナル"), icon: RadioIcon },
                    { label: t("Fund", "投资", "投資"), href: '/fund', desc: t("Capital allocation framework", "资本配置框架", "資本配分のフレームワーク"), icon: TrendingUpIcon },
                  ].map((tool) => (
                    <Link
                      key={tool.label}
                      href={href(tool.href)}
                      className='group flex items-center justify-between gap-3 rounded-[1.15rem] border border-border/60 bg-background/80 px-3.5 py-3 transition-all duration-300 hover:border-foreground/15 hover:bg-background/95'>
                      <div className='flex items-center gap-3'>
                        <tool.icon className='size-4 text-foreground' />
                        <div>
                          <div className='text-sm font-semibold text-foreground'>{tool.label}</div>
                          <p className='text-xs text-muted-foreground'>{tool.desc}</p>
                        </div>
                      </div>
                      <ArrowRightIcon className='size-3.5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5' />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </BlurFade>
        </section>

        {/* ── NEWSLETTER / CONVERSION ─────────────────────────────── */}
        <section id='subscribe'>
          <BlurFade delay={BLUR_FADE_DELAY * 9}>
            <div className='relative overflow-hidden rounded-[1.9rem] border border-border/60 bg-background/76 p-6 shadow-[0_22px_54px_-38px_rgba(15,23,42,0.55)] backdrop-blur-sm sm:p-8'>
              <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_30%)]' />
              <div className='relative grid gap-6 lg:grid-cols-[1fr_auto]'>
                <div className='space-y-3'>
                  <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-muted-foreground'>
                    <RssIcon className='size-3' />
                    {t("Stay updated", "订阅更新", "更新を受け取る")}
                  </div>
                  <h2 className='text-2xl font-semibold tracking-[-0.04em] text-foreground'>
                    {t("Weekly research updates, market signals, and listing intelligence.", "每周研究更新、市场信号与上币情报。", "毎週のリサーチ、市場シグナル、上場情報。")}
                  </h2>
                  <p className='max-w-xl text-sm leading-7 text-muted-foreground'>
                    {t("Join the Telegram channel for real-time thoughts, or subscribe to the newsletter for structured weekly digests.", "加入 Telegram 频道获取实时思考，或订阅邮件，接收每周研究摘要。", "Telegram で最新の考察を読む、またはニュースレターで毎週のリサーチ要約を受け取る。")}
                  </p>
                  <div className='max-w-md'>
                    <NewsletterForm />
                  </div>
                </div>
                <div className='flex flex-col justify-center gap-3 sm:flex-row lg:flex-col'>
                  <Link
                    href={DATA.contact.social.TelegramChannel.url}
                    target='_blank'
                    className='inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-background/90 px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-foreground/15 hover:bg-background'>
                    <DATA.contact.social.TelegramChannel.icon className='size-4' />
                    {t("Follow on Telegram", "关注 Telegram", "Telegram をフォロー")}
                  </Link>
                  <Link
                    href={DATA.contact.social.X.url}
                    target='_blank'
                    className='inline-flex items-center justify-center gap-2 rounded-full border border-border/70 bg-background/80 px-5 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-foreground/15 hover:text-foreground'>
                    <DATA.contact.social.X.icon className='size-4' />
                    {t("Follow on X", "关注 X", "X をフォロー")}
                  </Link>
                </div>
              </div>
            </div>
          </BlurFade>
        </section>
      </main>
    </div>
  );
}
