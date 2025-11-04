"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CloserHeader from '../components/CloserHeader';
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

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string | null;
  completedAt: string | null;
  leadEmail: string;
  createdAt: string;
  closer?: {
    id: string;
    name: string;
    email: string;
  } | null;
  appointment?: {
    id: string;
    customerName: string;
    customerEmail: string;
  } | null;
}

export default function CloserTasks() {
  const router = useRouter();
  const [closer, setCloser] = useState<Closer | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'not_completed' | 'completed'>('not_completed');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (closer) {
      fetchTasks();
    }
  }, [closer]);

  const checkAuth = async () => {
    const token = localStorage.getItem('closerToken');
    
    if (!token) {
      router.push('/closers/login');
      return;
    }

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
        router.push('/closers/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/closers/login');
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('closerToken');
      
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/closer/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle both response formats: array directly or { tasks: [...] }
        const tasksArray = Array.isArray(data) ? data : (data.tasks || []);
        setTasks(tasksArray);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const isDueDateOverdueOrToday = (dueDate: string | null): boolean => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due <= today;
  };

  const getFilteredTasks = () => {
    // Filter out cancelled tasks (removed status)
    const validTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress' || t.status === 'completed');
    
    let filtered = filter === 'completed' 
      ? validTasks.filter(t => t.status === 'completed')
      : validTasks.filter(t => t.status !== 'completed');
    
    // Sort: overdue/today tasks first, then by due date ascending
    filtered.sort((a, b) => {
      const aOverdue = a.dueDate ? isDueDateOverdueOrToday(a.dueDate) : false;
      const bOverdue = b.dueDate ? isDueDateOverdueOrToday(b.dueDate) : false;
      
      // If one is overdue/today and the other isn't, prioritize overdue
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      // If both are overdue or both are not, sort by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
    
    return filtered;
  };

  const handleLogout = () => {
    localStorage.removeItem('closerToken');
    localStorage.removeItem('closerData');
    router.push('/closers/login');
  };

  const handleUpdateStatus = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    try {
      const token = localStorage.getItem('closerToken');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`/api/closer/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        // Refresh tasks to show updated status
        await fetchTasks();
      } else {
        setError('Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      setError('Failed to update task status');
    }
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
    // Automatically expand when editing
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      newSet.add(task.id);
      return newSet;
    });
  };

  const closeEditTask = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
    });
  };

  const toggleTaskExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const viewLeadDetails = async (leadEmail: string) => {
    try {
      const token = localStorage.getItem('closerToken');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`/api/leads/by-email?email=${encodeURIComponent(leadEmail)}`, {
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
      console.error('Error viewing lead details:', e);
      setError('Error preparing to view lead details.');
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !taskForm.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      const token = localStorage.getItem('closerToken');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`/api/closer/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description || null,
          priority: taskForm.priority,
          dueDate: taskForm.dueDate || null,
        }),
      });

      if (response.ok) {
        await fetchTasks();
        closeEditTask();
        setError(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 font-semibold';
      case 'high':
        return 'bg-orange-100 text-orange-800 font-semibold';
      case 'medium':
        return 'bg-amber-100 text-amber-800 font-semibold';
      case 'low':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 font-semibold';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-800 font-semibold';
      default:
        return 'bg-amber-100 text-amber-800 font-semibold';
    }
  };

  if (loading && !closer) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#faf8f0'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (!closer) {
    return null;
  }

  const filteredTasks = getFilteredTasks();

  return (
    <div className="min-h-screen" style={{backgroundColor: '#faf8f0'}}>
      <CloserHeader closer={closer} onLogout={handleLogout} taskCount={tasks.filter(t => (t.status === 'pending' || t.status === 'in_progress')).length} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
              <p className="text-gray-600 mt-1">Manage all your assigned tasks</p>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
                <div className="text-sm text-gray-500">Total Tasks</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => (t.status === 'pending' || t.status === 'in_progress')).length}
                </div>
                <div className="text-sm text-gray-500">Not Completed</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.priority === 'urgent' && (t.status === 'pending' || t.status === 'in_progress')).length}
                </div>
                <div className="text-sm text-gray-500">Urgent</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('not_completed')}
              className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
                filter === 'not_completed'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-gray-300 hover:bg-slate-50'
              }`}
            >
              Not Completed ({tasks.filter(t => (t.status === 'pending' || t.status === 'in_progress')).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
                filter === 'completed'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-gray-300 hover:bg-slate-50'
              }`}
            >
              Completed ({tasks.filter(t => t.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 text-lg mb-2">No tasks found</p>
              <p className="text-gray-500 text-sm">Create tasks from lead details to see them here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Associated Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.map((task) => {
                    const isEditing = editingTask?.id === task.id;
                    const isExpanded = expandedTasks.has(task.id);
                    const associatedContact = task.appointment?.customerName || null;
                    
                    return (
                      <React.Fragment key={task.id}>
                        <tr 
                          className={`hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-gray-50' : ''}`}
                        >
                          {/* Status Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                if (task.status === 'completed') {
                                  handleUpdateStatus(task.id, 'pending');
                                } else {
                                  handleUpdateStatus(task.id, 'completed');
                                }
                              }}
                              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                              disabled={isEditing}
                              title={task.status === 'completed' ? 'Mark as not completed' : 'Mark as completed'}
                            >
                              {task.status === 'completed' ? (
                                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-amber-100 border-2 border-amber-400 hover:border-amber-500 transition-colors"></div>
                              )}
                            </button>
                          </td>
                          
                          {/* Title Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <button
                                onClick={() => !isEditing && toggleTaskExpand(task.id)}
                                className="mr-2 p-1 hover:bg-gray-200 rounded transition-colors"
                                disabled={isEditing}
                              >
                                <svg 
                                  className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={taskForm.title}
                                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
                                  placeholder="Task title"
                                  autoFocus
                                />
                              ) : (
                                <span className="text-sm font-medium text-gray-900">{task.title}</span>
                              )}
                            </div>
                          </td>
                          
                          {/* Priority Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <select
                                value={taskForm.priority}
                                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                                className={`px-2 py-1 rounded-md text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getPriorityColor(taskForm.priority)}`}
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded-md text-xs ${getPriorityColor(task.priority)}`}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                            )}
                          </td>
                          
                          {/* Associated Contact Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {associatedContact ? (
                                <>
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0">
                                    <span className="text-xs font-medium text-indigo-700">
                                      {associatedContact.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const email = task.appointment?.customerEmail || task.leadEmail;
                                      if (email) {
                                        viewLeadDetails(email);
                                      }
                                    }}
                                    className="text-sm text-gray-900 hover:text-indigo-600 hover:underline transition-colors cursor-pointer"
                                    title="View lead details"
                                  >
                                    {associatedContact}
                                  </button>
                                </>
                              ) : (
                                <span className="text-sm text-gray-400">--</span>
                              )}
                            </div>
                          </td>
                          
                          {/* Due Date Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="date"
                                value={taskForm.dueDate}
                                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                                className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900"
                              />
                            ) : task.dueDate ? (
                              <span className={`text-sm ${isDueDateOverdueOrToday(task.dueDate) ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">--</span>
                            )}
                          </td>
                          
                          {/* Actions Column */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={closeEditTask}
                                    className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleUpdateTask}
                                    className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                                  >
                                    Save
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditTask(task);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                  title="Edit task"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expandable Row - Details */}
                        {isExpanded && (
                          <tr className="bg-gray-50">
                            <td colSpan={6} className="px-6 py-4">
                              <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                {isEditing ? (
                                  <div className="space-y-4 pb-4">
                                    <div className="flex items-center space-x-3">
                                      <label className="text-sm font-medium text-gray-700 w-24">Priority:</label>
                                      <select
                                        value={taskForm.priority}
                                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                                        className={`px-3 py-1.5 rounded-md text-xs border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getPriorityColor(taskForm.priority)}`}
                                      >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700 mb-1 block">Description:</label>
                                      <textarea
                                        value={taskForm.description}
                                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
                                        placeholder="Task description"
                                        rows={3}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-3 pb-4">
                                    {task.description && (
                                      <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>
                                      </div>
                                    )}
                                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                                      <div className="flex items-center">
                                        <span className="font-medium text-gray-700 mr-2">Priority:</span>
                                        <span className={`px-2 py-1 rounded-md text-xs ${getPriorityColor(task.priority)}`}>
                                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                        </span>
                                      </div>
                                      {task.leadEmail && (
                                        <div className="flex items-center">
                                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                          </svg>
                                          <span className="mr-2">Email:</span>
                                          <span className="text-gray-900">{task.leadEmail}</span>
                                        </div>
                                      )}
                                      {task.closer && (
                                        <div className="flex items-center">
                                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                          </svg>
                                          <span className="mr-2">Deal Owner:</span>
                                          <span className="text-gray-900">{task.closer.name}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Lead Detail View Overlay */}
      {selectedLeadId && (
        <LeadDetailView 
          sessionId={selectedLeadId} 
          onClose={() => setSelectedLeadId(null)} 
        />
      )}
    </div>
  );
}

