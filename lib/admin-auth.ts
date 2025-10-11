"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/basic-stats', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        router.push('/admin');
      } else {
        setIsAuthenticated(false);
        router.push('/admin');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      router.push('/admin');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear the authentication cookie by setting it to expire
      document.cookie = 'admin_authenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      setIsAuthenticated(false);
      router.push('/admin');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if logout fails
      router.push('/admin');
    }
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
    checkAuth
  };
}
