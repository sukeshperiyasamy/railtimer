import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// No hardcoded fallback: loading a real publisher's AdSense script on every
// dev/preview deployment (not just production) risks invalid-traffic
// policy violations. Only load it when the env var is explicitly set for
// that environment. Keep this consistent with components/ads/AdSlot.tsx.
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RailTimer — Know When Current Booking Opens for Your Train",
    template: "%s | RailTimer",
  },
  description:
    "Calculate exactly when your train's chart is prepared and current booking opens. Free Current Availability Calculator for Indian Railways passengers — no login required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Skip to content
        </a>
        {ADSENSE_CLIENT_ID ? (
          <Script
            id="adsbygoogle-global"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}
        <PostHogProvider>
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <Analytics />
        </PostHogProvider>
      </body>
    </html>
  );
}
