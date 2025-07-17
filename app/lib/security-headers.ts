import { NextResponse } from 'next/server';
import { getEnvConfig } from './env-validation';
import crypto from 'crypto';

const env = getEnvConfig();

export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

export function createSecurityHeaders(nonce?: string): Record<string, string> {
  const headers: Record<string, string> = {
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Enable XSS protection
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy
    'Permissions-Policy': [
      'camera=self',
      'microphone=self',
      'geolocation=self',
      'payment=self',
      'usb=',
      'bluetooth=',
      'magnetometer=',
      'gyroscope=',
      'accelerometer=',
    ].join(', '),
    
    // HSTS (only in production)
    ...(env.NODE_ENV === 'production' && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    }),
  };

  // Content Security Policy
  if (nonce) {
    headers['Content-Security-Policy'] = createCSP(nonce);
  }

  return headers;
}

function createCSP(nonce: string): string {
  const cspDirectives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: https: blob:`,
    `media-src 'self' blob:`,
    `connect-src 'self' https://api.openai.com https://api.resend.com`,
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ];

  // In development, allow eval for Next.js
  if (env.NODE_ENV === 'development') {
    cspDirectives[1] = `script-src 'self' 'unsafe-eval' 'nonce-${nonce}'`;
  }

  return cspDirectives.join('; ');
}

export function addSecurityHeaders(response: NextResponse, nonce?: string): NextResponse {
  const headers = createSecurityHeaders(nonce);
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export function createSecureResponse(
  data: any,
  status: number = 200,
  additionalHeaders?: Record<string, string>
): NextResponse {
  const response = NextResponse.json(data, { status });
  
  // Add security headers
  addSecurityHeaders(response);
  
  // Add additional headers if provided
  if (additionalHeaders) {
    Object.entries(additionalHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

export function createSecureErrorResponse(
  error: string,
  status: number = 400,
  additionalData?: Record<string, any>
): NextResponse {
  const errorData = {
    error,
    timestamp: new Date().toISOString(),
    ...additionalData,
  };

  return createSecureResponse(errorData, status);
}

// CSRF Token generation and validation
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  try {
    const expectedToken = crypto
      .createHmac('sha256', env.CSP_NONCE_SECRET)
      .update(sessionToken)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expectedToken, 'hex')
    );
  } catch {
    return false;
  }
}

export function createCSRFToken(sessionToken: string): string {
  return crypto
    .createHmac('sha256', env.CSP_NONCE_SECRET)
    .update(sessionToken)
    .digest('hex');
} 