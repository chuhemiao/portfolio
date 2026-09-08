import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content');
const BLOG_CONTENT_DIR = path.join(CONTENT_DIR, 'blog');
const PUBLIC_DIR = path.join(ROOT, 'public');
const DRAFT_DIRS = new Set(['drafts', '_drafts']);

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

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getMdxFiles(dir) {
  if (!(await pathExists(dir))) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getMdxFiles(fullPath)));
    } else if (entry.isFile() && path.extname(entry.name) === '.mdx') {
      files.push(fullPath);
    }
  }

  return files;
}

async function getLegacyRootMdxFiles() {
  if (!(await pathExists(CONTENT_DIR))) return [];
  const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && path.extname(entry.name) === '.mdx')
    .map((entry) => path.join(CONTENT_DIR, entry.name));
}

function normalizeSlug(slug) {
  return String(slug ?? '').trim().replace(/^\/+|\/+$/g, '');
}

function isDraftPath(filePath) {
  const relativePath = path.relative(CONTENT_DIR, filePath);
  return relativePath
    .split(path.sep)
    .map((segment) => segment.toLowerCase())
    .some((segment) => DRAFT_DIRS.has(segment));
}

function isDraftPost(metadata, filePath) {
  return (
    isDraftPath(filePath) ||
    metadata.draft === true ||
    (typeof metadata.status === 'string' &&
      metadata.status.toLowerCase() === 'draft')
  );
}

function resolveSlug(filePath, metadata) {
  const fallback = path.basename(filePath, path.extname(filePath));
  const slug = normalizeSlug(metadata.slug || fallback);
  if (!slug) {
    throw new Error(`Empty slug in ${path.relative(ROOT, filePath)}`);
  }
  if (slug.includes('/')) {
    throw new Error(`Nested slug "${slug}" in ${path.relative(ROOT, filePath)}`);
  }
  return slug;
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sortNewestFirst(a, b) {
  return (
    new Date(b.metadata.publishedAt).getTime() -
    new Date(a.metadata.publishedAt).getTime()
  );
}

async function loadPosts() {
  const files = [...(await getLegacyRootMdxFiles()), ...(await getMdxFiles(BLOG_CONTENT_DIR))];
  const seen = new Map();
  const posts = [];

  for (const filePath of files) {
    const source = await fs.readFile(filePath, 'utf8');
    const { data } = matter(source);
    if (isDraftPost(data, filePath)) continue;

    const slug = resolveSlug(filePath, data);
    const existing = seen.get(slug);
    if (existing) {
      throw new Error(
        `Duplicate slug "${slug}" in ${path.relative(ROOT, existing)} and ${path.relative(ROOT, filePath)}`
      );
    }

    seen.set(slug, filePath);
    posts.push({
      slug,
      metadata: {
        title: data.title || slug,
        publishedAt: data.publishedAt || new Date(0).toISOString(),
        summary: data.summary || '',
        category: data.category || 'tech',
      },
    });
  }

  return posts.sort(sortNewestFirst);
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

function renderSitemap(posts) {
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

  const routeItems = routes.map((route) => ({
    loc: `${SITE.url}${route}`,
    lastmod: now,
    changefreq: 'weekly',
    priority: route === '' ? '1.0' : route === '/research' || route === '/oscillator' ? '0.95' : '0.85',
  }));
  const postItems = posts.map((post) => ({
    loc: `${SITE.url}/blog/${post.slug}`,
    lastmod: new Date(post.metadata.publishedAt).toISOString(),
    changefreq: 'monthly',
    priority: '0.8',
  }));

  const items = [...routeItems, ...postItems]
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
${items}
</urlset>
`;
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
  const posts = await loadPosts();
  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(PUBLIC_DIR, 'rss.xml'), renderRss(posts), 'utf8'),
    fs.writeFile(path.join(PUBLIC_DIR, 'llms.txt'), renderLlmsTxt(posts), 'utf8'),
    fs.writeFile(path.join(PUBLIC_DIR, 'sitemap.xml'), renderSitemap(posts), 'utf8'),
    fs.writeFile(path.join(PUBLIC_DIR, 'robots.txt'), renderRobotsTxt(), 'utf8'),
    fs.writeFile(path.join(PUBLIC_DIR, 'manifest.webmanifest'), renderManifest(), 'utf8'),
    fs.writeFile(path.join(PUBLIC_DIR, 'og.svg'), renderOgSvg(), 'utf8'),
    fs.writeFile(path.join(PUBLIC_DIR, '_headers'), renderHeaders(), 'utf8'),
  ]);

  console.log(`Generated static assets for ${posts.length} posts.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
