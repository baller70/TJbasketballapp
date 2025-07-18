import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateCustomDrill } from '@/lib/openai';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
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
    await saveDrill(drill, userId);

    return NextResponse.json({
      success: true,
      drill,
      playerId,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in custom drill creation', error as Error, { userId: userId || undefined });
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
    logger.error('Error fetching player data', error as Error, { playerId });
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
    
    logger.info('Saving custom drill', { drillId: savedDrill.id, creatorId });
    
    // In real implementation, save to database
    return savedDrill;
  } catch (error) {
    logger.error('Error saving drill', error as Error, { creatorId });
    throw error;
  }
}        