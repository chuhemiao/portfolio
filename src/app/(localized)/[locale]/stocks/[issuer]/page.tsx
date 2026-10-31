import { issuerPageMetadata, issuerPageSlugs, renderIssuerPage } from '@/components/stocks/issuer-view';
import { LOCALES, type Locale } from '@/lib/i18n';

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => issuerPageSlugs().map((issuer) => ({ locale, issuer })));
}

type Props = { params: Promise<{ locale: Locale; issuer: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, issuer } = await params;
  return issuerPageMetadata(issuer, locale);
}

export default async function Page({ params }: Props) {
  const { locale, issuer } = await params;
  return renderIssuerPage(issuer, locale);
}
