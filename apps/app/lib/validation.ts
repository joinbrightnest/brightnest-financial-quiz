/**
 * Input Validation Schemas
 * 
 * Provides Zod schemas for validating API request inputs.
 * Protects against invalid data, injection attacks, and malformed requests.
 */

import { z } from 'zod';

// ====================
// Quiz Validation Schemas
// ====================

export const quizStartSchema = z.object({
  quizType: z.string().min(1).max(100),
  affiliateCode: z.string().min(1).max(100).optional(),
});

export const quizAnswerSchema = z.object({
  sessionId: z.string().cuid(),
  questionId: z.string().cuid(),
  value: z.union([
    z.string().max(5000),  // Text answers (max 5000 chars)
    z.array(z.string()).max(50),  // Multiple choice (max 50 selections)
    z.number(),
    z.boolean(),
  ]),
  dwellMs: z.number().min(0).max(3600000).optional(),  // Max 1 hour dwell time
  checkArticles: z.boolean().optional(),
});

export const quizResultSchema = z.object({
  sessionId: z.string().cuid(),
});

// ====================
// Admin Validation Schemas
// ====================

export const adminStatsSchema = z.object({
  duration: z.enum(['24h', '7d', '30d', '90d', '1y', 'all']).optional(),
  quizType: z.string().optional(),
  affiliateCode: z.string().optional(),
});

export const adminAuthSchema = z.object({
  password: z.string().min(1).max(100),
  accessCode: z.string().min(1).max(100).optional(),
});

// ====================
// Affiliate Validation Schemas
// ====================

export const affiliateSignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  tier: z.enum(['quiz', 'creator', 'agency']).optional(),
});

export const affiliateLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(100),
});

export const affiliateStatsSchema = z.object({
  dateRange: z.enum(['24h', '7d', '30d', '90d', '1y', 'all']).optional(),
});

// ====================
// Closer Validation Schemas
// ====================

export const closerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(100),
});

export const closerSignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().min(10).max(20).optional(),
});

export const appointmentOutcomeSchema = z.object({
  outcome: z.enum([
    'converted',
    'not_interested',
    'needs_follow_up',
    'wrong_number',
    'no_answer',
    'callback_requested',
    'rescheduled'
  ]),
  notes: z.string().max(5000).optional(),
  saleValue: z.number().min(0).max(1000000).optional(),
  recordingLink: z.string().url().max(500).optional(),
});

// ====================
// Query Parameter Schemas
// ====================

/**
 * Common dateRange parameter used across stats endpoints
 */
export const dateRangeSchema = z.enum(['24h', '7d', '30d', '90d', '1y', 'all']).default('30d');

/**
 * Affiliate status filter (for admin dashboard)
 */
export const affiliateStatusSchema = z.enum(['approved', 'pending', 'all']).default('approved');

/**
 * Affiliate tier filter
 */
export const affiliateTierSchema = z.enum(['quiz', 'creator', 'agency', 'all']).default('all');

/**
 * Payout status filter
 */
export const payoutStatusSchema = z.enum(['pending', 'completed', 'cancelled', 'all']).default('all');

/**
 * Pagination parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

/**
 * Common query params for affiliate admin routes
 */
export const affiliateListQuerySchema = z.object({
  status: affiliateStatusSchema.optional(),
  tier: affiliateTierSchema.optional(),
  dateRange: dateRangeSchema.optional(),
});

/**
 * Query params for payouts admin route
 */
export const payoutsQuerySchema = z.object({
  status: payoutStatusSchema.optional(),
  affiliateId: z.string().cuid().optional(),
  dateRange: dateRangeSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

/**
 * Query params for affiliate stats routes
 */
export const affiliateStatsQuerySchema = z.object({
  affiliateCode: z.string().min(1).max(100),
  dateRange: dateRangeSchema.optional(),
});

/**
 * Email query parameter (used in notes, leads, tasks)
 */
export const emailQuerySchema = z.object({
  email: z.string().email(),
});

/**
 * Lead email query parameter
 */
export const leadEmailQuerySchema = z.object({
  leadEmail: z.string().email(),
});

/**
 * Quiz type query parameter
 */
export const quizTypeQuerySchema = z.object({
  quizType: z.string().min(1).max(100).optional(),
});

/**
 * Helper to parse query params from URL searchParams
 */
export function parseQueryParams<T>(
  schema: z.Schema<T>,
  searchParams: URLSearchParams
): { success: true; data: T } | { success: false; error: string } {
  const params: Record<string, string | undefined> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return validateRequest(schema, params);
}

// ====================
// Helper Functions
// ====================

/**
 * Validate request data against a schema
 * Returns validated data or error message
 */
export function validateRequest<T>(
  schema: z.Schema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const errorMessages = (error as z.ZodError).issues
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return {
        success: false,
        error: `Validation failed: ${errorMessages}`,
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}

/**
 * Validate request data and return NextResponse with error if invalid
 * This is a convenience function for API routes
 */
export function validateRequestOrError<T>(
  schema: z.Schema<T>,
  data: unknown
): { data: T } | { error: Response } {
  const validation = validateRequest(schema, data);

  if (!validation.success) {
    return {
      error: new Response(
        JSON.stringify({ error: validation.error }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      ),
    };
  }

  return { data: validation.data };
}

// ====================
// Type Exports
// ====================

export type QuizStartInput = z.infer<typeof quizStartSchema>;
export type QuizAnswerInput = z.infer<typeof quizAnswerSchema>;
export type QuizResultInput = z.infer<typeof quizResultSchema>;
export type AdminStatsInput = z.infer<typeof adminStatsSchema>;
export type AdminAuthInput = z.infer<typeof adminAuthSchema>;
export type AffiliateSignupInput = z.infer<typeof affiliateSignupSchema>;
export type AffiliateLoginInput = z.infer<typeof affiliateLoginSchema>;
export type AffiliateStatsInput = z.infer<typeof affiliateStatsSchema>;
export type CloserLoginInput = z.infer<typeof closerLoginSchema>;
export type CloserSignupInput = z.infer<typeof closerSignupSchema>;
export type AppointmentOutcomeInput = z.infer<typeof appointmentOutcomeSchema>;

