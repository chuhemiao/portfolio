import OscillatorClient from './oscillator-client';
import { DATA } from '@/data/resume';
import { getOscillatorData } from '@/lib/oscillator-data';
import type { Metadata } from 'next';

export const revalidate = 604800;

export const metadata: Metadata = {
  title: 'Oscillator',
  description:
    'Altcoin strength monitor based on ALT/BTC oscillator thesis. Exchange rate is the truth, USD price is the illusion.',
  alternates: {
    canonical: `${DATA.url}/oscillator`
  },
  openGraph: {
    title: `Oscillator | ${DATA.name}`,
    description:
      'Altcoin strength monitor based on ALT/BTC oscillator thesis.',
    url: `${DATA.url}/oscillator`,
    siteName: DATA.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${DATA.url}/og?title=${encodeURIComponent('Oscillator')}`,
        width: 1200,
        height: 630,
        alt: `${DATA.name} oscillator page`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `Oscillator | ${DATA.name}`,
    description:
      'Altcoin strength monitor based on ALT/BTC oscillator thesis.',
    creator: '@0xkkdemian',
    images: [`${DATA.url}/og?title=${encodeURIComponent('Oscillator')}`]
  }
};

export default async function OscillatorPage() {
  const data = await getOscillatorData();
  return (
    <div className='relative left-1/2 min-h-[100dvh] w-screen -translate-x-1/2 overflow-x-clip'>
      <div className='pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(241,245,249,0.92)_38%,rgba(248,250,252,1)_100%)] dark:bg-[linear-gradient(180deg,rgba(2,6,23,1)_0%,rgba(7,17,33,0.96)_38%,rgba(2,6,23,1)_100%)]' />
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_12%_14%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.14),transparent_24%),radial-gradient(circle_at_50%_22%,rgba(99,102,241,0.1),transparent_32%)] dark:bg-[radial-gradient(circle_at_12%_14%,rgba(56,189,248,0.2),transparent_28%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.16),transparent_22%),radial-gradient(circle_at_50%_22%,rgba(59,130,246,0.14),transparent_34%)]' />
      <div className='relative mx-auto w-full max-w-[1150px] px-4 pb-24 pt-6 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8'>
        <OscillatorClient data={data} />
      </div>
    </div>
  );
}
