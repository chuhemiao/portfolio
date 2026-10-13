import SiteDocument, { metadata as baseMetadata } from '@/components/site-document';
import { getPostMeta } from '@/data/blog';
export const metadata = baseMetadata;
export default async function ArticleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SiteDocument locale={getPostMeta(slug)?.metadata.language ?? 'en'}>{children}</SiteDocument>;
}
