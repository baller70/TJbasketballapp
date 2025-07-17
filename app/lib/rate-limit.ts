import { NextRequest } from 'next/server';
import { getEnvConfig } from './env-validation';

interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  blockDurationMs: number;
  skipSuccessfulRequests?: boolean;
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.store.entries()) {
      if (now - entry.lastAttempt > this.config.windowMs) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.store.delete(key));
  }

  private getClientKey(request: NextRequest): string {
    // Use IP address and user agent for more accurate identification
    const ip = request.ip || 
               request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';
    return `${ip}:${userAgent.substring(0, 50)}`;
  }

  async isAllowed(request: NextRequest): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    blockedUntil?: number;
  }> {
    const key = this.getClientKey(request);
    const now = Date.now();
    
    let entry = this.store.get(key);
    
    // Check if currently blocked
    if (entry?.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        blockedUntil: entry.blockedUntil,
      };
    }

    // Initialize or reset if window expired
    if (!entry || now - entry.lastAttempt > this.config.windowMs) {
      entry = {
        attempts: 0,
        lastAttempt: now,
      };
    }

    // Check if limit exceeded
    if (entry.attempts >= this.config.maxAttempts) {
      const blockedUntil = now + this.config.blockDurationMs;
      entry.blockedUntil = blockedUntil;
      this.store.set(key, entry);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: blockedUntil,
        blockedUntil,
      };
    }

    // Allow request and increment counter
    entry.attempts++;
    entry.lastAttempt = now;
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: this.config.maxAttempts - entry.attempts,
      resetTime: entry.lastAttempt + this.config.windowMs,
    };
  }

  async recordSuccess(request: NextRequest): Promise<void> {
    if (this.config.skipSuccessfulRequests) {
      const key = this.getClientKey(request);
      this.store.delete(key);
    }
  }

  async recordFailure(request: NextRequest): Promise<void> {
    // Failure is already recorded in isAllowed
  }
}

// Different rate limiters for different endpoints
const env = getEnvConfig();

export const authRateLimiter = new InMemoryRateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxAttempts: env.RATE_LIMIT_MAX_ATTEMPTS,
  blockDurationMs: env.RATE_LIMIT_WINDOW_MS * 2, // Block for 2x the window
  skipSuccessfulRequests: true,
});

export const apiRateLimiter = new InMemoryRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxAttempts: 100, // 100 requests per minute
  blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
});

export const uploadRateLimiter = new InMemoryRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxAttempts: 10, // 10 uploads per minute
  blockDurationMs: 10 * 60 * 1000, // Block for 10 minutes
});

export const aiRateLimiter = new InMemoryRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxAttempts: 20, // 20 AI requests per minute
  blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
});

export async function checkRateLimit(
  request: NextRequest,
  limiter: InMemoryRateLimiter
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  blockedUntil?: number;
}> {
  return await limiter.isAllowed(request);
}

export function createRateLimitHeaders(result: {
  remaining: number;
  resetTime: number;
  blockedUntil?: number;
}): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
  };

  if (result.blockedUntil) {
    headers['Retry-After'] = Math.ceil((result.blockedUntil - Date.now()) / 1000).toString();
  }

  return headers;
}

export function getRateLimitErrorResponse(result: {
  remaining: number;
  resetTime: number;
  blockedUntil?: number;
}): {
  error: string;
  retryAfter?: number;
} {
  const retryAfter = result.blockedUntil ? Math.ceil((result.blockedUntil - Date.now()) / 1000) : undefined;
  
  return {
    error: result.blockedUntil 
      ? 'Too many failed attempts. Account temporarily blocked.'
      : 'Rate limit exceeded. Please try again later.',
    retryAfter,
  };
} 