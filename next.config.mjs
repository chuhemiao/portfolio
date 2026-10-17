/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Served by Vercel. Pages are still prerendered through generateStaticParams;
  // dropping `output: 'export'` only restores route handlers, which static
  // export forbids. The Cloudflare Worker that briefly owned /api is retired.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // These used to live in a Cloudflare `_headers` file, which Vercel never
  // reads — so none of them were in effect. Declared here they are translated
  // into Vercel's route config and actually apply.
  async headers() {
    const cache = (seconds) => ({ key: 'Cache-Control', value: `public, max-age=${seconds}` });
    const type = (value) => ({ key: 'Content-Type', value });
    const rss = [type('application/rss+xml; charset=utf-8'), cache(3600)];
    const xml = [type('application/xml; charset=utf-8'), cache(3600)];
    const text = (seconds) => [type('text/plain; charset=utf-8'), cache(seconds)];

    return [
      { source: '/:path*', headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }] },
      { source: '/rss.xml', headers: rss },
      { source: '/rss-:lang.xml', headers: rss },
      { source: '/sitemap.xml', headers: xml },
      { source: '/sitemaps/:path*', headers: xml },
      { source: '/llms.txt', headers: text(86400) },
      { source: '/robots.txt', headers: text(3600) },
      {
        source: '/manifest.webmanifest',
        headers: [type('application/manifest+json; charset=utf-8'), cache(86400)],
      },
    ];
  },

  images: {
    unoptimized: true,
  },
  experimental: {
    // Content is precompiled into .generated, so each exported page is a cheap
    // template render. Keep per-worker concurrency modest so CI runners with
    // little memory stay well clear of OOM.
    staticGenerationMaxConcurrency: 4,
    staticGenerationMinPagesPerWorker: 50,
  },
};

export default nextConfig;
