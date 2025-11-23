/**
 * Tests for quiz result API route
 * 
 * NOTE: These are integration tests that require a test database.
 * To run these tests, set up a test database and configure DATABASE_URL:
 * 
 * 1. Create a test database:
 *    createdb brightnest_test
 * 
 * 2. Set DATABASE_URL in your test environment:
 *    export DATABASE_URL="postgresql://user:pass@localhost:5432/brightnest_test"
 * 
 * 3. Run migrations:
 *    DATABASE_URL="postgresql://..." npx prisma migrate deploy
 * 
 * For now, these tests are skipped in CI/CD and require manual setup.
 */

// ✅ Unmock Prisma for integration tests
jest.unmock('@/lib/prisma');

import { POST } from '@/app/api/quiz/result/route';
import { createMockRequest } from '../../setup/test-utils';
import { prisma } from '@/lib/prisma';
import { cleanupTestData, createTestQuizSession, createTestQuizQuestion } from '../../setup/test-utils';

describe('POST /api/quiz/result', () => {
  let session: any;
  let question1: any;
  let question2: any;

  beforeEach(async () => {
    await cleanupTestData();
    
    session = await createTestQuizSession({
      quizType: 'financial-profile',
      status: 'in_progress',
    });
    
    // ✅ Verify session was created
    expect(session).toBeDefined();
    expect(session.id).toBeTruthy();
    console.log('✓ Test session created:', session.id);
    
    question1 = await createTestQuizQuestion({
      quizType: 'financial-profile',
      order: 1,
      prompt: 'Question 1?',
      options: [
        { value: 'option1', label: 'Option 1', weightCategory: 'savings', weightValue: 2 },
        { value: 'option2', label: 'Option 2', weightCategory: 'debt', weightValue: 1 },
      ],
    });
    
    // ✅ Verify question1 was created
    expect(question1).toBeDefined();
    expect(question1.id).toBeTruthy();
    console.log('✓ Test question1 created:', question1.id);
    
    question2 = await createTestQuizQuestion({
      quizType: 'financial-profile',
      order: 2,
      prompt: 'Question 2?',
      options: [
        { value: 'option1', label: 'Option 1', weightCategory: 'savings', weightValue: 1 },
        { value: 'option2', label: 'Option 2', weightCategory: 'spending', weightValue: 2 },
      ],
    });
    
    // ✅ Verify question2 was created
    expect(question2).toBeDefined();
    expect(question2.id).toBeTruthy();
    console.log('✓ Test question2 created:', question2.id);
    
    // Create answers
    await prisma.quizAnswer.create({
      data: {
        sessionId: session.id,
        questionId: question1.id,
        value: 'option1',
      },
    });
    
    console.log('✓ Test answer1 created');
    
    await prisma.quizAnswer.create({
      data: {
        sessionId: session.id,
        questionId: question2.id,
        value: 'option1',
      },
    });
    
    console.log('✓ Test answer2 created');
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it('should calculate scores and archetype', async () => {
    const request = createMockRequest('POST', {
      sessionId: session.id,
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.sessionId).toBe(session.id);
    expect(data.archetype).toBeDefined();
    expect(data.scores).toBeDefined();
    expect(data.totalPoints).toBeGreaterThan(0);
    expect(data.qualifiesForCall).toBeDefined();
  });

  it('should mark session as completed', async () => {
    const request = createMockRequest('POST', {
      sessionId: session.id,
    });
    
    await POST(request);
    
    const updatedSession = await prisma.quizSession.findUnique({
      where: { id: session.id },
    });
    
    expect(updatedSession?.status).toBe('completed');
    expect(updatedSession?.completedAt).toBeDefined();
  });

  it('should create result record', async () => {
    const request = createMockRequest('POST', {
      sessionId: session.id,
    });
    
    await POST(request);
    
    const result = await prisma.result.findUnique({
      where: { sessionId: session.id },
    });
    
    expect(result).toBeDefined();
    expect(result?.archetype).toBeDefined();
    expect(result?.scores).toBeDefined();
  });

  it('should calculate duration from session start', async () => {
    // Wait a bit to simulate time passing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const request = createMockRequest('POST', {
      sessionId: session.id,
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(data.durationMs).toBeGreaterThan(0);
    
    const updatedSession = await prisma.quizSession.findUnique({
      where: { id: session.id },
    });
    
    expect(updatedSession?.durationMs).toBeGreaterThan(0);
  });

  it('should use qualification threshold from settings', async () => {
    // Create settings record
    await prisma.settings.upsert({
      where: { key: 'qualification_threshold' },
      update: { value: '20' },
      create: { key: 'qualification_threshold', value: '20' },
    });

    const request = createMockRequest('POST', {
      sessionId: session.id,
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(data.qualifiesForCall).toBe(data.totalPoints >= 20);
  });

  it('should default to threshold 17 if settings not found', async () => {
    const request = createMockRequest('POST', {
      sessionId: session.id,
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(data.qualifiesForCall).toBe(data.totalPoints >= 17);
  });

  it('should return 404 for non-existent session', async () => {
    const request = createMockRequest('POST', {
      sessionId: 'non-existent-id',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(404);
    expect(data.error).toBe('Session not found');
  });

  it('should handle session with no answers', async () => {
    // Create session without answers
    const emptySession = await createTestQuizSession({
      quizType: 'financial-profile',
      status: 'in_progress',
    });

    const request = createMockRequest('POST', {
      sessionId: emptySession.id,
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.totalPoints).toBe(0);
    expect(data.qualifiesForCall).toBe(false);
  });
});

