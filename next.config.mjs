/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  distDir: process.env.NEXT_DIST_DIR || '.next',
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
