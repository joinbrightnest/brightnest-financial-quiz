/**
 * Tests for quiz start API route
 */

import { POST } from '@/app/api/quiz/start/route';
import { createMockRequest } from '../../setup/test-utils';
import { prisma } from '@/lib/prisma';
import { cleanupTestData, createTestQuizQuestion } from '../../setup/test-utils';

describe('POST /api/quiz/start', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it('should create a new quiz session and return first question', async () => {
    // Create a test question
    const question = await createTestQuizQuestion({
      quizType: 'financial-profile',
      order: 1,
      prompt: 'What is your financial goal?',
    });

    const request = createMockRequest('POST', {
      quizType: 'financial-profile',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.sessionId).toBeDefined();
    expect(data.question).toBeDefined();
    expect(data.question.id).toBe(question.id);
    expect(data.question.quizType).toBe('financial-profile');
    
    // Verify session was created in database
    const session = await prisma.quizSession.findUnique({
      where: { id: data.sessionId },
    });
    
    expect(session).toBeDefined();
    expect(session?.quizType).toBe('financial-profile');
    expect(session?.status).toBe('in_progress');
  });

  it('should handle affiliate code in request', async () => {
    await createTestQuizQuestion({
      quizType: 'financial-profile',
      order: 1,
    });

    const request = createMockRequest('POST', {
      quizType: 'financial-profile',
      affiliateCode: 'test-affiliate',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    
    // Verify affiliate code was saved
    const session = await prisma.quizSession.findUnique({
      where: { id: data.sessionId },
    });
    
    expect(session?.affiliateCode).toBe('test-affiliate');
  });

  it('should return 404 when no questions available', async () => {
    // Don't create any questions
    
    const request = createMockRequest('POST', {
      quizType: 'non-existent-quiz',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(404);
    expect(data.error).toBe('No questions available for this quiz type');
  });

  it('should default to financial-profile quiz type', async () => {
    await createTestQuizQuestion({
      quizType: 'financial-profile',
      order: 1,
    });

    const request = createMockRequest('POST', {});
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.question.quizType).toBe('financial-profile');
  });

  it('should return first question ordered by order field', async () => {
    // Create questions in reverse order
    await createTestQuizQuestion({
      quizType: 'financial-profile',
      order: 2,
      prompt: 'Second question',
    });
    
    const firstQuestion = await createTestQuizQuestion({
      quizType: 'financial-profile',
      order: 1,
      prompt: 'First question',
    });

    const request = createMockRequest('POST', {
      quizType: 'financial-profile',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.question.id).toBe(firstQuestion.id);
    expect(data.question.prompt).toBe('First question');
  });

  it('should only return active questions', async () => {
    await createTestQuizQuestion({
      quizType: 'financial-profile',
      order: 1,
      active: false, // Inactive question
    });
    
    const activeQuestion = await createTestQuizQuestion({
      quizType: 'financial-profile',
      order: 2,
      active: true,
    });

    const request = createMockRequest('POST', {
      quizType: 'financial-profile',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.question.id).toBe(activeQuestion.id);
  });
});

