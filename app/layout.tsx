import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Validate environment variables at startup
import '@/lib/env-validation';
import { StructuredData } from '@/components/StructuredData';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://joinbrightnest.com'),
  title: {
    default: "BrightNest - Discover Your Financial Personality",
    template: "%s | BrightNest",
  },
  description: "Take our quiz to discover your financial archetype and get personalized insights for a brighter financial future. Learn to budget, save, and invest with confidence.",
  keywords: [
    "financial personality",
    "financial quiz",
    "financial archetype",
    "personal finance",
    "budgeting",
    "financial planning",
    "money management",
    "financial wellness",
  ],
  authors: [{ name: "BrightNest" }],
  creator: "BrightNest",
  publisher: "BrightNest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://joinbrightnest.com",
    title: "BrightNest - Discover Your Financial Personality",
    description: "Take our quiz to discover your financial archetype and get personalized insights for a brighter financial future.",
    siteName: "BrightNest",
    images: [
      {
        url: "/icon.png",
        width: 1200,
        height: 630,
        alt: "BrightNest Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrightNest - Discover Your Financial Personality",
    description: "Take our quiz to discover your financial archetype and get personalized insights for a brighter financial future.",
    images: ["/icon.png"],
    creator: "@brightnest", // Update with your actual Twitter handle when available
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/icon.png',
  },
  manifest: '/manifest.json',
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
  verification: {
    // Add these when you set up Google Search Console and other webmaster tools
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  other: {
    'permissions-policy': 'payment=(self "https://calendly.com" "https://*.calendly.com")',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData type="organization" />
        <StructuredData type="website" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
