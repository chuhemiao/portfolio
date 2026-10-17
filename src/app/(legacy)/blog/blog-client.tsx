'use client';

import type { Category, PostListItem } from '@/data/blog';
import { TOPICS, localizedTopic } from '@/data/topics';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ArrowUpRightIcon, SearchIcon, XIcon } from 'lucide-react';

import { useI18n } from '@/components/locale-provider';
import { articleHref, categoryLabel, formatLocaleDate, LANGUAGE_NAMES, normalizeLocale } from '@/lib/i18n';
import { filterPostsForLocale, paginatePosts, type PostLanguageFilter } from '@/lib/post-locale-selection';

const POSTS_PER_PAGE = 12;
function parsePage(value: string | null) { const page = Number(value); return Number.isSafeInteger(page) && page > 0 ? page : 1; }

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

/* Tags and chips carry no hue: mono type plus a border, brand fill only for the active one. */
const CHIP_BASE = 'rounded-sm border px-3 py-1.5 font-mono text-[12px] transition-colors';
const CHIP_SM = 'rounded-sm border px-2.5 py-1 font-mono text-[11px] transition-colors';
const CHIP_ON = 'border-brand bg-brand text-brand-foreground';
const CHIP_OFF = 'border-border text-muted-foreground hover:border-border-strong hover:bg-surface-2 hover:text-foreground';

const VALID_CATEGORIES = new Set(CATEGORIES.map((category) => category.key));
const validTopic = (slug: string | null) => TOPICS.some((topic) => topic.slug === slug) ? slug : null;

