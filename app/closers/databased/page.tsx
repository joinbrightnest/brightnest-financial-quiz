"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CloserSidebar from '../components/CloserSidebar';
import LeadDetailView from '../components/LeadDetailView';

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

export default function CloserDatabase() {
  const [closer, setCloser] = useState<Closer | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTaskCount, setActiveTaskCount] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [outcomeData, setOutcomeData] = useState({
    outcome: '',
    notes: '',
    saleValue: '',
    recordingLink: ''
  });
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('closerToken');
    
    if (!token) {
      router.push('/closers/login');
      return;
    }

    fetchCloserStats(token);
    fetchAllAppointments(token);
    fetchActiveTaskCount(token);
  }, [router]);

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
  }, [appointments, searchQuery, outcomeFilter]);

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
      } else {
        setError('Failed to load closer stats');
      }
    } catch (error) {
      console.error('Error fetching closer stats:', error);
      setError('Network error loading closer stats');
    }
  };

  const fetchAllAppointments = async (token: string) => {
    try {
      const response = await fetch('/api/closer/all-appointments', {
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
      console.error('Error fetching appointments:', error);
      setError('Network error loading appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveTaskCount = async (token: string) => {
    try {
      const response = await fetch('/api/closer/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const tasks = await response.json();
        const tasksArray = Array.isArray(tasks) ? tasks : (tasks.tasks || []);
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
        fetchAllAppointments(token);
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
    try {
      const token = localStorage.getItem('closerToken');
      const response = await fetch(`/api/leads/by-email?email=${encodeURIComponent(appointment.customerEmail)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.lead && data.lead.id) {
          setSelectedLeadId(data.lead.id);
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
      case 'wrong_number': return 'bg-gray-100 text-gray-800';
      case 'no_answer': return 'bg-gray-100 text-gray-800';
      case 'rescheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getOutcomeDisplayName = (outcome: string | null) => {
    // This should never be null in the database view, but handle it just in case
    if (!outcome) return 'Unknown';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!closer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access your database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {selectedLeadId && (
        <LeadDetailView 
          sessionId={selectedLeadId} 
          onClose={() => setSelectedLeadId(null)} 
        />
      )}

      {/* Left Sidebar */}
      <CloserSidebar closer={closer} onLogout={handleLogout} activeTaskCount={activeTaskCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Lead Database</h2>
            <p className="text-sm text-gray-600 mt-1">View and manage all contacted leads for follow-ups and conversions</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              >
                <option value="all">All Contacted Leads</option>
                <option value="converted">Purchased</option>
                <option value="not_interested">Not Interested</option>
                <option value="needs_follow_up">Needs Follow Up</option>
                <option value="callback_requested">Callback Requested</option>
                <option value="no_answer">No Answer</option>
                <option value="wrong_number">Wrong Number</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAppointments.length} of {appointments.length} leads
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Contacted Leads</h3>
          </div>
          <div className="overflow-x-auto">
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
                  {filteredAppointments.map((appointment) => (
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
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          appointment.source === 'Website' 
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
    </div>
  );
}

