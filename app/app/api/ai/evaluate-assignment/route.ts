import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { generateAssignmentEvaluation } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      assignmentId, 
      includeProgressTracking = true,
      generateFeedback = true
    } = await request.json();

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    // Fetch assignment data
    const assignmentData = await fetchAssignmentData(assignmentId);
    
    // Generate AI evaluation
    const evaluation = await generateAssignmentEvaluation({
      assignmentId,
      assignmentData,
      includeProgressTracking,
      generateFeedback
    });

    // Update assignment with evaluation
    const updatedAssignment = await updateAssignmentWithEvaluation(assignmentId, evaluation);

    return NextResponse.json({
      success: true,
      evaluation,
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Error evaluating assignment:', error);
    return NextResponse.json({ error: 'Failed to evaluate assignment' }, { status: 500 });
  }
}

async function fetchAssignmentData(assignmentId: string) {
  // Mock assignment data - in real implementation, fetch from database
  return {
    id: assignmentId,
    playerId: 'player123',
    type: 'drill',
    title: 'Free Throw Practice',
    completedAt: new Date().toISOString(),
    performanceData: {
      accuracy: 85,
      attempts: 50,
      timeSpent: 25,
      consistency: 'good'
    },
    videoSubmission: true,
    playerFeedback: 'Felt good about my form'
  };
}

async function updateAssignmentWithEvaluation(assignmentId: string, evaluation: any) {
  // Mock update - in real implementation, update database
  return {
    id: assignmentId,
    aiEvaluated: true,
    aiScore: evaluation.score,
    aiFeedback: evaluation.feedback,
    aiRecommendations: evaluation.recommendations,
    evaluatedAt: new Date().toISOString()
  };
} 