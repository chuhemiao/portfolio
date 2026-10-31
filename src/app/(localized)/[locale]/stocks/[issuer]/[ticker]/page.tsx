import { instrumentPageMetadata, renderInstrumentPage } from '@/components/stocks/instrument-view';
import { instrumentRouteParams } from '@/data/instruments';
import { LOCALES, type Locale } from '@/lib/i18n';

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => instrumentRouteParams().map((params) => ({ locale, ...params })));
}

type Props = { params: Promise<{ locale: Locale; issuer: string; ticker: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, issuer, ticker } = await params;
  return instrumentPageMetadata(issuer, ticker, locale);
}

export default async function Page({ params }: Props) {
  const { locale, issuer, ticker } = await params;
  return renderInstrumentPage(issuer, ticker, locale);
}
