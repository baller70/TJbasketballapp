
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    
    // Handle case where there's no session (mock mode)
    if (!userId) {
      logger.info('No session found, using mock workouts data');
      
      // Return mock workouts data for testing
      const mockWorkouts = [
        {
          id: 'mock-workout-1',
          name: 'Beginner Shooting Practice',
          description: 'Perfect for players just starting to learn proper shooting form',
          userId: 'mock-user',
          duration: 30,
          difficulty: 'Beginner',
          category: 'Shooting',
          isPublic: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          workoutDrills: [
            {
              id: 'wd-1',
              workoutId: 'mock-workout-1',
              drillId: 'drill-1',
              order: 1,
              duration: 10,
              drill: {
                id: 'drill-1',
                name: 'Form Shooting',
                description: 'Practice proper shooting form close to the basket',
                category: 'Shooting',
                difficulty: 'Beginner',
                duration: 10,
                equipment: ['Basketball', 'Hoop'],
                instructions: ['Stand 3 feet from basket', 'Focus on follow-through', 'Make 10 shots'],
                videoUrl: null,
                createdAt: new Date().toISOString()
              }
            },
            {
              id: 'wd-2',
              workoutId: 'mock-workout-1',
              drillId: 'drill-2',
              order: 2,
              duration: 20,
              drill: {
                id: 'drill-2',
                name: 'Free Throw Practice',
                description: 'Develop consistent free throw shooting',
                category: 'Shooting',
                difficulty: 'Beginner',
                duration: 20,
                equipment: ['Basketball', 'Hoop'],
                instructions: ['Stand at free throw line', 'Use same routine each time', 'Make 15 shots'],
                videoUrl: null,
                createdAt: new Date().toISOString()
              }
            }
          ]
        },
        {
          id: 'mock-workout-2',
          name: 'Ball Handling Basics',
          description: 'Essential dribbling drills for better ball control',
          userId: 'mock-user',
          duration: 25,
          difficulty: 'Beginner',
          category: 'Dribbling',
          isPublic: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          workoutDrills: [
            {
              id: 'wd-3',
              workoutId: 'mock-workout-2',
              drillId: 'drill-3',
              order: 1,
              duration: 15,
              drill: {
                id: 'drill-3',
                name: 'Stationary Dribbling',
                description: 'Practice basic dribbling without moving',
                category: 'Dribbling',
                difficulty: 'Beginner',
                duration: 15,
                equipment: ['Basketball'],
                instructions: ['Dribble with right hand', 'Switch to left hand', 'Keep eyes up'],
                videoUrl: null,
                createdAt: new Date().toISOString()
              }
            },
            {
              id: 'wd-4',
              workoutId: 'mock-workout-2',
              drillId: 'drill-4',
              order: 2,
              duration: 10,
              drill: {
                id: 'drill-4',
                name: 'Crossover Practice',
                description: 'Learn the basic crossover dribble move',
                category: 'Dribbling',
                difficulty: 'Beginner',
                duration: 10,
                equipment: ['Basketball'],
                instructions: ['Start with right hand', 'Cross over to left', 'Back to right hand'],
                videoUrl: null,
                createdAt: new Date().toISOString()
              }
            }
          ]
        }
      ];

      return NextResponse.json(mockWorkouts);
    }

    const workouts = await prisma.workout.findMany({
      where: {
        OR: [
          { userId: userId },
          { isPublic: true },
        ],
      },
      include: {
        workoutDrills: {
          include: {
            drill: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(workouts);
  } catch (error) {
    logger.error('Error fetching workouts', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch workouts' },
      { status: 500 }
    );
  }
}

export async function POST(request: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, drills, isPublic } = await request.json();

    // Calculate total duration
    const totalDuration = drills.reduce((total: number, drill: any) => total + (drill.duration || 0), 0);

    // Create workout
    const workout = await prisma.workout.create({
      data: {
        name,
        description,
        totalDuration,
        isPublic: isPublic || false,
        userId: userId,
      },
    });

    // Create workout drills
    const workoutDrills = await Promise.all(
      drills.map(async (drill: any, index: number) => {
        return prisma.workoutDrill.create({
          data: {
            workoutId: workout.id,
            drillId: drill.drillId,
            order: index,
            duration: drill.duration,
            notes: drill.notes,
          },
        });
      })
    );

    return NextResponse.json({ ...workout, workoutDrills }, { status: 201 });
  } catch (error) {
    logger.error('Error creating workout', error as Error);
    return NextResponse.json(
      { error: 'Failed to create workout' },
      { status: 500 }
    );
  }
}
