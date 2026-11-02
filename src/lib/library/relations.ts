import { articleHref, type Locale } from '../i18n';
import type { LibraryPublicItem, LibraryPublicRelation } from './types';

type Article = { slug: string; metadata: { title: string; language: Locale; translationKey: string; sourceSlug: string; translations: Partial<Record<Locale, string>> } };
export type LibraryArticleLink = { translationKey: string; title: string; href: string; language: Locale; itemIds: string[] };

export function libraryItemsForArticle(items: LibraryPublicItem[], relations: LibraryPublicRelation[], translationKey: string) {
  const ids = new Set(relations.filter(relation => relation.entity_type === 'article' && relation.article_translation_key === translationKey).map(relation => relation.item_id));
  return items.filter(item => item.detail_enabled && ids.has(item.id)).slice(0, 6);
}

export function libraryItemsForTopic(items: LibraryPublicItem[], slug: string) {
  return items.filter(item => item.detail_enabled && item.topic_slugs.includes(slug)).slice(0, 6);
}

export function libraryArticleLinks(relations: LibraryPublicRelation[], locale: Locale, resolve: (slug: string) => Article | null): LibraryArticleLink[] {
  const groups = new Map<string, LibraryArticleLink>();
  for (const relation of relations.filter(relation => relation.entity_type === 'article')) {
    const key = relation.article_translation_key;
    const source = resolve(relation.entity_slug);
    if (!key || source?.metadata.translationKey !== key) continue;
    const translatedSlug = source.metadata.translations[locale];
    const translated = translatedSlug ? resolve(translatedSlug) : null;
    const original = resolve(source.metadata.sourceSlug);
    const post = translated?.metadata.translationKey === key && translated.metadata.language === locale ? translated : original?.metadata.translationKey === key ? original : source;
    const current = groups.get(key);
    if (current) { if (!current.itemIds.includes(relation.item_id)) current.itemIds.push(relation.item_id); }
    else groups.set(key, { translationKey: key, title: post.metadata.title, href: articleHref(post.slug, post.metadata.language), language: post.metadata.language, itemIds: [relation.item_id] });
  }
  return [...groups.values()];
}
