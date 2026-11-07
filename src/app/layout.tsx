import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TrackView } from "@/components/track-view";

// The shared header reads the database, so pages (including 404s) must render at request time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "TrendoraNews — Bangladesh & World News, Live",
    template: "%s | TrendoraNews",
  },
  description:
    "TrendoraNews — breaking news, Bangladesh, world, business, technology, sports, history, science and more. Live updates, fact-checks and interactive explorers.",
  keywords: [
    "news",
    "Bangladesh news",
    "breaking news",
    "world news",
    "TrendoraNews",
    "live news",
  ],
  openGraph: {
    type: "website",
    siteName: "TrendoraNews",
    title: "TrendoraNews — Breaking News & World Coverage",
    description: "Breaking news, live updates, fact checks and interactive explorers.",
    images: ["/og-image.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrendoraNews",
    description: "Breaking news, live updates, fact checks and interactive explorers.",
  },
  robots: { index: true, follow: true },
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <ThemeProvider>
          <TrackView />
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
