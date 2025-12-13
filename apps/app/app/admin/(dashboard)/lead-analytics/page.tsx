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
    const hasInitiallyLoaded = useRef(false);
    const [newDealAmountPotential, setNewDealAmountPotential] = useState(5000);
    const [terminalOutcomes, setTerminalOutcomes] = useState<string[]>(['not_interested', 'converted']);

    // CRM Filters
    const [crmFilters, setCrmFilters] = useState({
        quizType: 'all',
        dateRange: 'all',
        affiliateCode: 'all'
    });

    const fetchStats = useCallback(async (bypassCache = false) => {
        try {
            const params = new URLSearchParams();
            if (crmFilters.quizType !== 'all') {
                params.append('quizType', crmFilters.quizType);
            }
            if (crmFilters.dateRange !== 'all') {
                params.append('duration', crmFilters.dateRange);
            }
            if (crmFilters.affiliateCode !== 'all') {
                params.append('affiliateCode', crmFilters.affiliateCode);
            }
            if (bypassCache) {
                params.append('nocache', 'true');
            }

            const queryString = params.toString();
            const url = queryString ? `/api/admin/basic-stats?${queryString}` : '/api/admin/basic-stats';

            const response = await fetch(url, {
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch stats");
            }

            const data = await response.json();
            setStats(data);
            hasInitiallyLoaded.current = true;
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }, [crmFilters]);

    const fetchAffiliates = async () => {
        try {
            const response = await fetch('/api/admin/affiliates?status=approved');
            const data = await response.json();
            if (data.success) {
                setAffiliates(data.affiliates.map((aff: Affiliate) => ({
                    id: aff.id,
                    name: aff.name,
                    referralCode: aff.referralCode
                })));
            }
        } catch (error) {
            console.error('Error fetching affiliates:', error);
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/admin/settings');
            const data = await response.json();
            if (data.success && data.settings) {
                setNewDealAmountPotential(data.settings.newDealAmountPotential || 5000);
                setTerminalOutcomes(data.settings.terminalOutcomes || ['not_interested', 'converted']);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    useEffect(() => {
        if (!hasInitiallyLoaded.current) {
            fetchStats();
            fetchAffiliates();
            fetchSettings();
        }
    }, [fetchStats]);

    useEffect(() => {
        if (hasInitiallyLoaded.current) {
            fetchStats();
        }
    }, [crmFilters, fetchStats]);

    return (
        <ErrorBoundary sectionName="Lead Analytics">
            <CRM
                stats={stats}
                affiliates={affiliates}
                newDealAmountPotential={newDealAmountPotential}
                terminalOutcomes={terminalOutcomes}
                onRefresh={() => fetchStats(true)}
                crmFilters={crmFilters}
                setCrmFilters={setCrmFilters}
            />
        </ErrorBoundary>
    );
}
