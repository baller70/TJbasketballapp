import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const levelId = searchParams.get('levelId');

    let whereClause = {};
    if (levelId) {
      whereClause = { levelId };
    }

    const goals = await prisma.goal.findMany({
      where: whereClause,
      include: {
        level: true,
        userGoals: {
          where: { userId },
        },
      },
      orderBy: [
        { level: { levelNumber: 'asc' } },
        { goalNumber: 'asc' },
      ],
    });

    const goalsWithProgress = goals.map((goal: any) => ({
      ...goal,
      userProgress: goal.userGoals[0] || {
        status: 'LOCKED',
        progress: 0,
        pointsEarned: 0,
      },
    }));

    return NextResponse.json(goalsWithProgress);
  } catch (error) {
    logger.error('Error fetching goals', error as Error, { userId: userId || undefined });
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let userId: string | null = null;
  let levelId: string | undefined = undefined;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { levelId, name, description, type, criteria, points, isLevelTest } = await request.json();

    // Validate required fields
    if (!levelId || !name || !description || !type || !criteria || points === undefined) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if level exists and user can add goals to it
    const level = await prisma.level.findUnique({
      where: { id: levelId },
      include: {
        goals: {
          orderBy: { goalNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!level) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    if (level.isCustom && level.createdBy !== userId) {
      return NextResponse.json({ error: 'Unauthorized to add goals to this level' }, { status: 403 });
    }

    // Check if level already has 10 goals
    const goalCount = await prisma.goal.count({
      where: { levelId },
    });

    if (goalCount >= 10) {
      return NextResponse.json({ error: 'Level already has maximum 10 goals' }, { status: 400 });
    }

    // Get the next goal number
    const nextGoalNumber = (level.goals[0]?.goalNumber || 0) + 1;

    // If this is goal #10, it must be a level test
    const isTest = nextGoalNumber === 10 ? true : isLevelTest;

    const goal = await prisma.goal.create({
      data: {
        levelId,
        goalNumber: nextGoalNumber,
        name,
        description,
        type,
        criteria,
        points,
        isLevelTest: isTest,
        isCustom: level.isCustom,
        createdBy: level.isCustom ? userId : null,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    logger.error('Error creating goal', error as Error, { 
      userId: userId || undefined, 
      levelId: levelId || undefined 
    });
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}            