import { UserRole, LeadData } from './types';

/**
 * Get color classes for task priority badges
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
 * Get the appropriate API endpoint based on user role
 */
export const getApiEndpoint = (
    role: UserRole,
    endpoint: 'lead-details' | 'activities' | 'tasks'
): string => {
    const baseMap = {
        closer: {
            'lead-details': '/api/closer/lead-details',
            activities: '/api/leads', // ✅ Unified endpoint
            tasks: '/api/tasks', // ✅ Unified endpoint
        },
        admin: {
            'lead-details': '/api/admin/leads',
            activities: '/api/leads', // ✅ Unified endpoint
            tasks: '/api/tasks', // ✅ Unified endpoint
        },
    };

    return baseMap[role][endpoint];
};

/**
 * Format date string to readable format
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
 * Extract lead name from lead data answers
 */
export const getLeadName = (leadData: LeadData | null): string => {
    if (!leadData) return 'Lead Profile';

    // Try different answer formats (admin vs closer)
    const nameAnswer = leadData.answers.find(
        (a) =>
            a.questionText?.toLowerCase().includes('name') ||
            a.question?.prompt?.toLowerCase().includes('name')
    );

    return nameAnswer?.answer || nameAnswer?.value || 'Lead Profile';
};

/**
 * Extract lead email from lead data answers
 */
export const getLeadEmail = (leadData: LeadData | null): string => {
    if (!leadData) return 'N/A';

    // Try different answer formats (admin vs closer)
    const emailAnswer = leadData.answers.find(
        (a) =>
            a.questionText?.toLowerCase().includes('email') ||
            a.question?.prompt?.toLowerCase().includes('email') ||
            a.answer?.includes('@') ||
            a.value?.includes('@')
    );

    return emailAnswer?.answer || emailAnswer?.value || 'N/A';
};

/**
 * Get status color classes
 */
export const getStatusColor = (status: string): string => {
    switch (status) {
        case 'Purchased (Call)':
            return 'bg-green-100 text-green-800';
        case 'Not Interested':
            return 'bg-red-100 text-red-800';
        case 'Needs Follow Up':
            return 'bg-yellow-100 text-yellow-800';
        case 'Booked':
            return 'bg-blue-100 text-blue-800';
        case 'Completed':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};
