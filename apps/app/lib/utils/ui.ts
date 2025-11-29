/**
 * Shared UI utility functions for consistent styling across the application
 */

/**
 * Get Tailwind CSS classes for task priority badges
 */
export const getPriorityColor = (priority: string): string => {
    switch (priority) {
        case 'urgent':
            return 'bg-red-100 text-red-700';
        case 'high':
            return 'bg-orange-100 text-orange-700';
        case 'medium':
            return 'bg-yellow-100 text-yellow-700';
        case 'low':
            return 'bg-slate-100 text-slate-700';
        default:
            return 'bg-slate-100 text-slate-700';
    }
};

/**
 * Get Tailwind CSS classes for status badges
 */
export const getStatusColor = (status: string): string => {
    switch (status) {
        case 'Purchased (Call)':
        case 'converted':
            return 'bg-green-100 text-green-800';
        case 'Not Interested':
        case 'not_interested':
            return 'bg-red-100 text-red-800';
        case 'Needs Follow Up':
        case 'needs_follow_up':
            return 'bg-yellow-100 text-yellow-800';
        case 'Booked':
        case 'scheduled':
        case 'confirmed':
            return 'bg-blue-100 text-blue-800';
        case 'Completed':
        case 'completed':
            return 'bg-emerald-100 text-emerald-800';
        case 'in_progress':
            return 'bg-indigo-100 text-indigo-800';
        case 'pending':
            return 'bg-amber-100 text-amber-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

/**
 * Get Tailwind CSS classes for outcome badges
 */
export const getOutcomeColor = (outcome: string | null): string => {
    if (!outcome) return 'bg-gray-100 text-gray-800';

    switch (outcome) {
        case 'converted':
            return 'bg-green-100 text-green-800';
        case 'not_interested':
            return 'bg-red-100 text-red-800';
        case 'needs_follow_up':
            return 'bg-yellow-100 text-yellow-800';
        case 'callback_requested':
            return 'bg-blue-100 text-blue-800';
        case 'wrong_number':
        case 'no_answer':
        case 'rescheduled':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

/**
 * Format date string to human-readable format
 */
export const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    } catch {
        return dateString;
    }
};

/**
 * Format date to short format (no time)
 */
export const formatDateShort = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
};
