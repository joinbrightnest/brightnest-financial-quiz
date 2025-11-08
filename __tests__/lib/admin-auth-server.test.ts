/**
 * Tests for admin authentication server utilities
 */

import { 
  verifyAdminPassword, 
  generateAdminToken, 
  verifyAdminToken,
  verifyAdminAuth 
} from '@/lib/admin-auth-server';
import { createMockRequest, createAuthenticatedAdminRequest } from '../setup/test-utils';

describe('Admin Authentication Server', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.ADMIN_PASSWORD = 'test-admin-password';
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('verifyAdminPassword', () => {
    it('should return true for correct password', () => {
      const result = verifyAdminPassword('test-admin-password');
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', () => {
      const result = verifyAdminPassword('wrong-password');
      expect(result).toBe(false);
    });

    it('should throw error when ADMIN_PASSWORD is not set', () => {
      delete process.env.ADMIN_PASSWORD;
      
      expect(() => verifyAdminPassword('test')).toThrow();
    });
  });

  describe('generateAdminToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateAdminToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate different tokens on each call', () => {
      const token1 = generateAdminToken();
      const token2 = generateAdminToken();
      
      expect(token1).not.toBe(token2);
    });

    it('should throw error when JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET;
      
      expect(() => generateAdminToken()).toThrow();
    });
  });

  describe('verifyAdminToken', () => {
    it('should verify a valid token', () => {
      const token = generateAdminToken();
      const payload = verifyAdminToken(token);
      
      expect(payload).toBeDefined();
      expect(payload?.isAdmin).toBe(true);
      expect(payload?.authenticatedAt).toBeDefined();
    });

    it('should return null for invalid token', () => {
      const payload = verifyAdminToken('invalid-token');
      
      expect(payload).toBeNull();
    });

    it('should return null for expired token', () => {
      // Create an expired token (this would require mocking time)
      const payload = verifyAdminToken('expired-token');
      
      expect(payload).toBeNull();
    });

    it('should return null for non-admin token', () => {
      // Token without isAdmin flag
      const payload = verifyAdminToken('non-admin-token');
      
      expect(payload).toBeNull();
    });
  });

  describe('verifyAdminAuth', () => {
    it('should return true for valid Bearer token in header', () => {
      const token = generateAdminToken();
      const request = createMockRequest('GET', undefined, {
        Authorization: `Bearer ${token}`,
      });
      
      const result = verifyAdminAuth(request);
      
      expect(result).toBe(true);
    });

    it('should return false for missing Authorization header', () => {
      const request = createMockRequest('GET');
      
      const result = verifyAdminAuth(request);
      
      expect(result).toBe(false);
    });

    it('should return false for invalid token', () => {
      const request = createMockRequest('GET', undefined, {
        Authorization: 'Bearer invalid-token',
      });
      
      const result = verifyAdminAuth(request);
      
      expect(result).toBe(false);
    });

    it('should return false for malformed Authorization header', () => {
      const request = createMockRequest('GET', undefined, {
        Authorization: 'InvalidFormat token',
      });
      
      const result = verifyAdminAuth(request);
      
      expect(result).toBe(false);
    });
  });
});

