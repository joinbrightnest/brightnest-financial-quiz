"use client";

import { Lead } from "./types";

interface RevenueMetrics {
    totalRevenue: number;
    openDealAmount: number;
    closedDealAmount: number;
    newDealAmount: number;
}

interface CRMMetricsProps {
    revenueMetrics: RevenueMetrics;
    filteredLeads: Lead[];
    isLoading: boolean;
}

// Helper: Format Currency
const formatCurrency = (amount: number): string => {
    if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toFixed(2)}`;
};

// Calculate average deal age from leads with appointments
const calculateAverageDealAge = (leads: Lead[]): string => {
    const appointmentsWithDates = leads
        .filter(lead => lead.appointment?.createdAt && lead.appointment.createdAt !== null)
        .map(lead => {
            const appointmentDate = new Date(lead.appointment!.createdAt!);
            const now = new Date();
            return (now.getTime() - appointmentDate.getTime()) / (1000 * 60 * 60 * 24); // Days
        });

    if (appointmentsWithDates.length === 0) return '0.0';
    const avgAge = appointmentsWithDates.reduce((sum, age) => sum + age, 0) / appointmentsWithDates.length;
    return avgAge.toFixed(1);
};

export default function CRMMetrics({ revenueMetrics, filteredLeads, isLoading }: CRMMetricsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {/* Total Deal Amount */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all duration-300">
                <div className="flex flex-col items-center justify-center text-center h-full">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Deal Amount</p>
                    {isLoading ? (
                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                        <p className="text-2xl font-bold text-slate-900">
                            {formatCurrency(revenueMetrics.totalRevenue)}
                        </p>
                    )}
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Open + Closed deals</p>
                </div>
            </div>

            {/* Weighted Deal Amount */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all duration-300">
                <div className="flex flex-col items-center justify-center text-center h-full">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Weighted Amount</p>
                    <p className="text-2xl font-bold text-slate-900">$0.00</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">To be determined</p>
                </div>
            </div>

            {/* Open Deal Amount */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all duration-300">
                <div className="flex flex-col items-center justify-center text-center h-full">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Open Deal Amount</p>
                    {isLoading ? (
                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                        <p className="text-2xl font-bold text-slate-900">
                            {formatCurrency(revenueMetrics.openDealAmount)}
                        </p>
                    )}
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Potential + actual open</p>
                </div>
            </div>

            {/* Closed Deal Amount */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all duration-300">
                <div className="flex flex-col items-center justify-center text-center h-full">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Closed Deal Amount</p>
                    {isLoading ? (
                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                        <p className="text-2xl font-bold text-slate-900">
                            {formatCurrency(revenueMetrics.closedDealAmount)}
                        </p>
                    )}
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Closed deals with value</p>
                </div>
            </div>

            {/* New Deal Amount */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all duration-300">
                <div className="flex flex-col items-center justify-center text-center h-full">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Deal Amount</p>
                    {isLoading ? (
                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                        <p className="text-2xl font-bold text-slate-900">
                            {formatCurrency(revenueMetrics.newDealAmount)}
                        </p>
                    )}
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Deals with no outcome</p>
                </div>
            </div>

            {/* Average Deal Age */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all duration-300">
                <div className="flex flex-col items-center justify-center text-center h-full">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Average Deal Age</p>
                    <p className="text-2xl font-bold text-slate-900">
                        {calculateAverageDealAge(filteredLeads)} days
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Time since appt created</p>
                </div>
            </div>
        </div>
    );
}
