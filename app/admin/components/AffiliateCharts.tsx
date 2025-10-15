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
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Top Affiliates Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900">
              Top Affiliates by Revenue
            </h3>
            <p className="text-sm text-slate-600 font-medium">
              {topAffiliates.length} affiliates
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {topAffiliates.slice(0, 4).map((affiliate, index) => (
            <motion.div
              key={affiliate.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group cursor-pointer p-3 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">
                      {affiliate.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                      {affiliate.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs font-semibold">
                        {affiliate.tier}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">
                        {affiliate.leads} leads
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">
                    ${affiliate.revenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    {affiliate.conversionRate.toFixed(1)}% conversion
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-slate-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(affiliate.revenue / maxRevenue) * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full group-hover:from-indigo-600 group-hover:to-purple-700 transition-all shadow-sm"
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
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900">
              Traffic Source Breakdown
            </h3>
            <p className="text-sm text-slate-600 font-medium">
              {trafficSources.length} sources
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {trafficSources.slice(0, 4).map((source, index) => (
            <motion.div
              key={source.source}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group cursor-pointer p-3 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 shadow-sm" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                      {source.source}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {source.count.toLocaleString()} clicks
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">
                    {source.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-slate-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${source.percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full group-hover:from-emerald-600 group-hover:to-teal-700 transition-all shadow-sm"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Conversion Funnel by Tier - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900">
              Conversion Funnel by Affiliate Tier
            </h3>
            <p className="text-sm text-slate-600 font-medium">
              {conversionFunnel.length} tiers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conversionFunnel.map((funnel, index) => (
            <motion.div
              key={funnel.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group cursor-pointer p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-900 text-base capitalize group-hover:text-orange-600 transition-colors">
                  {funnel.tier} Partners
                </h4>
                <div className="text-sm text-slate-600 font-medium">
                  {funnel.clicks.toLocaleString()} clicks
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Clicks → Quiz</span>
                  <span className="font-medium text-slate-900">
                    {funnel.clicks.toLocaleString()} → {funnel.quizStarts.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Quiz → Completed</span>
                  <span className="font-medium text-slate-900">
                    {funnel.quizStarts.toLocaleString()} → {funnel.completed.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Completed → Booked</span>
                  <span className="font-medium text-slate-900">
                    {funnel.completed.toLocaleString()} → {funnel.booked.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Booked → Closed</span>
                  <span className="font-medium text-emerald-600">
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
