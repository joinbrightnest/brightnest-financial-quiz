/**
 * Tests for rate limiting utility
 */

import { rateLimit, rateLimiters } from '@/lib/rate-limit';
import { createMockRequest } from '../setup/test-utils';

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit state before each test
    jest.clearAllMocks();
  });

  describe('rateLimit function', () => {
    it('should allow requests within limit', async () => {
      const request = createMockRequest('GET');
      
      const result = await rateLimit(request, 'api');
      
      expect(result.success).toBe(true);
      expect(result.limit).toBeGreaterThan(0);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
      expect(result.reset).toBeInstanceOf(Date);
    });

    it('should identify client by IP address', async () => {
      const request1 = createMockRequest('GET', undefined, {
        'x-forwarded-for': '192.168.1.1',
      });
      const request2 = createMockRequest('GET', undefined, {
        'x-forwarded-for': '192.168.1.2',
      });
      
      const result1 = await rateLimit(request1, 'api');
      const result2 = await rateLimit(request2, 'api');
      
      // Both should succeed as they're different IPs
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it('should handle missing IP gracefully', async () => {
      const request = createMockRequest('GET', undefined, {});
      
      const result = await rateLimit(request, 'api');
      
      // Should still work, using 'unknown' as identifier
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });
  });

  describe('Rate limiters configuration', () => {
    it('should have auth rate limiter configured', () => {
      expect(rateLimiters.auth).toBeDefined();
    });

    it('should have api rate limiter configured', () => {
      expect(rateLimiters.api).toBeDefined();
    });

    it('should have page rate limiter configured', () => {
      expect(rateLimiters.page).toBeDefined();
    });

    it('should have expensive rate limiter configured', () => {
      expect(rateLimiters.expensive).toBeDefined();
    });
  });

  describe('Rate limit behavior', () => {
    it('should use in-memory fallback when Upstash not configured', async () => {
      // When Upstash is not configured, should fall back to in-memory
      const request = createMockRequest('GET');
      
      const result = await rateLimit(request, 'api');
      
      // Should still work with in-memory fallback
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });
  });
});

