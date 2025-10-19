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
  const [activeTab, setActiveTab] = useState<'closers' | 'assignments' | 'performance'>('closers');
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
      const response = await fetch('/api/admin/appointments');
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

  const handleImportBookings = async () => {
    try {
      const response = await fetch('/api/admin/import-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        fetchAppointments();
        alert(`Successfully imported ${data.importedCount} existing bookings!`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to import bookings');
      }
    } catch (error) {
      setError('Network error importing bookings');
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
            onClick={() => handleImportBookings()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Import Existing Bookings
          </button>
          <button
            onClick={() => setShowCreateAppointment(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Create Appointment
          </button>
          <button
            onClick={() => window.open('/closers/signup', '_blank')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Add New Closer
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
            Unassigned ({appointments.filter(a => !a.closer).length})
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Closer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Calendly Link
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {closers.map((closer) => (
                      <tr key={closer.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{closer.name}</div>
                            <div className="text-sm text-gray-500">{closer.email}</div>
                            {closer.phone && (
                              <div className="text-sm text-gray-500">{closer.phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              closer.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {closer.isApproved ? 'Approved' : 'Pending'}
                            </span>
                            <br />
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              closer.isActive ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {closer.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {editingCloserId === closer.id ? (
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={editingCalendlyLink}
                                onChange={(e) => setEditingCalendlyLink(e.target.value)}
                                placeholder="https://calendly.com/username"
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs text-black placeholder-gray-500"
                              />
                              <button
                                onClick={() => handleUpdateCalendlyLink(closer.id)}
                                className="text-green-600 hover:text-green-900 text-xs"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCloserId(null);
                                  setEditingCalendlyLink('');
                                }}
                                className="text-red-600 hover:text-red-900 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div>
                              {closer.calendlyLink ? (
                                <div>
                                  <a
                                    href={closer.calendlyLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs break-all"
                                  >
                                    {closer.calendlyLink}
                                  </a>
                                  <br />
                                  <button
                                    onClick={() => {
                                      setEditingCloserId(closer.id);
                                      setEditingCalendlyLink(closer.calendlyLink || '');
                                    }}
                                    className="text-gray-500 hover:text-gray-700 text-xs mt-1"
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
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                >
                                  + Add Calendly Link
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div>{closer.totalCalls} calls</div>
                            <div>{closer.totalConversions} conversions</div>
                            <div className="text-xs text-gray-500">
                              {typeof closer.conversionRate === 'number' ? (closer.conversionRate * 100).toFixed(1) : '0.0'}% rate
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${typeof closer.totalRevenue === 'number' ? closer.totalRevenue.toFixed(2) : '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {!closer.isApproved && (
                              <button
                                onClick={() => handleApproveCloser(closer.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => handleDeactivateCloser(closer.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              {closer.isActive ? 'Deactivate' : 'Activate'}
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


      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Unassigned Appointments</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Assign appointments to available closers</p>
          </div>
          <div className="border-t border-gray-200">
            {appointments.filter(a => !a.closer).length === 0 ? (
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
                    {appointments.filter(a => !a.closer).map((appointment) => (
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Conversions</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {appointments.filter(a => a.outcome === 'converted').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Not Interested</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {appointments.filter(a => a.outcome === 'not_interested').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Follow-ups Needed</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {appointments.filter(a => a.outcome === 'needs_follow_up').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${appointments.reduce((sum, a) => sum + (Number(a.saleValue) || 0), 0).toFixed(2)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Closer Performance Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Closer Performance</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Detailed performance metrics for each closer</p>
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
                      const closerAppointments = appointments.filter(a => a.closer?.id === closer.id);
                      const conversions = closerAppointments.filter(a => a.outcome === 'converted');
                      const totalRevenue = closerAppointments.reduce((sum, a) => sum + (Number(a.saleValue) || 0), 0);
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
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Call Outcomes Breakdown</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Detailed breakdown of all call outcomes with notes and recordings</p>
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
    </div>
  );
}
