"use client";

import { useState, useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface Debt {
  id: string;
  type: string;
  name: string;
  balance: string;
  interestRate: string;
  minimumPayment: string;
}

const DEBT_TYPES = [
  "Choose a Debt Type",
  "Car Loan",
  "Credit Card",
  "Student Loan",
  "Other Non-Mortgage Debt"
];

const DEFAULT_INTEREST_RATES: { [key: string]: number } = {
  "Car Loan": 5,
  "Credit Card": 18,
  "Student Loan": 4,
  "Other Non-Mortgage Debt": 6
};

export default function DebtSnowballCalculatorPage() {
  const [debts, setDebts] = useState<Debt[]>([
    { id: "1", type: "Choose a Debt Type", name: "", balance: "", interestRate: "", minimumPayment: "" }
  ]);
  const [income, setIncome] = useState("");
  const [extraPayment, setExtraPayment] = useState("");
  const [showResults, setShowResults] = useState(false);
  
  // Results state
  const [debtsByType, setDebtsByType] = useState<{ [key: string]: Debt[] }>({});
  const [totalDebt, setTotalDebt] = useState<number>(0);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [debtFreeDate, setDebtFreeDate] = useState<string | null>(null);
  const [monthsToPayoff, setMonthsToPayoff] = useState<number>(0);
  const [sliderExtraPayment, setSliderExtraPayment] = useState<string>("0");
  const [sliderDebtFreeDate, setSliderDebtFreeDate] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [linkCopied, setLinkCopied] = useState(false);

  const copyLinkToClipboard = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const addDebt = () => {
    const newId = (debts.length + 1).toString();
    setDebts([
      ...debts,
      { id: newId, type: "Choose a Debt Type", name: "", balance: "", interestRate: "", minimumPayment: "" }
    ]);
  };

  const removeDebt = (id: string) => {
    if (debts.length > 1) {
      setDebts(debts.filter(debt => debt.id !== id));
    }
  };

  const updateDebt = (id: string, field: keyof Debt, value: string) => {
    setDebts(debts.map(debt => {
      if (debt.id === id) {
        // If changing the debt type, auto-populate interest rate
        if (field === 'type' && value !== "Choose a Debt Type") {
          return { ...debt, type: value, interestRate: DEFAULT_INTEREST_RATES[value]?.toString() || "" };
        }
        return { ...debt, [field]: value };
      }
      return debt;
    }));
  };

  // Calculate debt snowball with optional extra payment
  const calculatePayoff = (extraPaymentAmount: number = 0) => {
    const validDebts = debts.filter(debt => 
      debt.type !== "Choose a Debt Type" &&
      debt.balance && parseFloat(debt.balance) > 0 &&
      debt.minimumPayment && parseFloat(debt.minimumPayment) > 0
    );

    if (validDebts.length === 0) {
      return null;
    }

    // Sort debts by balance (smallest first - debt snowball method)
    const sortedDebts = [...validDebts].map(debt => ({
      balance: parseFloat(debt.balance),
      interestRate: parseFloat(debt.interestRate) || 0,
      minimumPayment: parseFloat(debt.minimumPayment)
    })).sort((a, b) => a.balance - b.balance);

    const totalMonthlyPayment = sortedDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const incomeNum = parseFloat(income) || 0;
    
    // Calculate available payment: either from income or from minimums + extra payment
    const totalAvailable = incomeNum > 0 ? incomeNum : totalMonthlyPayment + extraPaymentAmount;
    
    let months = 0;
    let workingDebts = sortedDebts.map(debt => ({
      balance: debt.balance,
      interestRate: debt.interestRate / 100 / 12, // Monthly interest rate
      minimumPayment: debt.minimumPayment
    }));

    // Calculate snowball payoff
    while (workingDebts.length > 0) {
      months++;
      
      // Apply interest to all debts first
      workingDebts = workingDebts.map(debt => ({
        ...debt,
        balance: debt.balance * (1 + debt.interestRate)
      }));
      
      // Calculate total minimum payments needed this month
      const currentMinPayments = workingDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
      
      // If we can't cover minimums, break
      if (totalAvailable < currentMinPayments) {
        break;
      }
      
      // Pay minimums on all debts except the smallest
      const otherDebtsMin = workingDebts.slice(1).reduce((sum, debt) => sum + debt.minimumPayment, 0);
      
      // Pay minimum on other debts
      workingDebts = workingDebts.map((debt, index) => 
        index === 0 
          ? debt // Skip smallest for now
          : {
              ...debt,
              balance: Math.max(0, debt.balance - debt.minimumPayment)
            }
      );
      
      // Pay everything left on smallest debt
      const paymentToSmallest = totalAvailable - otherDebtsMin;
      if (workingDebts[0]) {
        workingDebts[0].balance = Math.max(0, workingDebts[0].balance - paymentToSmallest);
      }
      
      // Remove paid off debts
      workingDebts = workingDebts.filter(debt => debt.balance >= 0.01);
      
      // Safety check to prevent infinite loop
      if (months > 600) {
        break;
      }
    }

    // Calculate debt-free date
    if (months > 0) {
      const today = new Date();
      const payoffDate = new Date(today);
      payoffDate.setMonth(payoffDate.getMonth() + months);
      return payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    return null;
  };

  // Calculate debt snowball
  const calculateResults = () => {
    // Validate inputs
    const validDebts = debts.filter(debt => 
      debt.type !== "Choose a Debt Type" &&
      debt.balance && parseFloat(debt.balance) > 0 &&
      debt.minimumPayment && parseFloat(debt.minimumPayment) > 0
    );

    if (validDebts.length === 0) {
      alert("Please add at least one valid debt");
      return;
    }

    // Group debts by type
    const grouped: { [key: string]: Debt[] } = {};
    validDebts.forEach(debt => {
      if (!grouped[debt.type]) {
        grouped[debt.type] = [];
      }
      grouped[debt.type].push(debt);
    });
    setDebtsByType(grouped);

    // Sort debts by balance (smallest first - debt snowball method)
    const sortedDebts = [...validDebts].map(debt => ({
      balance: parseFloat(debt.balance),
      interestRate: parseFloat(debt.interestRate) || 0,
      minimumPayment: parseFloat(debt.minimumPayment)
    })).sort((a, b) => a.balance - b.balance);

    const totalDebtAmount = sortedDebts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalMonthlyPayment = sortedDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    
    setTotalDebt(totalDebtAmount);
    setMonthlyPayment(totalMonthlyPayment);

    // Calculate payoff using the reusable function
    const extraPaymentNum = parseFloat(extraPayment) || 0;
    const calculatedDate = calculatePayoff(extraPaymentNum);
    setDebtFreeDate(calculatedDate);

    // Also calculate for slider (0 extra)
    const sliderDate = calculatePayoff(0);
    setSliderDebtFreeDate(sliderDate);

    setShowResults(true);
  };

  // Recalculate when slider changes
  useEffect(() => {
    if (showResults && debts.length > 0) {
      const sliderAmount = parseFloat(sliderExtraPayment) || 0;
      const newDate = calculatePayoff(sliderAmount);
      setSliderDebtFreeDate(newDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliderExtraPayment, showResults]);

  // Scroll to top when results page loads
  useEffect(() => {
    if (showResults) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showResults]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getDebtTypeIcon = (type: string) => {
    switch(type) {
      case "Credit Card":
        return (
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case "Car Loan":
        return (
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "Student Loan":
        return (
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        );
      case "Other Non-Mortgage Debt":
        return (
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (showResults) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <SiteHeader />
        
        <main className="flex-1 py-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="relative py-6 mb-6 overflow-hidden rounded-2xl border border-slate-200/50 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-teal-50 to-amber-50"></div>
              <div className="absolute top-0 right-0 w-72 h-72 bg-teal-100/60 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-100/60 rounded-full blur-3xl"></div>
              
              <div className="relative text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  Your <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">Debt Results</span>
                </h1>
                <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                  See your complete debt picture and find out exactly when you'll be debt-free!
                </p>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Left Column - Debt Breakdown */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Your Debt Breakdown</h2>
                  <button
                    onClick={() => setShowResults(false)}
                    className="text-teal-600 hover:text-teal-700 text-sm font-bold"
                  >
                    ← Back to Your Debts
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {DEBT_TYPES.filter(type => type !== "Choose a Debt Type").map(type => {
                    const typeDebts = debtsByType[type] || [];
                    const typeTotal = typeDebts.reduce((sum, debt) => sum + parseFloat(debt.balance), 0);
                    
                    const isExpanded = expandedCategories.has(type);
                    
                    return (
                      <div key={type} className="border-b border-slate-200 pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => {
                            if (typeDebts.length > 0) {
                              setExpandedCategories(prev => {
                                const newSet = new Set(prev);
                                if (isExpanded) {
                                  newSet.delete(type);
                                } else {
                                  newSet.add(type);
                                }
                                return newSet;
                              });
                            }
                          }}>
                            {getDebtTypeIcon(type)}
                            <h3 className="font-bold text-teal-600">{type}s</h3>
                            {typeDebts.length > 0 && (
                              <svg className={`w-4 h-4 text-teal-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </div>
                          <span className={`font-medium ${typeTotal > 0 ? 'text-teal-600' : 'text-slate-900'}`}>
                            {formatCurrency(typeTotal)}
                          </span>
                        </div>
                        {typeDebts.length > 0 && isExpanded && (
                          <div className="pl-7 space-y-1 mt-2">
                            {typeDebts.map((debt, idx) => (
                              <div key={debt.id} className="text-sm text-slate-600">
                                {debt.name || `${type} ${idx + 1}`}: {formatCurrency(parseFloat(debt.balance))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="border-t-2 border-slate-200 pt-4">
                  <div className="text-center">
                    <div className="text-teal-700 font-bold uppercase mb-2">TOTAL DEBT</div>
                    <div className="text-5xl font-bold text-slate-900">{formatCurrency(totalDebt)}</div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-700">
                    Debt is stealing <strong>{formatCurrency(monthlyPayment)}</strong> of your income every month!
                  </p>
                </div>
              </div>

              {/* Right Column - Debt-Free Date */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Your Debt-Free Date</h2>
                
                {debtFreeDate ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-slate-600 mb-4 text-center">
                        If you continue making only minimum payments, you'll be debt-free:
                      </p>
                      <div className="bg-slate-100 rounded-xl p-8 text-center mb-4">
                        <div className="text-4xl sm:text-5xl font-bold text-slate-800">
                          {debtFreeDate}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                      <p className="text-sm text-slate-600 mb-4 text-center">
                        Want to be debt-free sooner? Of course you do! Add an extra monthly payment to see how much faster you'll pay off your debt.
                      </p>
                      <p className="text-teal-600 font-bold text-center mb-4">
                        Boost your payments to pay off your debt even faster!
                      </p>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 text-center">
                          Extra Monthly Payment
                        </label>
                        <div className="relative mb-3">
                          <input
                            type="number"
                            value={sliderExtraPayment}
                            onChange={(e) => setSliderExtraPayment(e.target.value)}
                            placeholder="0"
                            step="100"
                            className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base font-medium text-slate-900"
                          />
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="5000"
                          step="100"
                          value={parseFloat(sliderExtraPayment) || 0}
                          onChange={(e) => setSliderExtraPayment(e.target.value)}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>$0</span>
                          <span>$5,000</span>
                        </div>
                      </div>

                      {sliderDebtFreeDate && sliderExtraPayment !== "0" && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <p className="text-xs text-slate-600 mb-2">With this extra payment:</p>
                          <div className="bg-teal-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-teal-700">
                              {sliderDebtFreeDate}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">
                      Add your household income or extra monthly payment to calculate your debt-free date.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Educational Content Below Results */}
            <div className="space-y-16 max-w-3xl mx-auto mt-12">
              {/* What Is the Debt Snowball? */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  What Is the Debt Snowball?
                </h2>
                <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                  The Debt Snowball is one of the simplest — and most effective — ways to get out of debt.
                </p>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  Instead of worrying about interest rates or complex spreadsheets, you focus on one thing: momentum.
                </p>

                <div className="bg-slate-50 rounded-lg p-6 mb-6">
                  <p className="text-lg font-medium text-slate-900 mb-3">Here's how it works:</p>
                  <p className="text-lg text-slate-600 mb-3 leading-relaxed">
                    You pay off your debts from the smallest to the largest balance, regardless of interest rate. Once the smallest is gone, you take the money you were putting toward it and roll it into the next one.
                  </p>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Little by little, your payments grow — and so does your motivation. That's why we call it a snowball.
                  </p>
                </div>

                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Each win gives you energy to tackle the next. Eventually, you're not just managing debt — you're destroying it.
                </p>

                <div className="border-l-4 border-teal-600 pl-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">How to Start the Debt Snowball</h3>
                  <ol className="space-y-4 text-lg text-slate-700">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-base mt-0.5">1</span>
                      <span><strong className="text-slate-900">Write down all your debts,</strong> from smallest to largest — no exceptions.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-base mt-0.5">2</span>
                      <span><strong className="text-slate-900">Make the minimum payments</strong> on everything except the smallest one.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-base mt-0.5">3</span>
                      <span><strong className="text-slate-900">Throw every extra dollar</strong> you can at that smallest balance.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-base mt-0.5">4</span>
                      <span><strong className="text-slate-900">When it's gone, move to the next.</strong> Repeat until you're free.</span>
                    </li>
                  </ol>
                  <p className="text-lg text-slate-600 mt-6 italic">
                    That's it. No fancy formulas, no guessing games.<br />
                    Just focus, discipline, and progress you can actually see.
                  </p>
                </div>
              </div>

              {/* What Happens When the Snowball Starts Rolling */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  What Happens When the Snowball Starts Rolling
                </h2>
                <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                  Something powerful shifts — not just in your wallet, but in your behavior.
                </p>
                <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                  You start to realize how capable you are.
                </p>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  You stop feeling stuck, and you start believing change is possible.
                </p>
                <div className="bg-slate-50 rounded-lg p-6 text-center">
                  <p className="text-xl font-bold text-teal-700 mb-3 leading-relaxed">
                    That's the real magic of the Debt Snowball:
                  </p>
                  <p className="text-xl text-slate-900 font-semibold leading-relaxed">
                    It's not about math. It's about momentum and mindset.
                  </p>
                </div>
                <p className="text-lg text-slate-600 mt-6 leading-relaxed">
                  Because once you taste progress, you'll never go back to minimum payments again.
                </p>
              </div>

              {/* Debt Snowball vs Debt Avalanche */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Debt Snowball vs. Debt Avalanche
                </h2>
                <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                  You might've heard of another payoff method called the Debt Avalanche, where you tackle debts with the highest interest rate first.
                </p>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  On paper, it saves more money. But in real life, most people quit before they ever see results.
                </p>
                <div className="bg-slate-50 rounded-lg p-6 mb-6">
                  <p className="text-xl font-bold text-slate-900 mb-4 leading-relaxed">
                    Why? Because debt isn't a numbers problem — it's a behavior problem.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-medium text-slate-900 mb-1">When you start small and win early,</p>
                      <p className="text-lg text-slate-600 leading-relaxed">you build emotional momentum.</p>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-900 mb-1">When you start big and wait months for progress,</p>
                      <p className="text-lg text-slate-600 leading-relaxed">you lose steam.</p>
                    </div>
                  </div>
                </div>
                <div className="border-t-2 border-slate-200 pt-6">
                  <p className="text-lg text-slate-600 mb-2 leading-relaxed">
                    The Avalanche appeals to <strong className="text-slate-900">logic</strong>.
                  </p>
                  <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                    The Snowball works with <strong className="text-slate-900">human nature</strong>.
                  </p>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    And at BrightNest, that's what we teach: systems that align with how people actually behave, not how they wish they did.
                  </p>
                </div>
              </div>

              {/* Common Debt Terms */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Common Debt Terms — Explained Simply
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  We don't believe financial terms should sound like another language.
                </p>
                <p className="text-xl font-bold text-slate-900 mb-6">Here's what you need to know:</p>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Minimum Payment</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      The smallest amount you're required to pay each month. It keeps your account current — but it won't get you out of debt anytime soon.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Balance</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      How much you still owe. If you borrowed $10,000 and have paid $3,000, your balance is $7,000.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Interest Rate</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      The cost of borrowing money. It's how lenders make a profit — shown as a percentage of what you owe.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Principal</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      The original amount you borrowed — before interest is added.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Non-Mortgage Debt</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      All your consumer debt: credit cards, car loans, student loans, personal loans. Your home loan comes later, once you've cleared the rest.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Debt-Free Date</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      The day every cent of your consumer debt is gone.
                    </p>
                    <p className="text-lg text-slate-600 mt-2 leading-relaxed">
                      No more balances. No more bills you dread opening.
                    </p>
                    <p className="text-lg text-slate-600 mt-2 leading-relaxed">
                      That's the day freedom stops being a dream — and becomes your new normal.
                    </p>
                  </div>
                </div>
              </div>

              {/* Final Thought */}
              <div className="bg-slate-50 rounded-lg p-8 border border-slate-200">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Final Thought
                </h2>
                <p className="text-xl text-slate-600 mb-4 leading-relaxed">
                  The Debt Snowball isn't just about numbers — it's about behavior change.
                </p>
                <p className="text-xl text-slate-600 mb-6 leading-relaxed">
                  And that's exactly what BrightNest is built on: helping you rebuild the habits, beliefs, and systems that shape your financial life.
                </p>
                <div className="text-center pt-4 border-t border-slate-200">
                  <p className="text-2xl font-bold text-slate-900 leading-relaxed">
                    Start small. Stay consistent.
                  </p>
                  <p className="text-xl text-slate-600 mt-4 leading-relaxed">
                    Because once your snowball starts rolling, there's no stopping it.
                  </p>
                </div>
              </div>
            </div>
          </div>

        {/* Share Section */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Share the Debt Snowball Calculator</h2>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono text-sm"
                />
              </div>
              <button
                onClick={copyLinkToClipboard}
                className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {linkCopied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <SiteHeader />
      
      <main className="flex-1 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="relative py-6 mb-4 overflow-hidden rounded-2xl border border-slate-200/50 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-teal-50 to-amber-50"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-teal-100/60 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-100/60 rounded-full blur-3xl"></div>
            
            <div className="relative text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Debt Snowball <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">Calculator</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                Find out your debt-free date and accelerate your progress with the debt snowball method—the fastest way to pay off debt.
              </p>
            </div>
          </div>

          {/* Main Calculator Section - Compact Form */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-12">
              {/* Your Debts Section */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Your Debts</h2>
                <p className="text-sm text-slate-600 mb-4">
                  Start by listing out your <strong>non-mortgage</strong> debts.
                </p>

                {debts.map((debt, index) => (
                  <div key={debt.id} className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-base font-bold text-teal-600">Debt {index + 1}</span>
                      {debts.length > 1 && (
                        <button
                          onClick={() => removeDebt(debt.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Debt Type
                        </label>
                        <select
                          value={debt.type}
                          onChange={(e) => updateDebt(debt.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-slate-900 font-medium"
                        >
                          {DEBT_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Interest Rate
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={debt.interestRate}
                            onChange={(e) => updateDebt(debt.id, 'interestRate', e.target.value)}
                            placeholder="0"
                            step="0.01"
                            className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-slate-900 font-medium"
                          />
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium text-xs">%</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Balance
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={debt.balance}
                            onChange={(e) => updateDebt(debt.id, 'balance', e.target.value)}
                            placeholder="0"
                            step="0.01"
                            className="w-full pl-6 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-slate-900 font-medium"
                          />
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium text-xs">$</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Minimum Payment
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={debt.minimumPayment}
                            onChange={(e) => updateDebt(debt.id, 'minimumPayment', e.target.value)}
                            placeholder="0"
                            step="0.01"
                            className="w-full pl-6 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-slate-900 font-medium"
                          />
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium text-xs">$</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Account Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={debt.name}
                        onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                        placeholder="Visa, Discover Card, Lender Name"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-slate-900"
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addDebt}
                  className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors mb-6"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Debt
                </button>
              </div>

              {/* Household Income Section */}
              <div className="mb-6 border-t border-slate-200 pt-6">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Your Household Income</h2>
                <p className="text-sm text-slate-600 mb-3">
                  This includes <strong>any income</strong> you make each month after taxes (your paycheck, your side hustle—it all counts).
                </p>
                <div className="relative">
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base font-medium text-slate-900"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                </div>
              </div>

              {/* Additional Payment Section */}
              <div className="mb-6 border-t border-slate-200 pt-6">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Additional Payment</h2>
                <p className="text-sm text-slate-600 mb-3">
                  Next, to snowball your debt, enter the <strong>additional amount</strong> you want to pay above the minimum required payment.
                </p>
                <div className="relative">
                  <input
                    type="number"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(e.target.value)}
                    placeholder="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base font-medium text-slate-900"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={calculateResults}
                className="w-full bg-teal-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-teal-700 transition-colors"
              >
                Get Your Debt-Free Date
              </button>
            </div>

            {/* Educational Content */}
            <div className="space-y-16 max-w-3xl mx-auto">
              {/* What Is the Debt Snowball? */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  What Is the Debt Snowball?
                </h2>
                <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                  The Debt Snowball is one of the simplest — and most effective — ways to get out of debt.
                </p>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  Instead of worrying about interest rates or complex spreadsheets, you focus on one thing: momentum.
                </p>

                <div className="bg-slate-50 rounded-lg p-6 mb-6">
                  <p className="text-lg font-medium text-slate-900 mb-3">Here's how it works:</p>
                  <p className="text-lg text-slate-600 mb-3 leading-relaxed">
                    You pay off your debts from the smallest to the largest balance, regardless of interest rate. Once the smallest is gone, you take the money you were putting toward it and roll it into the next one.
                  </p>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Little by little, your payments grow — and so does your motivation. That's why we call it a snowball.
                  </p>
                </div>

                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Each win gives you energy to tackle the next. Eventually, you're not just managing debt — you're destroying it.
                </p>

                <div className="border-l-4 border-teal-600 pl-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">How to Start the Debt Snowball</h3>
                  <ol className="space-y-4 text-lg text-slate-700">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-base mt-0.5">1</span>
                      <span><strong className="text-slate-900">Write down all your debts,</strong> from smallest to largest — no exceptions.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-base mt-0.5">2</span>
                      <span><strong className="text-slate-900">Make the minimum payments</strong> on everything except the smallest one.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-base mt-0.5">3</span>
                      <span><strong className="text-slate-900">Throw every extra dollar</strong> you can at that smallest balance.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-base mt-0.5">4</span>
                      <span><strong className="text-slate-900">When it's gone, move to the next.</strong> Repeat until you're free.</span>
                    </li>
                  </ol>
                  <p className="text-lg text-slate-600 mt-6 italic">
                    That's it. No fancy formulas, no guessing games.<br />
                    Just focus, discipline, and progress you can actually see.
                  </p>
                </div>
              </div>

              {/* What Happens When the Snowball Starts Rolling */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  What Happens When the Snowball Starts Rolling
                </h2>
                <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                  Something powerful shifts — not just in your wallet, but in your behavior.
                </p>
                <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                  You start to realize how capable you are.
                </p>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  You stop feeling stuck, and you start believing change is possible.
                </p>
                <div className="bg-slate-50 rounded-lg p-6 text-center">
                  <p className="text-xl font-bold text-teal-700 mb-3 leading-relaxed">
                    That's the real magic of the Debt Snowball:
                  </p>
                  <p className="text-xl text-slate-900 font-semibold leading-relaxed">
                    It's not about math. It's about momentum and mindset.
                  </p>
                </div>
                <p className="text-lg text-slate-600 mt-6 leading-relaxed">
                  Because once you taste progress, you'll never go back to minimum payments again.
                </p>
              </div>

              {/* Debt Snowball vs Debt Avalanche */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Debt Snowball vs. Debt Avalanche
                </h2>
                <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                  You might've heard of another payoff method called the Debt Avalanche, where you tackle debts with the highest interest rate first.
                </p>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  On paper, it saves more money. But in real life, most people quit before they ever see results.
                </p>
                <div className="bg-slate-50 rounded-lg p-6 mb-6">
                  <p className="text-xl font-bold text-slate-900 mb-4 leading-relaxed">
                    Why? Because debt isn't a numbers problem — it's a behavior problem.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-medium text-slate-900 mb-1">When you start small and win early,</p>
                      <p className="text-lg text-slate-600 leading-relaxed">you build emotional momentum.</p>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-900 mb-1">When you start big and wait months for progress,</p>
                      <p className="text-lg text-slate-600 leading-relaxed">you lose steam.</p>
                    </div>
                  </div>
                </div>
                <div className="border-t-2 border-slate-200 pt-6">
                  <p className="text-lg text-slate-600 mb-2 leading-relaxed">
                    The Avalanche appeals to <strong className="text-slate-900">logic</strong>.
                  </p>
                  <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                    The Snowball works with <strong className="text-slate-900">human nature</strong>.
                  </p>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    And at BrightNest, that's what we teach: systems that align with how people actually behave, not how they wish they did.
                  </p>
                </div>
              </div>

              {/* Common Debt Terms */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Common Debt Terms — Explained Simply
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  We don't believe financial terms should sound like another language.
                </p>
                <p className="text-xl font-bold text-slate-900 mb-6">Here's what you need to know:</p>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Minimum Payment</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      The smallest amount you're required to pay each month. It keeps your account current — but it won't get you out of debt anytime soon.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Balance</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      How much you still owe. If you borrowed $10,000 and have paid $3,000, your balance is $7,000.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Interest Rate</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      The cost of borrowing money. It's how lenders make a profit — shown as a percentage of what you owe.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Principal</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      The original amount you borrowed — before interest is added.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Non-Mortgage Debt</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      All your consumer debt: credit cards, car loans, student loans, personal loans. Your home loan comes later, once you've cleared the rest.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Debt-Free Date</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      The day every cent of your consumer debt is gone.
                    </p>
                    <p className="text-lg text-slate-600 mt-2 leading-relaxed">
                      No more balances. No more bills you dread opening.
                    </p>
                    <p className="text-lg text-slate-600 mt-2 leading-relaxed">
                      That's the day freedom stops being a dream — and becomes your new normal.
                    </p>
                  </div>
                </div>
              </div>

              {/* Final Thought */}
              <div className="bg-slate-50 rounded-lg p-8 border border-slate-200">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Final Thought
                </h2>
                <p className="text-xl text-slate-600 mb-4 leading-relaxed">
                  The Debt Snowball isn't just about numbers — it's about behavior change.
                </p>
                <p className="text-xl text-slate-600 mb-6 leading-relaxed">
                  And that's exactly what BrightNest is built on: helping you rebuild the habits, beliefs, and systems that shape your financial life.
                </p>
                <div className="text-center pt-4 border-t border-slate-200">
                  <p className="text-2xl font-bold text-slate-900 leading-relaxed">
                    Start small. Stay consistent.
                  </p>
                  <p className="text-xl text-slate-600 mt-4 leading-relaxed">
                    Because once your snowball starts rolling, there's no stopping it.
                  </p>
                </div>
              </div>
            </div>

            {/* Share Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Share the Debt Snowball Calculator</h2>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono text-sm"
                  />
                </div>
                <button
                  onClick={copyLinkToClipboard}
                  className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors whitespace-nowrap"
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
