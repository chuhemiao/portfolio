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
  { key: 'research', label: 'Research' },
  { key: 'investing', label: 'Investing' },
  { key: 'economics', label: 'Economics' },
  { key: 'philosophy', label: 'Philosophy' }
];

export default function BlogClient({ posts }: { posts: Post[] }) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>(
    'all'
  );
  const [currentPage, setCurrentPage] = useState(1);

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
    <section>
      <BlurFade delay={BLUR_FADE_DELAY}>
        <h1 className='font-medium text-2xl mb-8 tracking-tighter'>blog</h1>
      </BlurFade>

      <BlurFade delay={BLUR_FADE_DELAY * 1.5}>
        <div className='flex flex-wrap gap-2 mb-8'>
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => handleCategoryChange(category.key)}
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
          <div className='flex items-center justify-center gap-2 mt-8 pt-4 border-t'>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className='px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-secondary text-secondary-foreground hover:bg-secondary/80'>
              Previous
            </button>

            <div className='flex items-center gap-1'>
              {getPageNumbers().map((page, index) =>
                page === 'ellipsis' ? (
                  <span key={`ellipsis-${index}`} className='px-2 text-muted-foreground'>
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}>
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className='px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-secondary text-secondary-foreground hover:bg-secondary/80'>
              Next
            </button>
          </div>

          <p className='text-center text-sm text-muted-foreground mt-4'>
            {startIndex + 1}-{Math.min(startIndex + POSTS_PER_PAGE, filteredPosts.length)} of {filteredPosts.length} posts
          </p>
        </BlurFade>
      )}
    </section>
  );
}
