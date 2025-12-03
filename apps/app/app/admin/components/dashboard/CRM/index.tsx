"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminStats } from "../../../types";
import LeadDetailView from "../../../../components/shared/LeadDetailView";
import { ADMIN_CONSTANTS } from "../../../constants";
import { PaginationControls } from "@/components/ui/PaginationControls";

interface Answer {
    question?: {
        prompt?: string;
    };
    value?: string | number | object;
}

interface Lead {
    id: string;
    answers: Answer[];
    createdAt: string;
    status: string;
    completedAt?: string | null;
    affiliateCode?: string;
    appointment?: {
        outcome?: string | null;
        saleValue?: number | string | null;
        createdAt?: string | null;
        closer?: {
            name?: string;
        } | null;
    } | null;
    saleValue?: number | string | null;
    closerName?: string | null;
    source?: string;
}

interface CRMProps {
    stats: AdminStats | null;
    affiliates: Array<{ id: string; name: string; referralCode: string }>;
    newDealAmountPotential: number;
    terminalOutcomes: string[];
    onRefresh: () => void;
    crmFilters: {
        quizType: string;
        dateRange: string;
        affiliateCode: string;
    };
    setCrmFilters: React.Dispatch<React.SetStateAction<{
        quizType: string;
        dateRange: string;
        affiliateCode: string;
    }>>;
}

