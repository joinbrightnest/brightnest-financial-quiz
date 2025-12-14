"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AffiliatesPage() {
  const router = useRouter();

  useEffect(() => {
    // 🔒 SECURITY: Check authentication via httpOnly cookie (server-verified)
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/affiliate/profile', {
          credentials: 'include',
        });

        if (response.ok) {
          // User is authenticated, redirect to dashboard
          router.push("/affiliates/dashboard");
        } else {
          // Not authenticated, redirect to login
          router.push("/affiliates/login");
        }
      } catch {
        // Error checking auth, go to login
        router.push("/affiliates/login");
      }
    };

    checkAuth();
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}

