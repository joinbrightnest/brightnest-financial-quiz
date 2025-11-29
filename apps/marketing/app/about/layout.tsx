import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "About BrightNest | Financial Wellness & Money Mindset",
  description: "Learn about BrightNest's mission to help people discover their financial personality and build lasting wealth. Transform your relationship with money through personalized insights.",
  keywords: [
    "about brightnest",
    "financial wellness",
    "money coaching",
    "financial education",
    "personal finance",
  ],
  openGraph: {
    title: "About BrightNest | Financial Wellness & Money Mindset",
    description: "Learn about BrightNest's mission to help people discover their financial personality and build lasting wealth.",
    type: "website",
    url: "https://joinbrightnest.com/about",
  },
  alternates: {
    canonical: "https://joinbrightnest.com/about",
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

