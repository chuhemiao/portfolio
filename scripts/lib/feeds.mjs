// One limit for the generator and every check that reads its output. The cut
// from every post to 50 shipped with the number in the generator alone, and the
// build-time check still expected every post, so the first deploy after it failed.
export const RSS_ITEM_LIMIT = 50;

// Feeds keep the legacy /blog/<slug> form in <guid> (see renderRss), so the slug
// is recoverable from it without parsing the localized <link>.
export function feedSlugs(feed) {
  return [...feed.matchAll(/<guid>[^<]*\/blog\/([^<]+)<\/guid>/g)].map(([, slug]) => slug.replaceAll('&amp;', '&'));
}

// What a feed must carry: the newest posts, newest first, optionally one locale.
export function newestFeedSlugs(posts, locale) {
  return posts
    .filter((post) => !locale || post.language === locale)
    .slice(0, RSS_ITEM_LIMIT)
    .map((post) => post.slug);
}
