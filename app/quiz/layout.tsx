import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Take Your Financial Personality Quiz | BrightNest",
  description: "Discover your financial archetype with our free quiz. Get personalized insights about your money habits, spending patterns, and financial goals. Start your journey to financial wellness today.",
  // Don't index the quiz page - it's a JavaScript app with no static content
  // Users should discover the quiz through the homepage and blog posts
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Take Your Financial Personality Quiz | BrightNest",
    description: "Discover your financial archetype and get personalized insights for a brighter financial future.",
    type: "website",
    url: "https://joinbrightnest.com/quiz",
  },
  twitter: {
    card: "summary_large_image",
    title: "Take Your Financial Personality Quiz | BrightNest",
    description: "Discover your financial archetype and get personalized insights for a brighter financial future.",
  },
  alternates: {
    canonical: "https://joinbrightnest.com/quiz",
  },
}

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* SEO-friendly content for crawlers */}
      <noscript>
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui' }}>
          <h1>Financial Personality Quiz</h1>
          <p>Discover your financial archetype and get personalized insights to help you build a brighter financial future.</p>
          <p>This quiz requires JavaScript to be enabled in your browser.</p>
        </div>
      </noscript>
      {children}
    </>
  )
}

