import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all levels with user progress
    const levels = await prisma.level.findMany({
      include: {
        goals: {
          include: {
            userGoals: {
              where: { userId },
            },
          },
          orderBy: { goalNumber: 'asc' },
        },
        userLevels: {
          where: { userId },
        },
      },
      orderBy: { levelNumber: 'asc' },
    });

    // Transform data to include progress information
    const levelsWithProgress = levels.map((level: any) => {
      const userLevel = level.userLevels[0];
      const completedGoals = level.goals.filter((goal: any) => 
        goal.userGoals[0]?.status === 'COMPLETED'
      ).length;
      
      return {
        ...level,
        userProgress: {
          status: userLevel?.status || 'LOCKED',
          progress: userLevel?.progress || 0,
          completedGoals,
          totalGoals: level.goals.length,
          totalPoints: userLevel?.totalPoints || 0,
          startedAt: userLevel?.startedAt,
          completedAt: userLevel?.completedAt,
        },
        goals: level.goals.map((goal: any) => ({
          ...goal,
          userProgress: goal.userGoals[0] || {
            status: 'LOCKED',
            progress: 0,
            pointsEarned: 0,
          },
        })),
      };
    });

    return NextResponse.json(levelsWithProgress);
  } catch (error) {
    console.error('Error fetching levels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch levels' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, pointsRequired, badgeIcon, badgeColor, rewards } = await request.json();

    // Validate required fields
    if (!name || !description || pointsRequired === undefined) {
      return NextResponse.json(
        { error: 'Name, description, and points required are required' },
        { status: 400 }
      );
    }

    // Get the next level number
    const lastLevel = await prisma.level.findFirst({
      orderBy: { levelNumber: 'desc' },
    });
    const nextLevelNumber = (lastLevel?.levelNumber || 0) + 1;

    const level = await prisma.level.create({
      data: {
        levelNumber: nextLevelNumber,
        name,
        description,
        pointsRequired,
        badgeIcon,
        badgeColor,
        rewards,
        isCustom: true,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(level, { status: 201 });
  } catch (error) {
    console.error('Error creating level:', error);
    return NextResponse.json(
      { error: 'Failed to create level' },
      { status: 500 }
    );
  }
} 