import { Analytics } from "@/components/analytics";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import {
  IBM_Plex_Sans as FontSans,
  IBM_Plex_Mono as FontMono,
  IBM_Plex_Serif as FontSerif,
} from "next/font/google";
import "@/app/globals.css";
import { LocaleProvider } from "@/components/locale-provider";
import { type Locale } from "@/lib/i18n";

const fontSans = FontSans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = FontMono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const fontSerif = FontSerif({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(DATA.url),
  applicationName: DATA.name,
  referrer: "origin-when-cross-origin",
  title: {
    default: `${DATA.name} | Web3 Product Engineer`,
    template: `%s | ${DATA.name}`,
  },
  description: DATA.description,
  keywords: [
    "Web3",
    "Blockchain",
    "Cryptocurrency",
    "DeFi",
    "Stablecoin",
    "Bitcoin",
    "Ethereum",
    "Solana",
    "Product Engineer",
    "Crypto Investment",
    "ETF",
    "Smart Contracts",
    "Decentralized Finance",
    "Crypto Research",
    "Web3 Development",
    "ICP",
    "TON",
    "Crypto Trading",
    "Digital Assets",
    "Blockchain Technology"
  ],
  authors: [{ name: DATA.name, url: DATA.url }],
  creator: DATA.name,
  publisher: DATA.name,
  manifest: '/manifest.webmanifest',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: `${DATA.name} | Web3 Product Engineer`,
    description: DATA.description,
    url: DATA.url,
    siteName: `${DATA.name}`,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${DATA.url}/og.svg`,
        width: 1200,
        height: 630,
        alt: `${DATA.name} - Web3 Product Engineer & Crypto Expert`,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: `${DATA.name} | Web3 Product Engineer`,
    description: DATA.description,
    creator: "@0xkkdemian",
    images: [`${DATA.url}/og.svg`],
  },
  alternates: {
    canonical: DATA.url,
    types: {
      "application/rss+xml": `${DATA.url}/rss.xml`,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  category: "Technology",
};

export default function SiteDocument({
  children,
  locale,
}: Readonly<{
  children: React.ReactNode;
  locale: Locale;
}>) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased overflow-x-hidden",
          fontSans.variable,
          fontMono.variable,
          fontSerif.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
          <LocaleProvider locale={locale}>
            <TooltipProvider delayDuration={0}>
              <SiteHeader />
              {children}
              <SiteFooter />
            </TooltipProvider>
          </LocaleProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
