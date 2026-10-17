'use client';

import { useDashboardI18n } from '../fear/use-dashboard-i18n';
import { formatLocaleDate } from '@/lib/i18n';

import BlurFade from '@/components/magicui/blur-fade';
import {
  assets,
  categoryLabels,
  philosophy,
  type Asset,
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

const tierClassNames = {
  S: 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-300',
  A: 'border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-300',
  B: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  C: 'border-lime-500/40 bg-lime-500/10 text-lime-600 dark:text-lime-300',
  D: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
} satisfies Record<NonNullable<Asset['tier']>, string>;

export default function FundClient() {
  const { locale, href: localizedHref, d } = useDashboardI18n();
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
          <div className='inline-flex items-center gap-2 rounded-sm border border-border bg-surface px-3.5 py-1.5 text-[11px] font-medium tracking-[0.18em] text-muted-foreground'>
            <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' /> {d("Capital map")} </div>
          <h1 className='text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl'> {d("Fund")} </h1>
          <div className='space-y-1.5 text-[15px] leading-7 text-muted-foreground'>
            <p>{d(philosophy.intro)}</p>
            <p>{d(philosophy.principle)}</p>
            <p>{d(philosophy.criteria)}</p>
            <p className='italic'>{d(philosophy.thought)}</p>
          </div>
          <p className='text-xs text-muted-foreground'> {d("DYOR! DYOR! DYOR! Last updated:")}{' '}
            <span className='font-medium'>{formatLocaleDate(philosophy.lastUpdated.replace(/\//g, '-'), locale)}</span>
          </p>
        </div>
      </BlurFade>

      <BlurFade delay={BLUR_FADE_DELAY * 2}>
        <div className='flex flex-wrap gap-2'>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium tracking-[0.02em] transition-all duration-200 ${
                selectedCategory === cat.key
                  ? 'border-border-strong bg-foreground text-background'
                  : 'border-border bg-surface text-muted-foreground hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2 hover:text-foreground'
              }`}>
              {d(cat.label)}
            </button>
          ))}
        </div>
      </BlurFade>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filteredAssets.map((asset, id) => (
            <BlurFade
              delay={BLUR_FADE_DELAY * 3 + id * 0.05}
              key={`${asset.name}-${asset.category}`}>
              <div className='group flex h-full flex-col overflow-hidden rounded border border-border bg-surface p-4-[2px] transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2'>
                <div className='flex items-start justify-between mb-2'>
                  <div>
                    <h3 className='text-[15px] font-semibold tracking-[-0.02em] text-foreground'>{d(asset.name)}</h3>
                    {(asset.ticker || asset.handle) && (
                      <span className='text-xs text-muted-foreground'>
                        {asset.ticker ?? asset.handle}
                      </span>
                    )}
                  </div>
                  <div className='flex flex-col items-end gap-1 shrink-0'>
                    {asset.tier && (
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-[0.06em] ${tierClassNames[asset.tier]}`}> {d("Tier")} {asset.tier}
                      </span>
                    )}
                    <span className='rounded-sm border border-border bg-surface px-2 py-0.5 text-[10px] font-medium tracking-[0.06em] text-muted-foreground'>
                      {d(categoryLabels[asset.category])}
                    </span>
                    {asset.isPrivate && (
                      <span className='rounded-sm border border-border bg-surface px-2 py-0.5 text-[10px] text-subtle'> {d("private")} </span>
                    )}
                    {asset.category === 'prediction' && (
                      asset.hasToken && asset.tokenTicker ? (
                        <a
                          href={asset.coingeckoLink}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 transition-opacity hover:opacity-80 dark:text-emerald-400'>
                          ${asset.tokenTicker}
                        </a>
                      ) : asset.coingeckoLink ? (
                        <a
                          href={asset.coingeckoLink}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='rounded-sm border border-border bg-surface px-2 py-0.5 text-[10px] text-subtle hover:opacity-80 transition-opacity'> {d("no token ↗")} </a>
                      ) : (
                        <span className='rounded-sm border border-border bg-surface px-2 py-0.5 text-[10px] text-subtle'> {d("no token")} </span>
                      )
                    )}
                  </div>
                </div>
                <p className='flex-1 text-[13px] leading-6 text-muted-foreground'>
                  {d(asset.description)}
                </p>
                {(asset.link || asset.researchLink) && (
                  <div className='mt-3 flex items-center gap-3 border-t border-border pt-3'>
                    {asset.link && (
                      <a
                        href={localizedHref(asset.link)}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'>
                        <ExternalLinkIcon className='size-3' /> {d("Site")} </a>
                    )}
                    {asset.researchLink && (
                      <Link
                        href={localizedHref(asset.researchLink)}
                        className='flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'>
                        <BookOpenIcon className='size-3' /> {d("Research")} </Link>
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
