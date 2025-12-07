import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://signalforge-fogecommunity.vercel.app'),
  title: {
    default: "SignalForge - Fine-Grained Reactive State Management for JavaScript",
    template: "%s | SignalForge"
  },
  description: "The simplest state management library for React and React Native. Only 2KB, 33x faster updates, zero boilerplate. Your UI automatically updates when data changes.",
  keywords: [
    "state management",
    "react",
    "react native",
    "signals",
    "reactive programming",
    "javascript",
    "typescript",
    "nextjs",
    "redux alternative",
    "zustand alternative",
    "lightweight state management",
    "fine-grained reactivity",
    "performance",
    "signalforge"
  ],
  authors: [{ name: "ForgeCommunity", url: "https://github.com/forgecommunity" }],
  creator: "ForgeCommunity",
  publisher: "ForgeCommunity",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://signalforge-fogecommunity.vercel.app",
    siteName: "SignalForge",
    title: "SignalForge - Fine-Grained Reactive State Management",
    description: "The simplest state management library for React and React Native. Only 2KB, 33x faster updates, zero boilerplate.",
    images: [
      {
        url: "https://raw.githubusercontent.com/forgecommunity/signalforge/refs/heads/master/docs/assets/signalforge.png",
        width: 1200,
        height: 630,
        alt: "SignalForge - Fine-Grained Reactive State Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SignalForge - Fine-Grained Reactive State Management",
    description: "The simplest state management library for React and React Native. Only 2KB, 33x faster updates, zero boilerplate.",
    images: ["https://raw.githubusercontent.com/forgecommunity/signalforge/refs/heads/master/docs/assets/signalforge.png"],
    creator: "@forgecommunity",
    site: "@forgecommunity",
  },
  alternates: {
    canonical: "https://signalforge-fogecommunity.vercel.app",
  },
  category: "technology",
  verification: {
    // Add these when available:
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SignalForge',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web, iOS, Android',
    description: 'Fine-grained reactive state management library for React and React Native. Only 2KB with zero dependencies.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '100',
    },
    author: {
      '@type': 'Organization',
      name: 'ForgeCommunity',
      url: 'https://github.com/forgecommunity',
    },
    downloadUrl: 'https://www.npmjs.com/package/signalforge',
    softwareVersion: '1.0.0',
    featureList: [
      'Fine-grained reactivity',
      'Only 2KB gzipped',
      '33x faster batched updates',
      'Zero boilerplate',
      'TypeScript support',
      'React and React Native support',
      'Computed values',
      'Effects system',
      'Time travel debugging',
      'DevTools integration',
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="canonical" href="https://signalforge-fogecommunity.vercel.app" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
