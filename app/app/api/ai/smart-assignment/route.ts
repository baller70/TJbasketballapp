import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { generateSmartAssignment } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      playerId, 
      assignmentType, 
      settings,
      mode = 'manual'
    } = await request.json();

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
      assignedBy: session.user.id,
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
    console.error('Error creating smart assignment:', error);
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