export default function CRM({
    stats,
    affiliates,
    newDealAmountPotential,
    terminalOutcomes,
    onRefresh,
    crmFilters,
    setCrmFilters
}: CRMProps) {
    const router = useRouter();

    // Local State
    const [crmSearch, setCrmSearch] = useState('');
    const [crmSortField, setCrmSortField] = useState('date');
    const [crmSortDirection, setCrmSortDirection] = useState<'asc' | 'desc'>('desc');
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
    const [crmSelectedLeads, setCrmSelectedLeads] = useState<Set<string>>(new Set());
    const [crmCurrentPage, setCrmCurrentPage] = useState(1);
    const [crmItemsPerPage, setCrmItemsPerPage] = useState(ADMIN_CONSTANTS.PAGINATION.DEFAULT_PAGE_SIZE);
    const [crmShowMetrics, setCrmShowMetrics] = useState(true);
    const [crmShowLeadModal, setCrmShowLeadModal] = useState(false);
    const [crmSelectedLead, setCrmSelectedLead] = useState<Lead | null>(null);
    const [crmShowColumnModal, setCrmShowColumnModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
    };

    // Helper: Format Currency
    const formatCurrency = (amount: number): string => {
        if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(1)}k`;
        }
        return `$${amount.toFixed(2)}`;
    };

    // Helper: Calculate Revenue Metrics
    const calculateRevenueMetrics = (leads: Lead[], terminalOutcomesList: string[], potentialValuePerCall: number) => {
        if (!leads || !Array.isArray(leads)) {
            return { totalRevenue: 0, openDealAmount: 0, newDealAmount: 0, closedDealAmount: 0 };
        }

        let openDealAmount = 0;
        let newDealAmount = 0;
        let closedDealAmount = 0;

        leads.forEach(lead => {
            const appointment = lead.appointment;
            const appointmentOutcome = appointment?.outcome;

            const saleValue = appointment?.saleValue
                ? parseFloat(appointment.saleValue.toString())
                : (lead.saleValue ? parseFloat(lead.saleValue.toString()) : 0);
            const hasSaleValue = saleValue > 0;

            if (appointment && !appointmentOutcome) {
                newDealAmount += potentialValuePerCall;
            }

            if (appointment) {
                const isTerminal = appointmentOutcome && terminalOutcomesList.includes(appointmentOutcome);

                if (!isTerminal) {
                    if (hasSaleValue) {
                        openDealAmount += saleValue;
                    } else {
                        openDealAmount += potentialValuePerCall;
                    }
                } else {
                    if (hasSaleValue) {
                        closedDealAmount += saleValue;
                    }
                }
            } else {
                openDealAmount += potentialValuePerCall;
            }
        });

        const totalRevenue = openDealAmount + closedDealAmount;
        return { totalRevenue, openDealAmount, newDealAmount, closedDealAmount };
    };

    // Filter and Sort Logic
    const filteredCrmLeads = useMemo(() => {
        if (!stats?.allLeads) return [];

        return stats.allLeads.filter(lead => {
            if (crmSearch) {
                const nameAnswer = lead.answers.find((a: Answer) =>
                    a.question?.prompt?.toLowerCase().includes('name')
                );
                const emailAnswer = lead.answers.find((a: Answer) =>
                    a.question?.prompt?.toLowerCase().includes('email')
                );
                const searchText = `${nameAnswer?.value || ''} ${emailAnswer?.value || ''}`.toLowerCase();
                if (!searchText.includes(crmSearch.toLowerCase())) {
                    return false;
                }
            }
            return true;
        }).sort((a: Lead, b: Lead) => {
            let aValue, bValue;

            switch (crmSortField) {
                case 'name':
                    const aNameAnswer = a.answers.find((ans: Answer) => ans.question?.prompt?.toLowerCase().includes('name'));
                    const bNameAnswer = b.answers.find((ans: Answer) => ans.question?.prompt?.toLowerCase().includes('name'));
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
                    aValue = a.saleValue ? parseFloat(a.saleValue.toString()) : 0;
                    bValue = b.saleValue ? parseFloat(b.saleValue.toString()) : 0;
                    break;
                case 'owner':
                    aValue = (a.closerName || a.appointment?.closer?.name || 'Unassigned').toLowerCase();
                    bValue = (b.closerName || b.appointment?.closer?.name || 'Unassigned').toLowerCase();
                    break;
                case 'source':
                    aValue = a.source || 'Website';
                    bValue = b.source || 'Website';
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
        });
    }, [stats?.allLeads, crmSearch, crmSortField, crmSortDirection]);

    // Pagination Logic
    const paginatedCrmLeads = useMemo(() => {
        const startIndex = (crmCurrentPage - 1) * crmItemsPerPage;
        return filteredCrmLeads.slice(startIndex, startIndex + crmItemsPerPage);
    }, [filteredCrmLeads, crmCurrentPage, crmItemsPerPage]);

    const totalCrmPages = Math.ceil(filteredCrmLeads.length / crmItemsPerPage);

    // Revenue Metrics
    const revenueMetrics = useMemo(() => {
        return calculateRevenueMetrics(filteredCrmLeads, terminalOutcomes, newDealAmountPotential);
    }, [filteredCrmLeads, terminalOutcomes, newDealAmountPotential]);

    // Handlers
    const handleCrmSearch = (value: string) => {
        setCrmSearch(value);
        setCrmCurrentPage(1);
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
        setCrmCurrentPage(1);
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

    const handleCrmViewDetails = (lead: Lead) => {
        setCrmSelectedLead(lead);
        setCrmShowLeadModal(true);
    };

    const handleCrmToggleColumn = (column: string) => {
        setCrmVisibleColumns(prev => ({
            ...prev,
            [column]: !prev[column as keyof typeof prev]
        }));
    };

    const handleCrmExport = () => {
        // Determine which leads to export: if any are selected, export only those; otherwise export all filtered leads
        const leadsToExport = crmSelectedLeads.size > 0
            ? filteredCrmLeads.filter(lead => crmSelectedLeads.has(lead.id))
            : filteredCrmLeads;

        const csvContent = [
            ['Name', 'Email', 'Stage', 'Date', 'Deal Owner', 'Amount', 'Source'].join(','),
            ...leadsToExport.map(lead => {
                const nameAnswer = lead.answers.find((a: Answer) =>
                    a.question?.prompt?.toLowerCase().includes('name')
                );
                const emailAnswer = lead.answers.find((a: Answer) =>
                    a.question?.prompt?.toLowerCase().includes('email')
                );
                return [
                    nameAnswer?.value || 'N/A',
                    emailAnswer?.value || 'N/A',
                    lead.status,
                    lead.completedAt ? new Date(lead.completedAt).toLocaleDateString() : 'N/A',
                    lead.closerName || lead.appointment?.closer?.name || 'Unassigned',
                    lead.saleValue ? `$${Number(lead.saleValue).toFixed(2)}` : '--',
                    lead.source || 'Website'
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // Clear selection after export if items were selected
        if (crmSelectedLeads.size > 0) {
            setCrmSelectedLeads(new Set());
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            {/* CRM Header with Icon and Filters */}
            <div className="flex-shrink-0 bg-white px-6 py-6 border-b border-gray-200">
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
                        {/* Refresh Button */}
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                        </button>

                        {/* Quiz Type Filter */}
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Quiz Type:</label>
                            <select
                                value={crmFilters.quizType}
                                onChange={(e) => setCrmFilters(prev => ({ ...prev, quizType: e.target.value }))}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Types</option>
                                {stats?.quizTypes && stats.quizTypes.length > 0 ? (
                                    stats.quizTypes.map((quizType) => (
                                        <option key={quizType.name} value={quizType.name}>
                                            {quizType.displayName}
                                        </option>
                                    ))
                                ) : (
                                    <>
                                        <option value="financial-profile">Financial Profile</option>
                                        <option value="health-finance">Health Finance</option>
                                        <option value="marriage-finance">Marriage Finance</option>
                                    </>
                                )}
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

            {/* Metrics - Single Horizontal Card Layout */}
            {crmShowMetrics && (
                <div className="flex-shrink-0 bg-gradient-to-b from-gray-50 to-white px-6 py-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex flex-col lg:flex-row">
                            {/* Total Deal Amount */}
                            <div className="flex-1 p-6 text-center">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">TOTAL DEAL AMOUNT</div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(revenueMetrics.totalRevenue)}</div>
                                <div className="text-xs text-gray-400">Open + Closed deals</div>
                            </div>

                            {/* Weighted Deal Amount */}
                            <div className="flex-1 p-6 text-center">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">WEIGHTED DEAL AMOUNT</div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">$0.00</div>
                                <div className="text-xs text-gray-400">To be determined</div>
                            </div>

                            {/* Open Deal Amount */}
                            <div className="flex-1 p-6 text-center">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">OPEN DEAL AMOUNT</div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(revenueMetrics.openDealAmount)}</div>
                                <div className="text-xs text-gray-400">Potential + actual open deals</div>
                            </div>

                            {/* Closed Deal Amount */}
                            <div className="flex-1 p-6 text-center">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">CLOSED DEAL AMOUNT</div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(revenueMetrics.closedDealAmount)}</div>
                                <div className="text-xs text-gray-400">Closed deals with sale values</div>
                            </div>

                            {/* New Deal Amount */}
                            <div className="flex-1 p-6 text-center">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">NEW DEAL AMOUNT</div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(revenueMetrics.newDealAmount)}</div>
                                <div className="text-xs text-gray-400">Deals with no outcome yet</div>
                            </div>

                            {/* Average Deal Age */}
                            <div className="flex-1 p-6 text-center">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">AVERAGE DEAL AGE</div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {(() => {
                                        const appointmentsWithDates = filteredCrmLeads
                                            .filter(lead => lead.appointment?.createdAt && lead.appointment.createdAt !== null)
                                            .map(lead => {
                                                const appointmentDate = new Date(lead.appointment!.createdAt!);
                                                const now = new Date();
                                                return (now.getTime() - appointmentDate.getTime()) / (1000 * 60 * 60 * 24); // Days
                                            });

                                        if (appointmentsWithDates.length === 0) return '0.0';
                                        const avgAge = appointmentsWithDates.reduce((sum: number, age: number) => sum + age, 0) / appointmentsWithDates.length;
                                        return avgAge.toFixed(1);
                                    })()} days
                                </div>
                                <div className="text-xs text-gray-400">Time since appointment created</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Actions */}
            <div className="flex-shrink-0 bg-white px-6 py-4">
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

            {/* Lead Table - Takes remaining space */}
            <div className="flex-1 flex flex-col min-h-0 bg-white overflow-hidden">
                <div className="flex-shrink-0 px-6 py-4">
                    {/* Table header content can go here if needed */}
                </div>
                <div className="flex-1 overflow-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 sticky top-0 z-10">
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
                                const nameAnswer = lead.answers.find((a: Answer) =>
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
                                                    // Determine the lead stage based on appointment status
                                                    // Priority: outcome-based statuses > appointment existence > completed quiz
                                                    const actualStatus = lead.status && lead.status !== "Stage" ? lead.status :
                                                        (lead.appointment?.outcome === 'converted' ? 'Purchased (Call)' :
                                                            lead.appointment?.outcome === 'not_interested' ? 'Not Interested' :
                                                                lead.appointment?.outcome === 'needs_follow_up' ? 'Needs Follow Up' :
                                                                    lead.appointment ? 'Booked' : 'Completed');

                                                    return (
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${actualStatus === "Purchased (Call)"
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
                                                {lead.completedAt
                                                    ? new Date(lead.completedAt).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })
                                                    : lead.createdAt
                                                        ? new Date(lead.createdAt).toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        })
                                                        : 'N/A'}
                                            </td>
                                        )}
                                        {crmVisibleColumns.owner && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                                                {lead.closerName || lead.appointment?.closer?.name || 'Unassigned'}
                                            </td>
                                        )}
                                        {crmVisibleColumns.amount && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {(() => {
                                                    const saleValue = lead.appointment?.saleValue
                                                        ? parseFloat(lead.appointment.saleValue.toString())
                                                        : (lead.saleValue ? parseFloat(lead.saleValue.toString()) : null);
                                                    return saleValue ? `$${saleValue.toFixed(2)}` : '--';
                                                })()}
                                            </td>
                                        )}
                                        {crmVisibleColumns.source && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {lead.source || 'Website'}
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

                <div className="flex-shrink-0 border-t border-gray-100 bg-white">
                    <PaginationControls
                        currentPage={crmCurrentPage}
                        totalPages={totalCrmPages}
                        onPageChange={handleCrmPageChange}
                        itemsPerPage={crmItemsPerPage}
                        onItemsPerPageChange={handleCrmItemsPerPageChange}
                        totalItems={filteredCrmLeads.length}
                        showingFrom={(crmCurrentPage - 1) * crmItemsPerPage + 1}
                        showingTo={Math.min(crmCurrentPage * crmItemsPerPage, filteredCrmLeads.length)}
                    />
                </div>
            </div>

            {/* Lead Details Modal */}
            {crmShowLeadModal && crmSelectedLead && (
                <LeadDetailView
                    sessionId={crmSelectedLead.id}
                    onClose={() => setCrmShowLeadModal(false)}
                    userRole="admin"
                    leadData={crmSelectedLead}
                />
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
    );
}
