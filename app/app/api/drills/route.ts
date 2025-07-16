
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const drills = await prisma.drill.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    // Parse JSON strings to arrays for frontend consumption
    const parsedDrills = drills.map((drill: any) => ({
      ...drill,
      equipment: JSON.parse(drill.equipment || '[]'),
      stepByStep: JSON.parse(drill.stepByStep || '[]'),
      coachingTips: JSON.parse(drill.coachingTips || '[]'),
      alternativeVideos: JSON.parse(drill.alternativeVideos || '[]'),
    }));

    return NextResponse.json(parsedDrills);
  } catch (error) {
    console.error('Error fetching drills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drills' },
      { status: 500 }
    );
  }
}
