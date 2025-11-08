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
  try {
    await prisma.quizAnswer.deleteMany({
      where: {
        session: {
          quizType: 'test-quiz',
        },
      },
    });
    await prisma.result.deleteMany({
      where: {
        session: {
          quizType: 'test-quiz',
        },
      },
    });
    await prisma.quizSession.deleteMany({
      where: {
        quizType: 'test-quiz',
      },
    });
  } catch (error) {
    // Ignore errors in cleanup
    console.warn('Cleanup error:', error);
  }
}

/**
 * Create test quiz session
 */
export async function createTestQuizSession(overrides: any = {}) {
  return await prisma.quizSession.create({
    data: {
      quizType: 'test-quiz',
      status: 'in_progress',
      ...overrides,
    },
  });
}

/**
 * Create test quiz question
 */
export async function createTestQuizQuestion(overrides: any = {}) {
  return await prisma.quizQuestion.create({
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
}

/**
 * Wait for async operations
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

