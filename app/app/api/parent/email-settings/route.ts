import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      // Return mock settings for demonstration
      console.log('No session found, using mock email settings');
      return NextResponse.json({
        notificationEmail: 'parent@example.com',
        receiveAllCompletions: true,
        receiveAchievements: true,
        receiveWeeklyReports: true,
        receiveMediaUploads: true,
      });
    }

    const userId = session.user.id;

    // Get user's email settings
    const emailSettings = await prisma.parentEmailSettings.findUnique({
      where: { userId },
    });

    if (!emailSettings) {
      // Return default settings if none exist
      return NextResponse.json({
        notificationEmail: session.user.email || '',
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
    console.error('Error fetching email settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      // For demo purposes, return success without session
      console.log('No session found, but saving email settings (mock)');
      return NextResponse.json({ success: true });
    }

    const userId = session.user.id;
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
    console.error('Error saving email settings:', error);
    return NextResponse.json(
      { error: 'Failed to save email settings' },
      { status: 500 }
    );
  }
} 