import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { generateCustomDrill } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      playerId, 
      skillLevel, 
      focusArea, 
      difficulty = 'medium',
      duration = 15,
      equipment = []
    } = await request.json();

    if (!playerId || !skillLevel || !focusArea) {
      return NextResponse.json({ error: 'Player ID, skill level, and focus area are required' }, { status: 400 });
    }

    // Fetch player data for personalization
    const playerData = await fetchPlayerData(playerId);
    
    if (!playerData) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Generate custom drill using OpenAI
    const drill = await generateCustomDrill(skillLevel, focusArea, {
      ...playerData,
      difficulty,
      duration,
      equipment
    });

    // Save drill to database
    await saveDrill(drill, session.user.id);

    return NextResponse.json({
      success: true,
      drill,
      playerId,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in custom drill creation:', error);
    return NextResponse.json(
      { error: 'Failed to create custom drill' },
      { status: 500 }
    );
  }
}

async function fetchPlayerData(playerId: string) {
  try {
    // Mock data - replace with actual database queries
    return {
      id: playerId,
      name: 'Player Name',
      skillLevel: 'intermediate',
      age: 10,
      position: 'guard',
      strengths: ['passing', 'teamwork'],
      weaknesses: ['shooting', 'defense'],
      recentPerformance: {
        ballHandling: 7,
        shooting: 5,
        passing: 8,
        defense: 4,
        conditioning: 7
      },
      preferredDrillTypes: ['interactive', 'competitive'],
      availableEquipment: ['basketball', 'cones', 'ladder']
    };
  } catch (error) {
    console.error('Error fetching player data:', error);
    return null;
  }
}

async function saveDrill(drill: any, creatorId: string) {
  try {
    // Mock save - replace with actual database save
    const savedDrill = {
      id: `custom_drill_${Date.now()}`,
      ...drill,
      createdBy: creatorId,
      createdAt: new Date().toISOString(),
      isCustom: true,
      isPublic: false
    };
    
    console.log('Saving custom drill:', savedDrill);
    
    // In real implementation, save to database
    return savedDrill;
  } catch (error) {
    console.error('Error saving drill:', error);
    throw error;
  }
} 