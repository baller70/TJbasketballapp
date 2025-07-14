
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const whereClause: any = {
      userId: session.user.id,
    };

    if (start && end) {
      whereClause.date = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    const scheduleEntries = await prisma.scheduleEntry.findMany({
      where: whereClause,
      include: {
        drill: true,
        workout: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json(scheduleEntries);
  } catch (error) {
    console.error('Error fetching schedule entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { drillId, workoutId, date, startTime, notes } = await request.json();

    const scheduleEntry = await prisma.scheduleEntry.create({
      data: {
        userId: session.user.id,
        drillId: drillId || null,
        workoutId: workoutId || null,
        date: new Date(date),
        startTime: new Date(startTime),
        notes: notes || null,
        status: 'SCHEDULED',
      },
      include: {
        drill: true,
        workout: true,
      },
    });

    return NextResponse.json(scheduleEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule entry:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule entry' },
      { status: 500 }
    );
  }
}
