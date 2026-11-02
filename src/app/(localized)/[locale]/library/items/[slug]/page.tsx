import { notFound } from 'next/navigation';
import { LibraryItemView } from '@/components/library/item-view';
import { getLibrarySnapshot } from '@/lib/library/catalog';
import { libraryItemMetadata } from '@/lib/library/metadata';
import { LOCALES, type Locale } from '@/lib/i18n';

type Props = { params: Promise<{ locale: Locale; slug: string }> };
export const dynamicParams = false;
export async function generateStaticParams() { const items = (await getLibrarySnapshot()).items.filter(item => item.detail_enabled); return LOCALES.flatMap(locale => items.map(({ slug }) => ({ locale, slug }))); }
export async function generateMetadata({ params }: Props) { const { locale, slug } = await params; const item = (await getLibrarySnapshot()).items.find(item => item.slug === slug && item.detail_enabled); if (!item) notFound(); return libraryItemMetadata(item, locale); }
export default async function Page({ params }: Props) { const { locale, slug } = await params; return <LibraryItemView locale={locale} slug={slug} />; }
