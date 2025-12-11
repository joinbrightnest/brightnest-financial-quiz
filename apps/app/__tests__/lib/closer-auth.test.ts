/**
 * Tests for closer authentication utilities
 */

import { getCloserIdFromToken } from '@/lib/closer-auth';
import { createMockRequest } from '../setup/testUtils';
import jwt from 'jsonwebtoken';

describe('Closer Authentication', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getCloserIdFromToken', () => {
    it('should extract closer ID from valid token', () => {
      const closerId = 'test-closer-id';
      const token = jwt.sign({ closerId }, process.env.JWT_SECRET!, { expiresIn: '7d' });

      const request = createMockRequest('GET', undefined, {
        Authorization: `Bearer ${token}`,
      });

      const result = getCloserIdFromToken(request);

      expect(result).toBe(closerId);
    });

    it('should return null for missing Authorization header', () => {
      const request = createMockRequest('GET');

      const result = getCloserIdFromToken(request);

      expect(result).toBeNull();
    });

    it('should return null for invalid token', () => {
      const request = createMockRequest('GET', undefined, {
        Authorization: 'Bearer invalid-token',
      });

      const result = getCloserIdFromToken(request);

      expect(result).toBeNull();
    });

    it('should return null for malformed Authorization header', () => {
      const request = createMockRequest('GET', undefined, {
        Authorization: 'InvalidFormat token',
      });

      const result = getCloserIdFromToken(request);

      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      const closerId = 'test-closer-id';
      const token = jwt.sign({ closerId }, process.env.JWT_SECRET!, { expiresIn: '-1h' });

      const request = createMockRequest('GET', undefined, {
        Authorization: `Bearer ${token}`,
      });

      const result = getCloserIdFromToken(request);

      expect(result).toBeNull();
    });

    it('should return null when JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET;
      delete process.env.NEXTAUTH_SECRET;

      const closerId = 'test-closer-id';
      const token = jwt.sign({ closerId }, 'test-secret', { expiresIn: '7d' });

      const request = createMockRequest('GET', undefined, {
        Authorization: `Bearer ${token}`,
      });

      // Function catches errors and returns null instead of throwing
      const result = getCloserIdFromToken(request);
      expect(result).toBeNull();
    });
  });
});

