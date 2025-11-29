"use client";

export default function ContentLoader() {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-96 bg-gray-100 rounded mt-2 animate-pulse"></div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-10 w-24 bg-gray-300 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Table/Content Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-64 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

