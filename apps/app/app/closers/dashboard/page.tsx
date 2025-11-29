"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CloserSidebar from '../components/CloserSidebar';
import LeadDetailView from '../../components/shared/LeadDetailView';
import ContentLoader from '../components/ContentLoader';

interface Closer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalCalls: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
}

interface Appointment {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  scheduledAt: string;
  duration: number;
  status: string;
  outcome: string | null;
  notes: string | null;
  saleValue: number | null;
  commissionAmount: number | null;
  affiliateCode: string | null;
  source?: string; // Lead source (affiliate name or "Website")
  recordingLinkConverted?: string | null;
  recordingLinkNotInterested?: string | null;
  recordingLinkNeedsFollowUp?: string | null;
  recordingLinkWrongNumber?: string | null;
  recordingLinkNoAnswer?: string | null;
  recordingLinkCallbackRequested?: string | null;
  recordingLinkRescheduled?: string | null;
}

export default function CloserDashboard() {
  const [closer, setCloser] = useState<Closer | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTaskCount, setActiveTaskCount] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [outcomeData, setOutcomeData] = useState({
    outcome: '',
    notes: '',
    saleValue: '',
    recordingLink: ''
  });
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null); // State to control the overlay
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('closerToken');

    if (!token) {
      router.push('/closers/login');
      return;
    }

    // Fetch all data in parallel for faster loading
    Promise.all([
      fetchCloserStats(token),
      fetchAppointments(token),
      fetchActiveTaskCount(token)
    ]);
  }, [router]);

  const fetchCloserStats = async (token: string) => {
    try {
      const response = await fetch('/api/closer/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCloser(data.closer);
        console.log('📊 Fresh closer stats loaded:', data.closer);
      } else {
        setError('Failed to load closer stats');
      }
    } catch (error) {
      console.error('Error fetching closer stats:', error);
      setError('Network error loading closer stats');
    }
  };

  const fetchAppointments = async (token: string) => {
    try {
      const response = await fetch('/api/closer/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      } else {
        setError('Failed to load appointments');
      }
    } catch (error) {
      setError('Network error loading appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveTaskCount = async (token: string) => {
    try {
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const tasks = await response.json();
        // Handle both response formats: array directly or { tasks: [...] }
        const tasksArray = Array.isArray(tasks) ? tasks : (tasks.tasks || []);
        // Count all non-completed tasks (exclude cancelled)
        const activeCount = tasksArray.filter((t: any) =>
          (t.status === 'pending' || t.status === 'in_progress')
        ).length;
        setActiveTaskCount(activeCount);
      }
    } catch (error) {
      console.error('Error fetching task count:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('closerToken');
    localStorage.removeItem('closerData');
    router.push('/closers/login');
  };

  const handleUpdateOutcome = async () => {
    if (!selectedAppointment || !outcomeData.outcome) return;

    const token = localStorage.getItem('closerToken');
    if (!token) return;

    try {
      const response = await fetch(`/api/closer/appointments/${selectedAppointment.id}/outcome`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          outcome: outcomeData.outcome,
          notes: outcomeData.notes,
          saleValue: outcomeData.saleValue ? parseFloat(outcomeData.saleValue) : null,
          recordingLink: outcomeData.recordingLink || null,
        }),
      });

      if (response.ok) {
        // Refresh both appointments and closer stats
        fetchAppointments(token);
        fetchCloserStats(token);
        setShowOutcomeModal(false);
        setSelectedAppointment(null);
        setOutcomeData({ outcome: '', notes: '', saleValue: '', recordingLink: '' });
      } else {
        setError('Failed to update appointment outcome');
      }
    } catch (error) {
      setError('Network error updating outcome');
    }
  };

  const openOutcomeModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);

    // Get the existing recording link based on the outcome
    const existingRecordingLink = getRecordingLink(appointment);

    setOutcomeData({
      outcome: appointment.outcome || '',
      notes: appointment.notes || '',
      saleValue: appointment.saleValue?.toString() || '',
      recordingLink: existingRecordingLink || ''
    });
    setShowOutcomeModal(true);
  };

  const viewLeadDetails = async (appointment: Appointment) => {
    // This function now just needs to find the lead ID and set it in state
    try {
      const token = localStorage.getItem('closerToken');
      const response = await fetch(`/api/leads/by-email?email=${encodeURIComponent(appointment.customerEmail)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.lead && data.lead.id) {
          setSelectedLeadId(data.lead.id); // Set the lead ID to show the overlay
        } else {
          setError('Could not find a valid session for this lead.');
        }
      } else {
        setError('Failed to retrieve lead session details.');
      }
    } catch (e) {
      setError('Error preparing to view lead details.');
    }
  };

  const getDisplayedAppointments = () => {
    // Sort appointments by scheduled date (newest first)
    const sortedAppointments = [...appointments].sort((a, b) =>
      new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );

    // Return latest 6 if not showing all, otherwise return all
    return showAllAppointments ? sortedAppointments : sortedAppointments.slice(0, 6);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRecordingLink = (appointment: Appointment) => {
    if (!appointment.outcome) return null;

    switch (appointment.outcome) {
      case 'converted':
        return appointment.recordingLinkConverted;
      case 'not_interested':
        return appointment.recordingLinkNotInterested;
      case 'needs_follow_up':
        return appointment.recordingLinkNeedsFollowUp;
      case 'wrong_number':
        return appointment.recordingLinkWrongNumber;
      case 'no_answer':
        return appointment.recordingLinkNoAnswer;
      case 'callback_requested':
        return appointment.recordingLinkCallbackRequested;
      case 'rescheduled':
        return appointment.recordingLinkRescheduled;
      default:
        return null;
    }
  };

  const getOutcomeColor = (outcome: string | null) => {
    switch (outcome) {
      case 'converted': return 'bg-green-100 text-green-800';
      case 'not_interested': return 'bg-red-100 text-red-800';
      case 'needs_follow_up': return 'bg-yellow-100 text-yellow-800';
      case 'callback_requested': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutcomeDisplayName = (outcome: string | null) => {
    if (!outcome) return 'Booked';
    switch (outcome) {
      case 'converted': return 'Purchased (Call)';
      case 'not_interested': return 'Not Interested';
      case 'needs_follow_up': return 'Needs Follow Up';
      case 'wrong_number': return 'Wrong Number';
      case 'no_answer': return 'No Answer';
      case 'callback_requested': return 'Callback Requested';
      case 'rescheduled': return 'Rescheduled';
      default: return outcome.replace('_', ' ');
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="w-full px-4 sm:px-6 lg:px-8 py-8">

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                    {error}
                  </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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

                {/* Appointments Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Your Appointments</h3>
                        <p className="text-gray-600 mt-1">
                          {showAllAppointments ? `Showing all ${appointments.length} appointments` : `Showing latest 6 of ${appointments.length} appointments`}
                        </p>
                      </div>
                      {appointments.length > 6 && (
                        <button
                          onClick={() => setShowAllAppointments(!showAllAppointments)}
                          className="flex items-center space-x-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          <span>{showAllAppointments ? 'Show Less' : 'Show All'}</span>
                          <svg
                            className={`w-4 h-4 transition-transform ${showAllAppointments ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    {appointments.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments</h3>
                        <p className="text-gray-500">You don't have any appointments yet.</p>
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
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
                      <option value="converted">Converted</option>
                      <option value="not_interested">Not Interested</option>
                      <option value="needs_follow_up">Needs Follow Up</option>
                      <option value="wrong_number">Wrong Number</option>
                      <option value="no_answer">No Answer</option>
                      <option value="callback_requested">Callback Requested</option>
                      <option value="rescheduled">Rescheduled</option>
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
        </>
      )}
    </div>
  );
}
