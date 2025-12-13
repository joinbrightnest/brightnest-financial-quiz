"use client";

import CloserManagement from '../../components/CloserManagement';
import ErrorBoundary from '../../components/ErrorBoundary';

export default function CloserManagementPage() {
    return (
        <ErrorBoundary sectionName="Closer Management">
            <div className="mb-8">
                <CloserManagement />
            </div>
        </ErrorBoundary>
    );
}
