import { Analytics } from "@/components/analytics";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
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
        url: `${DATA.url}/og`,
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
    images: [`${DATA.url}/og`],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased max-w-2xl mx-auto py-12 sm:py-24 px-6",
          fontSans.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <TooltipProvider delayDuration={0}>
            {children}
            <Navbar />
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
