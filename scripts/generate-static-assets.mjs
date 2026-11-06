import fs from 'node:fs/promises';
import path from 'node:path';

import { LOCALES, articleHref, localizeHref } from '../src/lib/i18n.ts';
import { instrumentRouteParams, issuerSlugsWithInstruments } from '../src/data/instruments.ts';
import { loadTopics } from './lib/content/indexes.mjs';
import { BLOG_INDEX_FILE, ROOT, TOPIC_INDEX_FILE } from './lib/content/paths.mjs';
import { QUOTES_AS_OF } from '../src/data/instruments.ts';
import { readCurrentLibrary } from './library/public-reader.mjs';

const PUBLIC_DIR = path.join(ROOT, 'public');
const SITEMAP_DIR = path.join(PUBLIC_DIR, 'sitemaps');
const SITEMAP_SHARD_SIZE = 5000;
const CRAWL_DELAY_SECONDS = 10;
const RSS_ITEM_LIMIT = 50;

// Legacy /blog/<slug> URLs are redirect stubs kept for links indexed before the
// move to /<locale>/blog/<slug>. They hold no content yet doubled the crawlable
// surface, so they stay out of it; the localized URLs are matched by neither
// pattern and keep their place in the sitemap.
const DISALLOWED_PATHS = ['/api/', '/private/', '/blog/'];

// Backlink crawlers that send no readers. Across ~15k URLs each full pass is
// paid for in Edge Requests, and these three honour robots.txt. Scrapers that
// ignore it have to be stopped at the firewall instead.
const BLOCKED_BOTS = ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot', 'DataForSeoBot'];

const SITE = {
  name: 'kkdemian',
  url: 'https://kkdemian.com',
  description:
    'Web3 Product Engineer, digital nomad, and crypto researcher. Founder of iBuidl, TPM at Yamaswap.',
  summary:
    'Web3 Product Engineer, digital nomad, and crypto researcher. Founder of iBuidl, TPM at Yamaswap. Building market tools and publishing research across DeFi, exchanges, stablecoins, AI x Crypto, and capital allocation.',
  skills: [
    'Next.js',
    'React',
    'TypeScript',
    'Tailwind CSS',
    'Solana',
    'Solidity',
    'Go',
    'Rust',
    'Python',
    'Product Strategy',
    'Crypto Research',
  ],
};

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// The content compiler owns MDX discovery. This script only consumes its
// index, so a build never scans content/ twice.
async function loadPosts() {
  let index;

  try {
    index = JSON.parse(await fs.readFile(BLOG_INDEX_FILE, 'utf8'));
  } catch (error) {
    throw new Error(
      `Missing or unreadable ${path.relative(ROOT, BLOG_INDEX_FILE)}. Run "pnpm content:build" first.\n${String(error)}`
    );
  }

  // blog-index.json is already sorted newest-first.
  return index.posts.map((post) => ({
    slug: post.slug,
    metadata: {
      title: post.title || post.slug,
      publishedAt: post.publishedAt || new Date(0).toISOString(),
      summary: post.summary || '',
      category: post.category || 'tech',
      language: post.language || 'en',
      translations: post.translations || { [post.language || 'en']: post.slug },
    },
  }));
}

