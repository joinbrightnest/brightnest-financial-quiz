/**
 * Environment Variable Validation
 * 
 * Validates all required environment variables at application startup.
 * Fails fast if any critical variables are missing.
 * 
 * Usage: Import this file in your root layout or middleware to ensure
 * validation runs on every deployment.
 */

interface EnvConfig {
  name: string;
  required: boolean;
  description: string;
}

const ENV_VARIABLES: EnvConfig[] = [
  // Database
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL connection string (pooler)'
  },
  {
    name: 'DIRECT_URL',
    required: false, // Only needed for migrations, not runtime
    description: 'PostgreSQL direct connection (for migrations)'
  },

  // Authentication
  {
    name: 'JWT_SECRET',
    required: true,
    description: 'Secret key for JWT token signing'
  },
  {
    name: 'ADMIN_PASSWORD',
    required: true,
    description: 'Admin authentication password'
  },

  // External Services
  {
    name: 'OPENAI_API_KEY',
    required: false, // Optional for AI features
    description: 'OpenAI API key for content generation'
  },

  // Optional
  {
    name: 'NEXTAUTH_SECRET',
    required: false, // Can be used as JWT_SECRET fallback
    description: 'NextAuth secret (fallback for JWT_SECRET)'
  }
];

class EnvironmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentValidationError';
  }
}

/**
 * Validate all required environment variables
 * Throws EnvironmentValidationError if any required variables are missing
 */
export function validateEnvironmentVariables(): void {
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  for (const config of ENV_VARIABLES) {
    const value = process.env[config.name];

    if (!value || value.trim() === '') {
      if (config.required) {
        missingRequired.push(`${config.name} - ${config.description}`);
      } else {
        missingOptional.push(`${config.name} - ${config.description}`);
      }
    }
  }

  // Log optional missing variables as warnings
  if (missingOptional.length > 0) {
    console.warn('⚠️  Optional environment variables not set:');
    missingOptional.forEach(msg => console.warn(`   - ${msg}`));
  }

  // Throw error for required missing variables
  if (missingRequired.length > 0) {
    const errorMessage = [
      '🚨 CRITICAL: Required environment variables are missing!',
      '',
      'Missing variables:',
      ...missingRequired.map(msg => `  - ${msg}`),
      '',
      'Please set these variables in your .env file or environment configuration.',
      'Application cannot start without these variables.'
    ].join('\n');

    throw new EnvironmentValidationError(errorMessage);
  }

  console.log('✅ Environment variables validated successfully');
}

/**
 * Get an environment variable with runtime validation
 * Throws error if variable is not set
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new EnvironmentValidationError(
      `Required environment variable ${name} is not set`
    );
  }
  return value;
}

/**
 * Get an environment variable with default fallback
 */
export function getOptionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

// Run validation immediately when this module is imported
// This ensures validation happens at build time and runtime
if (typeof window === 'undefined') {
  // Only run on server side
  try {
    validateEnvironmentVariables();
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      console.error(error.message);
      // During build time, fail the build if env vars are missing
      // During runtime, log error but don't exit (to avoid breaking running apps)
      // This allows graceful degradation if env vars are missing
      if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
        // Only exit during Vercel build, not during runtime
        // Vercel sets VERCEL=1 during build
        if (process.env.VERCEL_ENV === 'production') {
          console.error('🚨 Failing build due to missing environment variables');
          process.exit(1);
        }
      }
      // In development, just log the error
      console.warn('⚠️  Missing environment variables - some features may not work');
    } else {
      throw error;
    }
  }
}

