import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workoutId = params.id;
    const { name, description, drills, isPublic } = await request.json();

    // Check if workout exists and belongs to the user
    const existingWorkout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        workoutDrills: true,
      },
    });

    if (!existingWorkout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    if (existingWorkout.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Calculate total duration
    const totalDuration = drills.reduce((total: number, drill: any) => total + (drill.duration || 0), 0);

    // Update workout
    const updatedWorkout = await prisma.workout.update({
      where: { id: workoutId },
      data: {
        name,
        description,
        totalDuration,
        isPublic: isPublic || false,
      },
    });

    // Delete existing workout drills
    await prisma.workoutDrill.deleteMany({
      where: { workoutId },
    });

    // Create new workout drills
    const workoutDrills = await Promise.all(
      drills.map(async (drill: any, index: number) => {
        return prisma.workoutDrill.create({
          data: {
            workoutId: workoutId,
            drillId: drill.drillId,
            order: index,
            duration: drill.duration,
            notes: drill.notes,
          },
        });
      })
    );

    return NextResponse.json({ ...updatedWorkout, workoutDrills });
  } catch (error) {
    logger.error('Error updating workout', error as Error, { userId: userId || undefined, workoutId: params.id });
    return NextResponse.json(
      { error: 'Failed to update workout' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workoutId = params.id;

    // Check if workout exists and belongs to the user
    const existingWorkout = await prisma.workout.findUnique({
      where: { id: workoutId },
    });

    if (!existingWorkout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    if (existingWorkout.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete workout drills first (due to foreign key constraint)
    await prisma.workoutDrill.deleteMany({
      where: { workoutId },
    });

    // Delete workout
    await prisma.workout.delete({
      where: { id: workoutId },
    });

    return NextResponse.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    logger.error('Error deleting workout', error as Error, { userId: userId || undefined, workoutId: params.id });
    return NextResponse.json(
      { error: 'Failed to delete workout' },
      { status: 500 }
    );
  }
}          