import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateSmartAssignment } from '@/lib/openai';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let userId: string | null = null;
  let playerId: string | undefined = undefined;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestBody = await request.json();
    const { 
      playerId: requestPlayerId, 
      assignmentType, 
      settings,
      mode = 'manual'
    } = requestBody;
    
    playerId = requestPlayerId;

    if (!playerId || !assignmentType) {
      return NextResponse.json({ error: 'Player ID and assignment type are required' }, { status: 400 });
    }

    // Fetch player data for personalized assignment
    const playerData = await fetchPlayerData(playerId);
    
    // Generate smart assignment using AI
    const smartAssignment = await generateSmartAssignment({
      playerId,
      assignmentType,
      settings,
      mode,
      playerData
    });

    // Save assignment to database
    const assignment = await saveAssignment({
      playerId,
      assignedBy: userId,
      type: assignmentType,
      title: smartAssignment.title,
      description: smartAssignment.description,
      difficulty: smartAssignment.difficulty,
      estimatedDuration: smartAssignment.estimatedDuration,
      aiGenerated: true,
      aiRecommendations: smartAssignment.recommendations,
      dueDate: smartAssignment.dueDate,
      instructions: smartAssignment.instructions
    });

    return NextResponse.json({
      success: true,
      assignment,
      aiInsights: smartAssignment.insights
    });
  } catch (error) {
    logger.error('Error creating smart assignment', error as Error, { 
      userId: userId || undefined, 
      playerId: playerId || undefined 
    });
    return NextResponse.json({ error: 'Failed to create smart assignment' }, { status: 500 });
  }
}

async function fetchPlayerData(playerId: string) {
  // Mock player data - in real implementation, fetch from database
  return {
    id: playerId,
    skillLevel: 'intermediate',
    strengths: ['shooting', 'ball handling'],
    weaknesses: ['defense', 'rebounding'],
    recentPerformance: {
      drillsCompleted: 15,
      averageScore: 7.5,
      improvementAreas: ['footwork', 'conditioning']
    },
    preferences: {
      practiceTime: 'evening',
      difficulty: 'medium',
      focusAreas: ['shooting', 'passing']
    }
  };
}

async function saveAssignment(assignmentData: any) {
  // Mock save - in real implementation, save to database
  return {
    id: `assignment_${Date.now()}`,
    ...assignmentData,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
}          