import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('No session found, using mock workout comment save');
      // Mock response for development
      const body = await request.json();
      
      console.log('Mock workout comment save for workout:', params.id, body);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Comment saved successfully (mock)',
        workoutId: params.id,
        commentId: `comment_${Date.now()}`
      });
    }

    const { userId, comment, commentBy } = await request.json();

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
    console.error('Error saving workout comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 