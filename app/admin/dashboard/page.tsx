"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth";
import CEOAnalytics from "../components/CEOAnalytics";
import CloserManagement from "../components/CloserManagement";
import CommissionPayoutManager from "../components/CommissionPayoutManager";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import LeadDetailView from '../../components/shared/LeadDetailView';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import QuizAnalytics from '../components/dashboard/QuizAnalytics';
import CRM from '../components/dashboard/CRM';
import { AdminStats, QuizAnalyticsFilters } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitiallyLoaded = useRef(false);
  const [showQuickLinks, setShowQuickLinks] = useState(false);
  const [showResetDropdown, setShowResetDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState<'quiz-analytics' | 'crm' | 'ceo-analytics' | 'closer-management' | 'settings'>('quiz-analytics');
  const currentSectionRef = useRef(activeSection);

  // Preload affiliate analytics data for instant section switching
  const [affiliateAnalyticsData, setAffiliateAnalyticsData] = useState<any>(null);

  // Quiz Analytics Filters
  const [quizAnalyticsFilters, setQuizAnalyticsFilters] = useState({
    quizType: 'all',
    duration: '7d',
    affiliateCode: 'all'
  });

  // Affiliates list for filter
  const [affiliates, setAffiliates] = useState<Array<{ id: string; name: string; referralCode: string }>>([]);

  // CRM Filters
  const [crmFilters, setCrmFilters] = useState({
    quizType: 'all',
    dateRange: 'all',
    affiliateCode: 'all'
  });


  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [qualificationThreshold, setQualificationThreshold] = useState(17);
  const [isUpdatingThreshold, setIsUpdatingThreshold] = useState(false);
  const [commissionHoldDays, setCommissionHoldDays] = useState(30);
  const [minimumPayout, setMinimumPayout] = useState(50);
  const [payoutSchedule, setPayoutSchedule] = useState("monthly-1st");
  const [newDealAmountPotential, setNewDealAmountPotential] = useState(5000);
  const [terminalOutcomes, setTerminalOutcomes] = useState<string[]>(['not_interested', 'converted']);
  const [isUpdatingHoldDays, setIsUpdatingHoldDays] = useState(false);
  const [isUpdatingPayoutSettings, setIsUpdatingPayoutSettings] = useState(false);
  const [isUpdatingCrmSettings, setIsUpdatingCrmSettings] = useState(false);
  const [isUpdatingTerminalOutcomes, setIsUpdatingTerminalOutcomes] = useState(false);
  const [commissionReleaseStatus, setCommissionReleaseStatus] = useState<any>(null);
  const [isProcessingReleases, setIsProcessingReleases] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);

  // Helper functions for appointments
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'no_show': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutcomeColor = (outcome: string | null) => {
    switch (outcome) {
      case 'converted': return 'bg-green-100 text-green-800';
      case 'not_interested': return 'bg-red-100 text-red-800';
      case 'needs_follow_up': return 'bg-yellow-100 text-yellow-800';
      case 'callback_requested': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openLeadModal = (lead: any) => {
    setSelectedLead(lead);
    setShowLeadModal(true);
  };

  const closeLeadModal = () => {
    setSelectedLead(null);
    setShowLeadModal(false);
  };

  // Format duration from milliseconds to human readable format
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    if (ms < 3600000) return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
    return `${Math.round(ms / 3600000)}h ${Math.round((ms % 3600000) / 60000)}m`;
  };

  // Format large numbers with 'k' suffix for thousands
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toFixed(2)}`;
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (data.success && data.settings) {
        setQualificationThreshold(data.settings.qualificationThreshold || 17);
        setCommissionHoldDays(data.settings.commissionHoldDays || 30);
        setMinimumPayout(data.settings.minimumPayout || 50);
        setPayoutSchedule(data.settings.payoutSchedule || "monthly-1st");
        setNewDealAmountPotential(data.settings.newDealAmountPotential || 5000);
        setTerminalOutcomes(data.settings.terminalOutcomes || ['not_interested', 'converted']);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  // Update qualification threshold
  const updateQualificationThreshold = async (newThreshold: number) => {
    setIsUpdatingThreshold(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qualificationThreshold: newThreshold
        }),
      });

      const data = await response.json();
      if (data.success) {
        setQualificationThreshold(newThreshold);
        alert('✅ Qualification threshold updated successfully!');
        // Refresh settings to ensure consistency
        await fetchSettings();
      } else {
        alert('❌ Failed to update threshold: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating threshold:', error);
      alert('❌ Failed to update threshold. Please try again.');
    } finally {
      setIsUpdatingThreshold(false);
    }
  };

  // Update commission hold days
  const updateCommissionHoldDays = async (newHoldDays: number) => {
    setIsUpdatingHoldDays(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commissionHoldDays: newHoldDays
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCommissionHoldDays(newHoldDays);
        alert('✅ Commission hold period updated successfully!');
        // Refresh settings and commission release status
        await Promise.all([fetchSettings(), fetchCommissionReleaseStatus()]);
      } else {
        alert('❌ Failed to update hold period: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating hold period:', error);
      alert('❌ Failed to update hold period. Please try again.');
    } finally {
      setIsUpdatingHoldDays(false);
    }
  };

  const updatePayoutSettings = async () => {
    setIsUpdatingPayoutSettings(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          minimumPayout: minimumPayout,
          payoutSchedule: payoutSchedule
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Payout settings updated successfully!');
        await fetchSettings(); // Refresh settings
      } else {
        alert('❌ Failed to update payout settings: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating payout settings:', error);
      alert('❌ Failed to update payout settings. Please try again.');
    } finally {
      setIsUpdatingPayoutSettings(false);
    }
  };

  // Fetch commission release status
  const fetchCommissionReleaseStatus = async () => {
    try {
      const response = await fetch('/api/admin/process-commission-releases');
      const data = await response.json();
      if (data.success) {
        setCommissionReleaseStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching commission release status:', error);
    }
  };

  // Process commission releases
  const processCommissionReleases = async () => {
    setIsProcessingReleases(true);
    try {
      const response = await fetch('/api/admin/process-commission-releases', {
        method: 'POST',
      });

      const data = await response.json();
      if (data.success) {
        alert(`Successfully released ${data.releasedCount} commissions worth $${data.releasedAmount.toLocaleString()}`);
        fetchCommissionReleaseStatus(); // Refresh status
      } else {
        alert('Failed to process releases: ' + data.error);
      }
    } catch (error) {
      console.error('Error processing releases:', error);
      alert('Failed to process releases. Please try again.');
    } finally {
      setIsProcessingReleases(false);
    }
  };

  const fetchStats = useCallback(async (isTimeframeChange = false) => {
    // Only show loading state on initial load, not on window switches or timeframe changes
    if (!isTimeframeChange && !hasInitiallyLoaded.current) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Build query parameters for filters - apply appropriate filters based on active section
      const params = new URLSearchParams();
      if (activeSection === 'quiz-analytics') {
        if (quizAnalyticsFilters.quizType !== 'all') {
          params.append('quizType', quizAnalyticsFilters.quizType);
        }
        if (quizAnalyticsFilters.duration !== 'all') {
          params.append('duration', quizAnalyticsFilters.duration);
        }
        if (quizAnalyticsFilters.affiliateCode !== 'all') {
          params.append('affiliateCode', quizAnalyticsFilters.affiliateCode);
        }
      } else if (activeSection === 'crm') {
        if (crmFilters.quizType !== 'all') {
          params.append('quizType', crmFilters.quizType);
        }
        if (crmFilters.dateRange !== 'all') {
          params.append('duration', crmFilters.dateRange);
        }
        if (crmFilters.affiliateCode !== 'all') {
          params.append('affiliateCode', crmFilters.affiliateCode);
        }
      }

      const queryString = params.toString();
      const url = queryString ? `/api/admin/basic-stats?${queryString}` : '/api/admin/basic-stats';

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
      hasInitiallyLoaded.current = true;
    } catch {
      setError("Failed to load admin stats");
    } finally {
      // Only hide loading state if we were actually showing it
      if (!isTimeframeChange && !hasInitiallyLoaded.current) {
        setIsLoading(false);
      }
    }
  }, [quizAnalyticsFilters, crmFilters, activeSection]);

  // Load settings on component mount and when settings section is active
  useEffect(() => {
    fetchSettings();
    if (activeSection === 'settings') {
      fetchCommissionReleaseStatus();
    }
  }, [activeSection]);



  useEffect(() => {
    // Only fetch on initial load, not when switching sections
    if (!hasInitiallyLoaded.current) {
      fetchStats(true);
      fetchSettings();
      fetchCommissionReleaseStatus();
      fetchAffiliates(); // Fetch affiliates for filter dropdown
      fetchAffiliateAnalytics(); // Preload affiliate analytics for instant switching
    }
  }, [fetchStats]);

  // Fetch affiliates for filter dropdown
  const fetchAffiliates = async () => {
    try {
      const response = await fetch('/api/admin/affiliates?status=approved');
      const data = await response.json();
      if (data.success) {
        setAffiliates(data.affiliates.map((aff: any) => ({
          id: aff.id,
          name: aff.name,
          referralCode: aff.referralCode
        })));
      }
    } catch (error) {
      console.error('Error fetching affiliates:', error);
    }
  };

  // Preload affiliate analytics data for instant section switching
  const fetchAffiliateAnalytics = async () => {
    try {
      const params = new URLSearchParams({ dateRange: 'all' });
      const response = await fetch(`/api/admin/affiliate-performance?${params}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAffiliateAnalyticsData(result.data);
        }
      }
    } catch (error) {
      console.error('Error preloading affiliate analytics:', error);
    }
  };

  // Trigger data fetch when filters change (only when on the respective section)
  useEffect(() => {
    // Fetch data when:
    // 1. We're on quiz-analytics or crm section, AND
    // 2. Either section changed OR we've already loaded initial data (so filter changes trigger refetch)
    if (activeSection === 'quiz-analytics' || activeSection === 'crm') {
      const sectionChanged = currentSectionRef.current !== activeSection;
      const shouldRefetch = sectionChanged || hasInitiallyLoaded.current;

      if (shouldRefetch) {
        currentSectionRef.current = activeSection;
        // Don't show loading spinner when switching filters - just update data silently
        fetchStats(true);
      }
    }
  }, [quizAnalyticsFilters, crmFilters, activeSection, fetchStats]);


  // Handle page visibility and focus changes to prevent unnecessary re-fetching
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Don't refetch when switching between windows - only on initial load
      if (!document.hidden && !hasInitiallyLoaded.current) {
        fetchStats(true);
      }
    };

    const handleWindowFocus = () => {
      // Don't refetch when window regains focus - this prevents the loading flash
      // The data is already there, no need to reload
    };

    const handleWindowBlur = () => {
      // Don't do anything when window loses focus
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [stats, fetchStats]);


  const exportLeads = () => {
    if (!stats) return;

    const csvContent = [
      ["Session ID", "Name", "Email", "Date", "Stage", "Completed At", "Source"],
      ...stats.allLeads.map(lead => {
        const nameAnswer = lead.answers.find(a =>
          a.question?.prompt?.toLowerCase().includes('name')
        );
        const emailAnswer = lead.answers.find(a =>
          a.question?.prompt?.toLowerCase().includes('email')
        );

        // Determine source based on affiliate code
        const source = (lead as any).affiliateCode ? `Affiliate (${(lead as any).affiliateCode})` : "Website";

        return [
          lead.id,
          nameAnswer?.value || "N/A",
          emailAnswer?.value || "N/A",
          new Date(lead.createdAt).toLocaleDateString(),
          lead.status,
          lead.completedAt ? new Date(lead.completedAt).toLocaleString() : "N/A",
          source
        ];
      })
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brightnest-leads.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    logout();
  };

  const resetData = async (resetType: string) => {
    const messages = {
      quiz: "Are you sure you want to delete ALL quiz data (sessions, answers, results)? This action cannot be undone.",
      affiliate: "Are you sure you want to delete ALL affiliate data (clicks, conversions, payouts)? This action cannot be undone.",
      closer: "Are you sure you want to delete ALL closer data (appointments, performance)? This action cannot be undone.",
      all: "Are you sure you want to delete ALL data from the entire system? This will reset everything including quiz, affiliate, and closer data. This action cannot be undone."
    };

    if (!confirm(messages[resetType as keyof typeof messages])) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/basic-stats?type=${resetType}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        alert(`${data.message}`);
        fetchStats(); // Refresh the dashboard
      } else {
        alert("Failed to reset data. Please try again.");
      }
    } catch (error) {
      console.error("Error resetting data:", error);
      alert("Failed to reset data. Please try again.");
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // Chart data for retention rates (showing downward trend)
  const retentionChartData = stats && stats.questionAnalytics.length > 0 ? {
    labels: stats.questionAnalytics.map(q => `Q${q.questionNumber}`),
    datasets: [
      {
        label: 'Retention Rate (%)',
        data: stats.questionAnalytics.map((q, index) => {
          // Calculate actual retention rate, ensuring it doesn't exceed 100%
          const actualRate = Math.min(q.retentionRate, 100);

          // Ensure retention rate doesn't increase from previous question
          // (users can't reach Q2 without reaching Q1, etc.)
          if (index === 0) {
            // First question: show actual rate (might be less than 100% if some sessions never answered)
            return Math.min(actualRate, 100);
          }

          // For subsequent questions, ensure rate doesn't exceed previous question's rate
          const previousRate = Math.min(stats.questionAnalytics[index - 1].retentionRate, 100);
          return Math.min(actualRate, previousRate);
        }),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0, // No curvature - straight segmented lines for accurate representation
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  } : null;

  // Chart data for activity
  const getActivityChartData = () => {
    if (!stats) return null;

    const formatLabel = (dateStr: string) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      // For 24h view, show hourly labels (e.g., "2 PM", "3 PM")
      if (quizAnalyticsFilters.duration === '24h') {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          hour12: true
        });
      }

      // For other views, show dates (e.g., "Oct 27")
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return {
      labels: stats.dailyActivity.map(day => formatLabel(day.createdAt)),
      datasets: [
        {
          label: 'Quiz Started',
          data: stats.dailyActivity.map(day => day._count.id),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0, // No curvature - straight segmented lines
        },
      ],
    };
  };

  const dailyActivityData = getActivityChartData();

  // Chart data for clicks activity
  const getClicksChartData = () => {
    if (!stats) return null;

    const formatLabel = (dateStr: string) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      // For 24h view, show hourly labels (e.g., "2 PM", "3 PM")
      if (quizAnalyticsFilters.duration === '24h') {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          hour12: true
        });
      }

      // For other views, show dates (e.g., "Oct 27")
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return {
      labels: stats.clicksActivity.map(day => formatLabel(day.createdAt)),
      datasets: [
        {
          label: 'Clicks',
          data: stats.clicksActivity.map(day => day._count.id),
          borderColor: 'rgba(16, 185, 129, 1)', // Green color
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0,
        },
      ],
    };
  };

  const clicksActivityData = getClicksChartData();



  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      showQuickLinks={showQuickLinks}
      onToggleQuickLinks={() => setShowQuickLinks(!showQuickLinks)}
      handleLogout={handleLogout}
      resetData={resetData}
      showResetDropdown={showResetDropdown}
      setShowResetDropdown={setShowResetDropdown}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Quiz Analytics Section */}

        {activeSection === 'quiz-analytics' && (
          <QuizAnalytics
            filters={quizAnalyticsFilters}
            onFilterChange={setQuizAnalyticsFilters}
            stats={stats}
            loading={isLoading}
            error={error}
            onRetry={fetchStats}
            affiliates={affiliates}
            retentionChartData={retentionChartData}
            dailyActivityData={dailyActivityData}
            clicksActivityData={clicksActivityData}
            hasInitiallyLoaded={hasInitiallyLoaded.current}
          />
        )}

        {/* CRM Section - HubSpot Style */}
        {activeSection === 'crm' && (
          <CRM
            stats={stats}
            affiliates={affiliates}
            newDealAmountPotential={newDealAmountPotential}
            terminalOutcomes={terminalOutcomes}
            onRefresh={() => fetchStats(true)}
            crmFilters={crmFilters}
            setCrmFilters={setCrmFilters}
          />
        )}

        {/* CEO Analytics Section */}
        {activeSection === 'ceo-analytics' && (
          <div className="mb-8">
            <CEOAnalytics initialData={affiliateAnalyticsData} />
          </div>
        )}

        {/* Closer Management Section */}
        {activeSection === 'closer-management' && (
          <div className="mb-8">
            <CloserManagement />
          </div>
        )}

        {/* Settings Section */}
        {activeSection === 'settings' && (
          <div className="mb-8">
            {/* Settings Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">Manage your system configuration and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Settings Navigation Sidebar */}
              <div className="lg:col-span-1">
                <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Categories</h3>
                  <ul className="space-y-1">
                    <li>
                      <a href="#quiz-settings" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Quiz Settings
                      </a>
                    </li>
                    <li>
                      <a href="#affiliate-settings" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Affiliate & Payouts
                      </a>
                    </li>
                    <li>
                      <a href="#crm-settings" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        CRM Settings
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>

              {/* Settings Content */}
              <div className="lg:col-span-3 space-y-8">

                {/* QUIZ SETTINGS SECTION */}
                <div id="quiz-settings" className="scroll-mt-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                      <h2 className="text-xl font-bold text-white flex items-center">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Quiz Settings
                      </h2>
                      <p className="text-indigo-100 text-sm mt-1">Configure quiz behavior and qualification rules</p>
                    </div>

                    <div className="p-6">
                      {/* Qualification Threshold */}
                      <div className="mb-6 pb-6 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-gray-900 mb-2">Qualification Threshold</h3>
                            <p className="text-sm text-gray-600">
                              Set the minimum points required for users to qualify for a consultation call.
                              Users below this threshold will be directed to the checkout page instead.
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <label htmlFor="threshold" className="text-sm font-medium text-gray-700">
                                Minimum Points:
                              </label>
                              <input
                                type="number"
                                id="threshold"
                                min="1"
                                max="20"
                                value={qualificationThreshold}
                                onChange={(e) => setQualificationThreshold(parseInt(e.target.value))}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                              <span className="text-sm text-gray-500">out of 20</span>
                            </div>
                            <button
                              onClick={() => updateQualificationThreshold(qualificationThreshold)}
                              disabled={isUpdatingThreshold}
                              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                              {isUpdatingThreshold ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AFFILIATE & PAYOUTS SECTION */}
                <div id="affiliate-settings" className="scroll-mt-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                      <h2 className="text-xl font-bold text-white flex items-center">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Affiliate & Payouts
                      </h2>
                      <p className="text-green-100 text-sm mt-1">Manage commissions, payouts, and affiliate settings</p>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Commission Hold Period */}
                      <div className="pb-6 border-b border-gray-200">
                        <div className="mb-4">
                          <h3 className="text-base font-semibold text-gray-900 mb-2">Commission Hold Period</h3>
                          <p className="text-sm text-gray-600">
                            Set how many days commissions should be held before becoming available for payout.
                            This helps prevent chargebacks and ensures payment stability.
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <label htmlFor="holdDays" className="text-sm font-medium text-gray-700">
                                Hold Period:
                              </label>
                              <input
                                type="number"
                                id="holdDays"
                                min="0"
                                max="365"
                                value={commissionHoldDays}
                                onChange={(e) => setCommissionHoldDays(parseInt(e.target.value))}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              />
                              <span className="text-sm text-gray-500">days</span>
                            </div>
                            <button
                              onClick={() => updateCommissionHoldDays(commissionHoldDays)}
                              disabled={isUpdatingHoldDays}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                              {isUpdatingHoldDays ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Payout Settings */}
                      <div className="pb-6 border-b border-gray-200">
                        <div className="mb-4">
                          <h3 className="text-base font-semibold text-gray-900 mb-2">Payout Settings</h3>
                          <p className="text-sm text-gray-600">
                            Configure minimum payout amounts and payout schedules for all affiliates.
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <label htmlFor="minimumPayout" className="text-sm font-medium text-gray-700">
                              Minimum Payout:
                            </label>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">$</span>
                              <input
                                type="number"
                                id="minimumPayout"
                                min="0"
                                step="0.01"
                                value={minimumPayout}
                                onChange={(e) => setMinimumPayout(parseFloat(e.target.value))}
                                className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <label htmlFor="payoutSchedule" className="text-sm font-medium text-gray-700">
                              Payout Schedule:
                            </label>
                            <select
                              id="payoutSchedule"
                              value={payoutSchedule}
                              onChange={(e) => setPayoutSchedule(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="weekly">Weekly (Every Monday)</option>
                              <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                              <option value="monthly-1st">Monthly (1st of each month)</option>
                              <option value="monthly-15th">Monthly (15th of each month)</option>
                              <option value="monthly-last">Monthly (Last day of each month)</option>
                              <option value="quarterly">Quarterly (1st of Jan, Apr, Jul, Oct)</option>
                            </select>
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              onClick={updatePayoutSettings}
                              disabled={isUpdatingPayoutSettings}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                              {isUpdatingPayoutSettings ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Commission Release Management */}
                      {commissionReleaseStatus && (
                        <div>
                          <div className="mb-4">
                            <h3 className="text-base font-semibold text-gray-900 mb-2">Commission Release Management</h3>
                            <p className="text-sm text-gray-600">
                              Commissions are automatically released after the hold period expires. Manual release is available for immediate processing.
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                              <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
                                <div className="text-xs font-medium text-blue-700 uppercase tracking-wide">Ready for Release</div>
                                <div className="text-2xl font-bold text-blue-900 mt-1">{commissionReleaseStatus.readyForRelease}</div>
                                <div className="text-xs text-blue-600">commissions</div>
                              </div>
                              <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
                                <div className="text-xs font-medium text-orange-700 uppercase tracking-wide">Currently Held</div>
                                <div className="text-2xl font-bold text-orange-900 mt-1">{commissionReleaseStatus.totalHeld}</div>
                                <div className="text-xs text-orange-600">commissions</div>
                              </div>
                              <div className="bg-white border-2 border-green-200 rounded-lg p-3">
                                <div className="text-xs font-medium text-green-700 uppercase tracking-wide">Available</div>
                                <div className="text-2xl font-bold text-green-900 mt-1">{commissionReleaseStatus.totalAvailable}</div>
                                <div className="text-xs text-green-600">commissions</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3">
                              <button
                                onClick={fetchCommissionReleaseStatus}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                              >
                                Refresh Status
                              </button>
                              <button
                                onClick={processCommissionReleases}
                                disabled={isProcessingReleases || commissionReleaseStatus.readyForRelease === 0}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                              >
                                {isProcessingReleases ? 'Processing...' : `Release ${commissionReleaseStatus.readyForRelease} Commissions`}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CRM SETTINGS SECTION */}
                <div id="crm-settings" className="scroll-mt-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-4">
                      <h2 className="text-xl font-bold text-white flex items-center">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        CRM Settings
                      </h2>
                      <p className="text-blue-100 text-sm mt-1">Configure deal pipeline and outcome tracking</p>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Deal Value Configuration */}
                      <div className="pb-6 border-b border-gray-200">
                        <div className="mb-4">
                          <h3 className="text-base font-semibold text-gray-900 mb-2">Deal Value Configuration</h3>
                          <p className="text-sm text-gray-600">
                            Configure the potential value used for calculating the NEW DEAL AMOUNT metric.
                            This is multiplied by the number of booked calls to estimate pipeline value.
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <label htmlFor="newDealPotential" className="text-sm font-medium text-gray-700">
                                Potential Value per Call:
                              </label>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">$</span>
                                <input
                                  type="number"
                                  id="newDealPotential"
                                  min="0"
                                  max="100000"
                                  value={newDealAmountPotential}
                                  onChange={(e) => setNewDealAmountPotential(parseFloat(e.target.value))}
                                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                            <button
                              onClick={async () => {
                                setIsUpdatingCrmSettings(true);
                                try {
                                  const response = await fetch('/api/admin/settings', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ newDealAmountPotential })
                                  });
                                  const data = await response.json();
                                  if (data.success) {
                                    alert('✅ Deal value configuration updated successfully!');
                                    await fetchSettings();
                                  } else {
                                    alert('❌ Failed to update deal value: ' + (data.error || 'Unknown error'));
                                  }
                                } catch (error) {
                                  console.error('Error updating CRM settings:', error);
                                  alert('❌ Failed to update deal value. Please try again.');
                                } finally {
                                  setIsUpdatingCrmSettings(false);
                                }
                              }}
                              disabled={isUpdatingCrmSettings}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                              {isUpdatingCrmSettings ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Terminal Outcomes Configuration */}
                      <div>
                        <div className="mb-4">
                          <h3 className="text-base font-semibold text-gray-900 mb-2">Terminal Outcomes Configuration</h3>
                          <p className="text-sm text-gray-600">
                            Configure which deal outcomes are considered "terminal" (closed deals that should NOT be counted in OPEN DEAL AMOUNT).
                            All other deals will be counted as open deals.
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <label className="text-sm font-medium text-gray-700 mb-3 block">
                            Select Terminal Outcomes:
                          </label>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            {['converted', 'not_interested', 'needs_follow_up', 'wrong_number', 'no_answer', 'callback_requested', 'rescheduled'].map((outcome) => (
                              <label key={outcome} className="flex items-center space-x-2 bg-white px-3 py-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                  type="checkbox"
                                  checked={terminalOutcomes.includes(outcome)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setTerminalOutcomes([...terminalOutcomes, outcome]);
                                    } else {
                                      setTerminalOutcomes(terminalOutcomes.filter(o => o !== outcome));
                                    }
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 capitalize">{outcome.replace('_', ' ')}</span>
                              </label>
                            ))}
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={async () => {
                                setIsUpdatingTerminalOutcomes(true);
                                try {
                                  const response = await fetch('/api/admin/settings', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ terminalOutcomes })
                                  });
                                  const data = await response.json();
                                  if (data.success) {
                                    alert('✅ Terminal outcomes updated successfully!');
                                    await fetchSettings();
                                  } else {
                                    alert('❌ Failed to update terminal outcomes: ' + (data.error || 'Unknown error'));
                                  }
                                } catch (error) {
                                  console.error('Error updating terminal outcomes:', error);
                                  alert('❌ Failed to update terminal outcomes. Please try again.');
                                } finally {
                                  setIsUpdatingTerminalOutcomes(false);
                                }
                              }}
                              disabled={isUpdatingTerminalOutcomes}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                              {isUpdatingTerminalOutcomes ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}


        {/* Simple Working Modal */}
        {showLeadModal && selectedLead && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={closeLeadModal}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '12px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  Lead Profile: {selectedLead.customerName}
                </h2>
                <button
                  onClick={closeLeadModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Lead Details */}
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <strong style={{ color: '#374151' }}>Email:</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>{selectedLead.customerEmail}</p>
                </div>

                <div>
                  <strong style={{ color: '#374151' }}>Phone:</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>{selectedLead.customerPhone || 'Not provided'}</p>
                </div>

                <div>
                  <strong style={{ color: '#374151' }}>Status:</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>{selectedLead.outcome || 'Pending'}</p>
                </div>

                {selectedLead.saleValue && (
                  <div>
                    <strong style={{ color: '#374151' }}>Sale Value:</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#059669', fontWeight: 'bold' }}>
                      ${Number(selectedLead.saleValue || 0).toFixed(2)}
                    </p>
                  </div>
                )}

                {selectedLead.notes && (
                  <div>
                    <strong style={{ color: '#374151' }}>Notes:</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>{selectedLead.notes}</p>
                  </div>
                )}

                <div>
                  <strong style={{ color: '#374151' }}>Appointment Date:</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>{formatDate(selectedLead.appointmentDate)}</p>
                </div>

                {selectedLead.closerName && (
                  <div>
                    <strong style={{ color: '#374151' }}>Assigned Closer:</strong>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>{selectedLead.closerName}</p>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div style={{ marginTop: '24px', textAlign: 'right' }}>
                <button
                  onClick={closeLeadModal}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
// Trigger deployment
