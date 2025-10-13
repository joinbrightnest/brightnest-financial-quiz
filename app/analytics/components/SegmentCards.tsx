"use client";

import { motion } from "framer-motion";
import { SegmentData } from "../types";

interface SegmentCardsProps {
  data: SegmentData[];
  onSegmentClick?: (archetype: string) => void;
}

export default function SegmentCards({ data, onSegmentClick }: SegmentCardsProps) {
  const getArchetypeColor = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500", 
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-yellow-500",
    ];
    return colors[index % colors.length];
  };

  const getArchetypeGradient = (index: number) => {
    const gradients = [
      "from-blue-500 to-blue-600",
      "from-green-500 to-green-600",
      "from-purple-500 to-purple-600", 
      "from-orange-500 to-orange-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600",
      "from-red-500 to-red-600",
      "from-yellow-500 to-yellow-600",
    ];
    return gradients[index % gradients.length];
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return (
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      );
    } else if (trend < 0) {
      return (
        <svg className="w-4 h-4 text-red-500 rotate-180" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-500";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Behavioral & Archetype Segments
        </h3>
        <p className="text-sm text-gray-500">
          {data.length} segments identified
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((segment, index) => (
          <motion.div
            key={segment.archetype}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => onSegmentClick?.(segment.archetype)}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${getArchetypeColor(index)}`} />
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {segment.archetype}
                </h4>
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(segment.trend)}
                <span className={`text-sm font-medium ${getTrendColor(segment.trend)}`}>
                  {segment.trend > 0 ? "+" : ""}{segment.trend}%
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {segment.totalLeads.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Total Leads</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {segment.percentage.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">of Total</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${segment.percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`bg-gradient-to-r ${getArchetypeGradient(index)} h-2 rounded-full`}
                />
              </div>
            </div>

            {/* Completion Time */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Avg Completion Time</span>
                <span className="font-medium text-gray-900">
                  {segment.avgCompletionTime}min
                </span>
              </div>
            </div>

            {/* Behaviors */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Key Behaviors
              </h5>
              <div className="space-y-1">
                {segment.behaviors.slice(0, 3).map((behavior, behaviorIndex) => (
                  <div key={behaviorIndex} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getArchetypeColor(index)}`} />
                    <span className="text-xs text-gray-600">{behavior}</span>
                  </div>
                ))}
                {segment.behaviors.length > 3 && (
                  <p className="text-xs text-gray-400">
                    +{segment.behaviors.length - 3} more behaviors
                  </p>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 group-hover:bg-blue-50 rounded-md py-2 transition-colors">
                View Segment Leads →
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">🧩</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No segments found
          </h3>
          <p className="text-gray-500">
            No archetype segments are available for the selected filters.
          </p>
        </div>
      )}

      {/* Summary Stats */}
      {data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mt-8 bg-gray-50 rounded-xl p-6"
        >
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            Segment Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {data.reduce((sum, segment) => sum + segment.totalLeads, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Total Leads Across Segments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(data.reduce((sum, segment) => sum + segment.avgCompletionTime, 0) / data.length)}min
              </p>
              <p className="text-sm text-gray-500">Average Completion Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {data.filter(segment => segment.trend > 0).length}
              </p>
              <p className="text-sm text-gray-500">Growing Segments</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
