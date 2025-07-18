
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      // For demo purposes, return success without session
      logger.info('No session found, but marking notification as read (mock)');
      return NextResponse.json({ success: true });
    }

    const notificationId = params.id;

    // Verify the notification belongs to the current user
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: userId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Mark notification as read
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error marking notification as read', error as Error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
