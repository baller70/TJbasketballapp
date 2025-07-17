import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export async function GET(
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

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        level: true,
        userGoals: {
          where: { userId },
        },
      },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const goalWithProgress = {
      ...goal,
      userProgress: goal.userGoals[0] || {
        status: 'LOCKED',
        progress: 0,
        pointsEarned: 0,
      },
    };

    return NextResponse.json(goalWithProgress);
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goalId = params.id;
    const { name, description, type, criteria, points, isLevelTest } = await request.json();

    // Check if user owns this goal (for custom goals)
    const existingGoal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        level: true,
      },
    });

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    if (existingGoal.isCustom && existingGoal.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to edit this goal' }, { status: 403 });
    }

    if (!existingGoal.isCustom) {
      return NextResponse.json({ error: 'Cannot edit system goals' }, { status: 403 });
    }

    // If this is goal #10, it must be a level test
    const isTest = existingGoal.goalNumber === 10 ? true : isLevelTest;

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        name,
        description,
        type,
        criteria,
        points,
        isLevelTest: isTest,
      },
    });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goalId = params.id;

    // Check if user owns this goal (for custom goals)
    const existingGoal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        level: true,
      },
    });

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    if (existingGoal.isCustom && existingGoal.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this goal' }, { status: 403 });
    }

    if (!existingGoal.isCustom) {
      return NextResponse.json({ error: 'Cannot delete system goals' }, { status: 403 });
    }

    await prisma.goal.delete({
      where: { id: goalId },
    });

    return NextResponse.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
} 