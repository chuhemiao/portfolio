import Link from 'next/link';
import { getTranslator, type Locale } from '@/lib/i18n';
import { libraryItemHref, libraryKindLabel, libraryLanguageLabel, libraryPublicationDate, libraryValidityLabel } from '@/lib/library/presentation';
import type { LibraryPublicItem } from '@/lib/library/types';

export function LibraryResourceRow({ item, locale, actions, matchFields = [] }: { item: LibraryPublicItem; locale: Locale; actions?: React.ReactNode; matchFields?: string[] }) {
  const t = getTranslator(locale);
  const local = item.locales[locale];
  const fields: Record<string, string> = { identity: t('Identifier', '资源标识', '識別子'), original_title: t('Original title', '原始题名', '原題'), creators: t('Creator', '创作者', '著者'), topics: t('Topic', '主题', 'トピック'), title: t('Editorial title', '编辑题名', '編集タイトル'), description: t('Reading note', '阅读说明', '読書メモ'), reasons: t('Reading reason', '阅读理由', '読む理由') };
  const matches = [...new Set(matchFields.map(field => fields[field.split('.').at(-1) ?? field] ?? t('Editorial text', '编辑说明', '編集メモ')))];
  return <article className="flex gap-3 border-b border-border py-5 sm:gap-5">
    <div aria-hidden="true" className="hidden w-14 shrink-0 pt-1 sm:block"><div className="flex min-h-16 items-center justify-center rounded-sm border border-border bg-surface px-1 text-center font-mono text-[10px] text-subtle">{libraryKindLabel(item.kind, locale)}</div></div>
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-subtle"><span>{libraryKindLabel(item.kind, locale)}</span><span className="text-brand">{t('Editorial pick', '编辑精选', '編集セレクト')}</span><span>{t('Original', '原文', '原文')}: {libraryLanguageLabel(item.original_language, locale)}</span></div>
      <h3 className="break-words text-[18px] font-medium leading-relaxed tracking-tight sm:text-[20px]"><Link href={libraryItemHref(item.slug, locale)} className="hover:text-brand">{local.title}</Link></h3>
      <p className="mt-1 break-words font-mono text-[11px] leading-5 text-subtle"><span lang={item.original_language === 'und' ? undefined : item.original_language}>{item.original_title}</span>{item.creators.length > 0 && <> · {item.creators.join(', ')}</>} · {libraryPublicationDate(item, locale)}</p>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{local.description}</p>
      <div className="my-3 flex gap-3 border-l-2 border-brand/60 pl-3 text-xs leading-6"><span className="shrink-0 text-brand">{t('Why read', '为什么读', '読む理由')}</span><ul className="min-w-0 text-muted-foreground">{local.reasons.slice(0, 3).map(reason => <li key={reason.id}>{reason.text}</li>)}</ul></div>
      {matches.length > 0 && <p className="mb-3 text-xs text-subtle">{t('Keyword match', '关键词命中', 'キーワード一致')}: {matches.slice(0, 3).join(' · ')}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-[10px] text-subtle">{item.topic_slugs.map(slug => <a key={slug} href={`/${locale}/library?topic=${encodeURIComponent(slug)}`} className="rounded-sm border border-border px-2 py-1 hover:text-brand">{slug}</a>)}{item.validity_status !== 'current' && <span className="py-1">{libraryValidityLabel(item.validity_status, locale)}</span>}{item.availability !== 'available' && <span className="py-1">{item.availability === 'unavailable' ? t('Source unavailable', '来源不可用', 'リンク先は利用不可') : t('Availability not verified', '可用性未核实', '利用可否は未確認')}</span>}</div>
        <a href={item.canonical_url} target="_blank" rel="noopener noreferrer" className="max-w-full break-all py-1 text-xs text-muted-foreground hover:text-brand" aria-label={`${t('Open source', '打开原始来源', '原典を開く')}: ${item.original_title} (${t('new tab', '新标签页', '新しいタブ')})`}>{item.source_hostname} ↗</a>
      </div>
      {actions && <div className="mt-3">{actions}</div>}
    </div>
  </article>;
}
