import { localizedPageMetadata } from '@/lib/localized-metadata';
import { getTranslator, localizeHref, type Locale } from '@/lib/i18n';
import FundClient from './fund-client';
import { DATA } from '@/data/resume';
import type { Metadata } from 'next';

export const metadata: Metadata = localizedPageMetadata('/fund', 'en', {
  title: 'Fund',
  description:
    'Investment portfolio: crypto assets, L1s, stablecoin crypto cards, infrastructure, US stocks, and trading platforms.',
  alternates: {
    canonical: `${DATA.url}/fund`
  },
  openGraph: {
    title: `Fund | ${DATA.name}`,
    description:
      'Investment portfolio: crypto assets, L1s, stablecoin crypto cards, infrastructure, US stocks, and trading platforms.',
    url: `${DATA.url}/fund`,
    siteName: DATA.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${DATA.url}/og.svg`,
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
      'Investment portfolio: crypto assets, L1s, stablecoin crypto cards, infrastructure, US stocks, and trading platforms.',
    creator: '@0xkkdemian',
    images: [`${DATA.url}/og.svg`]
  }
});

export default function FundPage() {
  return renderPage('en');
}

export function renderPage(locale: Locale) {
  const t = getTranslator(locale);
  const jsonLd = {
    inLanguage: locale,
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('kkdemian Fund — Capital Map', 'kkdemian 投资组合 — 资本配置图', 'kkdemian 投資ポートフォリオ — 資本配分マップ'),
    description: t('Live capital allocation map covering crypto assets, L1s, stablecoin crypto cards, DeFi infrastructure, US equities, and prediction markets.', '资本配置图，覆盖加密资产、公链、稳定币卡、DeFi 基础设施、美股与预测市场。', '暗号資産、L1、ステーブルコインカード、DeFi インフラ、米国株、予測市場の資本配分マップ。'),
    url: `${DATA.url}${localizeHref('/fund', locale)}`,
    author: { '@type': 'Person', name: 'kkdemian', url: 'https://kkdemian.com' }
  };
  return (
    <div className='relative left-1/2 min-h-[100dvh] w-screen -translate-x-1/2 overflow-x-clip'>
      <div className='relative mx-auto w-full max-w-[1150px] px-4 pb-dock-safe pt-6 sm:px-6 sm:pb-dock-safe-lg sm:pt-10 lg:px-8'>
        <script type='application/ld+json' suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <FundClient />
      </div>
    </div>
  );
}
