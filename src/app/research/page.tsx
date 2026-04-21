import ResearchClient from './research-client';
import { DATA } from '@/data/resume';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research',
  description: 'Deep-dive investment research reports on 60+ crypto projects — exchanges, DeFi, L1/L2, ZK, AI/DePIN, RWA, and more.',
  alternates: {
    canonical: `${DATA.url}/research`
  },
  openGraph: {
    title: `Research | ${DATA.name}`,
    description: 'Deep-dive investment research reports on 60+ crypto projects.',
    url: `${DATA.url}/research`,
    siteName: DATA.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${DATA.url}/og?title=${encodeURIComponent('Research')}`,
        width: 1200,
        height: 630,
        alt: `${DATA.name} research page`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `Research | ${DATA.name}`,
    description: 'Deep-dive investment research reports on 60+ crypto projects.',
    creator: '@0xkkdemian',
    images: [`${DATA.url}/og?title=${encodeURIComponent('Research')}`]
  }
};

export default function ResearchPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'kkdemian Research Map',
    description: 'Deep-dive investment research on 60+ crypto projects across exchanges, DeFi, L1/L2, ZK, AI/DePIN, RWA, and market structure.',
    url: `${DATA.url}/research`,
    author: { '@type': 'Person', name: DATA.name, url: DATA.url },
    about: [
      { '@type': 'Thing', name: 'Cryptocurrency Research' },
      { '@type': 'Thing', name: 'DeFi Protocol Analysis' },
      { '@type': 'Thing', name: 'Bitcoin Market Structure' }
    ]
  };
  return (
    <>
      <script type='application/ld+json' suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ResearchClient />
    </>
  );
}
