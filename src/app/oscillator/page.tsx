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
    <div className='mx-auto w-full max-w-[1150px] px-4 pb-24 pt-6 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8'>
      <OscillatorClient data={data} />
    </div>
  );
}
