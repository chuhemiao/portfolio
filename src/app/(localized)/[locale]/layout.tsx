import SiteDocument, { metadata as baseMetadata } from '@/components/site-document';
import { isLocale } from '@/lib/i18n';
import { localizedPageMetadata } from '@/lib/localized-metadata';
import { notFound } from 'next/navigation';

export const dynamicParams = false;
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return localizedPageMetadata('/', locale, baseMetadata);
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <SiteDocument locale={locale}>{children}</SiteDocument>;
}
