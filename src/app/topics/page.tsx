import BlurFade from '@/components/magicui/blur-fade';
import { TOPICS } from '@/data/topics';
import { ArrowRightIcon, LayoutGridIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Topics',
  description:
    'Browse Crypto research by theme — Stablecoin, Perp DEX, CEX, L1/L2, AI×Crypto, RWA, Yield, and Market Structure.',
};

const BLUR_FADE_DELAY = 0.04;

export default function TopicsPage() {
  return (
    <div className='relative left-1/2 min-h-[100dvh] w-screen -translate-x-1/2 overflow-x-clip'>
      <div className='pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(241,245,249,0.92)_50%,rgba(248,250,252,1)_100%)] dark:bg-[linear-gradient(180deg,rgba(2,6,23,1)_0%,rgba(7,17,33,0.96)_50%,rgba(2,6,23,1)_100%)]' />
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_20%_10%,rgba(14,165,233,0.12),transparent_26%),radial-gradient(circle_at_80%_15%,rgba(139,92,246,0.10),transparent_22%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.14),transparent_26%),radial-gradient(circle_at_80%_15%,rgba(139,92,246,0.14),transparent_22%)]' />

      <main className='relative mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pb-32 sm:pt-10 lg:px-8'>
        {/* Header */}
        <BlurFade delay={BLUR_FADE_DELAY}>
          <div className='mb-8 space-y-4'>
            <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.16em] text-muted-foreground backdrop-blur'>
              <LayoutGridIcon className='size-3' />
              Topics
            </div>
            <h1 className='text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl'>
              Browse by Theme
            </h1>
            <p className='max-w-2xl text-[15px] leading-8 text-muted-foreground'>
              Structured research organized by narrative and sector — each topic aggregates articles, projects, and market observations into a coherent view.
            </p>
          </div>
        </BlurFade>

        {/* Topics grid */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {TOPICS.map((topic, id) => (
            <BlurFade key={topic.slug} delay={BLUR_FADE_DELAY * 2 + id * 0.04}>
              <Link
                href={`/topics/${topic.slug}`}
                className='group flex h-full flex-col rounded-[1.75rem] border border-border/60 bg-background/78 p-6 shadow-[0_16px_38px_-28px_rgba(15,23,42,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-foreground/15 hover:shadow-[0_24px_50px_-28px_rgba(15,23,42,0.65)]'>
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
                      <span className='rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground'>
                        {topic.postCount} posts
                      </span>
                    )}
                    {topic.projectCount > 0 && (
                      <span className='rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground'>
                        {topic.projectCount} projects
                      </span>
                    )}
                  </div>
                  <ArrowRightIcon className='size-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5' />
                </div>
              </Link>
            </BlurFade>
          ))}
        </div>
      </main>
    </div>
  );
}
