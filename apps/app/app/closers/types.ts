/**
 * Shared types for the Closer Portal
 */

export interface Closer {
    id: string;
    name: string;
    email: string;
    phone: string;
    totalCalls: number;
    totalConversions: number;
    totalRevenue: number;
    conversionRate: number;
}

export interface Appointment {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    scheduledAt: string;
    duration: number;
    status: string;
    outcome: string | null;
    notes: string | null;
    saleValue: number | null;
    commissionAmount: number | null;
    affiliateCode: string | null;
    source?: string; // Lead source (affiliate name or "Website")
    recordingLinkConverted?: string | null;
    recordingLinkNotInterested?: string | null;
    recordingLinkNeedsFollowUp?: string | null;
    recordingLinkWrongNumber?: string | null;
    recordingLinkNoAnswer?: string | null;
    recordingLinkCallbackRequested?: string | null;
    recordingLinkRescheduled?: string | null;
}

export interface Task {
    id: string;
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed';
    dueDate: string | null;
    completedAt: string | null;
    leadEmail: string;
    createdAt: string;
    closer?: {
        id: string;
        name: string;
        email: string;
    } | null;
    appointment?: {
        id: string;
        customerName: string;
        customerEmail: string;
    } | null;
}

export type OutcomeType =
    | 'converted'
    | 'not_interested'
    | 'needs_follow_up'
    | 'wrong_number'
    | 'no_answer'
    | 'callback_requested'
    | 'rescheduled';
