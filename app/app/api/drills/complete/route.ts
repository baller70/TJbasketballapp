
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';
import { sendParentNotification } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { drillId, duration, rating, feedback } = await request.json();

    // Create drill completion record
    const drillCompletion = await prisma.drillCompletion.create({
      data: {
        userId: session.user.id,
        drillId,
        duration,
        rating,
        feedback,
        performance: {},
      },
    });

    // Update player profile - add points and update streak
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
    });

    let pointsToAdd = 10; // Base points for completing a drill
    if (rating === 5) pointsToAdd += 5; // Bonus for perfect rating
    let newStreak = 0;

    if (playerProfile) {

      // Check if this is a daily streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayCompletions = await prisma.drillCompletion.count({
        where: {
          userId: session.user.id,
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
        
        const yesterdayCompletions = await prisma.drillCompletion.count({
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
          pointsToAdd += 20; // Streak bonus
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

    // Send email notification to centralized parent email
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          parent: {
            include: {
              emailSettings: true,
            },
          },
        },
      });

      // Get drill information
      const drill = await prisma.drill.findUnique({
        where: { id: drillId },
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
          'DRILL_COMPLETED',
          {
            drillName: drill?.name || 'Unknown Drill',
            duration: duration ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : null,
            rating: rating,
            notes: feedback,
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
          'DRILL_COMPLETED',
          {
            drillName: drill?.name || 'Unknown Drill',
            duration: duration ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : null,
            rating: rating,
            notes: feedback,
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
            title: 'Drill Completed',
            message: `${user.name || 'Your child'} completed "${drill?.name || 'Unknown Drill'}" and earned ${pointsToAdd} points!`,
            read: false,
            data: {
              drillCompletionId: drillCompletion.id,
              childName: user.name,
              drillName: drill?.name,
              pointsEarned: pointsToAdd,
              rating: rating,
              duration: duration,
            },
          },
        });
      }
    } catch (emailError) {
      console.error('Error sending parent notification:', emailError);
      // Don't fail the drill completion if email fails
    }

    return NextResponse.json(drillCompletion);
  } catch (error) {
    console.error('Error completing drill:', error);
    return NextResponse.json(
      { error: 'Failed to complete drill' },
      { status: 500 }
    );
  }
}
