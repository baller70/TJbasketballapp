import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema for profile updates
const profileUpdateSchema = z.object({
  height: z.coerce.number().min(48).max(96).optional(), // 4'0" to 8'0"
  weight: z.coerce.number().min(80).max(400).optional(), // 80 to 400 lbs
  wingspan: z.coerce.number().min(48).max(108).optional(), // 4'0" to 9'0"
  verticalJump: z.coerce.number().min(0).max(60).optional(), // 0 to 60 inches
  favoritePosition: z.string().optional(),
  team: z.string().optional(),
  jerseyNumber: z.coerce.number().min(0).max(99).optional(),
  yearsPlaying: z.coerce.number().min(0).max(50).optional(),
  dominantHand: z.enum(['Right', 'Left', 'Ambidextrous']).optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  dateOfBirth: z.string().optional(),
});

export async function GET() {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with player profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        playerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If no player profile exists, create one
    let playerProfile = user.playerProfile;
    if (!playerProfile) {
      playerProfile = await prisma.playerProfile.create({
        data: {
          userId: userId,
          skillLevel: 'beginner',
          totalPoints: 0,
          currentLevel: 'rookie',
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

    return NextResponse.json(playerProfile);
  } catch (error) {
    logger.error('Error fetching profile', error as Error, { userId: userId || undefined });
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();

    // Validate the request body
    const validationResult = profileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });
    }

    const validatedData = validationResult.data;

    // Get existing player profile
    const existingProfile = await prisma.playerProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (validatedData.height !== undefined) {
      updateData.height = validatedData.height;
    }
    
    if (validatedData.weight !== undefined) {
      updateData.weight = validatedData.weight;
    }
    
    if (validatedData.wingspan !== undefined) {
      updateData.wingspan = validatedData.wingspan;
    }
    
    if (validatedData.verticalJump !== undefined) {
      updateData.verticalJump = validatedData.verticalJump;
    }
    
    if (validatedData.favoritePosition !== undefined) {
      updateData.favoritePosition = validatedData.favoritePosition || null;
    }
    
    if (validatedData.team !== undefined) {
      updateData.team = validatedData.team || null;
    }
    
    if (validatedData.jerseyNumber !== undefined) {
      updateData.jerseyNumber = validatedData.jerseyNumber;
    }
    
    if (validatedData.yearsPlaying !== undefined) {
      updateData.yearsPlaying = validatedData.yearsPlaying;
    }
    
    if (validatedData.dominantHand !== undefined) {
      updateData.dominantHand = validatedData.dominantHand || null;
    }
    
    if (validatedData.skillLevel !== undefined) {
      updateData.skillLevel = validatedData.skillLevel;
    }
    
    if (validatedData.dateOfBirth !== undefined) {
      updateData.dateOfBirth = validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null;
    }

    // Update the profile
    const updatedProfile = await prisma.playerProfile.update({
      where: { userId },
      data: updateData,
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    logger.error('Error updating profile', error as Error, { userId: userId || undefined });
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}          