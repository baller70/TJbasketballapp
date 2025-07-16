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

    const body = await request.json();
    const {
      name,
      description,
      category,
      skillLevel,
      duration,
      equipment,
      stepByStep,
      coachingTips,
      videoUrl
    } = body;

    // Validate required fields
    if (!name || !description || !category || !skillLevel) {
      return NextResponse.json(
        { error: 'Name, description, category, and skill level are required' },
        { status: 400 }
      );
    }

    // Parse equipment and step-by-step instructions into arrays
    const equipmentArray = equipment ? equipment.split(',').map((item: string) => item.trim()).filter(Boolean) : [];
    const stepByStepArray = stepByStep ? stepByStep.split('\n').map((step: string) => step.trim()).filter(Boolean) : [];
    const coachingTipsArray = coachingTips ? coachingTips.split('\n').map((tip: string) => tip.trim()).filter(Boolean) : [];

    // Create the custom drill
    const customDrill = await prisma.drill.create({
      data: {
        name,
        description,
        category,
        skillLevel: skillLevel as any,
        duration: duration ? parseInt(duration) : 15,
        equipment: JSON.stringify(equipmentArray),
        stepByStep: JSON.stringify(stepByStepArray),
        coachingTips: JSON.stringify(coachingTipsArray),
        alternativeVideos: videoUrl ? JSON.stringify([{ title: 'Custom Video', url: videoUrl }]) : JSON.stringify([]),
        isCustom: true, // Mark as custom drill
        createdBy: session.user.id, // Track who created it
      },
    });

    // Parse JSON fields for response
    const formattedDrill = {
      ...customDrill,
      equipment: JSON.parse(customDrill.equipment),
      stepByStep: JSON.parse(customDrill.stepByStep),
      coachingTips: JSON.parse(customDrill.coachingTips),
      alternativeVideos: JSON.parse(customDrill.alternativeVideos),
    };

    return NextResponse.json(formattedDrill, { status: 201 });
  } catch (error) {
    console.error('Error creating custom drill:', error);
    return NextResponse.json(
      { error: 'Failed to create custom drill' },
      { status: 500 }
    );
  }
} 