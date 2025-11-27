export const ADMIN_CONSTANTS = {
    // Cache Settings
    CACHE: {
        DASHBOARD_STATS_TTL: 300, // 5 minutes in seconds
        LEAD_LIST_TTL: 60, // 1 minute
    },

    // Pagination Limits
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 50,
        MAX_LEADS_EXPORT: 500, // Limit for 'all' duration to prevent crashes
        RECENT_SESSIONS_LIMIT: 50,
    },

    // Default System Settings
    DEFAULTS: {
        QUALIFICATION_THRESHOLD: 17,
        COMMISSION_HOLD_DAYS: 30,
        MINIMUM_PAYOUT: 50,
        PAYOUT_SCHEDULE: 'monthly-1st',
        NEW_DEAL_AMOUNT_POTENTIAL: 5000,
        TERMINAL_OUTCOMES: ['not_interested', 'converted'],
    },

    // Validation Limits
    VALIDATION: {
        QUALIFICATION_THRESHOLD: { MIN: 1, MAX: 20 },
        COMMISSION_HOLD_DAYS: { MIN: 0, MAX: 365 },
        MINIMUM_PAYOUT: { MIN: 0, MAX: 10000 },
        NEW_DEAL_AMOUNT_POTENTIAL: { MIN: 0, MAX: 100000 },
    }
};
