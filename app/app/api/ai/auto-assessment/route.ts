import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { generateAutoAssessment } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      playerId, 
      assessmentType = 'comprehensive',
      includeVideoAnalysis = true,
      includePerformanceMetrics = true,
      generateRecommendations = true,
      mode = 'manual'
    } = await request.json();

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    // Fetch comprehensive player data
    const playerData = await fetchPlayerAssessmentData(playerId);
    
    // Generate AI assessment
    const assessment = await generateAutoAssessment({
      playerId,
      assessmentType,
      includeVideoAnalysis,
      includePerformanceMetrics,
      generateRecommendations,
      mode,
      playerData
    });

    // Save assessment to database
    const savedAssessment = await saveAssessment({
      playerId,
      assessedBy: session.user.id,
      assessmentType,
      skillRatings: assessment.skillRatings,
      overallScore: assessment.overallScore,
      aiGenerated: true,
      aiInsights: assessment.insights,
      recommendations: assessment.recommendations,
      strengths: assessment.strengths,
      improvementAreas: assessment.improvementAreas,
      nextGoals: assessment.nextGoals
    });

    return NextResponse.json({
      success: true,
      assessment: savedAssessment,
      aiInsights: assessment.insights
    });
  } catch (error) {
    console.error('Error generating auto assessment:', error);
    return NextResponse.json({ error: 'Failed to generate auto assessment' }, { status: 500 });
  }
}

async function fetchPlayerAssessmentData(playerId: string) {
  // Mock comprehensive player data - in real implementation, fetch from database
  return {
    id: playerId,
    recentDrills: [
      { name: 'Free Throws', score: 85, completedAt: '2024-01-15' },
      { name: 'Layups', score: 92, completedAt: '2024-01-14' },
      { name: 'Dribbling', score: 78, completedAt: '2024-01-13' }
    ],
    videoUploads: [
      { type: 'shooting', analysisScore: 88, uploadedAt: '2024-01-15' },
      { type: 'defense', analysisScore: 75, uploadedAt: '2024-01-12' }
    ],
    performanceMetrics: {
      averageScore: 85,
      consistency: 'good',
      improvementRate: 12,
      practiceFrequency: 'daily'
    },
    previousAssessments: [
      { date: '2024-01-01', overallScore: 7.5, skillRatings: { shooting: 8, defense: 6 } }
    ]
  };
}

async function saveAssessment(assessmentData: any) {
  // Mock save - in real implementation, save to database
  return {
    id: `assessment_${Date.now()}`,
    ...assessmentData,
    createdAt: new Date().toISOString(),
    status: 'completed'
  };
} 