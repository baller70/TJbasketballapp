
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, dateOfBirth } = await request.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user data
    const userData: any = {
      email,
      password: hashedPassword,
      name,
      role,
    };

    // Add dateOfBirth if provided (for players)
    if (dateOfBirth && role === 'PLAYER') {
      userData.dateOfBirth = new Date(dateOfBirth);
    }

    // Create user
    const user = await prisma.user.create({
      data: userData,
    });

    // Create player profile if user is a player
    if (role === 'PLAYER') {
      await prisma.playerProfile.create({
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

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
