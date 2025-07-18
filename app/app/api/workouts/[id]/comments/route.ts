import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      logger.info('No user authentication found, using mock workout comment save');
      // Mock response for development
      const body = await request.json();
      
      logger.info('Mock workout comment save for workout', { workoutId: params.id, body });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Comment saved successfully (mock)',
        workoutId: params.id,
        commentId: `comment_${Date.now()}`
      });
    }

    const { userId: targetUserId, comment, commentBy } = await request.json();

    // In a real app, this would save to database
    // For now, return mock success
    return NextResponse.json({ 
      success: true, 
      message: 'Comment saved successfully',
      workoutId: params.id,
      userId,
      comment,
      commentBy,
      commentedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error saving workout comment', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}        