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
  return (
    <div className='relative left-1/2 min-h-[100dvh] w-screen -translate-x-1/2 overflow-x-clip'>
      <div className='pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(241,245,249,0.92)_38%,rgba(248,250,252,1)_100%)] dark:bg-[linear-gradient(180deg,rgba(2,6,23,1)_0%,rgba(7,17,33,0.96)_38%,rgba(2,6,23,1)_100%)]' />
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_12%_14%,rgba(234,179,8,0.15),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(249,115,22,0.12),transparent_24%),radial-gradient(circle_at_50%_22%,rgba(168,85,247,0.10),transparent_32%)] dark:bg-[radial-gradient(circle_at_12%_14%,rgba(234,179,8,0.18),transparent_28%),radial-gradient(circle_at_86%_12%,rgba(249,115,22,0.14),transparent_22%),radial-gradient(circle_at_50%_22%,rgba(168,85,247,0.12),transparent_34%)]' />
      <div className='relative mx-auto w-full max-w-[1150px] px-4 pb-24 pt-6 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8'>
        <WatchClient data={data} />
      </div>
    </div>
  );
}
