import { LibraryPage } from '@/components/library/library-page';
import { libraryIndexMetadata } from '@/lib/library/metadata';
import { LOCALES, type Locale } from '@/lib/i18n';

export const dynamicParams = false;
export function generateStaticParams() { return LOCALES.map(locale => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) { return libraryIndexMetadata((await params).locale); }
export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) { return <LibraryPage locale={(await params).locale} />; }
