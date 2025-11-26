export interface AdminStats {
    totalSessions: number;
    completedSessions: number;
    completionRate: number;
    avgDurationMs: number;
    allLeads: Array<{
        id: string;
        status: string;
        completedAt: string | null;
        createdAt: string;
        result: {
            archetype: string;
        } | null;
        answers: Array<{
            questionId: string;
            value: string;
            question: {
                prompt: string;
                type: string;
            };
        }>;
        source?: string;
        saleValue?: string | null;
        closerName?: string | null;
        dealClosedAt?: string | null;
        appointment?: {
            outcome?: string | null;
            saleValue?: string | null;
            id?: string | null;
            createdAt?: string | null;
            scheduledAt?: string | null;
            updatedAt?: string | null;
            closer?: {
                id: string;
                name: string;
            } | null;
        } | null;
    }>;
    quizTypes?: Array<{
        name: string;
        displayName: string;
        description: string;
        questionCount: number;
    }>;
    archetypeStats: Array<{
        archetype: string;
        _count: { archetype: number };
    }>;
    questionAnalytics: Array<{
        questionNumber: number;
        questionText: string;
        answeredCount: number;
        retentionRate: number;
        previousRetentionRate?: number;
        dropFromPrevious?: number;
    }>;
    dailyActivity: Array<{
        createdAt: string;
        _count: { id: number };
    }>;
    clicksActivity: Array<{
        createdAt: string;
        _count: { id: number };
    }>;
    clicks: number;
    partialSubmissions: number;
    leadsCollected: number;
    averageTimeMs: number;
    topDropOffQuestions: Array<{
        questionNumber: number;
        questionText: string;
        retentionRate: number;
        previousRetentionRate: number;
        dropFromPrevious: number;
    }>;
}

export interface QuizAnalyticsFilters {
    quizType: string;
    duration: string;
    affiliateCode: string;
}
