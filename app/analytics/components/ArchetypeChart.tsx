"use client";

import { motion } from "framer-motion";
import { ArchetypeData } from "../types";

interface ArchetypeChartProps {
  data: ArchetypeData[];
  onArchetypeClick?: (archetype: string) => void;
}

export default function ArchetypeChart({ data, onArchetypeClick }: ArchetypeChartProps) {
  const maxCount = Math.max(...data.map(item => item.count));

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Personality Archetype Breakdown
        </h3>
        <div className="text-sm text-gray-500">
          {data.length} archetypes
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <motion.div
            key={item.archetype}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group cursor-pointer"
            onClick={() => onArchetypeClick?.(item.archetype)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${getArchetypeColor(index)}`} />
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.archetype}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {item.count} leads
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {item.percentage.toFixed(1)}%
                </div>
                {item.avgCompletionTime && (
                  <div className="text-sm text-gray-500">
                    {item.avgCompletionTime}min avg
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`bg-gradient-to-r ${getArchetypeGradient(index)} h-2 rounded-full group-hover:opacity-80 transition-all`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">🧩</div>
          <p className="text-gray-500">No archetype data available</p>
        </div>
      )}

      {/* Legend */}
      {data.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Archetype Descriptions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.slice(0, 4).map((item, index) => (
              <div key={item.archetype} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getArchetypeColor(index)}`} />
                <span className="text-xs text-gray-600 truncate">
                  {item.archetype}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
