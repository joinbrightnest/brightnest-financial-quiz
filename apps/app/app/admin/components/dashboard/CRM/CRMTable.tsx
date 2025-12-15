"use client";

import { Lead, Answer, VisibleColumns } from "./types";

interface CRMTableProps {
    leads: Lead[];
    visibleColumns: VisibleColumns;
    selectedLeads: Set<string>;
    onSelectAll: (checked: boolean) => void;
    onSelectLead: (leadId: string, checked: boolean) => void;
    onSort: (field: string) => void;
    onViewDetails: (lead: Lead) => void;
}

// Helper to get lead status display
const getLeadStatus = (lead: Lead): { status: string; className: string } => {
    const actualStatus = lead.status && lead.status !== "Stage" ? lead.status :
        (lead.appointment?.outcome === 'converted' ? 'Purchased (Call)' :
            lead.appointment?.outcome === 'not_interested' ? 'Not Interested' :
                lead.appointment?.outcome === 'needs_follow_up' ? 'Needs Follow Up' :
                    lead.appointment ? 'Booked' : 'Completed');

    const className = actualStatus === "Purchased (Call)"
        ? "bg-green-100 text-green-800"
        : actualStatus === "Not Interested"
            ? "bg-red-100 text-red-800"
            : actualStatus === "Needs Follow Up"
                ? "bg-yellow-100 text-yellow-800"
                : actualStatus === "Booked"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800";

    return { status: actualStatus, className };
};

// Sort icon component
const SortIcon = () => (
    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
);

export default function CRMTable({
    leads,
    visibleColumns,
    selectedLeads,
    onSelectAll,
    onSelectLead,
    onSort,
    onViewDetails
}: CRMTableProps) {
    return (
        <table className="min-w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                    {visibleColumns.checkbox && (
                        <th className="px-6 py-3 text-left">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300"
                                checked={selectedLeads.size === leads.length && leads.length > 0}
                                onChange={(e) => onSelectAll(e.target.checked)}
                            />
                        </th>
                    )}
                    {visibleColumns.name && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => onSort('name')}>
                                LEAD NAME
                                <SortIcon />
                            </div>
                        </th>
                    )}
                    {visibleColumns.stage && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => onSort('status')}>
                                STAGE
                                <SortIcon />
                            </div>
                        </th>
                    )}
                    {visibleColumns.date && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => onSort('date')}>
                                LEAD ADDED
                                <SortIcon />
                            </div>
                        </th>
                    )}
                    {visibleColumns.owner && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => onSort('owner')}>
                                DEAL OWNER
                                <SortIcon />
                            </div>
                        </th>
                    )}
                    {visibleColumns.amount && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => onSort('amount')}>
                                AMOUNT
                                <SortIcon />
                            </div>
                        </th>
                    )}
                    {visibleColumns.source && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center cursor-pointer hover:text-gray-700" onClick={() => onSort('source')}>
                                SOURCE
                                <SortIcon />
                            </div>
                        </th>
                    )}
                    {visibleColumns.actions && (
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
                {leads.map((lead) => {
                    const nameAnswer = lead.answers.find((a: Answer) =>
                        a.question?.prompt?.toLowerCase().includes('name')
                    );
                    const { status, className } = getLeadStatus(lead);
                    const saleValue = lead.appointment?.saleValue
                        ? parseFloat(lead.appointment.saleValue.toString())
                        : (lead.saleValue ? parseFloat(lead.saleValue.toString()) : null);

                    return (
                        <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                            {visibleColumns.checkbox && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300"
                                        checked={selectedLeads.has(lead.id)}
                                        onChange={(e) => onSelectLead(lead.id, e.target.checked)}
                                    />
                                </td>
                            )}
                            {visibleColumns.name && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {String(nameAnswer?.value || "N/A")}
                                </td>
                            )}
                            {visibleColumns.stage && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${className}`}>
                                        {status}
                                    </span>
                                </td>
                            )}
                            {visibleColumns.date && (
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
                            {visibleColumns.owner && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                                    {lead.closerName || lead.appointment?.closer?.name || 'Unassigned'}
                                </td>
                            )}
                            {visibleColumns.amount && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {saleValue ? `$${saleValue.toFixed(2)}` : '--'}
                                </td>
                            )}
                            {visibleColumns.source && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {lead.source || 'Website'}
                                    </span>
                                </td>
                            )}
                            {visibleColumns.actions && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                                    <button onClick={() => onViewDetails(lead)}>
                                        View Details
                                    </button>
                                </td>
                            )}
                        </tr>
                    );
                })}
                {leads.length === 0 && (
                    <tr>
                        <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                            No leads found
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}
