import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    // Create a default drill if it doesn't exist
    const defaultDrill = await prisma.drill.upsert({
      where: { name: 'General Training' },
      update: {},
      create: {
        name: 'General Training',
        description: 'General basketball training session',
        category: 'General',
        skillLevel: 'All Levels',
        duration: '30 minutes',
        equipment: JSON.stringify(['Basketball']),
        stepByStep: JSON.stringify(['Warm up', 'Practice', 'Cool down']),
        coachingTips: JSON.stringify(['Focus on form', 'Stay consistent']),
        videoUrl: null,
        alternativeVideos: JSON.stringify([]),
        isCustom: false,
      },
    });

    return NextResponse.json({ 
      success: true, 
      drill: defaultDrill,
      message: 'Default drill created successfully' 
    });
  } catch (error) {
    console.error('Error creating default drill:', error);
    return NextResponse.json(
      { error: 'Failed to create default drill' },
      { status: 500 }
    );
  }
} 