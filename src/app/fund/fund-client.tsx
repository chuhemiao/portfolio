'use client';

import BlurFade from '@/components/magicui/blur-fade';
import {
  assets,
  categoryLabels,
  philosophy,
  type AssetCategory
} from '@/data/fund';
import { ExternalLinkIcon } from 'lucide-react';
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
    <section>
      <BlurFade delay={BLUR_FADE_DELAY}>
        <h1 className='font-medium text-2xl mb-4 tracking-tighter'>fund</h1>
      </BlurFade>

      <BlurFade delay={BLUR_FADE_DELAY * 1.5}>
        <div className='space-y-2 mb-2 text-sm text-muted-foreground'>
          <p>{philosophy.intro}</p>
          <p>{philosophy.principle}</p>
          <p>{philosophy.criteria}</p>
          <p>{philosophy.thought}</p>
        </div>
        <p className='text-xs text-muted-foreground mb-8'>
          DYOR! DYOR! DYOR! Last updated:{' '}
          <span className='font-medium'>{philosophy.lastUpdated}</span>
        </p>
      </BlurFade>

      <BlurFade delay={BLUR_FADE_DELAY * 2}>
        <div className='flex flex-wrap gap-2 mb-8'>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                selectedCategory === cat.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}>
              {cat.label}
            </button>
          ))}
        </div>
      </BlurFade>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {filteredAssets.map((asset, id) => (
          <BlurFade
            delay={BLUR_FADE_DELAY * 3 + id * 0.05}
            key={asset.name}>
            {asset.link ? (
              <a
                href={asset.link}
                target='_blank'
                rel='noopener noreferrer'
                className='border rounded-lg p-4 hover:shadow-md transition-shadow block h-full'>
                <AssetCardContent asset={asset} />
              </a>
            ) : (
              <div className='border rounded-lg p-4 h-full'>
                <AssetCardContent asset={asset} />
              </div>
            )}
          </BlurFade>
        ))}
      </div>
    </section>
  );
}

function AssetCardContent({ asset }: { asset: (typeof assets)[number] }) {
  return (
    <>
      <div className='flex items-start justify-between mb-2'>
        <div>
          <h3 className='font-semibold'>{asset.name}</h3>
          {asset.ticker && (
            <span className='text-xs text-muted-foreground'>
              {asset.ticker}
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground'>
            {categoryLabels[asset.category]}
          </span>
          {asset.link && (
            <ExternalLinkIcon className='size-3 text-muted-foreground' />
          )}
        </div>
      </div>
      <p className='text-sm text-muted-foreground'>{asset.description}</p>
    </>
  );
}
