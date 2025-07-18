import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
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
        { error: 'Missing required fields: name, description, category, skillLevel' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse arrays from strings
    const equipmentArray = equipment ? equipment.split(',').map((item: string) => item.trim()).filter(Boolean) : [];
    const stepByStepArray = stepByStep ? stepByStep.split('\n').map((step: string) => step.trim()).filter(Boolean) : [];
    const coachingTipsArray = coachingTips ? coachingTips.split('\n').map((tip: string) => tip.trim()).filter(Boolean) : [];

    const customDrill = await prisma.drill.create({
      data: {
        name,
        description,
        category,
        skillLevel,
        duration: duration || '15 minutes',
        equipment: equipmentArray,
        stepByStep: stepByStepArray,
        coachingTips: coachingTipsArray,
        videoUrl: videoUrl || null,
        alternativeVideos: videoUrl || '',
        isCustom: true,
        createdBy: user.id,
      },
    });

    return NextResponse.json(customDrill);
  } catch (error) {
    console.error('Error creating custom drill:', error);
    return NextResponse.json(
      { error: 'Failed to create custom drill' },
      { status: 500 }
    );
  }
} 