import { localizedPageMetadata } from '@/lib/localized-metadata';
import { categoryLabel, formatLocaleDate, getTranslator, localizeHref, type Locale } from '@/lib/i18n';
import { PROJECTS } from '@/data/research-projects';
import { DATA } from '@/data/resume';
import { TOPICS, localizedTopic } from '@/data/topics';
import { WEEKLY_REPORTS } from '@/data/weekly-research';
import { getLocalizedWeeklyReport } from '@/lib/weekly-localization';
import { getBlogPosts, getLocalizedPosts, getPostHref } from '@/data/blog';
import { ArrowRightIcon, ArrowUpRightIcon, SearchIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import NewsletterForm from '@/components/newsletter-form';

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
    logoUrl: '/research-logos/binance_2025_report.png',
  },
  {
    name: 'Hyperliquid',
    type: 'Perp DEX',
    slug: 'hyperliquid_report_2026',
    description: 'On-chain order book perpetuals · $10B+ daily volume',
    logoUrl: '/research-logos/hyperliquid_report_2026.png',
  },
  {
    name: 'Coinbase',
    type: 'CEX',
    slug: 'coinbase_report_2026',
    description: 'US-regulated exchange evolving into diversified financial platform',
    logoUrl: '/research-logos/coinbase_report_2026.png',
  },
  {
    name: 'Solana',
    type: 'L1',
    slug: 'solana-sol-monolithic-execution-powerhouse-or-fragile-high-beta-trading',
    description: 'High-throughput L1 · DeFi, NFT, and payments hub',
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
  const latestPosts = localizedPosts.slice(0, 8);
  const postBySlug = new Map(allPosts.map(post => [post.slug, post]));
  const topics = TOPICS.map(topic => localizedTopic(topic, locale));

  const featuredDescriptions: Record<string, string> = {
    Binance: t("World's largest exchange · 300M+ users · $168B daily volume", '全球最大交易所 · 3 亿以上用户 · 日交易量 1680 亿美元', '世界最大の取引所 · ユーザー 3 億人以上 · 日次取引量 1680 億ドル'),
    Hyperliquid: t('On-chain order book perpetuals · $10B+ daily volume', '链上订单簿永续合约 · 日交易量超 100 亿美元', 'オンチェーン注文板の無期限先物 · 日次取引量 100 億ドル以上'),
    Coinbase: t('US-regulated exchange evolving into diversified financial platform', '美国受监管交易所，向多元金融平台发展', '米国の規制に準拠する取引所から総合金融プラットフォームへ'),
    Solana: t('High-throughput L1 · DeFi, NFT, and payments hub', '高吞吐量 L1 · DeFi、NFT 与支付生态', '高スループット L1 · DeFi、NFT、決済の拠点'),
  };

  const STATS = [
    { value: PROJECTS.length.toLocaleString(locale), label: 'PROJECTS' },
    { value: localizedPosts.length.toLocaleString(locale), label: 'RESEARCH NOTES' },
    { value: TOPICS.length.toLocaleString(locale), label: 'TOPICS' },
    { value: 'ZH EN JA', label: 'LANGUAGES' },
  ];

  const TOOLS = [
    { label: t('Oscillator', '震荡指标', 'オシレーター'), href: '/oscillator', desc: t('ALT/BTC strength & breadth', 'ALT/BTC 强度与市场广度', 'ALT/BTC の強さと広がり') },
    { label: t('Watch', '上币追踪', '上場ウォッチ'), href: '/watch', desc: t('Exchange listing signals', '交易所上币信号', '取引所の上場シグナル') },
    { label: t('Fear & Greed', '恐惧贪婪', '恐怖と強欲'), href: '/fear', desc: t('Sentiment gauge', '市场情绪指标', '市場センチメント') },
    { label: t('Fund', '投资', '投資'), href: '/fund', desc: t('Capital allocation framework', '资本配置框架', '資本配分のフレームワーク') },
  ];

  const EXCHANGES = [
    {
      name: 'Binance',
      initial: 'BN',
      url: DATA.contact.social.binance.url,
      desc: t('Spot & futures · referral signup', '现货 / 合约 · 返佣开户', '現物・先物 · 紹介リンク'),
    },
    {
      name: 'Hyperliquid',
      initial: 'HL',
      url: DATA.contact.social.hyper.url,
      desc: t('On-chain order book perps', '链上订单簿永续 · 开户', 'オンチェーン注文板の無期限先物'),
    },
  ];

  const localizedBrief = WEEKLY_REPORTS[0] ? getLocalizedWeeklyReport(WEEKLY_REPORTS[0], locale) : undefined;
  const weeklyBrief = localizedBrief?.report;

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
    <div>
      <script
        type='application/ld+json'
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* ── HERO · search is the page, not a decoration ───────────── */}
      <section className='border-b border-border'>
        <div className='mx-auto max-w-[1240px] px-4 pb-14 pt-14 sm:px-8 sm:pt-16'>
          <div className='mb-6 flex items-center gap-2.5'>
            <span aria-hidden='true' className='block size-1.5 bg-positive' />
            <span className='mono-label'>
              {t('Research terminal · updated weekly', '研究终端 · 每周更新', 'リサーチターミナル · 毎週更新')}
            </span>
          </div>

          <h1 className='mb-4 max-w-[820px] text-[30px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[44px] sm:leading-[1.12]'>
            {t('Crypto market structure, written up as a searchable research library', '把加密市场结构写成一个可检索的研究库', '暗号資産の市場構造を、検索できるリサーチ資料に')}
          </h1>
          <p className='mb-9 max-w-[640px] text-[15px] leading-[1.75] text-muted-foreground sm:text-base'>
            {t(
              'Exchanges, perp DEXs, stablecoins, L1/L2, RWA, AI × Crypto — tracked over time, taken apart one by one, kept current.',
              '交易所、永续 DEX、稳定币、L1/L2、RWA、AI × Crypto —— 长期跟踪、逐个拆解、持续更新。',
              '取引所、無期限 DEX、ステーブルコイン、L1/L2、RWA、AI × Crypto —— 長く追い、ひとつずつ分解し、更新し続ける。'
            )}
          </p>

          <Link
            href={href('/research')}
            className='mb-5 flex h-[60px] max-w-[760px] items-center gap-3.5 rounded border border-border-strong bg-surface px-4 transition-colors hover:border-subtle'
          >
            <SearchIcon aria-hidden='true' className='size-[18px] shrink-0 text-subtle' />
            <span className='min-w-0 truncate text-[15px] text-subtle sm:text-base'>
              {t('Search projects, tokens, exchanges, topics…', '搜索项目、代币、交易所、研究主题…', 'プロジェクト、トークン、取引所、トピックを検索…')}
            </span>
            <span className='ml-auto hidden shrink-0 rounded-sm border border-border px-[7px] py-[3px] font-mono text-[11px] text-subtle sm:block'>
              {PROJECTS.length.toLocaleString(locale)}
            </span>
          </Link>

          <div className='mb-11 flex max-w-[900px] flex-wrap gap-2'>
            <Link
              href={href('/research')}
              className='rounded-sm bg-brand px-3 py-1.5 font-mono text-[12px] text-brand-foreground'
            >
              {t('All', '全部', 'すべて')}
            </Link>
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                href={href(`/topics/${topic.slug}`)}
                className='rounded-sm border border-border px-3 py-1.5 font-mono text-[12px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground'
              >
                {topic.name}
              </Link>
            ))}
          </div>

          <div className='grid grid-cols-2 gap-px border-y border-border bg-border sm:grid-cols-4'>
            {STATS.map((stat) => (
              <div key={stat.label} className='bg-background px-4 py-4 sm:px-6 sm:py-5'>
                <div className='tnum font-mono text-[22px] font-medium tracking-[-0.02em] sm:text-[28px]'>
                  {stat.value}
                </div>
                <div className='mt-1 truncate font-mono text-[10px] tracking-[0.14em] text-subtle sm:text-[11px]'>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 索引 + 侧栏 ───────────────────────────────────────────── */}
      <div className='mx-auto flex max-w-[1240px] flex-wrap items-start gap-12 px-4 pt-14 sm:px-8 lg:gap-14'>
        <main className='min-w-0 flex-[999_1_560px]'>
          <div className='mb-5 flex items-baseline justify-between gap-4'>
            <h2 className='text-xl font-semibold tracking-[-0.015em]'>
              {t('Latest', '最近更新', '最新の更新')}
            </h2>
            <Link href={href('/blog')} className='font-mono text-[12px] text-muted-foreground transition-colors hover:text-foreground'>
              {t('All', '全部', 'すべて')} {localizedPosts.length.toLocaleString(locale)} →
            </Link>
          </div>

          <div className='grid grid-cols-[84px_minmax(0,1fr)] gap-5 border-b border-border-strong px-3 pb-2.5 font-mono text-[11px] tracking-[0.14em] text-subtle sm:grid-cols-[92px_minmax(0,1fr)_130px]'>
            <div>{t('DATE', '日期', '日付')}</div>
            <div>{t('TITLE', '标题', 'タイトル')}</div>
            <div className='hidden sm:block'>{t('CATEGORY', '分类', 'カテゴリ')}</div>
          </div>

          {latestPosts.map((post) => (
            <Link
              key={post.slug}
              href={getPostHref(post, locale)}
              className='idx-row grid-cols-[84px_minmax(0,1fr)] sm:grid-cols-[92px_minmax(0,1fr)_130px]'
            >
              <div className='tnum font-mono text-[12px] text-subtle'>
                {post.metadata.publishedAt}
              </div>
              <div className='truncate text-[14.5px] leading-[1.5]'>{post.metadata.title}</div>
              <div className='hidden font-mono text-[11px] tracking-[0.06em] text-muted-foreground sm:block'>
                {post.metadata.category ? categoryLabel(post.metadata.category, locale) : '—'}
              </div>
            </Link>
          ))}

          <h2 className='mb-5 mt-12 text-xl font-semibold tracking-[-0.015em]'>
            {t('Featured research', '重点研究', '注目のリサーチ')}
          </h2>
          <div className='grid gap-px border border-border bg-border sm:grid-cols-2'>
            {FEATURED_RESEARCH.map((project) => (
              <Link
                key={project.slug}
                href={postBySlug.has(project.slug) ? getPostHref(postBySlug.get(project.slug)!, locale) : href(`/blog/${project.slug}`)}
                className='block bg-background p-5 transition-colors hover:bg-surface-2'
              >
                <div className='mb-3 flex items-center gap-2.5'>
                  <img src={project.logoUrl} alt='' className='size-[26px] shrink-0 rounded-sm' loading='lazy' />
                  <span className='text-[15px] font-semibold'>{project.name}</span>
                  <span className='rounded-sm border border-border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] text-subtle'>
                    {project.type}
                  </span>
                </div>
                <p className='text-[13px] leading-[1.65] text-muted-foreground'>
                  {featuredDescriptions[project.name] ?? project.description}
                </p>
              </Link>
            ))}
          </div>
        </main>

        <aside className='flex min-w-0 flex-[1_1_320px] flex-col gap-8'>
          {weeklyBrief && (
            <section className='rounded border border-border bg-surface p-5'>
              <div className='mono-label mb-3.5'>
                {t('Weekly brief', '本周简报', 'ウィークリーブリーフ')}
                {localizedBrief?.fallbackOriginal && <> · {t('original', '原文', '原文')}</>}
              </div>
              <div className='tnum mb-2 font-mono text-[11px] tracking-[0.1em] text-subtle'>
                {formatLocaleDate(weeklyBrief.id, locale)}
              </div>
              <h3 lang={localizedBrief?.language} className='mb-3 text-base font-semibold leading-[1.5]'>
                {weeklyBrief.headline}
              </h3>
              {weeklyBrief.coreCrypto && (
                <p lang={localizedBrief?.language} className='mb-3 line-clamp-4 text-[13px] leading-[1.7] text-muted-foreground'>
                  {weeklyBrief.coreCrypto}
                </p>
              )}
              <Link href={href('/pulse')} className='font-mono text-[12px] text-brand transition-opacity hover:opacity-80'>
                {t('Read in full', '读全文', '全文を読む')} →
              </Link>
            </section>
          )}

          <section>
            <div className='mono-label mb-3'>{t('Market tools', '市场工具', '市場ツール')}</div>
            <div className='overflow-hidden rounded border border-border'>
              {TOOLS.map((tool, i) => (
                <Link
                  key={tool.href}
                  href={href(tool.href)}
                  className={`flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2 ${i < TOOLS.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <span className='min-w-0'>
                    <span className='block text-sm font-semibold'>{tool.label}</span>
                    <span className='mt-0.5 block text-[12px] text-subtle'>{tool.desc}</span>
                  </span>
                  <ArrowRightIcon aria-hidden='true' className='size-3.5 shrink-0 text-subtle' />
                </Link>
              ))}
            </div>
          </section>

          {/* Referral links keep a fixed, labelled slot instead of an unlabelled dock icon. */}
          <section>
            <div className='mono-label mb-3'>{t('Exchanges', '交易入口', '取引所')}</div>
            <div className='overflow-hidden rounded border border-border'>
              {EXCHANGES.map((ex, i) => (
                <Link
                  key={ex.name}
                  href={ex.url}
                  target='_blank'
                  rel='sponsored noopener'
                  className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2 ${i < EXCHANGES.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <span className='flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[11px] font-medium text-muted-foreground'>
                    {ex.initial}
                  </span>
                  <span className='min-w-0 flex-grow'>
                    <span className='block text-sm font-semibold'>{ex.name}</span>
                    <span className='block text-[12px] text-subtle'>{ex.desc}</span>
                  </span>
                  <ArrowUpRightIcon aria-hidden='true' className='size-3.5 shrink-0 text-subtle' />
                </Link>
              ))}
            </div>
            <p className='mt-2 font-mono text-[10.5px] tracking-[0.04em] text-subtle'>
              {t('Referral links · research stays independent', '含邀请链接 · 不影响研究结论', '紹介リンク · リサーチの結論には影響しません')}
            </p>
          </section>
        </aside>
      </div>

      {/* ── 订阅 ──────────────────────────────────────────────────── */}
      <section className='mx-auto mt-16 max-w-[1240px] px-4 sm:px-8'>
        <div className='flex flex-wrap items-center gap-8 rounded border border-border bg-surface p-6 sm:p-8'>
          <div className='min-w-0 flex-[999_1_380px]'>
            <h2 className='mb-2 text-xl font-semibold tracking-[-0.015em]'>
              {t('One email a week: research updates and listing intelligence', '每周一封，研究更新与上币情报', '週に一通、リサーチ更新と上場情報')}
            </h2>
            <p className='text-sm leading-[1.7] text-muted-foreground'>
              {t('No reposted price feeds — only what I write myself. Unsubscribe anytime.', '不转发行情，只发自己写的东西。随时退订。', '相場の転載はなし、自分で書いたものだけ。いつでも解除できます。')}
            </p>
          </div>
          <div className='min-w-0 flex-[1_1_340px]'>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}
