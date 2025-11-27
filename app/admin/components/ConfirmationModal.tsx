"use client";

import React, { useState, useEffect } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
    requireInput?: string; // If provided, user must type this string to enable confirm button
    isLoading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDangerous = false,
    requireInput,
    isLoading = false
}: ConfirmationModalProps) {
    const [inputValue, setInputValue] = useState("");
    const [canConfirm, setCanConfirm] = useState(!requireInput);

    useEffect(() => {
        if (isOpen) {
            setInputValue("");
            setCanConfirm(!requireInput);
        }
    }, [isOpen, requireInput]);

    useEffect(() => {
        if (requireInput) {
            setCanConfirm(inputValue === requireInput);
        }
    }, [inputValue, requireInput]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
                {/* Header */}
                <div className={`px-6 py-4 border-b ${isDangerous ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                    <h3 className={`text-lg font-bold ${isDangerous ? 'text-red-700' : 'text-gray-900'}`}>
                        {title}
                    </h3>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    <div className="text-gray-600 text-sm mb-6">
                        {message}
                    </div>

                    {requireInput && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type <span className="font-mono font-bold text-red-600">{requireInput}</span> to confirm:
                            </label>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                placeholder={`Type "${requireInput}"`}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!canConfirm || isLoading}
                        className={`px-4 py-2 rounded-lg text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${isDangerous
                                ? 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                            }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
