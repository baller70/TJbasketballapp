import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const levelId = params.id;

    const level = await prisma.level.findUnique({
      where: { id: levelId },
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
    });

    if (!level) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    // Transform data to include progress information
    const userLevel = level.userLevels[0];
    const completedGoals = level.goals.filter((goal: any) => 
      goal.userGoals[0]?.status === 'COMPLETED'
    ).length;

    const levelWithProgress = {
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

    return NextResponse.json(levelWithProgress);
  } catch (error) {
    logger.error('Error fetching level', error as Error, { 
      userId: userId || undefined, 
      levelId: params.id 
    });
    return NextResponse.json(
      { error: 'Failed to fetch level' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const levelId = params.id;
    const { name, description, pointsRequired, badgeIcon, badgeColor, rewards } = await request.json();

    // Check if user owns this level (for custom levels)
    const existingLevel = await prisma.level.findUnique({
      where: { id: levelId },
    });

    if (!existingLevel) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    if (existingLevel.isCustom && existingLevel.createdBy !== userId) {
      return NextResponse.json({ error: 'Unauthorized to edit this level' }, { status: 403 });
    }

    if (!existingLevel.isCustom) {
      return NextResponse.json({ error: 'Cannot edit system levels' }, { status: 403 });
    }

    const updatedLevel = await prisma.level.update({
      where: { id: levelId },
      data: {
        name,
        description,
        pointsRequired,
        badgeIcon,
        badgeColor,
        rewards,
      },
    });

    return NextResponse.json(updatedLevel);
  } catch (error) {
    logger.error('Error updating level', error as Error, { 
      userId: userId || undefined, 
      levelId: params.id 
    });
    return NextResponse.json(
      { error: 'Failed to update level' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const levelId = params.id;

    // Check if user owns this level (for custom levels)
    const existingLevel = await prisma.level.findUnique({
      where: { id: levelId },
    });

    if (!existingLevel) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    if (existingLevel.isCustom && existingLevel.createdBy !== userId) {
      return NextResponse.json({ error: 'Unauthorized to delete this level' }, { status: 403 });
    }

    if (!existingLevel.isCustom) {
      return NextResponse.json({ error: 'Cannot delete system levels' }, { status: 403 });
    }

    await prisma.level.delete({
      where: { id: levelId },
    });

    return NextResponse.json({ message: 'Level deleted successfully' });
  } catch (error) {
    logger.error('Error deleting level', error as Error, { 
      userId: userId || undefined, 
      levelId: params.id 
    });
    return NextResponse.json(
      { error: 'Failed to delete level' },
      { status: 500 }
    );
  }
}              