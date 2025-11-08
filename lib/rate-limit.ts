/**
 * Rate Limiting Utility
 * 
 * Protects API endpoints from abuse and DDoS attacks.
 * Uses Upstash Redis for distributed rate limiting across serverless functions.
 * 
 * Usage:
 * ```typescript
 * import { rateLimit } from '@/lib/rate-limit';
 * 
 * export async function POST(request: Request) {
 *   const rateLimitResult = await rateLimit(request);
 *   if (!rateLimitResult.success) {
 *     return new Response('Too Many Requests', { status: 429 });
 *   }
 *   // ... your API logic
 * }
 * ```
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client
// If Upstash is not configured, fall back to in-memory rate limiting
let redis: Redis | null = null;
let upstashConfigured = false;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
    upstashConfigured = true;
    console.log('✅ Upstash Redis configured for rate limiting');
  } else {
    console.warn('⚠️  UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set');
    console.warn('⚠️  Falling back to in-memory rate limiting (not recommended for production)');
  }
} catch (error) {
  console.error('Failed to initialize Upstash Redis:', error);
  console.warn('⚠️  Falling back to in-memory rate limiting');
}

// In-memory fallback for rate limiting
class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    
    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  async limit(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this identifier
    let requests = this.requests.get(identifier) || [];

    // Filter out old requests outside the window
    requests = requests.filter(timestamp => timestamp > windowStart);

    // Check if limit exceeded
    const success = requests.length < this.maxRequests;

    // Add current request if allowed
    if (success) {
      requests.push(now);
      this.requests.set(identifier, requests);
    }

    const remaining = Math.max(0, this.maxRequests - requests.length);
    const reset = new Date(now + this.windowMs);

    return { success, limit: this.maxRequests, remaining, reset };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, requests] of this.requests.entries()) {
      const filtered = requests.filter(timestamp => timestamp > now - this.windowMs);
      if (filtered.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filtered);
      }
    }
  }
}

// Rate limiters for different endpoint types
export const rateLimiters = {
  // Strict limits for sensitive endpoints
  auth: upstashConfigured && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 requests per 15 minutes
        analytics: true,
        prefix: "@brightnest/auth",
      })
    : new InMemoryRateLimiter(5, 15 * 60 * 1000),

  // Moderate limits for public API endpoints
  api: upstashConfigured && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 requests per minute
        analytics: true,
        prefix: "@brightnest/api",
      })
    : new InMemoryRateLimiter(30, 60 * 1000),

  // Lenient limits for general page requests
  page: upstashConfigured && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 requests per minute
        analytics: true,
        prefix: "@brightnest/page",
      })
    : new InMemoryRateLimiter(60, 60 * 1000),

  // Very strict for expensive operations (like AI generation)
  expensive: upstashConfigured && redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(2, "1 h"), // 2 requests per hour
        analytics: true,
        prefix: "@brightnest/expensive",
      })
    : new InMemoryRateLimiter(2, 60 * 60 * 1000),
};

/**
 * Get client identifier from request (IP address)
 */
function getClientIdentifier(request: Request): string {
  // Try to get real IP from various headers
  const headers = request.headers;
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare
  
  const ip = forwardedFor?.split(',')[0].trim() || 
             realIp ||
             cfConnectingIp ||
             'unknown';
  
  return ip;
}

/**
 * Rate limit a request
 * Returns success status and rate limit info
 */
export async function rateLimit(
  request: Request,
  type: keyof typeof rateLimiters = 'api'
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}> {
  const identifier = getClientIdentifier(request);
  const limiter = rateLimiters[type];

  try {
    const result = await limiter.limit(identifier);
    
    if (!result.success) {
      console.warn(`🚫 Rate limit exceeded for ${identifier} (${type})`);
    }

    // Normalize return type - Upstash returns RatelimitResponse, InMemory returns our custom type
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset instanceof Date ? result.reset : new Date(result.reset),
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // On error, allow the request (fail open for availability)
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: new Date(),
    };
  }
}

/**
 * Middleware helper to add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: Response,
  rateLimitResult: { limit: number; remaining: number; reset: Date }
): Response {
  const headers = new Headers(response.headers);
  
  headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
  headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  headers.set('X-RateLimit-Reset', rateLimitResult.reset.toISOString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Rate limit response helper
 * Returns a 429 response with rate limit headers
 */
export function rateLimitExceededResponse(rateLimitResult: {
  limit: number;
  remaining: number;
  reset: Date;
}): Response {
  const response = new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: rateLimitResult.reset.toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toISOString(),
        'Retry-After': Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000).toString(),
      },
    }
  );

  return response;
}

