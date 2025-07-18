import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('No session found, using mock drill assignment');
      // Mock response for development
      const body = await request.json();
      
      console.log('Mock drill assignment:', body);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Drill assigned successfully (mock)',
        assignmentId: `assignment_${Date.now()}`
      });
    }

    const { userId, drillId, note, assignedBy } = await request.json();

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
    console.error('Error in drill assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 