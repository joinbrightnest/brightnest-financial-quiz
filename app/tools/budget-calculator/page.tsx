"use client";

import { useState, useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// National average percentages for each category (as starting point)
// These percentages reflect realistic budgeting based on Ramsey's approach
const NATIONAL_AVERAGES = {
  giving: 0.10,           // 10% (recommended)
  savings: 0.00,          // 0% (paused if you have debt - Baby Step 2)
  food: 0.13,             // 13%
  utilities: 0.06,        // 6%
  housing: 0.25,          // 25% (recommended max)
  transportation: 0.03,    // 3%
  insurance: 0.11,        // 11%
  householdItems: 0.01,   // 1%
  debt: 0.24,             // 24% (average debt payment)
  retirement: 0.00,       // 0% (paused if you have debt - Baby Step 2)
  personal: 0.07,         // 7%
  other: 0.00             // 0% (fill as needed)
};

const CATEGORY_COLORS = {
  giving: "#22c55e",          // green
  savings: "#3b82f6",          // blue
  food: "#06b6d4",             // cyan
  utilities: "#ef4444",        // red
  housing: "#6366f1",          // indigo
  transportation: "#22c55e",   // green
  insurance: "#f59e0b",        // amber
  householdItems: "#8b5cf6",   // purple
  debt: "#ec4899",             // pink
  retirement: "#14b8a6",       // teal
  personal: "#f97316",         // orange
  other: "#64748b"             // slate
};

const CATEGORY_LABELS = {
  giving: "Giving",
  savings: "Savings",
  food: "Food",
  utilities: "Utilities",
  housing: "Housing",
  transportation: "Transportation",
  insurance: "Insurance",
  householdItems: "Household Items",
  debt: "Debt",
  retirement: "Retirement",
  personal: "Personal and Entertainment",
  other: "Other"
};

const CATEGORY_DESCRIPTIONS = {
  giving: "Be intentional about making generosity a regular part of your life. Start your budget by giving 10% of your income.",
  savings: "If you're in debt, save $1,000 in a starter emergency fund. Then pause saving and focus on paying off that debt. Once you're debt-free, save up 3–6 months of expenses for a fully funded emergency fund. These are the first three of the 7 Baby Steps, and taking each of these steps one at a time is how you make real progress with your money goals.",
  food: "Food is the easiest budget line to bust—and the hardest to plan for that first month. Open your bank account and see how much you spent on food last month. Then, you can tweak this number in the EveryDollar budget app as you plan your spending for this month.",
  utilities: "Utilities are the essential expenses that keep your house running. The amounts can change, but check your bank account and see what you spent last month on electricity, water, the phone bill, natural gas, etc. Add those up and start with that number here.",
  housing: "Pro tip: When you spend 25% (or less) of your take-home pay on housing (mortgage or rent plus insurance, property taxes and HOA fees), one of your biggest blessings (your home) won't turn into a financial burden.",
  transportation: "Look back through your bank account and add up how much you spent on gas last month as a starting number for this category. Then don't forget auto insurance, maintenance, and anything else you spend on transportation.",
  insurance: "You planned for homeowners/renters and auto coverage in other categories. Here, add what you spend on other insurances you need: term life, health, long-term disability, long-term care (if you're age 60+), identity theft, and umbrella (if you've got a net worth of $500,000 or more).",
  householdItems: "Toothpaste, shampoo, laundry supplies: How much do you spend on these things each month? This is another hard one to pin down at first—but soon you'll be a pro here. (Not literally. No one goes pro planning toilet paper spending. Yet.)",
  debt: "Debt is any money you owe to anyone for any reason. So, add up all your car payments, credit card bills, student loans, medical debt and other payment plans and put that total here. Then start hustling to pay it off and really make progress with your money.",
  retirement: "When you're debt-free and your fully funded emergency fund is, well, fully funded, it's time for retirement savings! Start prepping for your future by investing 15% of your income.",
  personal: "This is what you plan to spend on all the fun stuff: concert tickets, family trips to the ballpark, bagpipe lessons, salon visits—all those exciting extras. (Just remember, needs come before wants.)",
  other: "This budget calculator only has the most common categories, but it probably doesn't cover everything you spend money on. Go ahead and add any other expenses here. When you start budgeting with EveryDollar, you can customize and add as many categories as you need."
};

export default function BudgetCalculatorPage() {
  const [income, setIncome] = useState("");
  const [showInfoTooltip, setShowInfoTooltip] = useState<string | null>(null);
  const [expenses, setExpenses] = useState({
    giving: "",
    savings: "",
    food: "",
    utilities: "",
    housing: "",
    transportation: "",
    insurance: "",
    householdItems: "",
    debt: "",
    retirement: "",
    personal: "",
    other: ""
  });

  // Track last income value that was used for auto-population
  const [lastPopulatedIncome, setLastPopulatedIncome] = useState<string>("");

  // Auto-populate with national averages when income is entered (debounced)
  useEffect(() => {
    if (!income || income.trim() === "") {
      return;
    }
    
    const incomeNum = parseFloat(income);
    
    // Only proceed if income is a valid positive number
    if (isNaN(incomeNum) || incomeNum <= 0) {
      return;
    }
    
    // Debounce: wait for user to finish typing (500ms delay)
    const timeoutId = setTimeout(() => {
      const incomeStr = incomeNum.toString();
      
      // Only auto-populate if income has changed significantly
      // This prevents recalculation on every keystroke
      if (lastPopulatedIncome === incomeStr) {
        return; // Already populated for this income value
      }
      
      // Auto-populate empty fields with calculated values
      setExpenses(prev => {
        const newExpenses: { [key: string]: string } = { ...prev };
        let hasChanges = false;
        
        Object.keys(NATIONAL_AVERAGES).forEach((key) => {
          const categoryKey = key as keyof typeof NATIONAL_AVERAGES;
          const percentage = NATIONAL_AVERAGES[categoryKey];
          const currentValue = prev[categoryKey as keyof typeof prev];
          
          // Check if field is empty (empty string, undefined, or null)
          const isEmpty = currentValue === undefined || currentValue === null || currentValue === "" || (typeof currentValue === 'string' && currentValue.trim() === "");
          
          // Only auto-fill empty fields with non-zero percentages
          if (isEmpty && percentage > 0) {
            const calculatedValue = incomeNum * percentage;
            const roundedValue = Math.round(calculatedValue);
            if (roundedValue > 0) {
              newExpenses[categoryKey] = roundedValue.toString();
              hasChanges = true;
            }
          }
          // If field already has value, keep it (don't overwrite user input)
          // If field is empty and percentage is 0, leave it empty
        });
        
        // Mark this income as populated
        if (hasChanges) {
          setLastPopulatedIncome(incomeStr);
        }
        
        // Only update state if there were actual changes
        return hasChanges ? newExpenses : prev;
      });
    }, 500); // Wait 500ms after user stops typing
    
    // Cleanup timeout if income changes again
    return () => clearTimeout(timeoutId);
  }, [income, lastPopulatedIncome]);

  const handleExpenseChange = (category: string, value: string) => {
    // Remove leading zeros - convert to number then back to string to strip leading zeros
    let cleanedValue = value;
    if (value !== "" && value !== ".") {
      // Remove leading zeros, but allow "0." for decimal input
      cleanedValue = value.replace(/^0+(?=\d)/, '');
      // If it's just "0", keep it, but if it's "0233", convert to "233"
      if (cleanedValue === "" && value.startsWith("0")) {
        cleanedValue = "0";
      }
    }
    setExpenses(prev => ({
      ...prev,
      [category]: cleanedValue
    }));
  };

  const handleIncomeChange = (value: string) => {
    // Remove leading zeros - convert to number then back to string to strip leading zeros
    let cleanedValue = value;
    if (value !== "" && value !== ".") {
      // Remove leading zeros, but allow "0." for decimal input
      cleanedValue = value.replace(/^0+(?=\d)/, '');
      // If it's just "0", keep it, but if it's "0233", convert to "233"
      if (cleanedValue === "" && value.startsWith("0")) {
        cleanedValue = "0";
      }
    }
    setIncome(cleanedValue);
    // Reset last populated income so useEffect can recalculate when income changes
    // This allows recalculation if user changes income value
    setLastPopulatedIncome("");
  };

  const calculateTotalExpenses = () => {
    return Object.values(expenses).reduce((total, value) => {
      return total + (parseFloat(value) || 0);
    }, 0);
  };

  const calculateDifference = () => {
    const incomeNum = parseFloat(income) || 0;
    const totalExpenses = calculateTotalExpenses();
    return incomeNum - totalExpenses;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const totalExpenses = calculateTotalExpenses();
  const difference = calculateDifference();
  const incomeNum = parseFloat(income) || 0;

  // Calculate percentage for donut chart
  const expensesPercentage = incomeNum > 0 ? (totalExpenses / incomeNum) * 100 : 0;
  const remainingPercentage = incomeNum > 0 ? (Math.max(0, difference) / incomeNum) * 100 : 0;

  // Get expense categories with values for the chart
  const expenseData = Object.entries(expenses)
    .filter(([_, value]) => parseFloat(value) > 0)
    .map(([key, value]) => ({
      key: key as keyof typeof CATEGORY_COLORS,
      label: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS],
      value: parseFloat(value),
      color: CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS]
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <SiteHeader />
      
      <main className="flex-1 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Budget Calculator
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              If you've never budgeted before—or it's been a while—this budget calculator is a solid starting point. Type in your monthly take-home pay and get a budget example to begin.
            </p>
          </div>

          {/* Calculator Section */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 sm:p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Budget Calculator
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Enter your income and the calculator will show the national averages for most budget categories as a starting point. A few of these are recommendations (like giving). Most just reflect average spending (like debt). Don't have debt? Yay! Move that money to your current money goal.
            </p>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Column - Input Fields */}
              <div className="space-y-4">
                {/* Income */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Income</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Monthly Income (after taxes)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium text-sm">$</span>
                      <input
                        type="number"
                        value={income}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleIncomeChange(value);
                        }}
                        placeholder="0.00"
                        step="0.01"
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base font-medium text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Expenses */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Expenses</h3>
                  <div className="space-y-2">
                    {Object.keys(CATEGORY_LABELS).map((key) => {
                      const categoryKey = key as keyof typeof CATEGORY_LABELS;
                      const color = CATEGORY_COLORS[categoryKey];
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <div 
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: color }}
                          />
                          <div className="flex-1 flex items-center gap-2">
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
                              {CATEGORY_LABELS[categoryKey]}
                            </label>
                            <div className="relative">
                              <button
                                type="button"
                                onMouseEnter={() => setShowInfoTooltip(key)}
                                onMouseLeave={() => setShowInfoTooltip(null)}
                                className="w-3.5 h-3.5 rounded-full border border-slate-400 text-slate-400 hover:border-teal-600 hover:text-teal-600 flex items-center justify-center transition-colors text-[9px] font-bold"
                                aria-label={`Information about ${CATEGORY_LABELS[categoryKey]}`}
                              >
                                i
                              </button>
                              {showInfoTooltip === key && (
                                <div className="absolute left-0 top-full mt-1 z-50 w-80 bg-white rounded-lg shadow-xl border border-slate-200 p-3">
                                  <p className="text-xs text-slate-700 leading-relaxed">
                                    {CATEGORY_DESCRIPTIONS[categoryKey as keyof typeof CATEGORY_DESCRIPTIONS]}
                                  </p>
                                  <div className="absolute -top-1.5 left-3 w-3 h-3 bg-white border-l border-t border-slate-200 transform rotate-45"></div>
                                </div>
                              )}
                            </div>
                            <div className="relative flex-1">
                              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500 text-xs">$</span>
                              <input
                                type="number"
                                value={expenses[categoryKey] || ""}
                                onChange={(e) => handleExpenseChange(categoryKey, e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                className="w-full pl-6 pr-2 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-slate-900"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column - Visual Display */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-full max-w-sm">
                  {/* Donut Chart */}
                  <div className="relative w-full aspect-square mb-4">
                    <svg className="w-full h-full" viewBox="0 0 200 200">
                      {/* Helper function to convert angle to cartesian coordinates */}
                      {(() => {
                        const centerX = 100;
                        const centerY = 100;
                        const radius = 80;
                        const innerRadius = 60;
                        
                        // Convert angle from degrees to cartesian coordinates
                        const getCoordinates = (angle: number, r: number) => {
                          const radians = ((angle - 90) * Math.PI) / 180;
                          return {
                            x: centerX + r * Math.cos(radians),
                            y: centerY + r * Math.sin(radians)
                          };
                        };
                        
                        // Create arc path for a segment
                        const createArc = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
                          const startOuter = getCoordinates(startAngle, outerR);
                          const endOuter = getCoordinates(endAngle, outerR);
                          const startInner = getCoordinates(startAngle, innerR);
                          const endInner = getCoordinates(endAngle, innerR);
                          
                          const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                          
                          return `M ${startOuter.x} ${startOuter.y} A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y} L ${endInner.x} ${endInner.y} A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y} Z`;
                        };
                        
                        let currentAngle = 0;
                        
                        return (
                          <>
                            {/* Background circle */}
                            <circle
                              cx={centerX}
                              cy={centerY}
                              r={radius}
                              fill="#e2e8f0"
                            />
                            {/* Inner circle for donut hole */}
                            <circle
                              cx={centerX}
                              cy={centerY}
                              r={innerRadius}
                              fill="white"
                            />
                            
                            {/* Render expense segments */}
                            {totalExpenses > 0 && expenseData.map((item) => {
                              const segmentAngle = (item.value / totalExpenses) * 360;
                              const startAngle = currentAngle;
                              const endAngle = currentAngle + segmentAngle;
                              currentAngle = endAngle;
                              
                              return (
                                <path
                                  key={item.key}
                                  d={createArc(startAngle, endAngle, radius, innerRadius)}
                                  fill={item.color}
                                  className="transition-all duration-300"
                                />
                              );
                            })}
                            
                            {/* Remaining segment (if difference > 0) */}
                            {difference > 0 && currentAngle < 360 && (
                              <path
                                d={createArc(currentAngle, 360, radius, innerRadius)}
                                fill="#e2e8f0"
                                className="transition-all duration-300"
                              />
                            )}
                          </>
                        );
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-xs text-slate-600 font-medium">Total Expenses</p>
                      <p className="text-2xl font-bold text-slate-900 mt-0.5">{formatCurrency(totalExpenses)}</p>
                    </div>
                  </div>

                  {/* Difference */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="text-center">
                      <h3 className="text-base font-bold text-slate-900 mb-1">Difference</h3>
                      <p className={`text-3xl font-bold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(difference))}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {difference >= 0 ? 'Remaining' : 'Over Budget'}
                      </p>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  {expenseData.length > 0 && (
                    <div className="mt-4 bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Expense Breakdown</h3>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {expenseData.map((item) => {
                          const percentage = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
                          return (
                            <div key={item.key} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-slate-700">{item.label}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-medium text-slate-900">{formatCurrency(item.value)}</span>
                                <span className="text-slate-500 ml-2">({percentage.toFixed(1)}%)</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Insights Section */}
          {incomeNum > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 sm:p-6 mt-4">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Budget Insights</h2>
              
              {difference < 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-red-900 mb-1">
                        You're overspending by {formatCurrency(Math.abs(difference))} per month
                      </h3>
                      <p className="text-sm text-red-800 mb-3">
                        Don't freak out. This is just a wake-up call! You can get that number to zero. Just give every dollar a job—giving, saving and spending—without overspending! It's time to make some changes.
                      </p>
                      <div className="space-y-1.5 text-xs text-red-700">
                        <p className="font-semibold">Try this:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>Review your expenses and identify areas to cut back</li>
                          <li>Consider reducing discretionary spending</li>
                          <li>Find ways to increase your income</li>
                          <li>Move money from non-essential categories to cover essentials</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : difference > 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-green-900 mb-1">
                        Great! You have {formatCurrency(difference)} remaining each month
                      </h3>
                      <p className="text-sm text-green-800 mb-3">
                        Bravo! Time to give those dollars a job—build up your savings or pay off your debt. Whatever your current money goal is, get after it!
                      </p>
                      <div className="space-y-1.5 text-xs text-green-700">
                        <p className="font-semibold">Consider allocating this surplus to:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>Emergency fund (3-6 months of expenses)</li>
                          <li>Debt payoff (if you have debt)</li>
                          <li>Retirement savings (15% of income recommended)</li>
                          <li>Other financial goals</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-blue-900 mb-1">
                        Your income and expenses are balanced!
                      </h3>
                      <p className="text-sm text-blue-800">
                        Perfect! Your budget is working. Consider building an emergency fund and investing for long-term wealth if you haven't already.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
