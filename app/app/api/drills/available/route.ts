import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Mock drills data for demonstration
    const drills = [
      { id: 'drill1', name: 'Ball Handling Basics', difficulty: 'Beginner', duration: 15 },
      { id: 'drill2', name: 'Shooting Form', difficulty: 'Intermediate', duration: 20 },
      { id: 'drill3', name: 'Defensive Stance', difficulty: 'Beginner', duration: 10 },
      { id: 'drill4', name: 'Crossover Technique', difficulty: 'Advanced', duration: 25 },
      { id: 'drill5', name: 'Free Throw Practice', difficulty: 'Beginner', duration: 15 }
    ];

    return NextResponse.json(drills);

  } catch (error) {
    console.error('Error fetching available drills:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}  