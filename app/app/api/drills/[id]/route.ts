import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function PUT(
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

    const { id } = params;
    const body = await request.json();
    
    const {
      name,
      description,
      category,
      skillLevel,
      equipment,
      stepByStep,
      coachingTips,
      duration
    } = body;

    // Validate required fields
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Name, description, and category are required' },
        { status: 400 }
      );
    }

    // Check if drill exists and user has permission to edit
    const existingDrill = await prisma.drill.findUnique({
      where: { id },
    });

    if (!existingDrill) {
      return NextResponse.json({ error: 'Drill not found' }, { status: 404 });
    }

    // Only allow editing if it's a custom drill created by the user or if user is admin
    if (existingDrill.createdBy !== userId && !existingDrill.isCustom) {
      return NextResponse.json({ error: 'Not authorized to edit this drill' }, { status: 403 });
    }

    // Update the drill
    const updatedDrill = await prisma.drill.update({
      where: { id },
      data: {
        name,
        description,
        category,
        skillLevel,
        equipment,
        stepByStep,
        coachingTips,
        duration: duration.toString(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedDrill);
  } catch (error) {
    logger.error('Error updating drill', error as Error, { drillId: params.id, userId: userId || undefined });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const drill = await prisma.drill.findUnique({
      where: { id },
    });

    if (!drill) {
      return NextResponse.json({ error: 'Drill not found' }, { status: 404 });
    }

    return NextResponse.json(drill);
  } catch (error) {
    logger.error('Error fetching drill', error as Error, { drillId: params.id });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}          