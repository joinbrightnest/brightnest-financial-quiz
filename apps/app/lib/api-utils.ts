import { NextResponse } from 'next/server';

/**
 * Standard API error codes for consistent error handling
 */
export const ApiErrorCodes = {
    // Authentication & Authorization
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    INVALID_TOKEN: 'INVALID_TOKEN',

    // Validation
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
    INVALID_INPUT: 'INVALID_INPUT',

    // Resources
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',

    // Rate Limiting
    RATE_LIMITED: 'RATE_LIMITED',

    // Server Errors
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
} as const;

export type ApiErrorCode = typeof ApiErrorCodes[keyof typeof ApiErrorCodes];

/**
 * Standard API error response interface
 */
export interface ApiErrorResponse {
    error: string;
    code?: ApiErrorCode;
    details?: string;
}

/**
 * Creates a standardized API error response
 * 
 * @param message - Human-readable error message
 * @param status - HTTP status code
 * @param code - Optional error code for programmatic handling
 * @param details - Optional additional details (only in development)
 */
export function apiError(
    message: string,
    status: number,
    code?: ApiErrorCode,
    details?: string
): NextResponse<ApiErrorResponse> {
    const response: ApiErrorResponse = { error: message };

    if (code) {
        response.code = code;
    }

    // Only include details in non-production environments
    if (details && process.env.NODE_ENV !== 'production') {
        response.details = details;
    }

    return NextResponse.json(response, { status });
}

/**
 * Handles catch block errors consistently
 * Logs the error and returns a standardized 500 response
 * 
 * @param error - The caught error
 * @param context - Context string for logging (e.g., "creating payout")
 */
export function handleApiError(
    error: unknown,
    context: string
): NextResponse<ApiErrorResponse> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`❌ Error ${context}:`, error);

    return apiError(
        `Failed ${context}`,
        500,
        ApiErrorCodes.INTERNAL_ERROR,
        errorMessage
    );
}

// Convenience functions for common error types
export const apiErrors = {
    unauthorized: (message = 'Unauthorized') =>
        apiError(message, 401, ApiErrorCodes.UNAUTHORIZED),

    forbidden: (message = 'Forbidden') =>
        apiError(message, 403, ApiErrorCodes.FORBIDDEN),

    notFound: (resource = 'Resource') =>
        apiError(`${resource} not found`, 404, ApiErrorCodes.NOT_FOUND),

    badRequest: (message: string) =>
        apiError(message, 400, ApiErrorCodes.VALIDATION_ERROR),

    validationFailed: (details: string) =>
        apiError(`Validation failed: ${details}`, 400, ApiErrorCodes.VALIDATION_ERROR),

    rateLimited: () =>
        apiError('Too many requests', 429, ApiErrorCodes.RATE_LIMITED),

    configError: (message = 'Configuration error') =>
        apiError(message, 500, ApiErrorCodes.CONFIGURATION_ERROR),
};
