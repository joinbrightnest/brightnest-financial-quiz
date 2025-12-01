"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function BudgetCalculator() {
    const [income, setIncome] = useState("");
    const [expenses, setExpenses] = useState({
        housing: "",
        transportation: "",
        food: "",
        utilities: "",
        insurance: "",
        healthcare: "",
        entertainment: "",
        other: "",
    });

    const totalIncome = parseFloat(income) || 0;
    const totalExpenses = Object.values(expenses).reduce(
        (sum, val) => sum + (parseFloat(val) || 0),
        0
    );
    const remaining = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (remaining / totalIncome) * 100 : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Budget Calculator
                            </h1>
                            <p className="text-slate-600 mt-1">
                                Track your income and expenses to build a healthy financial plan
                            </p>
                        </div>
                        <a
                            href="/"
                            className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Income Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
                    >
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Monthly Income</h2>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Total Monthly Income
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                <input
                                    type="number"
                                    value={income}
                                    onChange={(e) => setIncome(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Expenses Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
                    >
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Monthly Expenses</h2>
                        </div>
                        <div className="space-y-4">
                            {Object.entries(expenses).map(([key, value]) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">
                                        {key}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                        <input
                                            type="number"
                                            value={value}
                                            onChange={(e) =>
                                                setExpenses({ ...expenses, [key]: e.target.value })
                                            }
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Summary Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Summary Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Summary</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                                    <span className="text-sm font-medium text-emerald-900">Total Income</span>
                                    <span className="text-lg font-bold text-emerald-600">
                                        ${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                    <span className="text-sm font-medium text-red-900">Total Expenses</span>
                                    <span className="text-lg font-bold text-red-600">
                                        ${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className={`flex justify-between items-center p-3 rounded-lg ${remaining >= 0 ? 'bg-indigo-50' : 'bg-orange-50'}`}>
                                    <span className={`text-sm font-medium ${remaining >= 0 ? 'text-indigo-900' : 'text-orange-900'}`}>
                                        {remaining >= 0 ? 'Remaining' : 'Deficit'}
                                    </span>
                                    <span className={`text-lg font-bold ${remaining >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
                                        ${Math.abs(remaining).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Savings Rate Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Savings Rate</h3>
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${savingsRate >= 20 ? 'text-emerald-600 bg-emerald-200' : savingsRate >= 10 ? 'text-yellow-600 bg-yellow-200' : 'text-red-600 bg-red-200'}`}>
                                            {savingsRate >= 20 ? 'Excellent' : savingsRate >= 10 ? 'Good' : 'Needs Improvement'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-semibold inline-block text-slate-600">
                                            {savingsRate.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-200">
                                    <div
                                        style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
                                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${savingsRate >= 20 ? 'bg-emerald-500' : savingsRate >= 10 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    ></div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-600 mt-2">
                                Financial experts recommend saving at least 20% of your income.
                            </p>
                        </div>

                        {/* CTA Card */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                            <h3 className="text-lg font-bold mb-2">Ready to optimize your finances?</h3>
                            <p className="text-sm text-indigo-100 mb-4">
                                Take our personalized financial quiz to get expert recommendations.
                            </p>
                            <a
                                href="/quiz"
                                className="inline-flex items-center justify-center w-full px-4 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                            >
                                Start Financial Quiz
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
