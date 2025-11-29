import { memo } from "react";

interface SkeletonLoaderProps {
    type?: 'question' | 'text-input';
}

const SkeletonLoader = memo(function SkeletonLoader({ type = 'question' }: SkeletonLoaderProps) {
    return (
        <div className="min-h-screen bg-white">
            {/* Top Header Bar */}
            <div className="bg-gray-800 w-full py-4">
                <div className="max-w-md mx-auto px-6">
                    <h1 className="text-white text-xl font-bold text-center tracking-wide">
                        BrightNest
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-md mx-auto px-6 py-6 md:py-8">
                {/* Progress Bar Skeleton */}
                <div className="mb-8">
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden skeleton-shimmer" />
                    <div className="flex justify-between items-center mt-2">
                        {Array.from({ length: 10 }, (_, index) => (
                            <div
                                key={index}
                                className="w-2 h-2 rounded-full bg-gray-200"
                            />
                        ))}
                    </div>
                </div>

                {/* Question Skeleton */}
                <div className="mb-6 md:mb-8">
                    <div className="h-6 bg-gray-200 rounded skeleton-shimmer mb-3" style={{ width: '90%' }} />
                    <div className="h-6 bg-gray-200 rounded skeleton-shimmer" style={{ width: '70%' }} />
                </div>

                {/* Options Skeleton */}
                {type === 'question' ? (
                    <div className="space-y-4">
                        {Array.from({ length: 4 }, (_, index) => (
                            <div
                                key={index}
                                className="w-full h-16 rounded-lg bg-gray-100 skeleton-shimmer"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="w-full h-12 rounded-lg bg-gray-100 skeleton-shimmer" />
                        <div className="w-full h-12 rounded-lg bg-gray-200 skeleton-shimmer" />
                    </div>
                )}
            </div>
        </div>
    );
});

export default SkeletonLoader;
