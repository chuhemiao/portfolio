import FundClient from './fund-client';
import { DATA } from '@/data/resume';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fund',
  description:
    'Investment portfolio: crypto assets, L1s, infrastructure, US stocks, and trading platforms.',
  alternates: {
    canonical: `${DATA.url}/fund`
  },
  openGraph: {
    title: `Fund | ${DATA.name}`,
    description:
      'Investment portfolio: crypto assets, L1s, infrastructure, US stocks, and trading platforms.',
    url: `${DATA.url}/fund`,
    siteName: DATA.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${DATA.url}/og?title=${encodeURIComponent('Fund')}`,
        width: 1200,
        height: 630,
        alt: `${DATA.name} fund page`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `Fund | ${DATA.name}`,
    description:
      'Investment portfolio: crypto assets, L1s, infrastructure, US stocks, and trading platforms.',
    creator: '@0xkkdemian',
    images: [`${DATA.url}/og?title=${encodeURIComponent('Fund')}`]
  }
};

export default function FundPage() {
  return (
    <div className='mx-auto w-full max-w-[1150px] px-4 pb-24 pt-6 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8'>
      <FundClient />
    </div>
  );
}
