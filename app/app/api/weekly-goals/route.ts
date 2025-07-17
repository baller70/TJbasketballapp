import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active') === 'true';

    // Get current week bounds
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    let whereClause: any = {};
    if (active) {
      whereClause = {
        isActive: true,
        startDate: { lte: endOfWeek },
        endDate: { gte: startOfWeek },
      };
    }

    const weeklyGoals = await prisma.weeklyGoal.findMany({
      where: whereClause,
      include: {
        userWeeklyGoals: {
          where: { userId },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    const weeklyGoalsWithProgress = weeklyGoals.map((goal: any) => ({
      ...goal,
      userProgress: goal.userWeeklyGoals[0] || {
        status: 'ACTIVE',
        progress: 0,
        pointsEarned: 0,
      },
    }));

    return NextResponse.json(weeklyGoalsWithProgress);
  } catch (error) {
    console.error('Error fetching weekly goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly goals' },
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

    const { name, description, type, criteria, points, startDate, endDate } = await request.json();

    // Validate required fields
    if (!name || !description || !type || !criteria || points === undefined) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Parse dates
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

    // If no dates provided, use current week
    if (!startDate && !endDate) {
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    }

    const weeklyGoal = await prisma.weeklyGoal.create({
      data: {
        name,
        description,
        type,
        criteria,
        points,
        startDate: start,
        endDate: end,
        isCustom: true,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(weeklyGoal, { status: 201 });
  } catch (error) {
    console.error('Error creating weekly goal:', error);
    return NextResponse.json(
      { error: 'Failed to create weekly goal' },
      { status: 500 }
    );
  }
} 