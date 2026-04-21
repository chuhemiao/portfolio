'use client';

import BlurFade from '@/components/magicui/blur-fade';
import { Category } from '@/data/blog';
import Link from 'next/link';
import { useState } from 'react';

const BLUR_FADE_DELAY = 0.04;
const POSTS_PER_PAGE = 10;

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
  { key: 'tech', label: 'Tech' },
  { key: 'research', label: 'Research' },
  { key: 'investing', label: 'Investing' },
  { key: 'economics', label: 'Economics' },
  { key: 'philosophy', label: 'Philosophy' },
  { key: 'story', label: 'Story' }
];

export default function BlogClient({ posts }: { posts: Post[] }) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>(
    'all'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = posts
    .filter((post) => {
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : post.metadata.category === selectedCategory;
      if (!searchQuery.trim()) return matchesCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        post.metadata.title.toLowerCase().includes(q) ||
        post.metadata.summary.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
        return -1;
      }
      return 1;
    });

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE
  );

  const handleCategoryChange = (category: Category | 'all') => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <section className='space-y-8'>
      <BlurFade delay={BLUR_FADE_DELAY}>
        <div className='space-y-4'>
          <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.18em] text-muted-foreground shadow-sm backdrop-blur-md'>
            <span className='h-1.5 w-1.5 rounded-full bg-sky-500' />
            Writing
          </div>
          <h1 className='text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl'>
            Blog
          </h1>
        </div>
      </BlurFade>

      <BlurFade delay={BLUR_FADE_DELAY * 1.2}>
        <div className='relative max-w-xs'>
          <input
            type='text'
            placeholder='Search posts...'
            value={searchQuery}
            onChange={handleSearchChange}
            className='w-full rounded-full border border-border/70 bg-background/60 px-4 py-2 pl-9 text-[13px] text-foreground placeholder:text-muted-foreground/60 backdrop-blur-sm outline-none transition-all duration-200 focus:border-foreground/30 focus:bg-background/85'
          />
          <svg
            className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </div>
      </BlurFade>

      <BlurFade delay={BLUR_FADE_DELAY * 1.5}>
        <div className='flex flex-wrap gap-2'>
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => handleCategoryChange(category.key)}
              className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium tracking-[0.02em] backdrop-blur-sm transition-all duration-200 ${
                selectedCategory === category.key
                  ? 'border-foreground/80 bg-foreground text-background shadow-[0_12px_28px_-20px_rgba(15,23,42,0.8)]'
                  : 'border-border/70 bg-background/60 text-muted-foreground hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-background/85 hover:text-foreground'
              }`}>
              {category.label}
            </button>
          ))}
        </div>
      </BlurFade>

      {filteredPosts.length === 0 && (
        <p className='text-sm text-muted-foreground py-8 text-center'>
          No posts found.
        </p>
      )}

      {paginatedPosts.map((post, id) => (
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

      {totalPages > 1 && (
        <BlurFade delay={BLUR_FADE_DELAY * 3}>
          <div className='flex items-center justify-center gap-2 mt-8 pt-4 border-t border-border/60'>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className='h-9 rounded-full border border-border/70 bg-background/60 px-4 text-xs font-medium text-foreground transition-all hover:border-foreground/20 hover:bg-background/85 disabled:cursor-not-allowed disabled:opacity-40'>
              Previous
            </button>

            <div className='flex items-center gap-1'>
              {getPageNumbers().map((page, index) =>
                page === 'ellipsis' ? (
                  <span key={`ellipsis-${index}`} className='px-2 text-muted-foreground text-xs'>
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`size-9 rounded-full border text-xs font-medium transition-all ${
                      currentPage === page
                        ? 'border-foreground/80 bg-foreground text-background'
                        : 'border-border/70 bg-background/60 text-muted-foreground hover:border-foreground/20 hover:bg-background/85 hover:text-foreground'
                    }`}>
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className='h-9 rounded-full border border-border/70 bg-background/60 px-4 text-xs font-medium text-foreground transition-all hover:border-foreground/20 hover:bg-background/85 disabled:cursor-not-allowed disabled:opacity-40'>
              Next
            </button>
          </div>

          <p className='text-center text-xs text-muted-foreground mt-3'>
            {startIndex + 1}-{Math.min(startIndex + POSTS_PER_PAGE, filteredPosts.length)} of {filteredPosts.length} posts
          </p>
        </BlurFade>
      )}
    </section>
  );
}
