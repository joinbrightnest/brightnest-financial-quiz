import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Free Budget Calculator | Create Your Personal Budget | BrightNest",
  description: "Calculate your monthly budget with our free budget calculator. Track income, expenses, and savings goals. Take control of your finances with our easy-to-use budgeting tool.",
  keywords: [
    "budget calculator",
    "free budget tool",
    "monthly budget calculator",
    "personal budget planner",
    "expense calculator",
    "budgeting tool",
  ],
  openGraph: {
    title: "Free Budget Calculator | BrightNest",
    description: "Calculate your monthly budget and track expenses with our free budgeting tool.",
    type: "website",
    url: "https://joinbrightnest.com/tools/budget-calculator",
  },
  alternates: {
    canonical: "https://joinbrightnest.com/tools/budget-calculator",
  },
}

export default function BudgetCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

