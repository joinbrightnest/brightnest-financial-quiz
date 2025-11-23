import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Financial Education Blog | BrightNest",
  description: "Read expert articles on budgeting, saving, investing, and building wealth. Learn practical money management tips and strategies for financial success.",
  keywords: [
    "financial blog",
    "money management tips",
    "budgeting advice",
    "personal finance articles",
    "wealth building",
    "financial education",
  ],
  openGraph: {
    title: "Financial Education Blog | BrightNest",
    description: "Read expert articles on budgeting, saving, investing, and building wealth.",
    type: "website",
    url: "https://joinbrightnest.com/blog",
  },
  alternates: {
    canonical: "https://joinbrightnest.com/blog",
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

