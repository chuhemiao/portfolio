'use client';

import BlurFade from '@/components/magicui/blur-fade';
import {
  assets,
  categoryLabels,
  philosophy,
  type AssetCategory
} from '@/data/fund';
import { BookOpenIcon, ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const BLUR_FADE_DELAY = 0.04;

const categories: Array<{ key: AssetCategory | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  ...Object.entries(categoryLabels).map(([key, label]) => ({
    key: key as AssetCategory,
    label
  }))
];

export default function FundClient() {
  const [selectedCategory, setSelectedCategory] = useState<
    AssetCategory | 'all'
  >('all');

  const filteredAssets = assets.filter((asset) =>
    selectedCategory === 'all' ? true : asset.category === selectedCategory
  );

  return (
    <section className='space-y-8'>
      <BlurFade delay={BLUR_FADE_DELAY}>
        <div className='space-y-4'>
          <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.18em] text-muted-foreground shadow-sm backdrop-blur-md'>
            <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
            Capital map
          </div>
          <h1 className='text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl'>
            Fund
          </h1>
          <div className='space-y-1.5 text-[15px] leading-7 text-muted-foreground'>
            <p>{philosophy.intro}</p>
            <p>{philosophy.principle}</p>
            <p>{philosophy.criteria}</p>
            <p className='italic'>{philosophy.thought}</p>
          </div>
          <p className='text-xs text-muted-foreground'>
            DYOR! DYOR! DYOR! Last updated:{' '}
            <span className='font-medium'>{philosophy.lastUpdated}</span>
          </p>
        </div>
      </BlurFade>

      <BlurFade delay={BLUR_FADE_DELAY * 2}>
        <div className='flex flex-wrap gap-2'>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium tracking-[0.02em] backdrop-blur-sm transition-all duration-200 ${
                selectedCategory === cat.key
                  ? 'border-foreground/80 bg-foreground text-background shadow-[0_12px_28px_-20px_rgba(15,23,42,0.8)]'
                  : 'border-border/70 bg-background/60 text-muted-foreground hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-background/85 hover:text-foreground'
              }`}>
              {cat.label}
            </button>
          ))}
        </div>
      </BlurFade>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filteredAssets.map((asset, id) => (
            <BlurFade
              delay={BLUR_FADE_DELAY * 3 + id * 0.05}
              key={`${asset.name}-${asset.category}`}>
              <div className='group flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-border/60 bg-background/72 p-4 backdrop-blur-[2px] transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:bg-background/84'>
                <div className='flex items-start justify-between mb-2'>
                  <div>
                    <h3 className='text-[15px] font-semibold tracking-[-0.02em] text-foreground'>{asset.name}</h3>
                    {asset.ticker && (
                      <span className='text-xs text-muted-foreground'>
                        {asset.ticker}
                      </span>
                    )}
                  </div>
                  <div className='flex flex-col items-end gap-1 shrink-0'>
                    <span className='rounded-full border border-border/70 bg-background/80 px-2 py-0.5 text-[10px] font-medium tracking-[0.06em] text-muted-foreground'>
                      {categoryLabels[asset.category]}
                    </span>
                    {asset.isPrivate && (
                      <span className='rounded-full border border-border/50 bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground/70'>
                        private
                      </span>
                    )}
                    {asset.category === 'prediction' && (
                      asset.hasToken && asset.tokenTicker ? (
                        <a
                          href={asset.coingeckoLink}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 transition-opacity hover:opacity-80 dark:text-emerald-400'>
                          ${asset.tokenTicker}
                        </a>
                      ) : asset.coingeckoLink ? (
                        <a
                          href={asset.coingeckoLink}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='rounded-full border border-border/50 bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground/70 hover:opacity-80 transition-opacity'>
                          no token ↗
                        </a>
                      ) : (
                        <span className='rounded-full border border-border/50 bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground/70'>
                          no token
                        </span>
                      )
                    )}
                  </div>
                </div>
                <p className='flex-1 text-[13px] leading-6 text-muted-foreground'>
                  {asset.description}
                </p>
                {(asset.link || asset.researchLink) && (
                  <div className='mt-3 flex items-center gap-3 border-t border-border/60 pt-3'>
                    {asset.link && (
                      <a
                        href={asset.link}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'>
                        <ExternalLinkIcon className='size-3' />
                        Site
                      </a>
                    )}
                    {asset.researchLink && (
                      <Link
                        href={asset.researchLink}
                        className='flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'>
                        <BookOpenIcon className='size-3' />
                        Research
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </BlurFade>
          ))}
      </div>
    </section>
  );
}
