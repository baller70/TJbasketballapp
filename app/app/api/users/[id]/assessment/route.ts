import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const requestContext = logger.createRequestContext(request);
  
  try {
    // Skip authentication for development
    logger.info('Assessment request received for user', { ...requestContext, targetUserId: params.id });

    const { 
      skillRatings, 
      skillComments, 
      overallAssessment, 
      recommendations, 
      nextAssessmentDate 
    } = await request.json();

    const userId = params.id;

    logger.info('Processing assessment for user', { ...requestContext, userId });

    // For development, return mock data instead of saving to database
    const mockAssessment = {
      id: `assessment-${Date.now()}`,
      userId: userId,
      assessorId: 'coach-1',
      assessmentDate: new Date().toISOString(),
      skillRatings: skillRatings,
      skillComments: skillComments,
      overallAssessment: overallAssessment,
      recommendations: recommendations,
      nextAssessmentDate: nextAssessmentDate,
      createdAt: new Date().toISOString()
    };

    logger.info('Mock assessment created', { ...requestContext, assessmentId: mockAssessment.id, userId });

    return NextResponse.json({ 
      success: true, 
      message: 'Assessment saved successfully (mock mode)',
      assessment: mockAssessment
    });

  } catch (error) {
    logger.error('Assessment error', error as Error, requestContext);
    return NextResponse.json({ 
      error: 'Failed to save assessment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}  