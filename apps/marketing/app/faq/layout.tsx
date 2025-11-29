import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions | BrightNest",
  description: "Find answers to common questions about BrightNest's financial personality quiz, coaching services, and how we help you build a brighter financial future.",
  keywords: [
    "brightnest faq",
    "financial quiz questions",
    "financial coaching faq",
    "personal finance questions",
  ],
  openGraph: {
    title: "FAQ - Frequently Asked Questions | BrightNest",
    description: "Find answers to common questions about BrightNest's financial personality quiz and coaching services.",
    type: "website",
    url: "https://joinbrightnest.com/faq",
  },
  alternates: {
    canonical: "https://joinbrightnest.com/faq",
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

