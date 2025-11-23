/**
 * Test utilities and helpers
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Create a mock NextRequest for testing API routes
 */
export function createMockRequest(
  method: string = 'GET',
  body?: any,
  headers: Record<string, string> = {}
): NextRequest {
  const url = 'http://localhost:3000/api/test';
  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(url, requestInit);
}

/**
 * Create a mock authenticated request (admin)
 */
export function createAuthenticatedAdminRequest(
  method: string = 'GET',
  body?: any
): NextRequest {
  const token = 'test-admin-token';
  return createMockRequest(method, body, {
    Authorization: `Bearer ${token}`,
  });
}

/**
 * Create a mock authenticated request (closer)
 */
export function createAuthenticatedCloserRequest(
  method: string = 'GET',
  body?: any
): NextRequest {
  const token = 'test-closer-token';
  return createMockRequest(method, body, {
    Authorization: `Bearer ${token}`,
  });
}

/**
 * Clean up test data from database
 */
export async function cleanupTestData() {
  // Clean up in reverse order of dependencies
  // Clean up ALL test quiz types to prevent test interference
  const testQuizTypes = ['test-quiz', 'financial-profile', 'health-finance', 'marriage-finance'];
  
  try {
    // Delete answers first
    await prisma.quizAnswer.deleteMany({
      where: {
        session: {
          quizType: {
            in: testQuizTypes,
          },
        },
      },
    });
    
    // Delete results
    await prisma.result.deleteMany({
      where: {
        session: {
          quizType: {
            in: testQuizTypes,
          },
        },
      },
    });
    
    // Delete sessions
    await prisma.quizSession.deleteMany({
      where: {
        quizType: {
          in: testQuizTypes,
        },
      },
    });
    
    // Delete questions (only test questions)
    await prisma.quizQuestion.deleteMany({
      where: {
        quizType: {
          in: testQuizTypes,
        },
      },
    });
    
    console.log('✓ Test data cleaned up');
  } catch (error) {
    // Log errors but don't throw
    console.warn('Cleanup error (non-critical):', error);
  }
}

/**
 * Create test quiz session
 */
export async function createTestQuizSession(overrides: any = {}) {
  try {
    const session = await prisma.quizSession.create({
      data: {
        quizType: 'test-quiz',
        status: 'in_progress',
        ...overrides,
      },
    });
    
    if (!session || !session.id) {
      throw new Error('Failed to create test session - session or session.id is undefined');
    }
    
    console.log('✓ Test session created successfully:', session.id);
    return session;
  } catch (error) {
    console.error('Error creating test session:', error);
    throw error;
  }
}

/**
 * Create test quiz question
 */
export async function createTestQuizQuestion(overrides: any = {}) {
  try {
    const question = await prisma.quizQuestion.create({
      data: {
        quizType: 'test-quiz',
        order: 1,
        prompt: 'Test question?',
        type: 'single',
        active: true,
        options: [
          { value: 'option1', label: 'Option 1', weightCategory: 'savings', weightValue: 1 },
          { value: 'option2', label: 'Option 2', weightCategory: 'debt', weightValue: 1 },
        ],
        ...overrides,
      },
    });
    
    if (!question || !question.id) {
      throw new Error('Failed to create test question - question or question.id is undefined');
    }
    
    console.log('✓ Test question created successfully:', question.id);
    return question;
  } catch (error) {
    console.error('Error creating test question:', error);
    throw error;
  }
}

/**
 * Wait for async operations
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

