
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();

    const scheduleEntry = await prisma.scheduleEntry.findFirst({
      where: {
        id: params.id,
        userId: userId,
      },
    });

    if (!scheduleEntry) {
      return NextResponse.json(
        { error: 'Schedule entry not found' },
        { status: 404 }
      );
    }

    const updatedEntry = await prisma.scheduleEntry.update({
      where: { id: params.id },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
      include: {
        drill: true,
        workout: true,
      },
    });

    // If completed, create a drill completion record
    if (status === 'COMPLETED' && scheduleEntry.drillId) {
      await prisma.drillCompletion.create({
        data: {
          userId: userId,
          drillId: scheduleEntry.drillId,
          scheduleEntryId: scheduleEntry.id,
          duration: 0, // Will be updated by timer
          performance: {},
        },
      });
    }

    return NextResponse.json(updatedEntry);
  } catch (error) {
    logger.error('Error updating schedule entry', error as Error, { userId: userId || undefined, scheduleId: params.id });
    return NextResponse.json(
      { error: 'Failed to update schedule entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scheduleEntry = await prisma.scheduleEntry.findFirst({
      where: {
        id: params.id,
        userId: userId,
      },
    });

    if (!scheduleEntry) {
      return NextResponse.json(
        { error: 'Schedule entry not found' },
        { status: 404 }
      );
    }

    await prisma.scheduleEntry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Schedule entry deleted' });
  } catch (error) {
    logger.error('Error deleting schedule entry', error as Error, { userId: userId || undefined, scheduleId: params.id });
    return NextResponse.json(
      { error: 'Failed to delete schedule entry' },
      { status: 500 }
    );
  }
}
