"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

interface MonthlyEarnings {
  month: string;
  earnings: number;
}

interface EarningsTrendChartProps {
  monthlyEarnings: MonthlyEarnings[];
  loading?: boolean;
}

export default function EarningsTrendChart({ monthlyEarnings, loading = false }: EarningsTrendChartProps) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!monthlyEarnings || monthlyEarnings.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="text-sm text-gray-500">No earnings data available</div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: monthlyEarnings.map(item => item.month),
    datasets: [
      {
        data: monthlyEarnings.map(item => item.earnings),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `$${context.parsed.y.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
        beginAtZero: true,
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  // Calculate trend
  const firstValue = monthlyEarnings[0]?.earnings || 0;
  const lastValue = monthlyEarnings[monthlyEarnings.length - 1]?.earnings || 0;
  const trend = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  const trendDirection = trend >= 0 ? 'up' : 'down';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">📈</span>
          <h3 className="text-sm font-semibold text-gray-700">Earnings Trend</h3>
        </div>
        <div className={`text-xs font-medium px-2 py-1 rounded-full ${
          trendDirection === 'up' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {trendDirection === 'up' ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}%
        </div>
      </div>
      
      <div className="h-16 w-full">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>{monthlyEarnings[0]?.month}</span>
        <span>{monthlyEarnings[monthlyEarnings.length - 1]?.month}</span>
      </div>
    </div>
  );
}
