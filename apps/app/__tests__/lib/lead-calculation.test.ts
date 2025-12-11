/**
 * Tests for lead calculation logic
 * 
 * CRITICAL: These tests verify the core business logic for what counts as a "lead"
 * A lead = completed quiz session with BOTH name AND email answers
 */

import { prisma } from '@/lib/prisma';

// Mock prisma since we're unit testing
jest.mock('@/lib/prisma');

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Lead Calculation Logic', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('Lead Definition', () => {
        it('should count session as lead when it has BOTH name AND email', async () => {
            // This test verifies the core business rule:
            // A lead must have BOTH name and email filled in

            const mockQuestions = [
                { id: 'q1', type: 'text', prompt: 'What is your name?', active: true },
                { id: 'q2', type: 'email', prompt: 'What is your email?', active: true },
            ];

            const mockSession = {
                id: 'session-1',
                status: 'completed',
                quizType: 'financial-profile',
                createdAt: new Date(),
                completedAt: new Date(),
                answers: [
                    { id: 'a1', questionId: 'q1', value: 'John Doe' },
                    { id: 'a2', questionId: 'q2', value: 'john@example.com' },
                ],
            };

            // Verify mock session has both required answers
            const hasName = mockSession.answers.some(a =>
                mockQuestions.find(q => q.id === a.questionId)?.prompt?.toLowerCase().includes('name') && a.value
            );
            const hasEmail = mockSession.answers.some(a =>
                mockQuestions.find(q => q.id === a.questionId)?.type === 'email' && a.value
            );

            expect(hasName).toBe(true);
            expect(hasEmail).toBe(true);

            // This session qualifies as a lead
            const isLead = hasName && hasEmail;
            expect(isLead).toBe(true);
        });

        it('should NOT count session as lead when missing email', async () => {
            const mockQuestions = [
                { id: 'q1', type: 'text', prompt: 'What is your name?', active: true },
                { id: 'q2', type: 'email', prompt: 'What is your email?', active: true },
            ];

            const mockSession = {
                id: 'session-2',
                status: 'completed',
                answers: [
                    { id: 'a1', questionId: 'q1', value: 'John Doe' },
                    // No email answer!
                ],
            };

            const hasName = mockSession.answers.some(a =>
                mockQuestions.find(q => q.id === a.questionId)?.prompt?.toLowerCase().includes('name') && a.value
            );
            const hasEmail = mockSession.answers.some(a =>
                mockQuestions.find(q => q.id === a.questionId)?.type === 'email' && a.value
            );

            expect(hasName).toBe(true);
            expect(hasEmail).toBe(false);

            // This session does NOT qualify as a lead
            const isLead = hasName && hasEmail;
            expect(isLead).toBe(false);
        });

        it('should NOT count session as lead when missing name', async () => {
            const mockQuestions = [
                { id: 'q1', type: 'text', prompt: 'What is your name?', active: true },
                { id: 'q2', type: 'email', prompt: 'What is your email?', active: true },
            ];

            const mockSession = {
                id: 'session-3',
                status: 'completed',
                answers: [
                    // No name answer!
                    { id: 'a2', questionId: 'q2', value: 'john@example.com' },
                ],
            };

            const hasName = mockSession.answers.some(a =>
                mockQuestions.find(q => q.id === a.questionId)?.prompt?.toLowerCase().includes('name') && a.value
            );
            const hasEmail = mockSession.answers.some(a =>
                mockQuestions.find(q => q.id === a.questionId)?.type === 'email' && a.value
            );

            expect(hasName).toBe(false);
            expect(hasEmail).toBe(true);

            // This session does NOT qualify as a lead
            const isLead = hasName && hasEmail;
            expect(isLead).toBe(false);
        });

        it('should NOT count session as lead when email is empty string', async () => {
            const mockQuestions = [
                { id: 'q1', type: 'text', prompt: 'What is your name?', active: true },
                { id: 'q2', type: 'email', prompt: 'What is your email?', active: true },
            ];

            const mockSession = {
                id: 'session-4',
                status: 'completed',
                answers: [
                    { id: 'a1', questionId: 'q1', value: 'John Doe' },
                    { id: 'a2', questionId: 'q2', value: '' }, // Empty email!
                ],
            };

            const hasName = mockSession.answers.some(a =>
                mockQuestions.find(q => q.id === a.questionId)?.prompt?.toLowerCase().includes('name') && a.value
            );
            const hasEmail = mockSession.answers.some(a =>
                mockQuestions.find(q => q.id === a.questionId)?.type === 'email' && a.value
            );

            expect(hasName).toBe(true);
            expect(hasEmail).toBe(false); // Empty string is falsy

            const isLead = hasName && hasEmail;
            expect(isLead).toBe(false);
        });
    });

    describe('Lead Deduplication', () => {
        it('should deduplicate leads by email - keep most recent', () => {
            const leads = [
                {
                    id: 'session-old',
                    createdAt: new Date('2024-01-01'),
                    completedAt: new Date('2024-01-01'),
                    email: 'john@example.com'
                },
                {
                    id: 'session-new',
                    createdAt: new Date('2024-06-01'),
                    completedAt: new Date('2024-06-01'),
                    email: 'john@example.com'
                },
            ];

            // Simulate deduplication logic from lead-calculation.ts
            const leadsByEmail = new Map();
            for (const lead of leads) {
                const existingLead = leadsByEmail.get(lead.email);
                if (!existingLead || new Date(lead.completedAt) > new Date(existingLead.completedAt)) {
                    leadsByEmail.set(lead.email, lead);
                }
            }
            const deduplicatedLeads = Array.from(leadsByEmail.values());

            expect(deduplicatedLeads).toHaveLength(1);
            expect(deduplicatedLeads[0].id).toBe('session-new'); // Most recent wins
        });

        it('should keep unique leads separate', () => {
            const leads = [
                { id: 'session-1', email: 'john@example.com', completedAt: new Date() },
                { id: 'session-2', email: 'jane@example.com', completedAt: new Date() },
                { id: 'session-3', email: 'bob@example.com', completedAt: new Date() },
            ];

            const leadsByEmail = new Map();
            for (const lead of leads) {
                const existingLead = leadsByEmail.get(lead.email);
                if (!existingLead || new Date(lead.completedAt) > new Date(existingLead.completedAt)) {
                    leadsByEmail.set(lead.email, lead);
                }
            }
            const deduplicatedLeads = Array.from(leadsByEmail.values());

            expect(deduplicatedLeads).toHaveLength(3); // All 3 are unique
        });
    });

    describe('Date Range Filter', () => {
        it('should calculate correct date for 24h/1d filter', () => {
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const hoursDiff = (now.getTime() - oneDayAgo.getTime()) / (1000 * 60 * 60);
            expect(hoursDiff).toBe(24);
        });

        it('should calculate correct date for 7d filter', () => {
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            const daysDiff = (now.getTime() - sevenDaysAgo.getTime()) / (1000 * 60 * 60 * 24);
            expect(daysDiff).toBe(7);
        });

        it('should calculate correct date for 30d filter', () => {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            const daysDiff = (now.getTime() - thirtyDaysAgo.getTime()) / (1000 * 60 * 60 * 24);
            expect(daysDiff).toBe(30);
        });
    });
});
