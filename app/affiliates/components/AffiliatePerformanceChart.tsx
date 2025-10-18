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
  sales: number;
  commission: number;
}

interface AffiliatePerformanceChartProps {
  dailyStats: DailyStats[];
  loading: boolean;
}

export default function AffiliatePerformanceChart({ dailyStats, loading }: AffiliatePerformanceChartProps) {
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
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Clicks',
        data: dailyStats.map(day => day.clicks),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Sales',
        data: dailyStats.map(day => day.sales),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
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
          Performance Over Time
        </h3>
        <div className="text-sm text-gray-900">
          {dailyStats.length} days
        </div>
      </div>

      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Mini Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {dailyStats.reduce((sum, day) => sum + day.clicks, 0)}
          </div>
          <div className="text-sm text-blue-800">Total Clicks</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {dailyStats.reduce((sum, day) => sum + day.sales, 0)}
          </div>
          <div className="text-sm text-green-800">Total Sales</div>
        </div>
      </div>
    </motion.div>
  );
}