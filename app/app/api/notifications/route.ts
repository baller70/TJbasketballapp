import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const requestContext = logger.createRequestContext(request);
  
  try {
    const { userId } = await auth();
    
    if (!userId) {
      logger.info('No session found, using mock notification save', requestContext);
      // Mock response for development
      const body = await request.json();
      
      logger.info('Mock notification save', { ...requestContext, body });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Notification sent successfully (mock)',
        notificationId: `notification_${Date.now()}`
      });
    }

    const { userId: requestUserId, type, title, message, data } = await request.json();

    // In a real app, this would save to database and send push notifications
    // For now, return mock success
    return NextResponse.json({ 
      success: true, 
      message: 'Notification sent successfully',
      notificationId: `notification_${Date.now()}`,
      userId: requestUserId,
      type,
      title,
      notificationMessage: message,
      data,
      sentAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error sending notification', error as Error, requestContext);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}        