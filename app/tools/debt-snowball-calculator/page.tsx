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

    // Calculate payoff if we have income or extra payment
    const extraPaymentNum = parseFloat(extraPayment) || 0;
    const incomeNum = parseFloat(income) || 0;
    
    if (incomeNum > 0 || extraPaymentNum > 0) {
      // Use extra payment as additional funds if provided, otherwise use income as total available
      const totalAvailable = incomeNum > 0 ? incomeNum : totalMonthlyPayment + extraPaymentNum;
      
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

      setMonthsToPayoff(months);

      // Calculate debt-free date
      if (months > 0) {
        const today = new Date();
        const payoffDate = new Date(today);
        payoffDate.setMonth(payoffDate.getMonth() + months);
        setDebtFreeDate(payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
      }
    }

    setShowResults(true);
  };

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
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case "Car Loan":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        );
      case "Student Loan":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v9M4.98 20.832l1.01.352 1.99-.5L12 14l4.02 6.684 1.99.5 1.01-.352M12 14l-1-2M12 14l1-2" />
          </svg>
        );
      case "Other Non-Mortgage Debt":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        
        <main className="flex-1 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="relative py-8 sm:py-10 mb-6 overflow-hidden rounded-2xl border border-slate-200/50 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-teal-50 to-amber-50"></div>
              <div className="absolute top-0 right-0 w-72 h-72 bg-teal-100/60 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-100/60 rounded-full blur-3xl"></div>
              
              <div className="relative text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                  Your <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">Debt Results</span>
                </h1>
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
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                  >
                    ← Back to Your Debts
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {Object.keys(debtsByType).map(type => {
                    const typeDebts = debtsByType[type];
                    const typeTotal = typeDebts.reduce((sum, debt) => sum + parseFloat(debt.balance), 0);
                    
                    return (
                      <div key={type} className="border-b border-slate-200 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getDebtTypeIcon(type)}
                            <h3 className="font-semibold text-slate-900">{type}s</h3>
                          </div>
                          <span className="text-teal-600 font-bold">{formatCurrency(typeTotal)}</span>
                        </div>
                        <div className="pl-7 space-y-2">
                          {typeDebts.map((debt, idx) => (
                            <div key={debt.id} className="text-sm text-slate-600">
                              {debt.name || `${type} ${idx + 1}`}: {formatCurrency(parseFloat(debt.balance))}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t-2 border-slate-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-teal-600 font-bold">TOTAL DEBT</span>
                    <span className="text-3xl font-bold text-slate-900">{formatCurrency(totalDebt)}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-slate-700">
                    Debt is stealing <strong>{formatCurrency(monthlyPayment)}</strong> of your income every month!
                  </p>
                </div>
              </div>

              {/* Right Column - Debt-Free Date */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Debt-Free Date</h2>
                
                {debtFreeDate ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-slate-600 mb-4">
                        If you continue making only minimum payments, you'll be debt-free:
                      </p>
                      <div className="bg-slate-100 rounded-xl p-8 text-center mb-4">
                        <div className="text-4xl sm:text-5xl font-bold text-slate-800">
                          {debtFreeDate}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                      <p className="text-sm text-slate-600 mb-4">
                        Want to be debt-free sooner? Of course you do! Add an extra monthly payment to see how much faster you'll pay off your debt.
                      </p>
                      <p className="text-teal-600 hover:text-teal-700 font-medium text-sm cursor-pointer mb-4">
                        Boost your payments to pay off your debt even faster! →
                      </p>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Extra Monthly Payment
                        </label>
                        <div className="relative mb-3">
                          <input
                            type="number"
                            value={extraPayment}
                            onChange={(e) => setExtraPayment(e.target.value)}
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
                          value={parseFloat(extraPayment) || 0}
                          onChange={(e) => setExtraPayment(e.target.value)}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>$0</span>
                          <span>$5,000</span>
                        </div>
                      </div>
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

            {/* Quick Action to Recalculate */}
            <div className="text-center">
              <button
                onClick={calculateResults}
                className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors text-base"
              >
                Recalculate Debt-Free Date
              </button>
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
      
      <main className="flex-1 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="relative py-8 sm:py-10 mb-6 overflow-hidden rounded-2xl border border-slate-200/50 shadow-sm">
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
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 mb-12">
              {/* Your Debts Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Debts</h2>
                <p className="text-sm text-slate-600 mb-6">
                  Start by listing out your <strong>non-mortgage</strong> debts.
                </p>

                {debts.map((debt, index) => (
                  <div key={debt.id} className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-teal-600">Debt {index + 1}</span>
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
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Debt Type
                        </label>
                        <select
                          value={debt.type}
                          onChange={(e) => updateDebt(debt.id, 'type', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-slate-900 font-medium"
                        >
                          {DEBT_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Interest Rate
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={debt.interestRate}
                            onChange={(e) => updateDebt(debt.id, 'interestRate', e.target.value)}
                            placeholder="0"
                            step="0.01"
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-slate-900 font-medium"
                          />
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">%</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Balance
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={debt.balance}
                            onChange={(e) => updateDebt(debt.id, 'balance', e.target.value)}
                            placeholder="0"
                            step="0.01"
                            className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-slate-900 font-medium"
                          />
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">$</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Minimum Payment
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={debt.minimumPayment}
                            onChange={(e) => updateDebt(debt.id, 'minimumPayment', e.target.value)}
                            placeholder="0"
                            step="0.01"
                            className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-slate-900 font-medium"
                          />
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">$</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Account Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={debt.name}
                        onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                        placeholder="Visa, Discover Card, Lender Name"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-slate-900"
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addDebt}
                  className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors mb-8"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Debt
                </button>
              </div>

              {/* Household Income Section */}
              <div className="mb-8 border-t border-slate-200 pt-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Household Income</h2>
                <p className="text-sm text-slate-600 mb-4">
                  This includes <strong>any income</strong> you make each month after taxes (your paycheck, your side hustle—it all counts).
                </p>
                <div className="relative">
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base font-medium text-slate-900"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                </div>
              </div>

              {/* Additional Payment Section */}
              <div className="mb-8 border-t border-slate-200 pt-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Additional Payment</h2>
                <p className="text-sm text-slate-600 mb-4">
                  Next, to snowball your debt, enter the <strong>additional amount</strong> you want to pay above the minimum required payment.
                </p>
                <div className="relative">
                  <input
                    type="number"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(e.target.value)}
                    placeholder="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base font-medium text-slate-900"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={calculateResults}
                className="w-full bg-teal-600 text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-teal-700 transition-colors"
              >
                Get Your Debt-Free Date
              </button>
            </div>

            {/* Educational Content */}
            <div className="space-y-12">
              {/* What Is the Debt Snowball? */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 text-center">
                  What Is the <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">Debt Snowball</span>?
                </h2>
                <p className="text-base sm:text-lg text-slate-600 mb-8 text-center max-w-3xl mx-auto">
                  The debt snowball is a debt payoff method where you pay your debts from smallest to largest, regardless of interest rate. Knock out the smallest debt first. Then, take what you were paying on that debt and add it to the payment of your next smallest debt.
                </p>
                <p className="text-base text-slate-700 mb-8 text-center max-w-3xl mx-auto">
                  Why a snowball? Because just like a snowball rolling downhill, paying off debt is all about momentum. With every debt you pay off, you gain speed until you're an unstoppable, debt-crushing force.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mt-8 max-w-4xl mx-auto">
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

                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      The Result
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      What happens then? Freedom. No more payments. No more answering to collectors. No more watching your paychecks disappear.
                    </p>
                    <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                      Because when you get hyper-focused and start chucking every dollar you can at your debt, you'll see how much faster you can pay it all off.
                    </p>
                  </div>
                </div>
              </div>

              {/* Debt Snowball vs Debt Avalanche */}
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 text-center">
                  Debt Snowball <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">vs.</span> Debt Avalanche
                </h2>
                <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm mt-8">
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Maybe you've heard of another way to pay off debt—the debt avalanche. Sounds epic, right? Wrong. With the debt avalanche, you pay your debts in order from the <strong className="text-slate-900">highest interest rate</strong> to the <strong className="text-slate-900">lowest</strong>, regardless of the balance.
                  </p>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    That might sound like smart math. Here's why it's not: <strong className="text-slate-900">Debt isn't a math problem. It's a behavior problem.</strong>
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    If you want to change your behavior and get out of debt, you need to stay motivated. With the debt avalanche, you may not see progress on your first debt for a <em>long</em> time. That's motivating nobody. You're way more likely to lose steam and give up.
                  </p>
                  <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                    But when you use the debt snowball, you get quick wins sooner. Crush the first debt fast. Boom. On to the next. Now, you're cooking. Suddenly, you start <strong className="text-slate-900">believing</strong> that getting out of debt is within reach. Motivation is the key to becoming debt-free, not math.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
