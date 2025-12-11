/**
 * Tests for quiz answer API route
 */

import { POST } from '@/app/api/quiz/answer/route';
import { createMockRequest } from '../../setup/testUtils';
import { prisma } from '@/lib/prisma';
import { cleanupTestData, createTestQuizSession, createTestQuizQuestion } from '../../setup/testUtils';

describe('POST /api/quiz/answer', () => {
  let session: any;
  let question: any;
  let nextQuestion: any;

  beforeEach(async () => {
    await cleanupTestData();
    
    session = await createTestQuizSession({
      quizType: 'financial-profile',
      status: 'in_progress',
    });
    
    question = await createTestQuizQuestion({
      quizType: 'financial-profile',
      order: 1,
      prompt: 'First question?',
    });
    
    nextQuestion = await createTestQuizQuestion({
      quizType: 'financial-profile',
      order: 2,
      prompt: 'Second question?',
    });
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it('should save answer and return next question', async () => {
    const request = createMockRequest('POST', {
      sessionId: session.id,
      questionId: question.id,
      value: 'option1',
      dwellMs: 5000,
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.nextQuestion).toBeDefined();
    expect(data.nextQuestion.id).toBe(nextQuestion.id);
    expect(data.isComplete).toBe(false);
    
    // Verify answer was saved
    const answer = await prisma.quizAnswer.findFirst({
      where: {
        sessionId: session.id,
        questionId: question.id,
      },
    });
    
    expect(answer).toBeDefined();
    expect(answer?.value).toBe('option1');
    expect(answer?.dwellMs).toBe(5000);
  });

  it('should update existing answer if already answered', async () => {
    // Create initial answer
    await prisma.quizAnswer.create({
      data: {
        sessionId: session.id,
        questionId: question.id,
        value: 'option1',
      },
    });

    const request = createMockRequest('POST', {
      sessionId: session.id,
      questionId: question.id,
      value: 'option2',
      dwellMs: 3000,
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(200);
    
    // Verify answer was updated
    const answer = await prisma.quizAnswer.findFirst({
      where: {
        sessionId: session.id,
        questionId: question.id,
      },
    });
    
    expect(answer?.value).toBe('option2');
    expect(answer?.dwellMs).toBe(3000);
  });

  it('should return isComplete when no more questions', async () => {
    // Delete next question
    await prisma.quizQuestion.delete({
      where: { id: nextQuestion.id },
    });

    const request = createMockRequest('POST', {
      sessionId: session.id,
      questionId: question.id,
      value: 'option1',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.isComplete).toBe(true);
    expect(data.nextQuestion).toBeNull();
  });

  it('should handle preload requests without saving answer', async () => {
    const request = createMockRequest('POST', {
      sessionId: session.id,
      questionId: question.id,
      value: 'preload',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.nextQuestion).toBeDefined();
    
    // Verify answer was NOT saved for preload
    const answer = await prisma.quizAnswer.findFirst({
      where: {
        sessionId: session.id,
        questionId: question.id,
      },
    });
    
    expect(answer).toBeNull();
  });

  it('should return loading screen if configured', async () => {
    // Create loading screen
    await prisma.loadingScreen.create({
      data: {
        quizType: 'financial-profile',
        triggerQuestionId: question.id,
        isActive: true,
        title: 'Loading...',
        content: 'Please wait',
      },
    });

    const request = createMockRequest('POST', {
      sessionId: session.id,
      questionId: question.id,
      value: 'option1',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.loadingScreen).toBeDefined();
    expect(data.loadingScreen.title).toBe('Loading...');
  });

  it('should return 404 for non-existent question', async () => {
    const request = createMockRequest('POST', {
      sessionId: session.id,
      questionId: 'non-existent-id',
      value: 'option1',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(404);
    expect(data.error).toBe('Question not found');
  });

  it('should handle JSON values in answer', async () => {
    const jsonValue = { selected: 'option1', confidence: 0.8 };
    
    const request = createMockRequest('POST', {
      sessionId: session.id,
      questionId: question.id,
      value: jsonValue,
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(200);
    
    // Verify JSON value was saved
    const answer = await prisma.quizAnswer.findFirst({
      where: {
        sessionId: session.id,
        questionId: question.id,
      },
    });
    
    expect(answer?.value).toEqual(jsonValue);
  });
});

