
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

    // Get user to check if they're a parent
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        children: {
          include: {
            playerProfile: true,
          },
        },
      },
    });

    if (!user || user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get recent activities from all children
    const childrenIds = user.children.map(child => child.id);
    
    const recentActivities = await prisma.drillCompletion.findMany({
      where: {
        userId: {
          in: childrenIds,
        },
      },
      include: {
        drill: true,
        user: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 20,
    });

    // Get notifications for the parent
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Calculate weekly progress for each child
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weeklyProgress: { [childId: string]: { completed: number; scheduled: number; points: number } } = {};

    for (const child of user.children) {
      const completed = await prisma.drillCompletion.count({
        where: {
          userId: child.id,
          completedAt: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      });

      const scheduled = await prisma.scheduleEntry.count({
        where: {
          userId: child.id,
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      });

      const weeklyPointsResult = await prisma.drillCompletion.aggregate({
        where: {
          userId: child.id,
          completedAt: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        _count: true,
      });

      const weeklyPoints = weeklyPointsResult._count * 10; // Base points per drill

      weeklyProgress[child.id] = {
        completed,
        scheduled,
        points: weeklyPoints,
      };
    }

    const dashboardData = {
      children: user.children,
      recentActivities,
      notifications,
      weeklyProgress,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching parent dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
