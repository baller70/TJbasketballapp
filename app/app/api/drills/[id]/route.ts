import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
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
    if (existingDrill.createdBy !== session.user.id && !existingDrill.isCustom) {
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
    console.error('Error updating drill:', error);
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
    console.error('Error fetching drill:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 