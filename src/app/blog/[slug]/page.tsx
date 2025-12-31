import { getBlogPosts, getPost } from "@/data/blog";
import { DATA } from "@/data/resume";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: {
    slug: string;
  };
}): Promise<Metadata | undefined> {
  let post = await getPost(params.slug);

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
    category,
  } = post.metadata;
  let ogImage = image ? `${DATA.url}${image}` : `${DATA.url}/og?title=${title}`;

  // Generate keywords based on category and content
  const categoryKeywords: Record<string, string[]> = {
    thoughts: ["Web3", "Blockchain", "Crypto Thoughts", "Opinion"],
    research: ["Crypto Research", "Blockchain Analysis", "Investment Report", "DeFi Research"],
    economics: ["Crypto Economics", "Token Economics", "Blockchain Economics", "Digital Assets"],
    philosophy: ["Crypto Philosophy", "Decentralization", "Web3 Philosophy"],
    investing: ["Crypto Investment", "DeFi Investing", "Digital Assets", "ETF", "Bitcoin", "Ethereum"],
  };

  const keywords = [
    "Web3",
    "Blockchain",
    "Cryptocurrency",
    "DeFi",
    ...(category && categoryKeywords[category] ? categoryKeywords[category] : []),
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
  params: {
    slug: string;
  };
}) {
  let post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metadata.title,
    description: post.metadata.summary,
    image: post.metadata.image
      ? `${DATA.url}${post.metadata.image}`
      : `${DATA.url}/og?title=${post.metadata.title}`,
    datePublished: post.metadata.publishedAt,
    dateModified: post.metadata.publishedAt,
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

  return (
    <section id="blog">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <h1 className="title font-medium text-2xl tracking-tighter max-w-[650px]">
        {post.metadata.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm max-w-[650px]">
        <Suspense fallback={<p className="h-5" />}>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {formatDate(post.metadata.publishedAt)}
          </p>
        </Suspense>
      </div>
      <article
        className="prose dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: post.source }}
      ></article>
    </section>
  );
}
