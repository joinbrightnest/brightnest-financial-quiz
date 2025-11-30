export type UserRole = 'closer' | 'admin';
export type TabType = 'activity' | 'notes' | 'tasks';

export interface LeadDetailViewProps {
  sessionId: string;
  onClose: () => void;
  userRole: UserRole;
  leadData?: LeadData; // Optional pre-loaded data for admin
}

export interface Activity {
  id: string;
  type: string;
  timestamp: string;
  leadName?: string;
  actor?: string;
  details?: {
    outcome?: string;
    recordingLink?: string;
    notes?: string;
    closerName?: string;
    title?: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    content?: string;
  };
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
  createdByType: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  createdAt: string;
  leadEmail: string;
}

export interface LeadData {
  id: string;
  status?: string;
  completedAt?: string | null;
  dealClosedAt?: string | null;
  source?: string | null;
  quizType?: string | null;
  closer?: {
    name?: string;
  } | null;
  closerName?: string | null;
  appointment?: {
    outcome?: string | null;
    saleValue?: number | string | null;
    closer?: {
      name?: string;
    } | null;
  } | null;
  answers: Array<{
    questionText?: string;
    answer?: string;
    question?: {
      prompt?: string;
    };
    value?: string | number | object;
  }>;
}
