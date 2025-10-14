"use client";

import { motion } from "framer-motion";

interface DailyStats {
  date: string;
  clicks: number;
  leads: number;
  sales: number;
  commission: number;
}

interface AffiliatePerformanceChartProps {
  dailyStats: DailyStats[];
  loading: boolean;
}

export default function AffiliatePerformanceChart({ dailyStats, loading }: AffiliatePerformanceChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Performance Over Time
        </h3>
        <div className="text-sm text-gray-900">
          {dailyStats.length} days
        </div>
      </div>

      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl text-gray-400 mb-2">📈</div>
          <p className="text-gray-900">Performance chart would go here</p>
          <p className="text-sm text-gray-900">
            {dailyStats.length} data points available
          </p>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">
            {dailyStats.reduce((sum, day) => sum + day.clicks, 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-900">Total Clicks</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">
            {dailyStats.reduce((sum, day) => sum + day.sales, 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-900">Total Sales</p>
        </div>
      </div>
    </motion.div>
  );
}
