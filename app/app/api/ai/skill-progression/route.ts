import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { generateSkillProgression } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      playerId, 
      timeframe = '30days',
      includeComparisons = true,
      generateInsights = true
    } = await request.json();

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    // Fetch historical player data
    const historicalData = await fetchPlayerHistoricalData(playerId, timeframe);
    
    // Generate skill progression analysis
    const progression = await generateSkillProgression({
      playerId,
      timeframe,
      includeComparisons,
      generateInsights,
      historicalData
    });

    // Save progression analysis
    const savedProgression = await saveProgressionAnalysis({
      playerId,
      analyzedBy: session.user.id,
      timeframe,
      progressionData: progression,
      aiGenerated: true,
      insights: progression.insights
    });

    return NextResponse.json({
      success: true,
      progression: savedProgression,
      insights: progression.insights
    });
  } catch (error) {
    console.error('Error analyzing skill progression:', error);
    return NextResponse.json({ error: 'Failed to analyze skill progression' }, { status: 500 });
  }
}

async function fetchPlayerHistoricalData(playerId: string, timeframe: string) {
  // Mock historical data - in real implementation, fetch from database
  return {
    id: playerId,
    timeframe,
    skillHistory: [
      { date: '2024-01-01', shooting: 6, defense: 5, ballHandling: 7 },
      { date: '2024-01-08', shooting: 6.5, defense: 5.5, ballHandling: 7.2 },
      { date: '2024-01-15', shooting: 7, defense: 6, ballHandling: 7.5 }
    ],
    drillPerformance: [
      { week: 1, averageScore: 75, completedDrills: 12 },
      { week: 2, averageScore: 78, completedDrills: 15 },
      { week: 3, averageScore: 82, completedDrills: 18 }
    ],
    assessmentHistory: [
      { date: '2024-01-01', overallScore: 6.5 },
      { date: '2024-01-15', overallScore: 7.2 }
    ]
  };
}

async function saveProgressionAnalysis(progressionData: any) {
  // Mock save - in real implementation, save to database
  return {
    id: `progression_${Date.now()}`,
    ...progressionData,
    createdAt: new Date().toISOString(),
    status: 'completed'
  };
} 