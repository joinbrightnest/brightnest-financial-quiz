"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function BudgetCalculatorPage() {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState({
    housing: "",
    utilities: "",
    food: "",
    transportation: "",
    healthcare: "",
    insurance: "",
    debt: "",
    savings: "",
    entertainment: "",
    other: ""
  });

  const handleExpenseChange = (category: string, value: string) => {
    setExpenses(prev => ({
      ...prev,
      [category]: value
    }));
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const totalExpenses = calculateTotalExpenses();
  const difference = calculateDifference();
  const incomeNum = parseFloat(income) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <SiteHeader />
      
      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Budget Calculator
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Track your income and expenses to see where your money is going. Build a budget that works for your lifestyle.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Budget</h2>
              
              {/* Monthly Income */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Monthly Income
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg"
                  />
                </div>
              </div>

              {/* Expenses */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Monthly Expenses</h3>
                
                {Object.entries(expenses).map(([category, value]) => (
                  <div key={category}>
                    <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                      {category === 'other' ? 'Other Expenses' : category}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleExpenseChange(category, e.target.value)}
                        placeholder="0"
                        className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl shadow-lg p-6 sm:p-8 text-white">
                <h2 className="text-2xl font-bold mb-6">Budget Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-teal-500/30">
                    <span className="text-teal-100">Monthly Income</span>
                    <span className="text-2xl font-bold">{formatCurrency(incomeNum)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-teal-500/30">
                    <span className="text-teal-100">Total Expenses</span>
                    <span className="text-xl font-semibold">{formatCurrency(totalExpenses)}</span>
                  </div>
                  
                  <div className={`flex justify-between items-center pt-3 ${difference >= 0 ? 'text-green-100' : 'text-red-100'}`}>
                    <span className="text-lg font-semibold">
                      {difference >= 0 ? 'Remaining' : 'Over Budget'}
                    </span>
                    <span className="text-3xl font-bold">
                      {formatCurrency(Math.abs(difference))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sm:p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Budget Insights</h3>
                
                {incomeNum === 0 && totalExpenses === 0 ? (
                  <p className="text-slate-600">
                    Enter your income and expenses above to see your budget breakdown and personalized recommendations.
                  </p>
                ) : difference < 0 ? (
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 font-semibold mb-2">
                        You're overspending by {formatCurrency(Math.abs(difference))} per month.
                      </p>
                      <p className="text-red-700 text-sm">
                        Review your expenses and identify areas to cut back. Consider reducing discretionary spending or finding ways to increase your income.
                      </p>
                    </div>
                    
                    {/* Expense Breakdown */}
                    {totalExpenses > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-slate-900 mb-3">Largest Expenses</h4>
                        <div className="space-y-2">
                          {Object.entries(expenses)
                            .filter(([_, value]) => parseFloat(value) > 0)
                            .sort(([_, a], [__, b]) => parseFloat(b) - parseFloat(a))
                            .slice(0, 3)
                            .map(([category, value]) => (
                              <div key={category} className="flex justify-between items-center text-sm">
                                <span className="text-slate-600 capitalize">{category}</span>
                                <span className="font-medium text-slate-900">
                                  {formatCurrency(parseFloat(value))}
                                  {' '}({((parseFloat(value) / totalExpenses) * 100).toFixed(1)}%)
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : difference > 0 ? (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-semibold mb-2">
                        Great! You have {formatCurrency(difference)} remaining each month.
                      </p>
                      <p className="text-green-700 text-sm">
                        Consider allocating this surplus to savings, emergency fund, or debt payoff for optimal financial health.
                      </p>
                    </div>
                    
                    {totalExpenses > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-slate-900 mb-3">Recommended Budget Split</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Needs (50%)</span>
                            <span className="font-medium text-slate-900">
                              {formatCurrency(incomeNum * 0.5)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Wants (30%)</span>
                            <span className="font-medium text-slate-900">
                              {formatCurrency(incomeNum * 0.3)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Savings (20%)</span>
                            <span className="font-medium text-slate-900">
                              {formatCurrency(incomeNum * 0.2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 font-semibold">
                      Your income and expenses are balanced!
                    </p>
                    <p className="text-blue-700 text-sm mt-2">
                      Consider building an emergency fund and investing for long-term wealth.
                    </p>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="bg-teal-50 rounded-xl border border-teal-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Budgeting Tips</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>Track every expense for at least one month to understand your spending patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>Automate savings by setting up automatic transfers on payday</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>Review and adjust your budget monthly as your income or expenses change</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-1">•</span>
                    <span>Build an emergency fund covering 3-6 months of expenses</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

