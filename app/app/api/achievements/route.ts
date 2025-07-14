
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: {
        unlockedAt: 'desc',
      },
    });

    // Get achievements user hasn't unlocked yet
    const unlockedAchievementIds = userAchievements.map(ua => ua.achievementId);
    const availableAchievements = await prisma.achievement.findMany({
      where: {
        id: {
          notIn: unlockedAchievementIds,
        },
      },
      orderBy: {
        points: 'asc',
      },
    });

    // Get player profile for current level and total points
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      userAchievements,
      availableAchievements,
      totalPoints: playerProfile?.totalPoints || 0,
      currentLevel: playerProfile?.currentLevel || 'rookie',
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
