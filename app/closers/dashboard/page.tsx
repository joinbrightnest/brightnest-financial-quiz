"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CloserHeader from '../components/CloserHeader';

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
  recordingLinkConverted?: string | null;
  recordingLinkNotInterested?: string | null;
  recordingLinkNeedsFollowUp?: string | null;
  recordingLinkWrongNumber?: string | null;
  recordingLinkNoAnswer?: string | null;
  recordingLinkCallbackRequested?: string | null;
  recordingLinkRescheduled?: string | null;
}

interface LeadDetails {
  id: string;
  answers: Array<{
    questionId: string;
    value: string;
    question: {
      prompt: string;
    } | null;
  }>;
  appointment?: {
    notes: string | null;
    outcome: string | null;
    recordingLinkConverted?: string | null;
    recordingLinkNotInterested?: string | null;
    recordingLinkNeedsFollowUp?: string | null;
    recordingLinkWrongNumber?: string | null;
    recordingLinkNoAnswer?: string | null;
    recordingLinkCallbackRequested?: string | null;
    recordingLinkRescheduled?: string | null;
    recordingLink?: string | null;
    saleValue?: number | null;
  };
  status: string;
  createdAt: string;
  completedAt: string | null;
  dealClosedAt?: string | null;
  affiliateCode?: string | null;
  source?: string;
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
  const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false);
  const [leadDetails, setLeadDetails] = useState<LeadDetails | null>(null);
  const [isLoadingLeadDetails, setIsLoadingLeadDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'activity' | 'notes' | 'tasks'>('activity');
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('closerToken');
    
    if (!token) {
      router.push('/closers/login');
      return;
    }

    // Fetch fresh closer stats and appointments
    fetchCloserStats(token);
    fetchAppointments(token);
    fetchActiveTaskCount(token);
  }, [router]);

  // Fetch activities when activity tab is active and we have an appointment
  useEffect(() => {
    if (activeTab === 'activity' && leadDetails?.appointment?.id) {
      const token = localStorage.getItem('closerToken');
      if (token) {
        fetchActivities(leadDetails.appointment.id, token);
      }
    }
  }, [activeTab, leadDetails?.appointment?.id]);

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
      const response = await fetch('/api/closer/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const tasks = await response.json();
        const activeCount = tasks.filter((t: any) => t.status === 'pending' || t.status === 'in_progress').length;
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
    setIsLoadingLeadDetails(true);
    setShowLeadDetailsModal(true);
    setActiveTab('activity');
    setActivities([]);
    
    try {
      const token = localStorage.getItem('closerToken');
      const response = await fetch(`/api/leads/by-email?email=${encodeURIComponent(appointment.customerEmail)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeadDetails(data.lead);
        // Also load tasks, notes, and activities for this lead
        fetchTasks(appointment.customerEmail);
        fetchNotes(appointment.customerEmail);
        fetchActivities(appointment.id, token);
      } else {
        setError('Failed to load lead details');
      }
    } catch (error) {
      console.error('Error fetching lead details:', error);
      setError('Network error loading lead details');
    } finally {
      setIsLoadingLeadDetails(false);
    }
  };

  const fetchActivities = async (appointmentId: string, token: string) => {
    try {
      setLoadingActivities(true);
      const response = await fetch(`/api/closer/appointments/${appointmentId}/activities`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      } else {
        console.error('Failed to fetch activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const fetchNotes = async (leadEmail: string) => {
    setIsLoadingNotes(true);
    try {
      const response = await fetch(`/api/notes?leadEmail=${encodeURIComponent(leadEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const fetchTasks = async (leadEmail: string) => {
    setIsLoadingTasks(true);
    try {
      const token = localStorage.getItem('closerToken');
      const response = await fetch(`/api/closer/tasks?leadEmail=${encodeURIComponent(leadEmail)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.title || !leadDetails) return;

    try {
      const token = localStorage.getItem('closerToken');
      const leadEmail = leadDetails.answers.find((a: any) => a.value.includes('@'))?.value;
      
      if (!leadEmail) {
        setError('No email found for this lead');
        return;
      }

      const response = await fetch('/api/closer/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadEmail: leadEmail,
          title: taskForm.title,
          description: taskForm.description,
          priority: taskForm.priority,
          dueDate: taskForm.dueDate || null,
        }),
      });

      if (response.ok) {
        setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
        fetchTasks(leadEmail);
        if (token) fetchActiveTaskCount(token); // Update the task count badge
      } else {
        setError('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Network error creating task');
    }
  };

  const handleUpdateTask = async (taskId: string, updates: any) => {
    if (!leadDetails) return;

    try {
      const token = localStorage.getItem('closerToken');
      const response = await fetch(`/api/closer/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const leadEmail = leadDetails.answers.find((a: any) => a.value.includes('@'))?.value;
        if (leadEmail) {
          fetchTasks(leadEmail);
        }
        if (token) fetchActiveTaskCount(token); // Update the task count badge
      } else {
        setError('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Network error updating task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!leadDetails || !confirm('Are you sure you want to delete this task?')) return;

    try {
      const token = localStorage.getItem('closerToken');
      const response = await fetch(`/api/closer/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const leadEmail = leadDetails.answers.find((a: any) => a.value.includes('@'))?.value;
        if (leadEmail) {
          fetchTasks(leadEmail);
        }
        if (token) fetchActiveTaskCount(token); // Update the task count badge
      } else {
        setError('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Network error deleting task');
    }
  };

  const openEditTask = (task: any) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
    setShowTaskForm(true);
  };

  const handleSaveEditedTask = async () => {
    if (!editingTask || !taskForm.title) return;

    await handleUpdateTask(editingTask.id, {
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      dueDate: taskForm.dueDate || null,
    });

    setEditingTask(null);
    setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
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
          <p className="text-gray-600">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#faf8f0'}}>
      <CloserHeader closer={closer} onLogout={handleLogout} taskCount={activeTaskCount} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {closer.name}!</h1>
              <p className="text-gray-600 mt-1">Manage your appointments and track your performance</p>
            </div>
          </div>
        </div>

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
                    <th className="w-1/7 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="w-1/7 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Scheduled
                    </th>
                    <th className="w-1/7 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="w-1/7 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Outcome
                    </th>
                    <th className="w-1/7 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sale Value
                    </th>
                    <th className="w-1/7 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                    <th className="w-1/7 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {appointment.outcome ? (
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getOutcomeColor(appointment.outcome)}`}>
                            {appointment.outcome.replace('_', ' ')}
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
                          Update Outcome
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

      {/* Outcome Modal */}
      {showOutcomeModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-white/20 animate-slideUp">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                Update Call Outcome
              </h3>
              <p className="text-gray-600 mt-1">{selectedAppointment.customerName}</p>
            </div>
            
            <div className="px-6 py-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Outcome *</label>
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
                Update Outcome
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {showLeadDetailsModal && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-white">
                      {leadDetails?.answers.find((a: any) => 
                        a.question?.prompt?.toLowerCase().includes('name') || 
                        a.question?.prompt?.toLowerCase().includes('first name')
                      )?.value || 'Lead Profile'}
                    </h1>
                    <p className="text-slate-300 text-sm">
                      Session ID: {leadDetails?.id || 'N/A'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowLeadDetailsModal(false);
                    setLeadDetails(null);
                    setActiveTab('activity');
                  }}
                  className="text-slate-400 hover:text-white transition-all p-2 rounded-lg hover:bg-slate-700"
                  title="Close and return to dashboard"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8 space-y-8 max-w-7xl mx-auto">
              {isLoadingLeadDetails ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : leadDetails ? (
                <>
                  {/* Combined Personal Information and Deal Information */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Information
                    </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Full Name</label>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {leadDetails.answers.find((a: any) => 
                            a.question?.prompt?.toLowerCase().includes('name') || 
                            a.question?.prompt?.toLowerCase().includes('first name')
                          )?.value || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email Address</label>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {leadDetails.answers.find((a: any) => a.value.includes('@'))?.value || 'N/A'}
                        </p>
                    </div>
                  </div>

                    <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Deal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</label>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            leadDetails.status === 'Completed' || leadDetails.status === 'completed' || leadDetails.status === 'Booked'
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {leadDetails.status || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Deal Owner</label>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{closer?.name || 'Unassigned'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Lead Added</label>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {leadDetails.completedAt ? new Date(leadDetails.completedAt).toLocaleDateString('en-GB') : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Deal Closed</label>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {leadDetails.dealClosedAt ? new Date(leadDetails.dealClosedAt).toLocaleDateString('en-GB') : '--'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Deal Amount</label>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {leadDetails.appointment?.saleValue ? `$${Number(leadDetails.appointment.saleValue).toFixed(2)}` : '--'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Lead Source</label>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {leadDetails.source || 'Website'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Quiz Type</label>
                        <p className="mt-1 text-sm font-semibold text-slate-900">Financial-Profile</p>
                      </div>
                      </div>
                    </div>
                    
                  {/* Tabs Navigation */}
                  <div className="border-b border-slate-200">
                    <div className="flex space-x-8">
                      {(['activity', 'notes', 'tasks'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                            activeTab === tab
                              ? 'border-slate-800 text-slate-800'
                              : 'border-transparent text-gray-600 hover:text-slate-700 hover:border-gray-300'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div>
                    {activeTab === 'activity' && (
                      <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Activity Timeline
                        </h3>
                        
                        {loadingActivities ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-sm text-slate-600 mt-4">Loading activity...</p>
                          </div>
                        ) : activities.length === 0 ? (
                          <div className="text-center py-8">
                            <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm text-slate-600">No activity recorded yet</p>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                            <div className="space-y-6">
                              {activities.map((activity) => (
                                <div key={activity.id} className="relative flex items-start space-x-4">
                                  <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center z-10 ${
                                    activity.type === 'quiz_completed' ? 'bg-purple-100' :
                                    activity.type === 'call_booked' ? 'bg-blue-100' :
                                    activity.type === 'deal_closed' ? 'bg-green-100' :
                                    (activity.type === 'outcome_updated' || activity.type === 'outcome_marked') ? 'bg-orange-100' :
                                    'bg-amber-100'
                                  }`}>
                                    {/* Icons */}
                                  </div>
                                  <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-900">
                                          {/* Activity Descriptions */}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                          {new Date(activity.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                        </p>
                                        {(activity.type === 'outcome_updated' || activity.type === 'outcome_marked' || activity.type === 'deal_closed') && (
                                          <div className="mt-3">
                                            {/* ... Details button and expandable section ... */}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'notes' && (
                      <div className="space-y-6">
                        {/* Notes Section */}
                      </div>
                    )}

                    {activeTab === 'tasks' && (
                      <div>
                        {/* Tasks Section */}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-slate-600">No lead details available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
