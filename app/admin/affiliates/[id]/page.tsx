"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface AffiliateData {
  id: string;
  name: string;
  email: string;
  tier: string;
  referralCode: string;
  customLink: string;
  customTrackingLink?: string;
  commissionRate: number;
  totalClicks: number;
  totalLeads: number;
  totalBookings: number;
  totalCommission: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AffiliateStats {
  totalClicks: number;
  totalLeads: number;
  totalBookings: number;
  totalCommission: number;
  conversionRate: number;
  dailyStats: Array<{
    date: string;
    clicks: number;
    leads: number;
    bookings: number;
    commission: number;
  }>;
  trafficSources: Array<{
    source: string;
    clicks: number;
    percentage: number;
  }>;
  conversionFunnel: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    date: string;
    action: string;
    amount?: number;
    commission?: number;
  }>;
}

export default function AffiliatePerformancePage() {
  const params = useParams();
  const router = useRouter();
  const affiliateId = params.id as string;
  
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("30d");
  
  // Tracking link editor state
  const [isEditingTrackingLink, setIsEditingTrackingLink] = useState(false);
  const [customTrackingLink, setCustomTrackingLink] = useState("");
  const [updatingTrackingLink, setUpdatingTrackingLink] = useState(false);

  useEffect(() => {
    if (affiliateId) {
      fetchAffiliateData();
    }
  }, [affiliateId, dateRange]);

  const fetchAffiliateData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch affiliate profile data
      const affiliateResponse = await fetch(`/api/admin/affiliates/${affiliateId}`);
      if (!affiliateResponse.ok) {
        throw new Error("Failed to fetch affiliate data");
      }
      const affiliate = await affiliateResponse.json();
      setAffiliateData(affiliate);

      // Fetch affiliate stats
      const statsResponse = await fetch(`/api/admin/affiliates/${affiliateId}/stats?dateRange=${dateRange}`);
      if (!statsResponse.ok) {
        throw new Error("Failed to fetch affiliate stats");
      }
      const statsData = await statsResponse.json();
      setStats(statsData);

    } catch (err) {
      console.error("Error fetching affiliate data:", err);
      setError(err instanceof Error ? err.message : "Failed to load affiliate data");
    } finally {
      setLoading(false);
    }
  };

  const updateTrackingLink = async () => {
    if (!affiliateData) return;
    
    try {
      setUpdatingTrackingLink(true);
      
      const response = await fetch(`/api/admin/affiliates/${affiliateId}/update-tracking-link`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customTrackingLink: customTrackingLink.trim() || null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Tracking link updated successfully:", result);
        
        // Update local state
        setAffiliateData(prev => prev ? {
          ...prev,
          customTrackingLink: customTrackingLink.trim() || undefined,
          updatedAt: new Date().toISOString(),
        } : null);
        
        setIsEditingTrackingLink(false);
        setCustomTrackingLink("");
      } else {
        const errorData = await response.json();
        console.error("Failed to update tracking link:", errorData);
        setError(errorData.error || "Failed to update tracking link");
      }
    } catch (err) {
      console.error("Error updating tracking link:", err);
      setError("Failed to update tracking link");
    } finally {
      setUpdatingTrackingLink(false);
    }
  };

  const startEditingTrackingLink = () => {
    setCustomTrackingLink(affiliateData?.customTrackingLink || "");
    setIsEditingTrackingLink(true);
  };

  const cancelEditingTrackingLink = () => {
    setCustomTrackingLink("");
    setIsEditingTrackingLink(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !affiliateData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Affiliate Performance Details
              </h1>
              <p className="text-gray-900 mt-1">
                {affiliateData.name} • {affiliateData.tier} tier • Code: {affiliateData.referralCode}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <a
                href={`/admin/affiliates/${affiliateId}/crm`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                CRM View
              </a>
              <button
                onClick={() => router.back()}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tracking Link Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tracking Link Settings</h2>
            {!isEditingTrackingLink && (
              <button
                onClick={startEditingTrackingLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Edit Tracking Link
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Active Tracking Link */}
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-green-900 mb-2">Active Tracking Link</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={affiliateData.customTrackingLink || affiliateData.customLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-green-300 rounded-md bg-white text-sm font-mono text-black"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(affiliateData.customTrackingLink || affiliateData.customLink)}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Copy Active
                </button>
              </div>
              <p className="text-xs text-black mt-1">
                This is the link that will be used for tracking. Only this link will work for affiliate tracking.
              </p>
            </div>

            {/* Custom Tracking Link Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Set Custom Tracking Link
              </label>
              {isEditingTrackingLink ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={customTrackingLink}
                    onChange={(e) => setCustomTrackingLink(e.target.value)}
                    placeholder="Enter custom tracking link (e.g., /special-offer, https://example.com/track)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={updateTrackingLink}
                      disabled={updatingTrackingLink}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                    >
                      {updatingTrackingLink ? "Saving..." : "Save & Activate"}
                    </button>
                    <button
                      onClick={cancelEditingTrackingLink}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-black">
                    When you save a custom link, it will replace the current active link. The old link will stop working.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={affiliateData.customTrackingLink || "No custom link set"}
                      readOnly
                      className={`flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm ${
                        affiliateData.customTrackingLink 
                          ? "bg-white text-black" 
                          : "bg-gray-50 text-gray-500"
                      }`}
                    />
                    {affiliateData.customTrackingLink && (
                      <button
                        onClick={() => navigator.clipboard.writeText(affiliateData.customTrackingLink!)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-black">
                    {affiliateData.customTrackingLink 
                      ? "Custom link is active. The default link is disabled."
                      : "No custom link set. Using default referral code link."
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Default Link (only show if no custom link) */}
            {!affiliateData.customTrackingLink && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Default Link (Inactive)</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={affiliateData.customLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-500"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(affiliateData.customLink)}
                    className="px-3 py-2 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 text-sm"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-black mt-1">
                  This is the automatically generated link. It will be disabled when you set a custom link.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{stats.totalClicks.toLocaleString()}</p>
                <p className="text-sm text-gray-900">Total Clicks</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{stats.totalLeads.toLocaleString()}</p>
                <p className="text-sm text-gray-900">Total Leads</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">{stats.totalBookings.toLocaleString()}</p>
                <p className="text-sm text-gray-900">Booked Calls</p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">${stats.totalCommission.toLocaleString()}</p>
                <p className="text-sm text-gray-900">Total Commission</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Over Time</h4>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <div className="text-4xl text-gray-400 mb-2">📈</div>
                    <p className="text-gray-900">Performance chart</p>
                    <p className="text-sm text-gray-900">{stats.dailyStats.length} data points</p>
                  </div>
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h4>
                <div className="space-y-3">
                  {stats.conversionFunnel.map((stage, index) => (
                    <div key={stage.stage} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{stage.count.toLocaleString()}</p>
                        <p className="text-xs text-gray-900">{stage.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Traffic Sources & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Traffic Sources */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h4>
                <div className="space-y-3">
                  {stats.trafficSources.map((source) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{source.source}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{source.clicks.toLocaleString()}</p>
                        <p className="text-xs text-gray-900">{source.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-900">{new Date(activity.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        {activity.amount && activity.amount > 0 && (
                          <p className="text-sm font-bold text-gray-900">${activity.amount}</p>
                        )}
                        {activity.commission && activity.commission > 0 && (
                          <p className="text-xs text-green-600">+${activity.commission}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
