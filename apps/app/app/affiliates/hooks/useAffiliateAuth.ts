"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AffiliateData } from "../types";

interface UseAffiliateAuthReturn {
    affiliate: AffiliateData | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    handleLogout: () => Promise<void>;
    refetch: () => Promise<void>;
}

/**
 * Custom hook for affiliate authentication.
 * Uses httpOnly cookies for secure token storage.
 */
export function useAffiliateAuth(): UseAffiliateAuthReturn {
    const router = useRouter();
    const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkAuth = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // 🔒 SECURITY: Use credentials: 'include' to send httpOnly cookie
            const response = await fetch(`/api/affiliate/profile?_t=${Date.now()}`, {
                credentials: 'include',
            });

            if (response.ok) {
                const affiliateData = await response.json();
                setAffiliate(affiliateData);
            } else if (response.status === 401) {
                // Not authenticated, redirect to login
                router.push("/affiliates/login");
                return;
            } else {
                setError("Failed to fetch profile");
            }
        } catch (err) {
            console.error("Auth check failed:", err);
            setError("Authentication check failed");
            router.push("/affiliates/login");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const handleLogout = useCallback(async () => {
        try {
            // 🔒 SECURITY: Call logout API to clear httpOnly cookie
            await fetch('/api/affiliate/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setAffiliate(null);
            router.push("/affiliates/login");
        }
    }, [router]);

    const refetch = useCallback(async () => {
        await checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return {
        affiliate,
        isLoading,
        isAuthenticated: !!affiliate,
        error,
        handleLogout,
        refetch,
    };
}

export default useAffiliateAuth;
