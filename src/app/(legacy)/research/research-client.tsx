'use client';

import Link from 'next/link';
import { useI18n } from '@/components/locale-provider';
import { useEffect, useMemo, useState } from 'react';
import { PROJECTS, type ResearchProject } from '@/data/research-projects';
import { getResearchDescription, getResearchCategoryLabel } from '@/data/research-localization';
import { inferLocale } from '@/lib/i18n';

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

function fallbackColor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  const hue = (hash * 137.508) % 360; // golden-angle rotation → near-uniform hue spread
  return `hsl(${hue.toFixed(1)} 62% 46%)`;
}

function ProjectLogo({ project }: { project: ResearchProject }) {
  const [error, setError] = useState(false);

  if (!project.logoUrl || error) {
    return (
      <div
        className='relative flex w-full aspect-square items-center justify-center rounded text-base font-semibold text-white ring-1 ring-black/10'
        style={{ backgroundColor: fallbackColor(project.slug) }}>
        <div className='absolute inset-0 rounded bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.02))]' />
        <span className='relative tracking-tight'>{project.initial}</span>
      </div>
    );
  }

  return (
    <div className='relative w-full aspect-square overflow-hidden rounded p-[1px] transition-transform duration-300 group-hover:scale-[1.015]'>
      <div
        className='absolute inset-0 opacity-70'
        style={{
          background: `linear-gradient(160deg, ${project.color}24, rgba(255,255,255,0.88) 42%, rgba(255,255,255,0.96) 100%)`,
        }}
      />
      <div className='relative flex h-full w-full items-center justify-center rounded bg-white/95 p-3 ring-1 ring-black/5 dark:shadow-black/20'>
        <img
          src={project.logoUrl}
          alt={project.name}
          loading='lazy'
          decoding='async'
          onError={() => setError(true)}
          className='h-full w-full object-contain'
        />
      </div>
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
      <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f8fafc_0%,#eff6ff_34%,#f8fafc_100%)] dark:bg-[linear-gradient(180deg,#030712_0%,#06111f_38%,#020617_100%)]' />

      {/* A-Z floating index — left side, hidden by default, visible on hover */}
      <div className='group fixed left-0 top-1/2 z-50 hidden -translate-y-1/2 lg:flex'>
        {/* trigger strip */}
        <div className='flex h-full w-3 cursor-pointer items-center justify-center' />
        {/* index panel */}
        <div className='pointer-events-none ml-1 flex translate-x-[-110%] flex-col items-center gap-[2px] rounded-xl border border-border bg-surface px-2 py-3 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 opacity-0'>
          {ALPHABET.map((letter) => {
            const active = !!letterMap[letter];
            return (
              <button
                key={letter}
                disabled={!active}
                onClick={() => scrollToLetter(letter)}
                className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold tracking-wide transition-colors duration-150 ${
                  active
                    ? 'text-foreground hover:bg-foreground/10 cursor-pointer'
                    : 'text-subtle cursor-default'
                }`}>
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      <section className='relative mx-auto flex min-h-[100dvh] w-full max-w-[1150px] flex-col gap-8 px-4 pb-dock-safe pt-6 sm:px-6 sm:pb-dock-safe-lg sm:pt-10 lg:px-8'>
        <header className='space-y-5 sm:space-y-6'>
          <div className='inline-flex items-center gap-2 rounded-sm border border-border bg-surface px-3.5 py-1.5 text-[11px] font-medium tracking-[0.18em] text-muted-foreground'>
            <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
            {t('Research index', '研究索引', 'リサーチインデックス')}
          </div>
          <div className='space-y-3'>
            <h1 className='max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl lg:text-[5.25rem] lg:leading-[0.95]'>
              {t('Research Map', '研究地图', 'リサーチマップ')}
            </h1>
            <p className='max-w-4xl text-[15px] leading-8 text-muted-foreground sm:text-[17px]'>
              {t(`${PROJECTS.length} crypto projects, arranged as a living archive of deep-dive theses across exchanges, DeFi, infra, AI, and market structure.`, `${PROJECTS.length} 个加密项目，覆盖交易所、DeFi、基础设施、AI 与市场结构的持续研究归档。`, `${PROJECTS.length} の暗号資産プロジェクト。取引所、DeFi、インフラ、AI、市場構造のリサーチアーカイブ。`)}
            </p>
          </div>
        </header>

        <p className='text-xs text-muted-foreground'>{t('Project summaries are localized. Links open a full translation when available; otherwise they are marked as originals.', '项目摘要已适配当前语言。链接优先打开完整译文，暂无译文时会标注原文。', 'プロジェクト概要は表示言語に対応しています。本文の翻訳があれば開き、ない場合は原文と表示します。')}</p>

        <div className='relative max-w-xs'>
          <input
            type='text'
            aria-label={t('Search projects', '搜索项目', 'プロジェクトを検索')}
            placeholder={t('Search by symbol or name...', '搜索代币符号或项目名称…', 'シンボルまたは名前で検索…')}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className='w-full rounded-sm border border-border bg-surface px-4 py-2 text-[13px] text-foreground placeholder:text-subtle outline-none transition-all duration-200 focus:border-border-strong focus:bg-surface'
          />
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              aria-label={t('Clear search', '清空搜索', '検索をクリア')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-foreground'>
              ✕
            </button>
          )}
        </div>

        <div className='flex flex-wrap gap-2.5'>
          <button
            onClick={() => handleCategoryChange({ kind: 'all' })}
            className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium tracking-[0.02em] transition-all duration-200 ${
              categoryFilter.kind === 'all'
                ? 'border-border-strong bg-foreground text-background'
                : 'border-border bg-surface text-muted-foreground hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2 hover:text-foreground'
            }`}>
            {t('All', '全部', 'すべて')}
            <span className={`ml-1.5 text-[10px] ${categoryFilter.kind === 'all' ? 'opacity-70' : 'opacity-50'}`}>
              {PROJECTS.length}
            </span>
          </button>

          {Object.entries(TYPE_GROUPS).map(([label, types]) => {
            const count = types.reduce((sum, t) => sum + (countsByType[t] ?? 0), 0);
            if (count === 0) return null;
            const isActive = categoryFilter.kind === 'group' && categoryFilter.label === label;
            return (
              <button
                key={labelFor(label)}
                onClick={() => handleCategoryChange({ kind: 'group', label, types })}
                className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium tracking-[0.02em] transition-all duration-200 ${
                  isActive
                    ? 'border-border-strong bg-foreground text-background'
                    : 'border-border bg-surface text-muted-foreground hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2 hover:text-foreground'
                }`}>
                {labelFor(label)}
                <span className={`ml-1.5 text-[10px] ${isActive ? 'opacity-70' : 'opacity-50'}`}>{count}</span>
              </button>
            );
          })}

          <button
            onClick={() => setShowAllCategories((v) => !v)}
            className='rounded-sm border border-dashed border-border bg-surface px-3.5 py-1.5 text-[11px] font-medium tracking-[0.02em] text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2 hover:text-foreground'>
            {showAllCategories ? t('Hide categories', '收起分类', 'カテゴリーを閉じる') : t('All categories', '全部分类', 'すべてのカテゴリー')}
          </button>
        </div>

        {showAllCategories && (
          <div className='flex flex-wrap gap-2.5'>
            {ALL_TYPES.filter((t) => t !== 'All' && (countsByType[t] ?? 0) > 0).map((type) => {
              const isActive = categoryFilter.kind === 'type' && categoryFilter.type === type;
              return (
                <button
                  key={labelFor(type)}
                  onClick={() => handleCategoryChange({ kind: 'type', type })}
                  className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium tracking-[0.02em] transition-all duration-200 ${
                    isActive
                      ? 'border-border-strong bg-foreground text-background'
                      : 'border-border bg-surface text-muted-foreground hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2 hover:text-foreground'
                  }`}>
                  {labelFor(type)}
                  <span className={`ml-1.5 text-[10px] ${isActive ? 'opacity-70' : 'opacity-50'}`}>
                    {countsByType[type] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4'>
          {visible.map((project) => {
            const description = descriptions[project.slug];
            const articleHref = postLinks[project.slug] ?? `/blog/${project.slug}`;
            const originalArticle = !articleHref.startsWith(`/${locale}/`);
            return (
            <Link
              key={project.slug}
              id={`project-${project.slug}`}
              href={articleHref}
              className='group relative flex min-h-[16.5rem] flex-col gap-3 overflow-hidden rounded border border-border bg-surface p-4-[2px] transition-all duration-300 hover:-translate-y-1 hover:border-border-strong hover:bg-surface-2 hover:'>
              <div
                className='absolute inset-x-4 top-0 h-px opacity-70 transition-opacity duration-300 group-hover:opacity-100'
                style={{
                  background: `linear-gradient(90deg, transparent, ${project.color}, transparent)`,
                }}
              />
              <ProjectLogo project={project} />
              <div className='space-y-2'>
                <div className='flex items-start justify-between gap-2'>
                  <span className='pr-1 text-[15px] font-semibold leading-5 tracking-[-0.025em] text-foreground'>
                    {project.name}
                  </span>
                  <span className='shrink-0 rounded-sm border border-border bg-surface px-2 py-1 text-[10px] font-medium tracking-[0.08em] text-muted-foreground'>
                    {labelFor(project.type)}
                  </span>
                </div>
                <p lang={description.available ? locale : inferLocale(project.description)} className='line-clamp-3 text-[13px] leading-6 text-muted-foreground'>
                  {description.text}
                </p>
                {!description.available && <p className='text-xs text-muted-foreground'>{t('Summary: original language', '摘要：原文语言', '概要：原文の言語')}</p>}
                {originalArticle && <p className='text-xs text-muted-foreground'>{t('Read original article', '阅读原文', '原文を読む')}</p>}
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
              className='rounded-sm border border-border bg-surface px-5 py-2 text-[12px] font-medium text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2 hover:text-foreground'>
              {t(`Load more (${filtered.length - visibleCount} remaining)`, `加载更多（剩余 ${filtered.length - visibleCount} 个）`, `さらに表示（残り ${filtered.length - visibleCount} 件）`)}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
