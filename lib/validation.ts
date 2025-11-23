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
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
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

