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

interface AdminStats {
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  avgDurationMs: number;
  allLeads: Array<{
    id: string;
    status: string;
    completedAt: string | null;
    createdAt: string;
    result: {
      archetype: string;
    } | null;
    answers: Array<{
      questionId: string;
      value: string;
      question: {
        prompt: string;
        type: string;
      };
    }>;
    source?: string;
    saleValue?: string | null;
    appointment?: {
      outcome?: string | null;
    } | null;
  }>;
  quizTypes?: Array<{
    name: string;
    displayName: string;
    description: string;
    questionCount: number;
  }>;
  archetypeStats: Array<{
    archetype: string;
    _count: { archetype: number };
  }>;
  questionAnalytics: Array<{
    questionNumber: number;
    questionText: string;
    answeredCount: number;
    retentionRate: number;
  }>;
  dailyActivity: Array<{
    createdAt: string;
    _count: { id: number };
  }>;
  clicksActivity: Array<{
    createdAt: string;
    _count: { id: number };
  }>;
  clicks: number;
  partialSubmissions: number;
  leadsCollected: number;
  averageTimeMs: number;
  topDropOffQuestions: Array<{
    questionNumber: number;
    questionText: string;
    dropFromPrevious: number;
    retentionRate: number;
    previousRetentionRate: number;
  }>;
}

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
  
  // CRM State Management
  const [crmSearch, setCrmSearch] = useState('');
  const [crmSortField, setCrmSortField] = useState('date');
  const [crmSortDirection, setCrmSortDirection] = useState<'asc' | 'desc'>('desc');
  const [crmCurrentPage, setCrmCurrentPage] = useState(1);
  const [crmItemsPerPage, setCrmItemsPerPage] = useState(25);
  const [crmSelectedLeads, setCrmSelectedLeads] = useState<Set<string>>(new Set());
  const [crmShowMetrics, setCrmShowMetrics] = useState(true);
  const [crmSelectedLead, setCrmSelectedLead] = useState<any>(null);
  const [crmShowLeadModal, setCrmShowLeadModal] = useState(false);
  const [crmShowColumnModal, setCrmShowColumnModal] = useState(false);
  const [crmLeadModalTab, setCrmLeadModalTab] = useState<'activity' | 'notes' | 'tasks'>('activity');
  const [crmActivities, setCrmActivities] = useState<any[] | null>(null);
  const [adminTasks, setAdminTasks] = useState<any[]>([]);
  const [isLoadingAdminTasks, setIsLoadingAdminTasks] = useState(false);
  const [adminShowTaskForm, setAdminShowTaskForm] = useState(false);
  const [adminEditingTask, setAdminEditingTask] = useState<any>(null);
  const [adminTaskForm, setAdminTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });
  const [adminNotes, setAdminNotes] = useState<any[]>([]);
  const [showAdminNoteForm, setShowAdminNoteForm] = useState(false);
  const [adminNoteContent, setAdminNoteContent] = useState('');
  const [crmVisibleColumns, setCrmVisibleColumns] = useState({
    checkbox: true,
    name: true,
    stage: true,
    date: true,
    owner: true,
    amount: true,
    source: true,
    actions: true
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
      console.log('Settings API response:', data); // Debug log
      if (data.success && data.settings) {
        setQualificationThreshold(data.settings.qualificationThreshold || 17);
        setCommissionHoldDays(data.settings.commissionHoldDays || 30);
        setMinimumPayout(data.settings.minimumPayout || 50);
        setPayoutSchedule(data.settings.payoutSchedule || "monthly-1st");
        setNewDealAmountPotential(data.settings.newDealAmountPotential || 5000);
        setTerminalOutcomes(data.settings.terminalOutcomes || ['not_interested', 'converted']);
        console.log('Settings loaded:', data.settings); // Debug log
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
        alert('Qualification threshold updated successfully!');
      } else {
        alert('Failed to update threshold: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating threshold:', error);
      alert('Failed to update threshold. Please try again.');
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
        alert('Commission hold period updated successfully!');
        fetchCommissionReleaseStatus(); // Refresh status
      } else {
        alert('Failed to update hold period: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating hold period:', error);
      alert('Failed to update hold period. Please try again.');
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
        console.log('Payout settings updated successfully');
        await fetchSettings(); // Refresh settings
      } else {
        console.error('Failed to update payout settings:', data.error);
      }
    } catch (error) {
      console.error('Error updating payout settings:', error);
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

  useEffect(() => {
    // Check for leadEmail in URL and open lead modal
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const leadEmail = params.get('leadEmail');
      
      if (leadEmail && stats?.allLeads) {
        // Find the lead by email - search in answers for email or name match
        const lead = stats.allLeads.find((l: any) => {
          const email = l.answers?.find((a: any) => 
            a.value?.toLowerCase() === leadEmail.toLowerCase()
          );
          return email;
        });
        
        if (lead) {
          setCrmSelectedLead(lead);
          setCrmShowLeadModal(true);
          setActiveSection('crm'); // Switch to CRM section to show the lead
          
          // Clear the URL parameter
          params.delete('leadEmail');
          const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
          window.history.replaceState({}, '', newUrl);
        }
      }
    }
  }, [stats]);

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
    // Only fetch if we're switching to a section that needs data, or if filters changed
    const needsDataFetch = (activeSection === 'quiz-analytics' || activeSection === 'crm') && 
                          (currentSectionRef.current !== activeSection || hasInitiallyLoaded.current);
    
    if (needsDataFetch) {
      currentSectionRef.current = activeSection;
      // Don't show loading spinner when switching filters - just update data silently
      fetchStats(true);
    }
  }, [quizAnalyticsFilters, crmFilters, activeSection]);


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
  const retentionChartData = stats ? {
    labels: stats.questionAnalytics.map(q => `Q${q.questionNumber}`),
    datasets: [
      {
        label: 'Retention Rate (%)',
        data: stats.questionAnalytics.map((q, index) => {
          // Q1 should always be 100% (all users start the quiz)
          if (index === 0) return 100;
          // For other questions, cap at 100% and ensure it's not higher than previous
          const cappedRate = Math.min(q.retentionRate, 100);
          const previousRate = index > 0 ? Math.min(stats.questionAnalytics[index - 1].retentionRate, 100) : 100;
          return Math.min(cappedRate, previousRate); // Never exceed previous question's rate
        }),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.2, // Reduced tension to prevent overshoot
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

  // CRM Helper Functions
  const handleCrmSearch = (value: string) => {
    setCrmSearch(value);
    setCrmCurrentPage(1); // Reset to first page when searching
  };

  const handleCrmSort = (field: string) => {
    if (crmSortField === field) {
      setCrmSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setCrmSortField(field);
      setCrmSortDirection('asc');
    }
  };

  const handleCrmPageChange = (page: number) => {
    setCrmCurrentPage(page);
  };

  const handleCrmItemsPerPageChange = (itemsPerPage: number) => {
    setCrmItemsPerPage(itemsPerPage);
    setCrmCurrentPage(1); // Reset to first page
  };

  const handleCrmSelectAll = (checked: boolean) => {
    if (checked) {
      const allLeadIds = new Set(filteredCrmLeads.map(lead => lead.id));
      setCrmSelectedLeads(allLeadIds);
    } else {
      setCrmSelectedLeads(new Set());
    }
  };

  const handleCrmSelectLead = (leadId: string, checked: boolean) => {
    const newSelected = new Set(crmSelectedLeads);
    if (checked) {
      newSelected.add(leadId);
    } else {
      newSelected.delete(leadId);
    }
    setCrmSelectedLeads(newSelected);
  };

  const handleCrmViewDetails = (lead: any) => {
    setCrmSelectedLead(lead);
    setCrmShowLeadModal(true);
    setCrmLeadModalTab('activity');
    // Also load tasks, notes, and activities for this lead
    fetchAdminTasks(lead);
    fetchAdminNotes(lead);
    fetchCrmActivities(lead);
  };

  const fetchAdminNotes = async (lead: any) => {
    try {
      const leadEmail = lead.answers?.find((a: any) => a.value?.includes('@'))?.value;
      if (leadEmail) {
        const response = await fetch(`/api/notes?leadEmail=${encodeURIComponent(leadEmail)}`);
        if (response.ok) {
          const data = await response.json();
          setAdminNotes(data);
        }
      }
    } catch (error) {
      console.error('Error fetching admin notes:', error);
    }
  };

  const fetchCrmActivities = async (lead: any) => {
    setCrmActivities(null); // Reset to show loading state
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}/activities`);
      if (response.ok) {
        const data = await response.json();
        setCrmActivities(data.activities || []);
      } else {
        console.error('Failed to fetch activities');
        setCrmActivities([]);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setCrmActivities([]);
    }
  };

  const fetchAdminTasks = async (lead: any) => {
    setIsLoadingAdminTasks(true);
    try {
      const leadEmail = lead.answers?.find((a: any) => a.value?.includes('@'))?.value;
      if (leadEmail) {
        const response = await fetch(`/api/admin/tasks?leadEmail=${encodeURIComponent(leadEmail)}`);
        if (response.ok) {
          const data = await response.json();
          setAdminTasks(data.tasks || []);
        }
      }
    } catch (error) {
      console.error('Error fetching admin tasks:', error);
    } finally {
      setIsLoadingAdminTasks(false);
    }
  };

  const handleAdminCreateTask = async () => {
    if (!adminTaskForm.title || !crmSelectedLead) return;

    try {
      const leadEmail = crmSelectedLead.answers?.find((a: any) => a.value?.includes('@'))?.value;
      
      if (!leadEmail) {
        setError('No email found for this lead');
        return;
      }

      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadEmail: leadEmail,
          title: adminTaskForm.title,
          description: adminTaskForm.description,
          priority: adminTaskForm.priority,
          dueDate: adminTaskForm.dueDate || null,
        }),
      });

      if (response.ok) {
        setAdminTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
        setAdminShowTaskForm(false);
        fetchAdminTasks(crmSelectedLead);
      }
    } catch (error) {
      console.error('Error creating admin task:', error);
    }
  };

  const handleAdminUpdateTask = async (taskId: string, updates: any) => {
    if (!crmSelectedLead) return;

    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        fetchAdminTasks(crmSelectedLead);
      }
    } catch (error) {
      console.error('Error updating admin task:', error);
    }
  };

  const handleAdminDeleteTask = async (taskId: string) => {
    if (!crmSelectedLead || !confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchAdminTasks(crmSelectedLead);
      }
    } catch (error) {
      console.error('Error deleting admin task:', error);
    }
  };

  const openAdminEditTask = (task: any) => {
    setAdminEditingTask(task);
    setAdminTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
    setAdminShowTaskForm(true);
  };

  const handleAdminSaveEditedTask = async () => {
    if (!adminEditingTask || !adminTaskForm.title) return;

    await handleAdminUpdateTask(adminEditingTask.id, {
      title: adminTaskForm.title,
      description: adminTaskForm.description,
      priority: adminTaskForm.priority,
      dueDate: adminTaskForm.dueDate || null,
    });

    setAdminEditingTask(null);
    setAdminTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
    setAdminShowTaskForm(false);
  };

  const handleCrmToggleColumn = (column: string) => {
    setCrmVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column as keyof typeof prev]
    }));
  };

  const handleCrmExport = () => {
    // Create CSV content
    const csvContent = [
      ['Name', 'Email', 'Stage', 'Date', 'Deal Owner', 'Amount', 'Source'].join(','),
      ...filteredCrmLeads.map(lead => {
        const nameAnswer = lead.answers.find((a: any) => 
          a.question?.prompt?.toLowerCase().includes('name')
        );
        const emailAnswer = lead.answers.find((a: any) => 
          a.question?.prompt?.toLowerCase().includes('email')
        );
        return [
          nameAnswer?.value || 'N/A',
          emailAnswer?.value || 'N/A',
          lead.status,
          lead.completedAt ? new Date(lead.completedAt).toLocaleDateString() : 'N/A',
          'Stefan',
          lead.saleValue ? `$${Number(lead.saleValue).toFixed(2)}` : '--',
          lead.source || 'Direct'
        ].join(',');
      })
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Helper function to calculate revenue metrics
  const calculateRevenueMetrics = (leads: any[], terminalOutcomesList: string[], potentialValuePerCall: number) => {
    if (!leads || !Array.isArray(leads)) {
      return { totalRevenue: 0, openDealAmount: 0, newDealAmount: 0, closedDealAmount: 0 };
    }

    let openDealAmount = 0;
    let newDealAmount = 0;
    let closedDealAmount = 0;

    leads.forEach(lead => {
      // Check if this is a booked call (has appointment)
      const appointment = lead.appointment;
      const appointmentOutcome = appointment?.outcome;
      const hasSaleValue = lead.saleValue && parseFloat(lead.saleValue || '0') > 0;
      
      // NEW DEAL AMOUNT: Only count leads with "Booked" status 
      // This means they have an appointment but haven't had the call yet
      if (lead.status === 'Booked' && appointment && !appointmentOutcome) {
        // This is a NEW deal - freshly booked call with no outcome
        console.log('NEW DEAL: Lead has Booked status with no outcome, adding to newDealAmount');
        newDealAmount += potentialValuePerCall;
      }
      
      if (appointment) {
        // This is a booked call
        const isTerminal = appointmentOutcome && terminalOutcomesList.includes(appointmentOutcome);
        
        if (!isTerminal) {
          // It's still an open deal (could have outcome or not)
          if (hasSaleValue) {
            // Has actual sale value - use that for open deal
            const saleValue = parseFloat(lead.saleValue || '0');
            openDealAmount += saleValue;
          } else {
            // No sale value yet - use potential value for open deal
            openDealAmount += potentialValuePerCall;
          }
        } else {
          // It's a terminal outcome - this is a closed deal
          if (hasSaleValue) {
            const saleValue = parseFloat(lead.saleValue || '0');
            closedDealAmount += saleValue;
          }
        }
      }
    });

    // TOTAL DEAL AMOUNT = OPEN + CLOSED
    const totalRevenue = openDealAmount + closedDealAmount;

    return { totalRevenue, openDealAmount, newDealAmount, closedDealAmount };
  };
  
  const revenueMetrics = calculateRevenueMetrics(stats?.allLeads || [], terminalOutcomes, newDealAmountPotential);

  // Filter and sort CRM leads
  const filteredCrmLeads = stats?.allLeads ? stats.allLeads.filter(lead => {
    // Search filter only
    if (crmSearch) {
      const nameAnswer = lead.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('name')
      );
      const emailAnswer = lead.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('email')
      );
      const searchText = `${nameAnswer?.value || ''} ${emailAnswer?.value || ''}`.toLowerCase();
      if (!searchText.includes(crmSearch.toLowerCase())) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (crmSortField) {
      case 'name':
        const aNameAnswer = a.answers.find(ans => ans.question?.prompt?.toLowerCase().includes('name'));
        const bNameAnswer = b.answers.find(ans => ans.question?.prompt?.toLowerCase().includes('name'));
        aValue = aNameAnswer?.value || '';
        bValue = bNameAnswer?.value || '';
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'date':
        aValue = new Date(a.completedAt || a.createdAt).getTime();
        bValue = new Date(b.completedAt || b.createdAt).getTime();
        break;
      case 'amount':
        aValue = 100; // Fixed amount for now
        bValue = 100;
        break;
      case 'source':
        aValue = a.source || 'Direct';
        bValue = b.source || 'Direct';
        break;
      default:
        aValue = new Date(a.completedAt || a.createdAt).getTime();
        bValue = new Date(b.completedAt || b.createdAt).getTime();
    }

    if (crmSortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  }) : [];

  // Paginate CRM leads
  const paginatedCrmLeads = filteredCrmLeads.slice(
    (crmCurrentPage - 1) * crmItemsPerPage,
    crmCurrentPage * crmItemsPerPage
  );

  const totalCrmPages = Math.ceil(filteredCrmLeads.length / crmItemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Fixed */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} h-screen bg-slate-800 border-r border-slate-700 flex-shrink-0 flex flex-col transition-all duration-300 overflow-visible`}>
        <div className={`${sidebarCollapsed ? 'p-4' : 'p-6'} border-b border-slate-700 flex-shrink-0`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'justify-between'}`}>
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
              <div className={`w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 ${sidebarCollapsed ? 'rounded' : 'rounded-lg'} flex items-center justify-center shadow-md`}>
                <span className="text-white font-bold text-sm">B</span>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-lg font-bold text-white">BrightNest</h1>
                  <p className="text-xs text-slate-300">Admin Panel</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className={`flex-1 overflow-y-auto overflow-x-visible ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>

          <nav className="space-y-3">
            {!sidebarCollapsed && (
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Analytics
              </div>
            )}
            <button 
              onClick={() => setActiveSection('quiz-analytics')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} ${sidebarCollapsed ? 'px-2 py-2.5' : 'px-3 py-3 rounded-lg'} transition-colors group relative ${
                activeSection === 'quiz-analytics'
                  ? sidebarCollapsed
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-700 text-white border-l-4 border-indigo-500'
                  : sidebarCollapsed
                    ? 'text-slate-300 hover:bg-slate-700'
                    : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <svg className={`w-5 h-5 ${activeSection === 'quiz-analytics' ? 'text-white' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {!sidebarCollapsed && <span className="text-sm font-medium">Quiz Analytics</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999] transition-opacity shadow-lg" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                  Quiz Analytics
                </div>
              )}
            </button>
            <button
              onClick={() => setActiveSection('crm')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} ${sidebarCollapsed ? 'px-2 py-2.5' : 'px-3 py-3 rounded-lg'} transition-colors group relative ${
                activeSection === 'crm'
                  ? sidebarCollapsed
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-700 text-white border-l-4 border-indigo-500'
                  : sidebarCollapsed
                    ? 'text-slate-300 hover:bg-slate-700'
                    : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <svg className={`w-5 h-5 ${activeSection === 'crm' ? 'text-white' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {!sidebarCollapsed && <span className="text-sm font-medium">Lead Analytics</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999] transition-opacity shadow-lg" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                  Lead Analytics
                </div>
              )}
            </button>
            <button
              onClick={() => setActiveSection('ceo-analytics')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} ${sidebarCollapsed ? 'px-2 py-2.5' : 'px-3 py-3 rounded-lg'} transition-colors group relative ${
                activeSection === 'ceo-analytics'
                  ? sidebarCollapsed
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-700 text-white border-l-4 border-indigo-500'
                  : sidebarCollapsed
                    ? 'text-slate-300 hover:bg-slate-700'
                    : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <svg className={`w-5 h-5 ${activeSection === 'ceo-analytics' ? 'text-white' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {!sidebarCollapsed && <span className="text-sm font-medium">Affiliate Analytics</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999] transition-opacity shadow-lg" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                  Affiliate Analytics
                </div>
              )}
            </button>
          </nav>

          <div className="mt-8 pt-6 border-t border-slate-700">
            {!sidebarCollapsed && (
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Management
              </div>
            )}
            <button
              onClick={() => window.open('/admin/quiz-management', '_self')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} ${sidebarCollapsed ? 'px-2 py-2.5' : 'px-3 py-3 rounded-lg'} text-slate-300 hover:bg-slate-700 transition-colors group relative`}
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {!sidebarCollapsed && <span className="text-sm font-medium">Quiz Management</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999] transition-opacity shadow-lg" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                  Quiz Management
                </div>
              )}
            </button>
            <button
              onClick={() => setActiveSection('closer-management')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} ${sidebarCollapsed ? 'px-2 py-2.5' : 'px-3 py-3 rounded-lg'} transition-colors group relative ${
                activeSection === 'closer-management'
                  ? sidebarCollapsed
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-700 text-white border-l-4 border-indigo-500'
                  : sidebarCollapsed
                    ? 'text-slate-300 hover:bg-slate-700'
                    : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <svg className={`w-5 h-5 ${activeSection === 'closer-management' ? 'text-white' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {!sidebarCollapsed && <span className="text-sm font-medium">Closer Management</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999] transition-opacity shadow-lg" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                  Closer Management
                </div>
              )}
            </button>
            <button
              onClick={() => setActiveSection('settings')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} ${sidebarCollapsed ? 'px-2 py-2.5' : 'px-3 py-3 rounded-lg'} transition-colors group relative ${
                activeSection === 'settings'
                  ? sidebarCollapsed
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-700 text-white border-l-4 border-indigo-500'
                  : sidebarCollapsed
                    ? 'text-slate-300 hover:bg-slate-700'
                    : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <svg className={`w-5 h-5 ${activeSection === 'settings' ? 'text-white' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {!sidebarCollapsed && <span className="text-sm font-medium">Settings</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[9999] transition-opacity shadow-lg" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                  Settings
                </div>
              )}
            </button>
          </div>

          {!sidebarCollapsed && (
          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="px-3">
              <button
                onClick={() => setShowQuickLinks(!showQuickLinks)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Quick Links
                </div>
                <svg 
                  className={`w-4 h-4 text-slate-300 transition-transform ${showQuickLinks ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showQuickLinks && (
                <div className="mt-2 space-y-1">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-400 px-3 py-1">Login Pages</div>
                    <a
                      href="/affiliates/login"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Affiliate Login
                    </a>
                    <a
                      href="/closers/login"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Closer Login
                    </a>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-400 px-3 py-1">Signup Pages</div>
                    <a
                      href="/affiliates/signup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Affiliate Signup
                    </a>
                    <a
                      href="/closers/signup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Closer Signup
                    </a>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-400 px-3 py-1">Public Pages</div>
                    <a
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Homepage
                    </a>
                    <a
                      href="/book-call"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Book Call
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {!sidebarCollapsed && (
          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Actions
            </div>
            
            <div className="space-y-2 px-3">
              <div className="relative">
                <button
                  onClick={() => setShowResetDropdown(!showResetDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-red-400 hover:bg-slate-700 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="text-sm font-medium">Reset Data</span>
                  </div>
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showResetDropdown && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          resetData('quiz');
                          setShowResetDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-600 border-b border-slate-600"
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <div className="font-medium">Quiz Data</div>
                            <div className="text-xs text-slate-400">Sessions, answers, results</div>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          resetData('affiliate');
                          setShowResetDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-600 border-b border-slate-600"
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <div>
                            <div className="font-medium">Affiliate Data</div>
                            <div className="text-xs text-slate-400">Clicks, conversions, payouts</div>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          resetData('closer');
                          setShowResetDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-600 border-b border-slate-600"
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <div>
                            <div className="font-medium">Closer Data</div>
                            <div className="text-xs text-slate-400">Appointments, performance</div>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          resetData('all');
                          setShowResetDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-600"
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <div>
                            <div className="font-medium">Everything</div>
                            <div className="text-xs text-red-400">Complete system reset</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}
        </div>
        
        {/* Sidebar Footer */}
        <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} border-t border-slate-700 flex-shrink-0`}>
          {/* Collapse/Expand Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`${sidebarCollapsed ? 'mx-auto mb-3' : 'w-full mb-4'} p-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center space-x-2'}`}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className={`w-4 h-4 text-slate-300 ${sidebarCollapsed ? 'rotate-180' : ''} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {!sidebarCollapsed && <span className="text-sm font-medium">Collapse</span>}
          </button>

          {/* User Profile and Logout */}
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <span className="text-sm font-bold text-white">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">Admin</p>
                  <p className="text-xs text-slate-300 truncate">admin@brightnest.com</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-white">A</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-300 hover:bg-slate-700 transition-colors group relative"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  Logout
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-8">

          {/* Quiz Analytics Section */}
          {activeSection === 'quiz-analytics' && (
            <>
              {/* Quiz Analytics Header with Icon and Filters */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Quiz Analytics</h2>
                        <p className="text-gray-600 font-medium">Comprehensive quiz performance and engagement metrics</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Quiz Type Filter */}
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Quiz Type:</label>
                      <select
                        value={quizAnalyticsFilters.quizType}
                        onChange={(e) => setQuizAnalyticsFilters(prev => ({ ...prev, quizType: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Types</option>
                        <option value="financial-profile">Financial Profile</option>
                        <option value="health-finance">Health Finance</option>
                        <option value="marriage-finance">Marriage Finance</option>
                      </select>
                    </div>
                    
                    {/* Duration Filter */}
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Duration:</label>
                      <select
                        value={quizAnalyticsFilters.duration}
                        onChange={(e) => setQuizAnalyticsFilters(prev => ({ ...prev, duration: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="24h">Last 24 hours</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                      </select>
                    </div>

                    {/* Affiliate Filter */}
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Affiliate:</label>
                      <select
                        value={quizAnalyticsFilters.affiliateCode}
                        onChange={(e) => setQuizAnalyticsFilters(prev => ({ ...prev, affiliateCode: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Affiliates</option>
                        {affiliates.map(affiliate => (
                          <option key={affiliate.id} value={affiliate.referralCode}>
                            {affiliate.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              {isLoading && !hasInitiallyLoaded.current ? (
            <div className="text-center py-8 opacity-50 transition-opacity duration-300">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading stats...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => fetchStats()}
                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700">Clicks</h3>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.clicks}
                      </p>
                      <p className="text-xs text-gray-500">Total clicks</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700">Partial Submissions</h3>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.partialSubmissions}
                      </p>
                      <p className="text-xs text-gray-500">Started but didn&apos;t complete</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700">Average Time</h3>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.averageTimeMs > 0 ? formatDuration(stats.averageTimeMs) : '0s'}
                      </p>
                      <p className="text-xs text-gray-500">Time to complete quiz</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700">Leads Collected</h3>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {stats.leadsCollected}
                      </p>
                      <p className="text-xs text-gray-500">Completed the full quiz</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          stats.completionRate >= 70 ? 'bg-green-50' : 
                          stats.completionRate >= 40 ? 'bg-yellow-50' : 'bg-red-50'
                        }`}>
                          <svg className={`w-5 h-5 ${
                            stats.completionRate >= 70 ? 'text-green-600' : 
                            stats.completionRate >= 40 ? 'text-yellow-600' : 'text-red-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700">Completion Rate</h3>
                      </div>
                      <p className={`text-3xl font-bold mb-1 ${
                        stats.completionRate >= 70 ? 'text-green-600' : 
                        stats.completionRate >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {stats.completionRate}%
                      </p>
                      <p className="text-xs text-gray-500">Quiz completion rate</p>
                    </div>
                  </div>
                </div>
              </div>


          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Quiz Retention Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Quiz Retention Rate
                  </h3>
                  {retentionChartData && (
                    <div className="h-80">
                      <Line 
                        data={retentionChartData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: {
                            intersect: false,
                            mode: 'index',
                          },
                          plugins: {
                            legend: {
                              display: false,
                            },
                            tooltip: {
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              titleColor: 'white',
                              bodyColor: 'white',
                              borderColor: 'rgba(59, 130, 246, 1)',
                              borderWidth: 1,
                              cornerRadius: 8,
                              callbacks: {
                                label: function(context) {
                                  const questionNum = context.dataIndex + 1;
                                  const retention = Math.min(context.parsed.y, 100).toFixed(1); // Cap at 100%
                                  const dropOff = Math.max(100 - context.parsed.y, 0).toFixed(1); // Ensure non-negative
                                  return [
                                    `Q${questionNum}: ${retention}% retention`,
                                    `${dropOff}% never reached this question`
                                  ];
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 110, // Add 10% buffer above 100% line
                              min: 0, // Start at 0%
                              grid: {
                                color: 'rgba(0, 0, 0, 0.1)',
                              },
                              ticks: {
                                callback: function(value: string | number) {
                                  // Don't show labels above 100%
                                  if (typeof value === 'number' && value > 100) return '';
                                  return value + '%';
                                },
                                color: 'rgba(0, 0, 0, 0.7)',
                                stepSize: 10, // Show every 10%
                              },
                              title: {
                                display: true,
                                text: 'Users Still in Quiz',
                                color: 'rgba(0, 0, 0, 0.7)',
                                font: {
                                  size: 12,
                                  weight: 'bold'
                                }
                              }
                            },
                            x: {
                              grid: {
                                display: false,
                              },
                              ticks: {
                                color: 'rgba(0, 0, 0, 0.7)',
                              },
                              title: {
                                display: true,
                                text: 'Question Number',
                                color: 'rgba(0, 0, 0, 0.7)',
                                font: {
                                  size: 12,
                                  weight: 'bold'
                                }
                              }
                            }
                          },
                          elements: {
                            line: {
                              borderWidth: 3,
                              tension: 0, // No curvature - straight segmented lines
                            },
                            point: {
                              radius: 6,
                              hoverRadius: 8,
                              borderWidth: 2,
                              borderColor: '#fff',
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

            {/* Activity Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Quiz Started
                    </h3>
                  </div>
                  {dailyActivityData && (
                    <div className="h-80">
                      <Line 
                        data={dailyActivityData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: {
                            intersect: false,
                            mode: 'index',
                          },
                          plugins: {
                            legend: {
                              display: false,
                            },
                            tooltip: {
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              titleColor: 'white',
                              bodyColor: 'white',
                              borderColor: 'rgba(59, 130, 246, 1)',
                              borderWidth: 1,
                              cornerRadius: 8,
                              callbacks: {
                                label: function(context) {
                                  return `${context.parsed.y} quiz started`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: 'rgba(0, 0, 0, 0.1)',
                              },
                              ticks: {
                                stepSize: 1,
                                color: 'rgba(0, 0, 0, 0.7)',
                              },
                              title: {
                                display: true,
                                text: 'Quiz Started',
                                color: 'rgba(0, 0, 0, 0.7)',
                                font: {
                                  size: 12,
                                  weight: 'bold'
                                }
                              }
                            },
                            x: {
                              grid: {
                                display: false,
                              },
                              ticks: {
                                color: 'rgba(0, 0, 0, 0.7)',
                              },
                              title: {
                                display: true,
                                text: quizAnalyticsFilters.duration === '24h' ? 'Hour' : 'Date',
                                color: 'rgba(0, 0, 0, 0.7)',
                                font: {
                                  size: 12,
                                  weight: 'bold'
                                }
                              }
                            }
                          },
                          elements: {
                            line: {
                              borderWidth: 3,
                              tension: 0, // No curvature - straight segmented lines
                            },
                            point: {
                              radius: 6,
                              hoverRadius: 8,
                              borderWidth: 2,
                              borderColor: '#fff',
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

            {/* Clicks Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                      Clicks
                    </h3>
                  </div>
                  {clicksActivityData && (
                    <div className="h-80">
                      <Line 
                        data={clicksActivityData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: {
                            intersect: false,
                            mode: 'index',
                          },
                          plugins: {
                            legend: {
                              display: false,
                            },
                            tooltip: {
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              titleColor: 'white',
                              bodyColor: 'white',
                              borderColor: 'rgba(16, 185, 129, 1)',
                              borderWidth: 1,
                              cornerRadius: 8,
                              callbacks: {
                                label: function(context) {
                                  return `${context.parsed.y} clicks`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: 'rgba(0, 0, 0, 0.1)',
                              },
                              ticks: {
                                stepSize: 1,
                                color: 'rgba(0, 0, 0, 0.7)',
                              },
                              title: {
                                display: true,
                                text: 'Clicks',
                                color: 'rgba(0, 0, 0, 0.7)',
                                font: {
                                  size: 12,
                                  weight: 'bold'
                                }
                              }
                            },
                            x: {
                              grid: {
                                display: false,
                              },
                              ticks: {
                                color: 'rgba(0, 0, 0, 0.7)',
                              },
                              title: {
                                display: true,
                                text: quizAnalyticsFilters.duration === '24h' ? 'Hour' : 'Date',
                                color: 'rgba(0, 0, 0, 0.7)',
                                font: {
                                  size: 12,
                                  weight: 'bold'
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  )}
              </div>

          {/* Top Funnel Drop-offs */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${
                  stats.topDropOffQuestions.length > 0 
                    ? 'bg-gradient-to-br from-red-500 to-red-600' 
                    : 'bg-gradient-to-br from-green-500 to-green-600'
                }`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {stats.topDropOffQuestions.length > 0 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Top Funnel Drop-offs</h3>
                  <p className="text-xs text-gray-500">
                    {stats.topDropOffQuestions.length > 0 
                      ? 'Questions that most users never reached (from quiz start)' 
                      : 'No significant drop-offs detected'
                    }
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${
                  stats.topDropOffQuestions.length > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {stats.topDropOffQuestions.length}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  {stats.topDropOffQuestions.length > 0 ? 'Critical Issues' : 'Issues Found'}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {stats.topDropOffQuestions.length > 0 ? (
                stats.topDropOffQuestions.map((question, index) => (
                  <div key={question.questionNumber} className="group relative overflow-hidden bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 hover:border-red-200 transition-all duration-300 hover:shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                              <span className="text-xs font-bold text-white">#{index + 1}</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Q{question.questionNumber}
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                {(question.retentionRate || 0).toFixed(1)}% retention
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-1 leading-tight truncate">
                              {question.questionText}
                            </h4>
                            <div className="flex items-center space-x-3 text-xs text-gray-600">
                              <div className="flex items-center space-x-1">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Previous: {(question.previousRetentionRate || 0).toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                            <div className="text-lg font-bold text-red-600 mb-1">
                              {(question.dropFromPrevious || 0).toFixed(1)}%
                            </div>
                            <div className="text-xs text-red-500 font-medium uppercase tracking-wide">
                              Never Reached
                            </div>
                            <div className="mt-1 w-12 h-1 bg-red-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(question.dropFromPrevious, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Excellent Retention!</h4>
                  <p className="text-gray-600 max-w-sm mx-auto text-sm leading-relaxed">
                    No significant drop-offs detected. Users are completing the quiz successfully.
                  </p>
                  <div className="mt-4 inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Quiz Flow Optimized
                  </div>
                </div>
              )}
            </div>
          </div>

              {/* Archetype Distribution */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Archetype Distribution
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.archetypeStats.map((stat) => (
                    <div key={stat.archetype} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {stat._count.archetype}
                      </div>
                      <div className="text-sm text-gray-600">
                        {stat.archetype}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
            </>
          )}

          {/* CRM Section - HubSpot Style */}
          {activeSection === 'crm' && (
            <div className="bg-gray-50 min-h-screen">
              {/* CRM Header with Icon and Filters */}
              <div className="bg-white px-6 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Lead Analytics</h2>
                        <p className="text-gray-600 font-medium">Customer relationship management and lead tracking</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                  {/* Quiz Type Filter */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Quiz Type:</label>
                    <select
                      value={crmFilters.quizType}
                      onChange={(e) => setCrmFilters(prev => ({ ...prev, quizType: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="financial-profile">Financial Profile</option>
                      <option value="health-finance">Health Finance</option>
                      <option value="marriage-finance">Marriage Finance</option>
                    </select>
                  </div>
                  
                  {/* Date Range Filter */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Date Range:</label>
                    <select
                      value={crmFilters.dateRange}
                      onChange={(e) => setCrmFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Time</option>
                      <option value="24h">Last 24 hours</option>
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="1y">Last year</option>
                    </select>
                  </div>

                  {/* Affiliate Filter */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Affiliate:</label>
                    <select
                      value={crmFilters.affiliateCode}
                      onChange={(e) => setCrmFilters(prev => ({ ...prev, affiliateCode: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Affiliates</option>
                      {affiliates.map(affiliate => (
                        <option key={affiliate.id} value={affiliate.referralCode}>
                          {affiliate.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              </div>

                {/* Metrics - Professional Card Layout */}
              {crmShowMetrics && (
              <div className="bg-gradient-to-b from-gray-50 to-white px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  {/* Total Deal Amount */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2 text-center">{formatCurrency(revenueMetrics.totalRevenue)}</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">TOTAL DEAL AMOUNT</div>
                    <div className="text-xs text-gray-400">Open + Closed deals</div>
                  </div>

                  {/* Weighted Deal Amount */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2 text-center">$0.00</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">WEIGHTED DEAL AMOUNT</div>
                    <div className="text-xs text-gray-400">To be determined</div>
                  </div>

                  {/* Open Deal Amount */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2 text-center">{formatCurrency(revenueMetrics.openDealAmount)}</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">OPEN DEAL AMOUNT</div>
                    <div className="text-xs text-gray-400">Potential + actual open deals</div>
                  </div>

                  {/* Closed Deal Amount */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2 text-center">{formatCurrency(revenueMetrics.closedDealAmount)}</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">CLOSED DEAL AMOUNT</div>
                    <div className="text-xs text-gray-400">Closed deals with sale values</div>
                  </div>

                  {/* New Deal Amount */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2 text-center">{formatCurrency(revenueMetrics.newDealAmount)}</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">NEW DEAL AMOUNT</div>
                    <div className="text-xs text-gray-400">Deals with no outcome yet</div>
                  </div>

                  {/* Average Deal Age */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2 text-center">{((stats?.averageTimeMs || 0) / (1000 * 60 * 60 * 24)).toFixed(1)} days</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">AVERAGE DEAL AGE</div>
                    <div className="text-xs text-gray-400">
                      <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Average time
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Search and Actions */}
              <div className="bg-white px-6 py-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                  <input
                    type="text"
                    placeholder="Search name or description"
                    value={crmSearch}
                    onChange={(e) => handleCrmSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80 text-black placeholder-black"
                  />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setCrmShowMetrics(!crmShowMetrics)}
                      className="text-gray-600 text-sm font-medium hover:text-gray-700 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {crmShowMetrics ? 'Hide Metrics' : 'Show Metrics'}
                    </button>
                    <button
                      onClick={handleCrmExport}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors text-sm"
                    >
                      Export
                    </button>
                    <button 
                      onClick={() => setCrmShowColumnModal(true)}
                      className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors text-sm"
                    >
                      Edit columns
                    </button>
                    <button 
                      onClick={() => router.push('/admin/leads')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                    >
                      Lead Analytics
                    </button>
                  </div>
                  </div>
                </div>
                
              {/* Lead Table */}
              <div className="bg-white px-6 py-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {crmVisibleColumns.checkbox && (
                        <th className="px-6 py-3 text-left">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300"
                            checked={crmSelectedLeads.size === paginatedCrmLeads.length && paginatedCrmLeads.length > 0}
                            onChange={(e) => handleCrmSelectAll(e.target.checked)}
                          />
                        </th>
                        )}
                        {crmVisibleColumns.name && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => handleCrmSort('name')}>
                            LEAD NAME
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          </div>
                        </th>
                        )}
                        {crmVisibleColumns.stage && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => handleCrmSort('status')}>
                            STAGE
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          </div>
                        </th>
                        )}
                        {crmVisibleColumns.date && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => handleCrmSort('date')}>
                            LEAD ADDED
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          </div>
                        </th>
                        )}
                        {crmVisibleColumns.owner && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => handleCrmSort('owner')}>
                            DEAL OWNER
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          </div>
                        </th>
                        )}
                        {crmVisibleColumns.amount && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => handleCrmSort('amount')}>
                            AMOUNT
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          </div>
                        </th>
                        )}
                        {crmVisibleColumns.source && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => handleCrmSort('source')}>
                            SOURCE
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          </div>
                        </th>
                        )}
                        {crmVisibleColumns.actions && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            ACTIONS
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </div>
                        </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {paginatedCrmLeads.map((lead) => {
                        const nameAnswer = lead.answers.find(a => 
                          a.question?.prompt?.toLowerCase().includes('name')
                        );
                        
                        return (
                          <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                            {crmVisibleColumns.checkbox && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300"
                                checked={crmSelectedLeads.has(lead.id)}
                                onChange={(e) => handleCrmSelectLead(lead.id, e.target.checked)}
                              />
                            </td>
                            )}
                            {crmVisibleColumns.name && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {nameAnswer?.value || "steam"}
                            </td>
                            )}
                            {crmVisibleColumns.stage && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              {(() => {
                                // Get the actual status value - ensure it's not "Stage" (column header)
                                const actualStatus = lead.status && lead.status !== "Stage" ? lead.status : 
                                  (lead.appointment?.outcome === 'converted' ? 'Purchased (Call)' :
                                   lead.appointment?.outcome === 'not_interested' ? 'Not Interested' :
                                   lead.appointment?.outcome === 'needs_follow_up' ? 'Needs Follow Up' :
                                   lead.appointment?.outcome ? 'Booked' : 'Completed');
                                
                                return (
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    actualStatus === "Purchased (Call)"
                                      ? "bg-green-100 text-green-800" 
                                      : actualStatus === "Not Interested"
                                      ? "bg-red-100 text-red-800"
                                      : actualStatus === "Needs Follow Up"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : actualStatus === "Booked"
                                      ? "bg-blue-100 text-blue-800"
                                      : actualStatus === "Completed"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}>
                                    {actualStatus}
                                  </span>
                                );
                              })()}
                            </td>
                            )}
                            {crmVisibleColumns.date && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {lead.completedAt ? new Date(lead.completedAt).toLocaleDateString('en-GB') : "Yesterday"}
                            </td>
                            )}
                            {crmVisibleColumns.owner && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                              {'Unassigned'}
                            </td>
                            )}
                            {crmVisibleColumns.amount && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {lead.saleValue 
                                ? `$${Number(lead.saleValue).toFixed(2)}` 
                                : '--'}
                            </td>
                            )}
                            {crmVisibleColumns.source && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {lead.source || 'Direct'}
                              </span>
                            </td>
                            )}
                            {crmVisibleColumns.actions && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                              <button onClick={() => handleCrmViewDetails(lead)}>
                                View Details
                              </button>
                            </td>
                            )}
                          </tr>
                        );
                      })}
                      {paginatedCrmLeads.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                            No leads found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-8 flex items-center justify-between">
                  <div className="text-sm text-black">
                    Showing {(crmCurrentPage - 1) * crmItemsPerPage + 1} to {Math.min(crmCurrentPage * crmItemsPerPage, filteredCrmLeads.length)} of {filteredCrmLeads.length} results
              </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-black">Items per page:</span>
                      <select 
                        value={crmItemsPerPage}
                        onChange={(e) => handleCrmItemsPerPageChange(Number(e.target.value))}
                        className="border border-gray-300 rounded px-2 py-1 text-sm text-black"
                      >
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleCrmPageChange(crmCurrentPage - 1)}
                        disabled={crmCurrentPage === 1}
                        className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        &lt; Prev
                      </button>
                      <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                        {crmCurrentPage}
                      </button>
                      <button 
                        onClick={() => handleCrmPageChange(crmCurrentPage + 1)}
                        disabled={crmCurrentPage === totalCrmPages}
                        className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next &gt;
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Details Modal */}
              {crmShowLeadModal && crmSelectedLead && (
                <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
                  <div className="min-h-screen bg-white">
                    {/* Header */}
                    <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <h1 className="text-xl font-semibold text-white">
                              {crmSelectedLead.answers.find((a: any) => 
                                a.question?.prompt?.toLowerCase().includes('name')
                              )?.value || 'Lead Profile'}
                            </h1>
                            <p className="text-slate-300 text-sm">
                              Session ID: {crmSelectedLead.id || crmSelectedLead.sessionId || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setCrmShowLeadModal(false)}
                          className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="p-8 max-w-7xl mx-auto space-y-8">
                      {/* Combined Personal Information and Deal Information */}
                      <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Personal Information
                          </h3>
                          <button 
                            onClick={() => {
                              setCrmShowLeadModal(false);
                              setCrmSelectedLead(null);
                              setCrmLeadModalTab('activity');
                              setAdminNotes([]);
                              setAdminNoteContent('');
                              setShowAdminNoteForm(false);
                            }}
                            className="text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-lg hover:bg-slate-100"
                            title="Close and return to dashboard"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Full Name</label>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {crmSelectedLead.answers.find((a: any) => 
                                a.question?.prompt?.toLowerCase().includes('name')
                              )?.value || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email Address</label>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {crmSelectedLead.answers.find((a: any) => 
                                a.question?.prompt?.toLowerCase().includes('email')
                              )?.value || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          Deal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Stage</label>
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                crmSelectedLead.status === 'Completed' || crmSelectedLead.status === 'Booked' 
                                  ? 'bg-green-100 text-green-800' 
                                  : crmSelectedLead.status === 'In Progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {crmSelectedLead.status}
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Deal Owner</label>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {crmSelectedLead.closerName || crmSelectedLead.appointment?.closer?.name || 'Unassigned'}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Lead Added</label>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {crmSelectedLead.completedAt ? new Date(crmSelectedLead.completedAt).toLocaleDateString('en-GB') : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Deal Closed</label>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {crmSelectedLead.dealClosedAt ? new Date(crmSelectedLead.dealClosedAt).toLocaleDateString('en-GB') : '--'}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Deal Amount</label>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {crmSelectedLead.appointment?.outcome === 'converted' && crmSelectedLead.appointment?.saleValue 
                                ? `$${Number(crmSelectedLead.appointment.saleValue).toFixed(2)}` 
                                : '--'}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Lead Source</label>
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {crmSelectedLead.source || 'Website'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Quiz Type</label>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{crmSelectedLead.quizType || 'Financial-Profile'}</p>
                        </div>
                        </div>

                      </div>

                      {/* Tabs Navigation */}
                      <div className="border-b border-slate-200">
                        <div className="flex space-x-8">
                          <button
                            onClick={() => setCrmLeadModalTab('activity')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                              crmLeadModalTab === 'activity'
                                ? 'border-slate-800 text-slate-800'
                                : 'border-transparent text-gray-600 hover:text-slate-700 hover:border-gray-300'
                            }`}
                          >
                            Activity
                          </button>
                          <button
                            onClick={() => setCrmLeadModalTab('notes')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                              crmLeadModalTab === 'notes'
                                ? 'border-slate-800 text-slate-800'
                                : 'border-transparent text-gray-600 hover:text-slate-700 hover:border-gray-300'
                            }`}
                          >
                            Notes
                          </button>
                          <button
                            onClick={() => setCrmLeadModalTab('tasks')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                              crmLeadModalTab === 'tasks'
                                ? 'border-slate-800 text-slate-800'
                                : 'border-transparent text-gray-600 hover:text-slate-700 hover:border-gray-300'
                            }`}
                          >
                            Tasks
                          </button>
                        </div>
                      </div>

                      {/* Tab Content */}
                      <div className="bg-white rounded-xl border border-slate-200 p-6">
                        {crmLeadModalTab === 'activity' && (
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Activity Timeline
                            </h3>

                            {!crmActivities ? (
                              <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-sm text-slate-600 mt-4">Loading activities...</p>
                              </div>
                            ) : crmActivities.length === 0 ? (
                              <div className="text-center py-8">
                                <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-sm text-slate-600">No activity recorded yet</p>
                              </div>
                            ) : (
                              <div className="relative">
                                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                                <div className="space-y-6">
                                  {[...crmActivities].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((activity: any) => (
                                    <div key={activity.id} className="relative flex items-start space-x-4">
                                      {/* Icon */}
                                      <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center z-10 ${
                                        activity.type === 'quiz_completed' ? 'bg-purple-100' :
                                        activity.type === 'call_booked' ? 'bg-blue-100' :
                                        activity.type === 'outcome_marked' ? 'bg-orange-100' :
                                        activity.type === 'outcome_updated' ? 'bg-orange-100' :
                                        activity.type === 'deal_closed' ? 'bg-green-100' :
                                        activity.type === 'note_added' ? 'bg-amber-100' :
                                        (activity.type === 'task_created' || activity.type === 'task_started' || activity.type === 'task_completed') ? 'bg-indigo-100' :
                                        'bg-gray-100'
                                      }`}>
                                        {activity.type === 'quiz_completed' && (
                                          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                        )}
                                        {activity.type === 'call_booked' && (
                                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                        )}
                                        {(activity.type === 'outcome_marked' || activity.type === 'outcome_updated') && (
                                          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                        )}
                                        {activity.type === 'deal_closed' && (
                                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                        )}
                                        {activity.type === 'note_added' && (
                                          <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                        )}
                                        {(activity.type === 'task_created' || activity.type === 'task_started' || activity.type === 'task_completed') && (
                                          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                          </svg>
                                        )}
                                      </div>

                                    {/* Content */}
                                    <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200">
                                      <p className="text-sm font-semibold text-slate-900">
                                        {activity.type === 'quiz_completed' && (
                                          <span><span className="text-blue-600">{activity.leadName}</span> completed the quiz</span>
                                        )}
                                        {activity.type === 'call_booked' && (
                                          <span><span className="text-blue-600">{activity.leadName}</span> booked a call</span>
                                        )}
                                        {activity.type === 'outcome_marked' && (
                                          <span><span className="text-green-600">{activity.actor}</span> marked <span className="text-blue-600">{activity.leadName}</span> as <span className="font-bold text-orange-600">{activity.details?.outcome?.replace(/_/g, ' ')}</span></span>
                                        )}
                                        {activity.type === 'outcome_updated' && (
                                          <span><span className="text-green-600">{activity.actor}</span> marked <span className="text-blue-600">{activity.leadName}</span> as <span className="font-bold text-orange-600">{activity.details?.outcome?.replace(/_/g, ' ')}</span></span>
                                        )}
                                        {activity.type === 'deal_closed' && (
                                          <span><span className="text-green-600">{activity.actor}</span> marked <span className="text-blue-600">{activity.leadName}</span> as closed</span>
                                        )}
                                        {activity.type === 'note_added' && (
                                          <span><span className="text-amber-600">{activity.actor}</span> added a note</span>
                                        )}
                                        {activity.type === 'task_created' && (
                                          <span><span className="text-indigo-600">{activity.actor}</span> created a task</span>
                                        )}
                                        {activity.type === 'task_started' && (
                                          <span><span className="text-blue-600">{activity.actor}</span> started the task</span>
                                        )}
                                        {activity.type === 'task_completed' && (
                                          <span><span className="text-green-600">{activity.actor}</span> finished the task</span>
                                        )}
                                      </p>
                                      <p className="text-xs text-slate-500 mt-1">
                                        {new Date(activity.timestamp).toLocaleString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                          hour: 'numeric',
                                          minute: '2-digit',
                                          hour12: true
                                        })}
                                      </p>

                                      {/* View Call Details for outcome/deal activities */}
                                      {(activity.type === 'outcome_marked' || activity.type === 'outcome_updated' || activity.type === 'deal_closed') && (
                                        <div className="mt-3">
                                          <button
                                            onClick={() => {
                                              const detailsEl = document.getElementById(`call-details-${activity.id}`);
                                              if (detailsEl) detailsEl.classList.toggle('hidden');
                                            }}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                                          >
                                            View call details
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                          </button>
                                          <div id={`call-details-${activity.id}`} className="hidden mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="bg-white rounded-lg p-3 border border-slate-300">
                                              <p className="text-xs font-semibold text-slate-900 mb-1">Recording Link</p>
                                              {activity.details?.recordingLink ? (
                                                <a href={activity.details.recordingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline break-all">
                                                  {activity.details.recordingLink}
                                                </a>
                                              ) : (
                                                <p className="text-sm text-slate-400 italic">No recording available</p>
                                              )}
                                            </div>
                                            <div className="bg-white rounded-lg p-3 border border-slate-300">
                                              <p className="text-xs font-semibold text-slate-900 mb-1">Call Notes</p>
                                              {activity.details?.notes ? (
                                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{activity.details.notes}</p>
                                              ) : (
                                                <p className="text-sm text-slate-400 italic">No notes available</p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Activity-specific details */}
                                      {activity.type === 'quiz_completed' && (
                                        <div className="mt-2">
                                          <button 
                                            onClick={() => {
                                              const modal = document.getElementById(`quiz-answers-${activity.id}`);
                                              if (modal) modal.classList.toggle('hidden');
                                            }}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                          >
                                            View quiz answers →
                                          </button>
                                          <div id={`quiz-answers-${activity.id}`} className="hidden mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                              {crmSelectedLead.answers.map((answer: any, index: number) => (
                                              <div key={index} className="bg-white rounded-lg p-3 border border-slate-300">
                                                <p className="text-xs font-semibold text-slate-900 mb-1">
                                                  {answer.question?.prompt || `Question ${index + 1}`}
                                                </p>
                                  <p className="text-sm text-slate-700">{answer.value || 'No answer provided'}</p>
                                    </div>
                              ))}
                            </div>
                                        </div>
                                      )}

                                      {activity.type === 'call_booked' && (
                                        <div className="mt-2">
                                          {activity.details?.closerName && (
                                            <p className="text-xs text-slate-600 mb-2">
                                              <span className="font-medium">Assigned to:</span> {activity.details.closerName}
                                            </p>
                                          )}
                                          
                                          {/* Show dropdown if there's a closer and the call has been completed (has outcome or recording/notes) */}
                                          {activity.details?.closerName && (activity.details?.outcome || activity.details?.recordingLink || activity.details?.notes) && (
                                            <>
                                              <button 
                                                onClick={() => {
                                                  const modal = document.getElementById(`call-details-${activity.id}`);
                                                  if (modal) modal.classList.toggle('hidden');
                                                }}
                                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                              >
                                                View call details →
                                              </button>
                                              <div id={`call-details-${activity.id}`} className="hidden mt-3 bg-white rounded-lg p-3 border border-slate-300 space-y-3">
                                                {activity.details?.recordingLink ? (
                                                  <div>
                                                    <p className="text-xs font-semibold text-slate-900 mb-1">Recording Link:</p>
                                                    <a 
                                                      href={activity.details.recordingLink} 
                                                      target="_blank" 
                                                      rel="noopener noreferrer"
                                                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline break-all"
                                                    >
                                                      {activity.details.recordingLink}
                                                    </a>
                                                  </div>
                                                ) : activity.details?.outcome ? (
                                                  <div>
                                                    <p className="text-xs text-slate-500 italic">Recording link not available yet</p>
                                                  </div>
                                                ) : null}
                                                {activity.details?.notes ? (
                                                  <div>
                                                    <p className="text-xs font-semibold text-slate-900 mb-1">Call Notes:</p>
                                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{activity.details.notes}</p>
                                                  </div>
                                                ) : activity.details?.outcome ? (
                                                  <div>
                                                    <p className="text-xs text-slate-500 italic">No call notes added yet</p>
                                                  </div>
                                                ) : null}
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      )}
                                      
                                      {activity.type === 'note_added' && (
                                        <div className="mt-2">
                                          <p className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200">{activity.details?.content}</p>
                                        </div>
                                      )}
                                      
                                      {(activity.type === 'task_created' || activity.type === 'task_started' || activity.type === 'task_completed') && activity.details?.title && (
                                        <div className="mt-2">
                                          <button
                                            onClick={() => {
                                              const detailsEl = document.getElementById(`task-details-${activity.id}`);
                                              if (detailsEl) detailsEl.classList.toggle('hidden');
                                            }}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                                          >
                                            View task details
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                          </button>
                                          <div id={`task-details-${activity.id}`} className="hidden mt-3">
                                            <div className="flex items-center gap-2">
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                                {activity.details.title}
                                              </span>
                                              {activity.details?.priority && activity.type === 'task_created' && (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                  activity.details.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                                  activity.details.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                  activity.details.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                  'bg-green-100 text-green-800'
                                                }`}>
                                                  {activity.details.priority}
                                                </span>
                                              )}
                                            </div>
                                            {activity.details?.description && activity.type === 'task_created' && (
                                              <p className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200 mt-2">{activity.details.description}</p>
                                            )}
                                            {activity.details?.dueDate && activity.type === 'task_created' && (
                                              <p className="text-xs text-slate-500 mt-2">
                                                Due: {new Date(activity.details.dueDate).toLocaleString('en-US', {
                                                  month: 'short',
                                                  day: 'numeric',
                                                  year: 'numeric',
                                                  hour: 'numeric',
                                                  minute: '2-digit'
                                                })}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            )}
                          </div>
                        )}

                        {crmLeadModalTab === 'notes' && (
                          <div className="space-y-6">

                            {/* Notes Section */}
                            <div>
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Notes
                                  <span className="ml-2 text-sm text-slate-500 font-normal">({adminNotes.length})</span>
                                </h3>
                                <button
                                  onClick={() => setShowAdminNoteForm(!showAdminNoteForm)}
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700"
                                >
                                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  {showAdminNoteForm ? 'Cancel' : 'Create Note'}
                                </button>
                              </div>

                              {/* Note Form */}
                              {showAdminNoteForm && (
                                <form onSubmit={(e) => {
                                  e.preventDefault();
                                  if (adminNoteContent.trim() && crmSelectedLead) {
                                    const leadEmail = crmSelectedLead.answers?.find((a: any) => a.value?.includes('@'))?.value;
                                    fetch('/api/notes', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ leadEmail, content: adminNoteContent, createdBy: 'Admin', createdByType: 'admin' }),
                                    }).then(async (response) => {
                                      if (response.ok) {
                                        const newNote = await response.json();
                                        setAdminNotes([newNote, ...adminNotes]);
                                        setAdminNoteContent('');
                                        setShowAdminNoteForm(false);
                                        fetchCrmActivities(crmSelectedLead);
                                      }
                                    }).catch((error) => console.error('Error saving note:', error));
                                  }
                                }} className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                  <textarea
                                    value={adminNoteContent}
                                    onChange={(e) => setAdminNoteContent(e.target.value)}
                                    rows={4}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-slate-500 focus:border-slate-500"
                                    placeholder="Add a new note..."
                                  />
                                  <div className="mt-2 flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShowAdminNoteForm(false);
                                        setAdminNoteContent('');
                                      }}
                                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      disabled={!adminNoteContent.trim()}
                                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400"
                                    >
                                      Save Note
                                    </button>
                                  </div>
                                </form>
                              )}

                              {/* Notes List */}
                              <div className="space-y-4">
                                {adminNotes.length > 0 ? (
                                  adminNotes.map((note) => (
                                    <div
                                      key={note.id}
                                      className="group p-4 bg-white rounded-lg border border-slate-200 flex justify-between items-start"
                                    >
                                      <div>
                                        <p className="text-sm text-slate-500">
                                          {new Date(note.createdAt).toLocaleString([], {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                        <p className="text-sm text-slate-800 whitespace-pre-wrap mt-1">{note.content}</p>
                                      </div>
                                      <button
                                        onClick={async () => {
                                          try {
                                            const response = await fetch(`/api/notes/${note.id}`, {
                                              method: 'DELETE',
                                            });

                                            if (response.ok) {
                                              setAdminNotes(adminNotes.filter(n => n.id !== note.id));
                                              fetchCrmActivities(crmSelectedLead);
                                            }
                                          } catch (error) {
                                            console.error('Error deleting note:', error);
                                          }
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-opacity"
                                        aria-label="Delete note"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  ))
                                ) : (
                                  !showAdminNoteForm && <p className="text-sm text-slate-600 text-center py-4">No notes have been added for this lead.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {crmLeadModalTab === 'tasks' && (
                          <div>
                            <div className="flex justify-between items-center mb-6">
                              <div className="flex items-center">
                                <svg className="w-6 h-6 text-slate-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                <h3 className="text-lg font-semibold text-slate-900">
                                  Tasks ({adminTasks.length})
                                </h3>
                              </div>
                              <button
                                onClick={() => setAdminShowTaskForm(!adminShowTaskForm)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700"
                              >
                                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {adminShowTaskForm ? 'Cancel' : 'Create Task'}
                              </button>
                            </div>

                            {/* Collapsible Task Form */}
                            {adminShowTaskForm && (
                              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
                                <h4 className="text-base font-semibold text-slate-900 mb-4">
                                  {adminEditingTask ? 'Edit Task' : 'Create New Task'}
                                </h4>
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Task Title *
                                  </label>
                                  <input
                                    type="text"
                                    value={adminTaskForm.title}
                                    onChange={(e) => setAdminTaskForm({ ...adminTaskForm, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                                    placeholder="e.g., Follow up on product demo"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Description
                                  </label>
                                  <textarea
                                    value={adminTaskForm.description}
                                    onChange={(e) => setAdminTaskForm({ ...adminTaskForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-900"
                                    rows={3}
                                    placeholder="Add any additional details..."
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                      Priority
                                    </label>
                                    <select
                                      value={adminTaskForm.priority}
                                      onChange={(e) => setAdminTaskForm({ ...adminTaskForm, priority: e.target.value })}
                                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                                    >
                                      <option value="low">Low</option>
                                      <option value="medium">Medium</option>
                                      <option value="high">High</option>
                                      <option value="urgent">Urgent</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                      Due Date
                                    </label>
                                    <input
                                      type="date"
                                      value={adminTaskForm.dueDate}
                                      onChange={(e) => setAdminTaskForm({ ...adminTaskForm, dueDate: e.target.value })}
                                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                                    />
                                  </div>
                                </div>
                              </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                  <button
                                    onClick={() => {
                                      setAdminEditingTask(null);
                                      setAdminTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
                                      setAdminShowTaskForm(false);
                                    }}
                                    className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={adminEditingTask ? handleAdminSaveEditedTask : handleAdminCreateTask}
                                    disabled={!adminTaskForm.title}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                  >
                                    {adminEditingTask ? 'Save Changes' : 'Create Task'}
                                  </button>
                                </div>
                              </div>
                            )}

                            {isLoadingAdminTasks ? (
                              <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                              </div>
                            ) : (
                              <>
                                  <div className="space-y-3">
                                    {adminTasks.map((task: any) => (
                                      <div
                                        key={task.id}
                                        className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition-colors"
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                              <button
                                                onClick={() => handleAdminUpdateTask(task.id, {
                                                  status: task.status === 'completed' ? 'pending' : 'completed'
                                                })}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                                  task.status === 'completed'
                                                    ? 'bg-green-500 border-green-500'
                                                    : 'border-slate-400 hover:border-green-500'
                                                }`}
                                              >
                                                {task.status === 'completed' && (
                                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                  </svg>
                                                )}
                                              </button>
                                              <h4 className={`font-semibold text-slate-900 ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                                                {task.title}
                                              </h4>
                                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                task.priority === 'urgent'
                                                  ? 'bg-red-100 text-red-700'
                                                  : task.priority === 'high'
                                                  ? 'bg-orange-100 text-orange-700'
                                                  : task.priority === 'medium'
                                                  ? 'bg-yellow-100 text-yellow-700'
                                                  : 'bg-slate-100 text-slate-700'
                                              }`}>
                                                {task.priority}
                                              </span>
                                              {task.status === 'in_progress' && (
                                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                                  In Progress
                                                </span>
                        )}
                      </div>
                                            {task.description && (
                                              <p className={`text-sm text-slate-600 ml-7 mb-2 ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                                                {task.description}
                                              </p>
                                            )}
                                            <div className="flex items-center space-x-4 ml-7 text-xs text-slate-500">
                                              {task.dueDate && (
                                                <div className="flex items-center">
                                                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                  </svg>
                                                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                                              )}
                                              <div className="flex items-center">
                                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2 ml-4">
                                            {task.status !== 'completed' && task.status !== 'in_progress' && (
                                              <button
                                                onClick={() => handleAdminUpdateTask(task.id, { status: 'in_progress' })}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Start Task"
                                              >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                              </button>
                                            )}
                                            <button
                                              onClick={() => openAdminEditTask(task)}
                                              className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                                              title="Edit Task"
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                              </svg>
                                            </button>
                                            <button
                                              onClick={() => handleAdminDeleteTask(task.id)}
                                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                              title="Delete Task"
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Columns Modal */}
              {crmShowColumnModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-900">Edit Columns</h2>
                      <button 
                        onClick={() => setCrmShowColumnModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Checkbox</span>
                        <input 
                          type="checkbox" 
                          checked={crmVisibleColumns.checkbox}
                          onChange={() => handleCrmToggleColumn('checkbox')}
                          className="rounded border-gray-300"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Lead Name</span>
                        <input 
                          type="checkbox" 
                          checked={crmVisibleColumns.name}
                          onChange={() => handleCrmToggleColumn('name')}
                          className="rounded border-gray-300"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Status</span>
                        <input 
                          type="checkbox" 
                          checked={crmVisibleColumns.stage}
                          onChange={() => handleCrmToggleColumn('stage')}
                          className="rounded border-gray-300"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Lead Added</span>
                        <input 
                          type="checkbox" 
                          checked={crmVisibleColumns.date}
                          onChange={() => handleCrmToggleColumn('date')}
                          className="rounded border-gray-300"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Deal Owner</span>
                        <input 
                          type="checkbox" 
                          checked={crmVisibleColumns.owner}
                          onChange={() => handleCrmToggleColumn('owner')}
                          className="rounded border-gray-300"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Amount</span>
                        <input 
                          type="checkbox" 
                          checked={crmVisibleColumns.amount}
                          onChange={() => handleCrmToggleColumn('amount')}
                          className="rounded border-gray-300"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Source</span>
                        <input 
                          type="checkbox" 
                          checked={crmVisibleColumns.source}
                          onChange={() => handleCrmToggleColumn('source')}
                          className="rounded border-gray-300"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Actions</span>
                        <input 
                          type="checkbox" 
                          checked={crmVisibleColumns.actions}
                          onChange={() => handleCrmToggleColumn('actions')}
                          className="rounded border-gray-300"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button 
                        onClick={() => setCrmShowColumnModal(false)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                              console.log('CRM settings updated successfully');
                              await fetchSettings();
                            } else {
                              console.error('Failed to update CRM settings:', data.error);
                            }
                          } catch (error) {
                            console.error('Error updating CRM settings:', error);
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
                              alert('Terminal outcomes updated successfully');
                              await fetchSettings();
                            } else {
                              alert('Failed to update terminal outcomes: ' + data.error);
                            }
                          } catch (error) {
                            console.error('Error updating terminal outcomes:', error);
                            alert('Error updating terminal outcomes. Please try again.');
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

          {/* Lead Profile Modal */}
          {showLeadModal && selectedLead && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Lead Profile</h3>
                    <button
                      onClick={closeLeadModal}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>
                      <p className="text-gray-900">{selectedLead.customerName}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p className="text-gray-900">{selectedLead.customerEmail}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <p className="text-gray-900">{selectedLead.customerPhone || 'Not provided'}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <p className="text-gray-900">{selectedLead.outcome || 'Pending'}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Sale Value:</span>
                      <p className="text-gray-900">{selectedLead.saleValue ? `$${Number(selectedLead.saleValue || 0).toFixed(2)}` : 'N/A'}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Date:</span>
                      <p className="text-gray-900">{formatDate(selectedLead.appointmentDate)}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Notes:</span>
                      <p className="text-gray-900">{selectedLead.notes || 'No notes'}</p>
                    </div>
                  </div>

                  {/* Close Button */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={closeLeadModal}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// Trigger deployment
