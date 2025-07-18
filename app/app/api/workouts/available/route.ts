import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      logger.info('No session found, using mock available workouts');
      // Mock workouts data
      const mockWorkouts = [
        { id: 'workout1', name: 'Morning Practice', difficulty: 'Intermediate', duration: 60 },
        { id: 'workout2', name: 'Shooting Session', difficulty: 'Beginner', duration: 45 },
        { id: 'workout3', name: 'Conditioning Workout', difficulty: 'Advanced', duration: 90 },
        { id: 'workout4', name: 'Ball Handling Focus', difficulty: 'Intermediate', duration: 30 },
        { id: 'workout5', name: 'Game Simulation', difficulty: 'Advanced', duration: 120 }
      ];
      
      return NextResponse.json(mockWorkouts);
    }

    // In a real app, this would fetch from database
    // For now, return mock data
    const workouts = [
      { id: 'workout1', name: 'Morning Practice', difficulty: 'Intermediate', duration: 60 },
      { id: 'workout2', name: 'Shooting Session', difficulty: 'Beginner', duration: 45 },
      { id: 'workout3', name: 'Conditioning Workout', difficulty: 'Advanced', duration: 90 },
      { id: 'workout4', name: 'Ball Handling Focus', difficulty: 'Intermediate', duration: 30 },
      { id: 'workout5', name: 'Game Simulation', difficulty: 'Advanced', duration: 120 }
    ];

    return NextResponse.json(workouts);

  } catch (error) {
    logger.error('Error fetching available workouts', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}      