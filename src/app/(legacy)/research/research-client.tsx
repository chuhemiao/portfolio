'use client';

import Link from 'next/link';
import { useI18n } from '@/components/locale-provider';
import { useEffect, useMemo, useState } from 'react';
import { PROJECTS, type ResearchProject } from '@/data/research-projects';
import { getResearchDescription, getResearchCategoryLabel } from '@/data/research-localization';
import { inferLocale } from '@/lib/i18n';
import { SearchIcon, XIcon } from 'lucide-react';

const ALL_TYPES = [...new Set(PROJECTS.map(project => project.type))];

const TYPE_GROUPS: Record<string, string[]> = {
  Exchanges: ['CEX', 'Perp DEX', 'DEX'],
  Lending: ['Lending', 'Yield', 'BTCFi/Yield'],
  Chains: ['L1', 'L2', 'L2 Infra', 'Interoperability'],
  Privacy: ['ZK', 'FHE', 'Privacy'],
  Consumer: ['GameFi', 'Consumer/Sports', 'SocialFi', 'Meme/AI'],
  Markets: ['Prediction', 'Stablecoin', 'PayFi', 'RWA'],
  Infra: ['Data/Infra', 'Restaking/Cloud', 'AI/DePIN', 'Identity/PoH', 'Wallet', 'Infra'],
  Other: ['DeFi']
};
const groupedTypes = new Set(Object.entries(TYPE_GROUPS).filter(([label]) => label !== 'Other').flatMap(([, types]) => types));
TYPE_GROUPS.Other = ALL_TYPES.filter(type => !groupedTypes.has(type));

type CategoryFilter =
  | { kind: 'all' }
  | { kind: 'group'; label: string; types: string[] }
  | { kind: 'type'; type: string };

/* Tags and chips carry no hue: mono type plus a border, brand fill only for the active one. */
const CHIP_BASE = 'rounded-sm border px-3 py-1.5 font-mono text-[12px] transition-colors';
const CHIP_ON = 'border-brand bg-brand text-brand-foreground';
const CHIP_OFF = 'border-border text-muted-foreground hover:border-border-strong hover:bg-surface-2 hover:text-foreground';

