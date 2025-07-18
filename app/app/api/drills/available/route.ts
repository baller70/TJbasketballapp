import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      logger.info('No session found, using mock available drills');
      // Mock drills data
      const mockDrills = [
        { id: 'drill1', name: 'Ball Handling Basics', difficulty: 'Beginner', duration: 15 },
        { id: 'drill2', name: 'Shooting Form', difficulty: 'Intermediate', duration: 20 },
        { id: 'drill3', name: 'Defensive Stance', difficulty: 'Beginner', duration: 10 },
        { id: 'drill4', name: 'Crossover Technique', difficulty: 'Advanced', duration: 25 },
        { id: 'drill5', name: 'Free Throw Practice', difficulty: 'Beginner', duration: 15 }
      ];
      
      return NextResponse.json(mockDrills);
    }

    // In a real app, this would fetch from database
    // For now, return mock data
    const drills = [
      { id: 'drill1', name: 'Ball Handling Basics', difficulty: 'Beginner', duration: 15 },
      { id: 'drill2', name: 'Shooting Form', difficulty: 'Intermediate', duration: 20 },
      { id: 'drill3', name: 'Defensive Stance', difficulty: 'Beginner', duration: 10 },
      { id: 'drill4', name: 'Crossover Technique', difficulty: 'Advanced', duration: 25 },
      { id: 'drill5', name: 'Free Throw Practice', difficulty: 'Beginner', duration: 15 }
    ];

    return NextResponse.json(drills);

  } catch (error) {
    logger.error('Error fetching available drills', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}      