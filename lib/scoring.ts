export interface ScoreCategory {
  debt: number;
  savings: number;
  spending: number;
  investing: number;
}

export interface QuizOption {
  label: string;
  value: string;
  weightCategory: keyof ScoreCategory;
  weightValue: number;
}

export function calculateArchetype(scores: ScoreCategory): string {
  const { debt, savings, spending, investing } = scores;
  
  if (debt > savings && debt > spending && debt > investing) {
    return "Debt Crusher";
  }
  
  if (savings > debt && savings > spending && savings > investing) {
    return "Savings Builder";
  }
  
  if (spending > debt && spending > savings && spending > investing) {
    return "Stability Seeker";
  }
  
  if (investing > debt && investing > savings && investing > spending) {
    return "Optimizer";
  }
  
  // Default fallback
  return "Stability Seeker";
}

export function getArchetypeInsights(archetype: string): string[] {
  const insights: Record<string, string[]> = {
    "Debt Crusher": [
      "You prioritize eliminating debt to build financial freedom",
      "Consider debt avalanche or snowball methods for faster payoff",
      "Focus on emergency fund after high-interest debt is cleared"
    ],
    "Savings Builder": [
      "You value security and building wealth over time",
      "Consider automating savings and increasing contributions gradually",
      "Explore high-yield savings and CD laddering strategies"
    ],
    "Stability Seeker": [
      "You prefer predictable, low-risk financial strategies",
      "Focus on emergency funds and conservative investments",
      "Consider index funds and bonds for steady growth"
    ],
    "Optimizer": [
      "You're strategic about maximizing returns and efficiency",
      "Consider tax-advantaged accounts and portfolio optimization",
      "Explore advanced strategies like tax-loss harvesting"
    ]
  };
  
  return insights[archetype] || insights["Stability Seeker"];
}
