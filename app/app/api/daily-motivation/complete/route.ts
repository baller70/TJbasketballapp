import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { accuracy, quote } = await request.json();

    // Check if user already completed daily motivation today (3 repetitions)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all attempts for today
    const todayAttempts = await prisma.progressEntry.findMany({
      where: {
        userId: userId,
        skillType: 'daily_motivation',
        skillName: 'voice_verification',
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Count successful attempts (accuracy >= 70%)
    const successfulAttempts = todayAttempts.filter(attempt => 
      attempt.value >= 70
    ).length;

    // If already completed 3 successful attempts, return already completed
    if (successfulAttempts >= 3) {
      return NextResponse.json({
        message: 'Daily motivation already completed today (3 repetitions done)',
        alreadyCompleted: true,
        attempts: successfulAttempts,
        totalAttempts: todayAttempts.length,
      });
    }

    // Create progress entry for this attempt
    await prisma.progressEntry.create({
      data: {
        userId: userId,
        skillType: 'daily_motivation',
        skillName: 'voice_verification',
        value: accuracy,
        unit: 'percentage',
        date: new Date(),
        context: {
          quote: quote,
          accuracy: accuracy,
          attemptNumber: todayAttempts.length + 1,
        },
      },
    });

    // Check if this is a successful attempt
    if (accuracy >= 70) {
      const newSuccessfulAttempts = successfulAttempts + 1;
      
      // If this is the 3rd successful attempt, award points
      if (newSuccessfulAttempts === 3) {
        const bonusPoints = 20; // Fixed bonus for completing 3 repetitions
        
        await prisma.playerProfile.update({
          where: { userId: userId },
          data: {
            totalPoints: {
              increment: bonusPoints,
            },
          },
        });

        return NextResponse.json({
          success: true,
          completed: true,
          pointsAwarded: bonusPoints,
          attempts: newSuccessfulAttempts,
          totalAttempts: todayAttempts.length + 1,
          message: `Excellent! You completed all 3 repetitions and earned ${bonusPoints} points!`,
        });
      } else {
        // Still need more repetitions
        const remaining = 3 - newSuccessfulAttempts;
        return NextResponse.json({
          success: true,
          completed: false,
          pointsAwarded: 0,
          attempts: newSuccessfulAttempts,
          totalAttempts: todayAttempts.length + 1,
          remaining: remaining,
          message: `Great job! ${remaining} more repetition${remaining > 1 ? 's' : ''} needed to earn points.`,
        });
      }
    } else {
      // Unsuccessful attempt (accuracy < 70%)
      return NextResponse.json({
        success: false,
        completed: false,
        pointsAwarded: 0,
        attempts: successfulAttempts,
        totalAttempts: todayAttempts.length + 1,
        remaining: 3 - successfulAttempts,
        message: `Keep trying! You need ${accuracy >= 70 ? 'better' : 'higher'} accuracy. ${3 - successfulAttempts} successful repetitions still needed.`,
      });
    }

  } catch (error) {
    logger.error('Daily motivation completion error', error as Error, { userId: userId || undefined });
    return NextResponse.json(
      { error: 'Failed to record daily motivation completion' },
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check daily motivation status for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttempts = await prisma.progressEntry.findMany({
      where: {
        userId: userId,
        skillType: 'daily_motivation',
        skillName: 'voice_verification',
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Count successful attempts (accuracy >= 70%)
    const successfulAttempts = todayAttempts.filter(attempt => 
      attempt.value >= 70
    ).length;

    const completed = successfulAttempts >= 3;

    return NextResponse.json({
      completed,
      attempts: successfulAttempts,
      totalAttempts: todayAttempts.length,
      remaining: Math.max(0, 3 - successfulAttempts),
      todayAttempts: todayAttempts.map(attempt => ({
        id: attempt.id,
        accuracy: attempt.value,
        successful: attempt.value >= 70,
        date: attempt.date,
        context: attempt.context,
      })),
    });

  } catch (error) {
    logger.error('Daily motivation status error', error as Error, { userId: userId || undefined });
    return NextResponse.json(
      { error: 'Failed to get daily motivation status' },
      { status: 500 }
    );
  }
}            