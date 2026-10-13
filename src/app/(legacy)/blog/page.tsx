import { localizedPageMetadata } from '@/lib/localized-metadata';
import { getBlogPosts, getPostsForTopic, getPostHref } from '@/data/blog';
import { TOPICS } from '@/data/topics';
import { getTranslator, type Locale } from '@/lib/i18n';
import { DATA } from '@/data/resume';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import BlogClient from './blog-client';

export const metadata: Metadata = localizedPageMetadata('/blog', 'en', {
  title: 'Blog',
  description: 'My thoughts on software development, life, crypto, and more.',
  alternates: {
    canonical: `${DATA.url}/blog`
  },
  openGraph: {
    title: `Blog | ${DATA.name}`,
    description: 'My thoughts on software development, life, crypto, and more.',
    url: `${DATA.url}/blog`,
    siteName: DATA.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${DATA.url}/og.svg`,
        width: 1200,
        height: 630,
        alt: `${DATA.name} blog`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `Blog | ${DATA.name}`,
    description: 'My thoughts on software development, life, crypto, and more.',
    creator: '@0xkkdemian',
    images: [`${DATA.url}/og.svg`]
  }
});

export async function renderPage(locale: Locale) {
  const t = getTranslator(locale);
  // blog-index.json is already sorted newest-first by the content compiler.
  const posts = await getBlogPosts();
  const sortedPosts = posts;
  const topicPostSlugs = Object.fromEntries(TOPICS.map((topic) => [topic.slug, getPostsForTopic(topic.slug).map((post) => post.slug)]));

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${DATA.name} Blog`,
    description: t('My thoughts on software development, life, crypto, and more.', '关于软件开发、生活与加密资产的思考。', 'ソフトウェア開発、暮らし、暗号資産についての考察。'),
    inLanguage: locale,
    url: `${DATA.url}/${locale}/blog`,
    author: {
      '@type': 'Person',
      name: DATA.name,
      url: DATA.url,
    },
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${DATA.name} Blog Posts`,
    description: 'Articles on Web3, DeFi, crypto investing, and blockchain technology.',
    url: `${DATA.url}/${locale}/blog`,
    itemListElement: sortedPosts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${DATA.url}${getPostHref(post, post.metadata.language)}`,
      name: post.metadata.title,
    })),
  };

  return (
    <div className='relative left-1/2 min-h-[100dvh] w-screen -translate-x-1/2 overflow-x-clip'>
      <div className='pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(241,245,249,0.92)_38%,rgba(248,250,252,1)_100%)] dark:bg-[linear-gradient(180deg,rgba(2,6,23,1)_0%,rgba(7,17,33,0.96)_38%,rgba(2,6,23,1)_100%)]' />
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_12%_14%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.14),transparent_24%),radial-gradient(circle_at_50%_22%,rgba(99,102,241,0.1),transparent_32%)] dark:bg-[radial-gradient(circle_at_12%_14%,rgba(56,189,248,0.2),transparent_28%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.16),transparent_22%),radial-gradient(circle_at_50%_22%,rgba(59,130,246,0.14),transparent_34%)]' />
      <div className='relative mx-auto w-full max-w-4xl px-4 pb-dock-safe pt-6 sm:px-6 sm:pb-dock-safe-lg sm:pt-10 lg:px-8'>
        <script
          type='application/ld+json'
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
        />
        <script
          type='application/ld+json'
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
        <Suspense>
          <BlogClient posts={posts} topicPostSlugs={topicPostSlugs} />
        </Suspense>
      </div>
    </div>
  );
}

export default async function BlogPage() {
  return renderPage('en');
}
