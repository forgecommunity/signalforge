import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const siteUrl = "https://signalforge-fogecommunity.vercel.app";
const ogImage = "https://raw.githubusercontent.com/forgecommunity/signalforge/refs/heads/master/docs/assets/signalforge.png";
const title = "SignalForge - Fine-Grained Reactive State Management for React, React Native, and TypeScript";
const description = "SignalForge is a fine-grained reactive state management library for React, React Native, Next.js, and TypeScript with signals, computed values, stores, batching, SSR-safe hooks, DevTools, plugins, and zero runtime dependencies.";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | SignalForge"
  },
  description,
  keywords: [
    "signalforge",
    "SignalForge",
    "state management",
    "React state management",
    "React Native state management",
    "Next.js state management",
    "TypeScript state management",
    "signals",
    "JavaScript signals",
    "React signals",
    "reactive programming",
    "fine-grained reactivity",
    "computed signals",
    "signal store",
    "SSR state management",
    "DevTools state management",
    "plugin state management",
    "persistent state",
    "redux alternative",
    "zustand alternative",
    "context alternative",
    "lightweight state management",
    "zero dependencies",
    "performance"
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
  applicationName: "SignalForge",
  referrer: "origin-when-cross-origin",
  classification: "Developer tools, JavaScript library, React library",
  other: {
    "npm": "https://www.npmjs.com/package/signalforge",
    "github": "https://github.com/forgecommunity/signalforge",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "SignalForge",
    title,
    description,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "SignalForge fine-grained reactive state management library",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: 'SignalForge',
        url: siteUrl,
        description,
        inLanguage: 'en-US',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/docs?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}/#software`,
        name: 'SignalForge',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web, iOS, Android, Node.js',
        programmingLanguage: ['TypeScript', 'JavaScript'],
        description,
        url: siteUrl,
        downloadUrl: 'https://www.npmjs.com/package/signalforge',
        codeRepository: 'https://github.com/forgecommunity/signalforge',
        softwareVersion: '1.0.2',
        license: 'https://github.com/forgecommunity/signalforge/blob/master/LICENSE',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        author: {
          '@type': 'Organization',
          name: 'ForgeCommunity',
          url: 'https://github.com/forgecommunity',
        },
        featureList: [
          'Fine-grained signals',
          'Computed values',
          'Batched updates',
          'SSR-safe React hooks',
          'React Native support',
          'Store selectors',
          'Embedded DevTools',
          'Plugin lifecycle hooks',
          'Persistence helpers',
          'Zero runtime dependencies',
        ],
      },
      {
        '@type': 'SoftwareSourceCode',
        '@id': `${siteUrl}/#source`,
        name: 'SignalForge source code',
        codeRepository: 'https://github.com/forgecommunity/signalforge',
        programmingLanguage: ['TypeScript', 'JavaScript'],
        runtimePlatform: ['React', 'React Native', 'Next.js', 'Node.js'],
        license: 'https://github.com/forgecommunity/signalforge/blob/master/LICENSE',
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="canonical" href={siteUrl} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
