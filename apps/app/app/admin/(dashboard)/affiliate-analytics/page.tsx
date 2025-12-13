"use client";

import CEOAnalytics from '../../components/CEOAnalytics';
import ErrorBoundary from '../../components/ErrorBoundary';

export default function AffiliateAnalyticsPage() {
    return (
        <ErrorBoundary sectionName="Affiliate Analytics">
            <div className="mb-8">
                <CEOAnalytics initialData={null} />
            </div>
        </ErrorBoundary>
    );
}
