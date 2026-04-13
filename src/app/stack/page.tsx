import StackClient from './stack-client';
import { DATA } from '@/data/resume';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stack',
  description:
    'My tech stack: crypto cards, recommended books, data sources, and AI tools.',
  alternates: {
    canonical: `${DATA.url}/stack`
  },
  openGraph: {
    title: `Stack | ${DATA.name}`,
    description:
      'My tech stack: crypto cards, recommended books, data sources, and AI tools.',
    url: `${DATA.url}/stack`,
    siteName: DATA.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${DATA.url}/og?title=${encodeURIComponent('Stack')}`,
        width: 1200,
        height: 630,
        alt: `${DATA.name} stack page`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `Stack | ${DATA.name}`,
    description:
      'My tech stack: crypto cards, recommended books, data sources, and AI tools.',
    creator: '@0xkkdemian',
    images: [`${DATA.url}/og?title=${encodeURIComponent('Stack')}`]
  }
};

export default function StackPage() {
  return (
    <div className='mx-auto w-full max-w-[1150px] px-4 pb-24 pt-6 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8'>
      <StackClient />
    </div>
  );
}
