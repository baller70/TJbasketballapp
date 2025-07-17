import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const goalId = params.id;
    const { progress, completed = false } = await request.json();

    // Get the goal details
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        level: true,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Get or create user goal progress
    let userGoal = await prisma.userGoal.findUnique({
      where: {
        userId_goalId: {
          userId,
          goalId,
        },
      },
    });

    if (!userGoal) {
      userGoal = await prisma.userGoal.create({
        data: {
          userId,
          goalId,
          status: 'UNLOCKED',
          progress: 0,
          pointsEarned: 0,
        },
      });
    }

    // Update progress
    const newProgress = Math.min(100, Math.max(0, progress));
    const isCompleted = completed || newProgress >= 100;
    const pointsEarned = isCompleted ? goal.points : 0;

    const updatedUserGoal = await prisma.userGoal.update({
      where: { id: userGoal.id },
      data: {
        progress: newProgress,
        status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        pointsEarned,
        completedAt: isCompleted ? new Date() : null,
        startedAt: userGoal.startedAt || new Date(),
      },
    });

    // If goal is completed, update user's total points
    if (isCompleted && userGoal.status !== 'COMPLETED') {
      await prisma.playerProfile.update({
        where: { userId },
        data: {
          totalPoints: {
            increment: goal.points,
          },
        },
      });

      // Check if this completes the level
      const levelGoals = await prisma.goal.findMany({
        where: { levelId: goal.levelId },
        include: {
          userGoals: {
            where: { userId },
          },
        },
      });

      const completedGoalsCount = levelGoals.filter((g: any) => 
        g.userGoals[0]?.status === 'COMPLETED'
      ).length;

      // If all goals are completed, mark level as completed
      if (completedGoalsCount === levelGoals.length) {
        await prisma.userLevel.upsert({
          where: {
            userId_levelId: {
              userId,
              levelId: goal.levelId,
            },
          },
          update: {
            status: 'COMPLETED',
            progress: 100,
            completedAt: new Date(),
          },
          create: {
            userId,
            levelId: goal.levelId,
            status: 'COMPLETED',
            progress: 100,
            completedAt: new Date(),
          },
        });

        // Unlock next level
        const nextLevel = await prisma.level.findFirst({
          where: {
            levelNumber: goal.level.levelNumber + 1,
          },
        });

        if (nextLevel) {
          await prisma.userLevel.upsert({
            where: {
              userId_levelId: {
                userId,
                levelId: nextLevel.id,
              },
            },
            update: {
              status: 'UNLOCKED',
            },
            create: {
              userId,
              levelId: nextLevel.id,
              status: 'UNLOCKED',
              progress: 0,
            },
          });
        }
      }
    }

    return NextResponse.json(updatedUserGoal);
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return NextResponse.json(
      { error: 'Failed to update goal progress' },
      { status: 500 }
    );
  }
} 