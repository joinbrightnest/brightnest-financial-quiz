"use client";

import { LeadData } from './types';
import { getLeadName, getLeadEmail, getStatusColor } from './utils';

interface LeadSidebarProps {
    leadData: LeadData;
}

export default function LeadSidebar({ leadData }: LeadSidebarProps) {
    const leadName = getLeadName(leadData);
    const leadEmail = getLeadEmail(leadData);

    // Determine status with fallback logic
    const actualStatus = leadData.status && leadData.status !== "Stage"
        ? leadData.status
        : (leadData.appointment?.outcome === 'converted' ? 'Purchased (Call)' :
            leadData.appointment?.outcome === 'not_interested' ? 'Not Interested' :
                leadData.appointment?.outcome === 'needs_follow_up' ? 'Needs Follow Up' :
                    leadData.appointment?.outcome ? 'Booked' : 'Completed');

    return (
        <div className="w-96 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0">
            <div className="p-6">
                <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                        <div className="flex items-center mb-4">
                            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <h3 className="text-sm font-semibold text-slate-900">Personal Information</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wide">Full Name</label>
                                <p className="text-sm text-slate-900 mt-1 font-medium">{leadName}</p>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wide">Email Address</label>
                                <p className="text-sm text-slate-900 mt-1">{leadEmail}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                        <div className="flex items-center mb-4">
                            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <h3 className="text-sm font-semibold text-slate-900">Deal Information</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wide">Stage</label>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(actualStatus)}`}>
                                        {actualStatus || '--'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wide">Deal Owner</label>
                                <p className="text-sm text-slate-900 mt-1">
                                    {leadData.closerName || leadData.appointment?.closer?.name || leadData.closer?.name || 'Unassigned'}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wide">Lead Added</label>
                                <p className="text-sm text-slate-900 mt-1">
                                    {leadData.completedAt ? new Date(leadData.completedAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    }) : '--'}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wide">Deal Closed</label>
                                <p className="text-sm text-slate-900 mt-1">
                                    {leadData.dealClosedAt ? new Date(leadData.dealClosedAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    }) : '--'}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wide">Deal Amount</label>
                                <p className="text-sm text-slate-900 mt-1">
                                    {leadData.appointment?.outcome === 'converted' && leadData.appointment?.saleValue
                                        ? `$${Number(leadData.appointment.saleValue).toFixed(2)}`
                                        : '--'}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wide">Lead Source</label>
                                <div className="mt-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        {leadData.source || 'Website'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 uppercase tracking-wide">Quiz Type</label>
                                <p className="text-sm text-slate-900 mt-1">{leadData.quizType || '--'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
