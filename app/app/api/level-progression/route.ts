import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { 
  LEVEL_PROGRESSION, 
  getCurrentLevel, 
  getNextLevel, 
  getProgressToNextLevel, 
  getLevelGoalProgress 
} from '@/lib/level-progression';

export const dynamic = 'force-dynamic';

export async function GET() {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get player profile
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
    });

    if (!playerProfile) {
      return NextResponse.json({ error: 'Player profile not found' }, { status: 404 });
    }

    // Get user statistics for goal progress
    const totalDrills = await prisma.drillCompletion.count({
      where: { userId },
    });

    const perfectRatings = await prisma.drillCompletion.count({
      where: { 
        userId,
        rating: 5
      },
    });

    // Get number of unique drill categories tried
    const uniqueCategories = await prisma.drillCompletion.findMany({
      where: { userId },
      include: { drill: true },
      distinct: ['drillId'],
    });

    const skillCategories = new Set(uniqueCategories.map(dc => dc.drill.category)).size;

    // Get unique practice days
    const practiceDays = await prisma.drillCompletion.groupBy({
      by: ['userId'],
      where: { userId },
      _count: {
        id: true,
      },
    });

    // Calculate teamwork actions (this would need to be tracked separately)
    const teamworkActions = 0; // Placeholder for now

    const userStats = {
      totalDrills,
      totalPoints: playerProfile.totalPoints,
      currentStreak: playerProfile.currentStreak,
      perfectRatings,
      teamworkActions,
      practiceDays: totalDrills > 0 ? Math.min(totalDrills, 30) : 0, // Estimate based on drills
      skillCategories,
    };

    // Get current level information
    const currentLevel = getCurrentLevel(playerProfile.totalPoints);
    const nextLevel = getNextLevel(playerProfile.totalPoints);
    const progressToNext = getProgressToNextLevel(playerProfile.totalPoints);

    // Get goal progress for current level
    const goalProgress = getLevelGoalProgress(currentLevel.goals, userStats);

    // Get all levels for overview
    const allLevels = LEVEL_PROGRESSION.map(level => ({
      ...level,
      unlocked: playerProfile.totalPoints >= level.pointsRequired,
      current: level.level === currentLevel.level,
    }));

    return NextResponse.json({
      currentLevel,
      nextLevel,
      progressToNext,
      goalProgress,
      allLevels,
      userStats,
      totalPoints: playerProfile.totalPoints,
    });

  } catch (error) {
    logger.error('Error fetching level progression', error as Error, { userId: userId || undefined });
    return NextResponse.json(
      { error: 'Failed to fetch level progression' },
      { status: 500 }
    );
  }
}          