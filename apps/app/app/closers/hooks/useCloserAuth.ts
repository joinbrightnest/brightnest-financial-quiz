'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Closer } from '../types';

interface UseCloserAuthReturn {
    closer: Closer | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    handleLogout: () => Promise<void>;
    refetchStats: () => Promise<void>;
}

/**
 * Shared authentication hook for the Closer Portal
 * 
 * 🔒 SECURITY: Uses httpOnly cookies for authentication.
 * The token is automatically included in requests by the browser.
 * JavaScript cannot access the token directly (protection against XSS).
 * 
 * Note: `token` is no longer exposed to prevent localStorage usage.
 */
export function useCloserAuth(): UseCloserAuthReturn {
    const [closer, setCloser] = useState<Closer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    const fetchCloserStats = useCallback(async () => {
        try {
            const response = await fetch('/api/closer/stats', {
                // 🔒 SECURITY: Include cookies in the request
                // The httpOnly cookie is automatically sent by the browser
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCloser(data.closer);
                setIsAuthenticated(true);
                setError(null);
            } else {
                setIsAuthenticated(false);
                setError('Failed to load closer stats');
                // Token might be invalid or expired - redirect to login
                if (response.status === 401) {
                    // Clean up any legacy localStorage items
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('closerToken');
                        localStorage.removeItem('closerData');
                    }
                    router.push('/closers/login');
                }
            }
        } catch (err) {
            console.error('Error fetching closer stats:', err);
            setIsAuthenticated(false);
            setError('Network error loading closer stats');
        }
    }, [router]);

    const refetchStats = useCallback(async () => {
        await fetchCloserStats();
    }, [fetchCloserStats]);

    useEffect(() => {
        // Check authentication by making a request to the API
        // The httpOnly cookie will be automatically included
        fetchCloserStats().finally(() => {
            setIsLoading(false);
        });
    }, [fetchCloserStats]);

    const handleLogout = useCallback(async () => {
        try {
            // 🔒 SECURITY: Call logout API to clear the httpOnly cookie
            await fetch('/api/closer/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (err) {
            console.error('Error during logout:', err);
        }

        // Clean up any legacy localStorage items
        if (typeof window !== 'undefined') {
            localStorage.removeItem('closerToken');
            localStorage.removeItem('closerData');
        }

        setCloser(null);
        setIsAuthenticated(false);
        router.push('/closers/login');
    }, [router]);

    return {
        closer,
        isLoading,
        error,
        isAuthenticated,
        handleLogout,
        refetchStats,
    };
}
