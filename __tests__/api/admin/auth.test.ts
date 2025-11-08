/**
 * Tests for admin authentication API route
 */

import { POST } from '@/app/api/admin/auth/route';
import { createMockRequest } from '../../setup/test-utils';

describe('POST /api/admin/auth', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.ADMIN_ACCESS_CODE = 'test-admin-code';
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should authenticate with correct code', async () => {
    const request = createMockRequest('POST', {
      code: 'test-admin-code',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect(typeof data.token).toBe('string');
  });

  it('should reject incorrect code', async () => {
    const request = createMockRequest('POST', {
      code: 'wrong-code',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid access code');
    expect(data.token).toBeUndefined();
  });

  it('should handle missing code', async () => {
    const request = createMockRequest('POST', {});
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid access code');
  });

  it('should set httpOnly cookie on successful authentication', async () => {
    const request = createMockRequest('POST', {
      code: 'test-admin-code',
    });
    
    const response = await POST(request);
    const cookieHeader = response.headers.get('set-cookie');
    
    expect(response.status).toBe(200);
    expect(cookieHeader).toBeDefined();
    expect(cookieHeader).toContain('admin_token');
    expect(cookieHeader).toContain('HttpOnly');
  });

  it('should handle missing ADMIN_ACCESS_CODE gracefully', async () => {
    delete process.env.ADMIN_ACCESS_CODE;
    
    const request = createMockRequest('POST', {
      code: 'test-admin-code',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data.error).toBe('Admin access not configured');
  });

  it('should handle JSON parsing errors', async () => {
    const request = new Request('http://localhost:3000/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json',
    });
    
    const response = await POST(request as any);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data.error).toBe('Authentication failed');
  });
});

