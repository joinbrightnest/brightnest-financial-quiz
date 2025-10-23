"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AffiliateHeader from "../components/AffiliateHeader";

interface AffiliateData {
  id: string;
  name: string;
  email: string;
  tier: string;
  referralCode: string;
  customLink: string;
  commissionRate: number;
  totalClicks: number;
  totalLeads: number;
  totalBookings: number;
  totalSales: number;
  totalCommission: number;
  isApproved: boolean;
}

interface PayoutData {
  affiliate: {
    id: string;
    name: string;
    email: string;
    totalCommission: number;
    totalEarned: number;
    totalPaid: number;
    pendingPayouts: number;
    availableCommission: number;
    payoutMethod: string;
  };
  payouts: Array<{
    id: string;
    amountDue: number;
    status: string;
    notes: string | null;
    createdAt: string;
    paidAt: string | null;
  }>;
  summary: {
    totalEarned: number;
    totalPaid: number;
    pendingPayouts: number;
    availableCommission: number;
  };
}

export default function AffiliatePayoutsPage() {
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [payoutData, setPayoutData] = useState<PayoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (affiliate) {
      fetchPayoutData();
    }
  }, [affiliate]);

  const checkAuth = async () => {
    const token = localStorage.getItem("affiliate_token");
    const affiliateId = localStorage.getItem("affiliate_id");
    
    if (!token || !affiliateId) {
      router.push("/affiliates/login");
      return;
    }

    try {
      const response = await fetch(`/api/affiliate/profile?_t=${Date.now()}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const affiliateData = await response.json();
        setAffiliate(affiliateData);
      } else {
        localStorage.removeItem("affiliate_token");
        localStorage.removeItem("affiliate_id");
        router.push("/affiliates/login");
        return;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("affiliate_token");
      localStorage.removeItem("affiliate_id");
      router.push("/affiliates/login");
      return;
    }
  };

  const fetchPayoutData = async () => {
    const token = localStorage.getItem("affiliate_token");
    
    if (!token) {
      router.push("/affiliates/login");
      return;
    }

    try {
      const response = await fetch("/api/affiliate/payouts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayoutData(data.data);
      } else if (response.status === 401) {
        router.push("/affiliates/login");
        return;
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch payout data");
      }
    } catch (error) {
      console.error("Error fetching payout data:", error);
      setError("Failed to fetch payout data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("affiliate_token");
    localStorage.removeItem("affiliate_id");
    router.push("/affiliates/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {affiliate && <AffiliateHeader affiliate={affiliate} onLogout={handleLogout} />}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-6">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {affiliate && <AffiliateHeader affiliate={affiliate} onLogout={handleLogout} />}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-8 shadow-lg">
            <div className="text-red-800">
              <h3 className="font-semibold text-lg mb-2">Error loading payout data</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {affiliate && <AffiliateHeader affiliate={affiliate} onLogout={handleLogout} />}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payouts</h1>
              <p className="text-gray-600 mt-1">Track your commission earnings and payout history</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Earnings Summary */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Earnings Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200/50 hover:shadow-md transition-all duration-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${payoutData?.summary.totalEarned.toLocaleString() || "0"}
                </div>
                <div className="text-sm font-medium text-blue-700">Total Earned</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200/50 hover:shadow-md transition-all duration-200">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${payoutData?.summary.totalPaid.toLocaleString() || "0"}
                </div>
                <div className="text-sm font-medium text-green-700">Paid Out</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200/50 hover:shadow-md transition-all duration-200">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  ${payoutData?.summary.pendingPayouts.toLocaleString() || "0"}
                </div>
                <div className="text-sm font-medium text-yellow-700">Pending</div>
              </div>
            </div>
          </motion.div>

          {/* Payout Settings */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              Payout Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payout Method</label>
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 capitalize">
                  {payoutData?.affiliate.payoutMethod || "Stripe"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Payout</label>
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">$50.00</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payout Schedule</label>
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">Monthly (1st of each month)</div>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Available Balance</label>
                <div className="text-xl font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-200">
                  ${payoutData?.summary.availableCommission.toLocaleString() || "0"}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Payout History */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-all duration-300"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            Payout History
          </h2>
          {payoutData?.payouts && payoutData.payouts.length > 0 ? (
            <div className="space-y-4">
              {payoutData.payouts.map((payout, index) => (
                <motion.div 
                  key={payout.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-gradient-to-r from-gray-50 to-white border border-gray-200/50 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-6">
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            ${payout.amountDue.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(payout.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            payout.status === "completed" 
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : payout.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}>
                            {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      {payout.notes && (
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">{payout.notes}</p>
                      )}
                      {payout.paidAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Paid on: {new Date(payout.paidAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 inline-block mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="text-gray-500 font-medium">No payout history yet</div>
              <div className="text-sm text-gray-400 mt-1">Payouts will appear here once you start earning commissions</div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}