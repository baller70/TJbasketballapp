
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { preferences } = await request.json();
  const userId = session.user.id;

  try {

    // Get user's profile and recent activity
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
    });

    const recentCompletions = await prisma.drillCompletion.findMany({
      where: { userId },
      include: { drill: true },
      orderBy: { completedAt: 'desc' },
      take: 10,
    });

    const allDrills = await prisma.drill.findMany();

    // Prepare context for AI
    const context = {
      skillLevel: playerProfile?.skillLevel || 'beginner',
      favoritePosition: playerProfile?.favoritePosition,
      totalPoints: playerProfile?.totalPoints || 0,
      currentStreak: playerProfile?.currentStreak || 0,
      recentDrills: recentCompletions.map(c => ({
        name: c.drill.name,
        category: c.drill.category,
        rating: c.rating,
        completedAt: c.completedAt,
      })),
      preferences: preferences || {},
      availableDrills: allDrills.map(d => ({
        id: d.id,
        name: d.name,
        category: d.category,
        skillLevel: d.skillLevel,
        description: d.description,
      })),
    };

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are a basketball coach AI that recommends drills based on player data. 
            
            Analyze the player's profile and recent activity to recommend 3-5 drills that would be most beneficial.
            
            Consider:
            - Current skill level and areas for improvement
            - Recent drill performance and ratings
            - Categories they haven't practiced recently
            - Progressive skill development
            - Variety to keep practice interesting
            
            Respond in JSON format with the following structure:
            {
              "recommendations": [
                {
                  "drillId": "drill_id_here",
                  "reason": "Brief explanation why this drill is recommended",
                  "priority": "high" | "medium" | "low"
                }
              ],
              "focusArea": "Main skill area to work on",
              "motivationalMessage": "Encouraging message about their progress"
            }
            
            Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`
          },
          {
            role: 'user',
            content: `Please analyze this player's data and recommend drills: ${JSON.stringify(context)}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI recommendations');
    }

    const data = await response.json();
    const recommendations = JSON.parse(data.choices[0]?.message?.content || '{}');

    // Validate and enrich recommendations with drill details
    const enrichedRecommendations = await Promise.all(
      (recommendations.recommendations || []).map(async (rec: any) => {
        const drill = await prisma.drill.findUnique({
          where: { id: rec.drillId },
        });
        
        return {
          ...rec,
          drill: drill || null,
        };
      })
    );

    return NextResponse.json({
      ...recommendations,
      recommendations: enrichedRecommendations.filter(rec => rec.drill !== null),
    });
  } catch (error) {
    console.error('Error getting drill recommendations:', error);
    
    // Fallback to simple recommendation logic
    const fallbackRecommendations = await getFallbackRecommendations(userId);
    return NextResponse.json(fallbackRecommendations);
  }
}

async function getFallbackRecommendations(userId: string) {
  try {
    // Get user's skill level
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
    });

    // Get recent completions to avoid recommending same drills
    const recentCompletions = await prisma.drillCompletion.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 5,
    });

    const recentDrillIds = recentCompletions.map(c => c.drillId);

    // Get recommended drills based on skill level
    const skillLevel = playerProfile?.skillLevel || 'beginner';
    const recommendedDrills = await prisma.drill.findMany({
      where: {
        skillLevel,
        id: {
          notIn: recentDrillIds,
        },
      },
      take: 3,
    });

    return {
      recommendations: recommendedDrills.map(drill => ({
        drillId: drill.id,
        drill,
        reason: `Great for ${skillLevel} players to improve ${drill.category} skills`,
        priority: 'medium',
      })),
      focusArea: 'Fundamental Skills',
      motivationalMessage: 'Keep practicing and you\'ll see improvement!',
    };
  } catch (error) {
    console.error('Error in fallback recommendations:', error);
    return {
      recommendations: [],
      focusArea: 'Practice',
      motivationalMessage: 'Keep up the great work!',
    };
  }
}
