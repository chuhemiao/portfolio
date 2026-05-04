'use client';

import BlurFade from '@/components/magicui/blur-fade';
import { Category } from '@/data/blog';
import { TOPICS } from '@/data/topics';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ArrowUpRightIcon, SearchIcon, XIcon } from 'lucide-react';

const BLUR_FADE_DELAY = 0.04;
const POSTS_PER_PAGE = 12;

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

const CATEGORIES: CategoryInfo[] = [
  { key: 'all', label: 'All' },
  { key: 'thoughts', label: 'Thoughts' },
  { key: 'tech', label: 'Tech' },
  { key: 'research', label: 'Research' },
  { key: 'investing', label: 'Investing' },
  { key: 'economics', label: 'Economics' },
  { key: 'philosophy', label: 'Philosophy' },
  { key: 'story', label: 'Story' },
];

export default function BlogClient({ posts }: { posts: Post[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialCategory = (searchParams.get('category') as Category | 'all') ?? 'all';
  const validCategories = CATEGORIES.map((c) => c.key);
  const safeInitialCategory = validCategories.includes(initialCategory) ? initialCategory : 'all';

  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>(safeInitialCategory);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync URL → state when user navigates back/forward
  useEffect(() => {
    const cat = searchParams.get('category') as Category | 'all';
    if (cat && validCategories.includes(cat)) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const updateUrl = useCallback(
    (category: Category | 'all') => {
      const params = new URLSearchParams(searchParams.toString());
      if (category === 'all') {
        params.delete('category');
      } else {
        params.set('category', category);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'all' || post.metadata.category === selectedCategory;

    const matchesTopic = selectedTopic
      ? (() => {
          const topic = TOPICS.find((t) => t.slug === selectedTopic);
          if (!topic) return true;
          const text = [post.metadata.title, post.metadata.summary, post.metadata.category ?? '']
            .join(' ')
            .toLowerCase();
          return topic.matchKeywords.some((kw) => text.includes(kw.toLowerCase()));
        })()
      : true;

    const matchesSearch = searchQuery.trim()
      ? (() => {
          const q = searchQuery.toLowerCase();
          return (
            post.metadata.title.toLowerCase().includes(q) ||
            post.metadata.summary.toLowerCase().includes(q)
          );
        })()
      : true;

    return matchesCategory && matchesTopic && matchesSearch;
  });

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handleCategoryChange = (category: Category | 'all') => {
    setSelectedCategory(category);
    setSelectedTopic(null);
    setCurrentPage(1);
    updateUrl(category);
  };

  const handleTopicChange = (slug: string) => {
    setSelectedTopic((prev) => (prev === slug ? null : slug));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedTopic(null);
    setSearchQuery('');
    setCurrentPage(1);
    updateUrl('all');
  };

  const hasActiveFilter =
    selectedCategory !== 'all' || selectedTopic !== null || searchQuery.trim().length > 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | 'ellipsis')[] = [1];
    if (currentPage > 3) pages.push('ellipsis');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  };

  return (
    <section className='space-y-8'>
      {/* Header */}
      <BlurFade delay={BLUR_FADE_DELAY}>
        <div className='space-y-4'>
          <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.18em] text-muted-foreground shadow-sm backdrop-blur-md'>
            <span className='h-1.5 w-1.5 rounded-full bg-sky-500' />
            Writing
          </div>
          <h1 className='text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl'>
            Blog
          </h1>
          <p className='text-[15px] leading-7 text-muted-foreground max-w-xl'>
            Research, insights, and observations on Crypto, DeFi, AI, and market structure.
          </p>
        </div>
      </BlurFade>

      {/* Search */}
      <BlurFade delay={BLUR_FADE_DELAY * 1.2}>
        <div className='relative max-w-sm'>
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60' />
          <input
            type='text'
            placeholder='Search posts...'
            value={searchQuery}
            onChange={handleSearchChange}
            className='w-full rounded-full border border-border/70 bg-background/60 px-4 py-2 pl-9 text-[13px] text-foreground placeholder:text-muted-foreground/60 backdrop-blur-sm outline-none transition-all duration-200 focus:border-foreground/30 focus:bg-background/85'
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground'
            >
              <XIcon className='size-3.5' />
            </button>
          )}
        </div>
      </BlurFade>

      {/* Category filter */}
      <BlurFade delay={BLUR_FADE_DELAY * 1.5}>
        <div className='flex flex-wrap gap-2'>
          {CATEGORIES.map((category) => (
            <button
              key={category.key}
              onClick={() => handleCategoryChange(category.key)}
              className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium tracking-[0.02em] backdrop-blur-sm transition-all duration-200 ${
                selectedCategory === category.key
                  ? 'border-foreground/80 bg-foreground text-background shadow-[0_12px_28px_-20px_rgba(15,23,42,0.8)]'
                  : 'border-border/70 bg-background/60 text-muted-foreground hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-background/85 hover:text-foreground'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </BlurFade>

      {/* Topic quick-filter */}
      <BlurFade delay={BLUR_FADE_DELAY * 1.8}>
        <div className='flex flex-wrap gap-2 items-center'>
          <span className='text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground'>Topics:</span>
          {TOPICS.map((t) => (
            <button
              key={t.slug}
              onClick={() => handleTopicChange(t.slug)}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all duration-200 ${
                selectedTopic === t.slug
                  ? 'border-foreground/60 bg-foreground/10 text-foreground'
                  : 'border-border/60 bg-background/60 text-muted-foreground hover:border-foreground/20 hover:text-foreground'
              }`}
            >
              {t.emoji} {t.name}
            </button>
          ))}
        </div>
      </BlurFade>

      {/* Result count + clear */}
      {(filteredPosts.length !== posts.length || hasActiveFilter) && (
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <div className='flex items-center justify-between'>
            <p className='text-xs text-muted-foreground'>
              {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} found
            </p>
            {hasActiveFilter && (
              <button
                onClick={clearFilters}
                className='inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground'
              >
                <XIcon className='size-3' /> Clear filters
              </button>
            )}
          </div>
        </BlurFade>
      )}

      {/* Empty state */}
      {filteredPosts.length === 0 && (
        <div className='rounded-[1.5rem] border border-border/60 bg-background/76 p-10 text-center'>
          <p className='text-sm text-muted-foreground'>No posts found. Try adjusting your filters.</p>
          <button onClick={clearFilters} className='mt-3 text-xs text-foreground underline underline-offset-4'>
            Clear all filters
          </button>
        </div>
      )}

      {/* Post cards */}
      <div className='space-y-3'>
        {paginatedPosts.map((post, id) => (
          <BlurFade delay={BLUR_FADE_DELAY * 2 + id * 0.04} key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className='group block rounded-[1.35rem] border border-border/60 bg-background/78 px-5 py-4 shadow-[0_10px_26px_-20px_rgba(15,23,42,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_16px_32px_-20px_rgba(15,23,42,0.55)]'
            >
              <div className='flex items-start justify-between gap-4'>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-semibold text-foreground leading-snug'>
                    {post.metadata.title}
                  </p>
                  {post.metadata.summary && (
                    <p className='mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground'>
                      {post.metadata.summary}
                    </p>
                  )}
                  <div className='mt-2.5 flex flex-wrap items-center gap-2'>
                    {post.metadata.category && (
                      <span className='rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground'>
                        {CATEGORIES.find((c) => c.key === post.metadata.category)?.label ?? post.metadata.category}
                      </span>
                    )}
                    <span className='text-[10px] text-muted-foreground'>
                      {new Date(post.metadata.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <ArrowUpRightIcon className='mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
              </div>
            </Link>
          </BlurFade>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <BlurFade delay={BLUR_FADE_DELAY * 3}>
          <div className='flex items-center justify-center gap-2 mt-8 pt-4 border-t border-border/60'>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className='h-9 rounded-full border border-border/70 bg-background/60 px-4 text-xs font-medium text-foreground transition-all hover:border-foreground/20 hover:bg-background/85 disabled:cursor-not-allowed disabled:opacity-40'
            >
              Previous
            </button>
            <div className='flex items-center gap-1'>
              {getPageNumbers().map((page, index) =>
                page === 'ellipsis' ? (
                  <span key={`e-${index}`} className='px-2 text-muted-foreground text-xs'>…</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`size-9 rounded-full border text-xs font-medium transition-all ${
                      currentPage === page
                        ? 'border-foreground/80 bg-foreground text-background'
                        : 'border-border/70 bg-background/60 text-muted-foreground hover:border-foreground/20 hover:bg-background/85 hover:text-foreground'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className='h-9 rounded-full border border-border/70 bg-background/60 px-4 text-xs font-medium text-foreground transition-all hover:border-foreground/20 hover:bg-background/85 disabled:cursor-not-allowed disabled:opacity-40'
            >
              Next
            </button>
          </div>
          <p className='text-center text-xs text-muted-foreground mt-3'>
            {startIndex + 1}–{Math.min(startIndex + POSTS_PER_PAGE, filteredPosts.length)} of {filteredPosts.length} posts
          </p>
        </BlurFade>
      )}
    </section>
  );
}
