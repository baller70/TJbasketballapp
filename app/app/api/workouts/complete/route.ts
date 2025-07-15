import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workoutId, duration, rating, feedback, scheduleEntryId } = body;

    if (!workoutId || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the workout exists
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        workoutDrills: {
          include: {
            drill: true
          }
        }
      }
    });

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Create workout completion
    const completion = await prisma.workoutCompletion.create({
      data: {
        userId: session.user.id,
        workoutId,
        duration,
        rating: rating || null,
        feedback: feedback || null,
        scheduleEntryId: scheduleEntryId || null,
        performance: {
          totalDrills: workout.workoutDrills.length,
          completedAt: new Date().toISOString()
        }
      },
      include: {
        workout: {
          include: {
            workoutDrills: {
              include: {
                drill: true
              }
            }
          }
        }
      }
    });

    // Update schedule entry if provided
    if (scheduleEntryId) {
      await prisma.scheduleEntry.update({
        where: { id: scheduleEntryId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });
    }

    // Create notification for parent/coach
    if (session.user.role === 'PLAYER') {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'WORKOUT_COMPLETED',
          title: 'Workout Completed',
          message: `Your player completed the workout "${workout.name}"`,
          data: {
            workoutId,
            completionId: completion.id,
            duration,
            rating
          }
        }
      });
    }

    return NextResponse.json(completion);
  } catch (error) {
    console.error('Error completing workout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workoutId = searchParams.get('workoutId');
    const userId = searchParams.get('userId') || session.user.id;

    let whereClause: any = {
      userId
    };

    if (workoutId) {
      whereClause.workoutId = workoutId;
    }

    const completions = await prisma.workoutCompletion.findMany({
      where: whereClause,
      include: {
        workout: {
          include: {
            workoutDrills: {
              include: {
                drill: true
              }
            }
          }
        },
        workoutComments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    });

    return NextResponse.json(completions);
  } catch (error) {
    console.error('Error fetching workout completions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 