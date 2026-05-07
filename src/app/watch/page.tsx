import WatchClient from './watch-client';
import { DATA } from '@/data/resume';
import { getWatchData } from '@/lib/watch-data';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Watch',
  description:
    'Crypto exchange listing intelligence. Monitor new spot listings, futures, pre-market, Alpha, Launchpool events across Binance, OKX, Bybit, Bitget, Coinbase, Upbit, Hyperliquid.',
  alternates: {
    canonical: `${DATA.url}/watch`
  },
  openGraph: {
    title: `Watch | ${DATA.name}`,
    description:
      'Crypto exchange listing intelligence — track new listings, signal ratings, and cross-exchange patterns across 7 major venues.',
    url: `${DATA.url}/watch`,
    siteName: DATA.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${DATA.url}/og?title=${encodeURIComponent('Watch')}`,
        width: 1200,
        height: 630,
        alt: `${DATA.name} watch page`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `Watch | ${DATA.name}`,
    description:
      'Crypto exchange listing intelligence — track new listings, signal ratings, and cross-exchange patterns.',
    creator: '@0xkkdemian',
    images: [`${DATA.url}/og?title=${encodeURIComponent('Watch')}`]
  }
};

export default async function WatchPage() {
  const data = await getWatchData();
  return <WatchClient data={data} />;
}
