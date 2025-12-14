/**
 * Shared utility functions for handling appointment outcomes in the Closer Portal
 */

import { Appointment, OutcomeType } from '../types';

/**
 * Get the CSS classes for styling an outcome badge
 */
export function getOutcomeColor(outcome: string | null): string {
    switch (outcome) {
        case 'converted': return 'bg-green-100 text-green-800';
        case 'not_interested': return 'bg-red-100 text-red-800';
        case 'needs_follow_up': return 'bg-yellow-100 text-yellow-800';
        case 'callback_requested': return 'bg-blue-100 text-blue-800';
        case 'wrong_number': return 'bg-gray-100 text-gray-800';
        case 'no_answer': return 'bg-gray-100 text-gray-800';
        case 'rescheduled': return 'bg-purple-100 text-purple-800';
        default: return 'bg-blue-100 text-blue-800';
    }
}

/**
 * Get the human-readable display name for an outcome
 */
export function getOutcomeDisplayName(outcome: string | null): string {
    if (!outcome) return 'Booked';
    switch (outcome) {
        case 'converted': return 'Purchased (Call)';
        case 'not_interested': return 'Not Interested';
        case 'needs_follow_up': return 'Needs Follow Up';
        case 'wrong_number': return 'Wrong Number';
        case 'no_answer': return 'No Answer';
        case 'callback_requested': return 'Callback Requested';
        case 'rescheduled': return 'Rescheduled';
        default: return outcome.replace('_', ' ');
    }
}

/**
 * Get the recording link for an appointment based on its outcome
 */
export function getRecordingLink(appointment: Appointment): string | null {
    if (!appointment.outcome) return null;

    switch (appointment.outcome) {
        case 'converted':
            return appointment.recordingLinkConverted || null;
        case 'not_interested':
            return appointment.recordingLinkNotInterested || null;
        case 'needs_follow_up':
            return appointment.recordingLinkNeedsFollowUp || null;
        case 'wrong_number':
            return appointment.recordingLinkWrongNumber || null;
        case 'no_answer':
            return appointment.recordingLinkNoAnswer || null;
        case 'callback_requested':
            return appointment.recordingLinkCallbackRequested || null;
        case 'rescheduled':
            return appointment.recordingLinkRescheduled || null;
        default:
            return null;
    }
}

/**
 * Format a date string for display
 */
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Outcome options for dropdowns and filters
 */
export const OUTCOME_OPTIONS = [
    { value: 'converted', label: 'Converted' },
    { value: 'not_interested', label: 'Not Interested' },
    { value: 'needs_follow_up', label: 'Needs Follow Up' },
    { value: 'wrong_number', label: 'Wrong Number' },
    { value: 'no_answer', label: 'No Answer' },
    { value: 'callback_requested', label: 'Callback Requested' },
    { value: 'rescheduled', label: 'Rescheduled' },
] as const;

/**
 * Filter options for the database page dropdown
 */
export const FILTER_OPTIONS = [
    { value: 'all', label: 'All Contacted Leads' },
    { value: 'converted', label: 'Purchased' },
    { value: 'not_interested', label: 'Not Interested' },
    { value: 'needs_follow_up', label: 'Needs Follow Up' },
    { value: 'callback_requested', label: 'Callback Requested' },
    { value: 'no_answer', label: 'No Answer' },
    { value: 'wrong_number', label: 'Wrong Number' },
    { value: 'rescheduled', label: 'Rescheduled' },
] as const;
