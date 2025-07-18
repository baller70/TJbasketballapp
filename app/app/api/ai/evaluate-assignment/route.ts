import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateAssignmentEvaluation } from '@/lib/openai';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let userId: string | null = null;
  let assignmentId: string | undefined = undefined;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestBody = await request.json();
    const { 
      assignmentId: requestAssignmentId, 
      includeProgressTracking = true,
      generateFeedback = true
    } = requestBody;
    
    assignmentId = requestAssignmentId;

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
    logger.error('Error evaluating assignment', error as Error, { 
      userId: userId || undefined, 
      assignmentId: assignmentId || undefined 
    });
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