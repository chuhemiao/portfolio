import { notFound } from 'next/navigation';
import { LibraryItemView } from '@/components/library/item-view';
import { getLibrarySnapshot } from '@/lib/library/catalog';
import { libraryItemMetadata } from '@/lib/library/metadata';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export async function generateStaticParams() { return (await getLibrarySnapshot()).items.filter(item => item.detail_enabled).map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props) { const { slug } = await params; const item = (await getLibrarySnapshot()).items.find(item => item.slug === slug && item.detail_enabled); if (!item) notFound(); return libraryItemMetadata(item, 'en'); }
export default async function Page({ params }: Props) { return <LibraryItemView locale="en" slug={(await params).slug} />; }
