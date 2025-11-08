/**
 * Tests for admin basic stats API route
 */

import { GET } from '@/app/api/admin/basic-stats/route';
import { createAuthenticatedAdminRequest } from '../../setup/test-utils';
import { prisma } from '@/lib/prisma';
import { cleanupTestData, createTestQuizSession, createTestQuizQuestion } from '../../setup/test-utils';

// Mock admin auth
jest.mock('@/lib/admin-auth-server', () => ({
  verifyAdminAuth: jest.fn(() => true),
}));

describe('GET /api/admin/basic-stats', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it('should return stats for authenticated admin', async () => {
    // Create test data
    await createTestQuizSession({
      quizType: 'financial-profile',
      status: 'completed',
    });

    const request = createAuthenticatedAdminRequest('GET');
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.totalSessions).toBeDefined();
    expect(data.completedSessions).toBeDefined();
    expect(data.completionRate).toBeDefined();
    expect(data.allLeads).toBeDefined();
    expect(Array.isArray(data.allLeads)).toBe(true);
  });

  it('should return 401 for unauthenticated request', async () => {
    // Mock unauthenticated
    jest.spyOn(require('@/lib/admin-auth-server'), 'verifyAdminAuth').mockReturnValue(false);

    const request = createAuthenticatedAdminRequest('GET');
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized - Admin authentication required');
  });

  it('should filter by quiz type when provided', async () => {
    await createTestQuizSession({
      quizType: 'financial-profile',
      status: 'completed',
    });
    
    await createTestQuizSession({
      quizType: 'health-finance',
      status: 'completed',
    });

    const request = createAuthenticatedAdminRequest('GET');
    const url = new URL('http://localhost:3000/api/admin/basic-stats?quizType=financial-profile');
    const requestWithParams = new Request(url.toString(), {
      method: 'GET',
      headers: request.headers,
    });
    
    const response = await GET(requestWithParams as any);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    // Should only count financial-profile sessions
    expect(data.totalSessions).toBeGreaterThanOrEqual(1);
  });

  it('should filter by duration when provided', async () => {
    // Create recent session
    await createTestQuizSession({
      quizType: 'financial-profile',
      status: 'completed',
      createdAt: new Date(), // Recent
    });

    const request = createAuthenticatedAdminRequest('GET');
    const url = new URL('http://localhost:3000/api/admin/basic-stats?duration=24h');
    const requestWithParams = new Request(url.toString(), {
      method: 'GET',
      headers: request.headers,
    });
    
    const response = await GET(requestWithParams as any);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.totalSessions).toBeDefined();
  });

  it('should return empty stats when no data exists', async () => {
    const request = createAuthenticatedAdminRequest('GET');
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.totalSessions).toBe(0);
    expect(data.completedSessions).toBe(0);
    expect(data.completionRate).toBe(0);
    expect(data.allLeads).toEqual([]);
  });

  it('should include question analytics', async () => {
    await createTestQuizQuestion({
      quizType: 'financial-profile',
      order: 1,
    });

    const request = createAuthenticatedAdminRequest('GET');
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.questionAnalytics).toBeDefined();
    expect(Array.isArray(data.questionAnalytics)).toBe(true);
  });

  it('should include daily activity data', async () => {
    const request = createAuthenticatedAdminRequest('GET');
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.dailyActivity).toBeDefined();
    expect(Array.isArray(data.dailyActivity)).toBe(true);
  });

  it('should include clicks activity data', async () => {
    const request = createAuthenticatedAdminRequest('GET');
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.clicksActivity).toBeDefined();
    expect(Array.isArray(data.clicksActivity)).toBe(true);
  });
});

