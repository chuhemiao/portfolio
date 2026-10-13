'use client';

import BlurFade from '@/components/magicui/blur-fade';
import type { Category } from '@/data/blog';
import { TOPICS, localizedTopic } from '@/data/topics';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ArrowUpRightIcon, LanguagesIcon, SearchIcon, XIcon } from 'lucide-react';

import { useI18n } from '@/components/locale-provider';
import { articleHref, categoryLabel, formatLocaleDate, LANGUAGE_NAMES, normalizeLocale, type Locale } from '@/lib/i18n';

const BLUR_FADE_DELAY = 0.04;
const POSTS_PER_PAGE = 12;
function parsePage(value: string | null) { const page = Number(value); return Number.isSafeInteger(page) && page > 0 ? page : 1; }

type Post = {
  metadata: {
    title: string;
    publishedAt: string;
    summary: string;
    image?: string;
    category?: Category;
    language?: Locale;
    translations?: Partial<Record<Locale, string>>;
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
  { key: 'ai', label: 'AI' },
  { key: 'research', label: 'Research' },
  { key: 'investing', label: 'Investing' },
  { key: 'economics', label: 'Economics' },
  { key: 'philosophy', label: 'Philosophy' },
  { key: 'story', label: 'Story' },
];

const VALID_CATEGORIES = new Set(CATEGORIES.map((category) => category.key));
const validTopic = (slug: string | null) => TOPICS.some((topic) => topic.slug === slug) ? slug : null;

export default function BlogClient({ posts, topicPostSlugs }: { posts: Post[]; topicPostSlugs: Record<string, string[]> }) {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialCategory = (searchParams.get('category') as Category | 'all') ?? 'all';
  const initialLanguage = searchParams.get('lang');
  const safeInitialCategory = VALID_CATEGORIES.has(initialCategory) ? initialCategory : 'all';

  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>(safeInitialCategory);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(validTopic(searchParams.get('topic')));
  const [currentPage, setCurrentPage] = useState(parsePage(searchParams.get('page')));
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | Locale>(
    normalizeLocale(initialLanguage) ?? 'all'
  );

  // Sync URL → state when user navigates back/forward
  useEffect(() => {
    const cat = searchParams.get('category') as Category | 'all';
    setSelectedLanguage(normalizeLocale(searchParams.get('lang')) ?? 'all');
    setSelectedCategory(cat && VALID_CATEGORIES.has(cat) ? cat : 'all');
    setSelectedTopic(validTopic(searchParams.get('topic')));
    setSearchQuery(searchParams.get('q') ?? '');
    setCurrentPage(parsePage(searchParams.get('page')));
  }, [searchParams]);

  const updateUrl = useCallback(
    (category: Category | 'all', language: 'all' | Locale, filters: { query?: string; topic?: string | null; page?: number } = {}) => {
      const params = new URLSearchParams(searchParams.toString());
      if (category === 'all') {
        params.delete('category');
      } else {
        params.set('category', category);
      }
      if (language === 'all') {
        params.delete('lang');
      } else {
        params.set('lang', language);
      }
      const nextSearch = filters.query ?? searchQuery;
      const nextTopic = filters.topic === undefined ? selectedTopic : filters.topic;
      const nextPage = filters.page ?? 1;
      if (nextSearch) params.set('q', nextSearch); else params.delete('q');
      if (nextTopic) params.set('topic', nextTopic); else params.delete('topic');
      if (nextPage > 1) params.set('page', String(nextPage)); else params.delete('page');
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname, searchQuery, selectedTopic]
  );

  const topicSlugs = selectedTopic ? new Set(topicPostSlugs[selectedTopic] ?? []) : null;
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'all' || post.metadata.category === selectedCategory;
    const matchesLanguage =
      selectedLanguage === 'all' || post.metadata.language === selectedLanguage;

    const matchesTopic = topicSlugs ? topicSlugs.has(post.slug) : true;

    const matchesSearch = searchQuery.trim()
      ? (() => {
          const q = searchQuery.toLowerCase();
          return (
            post.metadata.title.toLowerCase().includes(q) ||
            post.metadata.summary.toLowerCase().includes(q)
          );
        })()
      : true;

    return matchesCategory && matchesLanguage && matchesTopic && matchesSearch;
  });

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const visiblePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (visiblePage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handleCategoryChange = (category: Category | 'all') => {
    setSelectedCategory(category);
    setSelectedTopic(null);
    setCurrentPage(1);
    updateUrl(category, selectedLanguage, { topic: null });
  };

  const handleTopicChange = (slug: string) => {
    const topic = selectedTopic === slug ? null : slug;
    setSelectedTopic(topic);
    setCurrentPage(1);
    updateUrl(selectedCategory, selectedLanguage, { topic });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    updateUrl(selectedCategory, selectedLanguage, { query: e.target.value });
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedTopic(null);
    setSearchQuery('');
    setSelectedLanguage('all');
    setCurrentPage(1);
    updateUrl('all', 'all', { query: '', topic: null });
  };

  const hasActiveFilter =
    selectedCategory !== 'all' ||
    selectedLanguage !== 'all' ||
    selectedTopic !== null ||
    searchQuery.trim().length > 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl(selectedCategory, selectedLanguage, { page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | 'ellipsis')[] = [1];
    if (visiblePage > 3) pages.push('ellipsis');
    const start = Math.max(2, visiblePage - 1);
    const end = Math.min(totalPages - 1, visiblePage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (visiblePage < totalPages - 2) pages.push('ellipsis');
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
            {t('Writing', '文章', '記事')}
          </div>
          <h1 className='text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl'>
            {t('Blog', '博客', 'ブログ')}
          </h1>
          <p className='text-[15px] leading-7 text-muted-foreground max-w-xl'>
            {t('Research, insights, and observations on Crypto, DeFi, AI, and market structure.', '关于加密资产、DeFi、AI 与市场结构的研究、观点和观察。', '暗号資産、DeFi、AI、市場構造に関するリサーチ、考察、観察。')}
          </p>
        </div>
      </BlurFade>

      <p className='text-xs text-muted-foreground'>{t('Article titles and summaries retain their original language. Use the language filter to find available translations.', '文章标题和摘要保留原文语言，可通过语言筛选查找已有译文。', '記事のタイトルと要約は原文の言語です。言語フィルターで利用可能な翻訳を探せます。')}</p>

      {/* Search */}
      <BlurFade delay={BLUR_FADE_DELAY * 1.2}>
        <div className='relative max-w-sm'>
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60' />
          <input
            type='text'
            placeholder={t('Search posts...', '搜索文章…', '記事を検索…')}
            aria-label={t('Search posts', '搜索文章', '記事を検索')}
            value={searchQuery}
            onChange={handleSearchChange}
            className='w-full rounded-full border border-border/70 bg-background/60 px-4 py-2 pl-9 text-[13px] text-foreground placeholder:text-muted-foreground/60 backdrop-blur-sm outline-none transition-all duration-200 focus:border-foreground/30 focus:bg-background/85'
          />
          {searchQuery && (
            <button
              aria-label={t('Clear search', '清除搜索', '検索をクリア')}
              onClick={() => { setSearchQuery(''); setCurrentPage(1); updateUrl(selectedCategory, selectedLanguage, { query: '' }); }}
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
              {categoryLabel(category.key, locale)}
            </button>
          ))}
        </div>
      </BlurFade>

      <BlurFade delay={BLUR_FADE_DELAY * 1.65}>
        <div className='flex items-center gap-2'>
          <LanguagesIcon className='size-3.5 text-muted-foreground' />
          {([
            ['all', t('All languages', '全部语言', 'すべての言語')],
            ['zh-CN', '中文'],
            ['en', 'English'],
            ['ja', '日本語'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedLanguage(key);
                setCurrentPage(1);
                updateUrl(selectedCategory, key);
              }}
              className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                selectedLanguage === key
                  ? 'border-foreground/70 bg-foreground text-background'
                  : 'border-border/60 bg-background/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </BlurFade>

      {/* Topic quick-filter */}
      <BlurFade delay={BLUR_FADE_DELAY * 1.8}>
        <div className='flex flex-wrap gap-2 items-center'>
          <span className='text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground'>{t('Topics:', '主题：', 'トピック：')}</span>
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
              {t.emoji} {localizedTopic(t, locale).name}
            </button>
          ))}
        </div>
      </BlurFade>

      {/* Result count + clear */}
      {(filteredPosts.length !== posts.length || hasActiveFilter) && (
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <div className='flex items-center justify-between'>
            <p className='text-xs text-muted-foreground'>
              {t(`${filteredPosts.length} posts found`, `找到 ${filteredPosts.length} 篇文章`, `${filteredPosts.length} 件の記事`)}
            </p>
            {hasActiveFilter && (
              <button
                onClick={clearFilters}
                className='inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground'
              >
                <XIcon className='size-3' /> {t('Clear filters', '清除筛选', '絞り込みをクリア')}
              </button>
            )}
          </div>
        </BlurFade>
      )}

      {/* Empty state */}
      {filteredPosts.length === 0 && (
        <div className='rounded-[1.5rem] border border-border/60 bg-background/76 p-10 text-center'>
          <p className='text-sm text-muted-foreground'>{t('No posts found. Try adjusting your filters.', '没有匹配的文章，请调整筛选条件。', '該当する記事がありません。絞り込み条件を変更してください。')}</p>
          <button onClick={clearFilters} className='mt-3 text-xs text-foreground underline underline-offset-4'>
            {t('Clear all filters', '清除所有筛选', 'すべての絞り込みをクリア')}
          </button>
        </div>
      )}

      {/* Post cards */}
      <div className='space-y-3'>
        {paginatedPosts.map((post, id) => (
          <BlurFade delay={BLUR_FADE_DELAY * 2 + id * 0.04} key={post.slug}>
            <Link
              href={articleHref(post.slug, post.metadata.language ?? "en")}
              className='group block rounded-[1.35rem] border border-border/60 bg-background/78 px-5 py-4 shadow-[0_10px_26px_-20px_rgba(15,23,42,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_16px_32px_-20px_rgba(15,23,42,0.55)]'
            >
              <div className='flex items-start justify-between gap-4'>
                <div className='min-w-0 flex-1'>
                  <p lang={post.metadata.language} className='truncate text-sm font-semibold text-foreground leading-snug'>
                    {post.metadata.title}
                  </p>
                  {post.metadata.summary && (
                    <p lang={post.metadata.language} className='mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground'>
                      {post.metadata.summary}
                    </p>
                  )}
                  <div className='mt-2.5 flex flex-wrap items-center gap-2'>
                    {post.metadata.category && (
                      <span className='rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground'>
                        {categoryLabel(post.metadata.category, locale)}
                      </span>
                    )}
                    <span lang={post.metadata.language} className='rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground'>
                      {LANGUAGE_NAMES[post.metadata.language ?? 'en']}
                    </span>
                    <span className='text-[10px] text-muted-foreground'>
                      {formatLocaleDate(post.metadata.publishedAt, locale)}
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
              onClick={() => handlePageChange(visiblePage - 1)}
              disabled={visiblePage === 1}
              className='h-9 rounded-full border border-border/70 bg-background/60 px-4 text-xs font-medium text-foreground transition-all hover:border-foreground/20 hover:bg-background/85 disabled:cursor-not-allowed disabled:opacity-40'
            >
              {t('Previous', '上一页', '前へ')}
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
                      visiblePage === page
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
              onClick={() => handlePageChange(visiblePage + 1)}
              disabled={visiblePage === totalPages}
              className='h-9 rounded-full border border-border/70 bg-background/60 px-4 text-xs font-medium text-foreground transition-all hover:border-foreground/20 hover:bg-background/85 disabled:cursor-not-allowed disabled:opacity-40'
            >
              {t('Next', '下一页', '次へ')}
            </button>
          </div>
          <p className='text-center text-xs text-muted-foreground mt-3'>
            {t(`${startIndex + 1}–${Math.min(startIndex + POSTS_PER_PAGE, filteredPosts.length)} of ${filteredPosts.length} posts`, `第 ${startIndex + 1}–${Math.min(startIndex + POSTS_PER_PAGE, filteredPosts.length)} 篇，共 ${filteredPosts.length} 篇`, `${filteredPosts.length} 件中 ${startIndex + 1}–${Math.min(startIndex + POSTS_PER_PAGE, filteredPosts.length)} 件`)}
          </p>
        </BlurFade>
      )}
    </section>
  );
}
