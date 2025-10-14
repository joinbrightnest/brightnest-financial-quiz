"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AffiliateHeader from "../components/AffiliateHeader";
import AffiliateMetricsGrid from "../components/AffiliateMetricsGrid";
import AffiliatePerformanceChart from "../components/AffiliatePerformanceChart";
import AffiliateLinkCard from "../components/AffiliateLinkCard";

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

interface AffiliateStats {
  totalClicks: number;
  totalLeads: number;
  totalBookings: number;
  totalSales: number;
  totalCommission: number;
  conversionRate: number;
  averageSaleValue: number;
  pendingCommission: number;
  paidCommission: number;
  dailyStats: Array<{
    date: string;
    clicks: number;
    leads: number;
    sales: number;
    commission: number;
  }>;
}

export default function AffiliateDashboard() {
  const router = useRouter();
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("30d");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (affiliate) {
      fetchStats();
    }
  }, [affiliate, dateRange]);

  const checkAuth = async () => {
    const token = localStorage.getItem("affiliate_token");
    const affiliateId = localStorage.getItem("affiliate_id");
    
    if (!token || !affiliateId) {
      router.push("/affiliates/login");
      return;
    }

    try {
      const response = await fetch("/api/affiliate/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAffiliate(data);
      } else {
        localStorage.removeItem("affiliate_token");
        localStorage.removeItem("affiliate_id");
        router.push("/affiliates/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("affiliate_token");
      localStorage.removeItem("affiliate_id");
      router.push("/affiliates/login");
    }
  };

  const fetchStats = async () => {
    if (!affiliate) return;

    try {
      setLoading(true);
      
      // Use the new affiliate data API
      console.log("Fetching affiliate data for:", affiliate.referralCode);
      const response = await fetch(`/api/affiliate-data?referralCode=${affiliate.referralCode}`);

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setError(null);
        console.log("Affiliate data loaded:", data.stats);
      } else {
        // Fallback to affiliate profile data
        console.log("Using affiliate profile data as fallback");
        const stats = {
          totalClicks: affiliate.totalClicks || 0,
          totalLeads: affiliate.totalLeads || 0,
          totalBookings: affiliate.totalBookings || 0,
          totalSales: affiliate.totalSales || 0,
          totalCommission: Number(affiliate.commissionRate) * (affiliate.totalSales || 0),
          conversionRate: (affiliate.totalClicks || 0) > 0 ? ((affiliate.totalSales || 0) / (affiliate.totalClicks || 0)) * 100 : 0,
          averageSaleValue: (affiliate.totalSales || 0) > 0 ? (Number(affiliate.commissionRate) * (affiliate.totalSales || 0)) / (affiliate.totalSales || 0) : 0,
          pendingCommission: 0,
          paidCommission: 0,
          dailyStats: []
        };
        setStats(stats);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("affiliate_token");
    localStorage.removeItem("affiliate_id");
    router.push("/affiliates/login");
  };

  if (loading && !affiliate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading affiliate dashboard...</p>
        </div>
      </div>
    );
  }

  if (!affiliate) {
    return null;
  }

  if (!affiliate.isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">Account Pending Approval</h2>
            <p className="text-yellow-600 mb-4">
              Your affiliate account is pending approval. You'll receive an email once it's approved.
            </p>
            <button
              onClick={handleLogout}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AffiliateHeader 
        affiliate={affiliate} 
        onLogout={handleLogout}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {affiliate.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Track your performance and earnings as a {affiliate.tier} affiliate
          </p>
        </motion.div>

        {/* Date Range Filter */}
        <div className="mb-6">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>
        </div>

        {/* Metrics Grid */}
        {stats && (
          <AffiliateMetricsGrid stats={stats} />
        )}

        {/* Charts and Link Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Performance Chart */}
          {stats && (
            <AffiliatePerformanceChart 
              dailyStats={stats.dailyStats}
              loading={loading}
            />
          )}

          {/* Affiliate Link Card */}
          <AffiliateLinkCard 
            affiliate={affiliate}
            loading={loading}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchStats}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
