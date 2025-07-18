
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      logger.info('No session found, using mock drills data');
      // Return mock data for development
      return NextResponse.json([
        {
          id: 'drill-1',
          name: 'Basic Dribbling',
          description: 'Learn fundamental dribbling techniques',
          difficulty: 'BEGINNER',
          duration: 15,
          equipment: ['Basketball'],
          stepByStep: ['Dribble with right hand', 'Switch to left hand', 'Repeat'],
          coachingTips: ['Keep your head up', 'Use fingertips'],
          videoUrl: 'https://example.com/video1.mp4',
          alternativeVideos: [],
          isCustom: false,
          category: 'Ball Handling',
          skillLevel: 'BEGINNER',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'drill-2',
          name: 'Shooting Form',
          description: 'Perfect your shooting technique',
          difficulty: 'INTERMEDIATE',
          duration: 20,
          equipment: ['Basketball', 'Hoop'],
          stepByStep: ['Set your feet', 'Align your shooting hand', 'Follow through'],
          coachingTips: ['Keep elbow under the ball', 'Snap your wrist'],
          videoUrl: 'https://example.com/video2.mp4',
          alternativeVideos: [],
          isCustom: false,
          category: 'Shooting',
          skillLevel: 'INTERMEDIATE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }

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
    logger.error('Error fetching drills', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch drills' },
      { status: 500 }
    );
  }
}
