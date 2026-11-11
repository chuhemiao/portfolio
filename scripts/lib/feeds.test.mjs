import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { LOCALES } from '../../src/lib/i18n.ts';
import { BLOG_INDEX_FILE, ROOT } from './content/paths.mjs';
import { RSS_ITEM_LIMIT, feedSlugs, newestFeedSlugs } from './feeds.mjs';

const feeds = [['rss.xml', undefined], ...LOCALES.map((locale) => [`rss-${locale}.xml`, locale])];
const feedPaths = feeds.map(([name]) => path.join(ROOT, 'public', name));
const generated = fs.existsSync(BLOG_INDEX_FILE) && feedPaths.every((file) => fs.existsSync(file));
// A local `content:build` without `assets:build` leaves feeds older than the
// index; comparing them then reports staleness, not a generator/checker split.
// CI runs content:prepare, which writes the feeds after the index.
const stale = generated && feedPaths.some((file) => fs.statSync(file).mtimeMs < fs.statSync(BLOG_INDEX_FILE).mtimeMs);
const skip = !generated ? 'feeds not generated; run pnpm assets:build' : stale ? 'feeds older than the index; run pnpm assets:build' : false;

// check-i18n asserts the same thing, but only as the last step of `pnpm build`,
// which neither CI nor a local run executes -- that is how the 50-item cut
// reached a deploy.
test('every generated feed carries exactly its newest posts, newest first', { skip }, () => {
  const { posts } = JSON.parse(fs.readFileSync(BLOG_INDEX_FILE, 'utf8'));
  for (const [name, locale] of feeds) {
    const feed = fs.readFileSync(path.join(ROOT, 'public', name), 'utf8');
    const expected = newestFeedSlugs(posts, locale);
    assert.ok(expected.length > 0 && expected.length <= RSS_ITEM_LIMIT, `${name} expects ${expected.length} items`);
    assert.deepEqual(feedSlugs(feed), expected, name);
  }
});
