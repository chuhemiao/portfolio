import { renderPage } from '@/app/(legacy)/topics/[slug]/page';
import { TOPICS, localizedTopic } from '@/data/topics';
import { localizedPageMetadata } from '@/lib/localized-metadata';
import { LOCALES, type Locale } from '@/lib/i18n';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ locale: Locale; slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return LOCALES.flatMap((locale) => TOPICS.map(({ slug }) => ({ locale, slug }))); }
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const source = TOPICS.find((topic) => topic.slug === slug);
  if (!source) notFound();
  const topic = localizedTopic(source, locale);
  const metadata = localizedPageMetadata(`/topics/${slug}`, locale);
  return { ...metadata, title: topic.name, description: topic.description, openGraph: { ...metadata.openGraph, title: topic.name, description: topic.description }, twitter: { ...metadata.twitter, title: topic.name, description: topic.description } };
}
export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  return renderPage(locale, slug);
}
