import { localizedPageMetadata } from '@/lib/localized-metadata';
import { getTranslator, localizeHref, formatLocaleDate, type Locale } from '@/lib/i18n';
import BlurFade from '@/components/magicui/blur-fade';
import { getPostsForTopic, getLocalizedPosts, getPostHref } from '@/data/blog';
import { getTopicBySlug, TOPICS, localizedTopic } from '@/data/topics';
import { ArrowRightIcon, ArrowUpRightIcon, BookOpenIcon, SearchIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return {};
  return {
    ...localizedPageMetadata(`/topics/${slug}`, 'en'),
    title: `${topic.name} Research`,
    description: topic.description,
  };
}

const BLUR_FADE_DELAY = 0.04;

export default async function TopicDetailPage({ params }: Props) {
  return renderPage('en', (await params).slug);
}

export async function renderPage(locale: Locale, slug: string) {
  const t = getTranslator(locale);
  const href = (url: string) => localizeHref(url, locale);
  const sourceTopic = getTopicBySlug(slug);
  if (!sourceTopic) notFound();
  const topic = localizedTopic(sourceTopic, locale);

  // topic-index.json is precomputed by the content compiler.
  const relatedPosts = getLocalizedPosts(getPostsForTopic(topic.slug), locale).slice(0, 8);

  return (
    <div className='relative left-1/2 min-h-[100dvh] w-screen -translate-x-1/2 overflow-x-clip'>
      <div className='pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(241,245,249,0.92)_50%,rgba(248,250,252,1)_100%)] dark:bg-[linear-gradient(180deg,rgba(2,6,23,1)_0%,rgba(7,17,33,0.96)_50%,rgba(2,6,23,1)_100%)]' />

      <main className='relative mx-auto w-full max-w-5xl px-4 pb-dock-safe pt-6 sm:px-6 sm:pb-dock-safe-lg sm:pt-10 lg:px-8'>
        {/* Breadcrumb */}
        <BlurFade delay={BLUR_FADE_DELAY}>
          <div className='mb-6 flex items-center gap-2 text-xs text-muted-foreground'>
            <Link href={href('/topics')} className='hover:text-foreground'>{t('Topics', '主题', 'トピック')}</Link>
            <span>/</span>
            <span>{topic.name}</span>
          </div>
        </BlurFade>

        {/* Hero */}
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <div className='relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/78 p-6 shadow-[0_28px_80px_-46px_rgba(15,23,42,0.45)] backdrop-blur-md sm:p-10'>
            <div
              className='pointer-events-none absolute inset-0 opacity-5'
              style={{ background: `radial-gradient(circle at top left, ${topic.accentColor}, transparent 60%)` }}
            />
            <div className='relative space-y-5'>
              <div className='flex items-center gap-4'>
                <span className='text-5xl'>{topic.emoji}</span>
                <div>
                  <div className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>{t('Topic', '主题', 'トピック')}</div>
                  <h1 className='text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl'>
                    {topic.name}
                  </h1>
                </div>
              </div>
              <p className='max-w-2xl text-[15px] leading-8 text-muted-foreground'>
                {topic.description}
              </p>
              <div className='rounded-[1.35rem] border border-border/60 bg-background/80 p-4'>
                <div className='text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                  {t('Why it matters', '为何值得关注', '注目する理由')}
                </div>
                <p className='mt-2 text-sm leading-7 text-foreground'>{topic.whyItMatters}</p>
              </div>
              <div className='flex flex-wrap gap-2'>
                {topic.postCount > 0 && (
                  <span className='rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground'>
                    {topic.postCount}+ {t('posts', '篇文章', '記事')}
                  </span>
                )}
                {topic.projectCount > 0 && (
                  <span className='rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground'>
                    {topic.projectCount} {t('projects', '个项目', 'プロジェクト')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Related Posts */}
        <section className='mt-8 space-y-5'>
          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <div className='flex items-center justify-between gap-4'>
              <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-muted-foreground'>
                <BookOpenIcon className='size-3' />
                {t('Related Posts', '相关文章', '関連記事')}
              </div>
              <Link
                href={href(`/blog?topic=${encodeURIComponent(topic.slug)}`)}
                className='inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground'>
                {t('See all', '查看全部', 'すべて見る')} <ArrowRightIcon className='size-3.5' />
              </Link>
            </div>
          </BlurFade>

          {relatedPosts.length > 0 ? (
            <div className='grid gap-3 sm:grid-cols-2'>
              {relatedPosts.map((post, id) => (
                <BlurFade key={post.slug} delay={BLUR_FADE_DELAY * 4 + id * 0.04}>
                  <Link
                    href={getPostHref(post, locale)}
                    className='group block rounded-[1.5rem] border border-border/60 bg-background/78 p-5 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/15'>
                    <div className='flex items-start justify-between gap-3'>
                      <h3 className='text-sm font-semibold leading-snug text-foreground line-clamp-2'>
                        {post.metadata.title}
                        {post.metadata.language !== locale && <span className='ml-2 text-[10px] font-normal text-muted-foreground'>{t('Original', '原文', '原文')}: {post.metadata.language}</span>}
                      </h3>
                      <ArrowUpRightIcon className='mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
                    </div>
                    {post.metadata.summary && (
                      <p className='mt-2 text-xs leading-5 text-muted-foreground line-clamp-2'>
                        {post.metadata.summary}
                      </p>
                    )}
                    <div className='mt-3 text-[10px] text-muted-foreground'>
                      {formatLocaleDate(post.metadata.publishedAt, locale, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </Link>
                </BlurFade>
              ))}
            </div>
          ) : (
            <BlurFade delay={BLUR_FADE_DELAY * 4}>
              <div className='rounded-[1.5rem] border border-border/60 bg-background/76 p-6 text-center text-sm text-muted-foreground'>
                {t('No tagged posts yet — check back soon.', '暂无相关文章。', '関連記事はまだありません。')}
              </div>
            </BlurFade>
          )}
        </section>

        {/* CTA to Research */}
        <BlurFade delay={BLUR_FADE_DELAY * 5}>
          <div className='mt-8 rounded-[1.75rem] border border-border/60 bg-background/76 p-6 shadow-[0_20px_48px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm'>
            <div className='flex items-center justify-between gap-6'>
              <div className='space-y-1'>
                <div className='text-sm font-semibold text-foreground'>{t(`Explore ${topic.name} projects in the Research Map`, `在研究地图中探索${topic.name}项目`, `リサーチマップで${topic.name}のプロジェクトを探す`)}</div>
                <p className='text-xs leading-5 text-muted-foreground'>
                  {topic.projectCount > 0
                    ? t(`${topic.projectCount} projects analyzed across this sector.`, `已研究该赛道的 ${topic.projectCount} 个项目。`, `この分野の ${topic.projectCount} プロジェクトを分析済み。`)
                    : t('Browse all researched projects.', '浏览全部研究项目。', 'すべての研究プロジェクトを見る。')}
                </p>
              </div>
              <Link
                href={href('/research')}
                className='inline-flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-background/90 px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-foreground/15 hover:bg-background'>
                <SearchIcon className='size-4' />
                {t('Research Map', '研究地图', 'リサーチマップ')}
              </Link>
            </div>
          </div>
        </BlurFade>
      </main>
    </div>
  );
}
