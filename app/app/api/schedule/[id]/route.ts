
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();

    const scheduleEntry = await prisma.scheduleEntry.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
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
          userId: session.user.id,
          drillId: scheduleEntry.drillId,
          scheduleEntryId: scheduleEntry.id,
          duration: 0, // Will be updated by timer
          performance: {},
        },
      });
    }

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error updating schedule entry:', error);
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
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scheduleEntry = await prisma.scheduleEntry.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
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
    console.error('Error deleting schedule entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule entry' },
      { status: 500 }
    );
  }
}
