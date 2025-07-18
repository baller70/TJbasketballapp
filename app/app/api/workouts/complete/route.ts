import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workoutId, completedDrills, totalDuration } = await request.json();

    // Create workout completion record
    const workoutCompletion = await prisma.workoutCompletion.create({
      data: {
        userId: session.user.id,
        workoutId,
        completedAt: new Date(),
        totalDuration,
        completedDrills: completedDrills.length,
      },
    });

    // Update player profile - add points for workout completion
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (playerProfile) {
      let pointsToAdd = completedDrills.length * 15; // Base points per drill in workout
      pointsToAdd += 50; // Bonus for completing full workout

      // Check if this is a daily streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayCompletions = await prisma.workoutCompletion.count({
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
        
        const yesterdayCompletions = await prisma.workoutCompletion.count({
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
          pointsToAdd += 30; // Streak bonus
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

    return NextResponse.json(workoutCompletion);
  } catch (error) {
    console.error('Error completing workout:', error);
    return NextResponse.json(
      { error: 'Failed to complete workout' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workoutId = searchParams.get('workoutId');
    const userId = searchParams.get('userId') || session.user.id;

    let whereClause: any = {
      userId
    };

    if (workoutId) {
      whereClause.workoutId = workoutId;
    }

    const completions = await prisma.workoutCompletion.findMany({
      where: whereClause,
      include: {
        workout: {
          include: {
            workoutDrills: {
              include: {
                drill: true
              }
            }
          }
        },
        workoutComments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    });

    return NextResponse.json(completions);
  } catch (error) {
    console.error('Error fetching workout completions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 