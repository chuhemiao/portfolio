"use client";

import Link from "next/link";
import { useI18n } from "@/components/locale-provider";
import { DATA } from "@/data/resume";

const CONTENT_LINKS = [
  { href: "/research", en: "Research index", zh: "研究索引", ja: "リサーチ索引" },
  { href: "/blog", en: "Writing", zh: "文章", ja: "記事" },
  { href: "/topics", en: "Topics", zh: "主题", ja: "トピック" },
  { href: "/stocks", en: "Tokenized equities", zh: "链上美股", ja: "オンチェーン米国株" },
  { href: "/thoughts", en: "Thoughts", zh: "思考流", ja: "考察" },
];

const TOOL_LINKS = [
  { href: "/oscillator", label: "Oscillator" },
  { href: "/watch", label: "Watch" },
  { href: "/fear", label: "Fear & Greed" },
  { href: "/fund", label: "Fund" },
];

export default function SiteFooter() {
  const { t, href } = useI18n();
  const socials = [
    DATA.contact.social.X,
    DATA.contact.social.GitHub,
    DATA.contact.social.TelegramChannel,
    DATA.contact.social.Youtube,
  ];

  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto flex max-w-[1240px] flex-wrap gap-10 px-4 pb-14 pt-11 sm:px-8">
        <div className="min-w-0 flex-[999_1_340px]">
          <div className="mb-3.5 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-muted font-mono text-[13px] text-muted-foreground">
              {DATA.initials}
            </span>
            <span>
              <span className="block text-[15px] font-semibold">{DATA.name}</span>
              <span className="mt-px block text-[13px] text-subtle">
                {t("Web3 Product Engineer · Nomad", "Web3 产品工程师 · 数字游民", "Web3 プロダクトエンジニア · ノマド")}
              </span>
            </span>
          </div>
          <p className="mb-4 max-w-[380px] text-[13px] leading-[1.75] text-subtle">
            {t(
              "iBuidl Founder · Yamaswap TPM. Research is published as soon as it is written.",
              "iBuidl Founder · Yamaswap TPM。研究写完就公开。",
              "iBuidl Founder · Yamaswap TPM。書き上げたリサーチはそのまま公開。"
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {socials.map((s) => (
              <Link
                key={s.name}
                href={s.url}
                target="_blank"
                className="rounded-sm border border-border px-2.5 py-1 font-mono text-[12px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
              >
                {s.name}
              </Link>
            ))}
            <Link
              href="/rss.xml"
              className="rounded-sm border border-border px-2.5 py-1 font-mono text-[12px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            >
              RSS
            </Link>
          </div>
        </div>

        <nav className="flex-[1_1_150px]">
          <div className="mono-label mb-3.5">{t("Content", "内容", "コンテンツ")}</div>
          {CONTENT_LINKS.map((item) => (
            <Link
              key={item.href}
              href={href(item.href)}
              className="block py-1 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(item.en, item.zh, item.ja)}
            </Link>
          ))}
        </nav>

        <nav className="flex-[1_1_150px]">
          <div className="mono-label mb-3.5">{t("Tools", "工具", "ツール")}</div>
          {TOOL_LINKS.map((item) => (
            <Link
              key={item.href}
              href={href(item.href)}
              className="block py-1 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <nav className="flex-[1_1_180px]">
          <div className="mono-label mb-3.5">{t("Exchanges", "交易入口", "取引所")}</div>
          <Link
            href={DATA.contact.social.binance.url}
            target="_blank"
            rel="sponsored noopener"
            className="block py-1 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Binance ↗
          </Link>
          <Link
            href={DATA.contact.social.bybit.url}
            target="_blank"
            rel="sponsored noopener"
            className="block py-1 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Bybit ↗
          </Link>
          <Link
            href={DATA.contact.social.hyper.url}
            target="_blank"
            rel="sponsored noopener"
            className="block py-1 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Hyperliquid ↗
          </Link>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-4 px-4 py-4 font-mono text-[11px] tracking-[0.06em] text-subtle sm:px-8">
          <span>© {new Date().getFullYear()} KKDEMIAN.COM</span>
          <span>DYOR</span>
        </div>
      </div>
    </footer>
  );
}
