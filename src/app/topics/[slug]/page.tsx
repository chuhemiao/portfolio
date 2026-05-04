import BlurFade from '@/components/magicui/blur-fade';
import { getBlogPosts } from '@/data/blog';
import { getTopicBySlug, TOPICS } from '@/data/topics';
import { ArrowRightIcon, ArrowUpRightIcon, BookOpenIcon, SearchIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return {};
  return {
    title: `${topic.name} Research`,
    description: topic.description,
  };
}

const BLUR_FADE_DELAY = 0.04;

export default async function TopicDetailPage({ params }: Props) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const allPosts = await getBlogPosts();

  // Filter posts by matching topic keywords in title, summary, tags, or category
  const relatedPosts = allPosts
    .filter((post) => {
      const searchText = [
        post.metadata.title,
        post.metadata.summary,
        post.metadata.category ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return topic.matchKeywords.some((kw) => searchText.includes(kw.toLowerCase()));
    })
    .slice(0, 8);

  return (
    <div className='relative left-1/2 min-h-[100dvh] w-screen -translate-x-1/2 overflow-x-clip'>
      <div className='pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(241,245,249,0.92)_50%,rgba(248,250,252,1)_100%)] dark:bg-[linear-gradient(180deg,rgba(2,6,23,1)_0%,rgba(7,17,33,0.96)_50%,rgba(2,6,23,1)_100%)]' />

      <main className='relative mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6 sm:pb-32 sm:pt-10 lg:px-8'>
        {/* Breadcrumb */}
        <BlurFade delay={BLUR_FADE_DELAY}>
          <div className='mb-6 flex items-center gap-2 text-xs text-muted-foreground'>
            <Link href='/topics' className='hover:text-foreground'>Topics</Link>
            <span>/</span>
            <span>{topic.name}</span>
          </div>
        </BlurFade>

        {/* Hero */}
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <div className='relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/78 p-6 shadow-[0_28px_80px_-46px_rgba(15,23,42,0.45)] backdrop-blur-md sm:p-10'>
            <div
              className='pointer-events-none absolute inset-0 opacity-5'
              style={{ background: `radial-gradient(circle at top left, ${topic.accentColor}, transparent 60%)` }}
            />
            <div className='relative space-y-5'>
              <div className='flex items-center gap-4'>
                <span className='text-5xl'>{topic.emoji}</span>
                <div>
                  <div className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>Topic</div>
                  <h1 className='text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl'>
                    {topic.name}
                  </h1>
                </div>
              </div>
              <p className='max-w-2xl text-[15px] leading-8 text-muted-foreground'>
                {topic.description}
              </p>
              <div className='rounded-[1.35rem] border border-border/60 bg-background/80 p-4'>
                <div className='text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                  Why it matters
                </div>
                <p className='mt-2 text-sm leading-7 text-foreground'>{topic.whyItMatters}</p>
              </div>
              <div className='flex flex-wrap gap-2'>
                {topic.postCount > 0 && (
                  <span className='rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground'>
                    {topic.postCount}+ posts
                  </span>
                )}
                {topic.projectCount > 0 && (
                  <span className='rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground'>
                    {topic.projectCount} projects
                  </span>
                )}
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Related Posts */}
        <section className='mt-8 space-y-5'>
          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <div className='flex items-center justify-between gap-4'>
              <div className='inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-muted-foreground'>
                <BookOpenIcon className='size-3' />
                Related Posts
              </div>
              <Link
                href={`/blog?category=${topic.matchKeywords[0]}`}
                className='inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground'>
                See all <ArrowRightIcon className='size-3.5' />
              </Link>
            </div>
          </BlurFade>

          {relatedPosts.length > 0 ? (
            <div className='grid gap-3 sm:grid-cols-2'>
              {relatedPosts.map((post, id) => (
                <BlurFade key={post.slug} delay={BLUR_FADE_DELAY * 4 + id * 0.04}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className='group block rounded-[1.5rem] border border-border/60 bg-background/78 p-5 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/15'>
                    <div className='flex items-start justify-between gap-3'>
                      <h3 className='text-sm font-semibold leading-snug text-foreground line-clamp-2'>
                        {post.metadata.title}
                      </h3>
                      <ArrowUpRightIcon className='mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
                    </div>
                    {post.metadata.summary && (
                      <p className='mt-2 text-xs leading-5 text-muted-foreground line-clamp-2'>
                        {post.metadata.summary}
                      </p>
                    )}
                    <div className='mt-3 text-[10px] text-muted-foreground'>
                      {new Date(post.metadata.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </Link>
                </BlurFade>
              ))}
            </div>
          ) : (
            <BlurFade delay={BLUR_FADE_DELAY * 4}>
              <div className='rounded-[1.5rem] border border-border/60 bg-background/76 p-6 text-center text-sm text-muted-foreground'>
                No tagged posts yet — check back soon.
              </div>
            </BlurFade>
          )}
        </section>

        {/* CTA to Research */}
        <BlurFade delay={BLUR_FADE_DELAY * 5}>
          <div className='mt-8 rounded-[1.75rem] border border-border/60 bg-background/76 p-6 shadow-[0_20px_48px_-36px_rgba(15,23,42,0.45)] backdrop-blur-sm'>
            <div className='flex items-center justify-between gap-6'>
              <div className='space-y-1'>
                <div className='text-sm font-semibold text-foreground'>Explore {topic.name} projects in the Research Map</div>
                <p className='text-xs leading-5 text-muted-foreground'>
                  {topic.projectCount > 0
                    ? `${topic.projectCount} projects analyzed across this sector.`
                    : 'Browse all 161 researched projects.'}
                </p>
              </div>
              <Link
                href='/research'
                className='inline-flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-background/90 px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-foreground/15 hover:bg-background'>
                <SearchIcon className='size-4' />
                Research Map
              </Link>
            </div>
          </div>
        </BlurFade>
      </main>
    </div>
  );
}
