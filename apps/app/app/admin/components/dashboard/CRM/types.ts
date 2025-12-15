// Shared types for CRM components

export interface Answer {
    question?: {
        prompt?: string;
    };
    value?: string | number | object;
}

export interface Lead {
    id: string;
    answers: Answer[];
    createdAt: string;
    status: string;
    completedAt?: string | null;
    affiliateCode?: string;
    appointment?: {
        outcome?: string | null;
        saleValue?: number | string | null;
        createdAt?: string | null;
        closer?: {
            name?: string;
        } | null;
    } | null;
    saleValue?: number | string | null;
    closerName?: string | null;
    source?: string;
}

export interface VisibleColumns {
    checkbox: boolean;
    name: boolean;
    stage: boolean;
    date: boolean;
    owner: boolean;
    amount: boolean;
    source: boolean;
    actions: boolean;
}
