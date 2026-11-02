import { getTranslator, type Locale } from '@/lib/i18n';
import { getLibrarySnapshot } from '@/lib/library/catalog';
import { libraryItemsForArticle, libraryItemsForTopic } from '@/lib/library/relations';
import { libraryItemHref, libraryKindLabel } from '@/lib/library/presentation';
import type { LibraryPublicItem } from '@/lib/library/types';

function ReadingLinks({ items, locale }: { items: LibraryPublicItem[]; locale: Locale }) {
  if (!items.length) return null;
  const t = getTranslator(locale);
  return <section className="mt-8 border-t border-border pt-6" aria-label={t('Further reading from the Library', '资料库延伸阅读', 'ライブラリの関連資料')}>
    <h2 className="mb-2 text-base font-medium">{t('Further reading', '延伸阅读', '関連資料')}</h2>
    <p className="mb-4 text-xs leading-6 text-muted-foreground">{t('Editorial reading leads. A link does not establish support for the article’s conclusions.', '编辑挑选的阅读线索，关联不代表资料支持文章结论。', '編集者が選んだ読書の手がかりです。リンクは記事の結論への支持を示しません。')}</p>
    <ul className="border-t border-border">{items.map(item => <li key={item.id} className="border-b border-border py-4"><a href={libraryItemHref(item.slug, locale)} className="text-sm font-medium leading-7 hover:text-brand">{item.locales[locale].title} ↗</a><span className="ml-3 text-[10px] text-subtle">{libraryKindLabel(item.kind, locale)}</span><p className="mt-1 text-xs leading-6 text-muted-foreground">{item.locales[locale].reasons[0]?.text}</p></li>)}</ul>
  </section>;
}

export async function LibraryArticleReading({ translationKey, locale }: { translationKey: string; locale: Locale }) {
  const snapshot = await getLibrarySnapshot();
  return <ReadingLinks items={libraryItemsForArticle(snapshot.items, snapshot.relations, translationKey)} locale={locale} />;
}

export async function LibraryTopicReading({ slug, locale }: { slug: string; locale: Locale }) {
  const snapshot = await getLibrarySnapshot();
  return <ReadingLinks items={libraryItemsForTopic(snapshot.items, slug)} locale={locale} />;
}
