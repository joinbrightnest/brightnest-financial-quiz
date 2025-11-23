import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Free Debt Snowball Calculator | Pay Off Debt Faster | BrightNest",
  description: "Use our free debt snowball calculator to create your debt payoff plan. Calculate how quickly you can become debt-free with the proven debt snowball method.",
  keywords: [
    "debt snowball calculator",
    "debt payoff calculator",
    "free debt tool",
    "debt elimination calculator",
    "pay off debt faster",
    "debt reduction tool",
  ],
  openGraph: {
    title: "Free Debt Snowball Calculator | BrightNest",
    description: "Calculate your debt payoff plan with the proven debt snowball method.",
    type: "website",
    url: "https://joinbrightnest.com/tools/debt-snowball-calculator",
  },
  alternates: {
    canonical: "https://joinbrightnest.com/tools/debt-snowball-calculator",
  },
}

export default function DebtSnowballCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

