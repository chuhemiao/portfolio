import { localizedPageMetadata } from '@/lib/localized-metadata';
import { getBlogPosts, getPostHref, getPostMeta } from '@/data/blog';
import { getTranslator, localizeHref, type Locale } from '@/lib/i18n';
import { PROJECTS } from '@/data/research-projects';
import ResearchClient from './research-client';
import { DATA } from '@/data/resume';
import type { Metadata } from 'next';

export const metadata: Metadata = localizedPageMetadata('/research', 'en');

export default function ResearchPage() { return renderPage('en'); }

export async function renderPage(locale: Locale) {
  const t = getTranslator(locale);
  const posts = await getBlogPosts();
  const projectSlugs = new Set(PROJECTS.map(project => project.slug));
  const postLinks = Object.fromEntries(posts.filter(post => projectSlugs.has(post.slug)).map(post => [post.slug, getPostHref(post, locale)]));
  const usdtPost = getPostMeta('usdt-the-backbone-of-crypto-liquidity');
  if (usdtPost) postLinks['usdt-dominance-stablecoin-king'] = getPostHref(usdtPost, locale);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t('kkdemian Research Map', 'kkdemian 研究地图', 'kkdemian リサーチマップ'),
    inLanguage: locale,
    description: t('Deep-dive research across exchanges, DeFi, L1/L2, ZK, AI/DePIN, RWA, and market structure.', '交易所、DeFi、L1/L2、ZK、AI/DePIN、RWA 与市场结构深度研究。', '取引所、DeFi、L1/L2、ZK、AI/DePIN、RWA、市場構造の詳細なリサーチ。'),
    url: `${DATA.url}${localizeHref('/research', locale)}`,
    author: { '@type': 'Person', name: DATA.name, url: DATA.url },
    about: [
      { '@type': 'Thing', name: 'Cryptocurrency Research' },
      { '@type': 'Thing', name: 'DeFi Protocol Analysis' },
      { '@type': 'Thing', name: 'Bitcoin Market Structure' }
    ]
  };
  return (
    <>
      <script type='application/ld+json' suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ResearchClient postLinks={postLinks} />
    </>
  );
}
