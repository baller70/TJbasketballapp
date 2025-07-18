import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      name, 
      description, 
      category, 
      skillLevel, 
      duration, 
      equipment, 
      stepByStep, 
      coachingTips, 
      videoUrl,
      isPublic 
    } = await request.json();

    // Validate required fields
    if (!name || !description || !category || !skillLevel || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already has a custom drill with this name
    const existingDrill = await prisma.drill.findFirst({
      where: {
        name,
        createdBy: session.user.id,
      },
    });

    if (existingDrill) {
      return NextResponse.json(
        { error: 'You already have a custom drill with this name' },
        { status: 400 }
      );
    }

    // Create the custom drill
    const customDrill = await prisma.drill.create({
      data: {
        name,
        description,
        category,
        skillLevel,
        duration,
        equipment: equipment || [],
        stepByStep: stepByStep || [],
        coachingTips: coachingTips || [],
        videoUrl,
        alternativeVideos: '',
        isCustom: true,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(customDrill, { status: 201 });
  } catch (error) {
    console.error('Error creating custom drill:', error);
    return NextResponse.json(
      { error: 'Failed to create custom drill' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includePublic = searchParams.get('includePublic') === 'true';

    let whereClause = {};
    
    if (includePublic) {
      // Get user's custom drills AND public custom drills from other users
      whereClause = {
        OR: [
          { userId: session.user.id },
          { isPublic: true, isCustom: true }
        ]
      };
    } else {
      // Get only user's custom drills
      whereClause = { userId: session.user.id };
    }

    const customDrills = await prisma.drill.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(customDrills);
  } catch (error) {
    console.error('Error fetching custom drills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom drills' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const drillId = searchParams.get('id');

    if (!drillId) {
      return NextResponse.json(
        { error: 'Drill ID is required' },
        { status: 400 }
      );
    }

    // Check if drill exists and belongs to user
    const drill = await prisma.drill.findFirst({
      where: {
        id: drillId,
        createdBy: session.user.id,
        isCustom: true,
      },
    });

    if (!drill) {
      return NextResponse.json(
        { error: 'Custom drill not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the custom drill
    await prisma.drill.delete({
      where: { id: drillId },
    });

    return NextResponse.json({ message: 'Custom drill deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom drill:', error);
    return NextResponse.json(
      { error: 'Failed to delete custom drill' },
      { status: 500 }
    );
  }
} 