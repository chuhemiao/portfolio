import FearClient from './fear-client';
import { DATA } from '@/data/resume';
import { getFearDashboardData } from '@/lib/fear-data';
import type { Metadata } from 'next';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Fear',
  description:
    'Bitcoin bottom-fishing index dashboard across valuation, on-chain activity, sentiment, macro environment, and volatility risk.',
  alternates: {
    canonical: `${DATA.url}/fear`
  },
  openGraph: {
    title: `Fear | ${DATA.name}`,
    description:
      'Bitcoin bottom-fishing index dashboard across valuation, on-chain activity, sentiment, macro environment, and volatility risk.',
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
      'Bitcoin bottom-fishing index dashboard across valuation, on-chain activity, sentiment, macro environment, and volatility risk.',
    creator: '@0xkkdemian',
    images: [`${DATA.url}/og?title=${encodeURIComponent('Fear')}`]
  }
};

export default async function FearPage() {
  const data = await getFearDashboardData();
  return <FearClient data={data} />;
}
