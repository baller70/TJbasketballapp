import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      // Return mock users for demonstration
      console.log('No session found, using mock users data');
      return NextResponse.json([
        {
          id: 'user1',
          name: 'Alex Johnson',
          email: 'alex@example.com',
          playerProfile: {
            skillLevel: 'Intermediate',
            currentLevel: 'All-Star',
            totalPoints: 1250,
            currentStreak: 5,
            favoritePosition: 'Point Guard',
          },
        },
        {
          id: 'user2',
          name: 'Sarah Davis',
          email: 'sarah@example.com',
          playerProfile: {
            skillLevel: 'Beginner',
            currentLevel: 'Rookie',
            totalPoints: 450,
            currentStreak: 2,
            favoritePosition: 'Shooting Guard',
          },
        },
        {
          id: 'user3',
          name: 'Mike Wilson',
          email: 'mike@example.com',
          playerProfile: {
            skillLevel: 'Advanced',
            currentLevel: 'MVP',
            totalPoints: 2100,
            currentStreak: 12,
            favoritePosition: 'Center',
          },
        },
        {
          id: 'user4',
          name: 'Emma Thompson',
          email: 'emma@example.com',
          playerProfile: {
            skillLevel: 'Intermediate',
            currentLevel: 'Varsity',
            totalPoints: 890,
            currentStreak: 3,
            favoritePosition: 'Power Forward',
          },
        },
        {
          id: 'user5',
          name: 'Jake Martinez',
          email: 'jake@example.com',
          playerProfile: {
            skillLevel: 'Beginner',
            currentLevel: 'Junior Varsity',
            totalPoints: 320,
            currentStreak: 1,
            favoritePosition: 'Small Forward',
          },
        },
        {
          id: 'user6',
          name: 'Lisa Chen',
          email: 'lisa@example.com',
          playerProfile: {
            skillLevel: 'Advanced',
            currentLevel: 'Hall of Fame',
            totalPoints: 3500,
            currentStreak: 25,
            favoritePosition: 'Point Guard',
          },
        },
      ]);
    }

    // Get all users with their player profiles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        playerProfile: {
          select: {
            skillLevel: true,
            currentLevel: true,
            totalPoints: true,
            currentStreak: true,
            favoritePosition: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
} 