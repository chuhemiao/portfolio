"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { SearchIcon } from "lucide-react";
import { useI18n } from "@/components/locale-provider";
import { ModeToggle } from "@/components/mode-toggle";
import LanguageSwitcher, { LanguageSwitcherFallback } from "@/components/language-switcher";
import { stripLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/research", match: ["/research"], en: "Research", zh: "研究", ja: "リサーチ" },
  { href: "/blog", match: ["/blog"], en: "Writing", zh: "文章", ja: "記事" },
  { href: "/topics", match: ["/topics"], en: "Topics", zh: "主题", ja: "トピック" },
  { href: "/thoughts", match: ["/thoughts"], en: "Thoughts", zh: "思考", ja: "考察" },
  { href: "/oscillator", match: ["/oscillator", "/watch", "/fear", "/pulse"], en: "Tools", zh: "工具", ja: "ツール" },
  { href: "/fund", match: ["/fund"], en: "Fund", zh: "投资", ja: "投資" },
];

export default function SiteHeader() {
  const pathname = stripLocale(usePathname());
  const { t, href } = useI18n();

  const isActive = (match: string[]) =>
    match.some((m) => pathname === m || pathname.startsWith(`${m}/`));

  const links = NAV.map((item) => ({
    href: item.href,
    label: t(item.en, item.zh, item.ja),
    active: isActive(item.match),
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-[60px] max-w-[1240px] items-center gap-6 px-4 sm:px-8">
        <Link href={href("/")} className="flex shrink-0 items-center gap-2.5">
          <span aria-hidden="true" className="block size-2.5 bg-brand" />
          <span className="font-mono text-[13px] font-medium tracking-[0.16em]">KKDEMIAN</span>
        </Link>

        <nav aria-label={t("Primary", "主导航", "メインナビ")} className="hidden flex-1 items-center md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={href(item.href)}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "border-b-2 px-3.5 py-2 text-sm transition-colors",
                item.active
                  ? "border-brand text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href={href("/research")}
            className="flex h-[34px] items-center gap-2.5 rounded border border-border bg-surface px-2.5 text-[13px] text-subtle transition-colors hover:border-border-strong hover:text-foreground"
          >
            <SearchIcon aria-hidden="true" className="size-3.5" />
            <span className="hidden sm:inline">{t("Search", "搜索", "検索")}</span>
          </Link>
          <Suspense fallback={<LanguageSwitcherFallback />}>
            <LanguageSwitcher />
          </Suspense>
          <ModeToggle />
        </div>
      </div>

      <nav
        aria-label={t("Primary", "主导航", "メインナビ")}
        className="flex gap-1 overflow-x-auto border-t border-border px-4 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {links.map((item) => (
          <Link
            key={item.href}
            href={href(item.href)}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2.5 text-[13px] transition-colors",
              item.active ? "border-brand text-foreground" : "border-transparent text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
