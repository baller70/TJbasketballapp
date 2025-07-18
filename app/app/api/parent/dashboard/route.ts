
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      // Return mock data for demonstration
      logger.info('No session found, using mock parent dashboard data');
      return NextResponse.json({
        children: [
          {
            id: 'mock-child-1',
            name: 'Alex Johnson',
            email: 'alex@example.com',
            role: 'PLAYER',
            playerProfile: {
              currentLevel: 'rookie',
              totalPoints: 245,
              currentStreak: 3,
              longestStreak: 5,
            },
          },
          {
            id: 'mock-child-2',
            name: 'Jordan Smith',
            email: 'jordan@example.com',
            role: 'PLAYER',
            playerProfile: {
              currentLevel: 'amateur',
              totalPoints: 180,
              currentStreak: 1,
              longestStreak: 3,
            },
          },
        ],
        recentActivities: [
          {
            id: 'activity-1',
            userId: 'mock-child-1',
            drillId: 'drill-1',
            completedAt: new Date().toISOString(),
            duration: 900,
            rating: 4,
            feedback: 'Great improvement in form!',
            drill: {
              name: 'Free Throw Practice',
              category: 'Shooting',
              difficulty: 'BEGINNER',
            },
            user: {
              name: 'Alex Johnson',
            },
          },
          {
            id: 'activity-2',
            userId: 'mock-child-2',
            drillId: 'drill-2',
            completedAt: new Date(Date.now() - 3600000).toISOString(),
            duration: 1200,
            rating: 5,
            feedback: 'Perfect execution!',
            drill: {
              name: 'Dribbling Fundamentals',
              category: 'Ball Handling',
              difficulty: 'BEGINNER',
            },
            user: {
              name: 'Jordan Smith',
            },
          },
        ],
        notifications: [
          {
            id: 'notif-1',
            userId: 'mock-parent-1',
            type: 'PARENT_NOTIFICATION',
            title: 'Drill Completed',
            message: 'Alex Johnson completed "Free Throw Practice" and earned 15 points!',
            read: false,
            createdAt: new Date().toISOString(),
            data: {
              childName: 'Alex Johnson',
              drillName: 'Free Throw Practice',
              pointsEarned: 15,
              rating: 4,
            },
          },
          {
            id: 'notif-2',
            userId: 'mock-parent-1',
            type: 'PARENT_NOTIFICATION',
            title: 'Workout Completed',
            message: 'Jordan Smith completed "Morning Training" with 5 drills and earned 125 points!',
            read: false,
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            data: {
              childName: 'Jordan Smith',
              workoutName: 'Morning Training',
              drillsCompleted: 5,
              pointsEarned: 125,
            },
          },
          {
            id: 'notif-3',
            userId: 'mock-parent-1',
            type: 'ACHIEVEMENT',
            title: 'Achievement Unlocked',
            message: 'Alex Johnson unlocked "Streak Master" achievement for maintaining a 3-day streak!',
            read: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            data: {
              childName: 'Alex Johnson',
              achievementName: 'Streak Master',
              streak: 3,
            },
          },
          {
            id: 'notif-4',
            userId: 'mock-parent-1',
            type: 'PARENT_NOTIFICATION',
            title: 'Level Up',
            message: 'Jordan Smith leveled up to Amateur level! Total points: 180',
            read: true,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            data: {
              childName: 'Jordan Smith',
              newLevel: 'Amateur',
              totalPoints: 180,
            },
          },
          {
            id: 'notif-5',
            userId: 'mock-parent-1',
            type: 'MEDIA_UPLOAD',
            title: 'Practice Video Uploaded',
            message: 'Alex Johnson uploaded a practice video for "Free Throw Practice"',
            read: true,
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            data: {
              childName: 'Alex Johnson',
              drillName: 'Free Throw Practice',
              mediaType: 'VIDEO',
            },
          },
        ],
        mediaUploads: [
          {
            id: 'media-1',
            userId: 'mock-child-1',
            drillId: 'drill-1',
            filename: 'free-throw-practice.mp4',
            originalName: 'Free Throw Practice Video',
            mimeType: 'video/mp4',
            size: 15728640,
            uploadedAt: new Date(Date.now() - 259200000).toISOString(),
            feedback: null,
            drill: {
              name: 'Free Throw Practice',
            },
            user: {
              id: 'mock-child-1',
              name: 'Alex Johnson',
            },
          },
        ],
        weeklyProgress: {
          'mock-child-1': {
            completed: 8,
            scheduled: 10,
            points: 120,
          },
          'mock-child-2': {
            completed: 6,
            scheduled: 8,
            points: 95,
          },
        },
      });
    }


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

    // Get recent media uploads from children
    const mediaUploads = await prisma.mediaUpload.findMany({
      where: {
        userId: {
          in: childrenIds,
        },
      },
      include: {
        drill: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        drillCompletion: {
          select: {
            id: true,
            rating: true,
            completedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
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
      mediaUploads,
      weeklyProgress,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    logger.error('Error fetching parent dashboard data', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
