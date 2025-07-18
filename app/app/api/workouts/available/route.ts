import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('No session found, using mock available workouts');
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
    console.error('Error fetching available workouts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 