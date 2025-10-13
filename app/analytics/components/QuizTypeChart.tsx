"use client";

import { motion } from "framer-motion";
import { QuizTypeDistribution } from "../types";

interface QuizTypeChartProps {
  data: QuizTypeDistribution[];
  onQuizTypeClick?: (quizType: string) => void;
}

export default function QuizTypeChart({ data, onQuizTypeClick }: QuizTypeChartProps) {
  const maxCount = Math.max(...data.map(item => item.count));

  const getQuizTypeIcon = (quizType: string) => {
    const iconMap: { [key: string]: string } = {
      "financial-profile": "💰",
      "health-finance": "🩺",
      "marriage-finance": "💕",
      "career-finance": "💼",
      "retirement-finance": "🏖️",
    };
    return iconMap[quizType] || "📊";
  };

  const getQuizTypeName = (quizType: string) => {
    const nameMap: { [key: string]: string } = {
      "financial-profile": "Financial Profile",
      "health-finance": "Health Finance",
      "marriage-finance": "Marriage Finance",
      "career-finance": "Career Finance",
      "retirement-finance": "Retirement Finance",
    };
    return nameMap[quizType] || quizType;
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
          Quiz Type Distribution
        </h3>
        <div className="text-sm text-gray-500">
          {data.length} quiz types
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <motion.div
            key={item.quizType}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group cursor-pointer"
            onClick={() => onQuizTypeClick?.(item.quizType)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{getQuizTypeIcon(item.quizType)}</span>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {getQuizTypeName(item.quizType)}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {item.count} completions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {item.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">
                  {item.conversionRate.toFixed(1)}% conversion
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full group-hover:from-blue-600 group-hover:to-blue-700 transition-all"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <p className="text-gray-500">No quiz data available</p>
        </div>
      )}
    </motion.div>
  );
}
