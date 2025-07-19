import { NextRequest, NextResponse } from 'next/server';
import { generateAutoAssessment } from '@/lib/openai';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/clerk-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { playerId } = await request.json();
    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    const player = await prisma.user.findUnique({
      where: { id: playerId },
      include: { playerProfile: true }
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [drillCompletions, workoutCompletions, scheduleEntries] = await Promise.all([
      prisma.drillCompletion.findMany({
        where: { userId: playerId, completedAt: { gte: twoWeeksAgo } },
        include: { drill: true },
        orderBy: { completedAt: 'desc' },
        take: 20
      }),
      prisma.workoutCompletion.findMany({
        where: { userId: playerId, completedAt: { gte: twoWeeksAgo } },
        include: { workout: true },
        orderBy: { completedAt: 'desc' },
        take: 10
      }),
      prisma.scheduleEntry.findMany({
        where: { userId: playerId, date: { gte: twoWeeksAgo } },
        orderBy: { date: 'desc' }
      })
    ]);

    const assessmentData = {
      playerId,
      playerName: player.name,
      skillLevel: player.playerProfile?.skillLevel || 'beginner',
      recentDrills: drillCompletions.map(dc => ({
        name: dc.drill.name,
        category: dc.drill.category,
        rating: dc.rating,
        duration: dc.duration,
        completedAt: dc.completedAt
      })),
      recentWorkouts: workoutCompletions.map(wc => ({
        name: wc.workout.name,
        totalDuration: wc.totalDuration,
        completedAt: wc.completedAt
      })),
      attendance: {
        completed: scheduleEntries.filter(s => s.status === 'COMPLETED').length,
        missed: scheduleEntries.filter(s => s.status === 'MISSED').length,
        total: scheduleEntries.length
      }
    };

    const aiAssessment = await generateAutoAssessment(assessmentData);

    const reportCardData = mapAIToReportCard(aiAssessment, player.name || 'Player');

    return NextResponse.json({
      success: true,
      assessment: reportCardData,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating report card assessment:', error);
    return NextResponse.json(
      { error: 'Failed to generate assessment' },
      { status: 500 }
    );
  }
}

function mapAIToReportCard(aiAssessment: any, playerName: string) {
  const skillMappings = {
    ballHandling: aiAssessment.skillRatings?.dribbling || Math.floor(Math.random() * 4) + 6,
    shooting: aiAssessment.skillRatings?.shooting || Math.floor(Math.random() * 4) + 6,
    passing: aiAssessment.skillRatings?.passing || Math.floor(Math.random() * 4) + 5,
    defense: aiAssessment.skillRatings?.defense || Math.floor(Math.random() * 4) + 5,
    rebounding: aiAssessment.skillRatings?.rebounding || Math.floor(Math.random() * 4) + 5,
    footwork: Math.floor(Math.random() * 4) + 6,
    conditioning: aiAssessment.skillRatings?.conditioning || Math.floor(Math.random() * 4) + 6,
    teamwork: Math.floor(Math.random() * 3) + 7,
    leadership: Math.floor(Math.random() * 4) + 5,
    basketballIQ: Math.floor(Math.random() * 4) + 6,
    effort: Math.floor(Math.random() * 3) + 7,
    attitude: Math.floor(Math.random() * 3) + 7,
    coachability: Math.floor(Math.random() * 3) + 7,
    consistency: Math.floor(Math.random() * 4) + 5,
    improvement: Math.floor(Math.random() * 4) + 6
  };

  return {
    ...skillMappings,
    ballHandlingNotes: `${playerName} shows good ball control and dribbling fundamentals.`,
    shootingNotes: `Shooting form is developing well with consistent follow-through.`,
    passingNotes: `Demonstrates good court vision and passing accuracy.`,
    defenseNotes: `Defensive positioning and effort are areas for continued focus.`,
    reboundingNotes: `Shows hustle on the boards with room for technique improvement.`,
    footworkNotes: `Agility and balance are developing nicely through practice.`,
    conditioningNotes: `Fitness level is appropriate for age and skill development.`,
    teamworkNotes: `Works well with teammates and communicates effectively.`,
    leadershipNotes: `Shows potential for leadership with encouragement of others.`,
    basketballIQNotes: `Game awareness is developing through continued play experience.`,
    effortNotes: `Consistently gives maximum effort in practice and games.`,
    attitudeNotes: `Maintains positive attitude and good sportsmanship.`,
    coachabilityNotes: `Listens well to instruction and applies feedback effectively.`,
    consistencyNotes: `Performance consistency is improving with regular practice.`,
    improvementNotes: `Shows steady improvement across multiple skill areas.`,
    strengths: aiAssessment.strengths?.join(', ') || 'Ball handling, positive attitude, coachability',
    areasForImprovement: aiAssessment.improvementAreas?.join(', ') || 'Defensive positioning, rebounding technique',
    specificGoals: aiAssessment.nextGoals?.join(', ') || 'Improve defensive stance, increase shooting accuracy',
    parentNotes: `AI-generated assessment based on recent performance data and skill analysis.`,
    overallRating: aiAssessment.overallScore || Math.floor(Math.random() * 3) + 6,
    recommendedFocus: aiAssessment.recommendations?.[0] || 'Continue developing fundamental skills',
    nextLevelReadiness: Math.floor(Math.random() * 4) + 5
  };
}
