"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DashboardHeader from "./components/DashboardHeader";
import MetricsGrid from "./components/MetricsGrid";
import QuizTypeChart from "./components/QuizTypeChart";
import ArchetypeChart from "./components/ArchetypeChart";
import PerformanceMetrics from "./components/PerformanceMetrics";
import AnswersTable from "./components/AnswersTable";
import SegmentCards from "./components/SegmentCards";
import FiltersBar from "./components/FiltersBar";
import AffiliateOverview from "./components/AffiliateOverview";
import { AnalyticsData, QuizType, ArchetypeData } from "./types";

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedQuizType, setSelectedQuizType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30d");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const quizTypes: QuizType[] = [
    { id: "financial-profile", name: "Financial Profile", icon: "💰" },
    { id: "health-finance", name: "Health Finance", icon: "🩺" },
    { id: "marriage-finance", name: "Marriage Finance", icon: "💕" },
    { id: "career-finance", name: "Career Finance", icon: "💼" },
    { id: "retirement-finance", name: "Retirement Finance", icon: "🏖️" },
  ];

  const tabs = [
    { id: "overview", name: "Overview", icon: "📊" },
    { id: "answers", name: "Answers", icon: "📋" },
    { id: "segments", name: "Segments", icon: "🧩" },
    { id: "affiliates", name: "Affiliates", icon: "💼" },
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [selectedQuizType, dateRange, user]);

  const checkAuth = async () => {
    const token = localStorage.getItem("analytics_token");
    if (!token) {
      router.push("/analytics/auth");
      return;
    }

    try {
      const response = await fetch("/api/analytics/auth", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem("analytics_token");
        router.push("/analytics/auth");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("analytics_token");
      router.push("/analytics/auth");
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        quizType: selectedQuizType,
        dateRange: dateRange,
      });

      const response = await fetch(`/api/analytics?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const data = await response.json();
      setAnalyticsData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizTypeFilter = (quizType: string) => {
    setSelectedQuizType(quizType);
    if (quizType !== "all") {
      setActiveTab("answers");
    }
  };

  const handleArchetypeFilter = (archetype: string) => {
    setActiveTab("segments");
    // Additional filtering logic for archetype
  };

  const handleLogout = () => {
    localStorage.removeItem("analytics_token");
    router.push("/analytics/auth");
  };

  const handleExport = () => {
    // Export functionality will be handled by the header component
    console.log("Export triggered");
  };

  const handleSelectLeads = () => {
    setActiveTab("answers");
    // Additional logic for lead selection
  };

  if (loading && !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchAnalyticsData}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        onExport={handleExport}
        onSelectLeads={handleSelectLeads}
        onLogout={handleLogout}
      />
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <FiltersBar
            selectedQuizType={selectedQuizType}
            dateRange={dateRange}
            onQuizTypeChange={setSelectedQuizType}
            onDateRangeChange={setDateRange}
            quizTypes={quizTypes}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && analyticsData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MetricsGrid data={analyticsData} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <QuizTypeChart
                data={analyticsData.quizTypeDistribution}
                onQuizTypeClick={handleQuizTypeFilter}
              />
              <ArchetypeChart
                data={analyticsData.archetypeDistribution}
                onArchetypeClick={handleArchetypeFilter}
              />
            </div>
            
            <PerformanceMetrics data={analyticsData} />
          </motion.div>
        )}

        {activeTab === "answers" && analyticsData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AnswersTable
              data={analyticsData.quizSessions}
              quizType={selectedQuizType}
              loading={loading}
              onRefresh={fetchAnalyticsData}
            />
          </motion.div>
        )}

        {activeTab === "segments" && analyticsData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SegmentCards
              data={analyticsData.archetypeSegments}
              onSegmentClick={handleArchetypeFilter}
            />
          </motion.div>
        )}

        {activeTab === "affiliates" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AffiliateOverview />
          </motion.div>
        )}
      </div>
    </div>
  );
}
