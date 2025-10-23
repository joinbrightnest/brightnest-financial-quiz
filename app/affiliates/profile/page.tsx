"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Prevent prerendering since this page requires authentication
export const dynamic = 'force-dynamic';

export default function AffiliateProfilePage() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const checkAuth = async () => {
      const token = localStorage.getItem("affiliate_token");
      const affiliateId = localStorage.getItem("affiliate_id");
      
      if (!token || !affiliateId) {
        router.push("/affiliates/login");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // Don't render anything until mounted to prevent SSR issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Profile Settings
          </h1>
          <p className="text-gray-600 mb-6">
            Manage your affiliate account and payout preferences
          </p>
          
          <div className="text-center py-12">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 inline-block mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-gray-500 font-medium">Profile page is loading...</div>
            <div className="text-sm text-gray-400 mt-1">Please wait while we load your profile information</div>
          </div>
        </div>
      </div>
    </div>
  );
}
