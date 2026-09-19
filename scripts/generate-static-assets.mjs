import fs from 'node:fs/promises';
import path from 'node:path';

import { BLOG_INDEX_FILE, ROOT } from './lib/content/paths.mjs';

const PUBLIC_DIR = path.join(ROOT, 'public');
const SITEMAP_DIR = path.join(PUBLIC_DIR, 'sitemaps');
const SITEMAP_SHARD_SIZE = 5000;

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
    },
  }));
}

function renderRss(posts) {
  const latestPost = posts[0];
  const lastBuildDate = latestPost
    ? new Date(latestPost.metadata.publishedAt).toUTCString()
    : new Date().toUTCString();

  const items = posts
    .map((post) => {
      const postUrl = `${SITE.url}/blog/${post.slug}`;
      return `<item>
  <title>${escapeXml(post.metadata.title)}</title>
  <link>${postUrl}</link>
  <guid>${postUrl}</guid>
  <pubDate>${new Date(post.metadata.publishedAt).toUTCString()}</pubDate>
  <description>${escapeXml(post.metadata.summary)}</description>
</item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(SITE.name)} Blog</title>
  <link>${SITE.url}/blog</link>
  <description>${escapeXml(SITE.description)}</description>
  <language>en-us</language>
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
        `- [${post.metadata.title}](${SITE.url}/blog/${post.slug})${
          post.metadata.summary ? `: ${post.metadata.summary}` : ''
        }`
    )
    .join('\n');

  return `# ${SITE.name}

> ${SITE.description}

${SITE.summary}

## Pages

- [Home](${SITE.url}/): Personal portfolio, current roles, work history, projects, and philosophy
- [Research](${SITE.url}/research): Deep-dive investment research on crypto projects across exchanges, DeFi, L1/L2, ZK, AI/DePIN, RWA, and market structure
- [Oscillator](${SITE.url}/oscillator): Altcoin strength monitor using ALT/BTC oscillator thesis
- [Watch](${SITE.url}/watch): Exchange listing intelligence across major crypto venues
- [Pulse](${SITE.url}/pulse): Web3 market intelligence dashboard synced from local content snapshots
- [Fear](${SITE.url}/fear): Bitcoin and crypto market regime dashboard
- [Fund](${SITE.url}/fund): Live capital map and conviction tracker
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
    <loc>${escapeXml(item.loc)}</loc>
    <lastmod>${escapeXml(item.lastmod)}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
function buildSitemapShards(posts) {
  const now = new Date().toISOString();
  const routes = [
    '',
    '/blog',
    '/research',
    '/oscillator',
    '/fund',
    '/thoughts',
    '/stack',
    '/fear',
    '/watch',
    '/pulse',
    '/topics',
  ];

  const shards = [
    {
      name: 'pages.xml',
      lastmod: now,
      body: renderUrlSet(
        routes.map((route) => ({
          loc: `${SITE.url}${route}`,
          lastmod: now,
          changefreq: 'weekly',
          priority:
            route === '' ? '1.0' : route === '/research' || route === '/oscillator' ? '0.95' : '0.85',
        }))
      ),
    },
  ];

  for (let start = 0, shard = 1; start < posts.length; start += SITEMAP_SHARD_SIZE, shard += 1) {
    const chunk = posts.slice(start, start + SITEMAP_SHARD_SIZE);
    const items = chunk.map((post) => ({
      loc: `${SITE.url}/blog/${post.slug}`,
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

  return shards;
}

async function writeSitemaps(posts) {
  const shards = buildSitemapShards(posts);
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

  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /private/

${allowedBots.map((bot) => `User-agent: ${bot}\nAllow: /`).join('\n\n')}

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

function renderHeaders() {
  return `/*
  X-Content-Type-Options: nosniff

/rss.xml
  Content-Type: application/rss+xml; charset=utf-8
  Cache-Control: public, max-age=3600

/llms.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=86400

/sitemap.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600

/sitemaps/*
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600

/robots.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=3600

/manifest.webmanifest
  Content-Type: application/manifest+json; charset=utf-8
  Cache-Control: public, max-age=86400

/og.svg
  Content-Type: image/svg+xml; charset=utf-8
  Cache-Control: public, max-age=86400

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/article/*
  Cache-Control: public, max-age=31536000, immutable

/research-logos/*
  Cache-Control: public, max-age=31536000, immutable
`;
}

async function main() {
  const started = Date.now();
  const posts = await loadPosts();
  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  const [shardCount] = await Promise.all([
    writeSitemaps(posts),
    fs.writeFile(path.join(PUBLIC_DIR, 'rss.xml'), renderRss(posts), 'utf8'),
    fs.writeFile(path.join(PUBLIC_DIR, 'llms.txt'), renderLlmsTxt(posts), 'utf8'),
    fs.writeFile(path.join(PUBLIC_DIR, 'robots.txt'), renderRobotsTxt(), 'utf8'),
    fs.writeFile(path.join(PUBLIC_DIR, 'manifest.webmanifest'), renderManifest(), 'utf8'),
    fs.writeFile(path.join(PUBLIC_DIR, 'og.svg'), renderOgSvg(), 'utf8'),
    fs.writeFile(path.join(PUBLIC_DIR, '_headers'), renderHeaders(), 'utf8'),
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
