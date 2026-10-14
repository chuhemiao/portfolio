import type { Locale } from './i18n';

export type PostLanguageFilter = 'auto' | 'all' | Locale;

type LocalizablePost = {
  slug: string;
  metadata: {
    title: string;
    summary: string;
    language: Locale;
    translationKey: string;
    sourceSlug: string;
    translations: Partial<Record<Locale, string>>;
    category?: string;
  };
};

export function selectLocalizedPosts<T extends LocalizablePost>(posts: T[], locale: Locale, resolve?: (slug: string) => T | null | undefined): T[] {
  const groups = new Map<string, T[]>();
  const bySlug = new Map(posts.map((post) => [post.slug, post]));
  const positions = new Map(posts.map((post, index) => [post.slug, index]));
  for (const post of posts) {
    const key = post.metadata.translationKey;
    const group = groups.get(key);
    if (group) group.push(post); else groups.set(key, [post]);
  }
  return [...groups.values()].sort((a, b) => {
    const sourcePosition = (group: T[]) => positions.get(group[0].metadata.sourceSlug) ?? positions.get(group[0].slug) ?? 0;
    return sourcePosition(a) - sourcePosition(b);
  }).map((group) => {
    const first = group[0];
    const translatedSlug = first.metadata.translations[locale];
    const translated = translatedSlug ? bySlug.get(translatedSlug) ?? resolve?.(translatedSlug) : undefined;
    if (translated?.metadata.language === locale && translated.metadata.translationKey === first.metadata.translationKey) return translated;
    const matching = group.find((post) => post.metadata.language === locale);
    if (matching) return matching;
    const source = bySlug.get(first.metadata.sourceSlug) ?? resolve?.(first.metadata.sourceSlug);
    return source?.metadata.translationKey === first.metadata.translationKey ? source : first;
  });
}

export function filterPostsForLocale<T extends LocalizablePost>(posts: T[], locale: Locale, filters: {
  language: PostLanguageFilter;
  category?: string;
  topicSlugs?: ReadonlySet<string> | null;
  query?: string;
}): T[] {
  const candidates = filters.language === 'auto' ? selectLocalizedPosts(posts, locale) : posts;
  const sources = new Map(posts.map((post) => [post.slug, post]));
  const topicGroups = filters.topicSlugs ? new Set(posts.filter((post) => filters.topicSlugs?.has(post.slug)).map((post) => post.metadata.translationKey)) : null;
  const query = filters.query?.trim().toLowerCase();
  return candidates.filter((post) => {
    if (filters.category && filters.category !== 'all' && post.metadata.category !== filters.category) return false;
    if (filters.language !== 'auto' && filters.language !== 'all' && post.metadata.language !== filters.language) return false;
    if (topicGroups && !topicGroups.has(post.metadata.translationKey)) return false;
    if (!query) return true;
    const searchPosts = filters.language === 'auto' ? [post, sources.get(post.metadata.sourceSlug)] : [post];
    return searchPosts.some((candidate) => candidate && `${candidate.metadata.title}\n${candidate.metadata.summary}`.toLowerCase().includes(query));
  });
}

export function paginatePosts<T>(posts: T[], requestedPage: number, pageSize: number) {
  if (!Number.isSafeInteger(pageSize) || pageSize < 1) throw new RangeError('Page size must be a positive safe integer');
  const totalPages = Math.ceil(posts.length / pageSize);
  const page = Math.min(Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1, totalPages || 1);
  const startIndex = (page - 1) * pageSize;
  return { posts: posts.slice(startIndex, startIndex + pageSize), page, totalPages, startIndex };
}
