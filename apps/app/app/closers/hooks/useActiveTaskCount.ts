'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseActiveTaskCountReturn {
    activeTaskCount: number;
    isLoading: boolean;
    refetch: () => Promise<void>;
}

/**
 * Shared hook to fetch and track active task count for sidebar badge
 * 
 * 🔒 SECURITY: Uses httpOnly cookies for authentication.
 * The token is automatically included in requests by the browser.
 */
export function useActiveTaskCount(): UseActiveTaskCountReturn {
    const [activeTaskCount, setActiveTaskCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const fetchActiveTaskCount = useCallback(async () => {
        try {
            const response = await fetch('/api/tasks', {
                // 🔒 SECURITY: Include cookies in the request
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const tasks = await response.json();
                // Handle both response formats: array directly or { tasks: [...] }
                const tasksArray = Array.isArray(tasks) ? tasks : (tasks.tasks || []);
                // Count all non-completed tasks
                const activeCount = tasksArray.filter((t: { status: string }) =>
                    (t.status === 'pending' || t.status === 'in_progress')
                ).length;
                setActiveTaskCount(activeCount);
            }
        } catch (error) {
            console.error('Error fetching active task count:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActiveTaskCount();
    }, [fetchActiveTaskCount]);

    return {
        activeTaskCount,
        isLoading,
        refetch: fetchActiveTaskCount,
    };
}
