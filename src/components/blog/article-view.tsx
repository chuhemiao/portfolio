// The article renderer, shared by /[locale]/blog/[slug].
//
// This used to be the page module for a second route, /blog/<slug>, which
// rendered every article a second time without a locale prefix. That doubled
// the static export -- 7,260 extra pages at ~219 KB, 1.86 GB of 3.9 GB -- for
// URLs the sitemap, RSS and every internal link had already stopped pointing
// at. The route is gone; scripts/emit-legacy-blog-redirects.mjs writes a small
// redirect document at each old URL so inbound links keep working.
import { getPost, getPostMeta, getRelatedPosts, getRelatedTopicSlugs, getLocalizedPosts, getPostHref } from "@/data/blog";
import { DATA } from "@/data/resume";
import { TOPICS, localizedTopic } from "@/data/topics";
import { articleHref, categoryLabel, formatLocaleDate, getTranslator, localizeHref, LOCALES, OG_LOCALES, type Locale } from "@/lib/i18n";
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

function resolveOgImageUrl(image: string | undefined) {
  if (!image || image.trim().length === 0) {
    return `${DATA.url}/og.svg`;
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata | undefined> {
  const { slug } = await params;
  const post = getPostMeta(slug);
  if (!post) {
    return undefined;
  }

  const {
    title,
    publishedAt: publishedTime,
    summary,
    image,
    category,
    language,
    translations,
  } = post.metadata;
  const description = summary || `${title} - ${DATA.name}`;
  const ogImage = resolveOgImageUrl(image);

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
      canonical: `${DATA.url}${articleHref(post.slug, language ?? 'en')}`,
      languages: Object.fromEntries(Object.entries(translations ?? { [language ?? 'en']: post.slug }).map(([locale, target]) => [locale, `${DATA.url}${articleHref(target as string, locale as Locale)}`])),
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${DATA.url}${articleHref(post.slug, language ?? "en")}`,
      siteName: DATA.name,
      locale: OG_LOCALES[language ?? "en"],
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

export async function renderPage(locale: Locale, slug: string) {
  const t = getTranslator(locale);
  const href = (url: string) => localizeHref(url, locale);
  const post = await getPost(slug);


  if (!post) {
    notFound();
  }

  // Related posts and topics are precomputed by the content compiler.
  const relatedPosts = getLocalizedPosts(getRelatedPosts(post.slug), locale);
  const relatedTopicSlugs = getRelatedTopicSlugs(post.slug);
  const relatedTopics = relatedTopicSlugs
    .map((topicSlug) => TOPICS.find((t) => t.slug === topicSlug))
    .filter((t): t is (typeof TOPICS)[number] => Boolean(t))
    .map((topic) => localizedTopic(topic, locale));

  const ogImage = resolveOgImageUrl(post.metadata.image);
  const publishedAtIso = toIsoOrNow(post.metadata.publishedAt);
  const language = post.metadata.language ?? "en";
  const translations = post.metadata.translations ?? { [language]: post.slug };
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
    url: `${DATA.url}${articleHref(post.slug, language ?? "en")}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${DATA.url}${articleHref(post.slug, language)}`,
    },
    keywords: post.metadata.category
      ? [post.metadata.category, "Web3", "Blockchain", "Cryptocurrency", "DeFi"]
      : ["Web3", "Blockchain", "Cryptocurrency"],
    articleSection: post.metadata.category || "Technology",
    inLanguage: language,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t("Home", "首页", "ホーム"),
        item: `${DATA.url}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("Blog", "博客", "ブログ"),
        item: `${DATA.url}/${locale}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.metadata.title,
        item: `${DATA.url}${articleHref(post.slug, language)}`,
      },
    ],
  };

  return (
    <>
      <section
        id="blog"
        className="mx-auto w-full max-w-6xl px-4 pb-dock-safe pt-6 sm:px-6 sm:pb-dock-safe-lg sm:pt-10 lg:px-8"
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
            <h1 className="mb-4 max-w-[760px] text-[27px] font-semibold leading-[1.22] tracking-[-0.028em] sm:text-[38px]">
              {post.metadata.title}
            </h1>
            {post.metadata.summary && (
              <p className="mb-6 max-w-[760px] font-serif text-[17px] leading-[1.75] text-muted-foreground sm:text-[18px]">
                {post.metadata.summary}
              </p>
            )}
            <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-5 font-mono text-[12px] tracking-[0.04em] text-subtle">
              <Suspense fallback={<span className="h-5" />}>
                <time dateTime={publishedAtIso} className="tnum">
                  {formatLocaleDate(post.metadata.publishedAt, locale)}
                </time>
              </Suspense>
              {post.metadata.category && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="uppercase">{categoryLabel(post.metadata.category, locale)}</span>
                </>
              )}
            </div>
            {LOCALES.some((target) => !translations[target]) && (
              <p className="mb-8 text-xs text-muted-foreground">
                {t('Use the language menu at the top to open an available translation. Languages without a translation open the article list.', '通过顶部语言菜单打开已有译文；尚无译文的语言会打开文章列表。', 'ページ上部の言語メニューから利用可能な翻訳を開けます。翻訳のない言語は記事一覧を開きます。')}
              </p>
            )}
            <article
              lang={language}
              className="article-prose prose max-w-none break-words dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: post.source }}
            ></article>

            {/* Related Topics */}
            {relatedTopics.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                <span className="text-xs font-medium text-muted-foreground self-center">{t("Related topics:", "相关主题：", "関連トピック：")}</span>
                {relatedTopics.map((t) => (
                  <Link
                    key={t.slug}
                    href={href(`/topics/${t.slug}`)}
                    className="inline-flex items-center gap-1 rounded-sm border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-border-strong"
                  >
                    {t.emoji} {t.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Subscribe CTA */}
            <div className="mt-10 rounded border border-border bg-surface p-6">
              <div className="flex items-center gap-2 mb-3">
                <RssIcon className="size-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{t("Stay updated", "订阅更新", "最新情報を受け取る")}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-6 mb-4">
                {t("Get weekly research updates, market signals, and listing intelligence — follow along on Telegram or X.", "在 Telegram 或 X 关注每周研究、市场信号与上币动态。", "Telegram や X で毎週のリサーチ、市場シグナル、上場情報をチェック。")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={DATA.contact.social.TelegramChannel.url}
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-sm border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-all hover:border-border-strong"
                >
                  <DATA.contact.social.TelegramChannel.icon className="size-3.5" />
                  {t("Follow on Telegram", "关注 Telegram", "Telegram でフォロー")}
                </Link>
                <Link
                  href={DATA.contact.social.X.url}
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-sm border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-border-strong hover:text-foreground"
                >
                  <DATA.contact.social.X.icon className="size-3.5" />
                  {t("Follow on X", "关注 X", "X でフォロー")}
                </Link>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-foreground">{t("More in", "更多文章：", "関連記事：")} {categoryLabel(post.metadata.category ?? "research", locale)}</span>
                  <Link
                    href={href(`/blog?category=${post.metadata.category}`)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {t("See all", "查看全部", "すべて見る")} <ArrowRightIcon className="size-3" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {relatedPosts.map((p) => (
                    <Link
                      key={p.slug}
                      href={getPostHref(p, locale)}
                      className="group flex items-start justify-between gap-3 rounded border border-border bg-surface px-4 py-3.5 transition-all hover:border-border-strong"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">{p.metadata.title}</div>
                        {p.metadata.summary && (
                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{p.metadata.summary}</p>
                        )}
                        <div className="mt-1.5 text-[10px] text-muted-foreground">
                          {formatLocaleDate(p.metadata.publishedAt, locale)}
                        </div>
                      </div>
                      <ArrowUpRightIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform" />
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
