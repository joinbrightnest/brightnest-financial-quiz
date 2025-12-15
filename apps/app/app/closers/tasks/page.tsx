"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import LeadDetailView from '@/components/shared/LeadDetailView';
import ContentLoader from '../components/ContentLoader';
// UI utilities removed - using inline slate colors for professional look
import { PaginationControls } from '@/components/ui/PaginationControls';
import { Task, Closer } from '../types';
import { useCloserAuth } from '../hooks';

export default function CloserTasks() {
  const router = useRouter();
  const { closer, isLoading: isAuthLoading, isAuthenticated, handleLogout } = useCloserAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'due_today' | 'overdue' | 'upcoming'>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: '',
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Fetch tasks when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated]);

  const loading = isAuthLoading || isTasksLoading;

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks', {
        // 🔒 SECURITY: Use httpOnly cookie for authentication
        credentials: 'include',
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
      setIsTasksLoading(false);
    }
  };

  const isDueDateToday = (dueDate: string | null): boolean => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
  };

  const isDueDateOverdue = (dueDate: string | null): boolean => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const isDueDateUpcoming = (dueDate: string | null): boolean => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due > today;
  };

  const getFilteredTasks = () => {
    // Filter out completed tasks (like HubSpot - only show active tasks)
    const activeTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');

    let filtered: Task[] = [];

    switch (filter) {
      case 'due_today':
        filtered = activeTasks.filter(t => isDueDateToday(t.dueDate));
        break;
      case 'overdue':
        filtered = activeTasks.filter(t => isDueDateOverdue(t.dueDate));
        break;
      case 'upcoming':
        filtered = activeTasks.filter(t => isDueDateUpcoming(t.dueDate));
        break;
      case 'all':
      default:
        filtered = activeTasks;
        break;
    }

    // Sort: overdue/today tasks first, then by due date ascending
    filtered.sort((a, b) => {
      const aOverdue = a.dueDate ? isDueDateOverdue(a.dueDate) : false;
      const bOverdue = b.dueDate ? isDueDateOverdue(b.dueDate) : false;
      const aToday = a.dueDate ? isDueDateToday(a.dueDate) : false;
      const bToday = b.dueDate ? isDueDateToday(b.dueDate) : false;

      // Prioritize overdue, then today, then upcoming
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      if (aToday && !bToday) return -1;
      if (!aToday && bToday) return 1;

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



  const handleUpdateStatus = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        // 🔒 SECURITY: Use httpOnly cookie for authentication
        credentials: 'include',
        headers: {
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

  const closeCreateTaskModal = () => {
    setShowCreateTaskModal(false);
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
    });
    setError(null);
  };

  const handleCreateTask = async () => {
    if (!taskForm.title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!taskForm.priority) {
      setError('Priority is required');
      return;
    }

    if (!taskForm.dueDate) {
      setError('Due date is required');
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        // 🔒 SECURITY: Use httpOnly cookie for authentication
        credentials: 'include',
        headers: {
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
        closeCreateTaskModal();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task');
    }
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
      const response = await fetch(`/api/leads/by-email?email=${encodeURIComponent(leadEmail)}`, {
        credentials: 'include',
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
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        // 🔒 SECURITY: Use httpOnly cookie for authentication
        credentials: 'include',
        headers: {
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



  const filteredTasks = getFilteredTasks();

  // Pagination Logic
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);
  const activeTaskCount = tasks.filter(t => (t.status === 'pending' || t.status === 'in_progress')).length;

  // Calculate counts for each filter view
  const activeTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const allCount = activeTasks.length;
  const dueTodayCount = activeTasks.filter(t => isDueDateToday(t.dueDate)).length;
  const overdueCount = activeTasks.filter(t => isDueDateOverdue(t.dueDate)).length;
  const upcomingCount = activeTasks.filter(t => isDueDateUpcoming(t.dueDate)).length;

  return (
    <>
      {/* Show loading or content */}
      {loading || !closer ? (
        <ContentLoader />
      ) : (
        <>
          {/* Top Header Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>
                <p className="text-sm text-gray-600 mt-1">Manage all your assigned tasks</p>
              </div>
              <button
                onClick={() => setShowCreateTaskModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Task
              </button>
            </div>
          </div>

          {/* Scrollable Content - Changed to flex column for fixed layout */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0 w-full px-4 sm:px-6 lg:px-8 py-8">

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {/* HubSpot-style Filter Tabs */}
              <div className="flex-shrink-0 mb-6 px-1">
                <div className="flex border-b border-gray-200 bg-slate-100 rounded-t-lg overflow-hidden">
                  <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 px-6 py-3 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${filter === 'all'
                      ? 'border-slate-800 text-slate-900 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-gray-50 bg-transparent'
                      }`}
                  >
                    All
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                      {allCount}
                    </span>
                  </button>
                  <button
                    onClick={() => setFilter('due_today')}
                    className={`flex-1 px-6 py-3 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${filter === 'due_today'
                      ? 'border-slate-800 text-slate-900 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-gray-50 bg-transparent'
                      }`}
                  >
                    Due today
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${filter === 'due_today' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                      {dueTodayCount}
                    </span>
                  </button>
                  <button
                    onClick={() => setFilter('overdue')}
                    className={`flex-1 px-6 py-3 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${filter === 'overdue'
                      ? 'border-slate-800 text-slate-900 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-gray-50 bg-transparent'
                      }`}
                  >
                    Overdue
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${filter === 'overdue' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                      {overdueCount}
                    </span>
                  </button>
                  <button
                    onClick={() => setFilter('upcoming')}
                    className={`flex-1 px-6 py-3 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${filter === 'upcoming'
                      ? 'border-slate-800 text-slate-900 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-gray-50 bg-transparent'
                      }`}
                  >
                    Upcoming
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${filter === 'upcoming' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                      {upcomingCount}
                    </span>
                  </button>
                </div>
              </div>

              {/* Tasks Table - Takes remaining space */}
              <div className="flex-1 flex flex-col min-h-0 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {filteredTasks.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
                    <p className="text-gray-500 text-sm">Create tasks from lead details to see them here</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                          <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-300">
                            Status
                          </th>
                          <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-300">
                            Title
                          </th>
                          <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-300">
                            Priority
                          </th>
                          <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-300">
                            Associated Contact
                          </th>
                          <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-300">
                            Due Date
                          </th>
                          <th scope="col" className="px-4 py-2.5 text-right text-[11px] font-bold text-gray-600 uppercase tracking-wider w-16 border-b border-gray-300">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-300">
                        {paginatedTasks.map((task) => {
                          const isEditing = editingTask?.id === task.id;
                          const isExpanded = expandedTasks.has(task.id);
                          // Associated contact: Type 1 tasks (with leadEmail) show contact via appointment, Type 2 (general tasks, no leadEmail) show --
                          const associatedContact = task.appointment?.customerName || null;

                          return (
                            <React.Fragment key={task.id}>
                              <tr
                                className={`hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}
                              >
                                {/* Status Column */}
                                <td className="px-4 py-2.5 whitespace-nowrap">
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
                                      <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-slate-400 transition-colors"></div>
                                    )}
                                  </button>
                                </td>

                                {/* Title Column */}
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center">
                                    <button
                                      onClick={() => !isEditing && toggleTaskExpand(task.id)}
                                      className="mr-2 p-0.5 hover:bg-slate-100 rounded transition-colors"
                                      disabled={isEditing}
                                    >
                                      <svg
                                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
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
                                        className="flex-1 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 text-sm"
                                        placeholder="Task title"
                                        autoFocus
                                      />
                                    ) : (
                                      <span className="text-sm text-slate-700">{task.title}</span>
                                    )}
                                  </div>
                                </td>

                                {/* Priority Column */}
                                <td className="px-4 py-2.5 whitespace-nowrap">
                                  {isEditing ? (
                                    <select
                                      value={taskForm.priority}
                                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                                      className="px-2 py-1 rounded text-xs border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-600 bg-white"
                                    >
                                      <option value="low">Low</option>
                                      <option value="medium">Medium</option>
                                      <option value="high">High</option>
                                      <option value="urgent">Urgent</option>
                                    </select>
                                  ) : (
                                    <span className="text-xs text-slate-600">
                                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    </span>
                                  )}
                                </td>

                                {/* Associated Contact Column */}
                                <td className="px-4 py-2.5 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {associatedContact ? (
                                      <>
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mr-2 flex-shrink-0">
                                          <span className="text-[10px] font-medium text-slate-600">
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
                                          className="text-sm text-teal-600 hover:text-teal-700 hover:underline transition-colors cursor-pointer"
                                          title="View lead details"
                                        >
                                          {associatedContact}
                                        </button>
                                      </>
                                    ) : (
                                      <span className="text-sm text-slate-400">--</span>
                                    )}
                                  </div>
                                </td>

                                {/* Due Date Column */}
                                <td className="px-4 py-2.5 whitespace-nowrap">
                                  {isEditing ? (
                                    <input
                                      type="date"
                                      value={taskForm.dueDate}
                                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                                      className="px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400 text-sm text-slate-700"
                                    />
                                  ) : task.dueDate ? (
                                    <span className={`text-sm ${isDueDateOverdue(task.dueDate) || isDueDateToday(task.dueDate) ? 'text-red-500 font-medium' : 'text-slate-600'}`}>
                                      {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-slate-400">--</span>
                                  )}
                                </td>

                                {/* Actions Column */}
                                <td className="px-4 py-2.5 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex items-center justify-end space-x-1">
                                    {isEditing ? (
                                      <>
                                        <button
                                          onClick={closeEditTask}
                                          className="px-2 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={handleUpdateTask}
                                          className="px-2 py-1 text-xs font-medium text-white bg-slate-700 rounded hover:bg-slate-800 transition-colors"
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
                                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                        title="Edit task"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>

                              {/* Expandable Row - Details */}
                              {isExpanded && (
                                <tr className="bg-slate-50">
                                  <td colSpan={6} className="px-4 py-3">
                                    <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                      {isEditing ? (
                                        <div className="space-y-3 pb-2">
                                          <div className="flex items-center space-x-3">
                                            <label className="text-xs font-medium text-slate-600 w-20">Priority:</label>
                                            <select
                                              value={taskForm.priority}
                                              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                                              className="px-2 py-1 rounded text-xs border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-600 bg-white"
                                            >
                                              <option value="low">Low</option>
                                              <option value="medium">Medium</option>
                                              <option value="high">High</option>
                                              <option value="urgent">Urgent</option>
                                            </select>
                                          </div>
                                          <div>
                                            <label className="text-xs font-medium text-slate-600 mb-1 block">Description:</label>
                                            <textarea
                                              value={taskForm.description}
                                              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                              className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-700 text-sm"
                                              placeholder="Task description"
                                              rows={2}
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-2 pb-2">
                                          {task.description && (
                                            <div>
                                              <p className="text-xs font-medium text-slate-500 mb-0.5">Description:</p>
                                              <p className="text-sm text-slate-600 whitespace-pre-wrap">{task.description}</p>
                                            </div>
                                          )}
                                          <div className="flex items-center space-x-6 text-sm text-slate-500">
                                            <div className="flex items-center">
                                              <span className="font-medium text-slate-600 mr-2">Priority:</span>
                                              <span className="text-xs text-slate-600">
                                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                              </span>
                                            </div>
                                            {task.leadEmail && (
                                              <div className="flex items-center">
                                                <svg className="w-3.5 h-3.5 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span className="mr-1 text-slate-500">Email:</span>
                                                <span className="text-slate-700">{task.leadEmail}</span>
                                              </div>
                                            )}
                                            {task.closer && (
                                              <div className="flex items-center">
                                                <svg className="w-3.5 h-3.5 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="mr-1 text-slate-500">Deal Owner:</span>
                                                <span className="text-slate-700">{task.closer.name}</span>
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
                    totalItems={filteredTasks.length}
                    showingFrom={(currentPage - 1) * itemsPerPage + 1}
                    showingTo={Math.min(currentPage * itemsPerPage, filteredTasks.length)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lead Detail View Overlay */}
          {selectedLeadId && (
            <LeadDetailView
              sessionId={selectedLeadId}
              onClose={() => setSelectedLeadId(null)}
              userRole="closer"
            />
          )}

          {/* Create Task Modal */}
          {showCreateTaskModal && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-end z-50 transition-opacity duration-200"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeCreateTaskModal();
                }
              }}
            >
              <div
                className="bg-white h-full w-full max-w-2xl shadow-xl overflow-y-auto"
                style={{
                  animation: 'slideInFromRight 0.3s ease-out',
                }}
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                  <h3 className="text-lg font-semibold text-white">Create task</h3>
                  <button
                    onClick={closeCreateTaskModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Task Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      placeholder="Enter task title"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    />
                  </div>

                  {/* Description/Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 resize-none"
                      placeholder="Add any additional details..."
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={closeCreateTaskModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateTask}
                      disabled={!taskForm.title.trim() || !taskForm.priority || !taskForm.dueDate}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

