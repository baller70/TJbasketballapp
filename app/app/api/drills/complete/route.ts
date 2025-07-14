
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { drillId, duration, rating, feedback } = await request.json();

    // Create drill completion record
    const drillCompletion = await prisma.drillCompletion.create({
      data: {
        userId: session.user.id,
        drillId,
        duration,
        rating,
        feedback,
        performance: {},
      },
    });

    // Update player profile - add points and update streak
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (playerProfile) {
      let pointsToAdd = 10; // Base points for completing a drill
      if (rating === 5) pointsToAdd += 5; // Bonus for perfect rating

      // Check if this is a daily streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayCompletions = await prisma.drillCompletion.count({
        where: {
          userId: session.user.id,
          completedAt: {
            gte: today,
          },
        },
      });

      let newStreak = playerProfile.currentStreak;
      if (todayCompletions === 1) {
        // First completion today
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const yesterdayCompletions = await prisma.drillCompletion.count({
          where: {
            userId: session.user.id,
            completedAt: {
              gte: yesterday,
              lt: today,
            },
          },
        });
        
        if (yesterdayCompletions > 0) {
          newStreak += 1;
          pointsToAdd += 20; // Streak bonus
        } else {
          newStreak = 1;
        }
      }

      await prisma.playerProfile.update({
        where: { userId: session.user.id },
        data: {
          totalPoints: playerProfile.totalPoints + pointsToAdd,
          currentStreak: newStreak,
          longestStreak: Math.max(playerProfile.longestStreak, newStreak),
          lastActiveDate: new Date(),
        },
      });
    }

    return NextResponse.json(drillCompletion);
  } catch (error) {
    console.error('Error completing drill:', error);
    return NextResponse.json(
      { error: 'Failed to complete drill' },
      { status: 500 }
    );
  }
}
