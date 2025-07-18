import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    // Get the latest report card for the user
    const reportCard = await prisma.reportCard.findFirst({
      where: { userId },
      orderBy: { assessmentDate: 'desc' },
      include: {
        assessor: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Get all report cards for trend analysis
    const allReportCards = await prisma.reportCard.findMany({
      where: { userId },
      orderBy: { assessmentDate: 'desc' },
      take: 10, // Last 10 assessments
      include: {
        assessor: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json({
      latest: reportCard,
      history: allReportCards,
    });
  } catch (error) {
    console.error('Error fetching report card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      userId,
      ballHandling,
      shooting,
      passing,
      defense,
      rebounding,
      footwork,
      conditioning,
      teamwork,
      leadership,
      basketballIQ,
      effort,
      attitude,
      coachability,
      consistency,
      improvement,
      strengths,
      areasForImprovement,
      specificGoals,
      parentNotes,
      overallRating,
      recommendedFocus,
      nextLevelReadiness,
    } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate ratings are between 1-10
    const ratings = [
      ballHandling, shooting, passing, defense, rebounding, footwork,
      conditioning, teamwork, leadership, basketballIQ, effort, attitude,
      coachability, consistency, improvement, overallRating, nextLevelReadiness
    ];

    for (const rating of ratings) {
      if (rating && (rating < 1 || rating > 10)) {
        return NextResponse.json({ error: 'Ratings must be between 1 and 10' }, { status: 400 });
      }
    }

    // Create new report card
    const reportCard = await prisma.reportCard.create({
      data: {
        userId,
        assessorId: session.user.id,
        ballHandling: ballHandling || 1,
        shooting: shooting || 1,
        passing: passing || 1,
        defense: defense || 1,
        rebounding: rebounding || 1,
        footwork: footwork || 1,
        conditioning: conditioning || 1,
        teamwork: teamwork || 1,
        leadership: leadership || 1,
        basketballIQ: basketballIQ || 1,
        effort: effort || 1,
        attitude: attitude || 1,
        coachability: coachability || 1,
        consistency: consistency || 1,
        improvement: improvement || 1,
        strengths,
        areasForImprovement,
        specificGoals,
        parentNotes,
        overallRating: overallRating || 1,
        recommendedFocus,
        nextLevelReadiness: nextLevelReadiness || 1,
      },
      include: {
        assessor: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(reportCard);
  } catch (error) {
    console.error('Error creating report card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 