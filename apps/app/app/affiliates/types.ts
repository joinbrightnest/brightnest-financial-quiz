// Shared types for the Affiliate Portal
// Centralized to avoid duplication across pages

export interface AffiliateData {
    id: string;
    name: string;
    email: string;
    tier: string;
    referralCode: string;
    customLink: string;
    commissionRate: number;
    totalClicks: number;
    totalLeads: number;
    totalBookings: number;
    totalSales: number;
    totalCommission: number;
    isApproved: boolean;
    createdAt?: string;
    payoutMethod?: string;
}

export interface AffiliateStats {
    totalClicks: number;
    totalLeads: number;
    totalBookings: number;
    totalSales: number;
    totalCommission: number;
    conversionRate: number;
    averageSaleValue: number;
    pendingCommission: number;
    paidCommission: number;
    dailyStats: DailyStat[];
}

export interface DailyStat {
    date: string;
    clicks: number;
    leads: number;
    bookedCalls: number;
    commission: number;
}

export interface PayoutData {
    affiliate: {
        id: string;
        name: string;
        email: string;
        totalCommission: number;
        totalEarned: number;
        totalPaid: number;
        pendingPayouts: number;
        availableCommission: number;
        payoutMethod?: string;
    };
    payouts: PayoutRecord[];
    summary: PayoutSummary;
    commissionHoldInfo: CommissionHoldInfo;
}

export interface PayoutRecord {
    id: string;
    amountDue: number;
    status: string;
    notes: string | null;
    createdAt: Date;
    paidAt: Date | null;
}

export interface PayoutSummary {
    totalEarned: number;
    totalPaid: number;
    pendingPayouts: number;
    availableCommission: number;
    heldCommission: number;
    holdDays: number;
}

export interface CommissionHoldInfo {
    heldCommissions: HeldCommission[];
    totalHeldAmount: number;
    totalAvailableAmount: number;
    holdDays: number;
    readyForRelease: number;
    existingCommissions: number;
}

export interface HeldCommission {
    id: string;
    amount: number;
    createdAt: Date;
    holdUntil: Date | null;
    daysLeft?: number;
    isReadyForRelease: boolean;
}

export interface PayoutSettings {
    minimumPayout: number;
    payoutSchedule: string;
    payoutScheduleDisplay: string;
}
