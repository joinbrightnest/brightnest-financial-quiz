"use client";

import { motion } from "framer-motion";
import { AnalyticsData } from "../types";

interface MetricsGridProps {
  data: AnalyticsData;
}

export default function MetricsGrid({ data }: MetricsGridProps) {
  const metrics = [
    {
      title: "Total Qualified Leads",
      value: data.totalLeads.toLocaleString(),
      icon: "🧍‍♂️",
      description: "All quiz completions",
      trend: "+12%",
      trendDirection: "up" as const,
    },
    {
      title: "Unique Personality Archetypes",
      value: data.distinctArchetypes.toString(),
      icon: "🧩",
      description: "Distinct personality types",
      trend: "+3",
      trendDirection: "up" as const,
    },
    {
      title: "Active Quiz Types",
      value: data.assessmentCategories.toString(),
      icon: "📄",
      description: "Number of quiz categories",
      trend: "0",
      trendDirection: "neutral" as const,
    },
    {
      title: "Average Conversion Rate",
      value: `${data.conversionRate.toFixed(1)}%`,
      icon: "💰",
      description: "Quiz started → completed",
      trend: "+2.3%",
      trendDirection: "up" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">{metric.icon}</span>
                <h3 className="text-sm font-medium text-gray-500 truncate">
                  {metric.title}
                </h3>
              </div>
              <div className="flex items-baseline">
                <p className="text-3xl font-bold text-gray-900">
                  {metric.value}
                </p>
                {metric.trend !== "0" && (
                  <div className={`ml-2 flex items-center text-sm ${
                    metric.trendDirection === "up" 
                      ? "text-green-600" 
                      : metric.trendDirection === "down"
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}>
                    <svg 
                      className={`w-4 h-4 mr-1 ${
                        metric.trendDirection === "up" ? "rotate-0" : 
                        metric.trendDirection === "down" ? "rotate-180" : "hidden"
                      }`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {metric.trend}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {metric.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
