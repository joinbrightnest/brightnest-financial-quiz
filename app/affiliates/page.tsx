"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AffiliatesPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("affiliate_token");
    const affiliateId = localStorage.getItem("affiliate_id");
    
    if (token && affiliateId) {
      // User is logged in, redirect to dashboard
      router.push("/affiliates/dashboard");
    } else {
      // User is not logged in, redirect to login
      router.push("/affiliates/login");
    }
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
