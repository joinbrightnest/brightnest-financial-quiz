"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CloserSidebar from '../components/CloserSidebar';
import LeadDetailView from '@/components/shared/LeadDetailView';
import ContentLoader from '../components/ContentLoader';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { Appointment } from '../types';
import { useCloserAuth, useActiveTaskCount, useCloserAppointments } from '../hooks';
import {
  getOutcomeColor,
  getOutcomeDisplayName,
  formatDate,
  OUTCOME_OPTIONS
} from '../utils';

export default function CloserDashboard() {
  const { closer, isLoading: isAuthLoading, error: authError, isAuthenticated, handleLogout, refetchStats } = useCloserAuth();
  const { activeTaskCount, refetch: refetchTaskCount } = useActiveTaskCount();

  const {
    appointments,
    isLoading: isAppointmentsLoading,
    error: appointmentsError,
    fetchAppointments,
    selectedAppointment,
    showOutcomeModal,
    setShowOutcomeModal,
    outcomeData,
    setOutcomeData,
    openOutcomeModal,
    handleUpdateOutcome,
    selectedLeadId,
    setSelectedLeadId,
    viewLeadDetails
  } = useCloserAppointments('/api/closer/appointments');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated, fetchAppointments]);

  // Combine error states
  const displayError = authError || appointmentsError;
  const isLoading = isAuthLoading || isAppointmentsLoading;

  // Wrapper to handle stats refresh after outcome update
  const handleSaveOutcome = async () => {
    const success = await handleUpdateOutcome();
    if (success) {
      fetchAppointments();
      refetchStats();
      refetchTaskCount();
    }
  };

  const getDisplayedAppointments = () => {
    // Sort appointments by scheduled date (newest first)
    const sortedAppointments = [...appointments].sort((a, b) =>
      new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );

    // Always use pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAppointments.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(appointments.length / itemsPerPage);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex overflow-hidden">
      {/* If a lead is selected, render the detail view overlay */}
      {selectedLeadId && (
        <LeadDetailView
          sessionId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          userRole="closer"
        />
      )}

      {/* Left Sidebar - Always visible */}
      <CloserSidebar closer={closer} onLogout={handleLogout} activeTaskCount={activeTaskCount} />

      {/* Show loading or content */}
      {isLoading || !closer ? (
        <ContentLoader />
      ) : (
        <>
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top Header Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage your appointments and track your performance</p>
                </div>
              </div>
            </div>

            {/* Scrollable Content - Changed to flex column for fixed layout */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 flex flex-col min-h-0 w-full px-4 sm:px-6 lg:px-8 py-8">

                {displayError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                    {displayError}
                  </div>
                )}

                {/* Stats Cards - Fixed height */}
                <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Calls</p>
                        <p className="text-2xl font-bold text-gray-900">{closer.totalCalls}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Conversions</p>
                        <p className="text-2xl font-bold text-gray-900">{closer.totalConversions}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Conversion Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{typeof closer.conversionRate === 'number' ? closer.conversionRate.toFixed(1) : '0.0'}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">${typeof closer.totalRevenue === 'number' ? closer.totalRevenue.toFixed(2) : '0.00'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointments Table - Takes remaining space */}
                <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex-shrink-0 px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Your Appointments</h3>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto">
                    {appointments.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments</h3>
                        <p className="text-gray-400">You haven&apos;t completed any tasks yet.</p>
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Scheduled
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Lead Source
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Stage
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Sale Value
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Actions
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Details
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {getDisplayedAppointments().map((appointment) => (
                            <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">{appointment.customerName}</div>
                                  <div className="text-sm text-gray-500">{appointment.customerEmail}</div>
                                  {appointment.customerPhone && (
                                    <div className="text-sm text-gray-500">{appointment.customerPhone}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(appointment.scheduledAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${appointment.source === 'Website'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-purple-100 text-purple-800'
                                  }`}>
                                  {appointment.source || 'Website'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {appointment.outcome ? (
                                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getOutcomeColor(appointment.outcome)}`}>
                                    {getOutcomeDisplayName(appointment.outcome)}
                                  </span>
                                ) : appointment.status === 'scheduled' || appointment.status === 'confirmed' ? (
                                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    Booked
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-500">Not set</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                {appointment.saleValue ? `$${Number(appointment.saleValue).toFixed(2)}` : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => openOutcomeModal(appointment)}
                                  className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                                >
                                  Update Status
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => viewLeadDetails(appointment)}
                                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div className="flex-shrink-0 border-t border-gray-100 bg-white">
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      itemsPerPage={itemsPerPage}
                      onItemsPerPageChange={(newSize) => {
                        setItemsPerPage(newSize);
                        setCurrentPage(1);
                      }}
                      totalItems={appointments.length}
                      showingFrom={(currentPage - 1) * itemsPerPage + 1}
                      showingTo={Math.min(currentPage * itemsPerPage, appointments.length)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Outcome Modal */}
            {showOutcomeModal && selectedAppointment && (
              <div className="fixed inset-0 bg-black/10 backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-white/20 animate-slideUp">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">
                      Update Call Status
                    </h3>
                    <p className="text-gray-600 mt-1">{selectedAppointment.customerName}</p>
                  </div>

                  <div className="px-6 py-6 space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                      <select
                        value={outcomeData.outcome}
                        onChange={(e) => setOutcomeData({ ...outcomeData, outcome: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-900"
                        required
                      >
                        <option value="">Select outcome</option>
                        {OUTCOME_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Value ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={outcomeData.saleValue}
                        onChange={(e) => setOutcomeData({ ...outcomeData, saleValue: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-900 placeholder-gray-400"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                      <textarea
                        value={outcomeData.notes}
                        onChange={(e) => setOutcomeData({ ...outcomeData, notes: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none text-gray-900 placeholder-gray-400"
                        placeholder="Add any notes about the call..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Recording Link</label>
                      <input
                        type="url"
                        value={outcomeData.recordingLink}
                        onChange={(e) => setOutcomeData({ ...outcomeData, recordingLink: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-900 placeholder-gray-400"
                        placeholder="https://example.com/recording-link"
                      />
                      <p className="mt-2 text-xs text-gray-500">Optional: Add a link to the call recording for review</p>
                    </div>
                  </div>

                  <div className="px-6 py-5 border-t border-gray-100 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowOutcomeModal(false)}
                      className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateOutcome}
                      disabled={!outcomeData.outcome}
                      className="px-6 py-3 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            )}


          </div>
        </>
      )}
    </div>
  );
}
