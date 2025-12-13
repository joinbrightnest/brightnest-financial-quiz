/**
 * Tests for environment variable validation
 */

import { validateEnvironmentVariables, getRequiredEnv, getOptionalEnv } from '@/lib/env-validation';

describe('Environment Variable Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validateEnvironmentVariables', () => {
    it('should pass when all required variables are set', () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.JWT_SECRET = 'test-secret';
      process.env.ADMIN_PASSWORD = 'test-password';

      expect(() => validateEnvironmentVariables()).not.toThrow();
    });

    it('should throw error when DATABASE_URL is missing', () => {
      process.env.DATABASE_URL = '';
      process.env.JWT_SECRET = 'test-secret';
      process.env.ADMIN_PASSWORD = 'test-password';

      expect(() => validateEnvironmentVariables()).toThrow();
    });

    it('should throw error when JWT_SECRET is missing', () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.JWT_SECRET = '';
      process.env.ADMIN_PASSWORD = 'test-password';

      expect(() => validateEnvironmentVariables()).toThrow();
    });

    it('should throw error when ADMIN_PASSWORD is missing', () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.JWT_SECRET = 'test-secret';
      process.env.ADMIN_PASSWORD = '';

      expect(() => validateEnvironmentVariables()).toThrow();
    });

    it('should not throw when optional variables are missing', () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.JWT_SECRET = 'test-secret';
      process.env.ADMIN_PASSWORD = 'test-password';
      delete process.env.OPENAI_API_KEY;
      delete process.env.DIRECT_URL;

      expect(() => validateEnvironmentVariables()).not.toThrow();
    });
  });

  describe('getRequiredEnv', () => {
    it('should return value when variable is set', () => {
      process.env.TEST_VAR = 'test-value';

      const value = getRequiredEnv('TEST_VAR');

      expect(value).toBe('test-value');
    });

    it('should throw error when variable is missing', () => {
      delete process.env.TEST_VAR;

      expect(() => getRequiredEnv('TEST_VAR')).toThrow();
    });

    it('should throw error when variable is empty string', () => {
      process.env.TEST_VAR = '';

      expect(() => getRequiredEnv('TEST_VAR')).toThrow();
    });
  });

  describe('getOptionalEnv', () => {
    it('should return value when variable is set', () => {
      process.env.TEST_VAR = 'test-value';

      const value = getOptionalEnv('TEST_VAR', 'default');

      expect(value).toBe('test-value');
    });

    it('should return default when variable is missing', () => {
      delete process.env.TEST_VAR;

      const value = getOptionalEnv('TEST_VAR', 'default');

      expect(value).toBe('default');
    });

    it('should return default when variable is empty string', () => {
      process.env.TEST_VAR = '';

      const value = getOptionalEnv('TEST_VAR', 'default');

      expect(value).toBe('default');
    });
  });
});