function ProjectLogo({ project }: { project: ResearchProject }) {
  const [error, setError] = useState(false);

  return (
    <div className='flex h-28 w-full shrink-0 items-center justify-center rounded-sm border border-border bg-surface-2 p-3'>
      {!project.logoUrl || error ? (
        <span className='font-mono text-xl tracking-tight text-muted-foreground'>{project.initial}</span>
      ) : (
        <img
          src={project.logoUrl}
          alt={project.name}
          loading='lazy'
          decoding='async'
          onError={() => setError(true)}
          className='max-h-full max-w-full object-contain'
        />
      )}
    </div>
  );
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const PAGE_SIZE = 60;

export default function ResearchClient({ postLinks }: { postLinks: Record<string, string> }) {
  const { locale, t } = useI18n();
  const labelFor = (label: string) => getResearchCategoryLabel(label, locale);
  const descriptions = useMemo(() => Object.fromEntries(PROJECTS.map(project => [project.slug, getResearchDescription(project, locale)])), [locale]);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>({ kind: 'all' });
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const countsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of PROJECTS) counts[p.type] = (counts[p.type] ?? 0) + 1;
    return counts;
  }, []);

  const filtered = useMemo(() => {
    return PROJECTS.filter((p) => {
      const matchType =
        categoryFilter.kind === 'all' ||
        (categoryFilter.kind === 'group'
          ? categoryFilter.types.includes(p.type)
          : p.type === categoryFilter.type);
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.initial.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        descriptions[p.slug].text.toLowerCase().includes(q) ||
        getResearchCategoryLabel(p.type, locale).toLowerCase().includes(q);
      return matchType && matchQuery;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [categoryFilter, query, descriptions, locale]);

  const visible = filtered.slice(0, visibleCount);

  const handleCategoryChange = (filter: CategoryFilter) => {
    setCategoryFilter(filter);
    setVisibleCount(PAGE_SIZE);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setVisibleCount(PAGE_SIZE);
  };

  const letterMap = useMemo(
    () =>
      ALPHABET.reduce<Record<string, string>>((acc, letter) => {
        const match = filtered.find((p) => p.name.toUpperCase().startsWith(letter));
        if (match) acc[letter] = match.slug;
        return acc;
      }, {}),
    [filtered]
  );

  const [pendingScrollSlug, setPendingScrollSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingScrollSlug) return;
    const el = document.getElementById(`project-${pendingScrollSlug}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setPendingScrollSlug(null);
  }, [pendingScrollSlug, visibleCount]);

  const scrollToLetter = (letter: string) => {
    const slug = letterMap[letter];
    if (!slug) return;
    const index = filtered.findIndex((p) => p.slug === slug);
    if (index >= visibleCount) {
      setVisibleCount(index + 1);
    }
    setPendingScrollSlug(slug);
  };

  return (
    <div className='relative min-h-[100dvh] overflow-x-clip'>
      {/* A-Z floating index — left side, hidden by default, visible on hover */}
      <div className='group fixed left-0 top-1/2 z-50 hidden -translate-y-1/2 lg:flex'>
        {/* trigger strip */}
        <div className='flex h-full w-3 cursor-pointer items-center justify-center' />
        {/* index panel */}
        <div className='pointer-events-none ml-1 flex translate-x-[-110%] flex-col items-center gap-[2px] rounded border border-border bg-surface px-2 py-3 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 opacity-0'>
          {ALPHABET.map((letter) => {
            const active = !!letterMap[letter];
            return (
              <button
                key={letter}
                disabled={!active}
                onClick={() => scrollToLetter(letter)}
                className={`flex h-5 w-5 items-center justify-center rounded-sm font-mono text-[10px] transition-colors ${
                  active
                    ? 'cursor-pointer text-muted-foreground hover:bg-surface-2 hover:text-foreground'
                    : 'cursor-default text-subtle'
                }`}>
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      <section className='relative mx-auto flex min-h-[100dvh] w-full max-w-[1240px] flex-col gap-8 px-4 pb-dock-safe pt-6 sm:px-8 sm:pb-dock-safe-lg sm:pt-10'>
        <header className='space-y-4'>
          <div className='flex items-center gap-2.5'>
            <span aria-hidden='true' className='block size-1.5 bg-positive' />
            <span className='mono-label'>{t('Research index', '研究索引', 'リサーチインデックス')}</span>
          </div>
          <h1 className='text-[28px] font-semibold tracking-[-0.028em] text-foreground sm:text-[32px]'>
            {t('Research Map', '研究地图', 'リサーチマップ')}
          </h1>
          <p className='max-w-[680px] text-[15px] leading-[1.75] text-muted-foreground'>
            {t(`${PROJECTS.length} crypto projects, arranged as a living archive of deep-dive theses across exchanges, DeFi, infra, AI, and market structure.`, `${PROJECTS.length} 个加密项目，覆盖交易所、DeFi、基础设施、AI 与市场结构的持续研究归档。`, `${PROJECTS.length} の暗号資産プロジェクト。取引所、DeFi、インフラ、AI、市場構造のリサーチアーカイブ。`)}
          </p>
        </header>

        <p className='font-mono text-[11px] leading-[1.6] text-subtle'>{t('Project summaries are localized. Links open a full translation when available; otherwise they are marked as originals.', '项目摘要已适配当前语言。链接优先打开完整译文，暂无译文时会标注原文。', 'プロジェクト概要は表示言語に対応しています。本文の翻訳があれば開き、ない場合は原文と表示します。')}</p>

        <div className='flex h-11 max-w-sm items-center gap-3 rounded border border-border-strong bg-surface px-3.5 transition-colors focus-within:border-subtle'>
          <SearchIcon aria-hidden='true' className='size-4 shrink-0 text-subtle' />
          <input
            type='text'
            aria-label={t('Search projects', '搜索项目', 'プロジェクトを検索')}
            placeholder={t('Search by symbol or name...', '搜索代币符号或项目名称…', 'シンボルまたは名前で検索…')}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className='min-w-0 flex-grow bg-transparent text-[14px] text-foreground outline-none placeholder:text-subtle'
          />
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              aria-label={t('Clear search', '清空搜索', '検索をクリア')}
              className='-mr-2 flex size-11 shrink-0 items-center justify-center text-subtle transition-colors hover:text-foreground'>
              <XIcon aria-hidden='true' className='size-3.5' />
            </button>
          )}
        </div>

        <div className='flex flex-wrap gap-2'>
          <button
            onClick={() => handleCategoryChange({ kind: 'all' })}
            className={`${CHIP_BASE} ${categoryFilter.kind === 'all' ? CHIP_ON : CHIP_OFF}`}>
            {t('All', '全部', 'すべて')}
            <span className='tnum ml-1.5 opacity-70'>{PROJECTS.length}</span>
          </button>

          {Object.entries(TYPE_GROUPS).map(([label, types]) => {
            const count = types.reduce((sum, t) => sum + (countsByType[t] ?? 0), 0);
            if (count === 0) return null;
            const isActive = categoryFilter.kind === 'group' && categoryFilter.label === label;
            return (
              <button
                key={labelFor(label)}
                onClick={() => handleCategoryChange({ kind: 'group', label, types })}
                className={`${CHIP_BASE} ${isActive ? CHIP_ON : CHIP_OFF}`}>
                {labelFor(label)}
                <span className='tnum ml-1.5 opacity-70'>{count}</span>
              </button>
            );
          })}

          <button
            onClick={() => setShowAllCategories((v) => !v)}
            aria-expanded={showAllCategories}
            className={`${CHIP_BASE} ${CHIP_OFF}`}>
            {showAllCategories ? t('Hide categories', '收起分类', 'カテゴリーを閉じる') : t('All categories', '全部分类', 'すべてのカテゴリー')}
          </button>
        </div>

        {showAllCategories && (
          <div className='flex flex-wrap gap-2'>
            {ALL_TYPES.filter((t) => t !== 'All' && (countsByType[t] ?? 0) > 0).map((type) => {
              const isActive = categoryFilter.kind === 'type' && categoryFilter.type === type;
              return (
                <button
                  key={labelFor(type)}
                  onClick={() => handleCategoryChange({ kind: 'type', type })}
                  className={`${CHIP_BASE} ${isActive ? CHIP_ON : CHIP_OFF}`}>
                  {labelFor(type)}
                  <span className='tnum ml-1.5 opacity-70'>{countsByType[type] ?? 0}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Cards are separated by a 1px border grid, not by individual floating panels. */}
        <div className='grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {visible.map((project) => {
            const description = descriptions[project.slug];
            const articleHref = postLinks[project.slug] ?? `/blog/${project.slug}`;
            const originalArticle = !articleHref.startsWith(`/${locale}/`);
            return (
            <Link
              key={project.slug}
              id={`project-${project.slug}`}
              href={articleHref}
              className='flex flex-col gap-3 bg-background p-4 transition-colors hover:bg-surface-2'>
              <ProjectLogo project={project} />
              <div className='flex flex-grow flex-col gap-2'>
                <div className='flex items-start justify-between gap-2'>
                  <span className='pr-1 text-[15px] font-semibold leading-5 tracking-[-0.025em] text-foreground'>
                    {project.name}
                  </span>
                  <span className='shrink-0 rounded-sm border border-border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] text-subtle'>
                    {labelFor(project.type)}
                  </span>
                </div>
                <p lang={description.available ? locale : inferLocale(project.description)} className='line-clamp-2 min-h-12 flex-grow text-[13px] leading-6 text-muted-foreground'>
                  {description.text}
                </p>
                {(!description.available || originalArticle) && (
                  <p className='font-mono text-[10.5px] tracking-[0.04em] text-subtle'>
                    {!description.available && t('Summary: original language', '摘要：原文语言', '概要：原文の言語')}
                    {!description.available && originalArticle && ' · '}
                    {originalArticle && t('Read original article', '阅读原文', '原文を読む')}
                  </p>
                )}
              </div>
            </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className='text-sm text-muted-foreground'>
            {t('No matching projects.', '没有匹配的项目。', '一致するプロジェクトはありません。')}
          </p>
        )}

        {visibleCount < filtered.length && (
          <div className='flex justify-center'>
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className='h-11 rounded border border-border px-5 font-mono text-[12px] text-muted-foreground transition-colors hover:border-border-strong hover:bg-surface-2 hover:text-foreground'>
              {t(`Load more (${filtered.length - visibleCount} remaining)`, `加载更多（剩余 ${filtered.length - visibleCount} 个）`, `さらに表示（残り ${filtered.length - visibleCount} 件）`)}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
