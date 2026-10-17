import { localizedPageMetadata } from '@/lib/localized-metadata';
import { getTranslator, localizeHref, type Locale } from '@/lib/i18n';
import OscillatorClient from './oscillator-client';
import { DATA } from '@/data/resume';
import { getOscillatorData } from '@/lib/oscillator-data';
import type { Metadata } from 'next';

export const metadata: Metadata = localizedPageMetadata('/oscillator', 'en', {
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
        url: `${DATA.url}/og.svg`,
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
    images: [`${DATA.url}/og.svg`]
  }
});

export default async function OscillatorPage() {
  return renderPage('en');
}

export async function renderPage(locale: Locale) {
  const t = getTranslator(locale);
  const jsonLd = {
    inLanguage: locale,
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t('kkdemian Oscillator — Altcoin Strength Monitor', 'kkdemian 山寨币强弱监测', 'kkdemian アルトコイン強弱モニター'),
    description: t('Altcoin strength monitor using ALT/BTC oscillator thesis. Research watchlist, market breadth table, and BTC market heat index.', '基于 ALT/BTC 震荡指标的山寨币强弱监测，涵盖研究列表、市场广度与 BTC 热度。', 'ALT/BTC に基づくアルトコイン強弱モニター。リサーチ対象、市場の広がり、BTC 過熱度を表示。'),
    url: `${DATA.url}${localizeHref('/oscillator', locale)}`,
    applicationCategory: 'FinanceApplication',
    author: { '@type': 'Person', name: 'kkdemian', url: 'https://kkdemian.com' }
  };
  const data = await getOscillatorData();
  return (
    <div className='relative left-1/2 min-h-[100dvh] w-screen -translate-x-1/2 overflow-x-clip'>
      <div className='relative mx-auto w-full max-w-[1150px] px-4 pb-dock-safe pt-6 sm:px-6 sm:pb-dock-safe-lg sm:pt-10 lg:px-8'>
        <script type='application/ld+json' suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <OscillatorClient data={data} />
      </div>
    </div>
  );
}
