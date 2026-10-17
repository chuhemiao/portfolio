// Articles used to live at /blog/<slug>. The trilingual move made
// /<locale>/blog/<slug> canonical, but the legacy URLs stayed prerendered as
// full copies -- 7,260 pages at ~219 KB, 1.86 GB of a 3.9 GB export, all of it
// re-uploaded on every deploy for pages nothing on the site links to.
//
// The legacy route now prerenders nothing (see its generateStaticParams), and
// this script writes a ~400-byte redirect document at each old URL instead, so
// links indexed before the move still resolve. Each stub carries a canonical
// link to the locale URL, a zero-delay meta refresh for crawlers, and a
// location.replace that preserves any query or hash.
import fs from 'node:fs/promises';
import path from 'node:path';

import { articleHref } from '../src/lib/i18n.ts';
import { BLOG_INDEX_FILE, ROOT } from './lib/content/paths.mjs';

const OUT_DIR = path.join(ROOT, 'out');
const SITE_URL = 'https://kkdemian.com';

const escapeHtml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function redirectDocument(target, language) {
  const href = escapeHtml(target);
  return `<!doctype html>
<html lang="${escapeHtml(language)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Redirecting</title>
<link rel="canonical" href="${escapeHtml(SITE_URL + target)}">
<meta http-equiv="refresh" content="0; url=${href}">
</head>
<body>
<p>This article moved to <a href="${href}">${href}</a>.</p>
<script>location.replace(${JSON.stringify(target)}+location.search+location.hash)</script>
</body>
</html>
`;
}

async function main() {
  try {
    await fs.access(OUT_DIR);
  } catch {
    console.log('emit-legacy-blog-redirects: no out/ directory, skipping.');
    return;
  }

  let index;
  try {
    index = JSON.parse(await fs.readFile(BLOG_INDEX_FILE, 'utf8'));
  } catch (error) {
    throw new Error(
      `Missing or unreadable ${path.relative(ROOT, BLOG_INDEX_FILE)}. Run "pnpm content:build" first.\n${String(error)}`
    );
  }

  const started = Date.now();
  const blogDir = path.join(OUT_DIR, 'blog');
  await fs.mkdir(blogDir, { recursive: true });

  let bytes = 0;
  await Promise.all(
    index.posts.map(async (post) => {
      const language = post.language ?? 'en';
      const document = redirectDocument(articleHref(post.slug, language), language);
      await fs.writeFile(path.join(blogDir, `${post.slug}.html`), document);
      bytes += Buffer.byteLength(document);
    })
  );

  const elapsed = ((Date.now() - started) / 1000).toFixed(2);
  console.log(
    `emit-legacy-blog-redirects: wrote ${index.posts.length.toLocaleString('en-US')} redirect stubs ` +
      `(${(bytes / 1024 ** 2).toFixed(1)} MB) in ${elapsed}s.`
  );
}

main().catch((error) => {
  console.error('emit-legacy-blog-redirects failed:', error);
  process.exit(1);
});
