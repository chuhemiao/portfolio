import { getBlogPosts } from '@/data/blog';
import { DATA } from '@/data/resume';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = await getBlogPosts();
  const sortedPosts = posts.sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime()
  );

  const latestPost = sortedPosts[0];
  const lastBuildDate = latestPost
    ? new Date(latestPost.metadata.publishedAt).toUTCString()
    : new Date().toUTCString();

  const items = sortedPosts
    .map((post) => {
      const postUrl = `${DATA.url}/blog/${post.slug}`;
      const title = escapeXml(post.metadata.title);
      const description = escapeXml(post.metadata.summary || '');
      const pubDate = new Date(post.metadata.publishedAt).toUTCString();

      return `<item>
  <title>${title}</title>
  <link>${postUrl}</link>
  <guid>${postUrl}</guid>
  <pubDate>${pubDate}</pubDate>
  <description>${description}</description>
</item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(DATA.name)} Blog</title>
  <link>${DATA.url}/blog</link>
  <description>${escapeXml(DATA.description)}</description>
  <language>en-us</language>
  <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
</channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
