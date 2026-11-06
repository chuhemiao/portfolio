import { localizedPageMetadata } from '@/lib/localized-metadata';
import { getBlogPosts, getPostsForTopic, getPostHref, getLocalizedPosts } from '@/data/blog';
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

const JSON_LD_ITEM_LIMIT = 100;

export async function renderPage(locale: Locale) {
  const t = getTranslator(locale);
  // blog-index.json is already sorted newest-first by the content compiler.
  const posts = await getBlogPosts();
  const sortedPosts = getLocalizedPosts(posts, locale);
  // Only the fields BlogClient filters and renders on cross the wire. The index
  // also carries build-internal ones (artifact, contentHash, sourcePath,
  // translationSlug) that added ~2 MB to every render of this page and put the
  // repository layout in the payload.
  const listPosts = posts.map((post) => ({
    slug: post.slug,
    metadata: {
      title: post.metadata.title,
      summary: post.metadata.summary,
      publishedAt: post.metadata.publishedAt,
      language: post.metadata.language,
      category: post.metadata.category,
      translationKey: post.metadata.translationKey,
      sourceSlug: post.metadata.sourceSlug,
      translations: post.metadata.translations,
    },
  }));
  const topicPostSlugs = Object.fromEntries(TOPICS.map((topic) => [topic.slug, getPostsForTopic(topic.slug).map((post) => post.slug)]));

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${DATA.name} ${t('Blog', '博客', 'ブログ')}`,
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
    name: `${DATA.name} ${t('Blog Posts', '博客文章', 'ブログ記事')}`,
    description: t('Articles on Web3, DeFi, crypto investing, and blockchain technology.', '关于 Web3、DeFi、加密资产投资和区块链技术的文章。', 'Web3、DeFi、暗号資産投資、ブロックチェーン技術に関する記事。'),
    url: `${DATA.url}/${locale}/blog`,
    // A carousel sample, not a mirror of the archive: every entry here is inline
    // in the HTML of all three locales, and the sitemap already carries the
    // full set for discovery.
    itemListElement: sortedPosts.slice(0, JSON_LD_ITEM_LIMIT).map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${DATA.url}${getPostHref(post, post.metadata.language)}`,
      name: post.metadata.title,
    })),
  };

  return (
    <div className='relative left-1/2 min-h-[100dvh] w-screen -translate-x-1/2 overflow-x-clip'>
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
          <BlogClient posts={listPosts} topicPostSlugs={topicPostSlugs} />
        </Suspense>
      </div>
    </div>
  );
}

export default async function BlogPage() {
  return renderPage('en');
}
