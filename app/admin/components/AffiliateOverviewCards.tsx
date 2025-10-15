"use client";

import { motion } from "framer-motion";

interface AffiliateOverviewCardsProps {
  data: {
    totalActiveAffiliates: number;
    totalLeadsFromAffiliates: number;
    totalSalesValue: number;
    totalCommissionsPaid: number;
    totalCommissionsPending: number;
  };
}

export default function AffiliateOverviewCards({ data }: AffiliateOverviewCardsProps) {
  const cards = [
    {
      title: "Total Active Affiliates",
      value: data.totalActiveAffiliates.toLocaleString(),
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: "Active affiliate partners",
      trend: "+5",
      trendDirection: "up" as const,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Leads from Affiliates",
      value: data.totalLeadsFromAffiliates.toLocaleString(),
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      description: "Quiz completions via affiliates",
      trend: "+12%",
      trendDirection: "up" as const,
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Total Sales Value (Affiliated)",
      value: `$${data.totalSalesValue.toLocaleString()}`,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      description: "Revenue from affiliate leads",
      trend: "+18%",
      trendDirection: "up" as const,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Total Commissions Paid / Pending",
      value: `$${(data.totalCommissionsPaid + data.totalCommissionsPending).toLocaleString()}`,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      description: "Commissions owed to affiliates",
      trend: "+8%",
      trendDirection: "up" as const,
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-3 bg-gradient-to-br ${card.gradient} rounded-xl shadow-lg`}>
                {card.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {card.value}
                </p>
                <div className="flex items-center mt-2">
                  <div className={`flex items-center text-sm font-semibold ${
                    card.trendDirection === "up" 
                      ? "text-emerald-600" 
                      : card.trendDirection === "down"
                      ? "text-red-600"
                      : "text-slate-500"
                  }`}>
                    <svg 
                      className={`w-4 h-4 mr-1 ${
                        card.trendDirection === "up" ? "rotate-0" : 
                        card.trendDirection === "down" ? "rotate-180" : "hidden"
                      }`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {card.trend}
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {card.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
