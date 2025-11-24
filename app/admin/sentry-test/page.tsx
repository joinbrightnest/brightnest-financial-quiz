'use client';

import { useEffect } from 'react';

export default function SentryTestPage() {
  useEffect(() => {
    // Trigger a test error for Sentry
    throw new Error('🎉 Sentry Test Error - If you see this in Sentry, it works!');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🧪 Sentry Test Page
        </h1>
        <p className="text-gray-600">
          This page triggers a test error to verify Sentry is working.
        </p>
        <p className="text-gray-600 mt-4">
          Check your Sentry dashboard - you should see the error there!
        </p>
      </div>
    </div>
  );
}

