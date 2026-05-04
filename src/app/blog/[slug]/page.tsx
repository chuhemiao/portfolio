import { getBlogPosts, getPost } from "@/data/blog";
import { DATA } from "@/data/resume";
import { TOPICS } from "@/data/topics";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import ScrollToTop from "@/components/blog/scroll-to-top";
import TableOfContents from "@/components/blog/table-of-contents";
import Mermaid from "@/components/mermaid";
import { ArrowUpRightIcon, RssIcon, ArrowRightIcon } from "lucide-react";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  thoughts: ["Web3", "Blockchain", "Crypto Thoughts", "Opinion"],
  research: ["Crypto Research", "Blockchain Analysis", "Investment Report", "DeFi Research"],
  economics: ["Crypto Economics", "Token Economics", "Blockchain Economics", "Digital Assets"],
  philosophy: ["Crypto Philosophy", "Decentralization", "Web3 Philosophy"],
  investing: ["Crypto Investment", "DeFi Investing", "Digital Assets", "ETF", "Bitcoin", "Ethereum"],
};

function resolveOgImageUrl(image: string | undefined, title: string) {
  if (!image || image.trim().length === 0) {
    return `${DATA.url}/og?title=${encodeURIComponent(title)}`;
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${DATA.url}${image}`;
  }

  return `${DATA.url}/${image}`;
}

function toIsoOrNow(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata | undefined> {
  const { slug } = await params;
  let post = await getPost(slug);
  if (!post) {
    return undefined;
  }

  let {
    title,
    publishedAt: publishedTime,
    summary,
    image,
    category,
  } = post.metadata;
  const description = summary || `${title} - ${DATA.name}`;
  let ogImage = resolveOgImageUrl(image, title);

  const keywords = [
    "Web3",
    "Blockchain",
    "Cryptocurrency",
    "DeFi",
    ...(category && CATEGORY_KEYWORDS[category] ? CATEGORY_KEYWORDS[category] : []),
  ];

  return {
    title,
    description,
    keywords,
    authors: [{ name: DATA.name, url: DATA.url }],
    creator: DATA.name,
    publisher: DATA.name,
    alternates: {
      canonical: `${DATA.url}/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${DATA.url}/blog/${post.slug}`,
      siteName: DATA.name,
      locale: "en_US",
      authors: [DATA.name],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@0xkkdemian",
      images: [ogImage],
    },
    category: category || "Technology",
  };
}

export default async function Blog({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;
  let post = await getPost(slug);


  if (!post) {
    notFound();
  }

  // Related posts: same category, excluding current
  const allPosts = await getBlogPosts();
  const relatedPosts = allPosts
    .filter(
      (p) =>
        p.slug !== slug &&
        p.metadata.category &&
        p.metadata.category === post!.metadata.category
    )
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() -
        new Date(a.metadata.publishedAt).getTime()
    )
    .slice(0, 3);

  // Related topics: match post keywords against topic matchKeywords
  const postText = [
    post.metadata.title,
    post.metadata.summary ?? "",
    post.metadata.category ?? "",
  ]
    .join(" ")
    .toLowerCase();
  const relatedTopics = TOPICS.filter((t) =>
    t.matchKeywords.some((kw) => postText.includes(kw.toLowerCase()))
  ).slice(0, 3);

  const ogImage = resolveOgImageUrl(post.metadata.image, post.metadata.title);
  const publishedAtIso = toIsoOrNow(post.metadata.publishedAt);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metadata.title,
    description: post.metadata.summary || post.metadata.title,
    image: ogImage,
    datePublished: publishedAtIso,
    dateModified: publishedAtIso,
    author: {
      "@type": "Person",
      name: DATA.name,
      url: DATA.url,
      sameAs: [
        "https://github.com/chuhemiao",
        "https://x.com/0xkkdemian",
        "https://www.youtube.com/@kkdemian",
      ],
    },
    publisher: {
      "@type": "Person",
      name: DATA.name,
      url: DATA.url,
    },
    url: `${DATA.url}/blog/${post.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${DATA.url}/blog/${post.slug}`,
    },
    keywords: post.metadata.category
      ? [post.metadata.category, "Web3", "Blockchain", "Cryptocurrency", "DeFi"]
      : ["Web3", "Blockchain", "Cryptocurrency"],
    articleSection: post.metadata.category || "Technology",
    inLanguage: "en-US",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: DATA.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${DATA.url}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.metadata.title,
        item: `${DATA.url}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <>
      <section
        id="blog"
        className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8"
      >
        <div className="xl:grid xl:grid-cols-[220px_minmax(0,1fr)] xl:gap-12">
          <TableOfContents
            toc={post.toc}
            className="hidden xl:block xl:sticky xl:top-24 xl:max-h-[calc(100vh-6rem)] xl:self-start xl:overflow-y-auto"
          />
          <div className="min-w-0 xl:max-w-3xl">
            <script
              type="application/ld+json"
              suppressHydrationWarning
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(jsonLd),
              }}
            />
            <script
              type="application/ld+json"
              suppressHydrationWarning
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(breadcrumbJsonLd),
              }}
            />
            <h1 className="title max-w-[650px] text-2xl font-medium tracking-tighter">
              {post.metadata.title}
            </h1>
            <div className="mt-2 mb-8 flex max-w-[650px] items-center justify-between text-sm">
              <Suspense fallback={<p className="h-5" />}>
                <time
                  dateTime={publishedAtIso}
                  className="text-sm text-neutral-600 dark:text-neutral-400"
                >
                  {formatDate(post.metadata.publishedAt)}
                </time>
              </Suspense>
            </div>
            <article
              className="prose max-w-none break-words dark:prose-invert [overflow-wrap:anywhere] prose-pre:max-w-full prose-pre:overflow-x-auto prose-img:max-w-full [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: post.source }}
            ></article>

            {/* Related Topics */}
            {relatedTopics.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                <span className="text-xs font-medium text-muted-foreground self-center">Related topics:</span>
                {relatedTopics.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/topics/${t.slug}`}
                    className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-foreground/20"
                  >
                    {t.emoji} {t.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Subscribe CTA */}
            <div className="mt-10 rounded-[1.5rem] border border-border/60 bg-background/76 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <RssIcon className="size-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Stay updated</span>
              </div>
              <p className="text-sm text-muted-foreground leading-6 mb-4">
                Get weekly research updates, market signals, and listing intelligence — follow along on Telegram or X.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={DATA.contact.social.TelegramChannel.url}
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/90 px-4 py-2 text-sm font-semibold text-foreground transition-all hover:border-foreground/15"
                >
                  <DATA.contact.social.TelegramChannel.icon className="size-3.5" />
                  Follow on Telegram
                </Link>
                <Link
                  href={DATA.contact.social.X.url}
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-foreground/15 hover:text-foreground"
                >
                  <DATA.contact.social.X.icon className="size-3.5" />
                  Follow on X
                </Link>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-foreground">More in {post.metadata.category}</span>
                  <Link
                    href={`/blog?category=${post.metadata.category}`}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    See all <ArrowRightIcon className="size-3" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {relatedPosts.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/blog/${p.slug}`}
                      className="group flex items-start justify-between gap-3 rounded-[1.25rem] border border-border/60 bg-background/78 px-4 py-3.5 transition-all hover:border-foreground/15"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">{p.metadata.title}</div>
                        {p.metadata.summary && (
                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{p.metadata.summary}</p>
                        )}
                        <div className="mt-1.5 text-[10px] text-muted-foreground">
                          {new Date(p.metadata.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                      <ArrowUpRightIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <Mermaid />
      <ScrollToTop />
    </>
  );
}
