"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  const [payoutData, setPayoutData] = useState<PayoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
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

    fetchPayoutData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
                <p className="mt-1 text-sm text-gray-500">
                  View your commission earnings and payout history
                </p>
              </div>
              <Link
                href="/affiliates/dashboard"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-4">
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
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
                <p className="mt-1 text-sm text-gray-500">
                  View your commission earnings and payout history
                </p>
              </div>
              <Link
                href="/affiliates/dashboard"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-800">
              <h3 className="font-medium">Error loading payout data</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
              <p className="mt-1 text-sm text-gray-500">
                View your commission earnings and payout history
              </p>
            </div>
            <Link
              href="/affiliates/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Earnings Summary */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Earnings Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${payoutData?.summary.totalEarned.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-gray-600">Total Earned</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${payoutData?.summary.totalPaid.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-gray-600">Paid Out</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  ${payoutData?.summary.pendingPayouts.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>

          {/* Payout Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payout Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Payout Method</label>
                <div className="mt-1 text-sm text-gray-900 capitalize">
                  {payoutData?.affiliate.payoutMethod || "Stripe"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Minimum Payout</label>
                <div className="mt-1 text-sm text-gray-900">$50.00</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payout Schedule</label>
                <div className="mt-1 text-sm text-gray-900">Monthly (1st of each month)</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Available Balance</label>
                <div className="mt-1 text-lg font-semibold text-gray-900">
                  ${payoutData?.summary.availableCommission.toLocaleString() || "0"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payout History */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Payout History</h2>
          {payoutData?.payouts && payoutData.payouts.length > 0 ? (
            <div className="space-y-4">
              {payoutData.payouts.map((payout) => (
                <div key={payout.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            ${payout.amountDue.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(payout.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payout.status === "completed" 
                              ? "bg-green-100 text-green-800"
                              : payout.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      {payout.notes && (
                        <p className="text-sm text-gray-600 mt-1">{payout.notes}</p>
                      )}
                      {payout.paidAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Paid on: {new Date(payout.paidAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm">No payout history yet</div>
              <div className="text-xs mt-1">Payouts will appear here once you start earning commissions</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}