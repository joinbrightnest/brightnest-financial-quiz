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

  // Track which fields were manually edited by the user
  const [manuallyEditedFields, setManuallyEditedFields] = useState<Set<string>>(new Set());
  
  // Track hovered segment in donut chart
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  
  // Share functionality
  const [linkCopied, setLinkCopied] = useState(false);

  const copyLinkToClipboard = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  // Auto-populate with national averages when income is entered (debounced)
  useEffect(() => {
    const incomeNum = parseFloat(income);
    const hasValidIncome = income && income.trim() !== "" && !isNaN(incomeNum) && incomeNum > 0;
    
    // Debounce: wait for user to finish typing (300ms delay - shorter for better responsiveness)
    const timeoutId = setTimeout(() => {
      // Auto-populate or clear fields based on income
      setExpenses(prev => {
        const newExpenses = { ...prev };
        let hasChanges = false;
        let totalCalculated = 0;
        const calculatedValues: { [key: string]: number } = {};
        
        // First pass: calculate all values and track total
        Object.keys(NATIONAL_AVERAGES).forEach((key) => {
          const categoryKey = key as keyof typeof NATIONAL_AVERAGES;
          const percentage = NATIONAL_AVERAGES[categoryKey];
          
          // Skip if this field was manually edited by the user
          if (manuallyEditedFields.has(categoryKey)) {
            return; // Keep user's manual input
          }
          
          if (hasValidIncome && percentage > 0) {
            const calculatedValue = incomeNum * percentage;
            calculatedValues[categoryKey] = calculatedValue;
            totalCalculated += calculatedValue;
          }
        });
        
        // If there are calculated values, adjust for rounding
        if (Object.keys(calculatedValues).length > 0) {
          const totalRounded = Object.values(calculatedValues).reduce((sum, val) => sum + Math.round(val), 0);
          const adjustment = Math.round(incomeNum) - totalRounded;
          
          // Apply rounding with adjustment to make total match income
          Object.keys(NATIONAL_AVERAGES).forEach((key) => {
            const categoryKey = key as keyof typeof NATIONAL_AVERAGES;
            const percentage = NATIONAL_AVERAGES[categoryKey];
            
            // Skip if this field was manually edited by the user
            if (manuallyEditedFields.has(categoryKey)) {
              return; // Keep user's manual input
            }
            
            if (hasValidIncome) {
              if (percentage > 0) {
                let roundedValue = Math.round(calculatedValues[categoryKey] || 0);
                
                // Apply adjustment to the largest category to balance the total
                if (adjustment !== 0 && key === 'housing') {
                  roundedValue += adjustment;
                  roundedValue = Math.max(0, roundedValue); // Ensure non-negative
                }
                
                const newValue = roundedValue > 0 ? roundedValue.toString() : "";
                
                // Update if value changed
                if (prev[categoryKey as keyof typeof prev] !== newValue) {
                  newExpenses[categoryKey] = newValue;
                  hasChanges = true;
                }
              } else {
                // For 0% categories, clear if not manually edited
                if (prev[categoryKey as keyof typeof prev] !== "") {
                  newExpenses[categoryKey] = "";
                  hasChanges = true;
                }
              }
            }
          });
        } else {
          // No calculated values, just clear all fields
          Object.keys(NATIONAL_AVERAGES).forEach((key) => {
            const categoryKey = key as keyof typeof NATIONAL_AVERAGES;
            
            // Skip if this field was manually edited by the user
            if (manuallyEditedFields.has(categoryKey)) {
              return; // Keep user's manual input
            }
            
            if (prev[categoryKey as keyof typeof prev] !== "") {
              newExpenses[categoryKey] = "";
              hasChanges = true;
            }
          });
        }
        
        // Only update state if there were actual changes
        return hasChanges ? newExpenses : prev;
      });
    }, 300); // Wait 300ms after user stops typing
    
    // Cleanup timeout if income changes again
    return () => clearTimeout(timeoutId);
  }, [income, manuallyEditedFields]);

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
    
    // Mark this field as manually edited
    setManuallyEditedFields(prev => {
      const newSet = new Set(prev);
      newSet.add(category);
      return newSet;
    });
    
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
    // Note: Auto-population will trigger via useEffect when income changes
    // It will only update fields that weren't manually edited
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
      
      <main className="flex-1">
        {/* Full-width Banner with Fine Fade */}
        <div 
          className="relative py-12 sm:py-16 lg:py-20 overflow-hidden"
          style={{ 
            background: 'linear-gradient(to right, #FDFDFB 0%, #FCFCF9 50%, #FDFBF7 100%)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center animate-fade-in">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-4 sm:mb-6 leading-tight tracking-tight">
                Budget <span style={{ color: '#3D6B54' }}>Calculator</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed font-light">
                If you've never budgeted before—or it's been a while—this budget calculator is a solid starting point. Type in your monthly take-home pay and get a budget example to begin.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          {/* Calculator Section */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-4 tracking-tight">
              Budget Calculator
            </h2>
            <p className="text-base sm:text-lg text-slate-700 mb-8 leading-relaxed font-light">
              Enter your income and the calculator will show the national averages for most budget categories as a starting point. A few of these are recommendations (like giving). Most just reflect average spending (like debt). Don't have debt? Yay! Move that money to your current money goal.
            </p>

            <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Left Column - Input Fields */}
              <div className="space-y-4 order-2 lg:order-1">
                {/* Income */}
                <div>
                  <h3 className="text-lg font-light text-slate-900 mb-3">Income</h3>
                  <div>
                    <label className="block text-sm font-light text-slate-700 mb-2">
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
                        className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base font-medium text-slate-900 touch-friendly"
                      />
                    </div>
                  </div>
                </div>

                {/* Expenses */}
                <div>
                  <h3 className="text-lg font-light text-slate-900 mb-3">Expenses</h3>
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
                          <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <div className="flex items-center gap-1.5 w-full sm:w-auto">
                              <label className="block text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
                                {CATEGORY_LABELS[categoryKey]}
                              </label>
                              <div className="relative">
                                <button
                                  type="button"
                                  onMouseEnter={() => setShowInfoTooltip(key)}
                                  onMouseLeave={() => setShowInfoTooltip(null)}
                                  onFocus={() => setShowInfoTooltip(key)}
                                  onBlur={() => setShowInfoTooltip(null)}
                                  className="w-3.5 h-3.5 rounded-full border border-slate-400 text-slate-400 hover:border-teal-600 hover:text-teal-600 flex items-center justify-center transition-colors text-[9px] font-bold touch-friendly"
                                  aria-label={`Information about ${CATEGORY_LABELS[categoryKey]}`}
                                >
                                  i
                                </button>
                                {showInfoTooltip === key && (
                                  <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1 z-50 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-slate-200 p-3">
                                    <p className="text-xs text-slate-700 leading-relaxed">
                                      {CATEGORY_DESCRIPTIONS[categoryKey as keyof typeof CATEGORY_DESCRIPTIONS]}
                                    </p>
                                    <div className="absolute -top-1.5 left-3 sm:right-3 w-3 h-3 bg-white border-l border-t border-slate-200 transform rotate-45"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="relative w-full sm:flex-1 min-w-0">
                              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500 text-xs">$</span>
                              <input
                                type="number"
                                value={expenses[categoryKey] || ""}
                                onChange={(e) => handleExpenseChange(categoryKey, e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                className="w-full pl-6 pr-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-slate-900 touch-friendly"
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
              <div className="flex flex-col items-center justify-center order-1 lg:order-2 mb-6 lg:mb-0">
                <div className="w-full max-w-lg">
                  {/* Donut Chart */}
                  <div className="relative w-full aspect-square mb-4 max-w-lg mx-auto">
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
                        
                        // Reset currentAngle for each render to prevent accumulation bugs
                        let currentAngle = 0;
                        
                        // Calculate total angle used by expenses
                        const totalExpenseAngle = totalExpenses > 0 
                          ? expenseData.reduce((sum, item) => sum + (item.value / totalExpenses) * 360, 0)
                          : 0;
                        
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
                            {totalExpenses > 0 && expenseData.map((item, index) => {
                              const segmentAngle = (item.value / totalExpenses) * 360;
                              const startAngle = currentAngle;
                              const endAngle = currentAngle + segmentAngle;
                              const isHovered = hoveredSegment === item.key;
                              
                              // Update currentAngle for next segment
                              currentAngle = endAngle;
                              
                              // Calculate opacity for hover effect - brighten on hover
                              const opacity = isHovered ? 1 : 0.85;
                              
                              // Only render if segment has a meaningful angle (> 0.1 degrees to avoid rendering issues)
                              if (segmentAngle < 0.1) return null;
                              
                              return (
                                <g key={`${item.key}-${index}`}>
                                  <path
                                    d={createArc(startAngle, endAngle, radius, innerRadius)}
                                    fill={item.color}
                                    opacity={opacity}
                                    className="transition-all duration-300 cursor-pointer"
                                    onMouseEnter={() => setHoveredSegment(item.key)}
                                    onMouseLeave={() => setHoveredSegment(null)}
                                  />
                                  {/* Invisible larger hit area for easier hovering */}
                                  <path
                                    d={createArc(startAngle, endAngle, radius + 5, innerRadius - 5)}
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredSegment(item.key)}
                                    onMouseLeave={() => setHoveredSegment(null)}
                                  />
                                </g>
                              );
                            })}
                            
                            {/* Remaining segment (if difference > 0 and there's remaining space) */}
                            {difference > 0 && totalExpenseAngle < 360 && (
                              <path
                                d={createArc(totalExpenseAngle, 360, radius, innerRadius)}
                                fill="#e2e8f0"
                                className="transition-all duration-300"
                              />
                            )}
                          </>
                        );
                      })()}
                    </svg>
                    {/* Center Display - Animated on Hover */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      {hoveredSegment && expenseData.find(item => item.key === hoveredSegment) ? (
                        <div className="animate-slide-up text-center">
                          {(() => {
                            const hoveredItem = expenseData.find(item => item.key === hoveredSegment)!;
                            const percentage = totalExpenses > 0 ? (hoveredItem.value / totalExpenses) * 100 : 0;
                            return (
                              <>
                                <div 
                                  className="w-3.5 h-3.5 rounded-full mb-2.5 mx-auto transition-all duration-300 shadow-sm"
                                  style={{ backgroundColor: hoveredItem.color }}
                                />
                                <p className="text-xs sm:text-sm font-semibold text-slate-800 mb-1.5 transition-all duration-300 tracking-wide">
                                  {hoveredItem.label}
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 transition-all duration-300 tracking-tight">
                                  {formatCurrency(hoveredItem.value)}
                                </p>
                                <p className="text-xs font-medium text-slate-500 transition-all duration-300">
                                  {percentage.toFixed(1)}%
                                </p>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="transform transition-all duration-200 ease-out text-center">
                          <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-1.5 tracking-wide">Total Expenses</p>
                          <p className="text-3xl sm:text-4xl font-bold text-slate-900 mt-0.5 tracking-tight">{formatCurrency(totalExpenses)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Cards - Professional Layout */}
                  <div className="mt-6 space-y-4">
                    {/* Difference Card - Full Width, Prominent */}
                    <div className={`rounded-xl p-5 border-2 shadow-sm transition-all duration-300 ${
                      difference >= 0 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-slate-700 mb-1 tracking-wide">
                            {difference >= 0 ? 'Remaining Budget' : 'Over Budget'}
                          </h3>
                          <p className={`text-4xl sm:text-5xl font-bold ${difference >= 0 ? 'text-green-700' : 'text-red-700'} tracking-tight`}>
                            {formatCurrency(Math.abs(difference))}
                          </p>
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          difference >= 0 ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {difference >= 0 ? (
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expense Breakdown - Horizontal Layout, Full Width */}
                    {expenseData.length > 0 && (
                      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm w-full">
                        <h3 className="text-base font-semibold text-slate-900 mb-4 tracking-wide">Expense Breakdown</h3>
                        <div className="flex flex-wrap gap-3 w-full">
                          {expenseData.map((item) => {
                            const percentage = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
                            return (
                              <div key={item.key} className="flex items-center gap-2 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200 min-w-0 flex-shrink-0">
                                <div 
                                  className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" 
                                  style={{ backgroundColor: item.color }}
                                />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-medium text-slate-700 whitespace-nowrap">{item.label}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900">{formatCurrency(item.value)}</span>
                                    <span className="text-xs text-slate-500">({percentage.toFixed(1)}%)</span>
                                  </div>
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
          </div>

          {/* Insights Section */}
          {incomeNum > 0 && (
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 sm:p-8 mt-6 sm:mt-8">
              <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-6 tracking-tight">Budget Insights</h2>
              
              {difference < 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-light text-red-900 mb-3">
                        You're overspending by {formatCurrency(Math.abs(difference))} per month
                      </h3>
                      <p className="text-base text-red-800 mb-4 font-light">
                        Don't freak out. This is just a wake-up call! You can get that number to zero. Just give every dollar a job—giving, saving and spending—without overspending! It's time to make some changes.
                      </p>
                      <div className="space-y-2 text-sm text-red-700 font-light">
                        <p className="font-light">Try this:</p>
                        <ul className="list-disc list-inside space-y-1">
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
                      <h3 className="text-lg font-light text-green-900 mb-3">
                        Great! You have {formatCurrency(difference)} remaining each month
                      </h3>
                      <p className="text-base text-green-800 mb-4 font-light">
                        Bravo! Time to give those dollars a job—build up your savings or pay off your debt. Whatever your current money goal is, get after it!
                      </p>
                      <div className="space-y-2 text-sm text-green-700 font-light">
                        <p className="font-light">Consider allocating this surplus to:</p>
                        <ul className="list-disc list-inside space-y-1">
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
                      <h3 className="text-lg font-light text-blue-900 mb-3">
                        Your income and expenses are balanced!
                      </h3>
                      <p className="text-base text-blue-800 font-light">
                        Perfect! Your budget is working. Consider building an emergency fund and investing for long-term wealth if you haven't already.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Get the Most out of the Budget Calculator */}
          <div className="mt-12 sm:mt-16 lg:mt-20" style={{ background: 'linear-gradient(to right, #FDFDFB 0%, #FCFCF9 50%, #FDFBF7 100%)' }}>
            <div className="py-12 sm:py-16 lg:py-20">
              <div className="text-center mb-12 animate-fade-in">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                  Get the Most out of the <span style={{ color: '#3D6B54' }}>Budget Calculator</span>
                </h2>
                <div className="w-20 h-0.5 bg-[#3D6B54] mx-auto mb-6"></div>
                <p className="text-base sm:text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed font-light">
                  The budget calculator helps you see where you stand with your money right <strong className="font-light">now</strong>. But what if your income and expenses don't balance out? Great question. Try this:
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* See if you're overspending */}
                <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 bg-teal-50">
                      <svg className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-light text-slate-900 mb-3 group-hover:text-[#3D6B54] transition-colors duration-300">See if you're overspending.</h3>
                      <p className="text-base text-slate-700 leading-relaxed font-light">
                        Is there a red negative number at the bottom of your budget? Don't freak out. This is just a wake-up call! You can get that number to zero. Just give every dollar a job—giving, saving and spending—without overspending! It's time to make some changes. (Keep reading.)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Find ways to cut expenses */}
                <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 bg-teal-50">
                      <svg className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-light text-slate-900 mb-3 group-hover:text-[#3D6B54] transition-colors duration-300">Find ways to cut expenses.</h3>
                      <p className="text-base text-slate-700 leading-relaxed font-light">
                        Once you see you're overspending, you can fix the problem! Start by cutting down your spending. What if you took up meal planning to save on groceries? Get creative and cut the fluff where you can afford to. Then lower some numbers in the calculator based on this kind of planning.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Put extra money to work */}
                <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 bg-teal-50">
                      <svg className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-light text-slate-900 mb-3 group-hover:text-[#3D6B54] transition-colors duration-300">Put extra money to work.</h3>
                      <p className="text-base text-slate-700 leading-relaxed font-light">
                        Wait, did you have money left over after typing in all your expenses? Bravo! Time to give those dollars a job—build up your savings or pay off your debt. Whatever your current money goal is, get after it!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Make your first budget */}
                <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 bg-teal-50">
                      <svg className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-light text-slate-900 mb-3 group-hover:text-[#3D6B54] transition-colors duration-300">Make your first budget.</h3>
                      <p className="text-base text-slate-700 leading-relaxed font-light">
                        Okay, you worked through your numbers in this budget calculator. Awesome. But don't leave them on the screen. This is just the first step in your beautiful budgeting journey. Take these numbers and start telling your money where to go—one monthly budget at a time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices for the Budget Categories */}
          <div className="mt-12 sm:mt-16 lg:mt-20">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                Best Practices for the <span style={{ color: '#3D6B54' }}>Budget Categories</span>
              </h2>
              <div className="w-20 h-0.5 bg-[#3D6B54] mx-auto mb-6"></div>
              <p className="text-base sm:text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed font-light">
                Maybe you're still wondering how to find <strong className="font-light">your</strong> budget numbers, or you want to know how to build the best budget. Here's even more info on the budget categories to help!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Monthly Income */}
              <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.05s', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                    <svg className="w-5 h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Monthly Income</h3>
                </div>
                <div className="w-20 h-0.5 bg-[#3D6B54] mb-5"></div>
                <p className="text-base text-slate-700 leading-relaxed font-light">
                  This is your take-home pay after taxes. Put in your regular paycheck plus any extra money you plan to bring in (hello, side hustle).
                </p>
              </div>

              {/* Giving */}
              <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                    <svg className="w-5 h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Giving</h3>
                </div>
                <div className="w-20 h-0.5 bg-[#3D6B54] mb-5"></div>
                <p className="text-base text-slate-700 leading-relaxed font-light">
                  Be intentional about making generosity a regular part of your life. Start your budget by giving 10% of your income.
                </p>
              </div>

              {/* Savings */}
              <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                    <svg className="w-5 h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Savings</h3>
                </div>
                <div className="w-20 h-0.5 bg-[#3D6B54] mb-5"></div>
                <p className="text-base text-slate-700 leading-relaxed font-light">
                  If you're in debt, save $1,000 in a starter emergency fund. Then pause saving and focus on paying off that debt. Once you're debt-free, save up 3–6 months of expenses for a fully funded emergency fund. These are the first steps of your financial journey, and taking each step one at a time is how you make real progress with your money goals.
                </p>
              </div>

              {/* Food */}
              <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                    <svg className="w-5 h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Food</h3>
                </div>
                <div className="w-20 h-0.5 bg-[#3D6B54] mb-5"></div>
                <p className="text-base text-slate-700 leading-relaxed font-light">
                  Food is the easiest budget line to bust—and the hardest to plan for that first month. Open your bank account and see how much you spent on food last month. Then, you can tweak this number as you plan your spending for this month.
                </p>
              </div>

              {/* Utilities */}
              <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                    <svg className="w-5 h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Utilities</h3>
                </div>
                <div className="w-20 h-0.5 bg-[#3D6B54] mb-5"></div>
                <p className="text-base text-slate-700 leading-relaxed font-light">
                  Utilities are the essential expenses that keep your house running. The amounts can change, but check your bank account and see what you spent last month on electricity, water, the phone bill, natural gas, etc. Add those up and start with that number here.
                </p>
              </div>

              {/* Housing */}
              <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.35s', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                    <svg className="w-5 h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Housing</h3>
                </div>
                <div className="w-20 h-0.5 bg-[#3D6B54] mb-5"></div>
                <p className="text-base text-slate-700 leading-relaxed font-light">
                  Pro tip: When you spend 25% (or less) of your take-home pay on housing (mortgage or rent plus insurance, property taxes and HOA fees), one of your biggest blessings (your home) won't turn into a financial burden.
                </p>
              </div>

              {/* Transportation */}
              <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                    <svg className="w-5 h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Transportation</h3>
                </div>
                <div className="w-20 h-0.5 bg-[#3D6B54] mb-5"></div>
                <p className="text-base text-slate-700 leading-relaxed font-light">
                  Look back through your bank account and add up how much you spent on gas last month as a starting number for this category. Then don't forget auto insurance, maintenance, and anything else you spend on transportation.
                </p>
              </div>

              {/* Insurance */}
              <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.45s', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                    <svg className="w-5 h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Insurance</h3>
                </div>
                <div className="w-20 h-0.5 bg-[#3D6B54] mb-5"></div>
                <p className="text-base text-slate-700 leading-relaxed font-light">
                  You planned for homeowners/renters and auto coverage in other categories. Here, add what you spend on other insurances you need: term life, health, long-term disability, long-term care (if you're age 60+), identity theft, and umbrella (if you've got a net worth of $500,000 or more).
                </p>
              </div>

              {/* Household Items */}
              <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                    <svg className="w-5 h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Household Items</h3>
                </div>
                <div className="w-20 h-0.5 bg-[#3D6B54] mb-5"></div>
                <p className="text-base text-slate-700 leading-relaxed font-light">
                  Toothpaste, shampoo, laundry supplies: How much do you spend on these things each month? This is another hard one to pin down at first—but soon you'll be a pro here. (Not literally. No one goes pro planning toilet paper spending. Yet.)
                </p>
              </div>

              {/* Debt */}
              <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.55s', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                    <svg className="w-5 h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Debt</h3>
                </div>
                <div className="w-20 h-0.5 bg-[#3D6B54] mb-5"></div>
                <p className="text-base text-slate-700 leading-relaxed font-light">
                  Debt is any money you owe to anyone for any reason. So, add up all your car payments, credit card bills, student loans, medical debt and other payment plans and put that total here. Then start hustling to pay it off and really make progress with your money.
                </p>
              </div>

              {/* Retirement */}
              <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                    <svg className="w-5 h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Retirement</h3>
                </div>
                <div className="w-20 h-0.5 bg-[#3D6B54] mb-5"></div>
                <p className="text-base text-slate-700 leading-relaxed font-light">
                  When you're debt-free and your fully funded emergency fund is, well, fully funded, it's time for retirement savings! Start prepping for your future by investing 15% of your income.
                </p>
              </div>

              {/* Personal and Entertainment */}
              <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.65s', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                    <svg className="w-5 h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Personal and Entertainment</h3>
                </div>
                <div className="w-20 h-0.5 bg-[#3D6B54] mb-5"></div>
                <p className="text-base text-slate-700 leading-relaxed font-light">
                  This is what you plan to spend on all the fun stuff: concert tickets, family trips to the ballpark, bagpipe lessons, salon visits—all those exciting extras. (Just remember, needs come before wants.)
                </p>
              </div>

              {/* Other */}
              <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                    <svg className="w-5 h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Other</h3>
                </div>
                <div className="w-20 h-0.5 bg-[#3D6B54] mb-5"></div>
                <p className="text-base text-slate-700 leading-relaxed font-light">
                  This budget calculator only has the most common categories, but it probably doesn't cover everything you spend money on. Go ahead and add any other expenses here. When you start budgeting regularly, you can customize and add as many categories as you need.
                </p>
              </div>
            </div>
          </div>

          {/* Share Section - Narrow, Centered */}
          <div className="mt-12 sm:mt-16 lg:mt-20">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-6 text-center tracking-tight">Share the Budget Calculator</h2>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <button
                  onClick={copyLinkToClipboard}
                  className="flex items-center gap-2 text-white px-6 py-3 rounded-lg font-light text-base hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl flex-shrink-0"
                  style={{ backgroundColor: '#3D6B54' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {linkCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
