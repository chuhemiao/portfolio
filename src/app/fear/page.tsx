import FearClient from './fear-client';
import { DATA } from '@/data/resume';
import { getFearDashboardData } from '@/lib/fear-data';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Fear',
  description:
    'Bitcoin and crypto market observation dashboard across valuation, on-chain activity, sentiment, macro environment, leverage, and volatility risk.',
  alternates: {
    canonical: `${DATA.url}/fear`
  },
  openGraph: {
    title: `Fear | ${DATA.name}`,
    description:
      'Bitcoin and crypto market observation dashboard across valuation, on-chain activity, sentiment, macro environment, leverage, and volatility risk.',
    url: `${DATA.url}/fear`,
    siteName: DATA.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${DATA.url}/og?title=${encodeURIComponent('Fear')}`,
        width: 1200,
        height: 630,
        alt: `${DATA.name} fear page`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `Fear | ${DATA.name}`,
    description:
      'Bitcoin and crypto market observation dashboard across valuation, on-chain activity, sentiment, macro environment, leverage, and volatility risk.',
    creator: '@0xkkdemian',
    images: [`${DATA.url}/og?title=${encodeURIComponent('Fear')}`]
  }
};

export default async function FearPage() {
  const data = await getFearDashboardData();
  return (
    <div className='mx-auto w-full max-w-[1150px] px-4 pb-24 pt-6 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8'>
      <FearClient data={data} />
    </div>
  );
}
