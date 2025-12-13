"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import QuizAnalytics from '../../components/dashboard/QuizAnalytics';
import ErrorBoundary from '../../components/ErrorBoundary';
import { AdminStats, QuizAnalyticsFilters } from '../../types';

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

interface Affiliate {
    id: string;
    name: string;
    referralCode: string;
}

export default function QuizAnalyticsPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Start with true for consistency
    const [error, setError] = useState<string | null>(null);
    const hasInitiallyLoaded = useRef(false);
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);

    // Quiz Analytics Filters
    const [quizAnalyticsFilters, setQuizAnalyticsFilters] = useState({
        quizType: 'all',
        duration: 'all',
        affiliateCode: 'all'
    });

    const fetchStatsOnly = useCallback(async (bypassCache = false) => {
        setError(null);
        try {
            const params = new URLSearchParams();
            if (quizAnalyticsFilters.quizType !== 'all') params.append('quizType', quizAnalyticsFilters.quizType);
            if (quizAnalyticsFilters.duration !== 'all') params.append('duration', quizAnalyticsFilters.duration);
            if (quizAnalyticsFilters.affiliateCode !== 'all') params.append('affiliateCode', quizAnalyticsFilters.affiliateCode);
            if (bypassCache) params.append('nocache', 'true');

            const queryString = params.toString();
            const url = queryString ? `/api/admin/basic-stats?${queryString}` : '/api/admin/basic-stats';

            const response = await fetch(url, { headers: { "Content-Type": "application/json" } });
            if (!response.ok) throw new Error("Failed to fetch stats");
            const data = await response.json();
            setStats(data);
        } catch {
            setError("Failed to load admin stats");
        }
    }, [quizAnalyticsFilters]);

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                fetchStatsOnly(),
                (async () => {
                    try {
                        const res = await fetch('/api/admin/affiliates?status=approved');
                        const data = await res.json();
                        if (data.success) {
                            setAffiliates(data.affiliates.map((aff: Affiliate) => ({
                                id: aff.id,
                                name: aff.name,
                                referralCode: aff.referralCode
                            })));
                        }
                    } catch (e) { console.error('Error fetching affiliates:', e); }
                })()
            ]);
            hasInitiallyLoaded.current = true;
        } finally {
            setIsLoading(false);
        }
    }, [fetchStatsOnly]);

    // Initial Load
    useEffect(() => {
        if (!hasInitiallyLoaded.current) {
            fetchAllData();
        }
    }, [fetchAllData]);

    // Subsequent Filter Changes
    useEffect(() => {
        if (hasInitiallyLoaded.current) {
            // For filter changes, we might want to show a spinner or skeleton too, 
            // but keeping it simple for now or using local loading state if component supports it
            // To match lead analytics pattern perfectly:
            // setIsLoading(true); fetchStatsOnly().finally(() => setIsLoading(false));

            // However, for consistency with current code, let's just fetch
            fetchStatsOnly();
        }
    }, [quizAnalyticsFilters, fetchStatsOnly]);

    // Chart data for retention rates
    const retentionChartData = stats && stats.questionAnalytics.length > 0 ? {
        labels: stats.questionAnalytics.map(q => `Q${q.questionNumber}`),
        datasets: [
            {
                label: 'Retention Rate (%)',
                data: stats.questionAnalytics.map((q, index) => {
                    const actualRate = Math.min(q.retentionRate, 100);
                    if (index === 0) {
                        return Math.min(actualRate, 100);
                    }
                    const previousRate = Math.min(stats.questionAnalytics[index - 1].retentionRate, 100);
                    return Math.min(actualRate, previousRate);
                }),
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0,
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
            if (isNaN(date.getTime())) return 'Invalid Date';

            if (quizAnalyticsFilters.duration === '24h') {
                return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
            }
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
                    tension: 0,
                },
            ],
        };
    };

    const getClicksChartData = () => {
        if (!stats) return null;

        const formatLabel = (dateStr: string) => {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'Invalid Date';

            if (quizAnalyticsFilters.duration === '24h') {
                return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
            }
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };

        return {
            labels: stats.clicksActivity.map(day => formatLabel(day.createdAt)),
            datasets: [
                {
                    label: 'Clicks',
                    data: stats.clicksActivity.map(day => day._count.id),
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0,
                },
            ],
        };
    };

    return (
        <ErrorBoundary sectionName="Quiz Analytics">
            <QuizAnalytics
                filters={quizAnalyticsFilters}
                onFilterChange={setQuizAnalyticsFilters}
                stats={stats}
                loading={isLoading}
                error={error}
                onRetry={() => fetchStatsOnly(true)}
                affiliates={affiliates}
                retentionChartData={retentionChartData}
                dailyActivityData={getActivityChartData()}
                clicksActivityData={getClicksChartData()}
                hasInitiallyLoaded={hasInitiallyLoaded.current}
                onRefreshData={() => fetchStatsOnly(true)}
            />
        </ErrorBoundary>
    );
}
