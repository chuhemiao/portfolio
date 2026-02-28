import { getBlogPosts, getPost } from "@/data/blog";
import { DATA } from "@/data/resume";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ScrollToTop from "@/components/blog/scroll-to-top";
import TableOfContents from "@/components/blog/table-of-contents";
import Mermaid from "@/components/mermaid";

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
      <TableOfContents toc={post.toc} />
      <section id="blog">
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
        <h1 className="title font-medium text-2xl tracking-tighter max-w-[650px]">
          {post.metadata.title}
        </h1>
        <div className="flex justify-between items-center mt-2 mb-8 text-sm max-w-[650px]">
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
          className="prose dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.source }}
        ></article>
      </section>
      <Mermaid />
      <ScrollToTop />
    </>
  );
}