export default function BlogClient({ posts, topicPostSlugs }: { posts: PostListItem[]; topicPostSlugs: Record<string, string[]> }) {
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
  const [selectedLanguage, setSelectedLanguage] = useState<PostLanguageFilter>(
    initialLanguage === 'all' ? 'all' : normalizeLocale(initialLanguage) ?? 'auto'
  );

  // Sync URL → state when user navigates back/forward
  useEffect(() => {
    const cat = searchParams.get('category') as Category | 'all';
    const language = searchParams.get('lang');
    setSelectedLanguage(language === 'all' ? 'all' : normalizeLocale(language) ?? 'auto');
    setSelectedCategory(cat && VALID_CATEGORIES.has(cat) ? cat : 'all');
    setSelectedTopic(validTopic(searchParams.get('topic')));
    setSearchQuery(searchParams.get('q') ?? '');
    setCurrentPage(parsePage(searchParams.get('page')));
  }, [searchParams]);

  const updateUrl = useCallback(
    (category: Category | 'all', language: PostLanguageFilter, filters: { query?: string; topic?: string | null; page?: number } = {}) => {
      const params = new URLSearchParams(searchParams.toString());
      if (category === 'all') {
        params.delete('category');
      } else {
        params.set('category', category);
      }
      if (language === 'auto') {
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
  const filteredPosts = filterPostsForLocale(posts, locale, {
    language: selectedLanguage,
    category: selectedCategory,
    topicSlugs,
    query: searchQuery,
  });
  const { posts: paginatedPosts, page: visiblePage, totalPages, startIndex } = paginatePosts(filteredPosts, currentPage, POSTS_PER_PAGE);

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
    setSelectedLanguage('auto');
    setCurrentPage(1);
    updateUrl('all', 'auto', { query: '', topic: null });
  };

  const hasActiveFilter =
    selectedCategory !== 'all' ||
    selectedLanguage !== 'auto' ||
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
      <div className='space-y-4'>
        <div className='flex items-center gap-2.5'>
          <span aria-hidden='true' className='block size-1.5 bg-positive' />
          <span className='mono-label'>{t('Writing', '文章', '記事')}</span>
        </div>
        <h1 className='text-[28px] font-semibold tracking-[-0.028em] text-foreground sm:text-[32px]'>
          {t('Blog', '博客', 'ブログ')}
        </h1>
        <p className='max-w-[680px] text-[15px] leading-[1.75] text-muted-foreground'>
          {t('Research, insights, and observations on Crypto, DeFi, AI, and market structure.', '关于加密资产、DeFi、AI 与市场结构的研究、观点和观察。', '暗号資産、DeFi、AI、市場構造に関するリサーチ、考察、観察。')}
        </p>
      </div>

      <p className='font-mono text-[11px] leading-[1.6] text-subtle'>{t('Articles use your selected site language when a translation is available. Otherwise, the original is shown and labeled.', '文章优先显示当前网站语言的译文；暂无译文时显示原文并标注。', 'サイトの言語に合わせて翻訳を表示します。未翻訳の記事は原文と表示されます。')}</p>

      {/* Search */}
      <div className='flex h-11 max-w-sm items-center gap-3 rounded border border-border-strong bg-surface px-3.5 transition-colors focus-within:border-subtle'>
        <SearchIcon aria-hidden='true' className='size-4 shrink-0 text-subtle' />
        <input
          type='text'
          placeholder={t('Search posts...', '搜索文章…', '記事を検索…')}
          aria-label={t('Search posts', '搜索文章', '記事を検索')}
          value={searchQuery}
          onChange={handleSearchChange}
          className='min-w-0 flex-grow bg-transparent text-[14px] text-foreground outline-none placeholder:text-subtle'
        />
        {searchQuery && (
          <button
            aria-label={t('Clear search', '清除搜索', '検索をクリア')}
            onClick={() => { setSearchQuery(''); setCurrentPage(1); updateUrl(selectedCategory, selectedLanguage, { query: '' }); }}
            className='-mr-2 flex size-11 shrink-0 items-center justify-center text-subtle transition-colors hover:text-foreground'
          >
            <XIcon aria-hidden='true' className='size-3.5' />
          </button>
        )}
      </div>

      {/* Category filter */}
      <div>
        <div className='mono-label mb-3'>{t('Category', '分类', 'カテゴリ')}</div>
        <div className='flex flex-wrap gap-2'>
          {CATEGORIES.map((category) => (
            <button
              key={category.key}
              onClick={() => handleCategoryChange(category.key)}
              className={`${CHIP_BASE} ${selectedCategory === category.key ? CHIP_ON : CHIP_OFF}`}
            >
              {categoryLabel(category.key, locale)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className='mono-label mb-3'>{t('Language', '语言', '言語')}</div>
        <div role='group' aria-label={t('Article language filter', '文章语言筛选', '記事の言語フィルター')} className='flex flex-wrap items-center gap-2'>
          {([
            ['auto', t('Site language', '跟随网站语言', 'サイトの言語')],
            ['all', t('All languages', '全部语言', 'すべての言語')],
            ['zh-CN', '中文'],
            ['en', 'English'],
            ['ja', '日本語'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              aria-pressed={selectedLanguage === key}
              onClick={() => {
                setSelectedLanguage(key);
                setCurrentPage(1);
                updateUrl(selectedCategory, key);
              }}
              className={`${CHIP_SM} ${selectedLanguage === key ? CHIP_ON : CHIP_OFF}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Topic quick-filter */}
      <div>
        <div className='mono-label mb-3'>{t('Topics', '主题', 'トピック')}</div>
        <div className='flex flex-wrap items-center gap-2'>
          {TOPICS.map((topic) => (
            <button
              key={topic.slug}
              onClick={() => handleTopicChange(topic.slug)}
              className={`${CHIP_SM} ${selectedTopic === topic.slug ? CHIP_ON : CHIP_OFF}`}
            >
              {localizedTopic(topic, locale).name}
            </button>
          ))}
        </div>
      </div>

      {/* Result count + clear */}
      {(filteredPosts.length !== posts.length || hasActiveFilter) && (
        <div className='flex items-center justify-between gap-4'>
          <p className='tnum font-mono text-[12px] text-muted-foreground'>
            {t(`${filteredPosts.length} posts found`, `找到 ${filteredPosts.length} 篇文章`, `${filteredPosts.length} 件の記事`)}
          </p>
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className='inline-flex items-center gap-1 font-mono text-[12px] text-subtle transition-colors hover:text-foreground'
            >
              <XIcon aria-hidden='true' className='size-3' /> {t('Clear filters', '清除筛选', '絞り込みをクリア')}
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {filteredPosts.length === 0 && (
        <div className='rounded border border-border bg-surface p-10 text-center'>
          <p className='text-sm text-muted-foreground'>{t('No posts found. Try adjusting your filters.', '没有匹配的文章，请调整筛选条件。', '該当する記事がありません。絞り込み条件を変更してください。')}</p>
          <button onClick={clearFilters} className='mt-4 h-11 rounded border border-border-strong px-4 font-mono text-[12px] text-foreground transition-colors hover:bg-surface-2'>
            {t('Clear all filters', '清除所有筛选', 'すべての絞り込みをクリア')}
          </button>
        </div>
      )}

      {/* Post list — separated by a 1px border grid, not by individual floating panels. */}
      {paginatedPosts.length > 0 && (
        <div className='grid gap-px border border-border bg-border'>
          {paginatedPosts.map((post) => (
            <Link
              key={post.slug}
              href={articleHref(post.slug, post.metadata.language ?? "en")}
              className='block bg-background px-5 py-4 transition-colors hover:bg-surface-2'
            >
              <div className='flex items-start justify-between gap-4'>
                <div className='min-w-0 flex-1'>
                  <p lang={post.metadata.language} className='truncate text-sm font-semibold leading-snug text-foreground'>
                    {post.metadata.title}
                  </p>
                  {post.metadata.summary && (
                    <p lang={post.metadata.language} className='mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground'>
                      {post.metadata.summary}
                    </p>
                  )}
                  <div className='mt-2.5 flex flex-wrap items-center gap-2'>
                    <span className='tnum font-mono text-[11px] text-subtle'>
                      {formatLocaleDate(post.metadata.publishedAt, locale)}
                    </span>
                    {post.metadata.category && (
                      <span className='rounded-sm border border-border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] text-subtle'>
                        {categoryLabel(post.metadata.category, locale)}
                      </span>
                    )}
                    <span className='rounded-sm border border-border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] text-subtle'>
                      <span lang={post.metadata.language}>{LANGUAGE_NAMES[post.metadata.language]}</span>
                      {selectedLanguage === 'auto' && post.metadata.language !== locale && <span lang={locale}> · {t('Original · translation unavailable', '原文 · 暂无此语言译文', '原文 · この言語の翻訳はありません')}</span>}
                    </span>
                  </div>
                </div>
                <ArrowUpRightIcon aria-hidden='true' className='mt-0.5 size-3.5 shrink-0 text-subtle' />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div>
          <div className='mt-8 flex items-center justify-center gap-2 border-t border-border pt-5'>
            <button
              onClick={() => handlePageChange(visiblePage - 1)}
              disabled={visiblePage === 1}
              className='h-9 rounded border border-border px-4 font-mono text-[12px] text-muted-foreground transition-colors hover:border-border-strong hover:bg-surface-2 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40'
            >
              {t('Previous', '上一页', '前へ')}
            </button>
            <div className='flex items-center gap-1'>
              {getPageNumbers().map((page, index) =>
                page === 'ellipsis' ? (
                  <span key={`e-${index}`} className='px-2 font-mono text-[12px] text-subtle'>…</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    aria-current={visiblePage === page ? 'page' : undefined}
                    className={`tnum size-9 rounded border font-mono text-[12px] transition-colors ${
                      visiblePage === page
                        ? 'border-brand bg-brand text-brand-foreground'
                        : 'border-border text-muted-foreground hover:border-border-strong hover:bg-surface-2 hover:text-foreground'
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
              className='h-9 rounded border border-border px-4 font-mono text-[12px] text-muted-foreground transition-colors hover:border-border-strong hover:bg-surface-2 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40'
            >
              {t('Next', '下一页', '次へ')}
            </button>
          </div>
          <p className='tnum mt-3 text-center font-mono text-[11.5px] tracking-[0.06em] text-subtle'>
            {t(`${startIndex + 1}–${Math.min(startIndex + POSTS_PER_PAGE, filteredPosts.length)} of ${filteredPosts.length} posts`, `第 ${startIndex + 1}–${Math.min(startIndex + POSTS_PER_PAGE, filteredPosts.length)} 篇，共 ${filteredPosts.length} 篇`, `${filteredPosts.length} 件中 ${startIndex + 1}–${Math.min(startIndex + POSTS_PER_PAGE, filteredPosts.length)} 件`)}
          </p>
        </div>
      )}
    </section>
  );
}
