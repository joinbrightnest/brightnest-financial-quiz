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
  const [error, setError] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");

  // Set the current URL on mount to ensure correct page URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
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
      setError("Please add at least one valid debt");
      return;
    }
    
    // Clear error if we have valid debts
    setError("");

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
        
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div 
              className="relative py-8 sm:py-12 lg:py-16 overflow-hidden mb-4 sm:mb-6"
              style={{ 
                background: 'linear-gradient(to right, #FDFDFB 0%, #FCFCF9 50%, #FDFBF7 100%)'
              }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center animate-fade-in">
                  <h1 className="text-2xl sm:text-3xl lg:text-5xl font-light text-slate-900 mb-3 sm:mb-4 lg:mb-6 leading-tight tracking-tight">
                    Your <span style={{ color: '#3D6B54' }}>Debt Results</span>
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed font-light">
                    See your complete debt picture and find out exactly when you'll be debt-free!
                  </p>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
              {/* Left Column - Debt Breakdown */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-3">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Your Debt Breakdown</h2>
                  <button
                    onClick={() => setShowResults(false)}
                    className="text-teal-600 hover:text-teal-700 text-xs sm:text-sm font-bold self-start sm:self-auto px-2 py-1"
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
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-3 sm:p-4 lg:p-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 text-center">Your Debt-Free Date</h2>
                
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
                            className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base font-medium text-slate-900 touch-friendly"
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
            <div className="space-y-12 sm:space-y-16 lg:space-y-20 max-w-3xl mx-auto py-8">
              {/* What Is the Debt Snowball? */}
              <div className="animate-fade-in">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                  What Is the <span style={{ color: '#3D6B54' }}>Debt Snowball</span>?
                </h2>
                <div className="w-20 h-0.5 bg-[#3D6B54] mx-auto mb-6"></div>
                <p className="text-base sm:text-lg text-slate-700 mb-4 leading-relaxed font-light">
                  The debt snowball is a debt payoff method where you pay your debts from smallest to largest, regardless of interest rate. Knock out the smallest debt first. Then, take what you were paying on that debt and add it to the payment of your next smallest debt.
                </p>
                <p className="text-base sm:text-lg text-slate-700 mb-8 leading-relaxed font-light">
                  Why a snowball? Because just like a snowball rolling downhill, paying off debt is all about momentum. With every debt you pay off, you gain speed until you're an unstoppable, debt-crushing force.
                </p>

                <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 sm:p-8 lg:p-10 mb-8">
                  <h3 className="text-2xl sm:text-3xl font-light text-slate-900 mb-6 tracking-tight">Here's how the debt snowball works:</h3>
                  <ol className="space-y-6">
                    <li className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-12 h-12 rounded-full text-white font-light flex items-center justify-center text-lg" style={{ backgroundColor: '#3D6B54' }}>1</span>
                      <div>
                        <p className="text-lg font-light text-slate-900 mb-1">List your debts from smallest to largest regardless of interest rate.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-12 h-12 rounded-full text-white font-light flex items-center justify-center text-lg" style={{ backgroundColor: '#3D6B54' }}>2</span>
                      <div>
                        <p className="text-lg font-light text-slate-900 mb-1">Make minimum payments on all your debts except the smallest.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-12 h-12 rounded-full text-white font-light flex items-center justify-center text-lg" style={{ backgroundColor: '#3D6B54' }}>3</span>
                      <div>
                        <p className="text-lg font-light text-slate-900 mb-1">Pay as much as possible on your smallest debt.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-12 h-12 rounded-full text-white font-light flex items-center justify-center text-lg" style={{ backgroundColor: '#3D6B54' }}>4</span>
                      <div>
                        <p className="text-lg font-light text-slate-900 mb-1">Repeat until each debt is paid in full.</p>
                      </div>
                    </li>
                  </ol>
                  <p className="text-base sm:text-lg text-slate-700 mt-6 leading-relaxed font-light">
                    What happens then? Freedom. No more payments. No more answering to collectors. No more watching your paychecks disappear.
                  </p>
                  <p className="text-base sm:text-lg text-slate-700 mt-4 leading-relaxed font-light">
                    Because when you get hyper-focused and start chucking every dollar you can at your debt, you'll see how much faster you can pay it all off. Sorry, minimum payments. You're just not good enough.
                  </p>
                </div>
              </div>

              {/* Debt Snowball vs Debt Avalanche */}
              <div className="border-t border-slate-200 pt-12 animate-fade-in">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                  Debt Snowball vs. <span style={{ color: '#3D6B54' }}>Debt Avalanche</span>
                </h2>
                <div className="w-20 h-0.5 bg-[#3D6B54] mx-auto mb-6"></div>
                <p className="text-base sm:text-lg text-slate-700 mb-4 leading-relaxed font-light">
                  Maybe you've heard of another way to pay off debt—the debt avalanche. Sounds epic, right? Wrong. With the debt avalanche, you pay your debts in order from the highest interest rate to the lowest, regardless of the balance.
                </p>
                <p className="text-base sm:text-lg text-slate-700 mb-6 leading-relaxed font-light">
                  That might sound like smart math. Here's why it's not: <strong className="font-light">Debt isn't a math problem. It's a behavior problem.</strong>
                </p>
                <p className="text-base sm:text-lg text-slate-700 mb-4 leading-relaxed font-light">
                  If you want to change your behavior and get out of debt, you need to stay motivated. With the debt avalanche, you may not see progress on your first debt for a long time. That's motivating nobody. You're way more likely to lose steam and give up.
                </p>
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-light">
                  But when you use the debt snowball, you get quick wins sooner. Crush the first debt fast. Boom. On to the next. Now, you're cooking. Suddenly, you start believing that getting out of debt is within reach. Motivation is the key to becoming debt-free, not math.
                </p>
              </div>
          </div>

          {/* Debt Terms - Wider Section */}
          <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12 animate-fade-in max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                  Debt <span style={{ color: '#3D6B54' }}>Terms</span>
                </h2>
                <div className="w-20 h-0.5 bg-[#3D6B54] mx-auto mb-6"></div>
                <p className="text-base sm:text-lg text-slate-700 mb-8 leading-relaxed font-light">
                  Debt terminology can be confusing and overly complicated—but it doesn't have to be! Let's break these down in a way you can actually understand.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Minimum Payment</h3>
                    </div>
                    <div className="w-16 sm:w-20 h-0.5 bg-[#3D6B54] mb-3 sm:mb-4 lg:mb-5"></div>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-light">
                      This is the lowest amount you are required to pay on a debt every month (includes principal and interest). Pay any less and you might get slapped with some hefty penalties.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Balance</h3>
                    </div>
                    <div className="w-16 sm:w-20 h-0.5 bg-[#3D6B54] mb-3 sm:mb-4 lg:mb-5"></div>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-light">
                      It's the amount you still have to pay on your debt. If your original loan was $20,000 and you've paid $5,000 already, your balance would be $15,000.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Interest Rate</h3>
                    </div>
                    <div className="w-16 sm:w-20 h-0.5 bg-[#3D6B54] mb-3 sm:mb-4 lg:mb-5"></div>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-light">
                      When it comes to borrowing money, there's no such thing as free. Lenders are interested in letting you borrow their money because they make money on what they loan you. Your interest rate is how much they charge, usually shown as a percentage of the principal balance.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Principal</h3>
                    </div>
                    <div className="w-16 sm:w-20 h-0.5 bg-[#3D6B54] mb-3 sm:mb-4 lg:mb-5"></div>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-light">
                      No, it's not that elementary school principal you were terrified of as a kid. We're talking about the amount of money you borrowed without the interest added. So, if you borrowed $20,000 over 10 years, your principal payment would be about $167 per month.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Nonmortgage Debt</h3>
                    </div>
                    <div className="w-16 sm:w-20 h-0.5 bg-[#3D6B54] mb-3 sm:mb-4 lg:mb-5"></div>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-light">
                      This one is simple. It's everything you owe, except for loans related to the purchase of your home. Yes, that includes your car notes and student loans. It's all debt. Why don't we ask you to list your mortgage in your debt snowball? Because after you've knocked out your consumer debt, you've got other important steps to take before tackling the house.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.35s', animationFillMode: 'forwards' }}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Debt-Free Date</h3>
                    </div>
                    <div className="w-16 sm:w-20 h-0.5 bg-[#3D6B54] mb-3 sm:mb-4 lg:mb-5"></div>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-light">
                      It's the day when every single cent of your consumer debt is history. Bye, credit cards. See you never, student loans. If you've got a mortgage, you'll hit that hard later. But for now, it's time to celebrate.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Share Section - Clean White Background */}
            <div className="w-full bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 lg:mt-20">
              <div className="max-w-4xl mx-auto text-center">
                {/* Headline */}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4 leading-tight">
                  Help Others Take Control of Their Money
                </h2>
                
                {/* Subtext */}
                <p className="text-sm sm:text-base lg:text-lg text-slate-600 mb-6 sm:mb-7 leading-relaxed max-w-2xl mx-auto">
                  Share this free debt snowball calculator with friends and family who need to start their financial journey—because everyone deserves financial peace.
                </p>
                
                {/* Share Input and Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl mx-auto">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== 'undefined' ? window.location.href : ''}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                      onClick={(e) => e.currentTarget.select()}
                    />
                  </div>
                  <button
                    onClick={copyLinkToClipboard}
                    className="flex items-center justify-center gap-2 bg-[#3D6B54] hover:bg-[#2d5340] text-white px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex-shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span>{linkCopied ? "Copied!" : "Copy Link"}</span>
                  </button>
                </div>
                
                {/* Trust message */}
                <p className="text-xs sm:text-sm text-slate-500 mt-5 sm:mt-6">
                  Join thousands of people building better financial habits with BrightNest
                </p>
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
      
      <main className="flex-1">
        {/* Full-width Banner with Fine Fade */}
        <div 
          className="relative py-8 sm:py-12 lg:py-16 overflow-hidden"
          style={{ 
            background: 'linear-gradient(to right, #FDFDFB 0%, #FCFCF9 50%, #FDFBF7 100%)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center animate-fade-in">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4 lg:mb-6 leading-tight tracking-tight">
                Debt Snowball <span style={{ color: '#3D6B54' }}>Calculator</span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed font-light">
                Find out your debt-free date and accelerate your progress with the debt snowball method—the fastest way to pay off debt.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Main Calculator Section - Horizontal Layout */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-3 sm:p-6 lg:p-10 mb-8 sm:mb-12">
              
              {/* Grid Layout: Left = Debts, Right = Income & Payment */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                
                {/* Left Column - Your Debts (2/3 width) */}
                <div className="lg:col-span-2">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-light text-slate-900 mb-3 sm:mb-4 tracking-tight">Your Debts</h2>
                  <p className="text-sm sm:text-base lg:text-lg text-slate-700 mb-4 sm:mb-6 leading-relaxed font-light">
                    Start by listing out your <strong className="font-light">non-mortgage</strong> debts.
                  </p>

                  {debts.map((debt, index) => (
                  <div key={debt.id} className="mb-3 sm:mb-4">
                    <div className="flex justify-between items-center mb-2 sm:mb-3">
                      <span className="text-sm sm:text-base font-bold text-teal-600">Debt {index + 1}</span>
                      {debts.length > 1 && (
                        <button
                          onClick={() => removeDebt(debt.id)}
                          className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium px-2 py-1"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <label className="block text-[11px] sm:text-xs font-medium text-slate-700 mb-1">
                          Debt Type
                        </label>
                        <select
                          value={debt.type}
                          onChange={(e) => updateDebt(debt.id, 'type', e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-xs sm:text-sm text-slate-900 font-medium"
                        >
                          {DEBT_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-[11px] sm:text-xs font-medium text-slate-700 mb-1">
                          Interest Rate
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={debt.interestRate}
                            onChange={(e) => updateDebt(debt.id, 'interestRate', e.target.value)}
                            placeholder="0"
                            step="0.01"
                            className="w-full pl-6 sm:pl-8 pr-2 sm:pr-3 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-xs sm:text-sm text-slate-900 font-medium"
                          />
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium text-xs">%</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[11px] sm:text-xs font-medium text-slate-700 mb-1">
                          Balance
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={debt.balance}
                            onChange={(e) => updateDebt(debt.id, 'balance', e.target.value)}
                            placeholder="0"
                            step="0.01"
                            className="w-full pl-5 sm:pl-6 pr-2 sm:pr-3 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-xs sm:text-sm text-slate-900 font-medium"
                          />
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium text-xs">$</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[11px] sm:text-xs font-medium text-slate-700 mb-1">
                          Minimum Payment
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={debt.minimumPayment}
                            onChange={(e) => updateDebt(debt.id, 'minimumPayment', e.target.value)}
                            placeholder="0"
                            step="0.01"
                            className="w-full pl-5 sm:pl-6 pr-2 sm:pr-3 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-xs sm:text-sm text-slate-900 font-medium"
                          />
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium text-xs">$</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 sm:mt-3">
                      <label className="block text-[11px] sm:text-xs font-medium text-slate-700 mb-1">
                        Account Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={debt.name}
                        onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                        placeholder="Visa, Discover Card, Lender Name"
                        className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-xs sm:text-sm text-slate-900"
                      />
                    </div>
                  </div>
                ))}

                  <button
                    onClick={addDebt}
                    className="w-full inline-flex items-center justify-center gap-2 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-light text-sm sm:text-base hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl mt-3 sm:mt-4"
                    style={{ backgroundColor: '#3D6B54' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Debt
                  </button>
                </div>

                {/* Right Column - Income & Payment (1/3 width) */}
                <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                  
                  {/* Household Income Section */}
                  <div className="bg-slate-50 rounded-lg p-3 sm:p-4 lg:p-5 border border-slate-200">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">Your Household Income</h2>
                    <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4 leading-relaxed">
                      This includes <strong>any income</strong> you make each month after taxes (your paycheck, your side hustle—it all counts).
                    </p>
                    <div className="relative">
                      <input
                        type="number"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        placeholder="0"
                        step="0.01"
                        className="w-full pl-6 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base font-medium text-slate-900 bg-white"
                      />
                      <span className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">$</span>
                    </div>
                  </div>

                  {/* Additional Payment Section */}
                  <div className="bg-slate-50 rounded-lg p-3 sm:p-4 lg:p-5 border border-slate-200">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">Additional Payment</h2>
                    <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4 leading-relaxed">
                      Next, to snowball your debt, enter the <strong>additional amount</strong> you want to pay above the minimum required payment.
                    </p>
                    <div className="relative">
                      <input
                        type="number"
                        value={extraPayment}
                        onChange={(e) => setExtraPayment(e.target.value)}
                        placeholder="0"
                        step="0.01"
                        className="w-full pl-6 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base font-medium text-slate-900 bg-white"
                      />
                      <span className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">$</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 mt-4 sm:mt-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm sm:text-base text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={calculateResults}
                className="w-full text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-light text-sm sm:text-base hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl mt-4 sm:mt-6"
                style={{ backgroundColor: '#3D6B54' }}
              >
                Get Your Debt-Free Date
              </button>
            </div>
          </div>

          {/* Educational Content */}
          <div className="space-y-8 sm:space-y-12 lg:space-y-16 max-w-3xl mx-auto py-6 sm:py-8">
              {/* What Is the Debt Snowball? */}
              <div className="animate-fade-in">
                <h2 className="text-2xl sm:text-3xl lg:text-5xl font-light text-slate-900 mb-4 sm:mb-5 lg:mb-6 tracking-tight">
                  What Is the <span style={{ color: '#3D6B54' }}>Debt Snowball</span>?
                </h2>
                <div className="w-16 sm:w-20 h-0.5 bg-[#3D6B54] mx-auto mb-4 sm:mb-5 lg:mb-6"></div>
                <p className="text-sm sm:text-base lg:text-lg text-slate-700 mb-3 sm:mb-4 leading-relaxed font-light">
                  The debt snowball is a debt payoff method where you pay your debts from smallest to largest, regardless of interest rate. Knock out the smallest debt first. Then, take what you were paying on that debt and add it to the payment of your next smallest debt.
                </p>
                <p className="text-sm sm:text-base lg:text-lg text-slate-700 mb-6 sm:mb-8 leading-relaxed font-light">
                  Why a snowball? Because just like a snowball rolling downhill, paying off debt is all about momentum. With every debt you pay off, you gain speed until you're an unstoppable, debt-crushing force.
                </p>

                <div className="bg-white rounded-xl border border-slate-200 shadow-md p-4 sm:p-6 lg:p-10 mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl lg:text-3xl font-light text-slate-900 mb-4 sm:mb-5 lg:mb-6 tracking-tight">Here's how the debt snowball works:</h3>
                  <ol className="space-y-4 sm:space-y-6">
                    <li className="flex items-start gap-3 sm:gap-4">
                      <span className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full text-white font-light flex items-center justify-center text-base sm:text-lg" style={{ backgroundColor: '#3D6B54' }}>1</span>
                      <div>
                        <p className="text-sm sm:text-base lg:text-lg font-light text-slate-900 mb-1">List your debts from smallest to largest regardless of interest rate.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 sm:gap-4">
                      <span className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full text-white font-light flex items-center justify-center text-base sm:text-lg" style={{ backgroundColor: '#3D6B54' }}>2</span>
                      <div>
                        <p className="text-sm sm:text-base lg:text-lg font-light text-slate-900 mb-1">Make minimum payments on all your debts except the smallest.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 sm:gap-4">
                      <span className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full text-white font-light flex items-center justify-center text-base sm:text-lg" style={{ backgroundColor: '#3D6B54' }}>3</span>
                      <div>
                        <p className="text-sm sm:text-base lg:text-lg font-light text-slate-900 mb-1">Pay as much as possible on your smallest debt.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 sm:gap-4">
                      <span className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full text-white font-light flex items-center justify-center text-base sm:text-lg" style={{ backgroundColor: '#3D6B54' }}>4</span>
                      <div>
                        <p className="text-sm sm:text-base lg:text-lg font-light text-slate-900 mb-1">Repeat until each debt is paid in full.</p>
                      </div>
                    </li>
                  </ol>
                  <p className="text-sm sm:text-base lg:text-lg text-slate-700 mt-4 sm:mt-6 leading-relaxed font-light">
                    What happens then? Freedom. No more payments. No more answering to collectors. No more watching your paychecks disappear.
                  </p>
                  <p className="text-sm sm:text-base lg:text-lg text-slate-700 mt-3 sm:mt-4 leading-relaxed font-light">
                    Because when you get hyper-focused and start chucking every dollar you can at your debt, you'll see how much faster you can pay it all off. Sorry, minimum payments. You're just not good enough.
                  </p>
                </div>
              </div>

              {/* Debt Snowball vs Debt Avalanche */}
              <div className="border-t border-slate-200 pt-8 sm:pt-10 lg:pt-12 animate-fade-in">
                <h2 className="text-2xl sm:text-3xl lg:text-5xl font-light text-slate-900 mb-4 sm:mb-5 lg:mb-6 tracking-tight">
                  Debt Snowball vs. <span style={{ color: '#3D6B54' }}>Debt Avalanche</span>
                </h2>
                <div className="w-16 sm:w-20 h-0.5 bg-[#3D6B54] mx-auto mb-4 sm:mb-5 lg:mb-6"></div>
                <p className="text-sm sm:text-base lg:text-lg text-slate-700 mb-3 sm:mb-4 leading-relaxed font-light">
                  Maybe you've heard of another way to pay off debt—the debt avalanche. Sounds epic, right? Wrong. With the debt avalanche, you pay your debts in order from the highest interest rate to the lowest, regardless of the balance.
                </p>
                <p className="text-sm sm:text-base lg:text-lg text-slate-700 mb-4 sm:mb-6 leading-relaxed font-light">
                  That might sound like smart math. Here's why it's not: <strong className="font-light">Debt isn't a math problem. It's a behavior problem.</strong>
                </p>
                <p className="text-sm sm:text-base lg:text-lg text-slate-700 mb-3 sm:mb-4 leading-relaxed font-light">
                  If you want to change your behavior and get out of debt, you need to stay motivated. With the debt avalanche, you may not see progress on your first debt for a long time. That's motivating nobody. You're way more likely to lose steam and give up.
                </p>
                <p className="text-sm sm:text-base lg:text-lg text-slate-700 leading-relaxed font-light">
                  But when you use the debt snowball, you get quick wins sooner. Crush the first debt fast. Boom. On to the next. Now, you're cooking. Suddenly, you start believing that getting out of debt is within reach. Motivation is the key to becoming debt-free, not math.
                </p>
              </div>
          </div>

          {/* Debt Terms - Wider Section */}
          <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12 animate-fade-in max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                  Debt <span style={{ color: '#3D6B54' }}>Terms</span>
                </h2>
                <div className="w-20 h-0.5 bg-[#3D6B54] mx-auto mb-6"></div>
                <p className="text-base sm:text-lg text-slate-700 mb-8 leading-relaxed font-light">
                  Debt terminology can be confusing and overly complicated—but it doesn't have to be! Let's break these down in a way you can actually understand.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Minimum Payment</h3>
                    </div>
                    <div className="w-16 sm:w-20 h-0.5 bg-[#3D6B54] mb-3 sm:mb-4 lg:mb-5"></div>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-light">
                      This is the lowest amount you are required to pay on a debt every month (includes principal and interest). Pay any less and you might get slapped with some hefty penalties.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Balance</h3>
                    </div>
                    <div className="w-16 sm:w-20 h-0.5 bg-[#3D6B54] mb-3 sm:mb-4 lg:mb-5"></div>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-light">
                      It's the amount you still have to pay on your debt. If your original loan was $20,000 and you've paid $5,000 already, your balance would be $15,000.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Interest Rate</h3>
                    </div>
                    <div className="w-16 sm:w-20 h-0.5 bg-[#3D6B54] mb-3 sm:mb-4 lg:mb-5"></div>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-light">
                      When it comes to borrowing money, there's no such thing as free. Lenders are interested in letting you borrow their money because they make money on what they loan you. Your interest rate is how much they charge, usually shown as a percentage of the principal balance.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Principal</h3>
                    </div>
                    <div className="w-16 sm:w-20 h-0.5 bg-[#3D6B54] mb-3 sm:mb-4 lg:mb-5"></div>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-light">
                      No, it's not that elementary school principal you were terrified of as a kid. We're talking about the amount of money you borrowed without the interest added. So, if you borrowed $20,000 over 10 years, your principal payment would be about $167 per month.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Nonmortgage Debt</h3>
                    </div>
                    <div className="w-16 sm:w-20 h-0.5 bg-[#3D6B54] mb-3 sm:mb-4 lg:mb-5"></div>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-light">
                      This one is simple. It's everything you owe, except for loans related to the purchase of your home. Yes, that includes your car notes and student loans. It's all debt. Why don't we ask you to list your mortgage in your debt snowball? Because after you've knocked out your consumer debt, you've got other important steps to take before tackling the house.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group animate-slide-up" style={{ animationDelay: '0.35s', animationFillMode: 'forwards' }}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-teal-50">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-light text-slate-900 group-hover:text-[#3D6B54] transition-colors duration-300">Debt-Free Date</h3>
                    </div>
                    <div className="w-16 sm:w-20 h-0.5 bg-[#3D6B54] mb-3 sm:mb-4 lg:mb-5"></div>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-light">
                      It's the day when every single cent of your consumer debt is history. Bye, credit cards. See you never, student loans. If you've got a mortgage, you'll hit that hard later. But for now, it's time to celebrate.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Share Section - Clean White Background */}
          <div className="w-full bg-white py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              {/* Headline */}
              <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-slate-900 mb-2 sm:mb-3 lg:mb-4 leading-tight">
                Help Others Take Control of Their Money
              </h2>
              
              {/* Subtext */}
              <p className="text-xs sm:text-sm lg:text-base text-slate-600 mb-4 sm:mb-6 lg:mb-7 leading-relaxed max-w-2xl mx-auto">
                Share this free debt snowball calculator with friends and family who need to start their financial journey—because everyone deserves financial peace.
              </p>
              
              {/* Share Input and Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 max-w-2xl mx-auto">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-900 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                    onClick={(e) => e.currentTarget.select()}
                  />
                </div>
                <button
                  onClick={copyLinkToClipboard}
                  className="flex items-center justify-center gap-2 bg-[#3D6B54] hover:bg-[#2d5340] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex-shrink-0"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>{linkCopied ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>
              
              {/* Trust message */}
              <p className="text-[10px] sm:text-xs lg:text-sm text-slate-500 mt-4 sm:mt-5 lg:mt-6">
                Join thousands of people building better financial habits with BrightNest
              </p>
            </div>
          </div>
      </main>

      <SiteFooter />
    </div>
  );
}
