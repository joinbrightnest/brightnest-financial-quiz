"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import CRM from '../../components/dashboard/CRM';
import ErrorBoundary from '../../components/ErrorBoundary';
import { AdminStats } from '../../types';

interface Affiliate {
    id: string;
    name: string;
    referralCode: string;
}

export default function LeadAnalyticsPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const hasInitiallyLoaded = useRef(false);
    const [newDealAmountPotential, setNewDealAmountPotential] = useState(0); // Safest default to avoid huge numbers flash
    const [terminalOutcomes, setTerminalOutcomes] = useState<string[]>(['not_interested', 'converted']);

    // CRM Filters
    const [crmFilters, setCrmFilters] = useState({
        quizType: 'all',
        dateRange: 'all',
        affiliateCode: 'all'
    });

    const fetchStatsOnly = useCallback(async (bypassCache = false) => {
        try {
            const params = new URLSearchParams();
            if (crmFilters.quizType !== 'all') params.append('quizType', crmFilters.quizType);
            if (crmFilters.dateRange !== 'all') params.append('duration', crmFilters.dateRange);
            if (crmFilters.affiliateCode !== 'all') params.append('affiliateCode', crmFilters.affiliateCode);
            if (bypassCache) params.append('nocache', 'true');

            const queryString = params.toString();
            const url = queryString ? `/api/admin/basic-stats?${queryString}` : '/api/admin/basic-stats';

            const response = await fetch(url, { headers: { "Content-Type": "application/json" } });
            if (!response.ok) throw new Error("Failed to fetch stats");
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }, [crmFilters]);

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
                })(),
                (async () => {
                    try {
                        const res = await fetch('/api/admin/settings');
                        const data = await res.json();
                        if (data.success && data.settings) {
                            setNewDealAmountPotential(data.settings.newDealAmountPotential || 0);
                            setTerminalOutcomes(data.settings.terminalOutcomes || ['not_interested', 'converted']);
                        }
                    } catch (e) { console.error('Error fetching settings:', e); }
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
            // Slight delay to prevent flickering on quick filter changes if needed, 
            // but for now direct call is fine, just managing local loading state if separate from global
            fetchStatsOnly();
        }
    }, [crmFilters, fetchStatsOnly]);

    return (
        <ErrorBoundary sectionName="Lead Analytics">
            <CRM
                stats={stats}
                affiliates={affiliates}
                newDealAmountPotential={newDealAmountPotential}
                terminalOutcomes={terminalOutcomes}
                onRefresh={() => fetchStatsOnly(true)}
                crmFilters={crmFilters}
                setCrmFilters={setCrmFilters}
                isLoading={isLoading}
            />
        </ErrorBoundary>
    );
}
