import { generateMetadata as articleMetadata, renderPage } from '@/components/blog/article-view';
import { getBlogPosts, getPostMeta } from '@/data/blog';
import type { Locale } from '@/lib/i18n';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ locale: Locale; slug: string }> };
export const dynamicParams = false;
export async function generateStaticParams() {
  return (await getBlogPosts()).map((post) => ({ locale: post.metadata.language, slug: post.slug }));
}
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const post = getPostMeta(slug);
  if (!post || post.metadata.language !== locale) notFound();
  return articleMetadata({ params: Promise.resolve({ slug }) });
}
export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const post = getPostMeta(slug);
  if (!post || post.metadata.language !== locale) notFound();
  return renderPage(locale, slug);
}
