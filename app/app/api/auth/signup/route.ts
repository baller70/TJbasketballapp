
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getEnvConfig } from '@/lib/env-validation';
import { passwordSchema, isCommonWeakPassword } from '@/lib/password-validation';
import { authRateLimiter, checkRateLimit, createRateLimitHeaders, getRateLimitErrorResponse } from '@/lib/rate-limit';
import { createSecureResponse, createSecureErrorResponse } from '@/lib/security-headers';

export const dynamic = 'force-dynamic';

const env = getEnvConfig();

const signupSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: passwordSchema,
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters').trim(),
  role: z.enum(['PLAYER', 'PARENT'], { required_error: 'Role is required' }),
  dateOfBirth: z.string().optional().refine((date) => {
    if (!date) return true;
    const birthDate = new Date(date);
    const now = new Date();
    const age = now.getFullYear() - birthDate.getFullYear();
    return age >= 6 && age <= 13;
  }, 'Age must be between 6 and 13 years old'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, authRateLimiter);
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.allowed) {
      const errorResponse = getRateLimitErrorResponse(rateLimitResult);
      return createSecureErrorResponse(errorResponse.error, 429, { 
        retryAfter: errorResponse.retryAfter,
        ...rateLimitHeaders 
      });
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return createSecureErrorResponse('Invalid JSON in request body', 400);
    }

    // Validate input data
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return createSecureErrorResponse('Validation failed', 400, { errors });
    }

    const { email, password, name, role, dateOfBirth } = validationResult.data;

    // Additional password security checks
    if (isCommonWeakPassword(password)) {
      return createSecureErrorResponse('This password is too common. Please choose a more secure password.', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true } // Only select necessary fields
    });

    if (existingUser) {
      // Don't reveal that the user exists for security
      return createSecureErrorResponse('Registration failed. Please try again.', 400);
    }

    // Hash password with configured rounds
    const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    // Create user data
    const userData: any = {
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add dateOfBirth if provided (for players)
    if (dateOfBirth && role === 'PLAYER') {
      userData.dateOfBirth = new Date(dateOfBirth);
    }

    // Create user in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: userData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        }
      });

      // Create player profile if user is a player
      if (role === 'PLAYER') {
        await tx.playerProfile.create({
          data: {
            userId: user.id,
            skillLevel: 'beginner',
            currentLevel: 'rookie',
            totalPoints: 0,
            currentStreak: 0,
            longestStreak: 0,
            goals: {
              daily: 'Practice for 30 minutes',
              weekly: 'Complete 5 different drills',
              monthly: 'Improve shooting accuracy by 10%',
            },
            preferences: {
              reminderTime: '16:00',
              favoriteCategories: ['shooting', 'dribbling'],
            },
          },
        });
      }

      return user;
    });

    // Log successful registration (without sensitive data)
    if (env.ENABLE_SECURITY_LOGGING) {
      console.log(`User registered: ${email} (${role}) at ${new Date().toISOString()}`);
    }

    // Record successful authentication (clears rate limit)
    await authRateLimiter.recordSuccess(request);

    return createSecureResponse(
      { 
        message: 'User created successfully',
        user: {
          id: result.id,
          email: result.email,
          name: result.name,
          role: result.role,
        }
      },
      201,
      rateLimitHeaders
    );

  } catch (error) {
    // Log error without exposing sensitive information
    if (env.ENABLE_SECURITY_LOGGING) {
      console.error('Registration error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      });
    }

    // Record failed attempt
    await authRateLimiter.recordFailure(request);

    return createSecureErrorResponse('Registration failed. Please try again.', 500);
  }
}
