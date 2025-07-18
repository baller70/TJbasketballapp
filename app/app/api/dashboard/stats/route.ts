
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      logger.info('No session found, using mock dashboard stats data');
      // Return mock data when no session
      const mockStats = {
        totalPoints: 150,
        currentLevel: 2,
        completedChallenges: 8,
        weeklyStreak: 3,
        totalDrills: 25,
        completedDrills: 12,
        currentStreak: 3,
        averageRating: 4.2,
        weeklyGoal: 7,
        weeklyProgress: 3
      };
      return NextResponse.json(mockStats);
    }

    // Get total drills count
    const totalDrills = await prisma.drill.count();

    // Get completed drills count
    const completedDrills = await prisma.drillCompletion.count({
      where: { userId },
    });

    // Get current streak from player profile
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
    });

    // Get total points from player profile
    const totalPoints = playerProfile?.totalPoints || 0;

    // Get average rating from drill completions
    const avgRatingResult = await prisma.drillCompletion.aggregate({
      where: { 
        userId,
        rating: { not: null },
      },
      _avg: { rating: true },
    });

    const averageRating = avgRatingResult._avg.rating || 0;

    // Get weekly progress
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weeklyProgress = await prisma.drillCompletion.count({
      where: {
        userId,
        completedAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    const stats = {
      totalDrills,
      completedDrills,
      currentStreak: playerProfile?.currentStreak || 0,
      totalPoints,
      averageRating,
      weeklyGoal: 7, // Default weekly goal
      weeklyProgress,
    };

    return NextResponse.json(stats);
  } catch (error) {
    logger.error('Error fetching dashboard stats', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
