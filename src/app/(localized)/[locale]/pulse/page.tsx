import { renderPage } from '@/app/(legacy)/pulse/page';
import { localizedPageMetadata } from '@/lib/localized-metadata';
import { LOCALES, type Locale } from '@/lib/i18n';

export const dynamicParams = false;
export function generateStaticParams() { return LOCALES.map((locale) => ({ locale })); }

type Props = { params: Promise<{ locale: Locale }> };
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return localizedPageMetadata('/pulse', locale);
}
export default async function Page({ params }: Props) {
  const { locale } = await params;
  return renderPage(locale);
}
