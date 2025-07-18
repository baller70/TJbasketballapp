import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Skip authentication for development
    console.log('Assessment request received for user:', params.id);

    const { 
      skillRatings, 
      skillComments, 
      overallAssessment, 
      recommendations, 
      nextAssessmentDate 
    } = await request.json();

    const userId = params.id;

    console.log('Processing assessment for user:', userId);

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

    console.log('Mock assessment created:', mockAssessment.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Assessment saved successfully (mock mode)',
      assessment: mockAssessment
    });

  } catch (error) {
    console.error('Assessment error:', error);
    return NextResponse.json({ 
      error: 'Failed to save assessment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 