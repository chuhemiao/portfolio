import SiteDocument, { metadata as baseMetadata } from '@/components/site-document';
import { localizedPageMetadata } from '@/lib/localized-metadata';
export const metadata = localizedPageMetadata('/', 'en', baseMetadata);
export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteDocument locale="en">{children}</SiteDocument>;
}
