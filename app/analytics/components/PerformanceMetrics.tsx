"use client";

import { motion } from "framer-motion";
import { AnalyticsData } from "../types";

interface PerformanceMetricsProps {
  data: AnalyticsData;
}

export default function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  const metrics = [
    {
      title: "Total Assessments",
      value: data.totalLeads.toLocaleString(),
      icon: "📊",
      description: "All quiz attempts",
    },
    {
      title: "Average Completion Rate",
      value: `${data.conversionRate.toFixed(1)}%`,
      icon: "✅",
      description: "Quiz completion percentage",
    },
    {
      title: "Distinct Archetypes",
      value: data.distinctArchetypes.toString(),
      icon: "🎭",
      description: "Unique personality types",
    },
    {
      title: "Assessment Categories",
      value: data.assessmentCategories.toString(),
      icon: "📋",
      description: "Active quiz types",
    },
    {
      title: "Drop-off Rate",
      value: `${data.dropOffRate.toFixed(1)}%`,
      icon: "📉",
      description: "Quiz abandonment rate",
    },
    {
      title: "Avg Completion Time",
      value: `${data.avgCompletionTime}min`,
      icon: "⏱️",
      description: "Time to complete quiz",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="mt-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Performance Metrics
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{metric.icon}</span>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {metric.title}
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {metric.value}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              {metric.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
