'use client';

import BlurFade from '@/components/magicui/blur-fade';
import { Category } from '@/data/blog';
import Link from 'next/link';
import { useState } from 'react';

const BLUR_FADE_DELAY = 0.04;

type Post = {
  metadata: {
    title: string;
    publishedAt: string;
    summary: string;
    image?: string;
    category?: Category;
  };
  slug: string;
  source: string;
};

type CategoryInfo = {
  key: Category | 'all';
  label: string;
};

const categories: CategoryInfo[] = [
  { key: 'all', label: 'All' },
  { key: 'thoughts', label: 'Thoughts' },
  { key: 'research', label: 'Research' },
  { key: 'investing', label: 'Investing' },
  { key: 'economics', label: 'Economics' },
  { key: 'philosophy', label: 'Philosophy' }
];

export default function BlogClient({ posts }: { posts: Post[] }) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>(
    'all'
  );

  const filteredPosts = posts
    .filter((post) =>
      selectedCategory === 'all'
        ? true
        : post.metadata.category === selectedCategory
    )
    .sort((a, b) => {
      if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
        return -1;
      }
      return 1;
    });

  return (
    <section>
      <BlurFade delay={BLUR_FADE_DELAY}>
        <h1 className='font-medium text-2xl mb-8 tracking-tighter'>blog</h1>
      </BlurFade>

      <BlurFade delay={BLUR_FADE_DELAY * 1.5}>
        <div className='flex flex-wrap gap-2 mb-8'>
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}>
              {category.label}
            </button>
          ))}
        </div>
      </BlurFade>

      {filteredPosts.map((post, id) => (
        <BlurFade delay={BLUR_FADE_DELAY * 2 + id * 0.05} key={post.slug}>
          <Link
            className='flex flex-col space-y-1 mb-4'
            href={`/blog/${post.slug}`}>
            <div className='w-full flex flex-col'>
              <div className='flex items-center gap-2'>
                <p className='tracking-tight'>{post.metadata.title}</p>
                {post.metadata.category && (
                  <span className='text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground'>
                    {
                      categories.find((c) => c.key === post.metadata.category)
                        ?.label
                    }
                  </span>
                )}
              </div>
              <p className='h-6 text-xs text-muted-foreground'>
                {post.metadata.publishedAt}
              </p>
            </div>
          </Link>
        </BlurFade>
      ))}
    </section>
  );
}
