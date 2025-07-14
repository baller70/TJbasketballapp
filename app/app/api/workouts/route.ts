
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workouts = await prisma.workout.findMany({
      where: {
        OR: [
          { userId: session.user.id },
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
    console.error('Error fetching workouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workouts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
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
        userId: session.user.id,
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
    console.error('Error creating workout:', error);
    return NextResponse.json(
      { error: 'Failed to create workout' },
      { status: 500 }
    );
  }
}
