import { getBlogPosts } from '@/data/blog';
import { DATA } from '@/data/resume';
import type { Metadata } from 'next';
import BlogClient from './blog-client';

export const metadata: Metadata = {
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
        url: `${DATA.url}/og?title=${encodeURIComponent('Blog')}`,
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
    images: [`${DATA.url}/og?title=${encodeURIComponent('Blog')}`]
  }
};

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${DATA.name} Blog`,
    description: 'My thoughts on software development, life, crypto, and more.',
    url: `${DATA.url}/blog`
  };

  return (
    <>
      <script
        type='application/ld+json'
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <BlogClient posts={posts} />
    </>
  );
}
