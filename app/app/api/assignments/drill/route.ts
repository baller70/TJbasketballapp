import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      logger.info('No session found, using mock drill assignment');
      // Mock response for development
      const body = await request.json();
      
      logger.info('Mock drill assignment', { body });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Drill assigned successfully (mock)',
        assignmentId: `assignment_${Date.now()}`
      });
    }

    const { userId: targetUserId, drillId, note, assignedBy } = await request.json();

    // In a real app, this would save to database
    // For now, return mock success
    return NextResponse.json({ 
      success: true, 
      message: 'Drill assigned successfully',
      assignmentId: `assignment_${Date.now()}`,
      userId,
      drillId,
      note,
      assignedBy,
      assignedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in drill assignment', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}        