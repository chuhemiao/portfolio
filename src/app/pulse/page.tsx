import PulseClient from './pulse-client';
import { DATA } from '@/data/resume';
import { getPulseData } from '@/lib/pulse-data';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pulse',
  description:
    'Web3 market intelligence dashboard — social mindshare, prediction markets, crypto news and risk signals in one place.',
  alternates: {
    canonical: `${DATA.url}/pulse`
  },
  openGraph: {
    title: `Pulse | ${DATA.name}`,
    description:
      'Real-time Web3 market pulse — mindshare ranking, Polymarket flows, news and risk feed.',
    url: `${DATA.url}/pulse`,
    siteName: DATA.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${DATA.url}/og?title=${encodeURIComponent('Pulse')}`,
        width: 1200,
        height: 630,
        alt: `${DATA.name} pulse page`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `Pulse | ${DATA.name}`,
    description:
      'Real-time Web3 market pulse — mindshare, prediction markets, news, risk.',
    creator: '@0xkkdemian',
    images: [`${DATA.url}/og?title=${encodeURIComponent('Pulse')}`]
  }
};

export default async function PulsePage() {
  const data = await getPulseData();
  return <PulseClient data={data} />;
}
