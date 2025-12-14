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
  FILTER_OPTIONS,
  OUTCOME_OPTIONS
} from '../utils';

export default function CloserDatabase() {
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
  } = useCloserAppointments('/api/closer/all-appointments');

  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Fetch appointments when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated, fetchAppointments]);

  useEffect(() => {
    // Filter appointments based on search and outcome filter
    let filtered = [...appointments];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(apt =>
        apt.customerName.toLowerCase().includes(query) ||
        apt.customerEmail.toLowerCase().includes(query) ||
        (apt.customerPhone && apt.customerPhone.toLowerCase().includes(query))
      );
    }

    // Apply outcome filter (database only shows contacted leads, so no need for uncontacted filter)
    if (outcomeFilter !== 'all' && outcomeFilter !== 'uncontacted') {
      filtered = filtered.filter(apt => apt.outcome === outcomeFilter);
    }

    setFilteredAppointments(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [appointments, searchQuery, outcomeFilter]);

  // Combine loading and error states
  const isLoading = isAuthLoading || isAppointmentsLoading;
  const displayError = authError || appointmentsError;

  // Pagination Logic
  // Pagination Logic
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  // Wrapper to handle stats refresh after outcome update
  const handleSaveOutcome = async () => {
    const success = await handleUpdateOutcome();
    if (success) {
      fetchAppointments();
      refetchStats();
      refetchTaskCount();
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex overflow-hidden">
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
              <div>
                <h2 className="text-xl font-bold text-gray-900">Lead Database</h2>
                <p className="text-sm text-gray-600 mt-1">View and manage all contacted leads for follow-ups and conversions</p>
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





                {/* Appointments Table - Takes remaining space */}
                <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-b border-gray-100 gap-4">
                    <div className="relative w-full sm:w-80">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search name or description"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out"
                      />
                    </div>
                    <div className="flex items-center space-x-3 w-full sm:w-auto relative">
                      <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center justify-between w-full sm:w-56 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 shadow-sm"
                      >
                        <span className="truncate">
                          {FILTER_OPTIONS.find(o => o.value === outcomeFilter)?.label || 'All Contacted Leads'}
                        </span>
                        <svg className={`ml-2 h-5 w-5 text-gray-500 transition-transform duration-200 ${isFilterOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {isFilterOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsFilterOpen(false)}
                          ></div>
                          <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-lg shadow-xl z-20 border border-gray-100 py-1 max-h-96 overflow-y-auto animate-fadeIn">
                            {FILTER_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setOutcomeFilter(option.value);
                                  setIsFilterOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 flex items-center justify-between
                                  ${outcomeFilter === option.value ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-900'}
                                `}
                              >
                                <span>{option.label}</span>
                                {outcomeFilter === option.value && (
                                  <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto">
                    {filteredAppointments.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
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
                              Status
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
                          {paginatedAppointments.map((appointment) => (
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
                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getOutcomeColor(appointment.outcome)}`}>
                                  {getOutcomeDisplayName(appointment.outcome)}
                                </span>
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
                      totalItems={filteredAppointments.length}
                      showingFrom={(currentPage - 1) * itemsPerPage + 1}
                      showingTo={Math.min(currentPage * itemsPerPage, filteredAppointments.length)}
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
                      onClick={handleSaveOutcome}
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

