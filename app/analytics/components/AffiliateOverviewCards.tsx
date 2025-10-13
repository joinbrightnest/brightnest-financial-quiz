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
      icon: "🧑‍🤝‍🧑",
      description: "Active affiliate partners",
      trend: "+5",
      trendDirection: "up" as const,
      color: "bg-blue-500",
    },
    {
      title: "Total Leads from Affiliates",
      value: data.totalLeadsFromAffiliates.toLocaleString(),
      icon: "📈",
      description: "Quiz completions via affiliates",
      trend: "+12%",
      trendDirection: "up" as const,
      color: "bg-green-500",
    },
    {
      title: "Total Sales Value (Affiliated)",
      value: `$${data.totalSalesValue.toLocaleString()}`,
      icon: "💰",
      description: "Revenue from affiliate leads",
      trend: "+18%",
      trendDirection: "up" as const,
      color: "bg-purple-500",
    },
    {
      title: "Total Commissions Paid / Pending",
      value: `$${(data.totalCommissionsPaid + data.totalCommissionsPending).toLocaleString()}`,
      icon: "💵",
      description: "Commissions owed to affiliates",
      trend: "+8%",
      trendDirection: "up" as const,
      color: "bg-orange-500",
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
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">{card.icon}</span>
                <h3 className="text-sm font-medium text-gray-500 truncate">
                  {card.title}
                </h3>
              </div>
              <div className="flex items-baseline">
                <p className="text-3xl font-bold text-gray-900">
                  {card.value}
                </p>
                <div className={`ml-2 flex items-center text-sm ${
                  card.trendDirection === "up" 
                    ? "text-green-600" 
                    : card.trendDirection === "down"
                    ? "text-red-600"
                    : "text-gray-500"
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
              <p className="text-xs text-gray-400 mt-1">
                {card.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
