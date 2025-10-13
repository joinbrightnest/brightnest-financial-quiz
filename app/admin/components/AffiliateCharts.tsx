"use client";

import { motion } from "framer-motion";

interface AffiliatePerformance {
  id: string;
  name: string;
  tier: string;
  clicks: number;
  leads: number;
  bookedCalls: number;
  sales: number;
  conversionRate: number;
  revenue: number;
  commission: number;
  lastActive: string;
}

interface TrafficSource {
  source: string;
  count: number;
  percentage: number;
}

interface ConversionFunnel {
  tier: string;
  clicks: number;
  quizStarts: number;
  completed: number;
  booked: number;
  closed: number;
}

interface AffiliateChartsProps {
  topAffiliates: AffiliatePerformance[];
  trafficSources: TrafficSource[];
  conversionFunnel: ConversionFunnel[];
}

export default function AffiliateCharts({ 
  topAffiliates, 
  trafficSources, 
  conversionFunnel 
}: AffiliateChartsProps) {
  const maxRevenue = Math.max(...topAffiliates.map(a => a.revenue));

  return (
    <div className="space-y-6">
      {/* Top Affiliates Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Top Affiliates by Revenue
          </h3>
          <div className="text-sm text-gray-500">
            {topAffiliates.length} affiliates
          </div>
        </div>

        <div className="space-y-4">
          {topAffiliates.slice(0, 5).map((affiliate, index) => (
            <motion.div
              key={affiliate.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {affiliate.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {affiliate.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {affiliate.tier} • {affiliate.leads} leads
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    ${affiliate.revenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {affiliate.conversionRate.toFixed(1)}% conversion
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(affiliate.revenue / maxRevenue) * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full group-hover:from-blue-600 group-hover:to-blue-700 transition-all"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Traffic Source Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Traffic Source Breakdown
          </h3>
          <div className="text-sm text-gray-500">
            {trafficSources.length} sources
          </div>
        </div>

        <div className="space-y-4">
          {trafficSources.map((source, index) => (
            <motion.div
              key={source.source}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                      {source.source}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {source.count.toLocaleString()} clicks
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {source.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${source.percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full group-hover:from-green-600 group-hover:to-green-700 transition-all"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Conversion Funnel by Tier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Conversion Funnel by Affiliate Tier
          </h3>
          <div className="text-sm text-gray-500">
            {conversionFunnel.length} tiers
          </div>
        </div>

        <div className="space-y-4">
          {conversionFunnel.map((funnel, index) => (
            <motion.div
              key={funnel.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 capitalize">
                  {funnel.tier} Partners
                </h4>
                <div className="text-sm text-gray-500">
                  {funnel.clicks.toLocaleString()} clicks
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Clicks → Quiz Starts</span>
                  <span className="font-medium">
                    {funnel.clicks.toLocaleString()} → {funnel.quizStarts.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Quiz Starts → Completed</span>
                  <span className="font-medium">
                    {funnel.quizStarts.toLocaleString()} → {funnel.completed.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completed → Booked</span>
                  <span className="font-medium">
                    {funnel.completed.toLocaleString()} → {funnel.booked.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Booked → Closed</span>
                  <span className="font-medium text-green-600">
                    {funnel.booked.toLocaleString()} → {funnel.closed.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
