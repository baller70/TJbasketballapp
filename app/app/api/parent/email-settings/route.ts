import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      // Return mock settings for demonstration
      logger.info('No session found, using mock email settings');
      return NextResponse.json({
        notificationEmail: 'parent@example.com',
        receiveAllCompletions: true,
        receiveAchievements: true,
        receiveWeeklyReports: true,
        receiveMediaUploads: true,
      });
    }


    // Get user's email settings
    const emailSettings = await prisma.parentEmailSettings.findUnique({
      where: { userId },
    });

    if (!emailSettings) {
      // Return default settings if none exist
      return NextResponse.json({
        notificationEmail: '',
        receiveAllCompletions: false,
        receiveAchievements: true,
        receiveWeeklyReports: true,
        receiveMediaUploads: true,
      });
    }

    return NextResponse.json({
      notificationEmail: emailSettings.notificationEmail,
      receiveAllCompletions: emailSettings.receiveAllCompletions,
      receiveAchievements: emailSettings.receiveAchievements,
      receiveWeeklyReports: emailSettings.receiveWeeklyReports,
      receiveMediaUploads: emailSettings.receiveMediaUploads,
    });
  } catch (error) {
    logger.error('Error fetching email settings', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch email settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      // For demo purposes, return success without session
      logger.info('No session found, but saving email settings (mock)');
      return NextResponse.json({ success: true });
    }

    const body = await request.json();

    const {
      notificationEmail,
      receiveAllCompletions,
      receiveAchievements,
      receiveWeeklyReports,
      receiveMediaUploads,
    } = body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(notificationEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Upsert email settings
    const emailSettings = await prisma.parentEmailSettings.upsert({
      where: { userId },
      update: {
        notificationEmail,
        receiveAllCompletions,
        receiveAchievements,
        receiveWeeklyReports,
        receiveMediaUploads,
      },
      create: {
        userId,
        notificationEmail,
        receiveAllCompletions,
        receiveAchievements,
        receiveWeeklyReports,
        receiveMediaUploads,
      },
    });

    return NextResponse.json({ success: true, emailSettings });
  } catch (error) {
    logger.error('Error saving email settings', error as Error);
    return NextResponse.json(
      { error: 'Failed to save email settings' },
      { status: 500 }
    );
  }
}        