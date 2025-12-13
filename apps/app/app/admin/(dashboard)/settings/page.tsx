"use client";

import { useState, useEffect } from "react";
import ErrorBoundary from '../../components/ErrorBoundary';

interface CommissionReleaseStatus {
    readyForRelease?: number;
    totalHeld?: number;
    totalAvailable?: number;
}

export default function SettingsPage() {
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
    const [commissionReleaseStatus, setCommissionReleaseStatus] = useState<CommissionReleaseStatus | null>(null);
    const [isProcessingReleases, setIsProcessingReleases] = useState(false);

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

    useEffect(() => {
        fetchSettings();
        fetchCommissionReleaseStatus();
    }, []);

    const updateQualificationThreshold = async (newThreshold: number) => {
        setIsUpdatingThreshold(true);
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qualificationThreshold: newThreshold }),
            });
            const data = await response.json();
            if (data.success) {
                setQualificationThreshold(newThreshold);
                alert('✅ Qualification threshold updated successfully!');
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

    const updateCommissionHoldDays = async (newHoldDays: number) => {
        setIsUpdatingHoldDays(true);
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commissionHoldDays: newHoldDays }),
            });
            const data = await response.json();
            if (data.success) {
                setCommissionHoldDays(newHoldDays);
                alert('✅ Commission hold period updated successfully!');
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ minimumPayout, payoutSchedule }),
            });
            const data = await response.json();
            if (data.success) {
                alert('✅ Payout settings updated successfully!');
                await fetchSettings();
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

    const processCommissionReleases = async () => {
        setIsProcessingReleases(true);
        try {
            const response = await fetch('/api/admin/process-commission-releases', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                alert(`Successfully released ${data.releasedCount} commissions worth $${data.releasedAmount.toLocaleString()}`);
                fetchCommissionReleaseStatus();
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

    const updateCrmSettings = async () => {
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
    };

    const updateTerminalOutcomes = async () => {
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
    };

    return (
        <ErrorBoundary sectionName="Settings">
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
                                    <div className="mb-6 pb-6 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-base font-semibold text-gray-900 mb-2">Qualification Threshold</h3>
                                                <p className="text-sm text-gray-600">
                                                    Set the minimum points required for users to qualify for a consultation call.
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
                                                    Commissions are automatically released after the hold period expires.
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
                                                    onClick={updateCrmSettings}
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
                                                Configure which deal outcomes are considered &quot;terminal&quot; (closed deals).
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
                                                    onClick={updateTerminalOutcomes}
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
        </ErrorBoundary>
    );
}
