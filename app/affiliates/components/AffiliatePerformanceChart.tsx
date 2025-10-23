"use client";

import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useState } from "react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DailyStats {
  date: string;
  clicks: number;
  leads: number;
  bookedCalls: number;
  commission: number;
}

interface AffiliatePerformanceChartProps {
  dailyStats: DailyStats[];
  loading: boolean;
}

export default function AffiliatePerformanceChart({ dailyStats, loading }: AffiliatePerformanceChartProps) {
  const [visibleMetrics, setVisibleMetrics] = useState({
    clicks: true,
    leads: true,
    bookedCalls: true,
    earnings: true,
  });

  // Add safety check for dailyStats
  if (!dailyStats || !Array.isArray(dailyStats)) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: dailyStats.map(day => {
      const date = new Date(day.date);
      // Check if this is hourly data (contains time)
      if (day.date.includes('T')) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    }),
    datasets: [
      {
        label: 'Clicks',
        data: dailyStats.map(day => day.clicks),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: false,
        hidden: !visibleMetrics.clicks,
      },
      {
        label: 'Leads',
        data: dailyStats.map(day => day.leads),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: false,
        hidden: !visibleMetrics.leads,
      },
      {
        label: 'Booked Calls',
        data: dailyStats.map(day => day.bookedCalls || 0), // Use bookedCalls field
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: false,
        hidden: !visibleMetrics.bookedCalls,
      },
      {
        label: 'Earnings',
        data: dailyStats.map(day => day.commission || 0),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: false,
        hidden: !visibleMetrics.earnings,
        yAxisID: 'y1',
      },
    ],
  };

  // Calculate max values for proper scaling
  const maxClicks = Math.max(...dailyStats.map(day => day.clicks), 1);
  const maxLeads = Math.max(...dailyStats.map(day => day.leads), 1);
  const maxBookedCalls = Math.max(...dailyStats.map(day => day.bookedCalls || 0), 1);
  const maxCommission = Math.max(...dailyStats.map(day => day.commission || 0), 1);
  
  // Calculate appropriate step sizes
  const leftAxisMax = Math.max(maxClicks, maxLeads, maxBookedCalls);
  const rightAxisMax = maxCommission;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide the default Chart.js legend
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.ceil(leftAxisMax * 1.1), // Add 10% padding
        ticks: {
          stepSize: Math.ceil(leftAxisMax / 10), // Dynamic step size
          callback: function(value) {
            return Number.isInteger(value) ? value : '';
          },
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        max: Math.ceil(rightAxisMax * 1.1), // Add 10% padding
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          stepSize: Math.ceil(rightAxisMax / 10), // Dynamic step size
          callback: function(value) {
            return '$' + value.toFixed(0);
          },
        },
      },
    },
  };

  const toggleMetric = (metric: keyof typeof visibleMetrics) => {
    setVisibleMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Performance Over Time
        </h3>
        <div className="text-xs sm:text-sm text-gray-900">
          {dailyStats.length === 24 && dailyStats[0]?.date.includes('T') ? '24 hours' : `${dailyStats.length} days`}
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 lg:gap-6 mb-3 sm:mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleMetric('clicks')}
            className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              visibleMetrics.clicks 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}
          >
            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${visibleMetrics.clicks ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
            <span>Clicks</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleMetric('leads')}
            className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              visibleMetrics.leads 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}
          >
            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${visibleMetrics.leads ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span>Leads</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleMetric('bookedCalls')}
            className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              visibleMetrics.bookedCalls 
                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}
          >
            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${visibleMetrics.bookedCalls ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
            <span>Booked Calls</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleMetric('earnings')}
            className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              visibleMetrics.earnings 
                ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}
          >
            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${visibleMetrics.earnings ? 'bg-amber-500' : 'bg-gray-400'}`}></div>
            <span>Earnings</span>
          </button>
        </div>
      </div>

      <div className="h-64 sm:h-72 lg:h-80">
        <Line data={chartData} options={chartOptions} />
      </div>
    </motion.div>
  );
}