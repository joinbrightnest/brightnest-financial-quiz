"use client";

import { QuizType } from "../types";

interface FiltersBarProps {
  selectedQuizType: string;
  dateRange: string;
  onQuizTypeChange: (quizType: string) => void;
  onDateRangeChange: (dateRange: string) => void;
  quizTypes: QuizType[];
}

export default function FiltersBar({
  selectedQuizType,
  dateRange,
  onQuizTypeChange,
  onDateRangeChange,
  quizTypes,
}: FiltersBarProps) {
  const dateRangeOptions = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "1y", label: "Last year" },
    { value: "all", label: "All time" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Quiz Type Filter */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Quiz Type:</label>
        <select
          value={selectedQuizType}
          onChange={(e) => onQuizTypeChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Quiz Types</option>
          {quizTypes.map((quizType) => (
            <option key={quizType.id} value={quizType.id}>
              {quizType.icon} {quizType.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Date Range:</label>
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {dateRangeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex items-center space-x-2 ml-auto">
        <span className="text-sm font-medium text-gray-700">Quick Filters:</span>
        <button
          onClick={() => {
            onQuizTypeChange("all");
            onDateRangeChange("30d");
          }}
          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => onDateRangeChange("7d")}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
        >
          This Week
        </button>
        <button
          onClick={() => onDateRangeChange("30d")}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
        >
          This Month
        </button>
      </div>
    </div>
  );
}
