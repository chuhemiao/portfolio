'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getTranslator, type Locale } from '@/lib/i18n';
import { createLibrarySearch, parseLibraryQuery, serializeLibraryQuery, type LibraryQuery } from '@/lib/library/search';
import { libraryKindLabel, libraryLanguageLabel, libraryLevelLabel } from '@/lib/library/presentation';
import { libraryLocalItemVisible, type LibraryLocalView } from '@/lib/library/local-state';
import type { LibraryPublicItem, LibraryPublicRankings, LibrarySnapshotManifest } from '@/lib/library/types';
import { LibraryItemActions, useLibraryLocalState } from './local-state-provider';
import { LibraryResourceRow } from './resource-row';

export type LibraryTopicOption = { slug: string; name: string; count: number };
type Props = { items: LibraryPublicItem[]; rankings: LibraryPublicRankings; manifest: LibrarySnapshotManifest; topics: LibraryTopicOption[]; locale: Locale };
const DEFAULT_QUERY = parseLibraryQuery({});
const CONTROL = 'min-w-0 rounded-sm border border-border bg-background px-2.5 py-2 text-xs text-muted-foreground';

export function LibraryBrowser({ items, rankings, manifest, topics, locale }: Props) {
  const t = getTranslator(locale);
  const search = useMemo(() => createLibrarySearch({ items, rankings, manifest }), [items, rankings, manifest]);
  const [query, setQuery] = useState<LibraryQuery>(DEFAULT_QUERY);
  const [draft, setDraft] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [validation, setValidation] = useState(false);
  const [localView, setLocalView] = useState<LibraryLocalView>('all');
  const { state, ready, clear } = useLibraryLocalState();
  const heading = useRef<HTMLHeadingElement>(null);
  const [clock, setClock] = useState(manifest.as_of);

  useEffect(() => {
    const restore = () => {
      setClock(new Date().toISOString());
      setValidation(false);
      try { const restored = parseLibraryQuery(new URLSearchParams(window.location.search)); setQuery(restored); setDraft(restored.q); setInvalid(false); }
      catch { setInvalid(true); setDraft(''); }
    };
    restore();
    window.addEventListener('popstate', restore);
    window.addEventListener('pageshow', restore);
    return () => { window.removeEventListener('popstate', restore); window.removeEventListener('pageshow', restore); };
  }, [manifest.valid_until]);

  useEffect(() => {
    if (!manifest.valid_until) return;
    const wait = Date.parse(manifest.valid_until) - Date.now();
    if (wait <= 0) return;
    const timeout = setTimeout(() => setClock(new Date().toISOString()), Math.min(wait + 1, 2_147_483_647));
    return () => clearTimeout(timeout);
  }, [manifest.valid_until, clock]);

  const apply = (next: LibraryQuery, focus = false) => {
    try {
      const params = serializeLibraryQuery(next);
      const url = window.location.pathname + (params.size ? `?${params}` : '') + window.location.hash;
      if (url !== window.location.pathname + window.location.search + window.location.hash) window.history.pushState(null, '', url);
      setQuery(next); setDraft(next.q); setInvalid(false); setValidation(false); setClock(new Date().toISOString());
      if (focus) heading.current?.focus();
    } catch { setValidation(true); }
  };
  const change = (patch: Partial<LibraryQuery>) => apply({ ...query, ...patch, page: 1 });
  const visibleIds = useMemo(() => new Set(items.filter(item => libraryLocalItemVisible(state.items[item.id], localView)).map(item => item.id)), [items, state, localView]);
  const outcome = useMemo(() => {
    if (invalid) return { result: null, expired: false };
    try { return { result: search.search(serializeLibraryQuery(query), { locale, asOf: clock, itemIds: visibleIds }), expired: false }; }
    catch { return { result: null, expired: true }; }
  }, [search, query, locale, clock, visibleIds, invalid]);
  const result = outcome.result;
  const languages = [...new Set(items.map(item => item.original_language))].sort();
  const years = [...new Set(items.flatMap(item => item.original_published_at ? [item.original_published_at.slice(0, 4)] : []))].sort().reverse();
  const missingTopic = Boolean(query.topic && !topics.some(topic => topic.slug === query.topic));
  const missingLanguage = Boolean(query.language && !languages.includes(query.language));
  const missingYear = Boolean(query.year && query.year !== 'unknown' && !years.includes(query.year));
  const saved = Object.values(state.items).filter(item => item.saved).length;
  const reset = () => { setLocalView('all'); apply(DEFAULT_QUERY, true); };

  return <>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-xs text-subtle"><span>{items.length} {t('curated resources', '条精选资源', '件の編集セレクト')}</span><button type="button" disabled={!ready} onClick={() => { setLocalView('saved'); change({}); }} className="py-2 text-muted-foreground hover:text-brand disabled:opacity-50">{t('Saved', '已保存', '保存済み')} <span className="ml-1 rounded-sm border border-border px-1.5 py-0.5 font-mono">{saved}</span></button></div>
    <form role="search" aria-label={t('Search the Library', '搜索资料库', 'ライブラリを検索')} onSubmit={event => { event.preventDefault(); apply({ ...query, q: draft.trim(), page: 1 }, true); }} className="flex min-w-0 gap-2 rounded border border-border-strong bg-surface p-2 sm:p-2.5">
      <label htmlFor="library-search" className="sr-only">{t('Keywords, titles, creators, or identifiers', '搜索关键词、题名、创作者或资源标识', 'キーワード、題名、著者、識別子で検索')}</label>
      <input id="library-search" type="search" name="q" maxLength={200} autoComplete="off" value={draft} onChange={event => setDraft(event.target.value)} placeholder={t('Search titles, topics, authors, ERC-7702…', '搜索题名、主题、作者、ERC-7702…', '題名、トピック、著者、ERC-7702…')} className="min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground placeholder:text-subtle" />
      <button type="submit" className="shrink-0 rounded-sm bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground sm:px-6">{t('Search', '搜索', '検索')}</button>
    </form>
    {validation && <p role="alert" className="mt-3 text-sm leading-7 text-muted-foreground">{t('Search or filter values were not applied. Use at most 200 characters, valid dates, and a start date no later than the end date.', '搜索或筛选条件未应用。关键词最多 200 字符，日期须有效，且开始日期不能晚于结束日期。', '検索・絞り込み条件は反映されていません。キーワードは200文字以内、日付は有効な値で、開始日は終了日以前にしてください。')}</p>}
    <fieldset className="my-4 flex flex-wrap gap-1.5"><legend className="sr-only">{t('Resource type', '资源类型', '資料の種類')}</legend>
      {(['', 'spec', 'paper', 'book', 'article', 'video'] as const).map(kind => <label key={kind} className="cursor-pointer"><input type="radio" name="library-type" value={kind} checked={query.type === kind} onChange={() => change({ type: kind })} className="peer sr-only" /><span className="block rounded-sm border border-transparent px-3 py-2 text-xs text-muted-foreground peer-checked:border-brand/40 peer-checked:bg-brand/10 peer-checked:text-brand peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-ring">{kind ? libraryKindLabel(kind, locale) : t('All', '全部', 'すべて')}</span></label>)}
    </fieldset>
    <div className="flex flex-wrap gap-2 border-b border-border pb-5">
      <label className="flex min-w-0 flex-1 flex-col gap-1 text-[11px] text-subtle sm:flex-none">{t('Topic', '主题', 'トピック')}<select className={CONTROL} value={query.topic} onChange={event => change({ topic: event.target.value })}><option value="">{t('All topics', '全部主题', 'すべてのトピック')}</option>{missingTopic && <option value={query.topic}>{query.topic} ({t('unavailable', '当前不可用', '現在は該当なし')})</option>}{topics.map(topic => <option key={topic.slug} value={topic.slug}>{topic.name} ({topic.count})</option>)}</select></label>
      <label className="flex min-w-0 flex-1 flex-col gap-1 text-[11px] text-subtle sm:flex-none">{t('Original language', '原文语言', '原文の言語')}<select className={CONTROL} value={query.language} onChange={event => change({ language: event.target.value })}><option value="">{t('All languages', '全部语言', 'すべての言語')}</option>{missingLanguage && <option value={query.language}>{query.language} ({t('unavailable', '当前不可用', '現在は該当なし')})</option>}{languages.map(language => <option key={language} value={language}>{libraryLanguageLabel(language, locale)}</option>)}</select></label>
      <label className="flex min-w-0 flex-1 flex-col gap-1 text-[11px] text-subtle sm:flex-none">{t('Level', '阅读难度', '難易度')}<select className={CONTROL} value={query.level} onChange={event => change({ level: event.target.value })}><option value="">{t('All levels', '全部难度', 'すべて')}</option>{['beginner', 'intermediate', 'advanced', 'unknown'].map(level => <option key={level} value={level}>{libraryLevelLabel(level, locale)}</option>)}</select></label>
      <label className="flex min-w-0 flex-1 flex-col gap-1 text-[11px] text-subtle sm:flex-none">{t('Publication year', '出版年份', '公開年')}<select className={CONTROL} value={query.year} onChange={event => change({ year: event.target.value })}><option value="">{t('All years', '全部年份', 'すべての年')}</option>{missingYear && <option value={query.year}>{query.year} ({t('unavailable', '当前不可用', '現在は該当なし')})</option>}{years.map(year => <option key={year} value={year}>{year}</option>)}<option value="unknown">{t('Unknown', '未知', '不明')}</option></select></label>
      <button type="button" onClick={reset} className="self-end px-2 py-2 text-xs text-subtle hover:text-brand">{t('Reset filters', '重置筛选', '絞り込みを解除')}</button>
    </div>
    {(missingTopic || missingLanguage || missingYear) && <p role="status" className="my-3 text-xs leading-6 text-muted-foreground">{t('A filter in this URL is no longer present in the current Library. Its value is shown as unavailable; reset or change it to continue.', '此 URL 中部分筛选值已不在当前资料库，已标为“当前不可用”；可重置或更换筛选条件。', 'URL の一部の条件は現在のライブラリに存在しないため、「現在は該当なし」と表示しています。条件を変更するか解除してください。')}</p>}
    <details className="border-b border-border py-3 text-xs text-muted-foreground"><summary className="cursor-pointer py-1">{t('Community recommendation dates', '社区推荐日期', 'コミュニティの推薦日')}</summary><p className="my-2 leading-6 text-subtle">{t('Dates refer to verified outside recommendations. Editorial selections do not count as community recommendations.', '日期只筛选已核实的外部推荐，编辑精选不计入社区推荐。', '確認済みの外部推薦の日付で絞り込みます。編集セレクトはコミュニティの推薦に含みません。')}</p><div className="flex flex-wrap gap-3">{(['recommendedFrom', 'recommendedTo'] as const).map(key => <label key={key} className="flex min-w-0 flex-col gap-1">{key === 'recommendedFrom' ? t('From (UTC)', '开始日期（UTC）', '開始日（UTC）') : t('Through (UTC)', '结束日期（UTC）', '終了日（UTC）')}<input type="date" value={query[key]} onChange={event => change({ [key]: event.target.value })} className={CONTROL} /></label>)}</div></details>
    <div className="mb-4 mt-6 flex flex-wrap items-center justify-between gap-3">
      <h2 id="library-results" ref={heading} tabIndex={-1} className="text-lg font-medium tracking-tight">{t('Reading list', '阅读清单', '読む資料')} <span className="ml-2 font-mono text-xs font-normal text-subtle">{result?.total ?? 0}</span></h2>
      <label className="flex items-center gap-2 text-xs text-subtle">{t('Sort', '排序', '並び順')}<select className={CONTROL} value={query.sort} onChange={event => change({ sort: event.target.value as LibraryQuery['sort'] })}><option value="best">{t('Keyword relevance / editorial order', '关键词相关度 / 编辑顺序', 'キーワード関連度 / 編集順')}</option><option value="evergreen">{t('Evergreen editorial order', '常读编辑顺序', '定番の編集順')}</option><option value="recently-published">{t('Recently published', '最近出版', '公開日の新しい順')}</option><option value="recently-recommended">{t('Recently recommended by others', '外部最近推荐', '外部で最近推薦')}</option></select></label>
    </div>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-xs text-subtle">{t('Local view', '本地视图', 'このブラウザの表示')}<select value={localView} disabled={!ready} onChange={event => { setLocalView(event.target.value as LibraryLocalView); change({}); }} className={CONTROL}><option value="all">{t('All visible', '全部可见', '表示中のすべて')}</option><option value="saved">{t('Saved', '已保存', '保存済み')}</option><option value="later">{t('Read later', '稍后阅读', 'あとで読む')}</option><option value="read">{t('Read', '已读', '既読')}</option><option value="hidden">{t('Hidden', '已隐藏', '非表示')}</option></select></label><button type="button" disabled={!ready} onClick={clear} className="py-2 text-xs text-subtle hover:text-foreground disabled:opacity-50">{t('Clear local reading data', '清空本地阅读状态', 'このブラウザの読書データを消去')}</button></div>
    <p className="mb-3 text-[11px] leading-6 text-subtle">{t('Saved and reading states stay in this browser. Search and filter parameters are in the URL; opening or sharing that URL sends them to this site.', '保存与阅读状态仅存于此浏览器。搜索和筛选参数保留在 URL 中，打开或分享该链接会将参数发送给本站。', '保存・読書状況はこのブラウザに保存します。検索・絞り込み条件は URL に含まれ、その URL を開く・共有すると当サイトにも送信されます。')}</p>
    <p role="status" aria-live="polite" className="sr-only">{result ? t(`${result.total} results. Page ${query.page} of ${result.page_count || 1}.`, `${result.total} 条结果，第 ${query.page} 页，共 ${result.page_count || 1} 页。`, `${result.total} 件、全 ${result.page_count || 1} ページ中 ${query.page} ページ。`) : ''}</p>
    {invalid ? <div role="alert" className="border border-border bg-surface p-5 text-sm leading-7"><p>{t('This URL contains invalid or repeated search parameters. Reset the filters to continue.', '此 URL 含无效或重复的搜索参数，请重置筛选后继续。', 'URL の検索条件が無効、または重複しています。条件を解除して続けてください。')}</p><button type="button" onClick={reset} className="mt-2 py-2 text-brand">{t('Reset filters', '重置筛选', '絞り込みを解除')}</button></div>
      : outcome.expired ? <div role="alert" className="border border-border bg-surface p-5 text-sm leading-7"><p>{t('This reading snapshot is no longer available. Reload to request the current Library.', '此阅读快照已失效，请重新加载以获取当前资料库。', 'この読書データは期限切れです。再読み込みして現在のライブラリを取得してください。')}</p><a href={`/${locale}/library`} className="mt-2 inline-block py-2 text-brand">{t('Reload Library', '重新加载资料库', 'ライブラリを再読み込み')}</a></div>
      : result?.results.length ? <div className="border-t border-border">{result.results.map(hit => <LibraryResourceRow key={hit.item.id} item={hit.item} locale={locale} matchFields={query.q ? hit.matches.map(match => match.field) : []} actions={<LibraryItemActions id={hit.item.id} title={hit.item.locales[locale].title} locale={locale} compact view={localView} onDisappear={() => heading.current?.focus()} />} />)}</div>
      : <div className="border border-border bg-surface p-6 text-sm leading-7"><h3 className="font-medium">{items.length === 0 ? t('No published resources', '暂无已发布资源', '公開済みの資料はありません') : result && query.page > Math.max(1, result.page_count) ? t('This page has no results', '此页没有结果', 'このページに結果はありません') : t('No matching resources', '没有匹配的资源', '条件に一致する資料はありません')}</h3><p className="mt-1 text-muted-foreground">{t('Try fewer filters or another keyword. Saved and hidden views reflect only this browser.', '可减少筛选条件或更换关键词。已保存和已隐藏视图只反映此浏览器的状态。', '条件を減らすか別のキーワードをお試しください。保存・非表示の一覧はこのブラウザの状態のみを反映します。')}</p><button type="button" onClick={reset} className="mt-2 py-2 text-brand">{t('Reset filters', '重置筛选', '絞り込みを解除')}</button>{result && query.page > 1 && <button type="button" onClick={() => apply({ ...query, page: 1 }, true)} className="ml-4 py-2 text-brand">{t('First page', '返回第一页', '最初のページへ')}</button>}</div>}
    {result && result.page_count > 1 && <nav aria-label={t('Library result pages', '资料库结果分页', '検索結果のページ')} className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground"><span>{t(`Page ${query.page} of ${result.page_count}`, `第 ${query.page} 页，共 ${result.page_count} 页`, `${result.page_count} ページ中 ${query.page}`)}</span><div className="flex gap-2">{Array.from({ length: result.page_count }, (_, index) => index + 1).map(page => <a key={page} href={`?${serializeLibraryQuery({ ...query, page })}`} aria-current={page === query.page ? 'page' : undefined} aria-label={t(`Page ${page}`, `第 ${page} 页`, `${page} ページ`)} onClick={event => { if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); apply({ ...query, page }, true); }} className="rounded-sm border border-border px-3 py-2 aria-[current=page]:border-brand aria-[current=page]:text-brand">{page}</a>)}</div></nav>}
    <p className="mt-5 text-[11px] leading-6 text-subtle">{t('Keyword matching is a reading aid, not a credibility score. With no keywords, best and evergreen use the reviewed editorial order.', '关键词命中只用于发现阅读线索，不是可信度评分。无关键词时，“相关度”和“常读”均按已审编辑顺序排列。', 'キーワード一致は読む資料を探す手がかりで、信頼性の点数ではありません。キーワードなしでは関連度・定番とも確認済みの編集順です。')}</p>
  </>;
}
