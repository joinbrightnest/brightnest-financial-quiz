"use client";

import { motion } from "framer-motion";

interface AffiliateOverviewCardsProps {
  data: {
    totalActiveAffiliates: number;
    totalLeadsFromAffiliates: number;
    totalBookedCalls: number;
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
      title: "Total Calls",
      value: data.totalBookedCalls.toLocaleString(),
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      description: "Calls booked from affiliate leads",
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
          <div className="flex flex-col h-full">
            {/* Icon at top */}
            <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-xl shadow-lg flex items-center justify-center mb-4`}>
              {card.icon}
            </div>
            
            {/* Content stacked vertically */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                {card.title}
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {card.value}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
