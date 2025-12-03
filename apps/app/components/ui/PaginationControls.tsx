import React from 'react';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    onItemsPerPageChange: (itemsPerPage: number) => void;
    totalItems: number;
    showingFrom: number;
    showingTo: number;
    pageSizeOptions?: number[];
}

export function PaginationControls({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange,
    totalItems,
    showingFrom,
    showingTo,
    pageSizeOptions = [5, 10, 25, 50, 100]
}: PaginationControlsProps) {
    return (
        <div className="px-6 py-4 flex items-center justify-center gap-3">
            {/* Prev Button with Arrow */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Prev</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
                {(() => {
                    const pages = [];
                    const maxVisiblePages = 10;

                    if (totalPages <= maxVisiblePages) {
                        for (let i = 1; i <= totalPages; i++) {
                            pages.push(i);
                        }
                    } else {
                        if (currentPage <= 5) {
                            for (let i = 1; i <= 7; i++) {
                                pages.push(i);
                            }
                            pages.push('...', totalPages);
                        } else if (currentPage >= totalPages - 4) {
                            pages.push(1, '...');
                            for (let i = totalPages - 6; i <= totalPages; i++) {
                                pages.push(i);
                            }
                        } else {
                            pages.push(1, '...', currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2, '...', totalPages);
                        }
                    }

                    return pages.map((page, index) => (
                        typeof page === 'number' ? (
                            <button
                                key={index}
                                onClick={() => onPageChange(page)}
                                className={`min-w-[32px] h-8 px-2 rounded text-sm font-medium transition-colors ${currentPage === page
                                    ? 'bg-white text-blue-600 border border-gray-200 shadow-sm'
                                    : 'text-gray-600 hover:text-blue-600'
                                    }`}
                            >
                                {page}
                            </button>
                        ) : (
                            <span key={index} className="px-1 text-gray-400 text-sm">...</span>
                        )
                    ));
                })()}
            </div>

            {/* Next Button with Arrow */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
            >
                <span>Next</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Rows per page dropdown */}
            <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="ml-2 text-sm text-blue-600 bg-transparent border-none focus:ring-0 cursor-pointer appearance-none pr-6 bg-no-repeat bg-right"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%232563eb'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundSize: '16px',
                    backgroundPosition: 'right center'
                }}
            >
                {pageSizeOptions.map(option => (
                    <option key={option} value={option}>{option} per page</option>
                ))}
            </select>
        </div>
    );
}
