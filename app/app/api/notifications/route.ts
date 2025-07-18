import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('No session found, using mock notification save');
      // Mock response for development
      const body = await request.json();
      
      console.log('Mock notification save:', body);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Notification sent successfully (mock)',
        notificationId: `notification_${Date.now()}`
      });
    }

    const { userId, type, title, message, data } = await request.json();

    // In a real app, this would save to database and send push notifications
    // For now, return mock success
    return NextResponse.json({ 
      success: true, 
      message: 'Notification sent successfully',
      notificationId: `notification_${Date.now()}`,
      userId,
      type,
      title,
      notificationMessage: message,
      data,
      sentAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 