async function loadTopicIndex() {
  try {
    return JSON.parse(await fs.readFile(TOPIC_INDEX_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function renderRss(posts, locale) {
  const title = locale === 'zh-CN' ? '博客' : locale === 'ja' ? 'ブログ' : 'Blog';
  const latestPost = posts[0];
  const lastBuildDate = latestPost
    ? new Date(latestPost.metadata.publishedAt).toUTCString()
    : new Date().toUTCString();

  // A feed is a change notification, not an archive: shipping all 7k posts made
  // rss.xml 5.5 MB and grew it with every article, for readers that only ever
  // consume the newest entries. <guid> keeps its legacy /blog/<slug> form so
  // subscribers do not re-surface the whole history as unread.
  const items = posts
    .slice(0, RSS_ITEM_LIMIT)
    .map((post) => {
      const postUrl = escapeXml(`${SITE.url}${articleHref(post.slug, post.metadata.language)}`);
      return `<item>
  <title>${escapeXml(post.metadata.title)}</title>
  <link>${postUrl}</link>
  <guid>${escapeXml(`${SITE.url}/blog/${post.slug}`)}</guid>
  <pubDate>${new Date(post.metadata.publishedAt).toUTCString()}</pubDate>
  <description>${escapeXml(post.metadata.summary)}</description>
</item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(SITE.name)} ${title}</title>
  <link>${SITE.url}${locale ? `/${locale}` : ''}/blog</link>
  <description>${escapeXml(SITE.description)}</description>
  ${locale ? `<language>${locale}</language>` : ''}
  <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
</channel>
</rss>`;
}

function renderLlmsTxt(posts) {
  const recentPosts = posts.slice(0, 20);
  const blogList = recentPosts
    .map(
      (post) =>
        `- [${post.metadata.title}](${SITE.url}${articleHref(post.slug, post.metadata.language)})${
          post.metadata.summary ? `: ${post.metadata.summary}` : ''
        }`
    )
    .join('\n');

  return `# ${SITE.name}

> ${SITE.description}

${SITE.summary}

## Languages

- [中文](${SITE.url}/zh-CN)
- [English](${SITE.url}/en)
- [日本語](${SITE.url}/ja)

## Pages

- [Home](${SITE.url}/): Personal portfolio, current roles, work history, projects, and philosophy
- [Research](${SITE.url}/research): Deep-dive investment research on crypto projects across exchanges, DeFi, L1/L2, ZK, AI/DePIN, RWA, and market structure
- [Oscillator](${SITE.url}/oscillator): Altcoin strength monitor using ALT/BTC oscillator thesis
- [Watch](${SITE.url}/watch): Exchange listing intelligence across major crypto venues
- [Pulse](${SITE.url}/pulse): Web3 market intelligence dashboard synced from local content snapshots
- [Fear](${SITE.url}/fear): Bitcoin and crypto market regime dashboard
- [Fund](${SITE.url}/fund): Live capital map and conviction tracker
- [Tokenized Equities](${SITE.url}/stocks): On-chain US equities by issuer — legal wrapper, custody, proof of reserve, redemption terms and order-book depth
- [Blog](${SITE.url}/blog): Technical articles and market analysis
- [Thoughts](${SITE.url}/thoughts): Short-form crypto market notes and observations
- [Stack](${SITE.url}/stack): Personal workflow, books, data sources, crypto tools, and AI stack

## Recent Blog Posts

${blogList}

## Research Coverage

Exchanges: Binance, OKX, Bybit, Coinbase, Hyperliquid
DeFi: Uniswap, Aave, Curve, Pendle, GMX, Ethena, Morpho
L1/L2: Ethereum, Solana, TON, ICP, Base, Arbitrum, Optimism, Sui, Aptos
ZK: zkSync, Starknet, Scroll, Polygon zkEVM
AI/DePIN: Render, Akash, io.net, Bittensor, Grass
RWA: Ondo, Maple, Centrifuge

## Projects

- [iBuidl](https://ibuidl.org/): Web3 digital nomad community
- [Yamaswap](https://yamaswap.com/): Permissionless ETF dApp on Solana and BASE
- fCurrency: Farcaster mini app for fiat/crypto conversion
- [AnkiRin](https://rin.kkdemian.com/): AI-powered Japanese vocabulary flashcard tool

## Skills & Expertise

${SITE.skills.join(', ')}

## Social & Contact

- GitHub: https://github.com/chuhemiao
- X: https://x.com/0xkkdemian
- Telegram: https://t.me/kkdemian_laobai
- Telegram Channel: https://t.me/kkdemian2050
- YouTube: https://www.youtube.com/@kkdemian
- RSS Feed: ${SITE.url}/rss.xml
`;
}

function renderUrlSet(items) {
  const body = items
    .map(
      (item) => `  <url>
    <loc>${escapeXml(item.loc)}</loc>${item.lastmod ? `\n    <lastmod>${escapeXml(item.lastmod)}</lastmod>` : ''}
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
    ${(item.alternates ?? []).map(([locale, href]) => `<xhtml:link rel="alternate" hreflang="${escapeXml(locale)}" href="${escapeXml(href)}" />`).join('\n    ')}
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
}

function renderSitemapIndex(shards) {
  const body = shards
    .map(
      (shard) => `  <sitemap>
    <loc>${escapeXml(`${SITE.url}/sitemaps/${shard.name}`)}</loc>
    <lastmod>${escapeXml(shard.lastmod)}</lastmod>
  </sitemap>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;
}

// /sitemap.xml stays the single entry point but is now an index over shards of
// at most SITEMAP_SHARD_SIZE URLs, so the blog can keep growing past the 50k
// URL / 50MB per-file sitemap limits.
function buildSitemapShards(posts, topics, topicIndex, libraryItems) {
  const now = new Date().toISOString();

  // lastmod has to stay stable between deploys. Stamping build time on every
  // page URL told each crawler that all 375 of them had changed on every push.
  // A route now dates itself from the content it renders, and a route whose
  // data is fetched at view time carries no lastmod at all — the tag is
  // optional, and a wrong one is worse than a missing one.
  const publishedAt = new Map(posts.map((post) => [post.slug, post.metadata.publishedAt]));
  const newest = (values) => {
    const latest = values.filter(Boolean).sort().at(-1);
    return latest ? new Date(latest).toISOString() : undefined;
  };
  const newestPost = newest([...publishedAt.values()]);
  const quotesAsOf = newest([QUOTES_AS_OF]);
  const topicLastmod = (slug) => newest((topicIndex[slug] ?? []).map((s) => publishedAt.get(s)));

  const routes = [
    { route: '', lastmod: newestPost, priority: '1.0' },
    { route: '/blog', lastmod: newestPost },
    { route: '/research', lastmod: newestPost, priority: '0.95' },
    { route: '/stocks', lastmod: quotesAsOf },
    { route: '/oscillator', priority: '0.95' },
    { route: '/fund' },
    { route: '/thoughts', lastmod: newestPost },
    { route: '/stack' },
    { route: '/fear' },
    { route: '/watch' },
    { route: '/pulse' },
    { route: '/topics', lastmod: newestPost },
    ...topics.map((topic) => ({ route: `/topics/${topic.slug}`, lastmod: topicLastmod(topic.slug) })),
    ...issuerSlugsWithInstruments().map((issuer) => ({ route: `/stocks/${issuer}`, lastmod: quotesAsOf })),
  ];

  // Instrument pages are reference data rather than reading, so they go in at a
  // lower priority than the pages above and stay out of the feeds entirely.
  const instrumentRoutes = instrumentRouteParams().map(
    ({ issuer, ticker }) => `/stocks/${issuer}/${ticker}`
  );

  const pageItems = routes
    .flatMap(({ route, lastmod, priority }) => LOCALES.map((locale) => ({
      loc: `${SITE.url}${localizeHref(route || '/', locale)}`,
      alternates: LOCALES.map((language) => [language, `${SITE.url}${localizeHref(route || '/', language)}`]),
      lastmod,
      changefreq: 'weekly',
      priority: priority ?? '0.85',
    })))
    .concat(
      instrumentRoutes.flatMap((route) => LOCALES.map((locale) => ({
        loc: `${SITE.url}${localizeHref(route, locale)}`,
        alternates: LOCALES.map((language) => [language, `${SITE.url}${localizeHref(route, language)}`]),
        lastmod: quotesAsOf,
        // These change when the quote snapshot is refreshed, not daily.
        changefreq: 'weekly',
        priority: '0.6',
      })))
    );

  const shards = [
    {
      name: 'pages.xml',
      lastmod: newest(pageItems.map((item) => item.lastmod)) ?? now,
      body: renderUrlSet(pageItems),
    },
  ];

  for (let start = 0, shard = 1; start < posts.length; start += SITEMAP_SHARD_SIZE, shard += 1) {
    const chunk = posts.slice(start, start + SITEMAP_SHARD_SIZE);
    const items = chunk.map((post) => ({
      loc: `${SITE.url}${articleHref(post.slug, post.metadata.language)}`,
      alternates: Object.entries(post.metadata.translations).map(([locale, slug]) => [locale, `${SITE.url}${articleHref(slug, locale)}`]),
      lastmod: new Date(post.metadata.publishedAt).toISOString(),
      changefreq: 'monthly',
      priority: '0.8',
    }));

    shards.push({
      name: `blog-${String(shard).padStart(4, '0')}.xml`,
      lastmod: items[0]?.lastmod ?? now,
      body: renderUrlSet(items),
    });
  }

  const curated = libraryItems.filter(item => item.detail_enabled);
  for (let start = 0, shard = 1; start < curated.length; start += SITEMAP_SHARD_SIZE, shard += 1) {
    const items = curated.slice(start, start + SITEMAP_SHARD_SIZE).flatMap(item => LOCALES.map(locale => ({
      loc: `${SITE.url}${localizeHref(`/library/items/${item.slug}`, locale)}`,
      alternates: LOCALES.map(language => [language, `${SITE.url}${localizeHref(`/library/items/${item.slug}`, language)}`]),
      lastmod: item.updated_at,
      changefreq: 'monthly',
      priority: '0.7',
    })));
    shards.push({ name: `library-${String(shard).padStart(4, '0')}.xml`, lastmod: items.reduce((latest, item) => item.lastmod > latest ? item.lastmod : latest, items[0].lastmod), body: renderUrlSet(items) });
  }
  return shards;
}

async function writeSitemaps(posts, topics, topicIndex, libraryItems) {
  const shards = buildSitemapShards(posts, topics, topicIndex, libraryItems);
  const expected = new Set(shards.map((shard) => shard.name));

  await fs.mkdir(SITEMAP_DIR, { recursive: true });

  let existing = [];
  try {
    existing = await fs.readdir(SITEMAP_DIR);
  } catch {
    existing = [];
  }

  await Promise.all(
    existing
      .filter((name) => !expected.has(name))
      .map((name) => fs.rm(path.join(SITEMAP_DIR, name), { force: true }))
  );

  await Promise.all(shards.map((shard) => fs.writeFile(path.join(SITEMAP_DIR, shard.name), shard.body, 'utf8')));
  await fs.writeFile(path.join(PUBLIC_DIR, 'sitemap.xml'), renderSitemapIndex(shards), 'utf8');

  return shards.length;
}

function renderRobotsTxt() {
  // A named user-agent group replaces the `*` group rather than extending it:
  // a crawler obeys only its most specific match, so every bot with its own
  // block needs its own Crawl-delay. Googlebot ignores Crawl-delay outright —
  // its rate is set in Search Console, not here.
  const allowedBots = [
    'GPTBot',
    'ChatGPT-User',
    'ClaudeBot',
    'anthropic-ai',
    'PerplexityBot',
    'Google-Extended',
    'Applebot-Extended',
    'Amazonbot',
    'cohere-ai',
  ];
  const disallow = DISALLOWED_PATHS.map((prefix) => `Disallow: ${prefix}`).join('\n');
  const group = (bot) => `User-agent: ${bot}\nAllow: /\n${disallow}\nCrawl-delay: ${CRAWL_DELAY_SECONDS}`;

  return `User-agent: *
Allow: /
${disallow}
Crawl-delay: ${CRAWL_DELAY_SECONDS}

${allowedBots.map(group).join('\n\n')}

${BLOCKED_BOTS.map((bot) => `User-agent: ${bot}\nDisallow: /`).join('\n\n')}

Sitemap: ${SITE.url}/sitemap.xml
Host: ${SITE.url}
`;
}

function renderManifest() {
  return JSON.stringify(
    {
      name: `${SITE.name} Portfolio`,
      short_name: SITE.name,
      description: SITE.description,
      start_url: '/',
      display: 'standalone',
      background_color: '#0b0f1a',
      theme_color: '#0b0f1a',
      icons: [
        {
          src: '/favicon.ico',
          sizes: 'any',
          type: 'image/x-icon',
        },
      ],
    },
    null,
    2
  );
}

function renderOgSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="bg" cx="22%" cy="18%" r="90%">
      <stop offset="0%" stop-color="#1f2937"/>
      <stop offset="42%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="64" y="64" width="210" height="54" rx="27" fill="none" stroke="rgba(248,250,252,0.38)" stroke-width="1.5"/>
  <text x="90" y="99" fill="#f8fafc" font-family="Inter, Arial, sans-serif" font-size="24">kkdemian.com</text>
  <text x="64" y="376" fill="#f8fafc" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="700">kkdemian</text>
  <text x="64" y="452" fill="#e2e8f0" font-family="Inter, Arial, sans-serif" font-size="34">Web3 Product Engineer</text>
  <text x="64" y="506" fill="#cbd5e1" font-family="Inter, Arial, sans-serif" font-size="30">Crypto Research - Builder</text>
</svg>`;
}

async function main() {
  const started = Date.now();
  const [posts, topics, topicIndex, library] = await Promise.all([
    loadPosts(),
    loadTopics(),
    loadTopicIndex(),
    readCurrentLibrary(ROOT),
  ]);
  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  const [shardCount] = await Promise.all([
    writeSitemaps(posts, topics, topicIndex, library.items),
    ...LOCALES.map((locale) => fs.writeFile(path.join(PUBLIC_DIR, `rss-${locale}.xml`), renderRss(posts.filter((post) => post.metadata.language === locale), locale), 'utf8')),
    fs.writeFile(path.join(PUBLIC_DIR, 'rss.xml'), renderRss(posts), 'utf8'),
    fs.writeFile(path.join(PUBLIC_DIR, 'llms.txt'), renderLlmsTxt(posts), 'utf8'),
    fs.writeFile(path.join(PUBLIC_DIR, 'robots.txt'), renderRobotsTxt(), 'utf8'),
    fs.writeFile(path.join(PUBLIC_DIR, 'manifest.webmanifest'), renderManifest(), 'utf8'),
    fs.writeFile(path.join(PUBLIC_DIR, 'og.svg'), renderOgSvg(), 'utf8'),
  ]);

  const elapsed = ((Date.now() - started) / 1000).toFixed(2);
  console.log(
    `Generated static assets for ${posts.length} posts (${shardCount} sitemap files) in ${elapsed}s.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
