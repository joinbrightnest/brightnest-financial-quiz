"use client";

import Link from "next/link";

export default function AffiliatePayoutsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
              <p className="mt-1 text-sm text-gray-500">
                View your commission earnings and payout history
              </p>
            </div>
            <Link
              href="/affiliates/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Earnings Summary */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Earnings Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">$0</div>
                <div className="text-sm text-gray-600">Total Earned</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">$0</div>
                <div className="text-sm text-gray-600">Paid Out</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">$0</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>

          {/* Payout Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payout Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payout Method
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black">
                  <option>Stripe</option>
                  <option>PayPal</option>
                  <option>Wise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Payout
                </label>
                <div className="text-sm text-gray-600">$50.00</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payout Schedule
                </label>
                <div className="text-sm text-gray-600">Monthly (1st of each month)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payout History */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Payout History</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-gray-500">No payout history yet</div>
              <div className="text-sm text-gray-400 mt-1">
                Payouts will appear here once you start earning commissions
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
