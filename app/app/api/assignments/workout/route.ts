import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('No session found, using mock workout assignment');
      // Mock response for development
      const body = await request.json();
      
      console.log('Mock workout assignment:', body);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Workout assigned successfully (mock)',
        assignmentId: `assignment_${Date.now()}`
      });
    }

    const { userId, workoutId, note, assignedBy } = await request.json();

    // In a real app, this would save to database
    // For now, return mock success
    return NextResponse.json({ 
      success: true, 
      message: 'Workout assigned successfully',
      assignmentId: `assignment_${Date.now()}`,
      userId,
      workoutId,
      note,
      assignedBy,
      assignedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in workout assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 