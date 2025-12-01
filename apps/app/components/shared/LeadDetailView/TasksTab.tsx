"use client";

import { useState } from 'react';
import { Task, UserRole } from './types';
import { getPriorityColor, getApiEndpoint } from './utils';

interface TasksTabProps {
    tasks: Task[];
    loading: boolean;
    leadEmail: string;
    userRole: UserRole;
    onRefresh: () => void;
    closerId?: string;
}

export default function TasksTab({ tasks, loading, leadEmail, userRole, onRefresh, closerId }: TasksTabProps) {
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskForm, setTaskForm] = useState<{
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high' | 'urgent';
        dueDate: string;
    }>({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: ''
    });

    const getAuthHeaders = () => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (userRole === 'closer') {
            const token = localStorage.getItem('closerToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    };

    const handleCreateTask = async () => {
        if (!taskForm.title || !leadEmail) return;

        try {
            const endpoint = getApiEndpoint(userRole, 'tasks');
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    ...taskForm,
                    leadEmail,
                    closerId, // Include closerId if available (required for admin)
                }),
            });

            if (response.ok) {
                setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
                setShowTaskForm(false);
                onRefresh();
            }
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
        try {
            const endpoint = getApiEndpoint(userRole, 'tasks');
            const response = await fetch(`${endpoint}/${taskId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                onRefresh();
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            const endpoint = getApiEndpoint(userRole, 'tasks');
            const response = await fetch(`${endpoint}/${taskId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                onRefresh();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const openEditTask = (task: Task) => {
        setEditingTask(task);
        setTaskForm({
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
        });
        setShowTaskForm(true);
    };

    const handleSaveEditedTask = async () => {
        if (!editingTask || !taskForm.title) return;

        await handleUpdateTask(editingTask.id, taskForm);
        setEditingTask(null);
        setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
        setShowTaskForm(false);
    };

    return (
        <div>
            <div className="mb-6">
                <button
                    onClick={() => setShowTaskForm(!showTaskForm)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {showTaskForm ? 'Cancel' : 'Create Task'}
                </button>
            </div>

            {showTaskForm && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
                    <h4 className="text-base font-semibold text-slate-900 mb-4">
                        {editingTask ? 'Edit Task' : 'Create New Task'}
                    </h4>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Task Title *
                            </label>
                            <input
                                type="text"
                                value={taskForm.title}
                                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                                placeholder="e.g., Follow up on product demo"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={taskForm.description}
                                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-900"
                                rows={3}
                                placeholder="Add any additional details..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Priority
                                </label>
                                <select
                                    value={taskForm.priority}
                                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={taskForm.dueDate}
                                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={() => {
                                setEditingTask(null);
                                setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
                                setShowTaskForm(false);
                            }}
                            className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => editingTask ? handleSaveEditedTask() : handleCreateTask()}
                            disabled={!taskForm.title}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {editingTask ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                    <div className="space-y-4">
                        {tasks.length > 0 ? (
                            tasks.map((task) => (
                                <div key={task.id} className="relative flex items-start space-x-4">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10 ${task.status === 'completed' ? 'bg-green-100' : 'bg-indigo-100'
                                        }`}>
                                        {task.status === 'completed' ? (
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200 group">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center flex-wrap gap-2 mb-2">
                                                    <button
                                                        onClick={() => handleUpdateTask(task.id, {
                                                            status: task.status === 'completed' ? 'pending' : 'completed'
                                                        })}
                                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${task.status === 'completed'
                                                            ? 'bg-green-500 border-green-500'
                                                            : 'border-slate-400 hover:border-green-500'
                                                            }`}
                                                    >
                                                        {task.status === 'completed' && (
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <span className={`font-semibold text-slate-900 ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                                                        {task.title}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                        {task.priority}
                                                    </span>
                                                    {task.status === 'in_progress' && (
                                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                                            In Progress
                                                        </span>
                                                    )}
                                                </div>
                                                {task.description && (
                                                    <p className={`text-sm text-slate-600 mb-2 ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                                                        {task.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center space-x-4 text-xs text-slate-500">
                                                    {task.dueDate && (
                                                        <div className="flex items-center">
                                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center">
                                                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Created {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {task.status !== 'completed' && task.status !== 'in_progress' && (
                                                    <button
                                                        onClick={() => handleUpdateTask(task.id, { status: 'in_progress' })}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Start Task"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openEditTask(task)}
                                                    className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                                                    title="Edit Task"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete Task"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            !showTaskForm && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-slate-600">No tasks yet. Create one to get started.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
