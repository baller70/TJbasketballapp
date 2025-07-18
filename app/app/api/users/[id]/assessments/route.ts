import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;

    // Fetch all assessments for this user
    const assessments = await prisma.reportCard.findMany({
      where: { userId: userId },
      include: {
        assessor: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { assessmentDate: 'desc' }
    });

    // Format the assessments for the frontend
    const formattedAssessments = assessments.map(assessment => ({
      id: assessment.id,
      assessorName: assessment.assessor.name,
      assessmentDate: assessment.assessmentDate.toISOString(),
      overallRating: assessment.overallRating,
      skillRatings: {
        ballHandling: assessment.ballHandling,
        shooting: assessment.shooting,
        passing: assessment.passing,
        defense: assessment.defense,
        rebounding: assessment.rebounding,
        footwork: assessment.footwork,
        conditioning: assessment.conditioning,
        teamwork: assessment.teamwork,
        leadership: assessment.leadership,
        basketballIQ: assessment.basketballIQ,
        effort: assessment.effort,
        attitude: assessment.attitude,
        coachability: assessment.coachability,
        consistency: assessment.consistency,
        improvement: assessment.improvement,
      },
      skillComments: {
        ballHandling: assessment.ballHandlingNotes,
        shooting: assessment.shootingNotes,
        passing: assessment.passingNotes,
        defense: assessment.defenseNotes,
        rebounding: assessment.reboundingNotes,
        footwork: assessment.footworkNotes,
        conditioning: assessment.conditioningNotes,
        teamwork: assessment.teamworkNotes,
        leadership: assessment.leadershipNotes,
        basketballIQ: assessment.basketballIQNotes,
        effort: assessment.effortNotes,
        attitude: assessment.attitudeNotes,
        coachability: assessment.coachabilityNotes,
        consistency: assessment.consistencyNotes,
        improvement: assessment.improvementNotes,
      },
      feedback: {
        strengths: assessment.strengths,
        areasForImprovement: assessment.areasForImprovement,
        specificGoals: assessment.specificGoals,
        parentNotes: assessment.parentNotes,
        recommendedFocus: assessment.recommendedFocus,
        nextLevelReadiness: assessment.nextLevelReadiness,
      }
    }));

    return NextResponse.json({ 
      success: true,
      assessments: formattedAssessments
    });

  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 