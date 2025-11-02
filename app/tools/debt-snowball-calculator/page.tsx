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
  const [debtFreeDate, setDebtFreeDate] = useState<string | null>(null);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalDebt, setTotalDebt] = useState<number>(0);
  const [monthsToPayoff, setMonthsToPayoff] = useState<number>(0);

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
        // If changing the debt type, auto-populate interest rate if the rate field is empty
        if (field === 'type' && value !== "Choose a Debt Type" && !debt.interestRate) {
          return { ...debt, type: value, interestRate: DEFAULT_INTEREST_RATES[value]?.toString() || "" };
        }
        return { ...debt, [field]: value };
      }
      return debt;
    }));
  };

  // Calculate debt snowball
  useEffect(() => {
    const calculateSnowball = () => {
      // Validate inputs
      const validDebts = debts.filter(debt => 
        debt.type !== "Choose a Debt Type" &&
        debt.balance && parseFloat(debt.balance) > 0 &&
        debt.minimumPayment && parseFloat(debt.minimumPayment) > 0
      );

      if (validDebts.length === 0 || !income || parseFloat(income) <= 0) {
        setDebtFreeDate(null);
        setMonthlyPayment(0);
        setTotalDebt(0);
        setMonthsToPayoff(0);
        return;
      }

      // Sort debts by balance (smallest first - debt snowball method)
      const sortedDebts = [...validDebts].map(debt => ({
        balance: parseFloat(debt.balance),
        interestRate: parseFloat(debt.interestRate) || 0,
        minimumPayment: parseFloat(debt.minimumPayment)
      })).sort((a, b) => a.balance - b.balance);

      const incomeNum = parseFloat(income);
      let months = 0;
      let workingDebts = sortedDebts.map(debt => ({
        balance: debt.balance,
        interestRate: debt.interestRate / 100 / 12, // Monthly interest rate
        minimumPayment: debt.minimumPayment
      }));

      // Calculate how much can go to debt each month
      const totalMinimumPayments = sortedDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
      const availableForDebt = incomeNum;
      
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
        if (availableForDebt < currentMinPayments) {
          break;
        }
        
        // Pay minimums on all debts except the smallest
        const smallestDebt = workingDebts[0];
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
        const paymentToSmallest = availableForDebt - otherDebtsMin;
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

      // Calculate summary
      const totalDebtAmount = sortedDebts.reduce((sum, debt) => sum + debt.balance, 0);
      const monthlyDebtPayments = sortedDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
      
      setTotalDebt(totalDebtAmount);
      setMonthlyPayment(monthlyDebtPayments);
      setMonthsToPayoff(months);

      // Calculate debt-free date
      if (months > 0) {
        const today = new Date();
        const payoffDate = new Date(today);
        payoffDate.setMonth(payoffDate.getMonth() + months);
        setDebtFreeDate(payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
      }
    };

    calculateSnowball();
  }, [debts, income]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <SiteHeader />
      
      <main className="flex-1 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section with Background Design */}
          <div className="relative py-8 sm:py-10 mb-6 overflow-hidden rounded-2xl border border-slate-200/50 shadow-sm">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-teal-50 to-amber-50"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-teal-100/60 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-100/60 rounded-full blur-3xl"></div>
            
            {/* Content */}
            <div className="relative text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Debt Snowball <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">Calculator</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                Find out your debt-free date and accelerate your progress with the debt snowball method—the fastest way to pay off debt.
              </p>
            </div>
          </div>

          {/* Main Calculator Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Input Section */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 sm:p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Your Debts</h2>
              <p className="text-sm text-slate-600 mb-6">
                Start by listing out your <strong>non-mortgage</strong> debts.
              </p>

              {debts.map((debt, index) => (
                <div key={debt.id} className="mb-6 p-4 border border-slate-200 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-teal-600">Debt {index + 1}</span>
                    {debts.length > 1 && (
                      <button
                        onClick={() => removeDebt(debt.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Debt Type
                      </label>
                      <select
                        value={debt.type}
                        onChange={(e) => updateDebt(debt.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-slate-900"
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
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-xs">%</span>
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
                          className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-slate-900 font-medium"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-xs">$</span>
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
                          className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-slate-900 font-medium"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-xs">$</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors text-sm mb-8"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Debt
              </button>

              <div className="border-t border-slate-200 pt-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Your Household Income</h2>
                <p className="text-sm text-slate-600 mb-4">
                  This includes any income you make each month after taxes (your paycheck, your side hustle—it all counts).
                </p>
                <div className="relative">
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="0"
                    step="0.01"
                    className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base font-medium text-slate-900"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">$</span>
                </div>
              </div>
            </div>

            {/* Right Column - Results Section */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 sm:p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Your Debt-Free Date</h2>
              
              {debtFreeDate ? (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-600 mb-4">
                      If you continue making only minimum payments, you'll be debt-free
                    </p>
                    <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent mb-2">
                      {debtFreeDate}
                    </div>
                    <p className="text-sm text-slate-500">({monthsToPayoff} {monthsToPayoff === 1 ? 'month' : 'months'})</p>
                  </div>
                  
                  <div className="space-y-3 border-t border-slate-200 pt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total Debt</span>
                      <span className="text-lg font-bold text-slate-900">{formatCurrency(totalDebt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Monthly Payments</span>
                      <span className="text-lg font-bold text-slate-900">{formatCurrency(monthlyPayment)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-sm">Enter your debts and income to calculate your debt-free date</p>
                </div>
              )}
            </div>
          </div>

          {/* Educational Content */}
          <div className="mt-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 text-center">
              What Is the <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">Debt Snowball</span>?
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mb-8 text-center max-w-3xl mx-auto">
              The debt snowball is a debt payoff method where you pay your debts from smallest to largest, regardless of interest rate. 
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {/* How It Works */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  How It Works
                </h3>
                <ol className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs mt-0.5">1</span>
                    <span>List your debts from smallest to largest regardless of interest rate.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs mt-0.5">2</span>
                    <span>Make minimum payments on all your debts except the smallest.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs mt-0.5">3</span>
                    <span>Pay as much as possible on your smallest debt.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs mt-0.5">4</span>
                    <span>Repeat until each debt is paid in full.</span>
                  </li>
                </ol>
              </div>

              {/* Why the Snowball */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Why the Snowball?
                </h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  Knock out the smallest debt first. Then, take what you were paying on that debt and add it to the payment of your next smallest debt.
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong className="text-slate-900">Why a snowball?</strong> Because just like a snowball rolling downhill, paying off debt is all about momentum. With every debt you pay off, you gain speed until you're an unstoppable, debt-crushing force.
                </p>
              </div>
            </div>
          </div>

          {/* Debt Snowball vs Debt Avalanche */}
          <div className="mt-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 text-center">
              Debt Snowball <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">vs.</span> Debt Avalanche
            </h2>
            <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 border border-slate-200 shadow-sm mt-8">
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Maybe you've heard of another way to pay off debt—the debt avalanche. Sounds epic, right? Wrong. With the debt avalanche, you pay your debts in order from the <strong>highest interest rate</strong> to the <strong>lowest</strong>, regardless of the balance.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                That might sound like smart math. Here's why it's not: <strong className="text-slate-900">Debt isn't a math problem. It's a behavior problem.</strong> If you want to change your behavior and get out of debt, you need to stay motivated. With the debt avalanche, you may not see progress on your first debt for a <em>long</em> time. That's motivating nobody. You're way more likely to lose steam and give up.
              </p>
              <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                But when you use the debt snowball, you get quick wins sooner. Crush the first debt fast. Boom. On to the next. Now, you're cooking. Suddenly, you start <strong className="text-slate-900">believing</strong> that getting out of debt is within reach. Motivation is the key to becoming debt-free, not math.
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

