export interface QuizType {
  id: string;
  name: string;
  icon: string;
}

export interface QuizSession {
  id: string;
  quizType: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  user?: {
    email: string;
  };
  result?: {
    archetype: string;
    scores: any;
  };
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  questionId: string;
  value: any;
  createdAt: string;
  question: {
    prompt: string;
    type: string;
  };
}

export interface ArchetypeData {
  archetype: string;
  count: number;
  percentage: number;
  description?: string;
  avgCompletionTime?: number;
  behaviors?: string[];
}

export interface QuizTypeDistribution {
  quizType: string;
  count: number;
  percentage: number;
  conversionRate: number;
}

export interface SegmentData {
  archetype: string;
  totalLeads: number;
  percentage: number;
  avgCompletionTime: number;
  behaviors: string[];
  trend: number; // percentage change over time
}

export interface AnalyticsData {
  // Global metrics
  totalLeads: number;
  totalCompletions: number;
  conversionRate: number;
  avgCompletionTime: number;
  distinctArchetypes: number;
  assessmentCategories: number;
  dropOffRate: number;

  // Distributions
  quizTypeDistribution: QuizTypeDistribution[];
  archetypeDistribution: ArchetypeData[];

  // Detailed data
  quizSessions: QuizSession[];
  archetypeSegments: SegmentData[];

  // Time-based data
  leadsGrowth: {
    date: string;
    leads: number;
    completions: number;
  }[];

  // Funnel data
  funnelData: {
    stage: string;
    count: number;
    percentage: number;
  }[];
}

export interface FilterOptions {
  quizType: string;
  dateRange: string;
  status?: string;
  archetype?: string;
}

export interface ExportOptions {
  format: 'csv' | 'json';
  quizType?: string;
  dateRange?: string;
  selectedIds?: string[];
}
