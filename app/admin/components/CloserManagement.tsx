"use client";

import { useState, useEffect } from 'react';

interface Closer {
  id: string;
  name: string;
  email: string;
  phone: string;
  calendlyLink: string | null;
  isActive: boolean;
  isApproved: boolean;
  totalCalls: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
  createdAt: string;
}

interface Appointment {
  id: string;
  type?: string; // 'appointment' or 'quiz_session'
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
  recordingLinkConverted?: string | null;
  recordingLinkNotInterested?: string | null;
  recordingLinkNeedsFollowUp?: string | null;
  recordingLinkWrongNumber?: string | null;
  recordingLinkNoAnswer?: string | null;
  recordingLinkCallbackRequested?: string | null;
  recordingLinkRescheduled?: string | null;
  closer: {
    id: string;
    name: string;
  } | null;
}

export default function CloserManagement() {
  const [closers, setClosers] = useState<Closer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'closers' | 'assignments' | 'performance' | 'tasks'>('closers');
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedCloser, setSelectedCloser] = useState<string>('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showCreateAppointment, setShowCreateAppointment] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    scheduledAt: '',
    duration: 30,
    affiliateCode: ''
  });
  const [editingCloserId, setEditingCloserId] = useState<string | null>(null);
  const [editingCalendlyLink, setEditingCalendlyLink] = useState('');

  useEffect(() => {
    fetchClosers();
    fetchAppointments();
  }, []);

  const fetchClosers = async () => {
    try {
      const response = await fetch('/api/admin/closers');
      if (response.ok) {
        const data = await response.json();
        setClosers(data.closers || []);
      } else {
        setError('Failed to load closers');
      }
    } catch (error) {
      setError('Network error loading closers');
    }
  };

  const fetchAppointments = async () => {
    try {
      console.log('🔍 Fetching appointments...');
      const response = await fetch('/api/admin/appointments');
      console.log('📡 Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Appointments data:', data);
        console.log('📊 Appointments array:', data.appointments);
        console.log('📊 Appointments count:', data.appointments?.length || 0);
        
        // Debug: Check unassigned appointments
        const allUnassigned = data.appointments?.filter(a => !a.closer) || [];
        const actualAppointments = allUnassigned.filter(a => a.type !== 'quiz_session');
        console.log('🔍 All unassigned (including quiz):', allUnassigned.length);
        console.log('🔍 Actual unassigned appointments:', actualAppointments.length);
        console.log('🔍 Actual appointments:', actualAppointments.map(a => ({ 
          name: a.customerName, 
          type: a.type, 
          status: a.status,
          closer: a.closer 
        })));
        
        setAppointments(data.appointments || []);
      } else {
        console.error('❌ Failed to load appointments:', response.status);
        setError('Failed to load appointments');
      }
    } catch (error) {
      console.error('❌ Network error loading appointments:', error);
      setError('Network error loading appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCloser = async (closerId: string) => {
    try {
      const response = await fetch(`/api/admin/closers/${closerId}/approve`, {
        method: 'PUT',
      });

      if (response.ok) {
        fetchClosers();
      } else {
        setError('Failed to approve closer');
      }
    } catch (error) {
      setError('Network error approving closer');
    }
  };

  const handleDeactivateCloser = async (closerId: string) => {
    if (!confirm('Are you sure you want to deactivate this closer?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/closers/${closerId}/deactivate`, {
        method: 'PUT',
      });

      if (response.ok) {
        fetchClosers();
      } else {
        setError('Failed to deactivate closer');
      }
    } catch (error) {
      setError('Network error deactivating closer');
    }
  };

  const handleDeleteCloser = async (closerId: string) => {
    const closer = closers.find(c => c.id === closerId);
    const closerName = closer?.name || 'this closer';
    
    if (!confirm(`Are you sure you want to delete ${closerName}? This action cannot be undone. All appointments will be unassigned.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/closers/${closerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchClosers();
        fetchAppointments(); // Refresh appointments to show unassigned ones
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete closer');
      }
    } catch (error) {
      setError('Network error deleting closer');
    }
  };

  const handleAssignAppointment = async () => {
    if (!selectedAppointment || !selectedCloser) return;

    try {
      const response = await fetch(`/api/admin/appointments/${selectedAppointment.id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          closerId: selectedCloser,
        }),
      });

      if (response.ok) {
        fetchAppointments();
        setShowAssignmentModal(false);
        setSelectedAppointment(null);
        setSelectedCloser('');
      } else {
        setError('Failed to assign appointment');
      }
    } catch (error) {
      setError('Network error assigning appointment');
    }
  };

  const handleCreateAppointment = async () => {
    if (!newAppointment.customerName || !newAppointment.customerEmail || !newAppointment.scheduledAt) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newAppointment,
          calendlyEventId: `manual-${Date.now()}`, // Generate unique ID
        }),
      });

      if (response.ok) {
        fetchAppointments();
        setShowCreateAppointment(false);
        setNewAppointment({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          scheduledAt: '',
          duration: 30,
          affiliateCode: ''
        });
      } else {
        setError('Failed to create appointment');
      }
    } catch (error) {
      setError('Network error creating appointment');
    }
  };


  const fetchAllTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const response = await fetch('/api/admin/tasks');
      if (response.ok) {
        const data = await response.json();
        // API returns { tasks: [...] }, extract the tasks array
        const tasksArray = data.tasks || data;
        setAllTasks(Array.isArray(tasksArray) ? tasksArray : []);
      } else {
        setError('Failed to load tasks');
        setAllTasks([]); // Reset to empty array on error
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Network error loading tasks');
      setAllTasks([]); // Reset to empty array on error
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleAutoAssignAll = async () => {
    if (!confirm('Auto-assign all unassigned appointments to available closers using round-robin distribution?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/auto-assign-appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Success! Assigned ${data.assignedCount} appointments.`);
        fetchAppointments(); // Refresh the list
      } else {
        const data = await response.json();
        alert(`Failed to auto-assign: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Network error during auto-assignment');
    }
  };

  const handleUpdateCalendlyLink = async (closerId: string) => {
    try {
      const response = await fetch(`/api/admin/closers/${closerId}/calendly-link`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calendlyLink: editingCalendlyLink,
        }),
      });

      if (response.ok) {
        fetchClosers();
        setEditingCloserId(null);
        setEditingCalendlyLink('');
      } else {
        setError('Failed to update Calendly link');
      }
    } catch (error) {
      setError('Network error updating Calendly link');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchAppointments();
        alert('Appointment deleted successfully');
      } else if (response.status === 404) {
        // Appointment already deleted, just refresh the list
        console.log('Appointment already deleted, refreshing list');
        fetchAppointments();
        alert('Appointment was already deleted');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError('Network error deleting appointment');
    }
  };

  const openAssignmentModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedCloser(appointment.closer?.id || '');
    setShowAssignmentModal(true);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'no_show': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Closer Management</h2>
          <p className="text-gray-600">Manage closers and appointment assignments</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateAppointment(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Create Appointment
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('closers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'closers'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Closers ({closers.length})
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assignments'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Unassigned ({appointments.filter(a => !a.closer && a.type !== 'quiz_session').length})
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'performance'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Performance Analytics
          </button>
          <button
            onClick={() => {
              setActiveTab('tasks');
              fetchAllTasks();
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tasks
          </button>
        </nav>
      </div>

      {/* Closers Tab */}
      {activeTab === 'closers' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Closer Accounts</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage closer accounts and permissions</p>
          </div>
          <div className="border-t border-gray-200">
            {closers.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No closers</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding your first closer.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {closers.map((closer) => (
                  <div key={closer.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      {/* Closer Info */}
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {closer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{closer.name}</h3>
                          <p className="text-sm text-slate-600">{closer.email}</p>
                          {closer.phone && (
                            <p className="text-sm text-slate-500">{closer.phone}</p>
                          )}
                          
                          {/* Status Badges */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              closer.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {closer.isApproved ? 'Approved' : 'Pending'}
                            </span>
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              closer.isActive ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {closer.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!closer.isApproved && (
                          <button
                            onClick={() => handleApproveCloser(closer.id)}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDeactivateCloser(closer.id)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            closer.isActive 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {closer.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteCloser(closer.id)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                          title="Delete closer permanently"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Calendly Link Section */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Calendly Link</label>
                      {editingCloserId === closer.id ? (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={editingCalendlyLink}
                            onChange={(e) => setEditingCalendlyLink(e.target.value)}
                            placeholder="https://calendly.com/username"
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleUpdateCalendlyLink(closer.id)}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingCloserId(null);
                              setEditingCalendlyLink('');
                            }}
                            className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div>
                          {closer.calendlyLink ? (
                            <div className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                              <a
                                href={closer.calendlyLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium break-all"
                              >
                                {closer.calendlyLink}
                              </a>
                              <button
                                onClick={() => {
                                  setEditingCloserId(closer.id);
                                  setEditingCalendlyLink(closer.calendlyLink || '');
                                }}
                                className="ml-4 text-slate-600 hover:text-slate-900 text-sm font-medium"
                              >
                                Edit
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingCloserId(closer.id);
                                setEditingCalendlyLink('');
                              }}
                              className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200"
                            >
                              + Add Calendly Link
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}


      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Unassigned Appointments</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Assign appointments to available closers</p>
            </div>
            {appointments.filter(a => !a.closer && a.type !== 'quiz_session').length > 0 && (
              <button
                onClick={handleAutoAssignAll}
                className="ml-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                🔄 Auto-Assign All
              </button>
            )}
          </div>
          <div className="border-t border-gray-200">
            {appointments.filter(a => !a.closer && a.type !== 'quiz_session').length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">All appointments assigned</h3>
                <p className="mt-1 text-sm text-gray-500">Great job! All appointments have been assigned to closers.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Scheduled
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.filter(a => !a.closer && a.type !== 'quiz_session').map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{appointment.customerName}</div>
                            <div className="text-sm text-gray-500">{appointment.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(appointment.scheduledAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => openAssignmentModal(appointment)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Assign Closer
                            </button>
                            <button
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Assign Closer - {selectedAppointment.customerName}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Closer</label>
                  <select
                    value={selectedCloser}
                    onChange={(e) => setSelectedCloser(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Choose a closer</option>
                    {closers.filter(c => c.isActive && c.isApproved).map((closer) => (
                      <option key={closer.id} value={closer.id}>
                        {closer.name} ({closer.totalCalls} calls, {(closer.conversionRate * 100).toFixed(1)}% rate)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignAppointment}
                  disabled={!selectedCloser}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign Closer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Appointment Modal */}
      {showCreateAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New Appointment
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Name *</label>
                  <input
                    type="text"
                    value={newAppointment.customerName}
                    onChange={(e) => setNewAppointment({ ...newAppointment, customerName: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder-gray-500"
                    placeholder="Enter customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Email *</label>
                  <input
                    type="email"
                    value={newAppointment.customerEmail}
                    onChange={(e) => setNewAppointment({ ...newAppointment, customerEmail: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder-gray-500"
                    placeholder="Enter customer email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Phone</label>
                  <input
                    type="tel"
                    value={newAppointment.customerPhone}
                    onChange={(e) => setNewAppointment({ ...newAppointment, customerPhone: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder-gray-500"
                    placeholder="Enter customer phone (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Scheduled Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={newAppointment.scheduledAt}
                    onChange={(e) => setNewAppointment({ ...newAppointment, scheduledAt: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newAppointment.duration}
                    onChange={(e) => setNewAppointment({ ...newAppointment, duration: parseInt(e.target.value) || 30 })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    min="15"
                    max="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Affiliate Code</label>
                  <input
                    type="text"
                    value={newAppointment.affiliateCode}
                    onChange={(e) => setNewAppointment({ ...newAppointment, affiliateCode: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder-gray-500"
                    placeholder="Enter affiliate code (optional)"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateAppointment(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAppointment}
                  disabled={!newAppointment.customerName || !newAppointment.customerEmail || !newAppointment.scheduledAt}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Analytics Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Performance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Total Conversions</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {appointments.filter(a => a.outcome === 'converted').length}
                  </p>
                </div>
                <div className="p-3 bg-green-200 rounded-lg">
                  <svg className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">Not Interested</p>
                  <p className="text-3xl font-bold text-red-900 mt-1">
                    {appointments.filter(a => a.outcome === 'not_interested').length}
                  </p>
                </div>
                <div className="p-3 bg-red-200 rounded-lg">
                  <svg className="h-6 w-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-yellow-700 uppercase tracking-wide">Follow-ups Needed</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">
                    {appointments.filter(a => a.outcome === 'needs_follow_up').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-200 rounded-lg">
                  <svg className="h-6 w-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Revenue</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">
                    ${appointments.filter(a => a.outcome === 'converted').reduce((sum, a) => sum + (Number(a.saleValue) || 0), 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-blue-200 rounded-lg">
                  <svg className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Closer Performance Table */}
          <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-xl font-bold text-slate-900">Closer Performance</h3>
              <p className="mt-1 text-sm text-slate-600">Detailed performance metrics for each closer</p>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Closer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Calls
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conversions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conversion Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Sale Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {closers.map((closer) => {
                      // Use closer object instead of closerId to match Call Outcomes logic
                      const closerAppointments = appointments.filter(a => a.closer?.id === closer.id);
                      const conversions = closerAppointments.filter(a => a.outcome === 'converted');
                      const totalRevenue = conversions.reduce((sum, a) => sum + (Number(a.saleValue) || 0), 0);
                      const conversionRate = closerAppointments.length > 0 ? (conversions.length / closerAppointments.length) * 100 : 0;
                      const avgSaleValue = conversions.length > 0 ? totalRevenue / conversions.length : 0;

                      return (
                        <tr key={closer.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{closer.name}</div>
                            <div className="text-sm text-gray-500">{closer.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {closerAppointments.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {conversions.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {conversionRate.toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${totalRevenue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${avgSaleValue.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Detailed Call Outcomes */}
          <div className="bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-xl font-bold text-slate-900">Call Outcomes Breakdown</h3>
              <p className="mt-1 text-sm text-slate-600">Detailed breakdown of all call outcomes with notes and recordings</p>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Closer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Outcome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sale Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recording
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.filter(a => a.outcome).map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{appointment.customerName}</div>
                            <div className="text-sm text-gray-500">{appointment.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appointment.closer ? appointment.closer.name : 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOutcomeColor(appointment.outcome)}`}>
                            {appointment.outcome?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appointment.saleValue ? `$${Number(appointment.saleValue).toFixed(2)}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          {appointment.notes ? (
                            <div className="truncate" title={appointment.notes}>
                              {appointment.notes}
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getRecordingLink(appointment) ? (
                            <a
                              href={getRecordingLink(appointment) || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-900 underline"
                            >
                              View Recording
                            </a>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Tasks Header with Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">All Tasks</h3>
                <p className="text-sm text-gray-600 mt-1">Track and manage tasks assigned by all closers</p>
              </div>
              <button
                onClick={() => fetchAllTasks()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Refresh
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setTaskFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  taskFilter === 'all'
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                All Tasks ({allTasks?.length || 0})
              </button>
              <button
                onClick={() => setTaskFilter('pending')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  taskFilter === 'pending'
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Pending ({allTasks?.filter(t => t.status === 'pending').length || 0})
              </button>
              <button
                onClick={() => setTaskFilter('in_progress')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  taskFilter === 'in_progress'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                In Progress ({allTasks?.filter(t => t.status === 'in_progress').length || 0})
              </button>
              <button
                onClick={() => setTaskFilter('completed')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  taskFilter === 'completed'
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Completed ({allTasks?.filter(t => t.status === 'completed').length || 0})
              </button>
            </div>
          </div>

          {/* Tasks List */}
          {isLoadingTasks ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600 mt-2">Loading tasks...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {(allTasks || [])
                .filter(task => taskFilter === 'all' || task.status === taskFilter)
                .length === 0 ? (
                <div className="text-center py-12 px-6">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
                  <p className="text-gray-600">
                    {taskFilter === 'all' 
                      ? 'No tasks have been created yet'
                      : `No ${taskFilter.replace('_', ' ')} tasks`
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {(allTasks || [])
                    .filter(task => taskFilter === 'all' || task.status === taskFilter)
                    .map((task) => (
                      <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Task Header */}
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-base font-semibold text-gray-900">{task.title}</h4>
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                                  task.priority === 'urgent'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : task.priority === 'high'
                                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                                    : task.priority === 'medium'
                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    : 'bg-gray-50 text-gray-700 border-gray-200'
                                }`}
                              >
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                                  task.status === 'completed'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : task.status === 'in_progress'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : task.status === 'cancelled'
                                    ? 'bg-gray-50 text-gray-700 border-gray-200'
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                }`}
                              >
                                {task.status === 'in_progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                              </span>
                            </div>

                            {/* Task Description */}
                            {task.description && (
                              <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                            )}

                            {/* Task Meta Information */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              {task.closer && (
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span className="font-medium text-gray-700">{task.closer.name}</span>
                                  <span className="ml-1">(Deal Owner)</span>
                                </div>
                              )}
                              {task.leadEmail && (
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  <span>{task.leadEmail}</span>
                                </div>
                              )}
                              {task.dueDate && (
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
