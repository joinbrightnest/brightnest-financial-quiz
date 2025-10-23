"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Affiliate {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  totalCommission: number;
  totalPaid: number;
  pendingPayouts: number;
  availableCommission: number;
}

interface Payout {
  id: string;
  amountDue: number;
  status: string;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  affiliate: {
    id: string;
    name: string;
    email: string;
    referralCode: string;
  };
}

interface PayoutSummary {
  totalAmount: number;
  totalCount: number;
  completedAmount: number;
  completedCount: number;
  pendingAmount: number;
  pendingCount: number;
}

export default function CommissionPayoutManager() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    amount: "",
    notes: "",
    status: "completed",
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"affiliates" | "payouts">("affiliates");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [affiliatesRes, payoutsRes] = await Promise.all([
        fetch("/api/admin/affiliates"),
        fetch(`/api/admin/payouts?status=${filterStatus}`),
      ]);

      if (affiliatesRes.ok) {
        const affiliatesData = await affiliatesRes.json();
        setAffiliates(affiliatesData.affiliates || []);
      }

      if (payoutsRes.ok) {
        const payoutsData = await payoutsRes.json();
        setPayouts(payoutsData.data.payouts || []);
        setSummary(payoutsData.data.summary || null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAffiliate) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/admin/affiliates/${selectedAffiliate.id}/payout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(payoutForm.amount),
          notes: payoutForm.notes,
          status: payoutForm.status,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Payout created:", result);
        
        // Reset form and close modal
        setPayoutForm({ amount: "", notes: "", status: "completed" });
        setShowPayoutModal(false);
        setSelectedAffiliate(null);
        
        // Refresh data
        await fetchData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating payout:", error);
      alert("Failed to create payout");
    } finally {
      setSubmitting(false);
    }
  };

  const openPayoutModal = (affiliate: Affiliate) => {
    if (affiliate.availableCommission <= 0) {
      alert("This affiliate has no available commission to payout");
      return;
    }
    setSelectedAffiliate(affiliate);
    setPayoutForm({
      amount: affiliate.availableCommission.toString(),
      notes: "",
      status: "completed",
    });
    setShowPayoutModal(true);
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Commission Payout Management</h1>
          <p className="text-slate-600 mt-2">Professional affiliate commission payout system</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Total Payouts
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  ${summary.totalAmount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {summary.totalCount} transactions
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Available Commission
                </p>
                <p className="text-3xl font-bold text-indigo-600 mt-1">
                  ${affiliates.reduce((sum, affiliate) => sum + affiliate.availableCommission, 0).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {affiliates.filter(a => a.availableCommission > 0).length} affiliates
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Pending
                </p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  ${summary.pendingAmount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {summary.pendingCount} awaiting
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Total Earned
                </p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  ${(summary.totalAmount + affiliates.reduce((sum, affiliate) => sum + affiliate.availableCommission, 0) + summary.pendingAmount).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {affiliates.length} affiliates
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab("affiliates")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "affiliates"
                ? "bg-blue-100 text-blue-700"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Affiliates ({affiliates.length})
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "payouts"
                ? "bg-blue-100 text-blue-700"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Payout History ({payouts.length})
          </button>
        </div>

        {/* Affiliates Tab */}
        {activeTab === "affiliates" && (
          <div className="space-y-4">
            {affiliates.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Affiliates Found</h3>
                <p className="text-slate-600">No approved affiliates available for payout management.</p>
              </div>
            ) : (
              affiliates.map((affiliate) => (
                <motion.div
                  key={affiliate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {affiliate.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{affiliate.name}</h3>
                      <p className="text-sm text-slate-600">{affiliate.email}</p>
                      <p className="text-xs text-slate-500">Code: {affiliate.referralCode}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-600">Available Commission</p>
                      <p className="text-xl font-bold text-slate-900">
                        ${affiliate.availableCommission.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-600">Total Paid</p>
                      <p className="text-lg font-bold text-emerald-600">
                        ${affiliate.totalPaid.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => openPayoutModal(affiliate)}
                      disabled={affiliate.availableCommission <= 0}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        affiliate.availableCommission > 0
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-slate-300 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {affiliate.availableCommission > 0 ? "Pay Out" : "No Balance"}
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Payouts Tab */}
        {activeTab === "payouts" && (
          <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-sm font-semibold text-slate-600">Filter by status:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange("all")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === "all"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleFilterChange("completed")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === "completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => handleFilterChange("pending")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === "pending"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>

            {payouts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Payouts Found</h3>
                <p className="text-slate-600">No payout records match the current filter.</p>
              </div>
            ) : (
              payouts.map((payout) => (
                <motion.div
                  key={payout.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Affiliate Info */}
                    <div className="col-span-4 flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        payout.status === "completed" ? "bg-emerald-500" : 
                        payout.status === "pending" ? "bg-orange-500" : 
                        "bg-slate-500"
                      }`} />
                      <div>
                        <h3 className="font-bold text-slate-900">{payout.affiliate?.name || 'Unknown Affiliate'}</h3>
                        <p className="text-sm text-slate-600">{payout.affiliate?.email || 'No email'}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(payout.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Amount */}
                    <div className="col-span-2 text-center">
                      <p className="text-sm font-semibold text-slate-600 mb-1">Amount</p>
                      <p className="text-lg font-bold text-slate-900">
                        ${payout.amountDue.toLocaleString()}
                      </p>
                    </div>
                    
                    {/* Status */}
                    <div className="col-span-2 text-center">
                      <p className="text-sm font-semibold text-slate-600 mb-1">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        payout.status === "completed" 
                          ? "bg-emerald-100 text-emerald-700"
                          : payout.status === "pending"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {payout.status.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Notes */}
                    <div className="col-span-4">
                      <p className="text-sm font-semibold text-slate-600 mb-1">Notes</p>
                      <p className="text-sm text-slate-500">{payout.notes || 'No notes'}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Payout Modal */}
      {showPayoutModal && selectedAffiliate && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Pay Out Commission
            </h2>
            
            <div className="mb-4 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Affiliate</p>
              <p className="font-semibold text-slate-900">{selectedAffiliate.name}</p>
              <p className="text-sm text-slate-600">{selectedAffiliate.email}</p>
              <p className="text-sm text-slate-500">Available: ${selectedAffiliate.availableCommission.toLocaleString()}</p>
            </div>

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedAffiliate.availableCommission}
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={payoutForm.notes}
                  onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  rows={3}
                  placeholder="Payment method, reference number, etc."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !payoutForm.amount}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "Processing..." : "Pay Out"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
