import { localizedPageMetadata } from '@/lib/localized-metadata';
import { getTranslator, localizeHref, type Locale } from '@/lib/i18n';
import BlurFade from '@/components/magicui/blur-fade';
import { TOPICS, localizedTopic } from '@/data/topics';
import { getTopicPostCount } from '@/data/blog';
import { countProjectsByType } from '@/data/research-projects';
import { ArrowRightIcon, LayoutGridIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = localizedPageMetadata('/topics', 'en', {
  title: 'Topics',
  description:
    'Browse Crypto research by theme — Stablecoin, Perp DEX, CEX, L1/L2, AI×Crypto, RWA, Yield, and Market Structure.',
});

const BLUR_FADE_DELAY = 0.04;

export default function TopicsPage() { return renderPage('en'); }

export function renderPage(locale: Locale) {
  const t = getTranslator(locale);
  const href = (url: string) => localizeHref(url, locale);
  return (
    <div className='relative left-1/2 min-h-[100dvh] w-screen -translate-x-1/2 overflow-x-clip'>

      <main className='relative mx-auto w-full max-w-6xl px-4 pb-dock-safe pt-6 sm:px-6 sm:pb-dock-safe-lg sm:pt-10 lg:px-8'>
        {/* Header */}
        <BlurFade delay={BLUR_FADE_DELAY}>
          <div className='mb-8 space-y-4'>
            <div className='inline-flex items-center gap-2 rounded-sm border border-border bg-surface px-3.5 py-1.5 text-[11px] font-medium tracking-[0.16em] text-muted-foreground'>
              <LayoutGridIcon className='size-3' />
              {t('Topics', '主题', 'トピック')}
            </div>
            <h1 className='text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl'>
              {t('Browse by Theme', '按主题浏览', 'テーマ別に閲覧')}
            </h1>
            <p className='max-w-2xl text-[15px] leading-8 text-muted-foreground'>
              {t('Structured research organized by narrative and sector — each topic aggregates articles, projects, and market observations into a coherent view.', '按叙事与赛道组织研究，将相关文章、项目和市场观察汇集为主题视图。', 'テーマと分野別にリサーチを整理。記事、プロジェクト、市場の観察をまとめて閲覧できます。')}
            </p>
          </div>
        </BlurFade>

        {/* Topics grid */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {TOPICS.map(topic => ({ ...localizedTopic(topic, locale), postCount: getTopicPostCount(topic.slug, locale), projectCount: countProjectsByType(topic.relatedTypes) })).map((topic, id) => (
            <BlurFade key={topic.slug} delay={BLUR_FADE_DELAY * 2 + id * 0.04}>
              <Link
                href={href(`/topics/${topic.slug}`)}
                className='group flex h-full flex-col rounded border border-border bg-surface p-6 transition-all duration-300 hover:border-border-strong'>
                {/* Emoji + accent dot */}
                <div className='flex items-start justify-between'>
                  <span className='text-3xl'>{topic.emoji}</span>
                  <div
                    className='mt-1 size-2 rounded-full opacity-60'
                    style={{ backgroundColor: topic.accentColor }}
                  />
                </div>

                {/* Content */}
                <div className='mt-4 flex-1 space-y-2'>
                  <h2 className='text-base font-semibold tracking-[-0.03em] text-foreground'>
                    {topic.name}
                  </h2>
                  <p className='text-xs leading-6 text-muted-foreground'>{topic.tagline}</p>
                  <p className='text-xs leading-5 text-muted-foreground line-clamp-3'>
                    {topic.description}
                  </p>
                </div>

                {/* Counts + CTA */}
                <div className='mt-5 flex items-center justify-between'>
                  <div className='flex flex-wrap gap-1.5'>
                    {topic.postCount > 0 && (
                      <span className='rounded-sm border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted-foreground'>
                        {topic.postCount} {t('posts', '篇文章', '記事')}
                      </span>
                    )}
                    {topic.projectCount > 0 && (
                      <span className='rounded-sm border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted-foreground'>
                        {topic.projectCount} {t('projects', '个项目', 'プロジェクト')}
                      </span>
                    )}
                  </div>
                  <ArrowRightIcon className='size-4 text-muted-foreground transition-transform duration-300' />
                </div>
              </Link>
            </BlurFade>
          ))}
        </div>
      </main>
    </div>
  );
}
