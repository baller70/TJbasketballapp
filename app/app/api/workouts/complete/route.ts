import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { sendParentNotification } from '@/lib/resend';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workoutId, completedDrills, totalDuration } = await request.json();

    // Create workout completion record
    const workoutCompletion = await prisma.workoutCompletion.create({
      data: {
        userId: userId,
        workoutId,
        completedAt: new Date(),
        totalDuration,
        completedDrills: completedDrills.length,
      },
    });

    // Update player profile - add points for workout completion
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: userId },
    });

    let pointsToAdd = completedDrills.length * 15; // Base points per drill in workout
    pointsToAdd += 50; // Bonus for completing full workout
    let newStreak = 0;

    if (playerProfile) {

      // Check if this is a daily streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayCompletions = await prisma.workoutCompletion.count({
        where: {
          userId: userId,
          completedAt: {
            gte: today,
          },
        },
      });

      newStreak = playerProfile.currentStreak;
      if (todayCompletions === 1) {
        // First completion today
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const yesterdayCompletions = await prisma.workoutCompletion.count({
          where: {
            userId: userId,
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
        where: { userId: userId },
        data: {
          totalPoints: playerProfile.totalPoints + pointsToAdd,
          currentStreak: newStreak,
          longestStreak: Math.max(playerProfile.longestStreak, newStreak),
          lastActiveDate: new Date(),
        },
      });
    }

    // Send email notification to centralized parent email
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          parent: {
            include: {
              emailSettings: true,
            },
          },
        },
      });

      // Get workout information
      const workout = await prisma.workout.findUnique({
        where: { id: workoutId },
      });

      // Check if there are any parent email settings configured for all completions
      const globalEmailSettings = await prisma.parentEmailSettings.findMany({
        where: {
          receiveAllCompletions: true,
        },
        include: {
          user: true,
        },
      });

      // Send to user's parent if they have email settings
      if (user?.parent?.emailSettings?.receiveAllCompletions) {
        await sendParentNotification(
          user.parent.emailSettings.notificationEmail,
          user.name || 'Your child',
          'WORKOUT_COMPLETED',
          {
            workoutName: workout?.name || 'Unknown Workout',
            duration: totalDuration ? `${Math.floor(totalDuration / 60)}:${(totalDuration % 60).toString().padStart(2, '0')}` : null,
            drillsCompleted: completedDrills.length,
            pointsEarned: pointsToAdd,
            currentStreak: newStreak,
          }
        );
      }

      // Send to all parents who want to receive all completions
      for (const emailSetting of globalEmailSettings) {
        await sendParentNotification(
          emailSetting.notificationEmail,
          user?.name || 'A student',
          'WORKOUT_COMPLETED',
          {
            workoutName: workout?.name || 'Unknown Workout',
            duration: totalDuration ? `${Math.floor(totalDuration / 60)}:${(totalDuration % 60).toString().padStart(2, '0')}` : null,
            drillsCompleted: completedDrills.length,
            pointsEarned: pointsToAdd,
            currentStreak: newStreak,
            studentName: user?.name || 'A student',
          }
        );
      }

      // Create notification for parent if they exist
      if (user?.parent) {
        await prisma.notification.create({
          data: {
            userId: user.parent.id,
            type: 'PARENT_NOTIFICATION',
            title: 'Workout Completed',
            message: `${user.name || 'Your child'} completed "${workout?.name || 'Unknown Workout'}" with ${completedDrills.length} drills and earned ${pointsToAdd} points!`,
            read: false,
            data: {
              workoutCompletionId: workoutCompletion.id,
              childName: user.name,
              workoutName: workout?.name,
              drillsCompleted: completedDrills.length,
              pointsEarned: pointsToAdd,
              totalDuration: totalDuration,
            },
          },
        });
      }
    } catch (emailError) {
      logger.error('Error sending parent notification', emailError as Error, { userId, workoutId });
      // Don't fail the workout completion if email fails
    }

    return NextResponse.json(workoutCompletion);
  } catch (error) {
    logger.error('Error completing workout', error as Error, { userId: userId || undefined });
    return NextResponse.json(
      { error: 'Failed to complete workout' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workoutId = searchParams.get('workoutId');
    const queryUserId = searchParams.get('userId') || userId;

    let whereClause: any = {
      userId: queryUserId
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
    logger.error('Error fetching workout completions', error as Error, { userId: userId || undefined });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}          