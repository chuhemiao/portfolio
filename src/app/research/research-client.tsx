'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { PROJECTS, type ResearchProject } from '@/data/research-projects';

const ALL_TYPES = [
  'All',
  'CEX',
  'Perp DEX',
  'DEX',
  'GameFi',
  'Lending',
  'Yield',
  'DeFi',
  'L1',
  'L2',
  'L2 Infra',
  'ZK',
  'FHE',
  'Privacy',
  'Prediction',
  'Stablecoin',
  'PayFi',
  'BTCFi/Yield',
  'Consumer/Sports',
  'Interoperability',
  'Identity/PoH',
  'Data/Infra',
  'Restaking/Cloud',
  'AI/DePIN',
  'Meme/AI',
  'SocialFi',
  'RWA',
  'Wallet',
  'Infra'
];

function ProjectLogo({ project }: { project: ResearchProject }) {
  const [error, setError] = useState(false);

  if (!project.logoUrl || error) {
    return (
      <div
        className='relative flex w-full aspect-square items-center justify-center rounded-[1.15rem] text-base font-semibold text-white ring-1 ring-black/10 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.55)]'
        style={{ backgroundColor: project.color }}>
        <div className='absolute inset-0 rounded-[1.15rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.02))]' />
        <span className='relative tracking-tight'>{project.initial}</span>
      </div>
    );
  }

  return (
    <div className='relative w-full aspect-square overflow-hidden rounded-[1.15rem] p-[1px] shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)] transition-transform duration-300 group-hover:scale-[1.015]'>
      <div
        className='absolute inset-0 opacity-70'
        style={{
          background: `linear-gradient(160deg, ${project.color}24, rgba(255,255,255,0.88) 42%, rgba(255,255,255,0.96) 100%)`,
        }}
      />
      <div className='relative flex h-full w-full items-center justify-center rounded-[1.1rem] bg-white/95 p-3 ring-1 ring-black/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-black/20'>
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

export default function ResearchClient() {
  const [activeType, setActiveType] = useState('All');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    return PROJECTS.filter((p) => {
      const matchType = activeType === 'All' || p.type === activeType;
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.initial.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchType && matchQuery;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [activeType, query]);

  const visible = filtered.slice(0, visibleCount);

  const handleTypeChange = (type: string) => {
    setActiveType(type);
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
      <div className='pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_12%_14%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.14),transparent_24%),radial-gradient(circle_at_50%_22%,rgba(99,102,241,0.1),transparent_32%)] dark:bg-[radial-gradient(circle_at_12%_14%,rgba(56,189,248,0.2),transparent_28%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.16),transparent_22%),radial-gradient(circle_at_50%_22%,rgba(59,130,246,0.14),transparent_34%)]' />
      <div className='pointer-events-none absolute inset-x-0 top-[24rem] h-[34rem] bg-[radial-gradient(circle_at_20%_30%,rgba(148,163,184,0.1),transparent_24%),radial-gradient(circle_at_82%_24%,rgba(125,211,252,0.14),transparent_22%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(15,23,42,0.55),transparent_22%),radial-gradient(circle_at_82%_24%,rgba(14,165,233,0.12),transparent_24%)]' />

      {/* A-Z floating index — left side, hidden by default, visible on hover */}
      <div className='group fixed left-0 top-1/2 z-50 hidden -translate-y-1/2 lg:flex'>
        {/* trigger strip */}
        <div className='flex h-full w-3 cursor-pointer items-center justify-center' />
        {/* index panel */}
        <div className='pointer-events-none ml-1 flex translate-x-[-110%] flex-col items-center gap-[2px] rounded-xl border border-border/60 bg-background/90 px-2 py-3 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 opacity-0'>
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
                    : 'text-muted-foreground/30 cursor-default'
                }`}>
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      <section className='relative mx-auto flex min-h-[100dvh] w-full max-w-[1150px] flex-col gap-8 px-4 pb-24 pt-6 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8'>
        <header className='space-y-5 sm:space-y-6'>
          <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.18em] text-muted-foreground shadow-sm backdrop-blur-md'>
            <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
            Research index
          </div>
          <div className='space-y-3'>
            <h1 className='max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl lg:text-[5.25rem] lg:leading-[0.95]'>
              Research Map
            </h1>
            <p className='max-w-4xl text-[15px] leading-8 text-muted-foreground sm:text-[17px]'>
              {PROJECTS.length} crypto projects, arranged as a living archive of
              deep-dive theses across exchanges, DeFi, infra, AI, and market
              structure.
            </p>
          </div>
        </header>

        <div className='relative max-w-xs'>
          <input
            type='text'
            placeholder='Search by symbol or name...'
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className='w-full rounded-full border border-border/70 bg-background/60 px-4 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 backdrop-blur-sm outline-none transition-all duration-200 focus:border-foreground/30 focus:bg-background/85'
          />
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground'>
              ✕
            </button>
          )}
        </div>

        <div className='flex flex-wrap gap-2.5'>
          {ALL_TYPES.filter((t) => {
            if (t === 'All') return true;
            return PROJECTS.some((p) => p.type === t);
          }).map((type) => {
            const count = type === 'All' ? PROJECTS.length : PROJECTS.filter((p) => p.type === type).length;
            return (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium tracking-[0.02em] backdrop-blur-sm transition-all duration-200 ${
                  activeType === type
                    ? 'border-foreground/80 bg-foreground text-background shadow-[0_12px_28px_-20px_rgba(15,23,42,0.8)]'
                    : 'border-border/70 bg-background/60 text-muted-foreground hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-background/85 hover:text-foreground'
                }`}>
                {type}
                <span className={`ml-1.5 text-[10px] ${activeType === type ? 'opacity-70' : 'opacity-50'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4'>
          {visible.map((project) => (
            <Link
              key={project.slug}
              id={`project-${project.slug}`}
              href={`/blog/${project.slug}`}
              className='group relative flex min-h-[16.5rem] flex-col gap-3 overflow-hidden rounded-[1.4rem] border border-border/60 bg-background/72 p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.6)] backdrop-blur-[2px] transition-all duration-300 hover:-translate-y-1 hover:border-foreground/15 hover:bg-background/84 hover:shadow-[0_28px_55px_-34px_rgba(15,23,42,0.78)]'>
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
                  <span className='shrink-0 rounded-full border border-border/70 bg-background/80 px-2 py-1 text-[10px] font-medium tracking-[0.08em] text-muted-foreground shadow-sm backdrop-blur-sm'>
                    {project.type}
                  </span>
                </div>
                <p className='line-clamp-3 text-[13px] leading-6 text-muted-foreground'>
                  {project.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className='text-sm text-muted-foreground'>
            No projects in this category yet.
          </p>
        )}

        {visibleCount < filtered.length && (
          <div className='flex justify-center'>
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className='rounded-full border border-border/70 bg-background/60 px-5 py-2 text-[12px] font-medium text-muted-foreground backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-background/85 hover:text-foreground'>
              Load more ({filtered.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
