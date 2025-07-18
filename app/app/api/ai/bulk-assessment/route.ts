import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { generateBulkAssessment } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      playerId, 
      includeSkillAnalysis = true, 
      includeRecommendations = true, 
      includeGoals = true 
    } = await request.json();

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    // Fetch player data for analysis
    const playerData = await fetchPlayerData(playerId);
    
    if (!playerData) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Generate AI assessment using OpenAI
    const assessment = await generateBulkAssessment({
      ...playerData,
      includeSkillAnalysis,
      includeRecommendations,
      includeGoals
    });

    // Save assessment to database
    await saveAssessment(playerId, assessment, session.user.id);

    return NextResponse.json({
      success: true,
      assessment,
      playerId,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in bulk assessment:', error);
    return NextResponse.json(
      { error: 'Failed to generate assessment' },
      { status: 500 }
    );
  }
}

async function fetchPlayerData(playerId: string) {
  try {
    // Mock data - replace with actual database queries
    return {
      id: playerId,
      name: 'Player Name',
      recentDrills: [
        { name: 'Ball Handling', rating: 8, completedAt: '2024-01-15' },
        { name: 'Shooting Form', rating: 7, completedAt: '2024-01-14' },
        { name: 'Defensive Stance', rating: 6, completedAt: '2024-01-13' }
      ],
      recentWorkouts: [
        { name: 'Conditioning', rating: 9, completedAt: '2024-01-15' },
        { name: 'Strength Training', rating: 8, completedAt: '2024-01-14' }
      ],
      mediaUploads: [
        { type: 'video', skill: 'shooting', uploadedAt: '2024-01-15' },
        { type: 'image', skill: 'form', uploadedAt: '2024-01-14' }
      ],
      currentSkillLevels: {
        ballHandling: 7,
        shooting: 6,
        passing: 8,
        defense: 5,
        rebounding: 6,
        footwork: 7,
        conditioning: 8,
        teamwork: 9,
        leadership: 6,
        basketballIQ: 7
      },
      progressHistory: [
        { date: '2024-01-01', totalPoints: 1200 },
        { date: '2024-01-15', totalPoints: 1350 }
      ]
    };
  } catch (error) {
    console.error('Error fetching player data:', error);
    return null;
  }
}

async function generateAIAssessment(playerData: any, options: any) {
  try {
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
            content: `You are an expert basketball coach AI that creates comprehensive skill assessments for young players aged 6-13. 

            Based on the player data provided, generate a detailed assessment that includes:
            
            1. Overall Performance Summary (2-3 sentences)
            2. Individual Skill Ratings (1-10 scale) with explanations
            3. Strengths (3-4 key strengths)
            4. Areas for Improvement (3-4 specific areas)
            5. Specific Recommendations (5-6 actionable items)
            6. Short-term Goals (2-3 goals for next 2 weeks)
            7. Long-term Goals (2-3 goals for next 3 months)
            8. Motivational Message (encouraging and age-appropriate)

            Keep the language:
            - Age-appropriate and encouraging
            - Specific and actionable
            - Focused on improvement and growth
            - Positive while being constructive

            Respond in JSON format with the following structure:
            {
              "overallSummary": "string",
              "skillRatings": {
                "ballHandling": {"rating": number, "explanation": "string"},
                "shooting": {"rating": number, "explanation": "string"},
                "passing": {"rating": number, "explanation": "string"},
                "defense": {"rating": number, "explanation": "string"},
                "rebounding": {"rating": number, "explanation": "string"},
                "footwork": {"rating": number, "explanation": "string"},
                "conditioning": {"rating": number, "explanation": "string"},
                "teamwork": {"rating": number, "explanation": "string"},
                "leadership": {"rating": number, "explanation": "string"},
                "basketballIQ": {"rating": number, "explanation": "string"}
              },
              "strengths": ["string"],
              "areasForImprovement": ["string"],
              "recommendations": ["string"],
              "shortTermGoals": ["string"],
              "longTermGoals": ["string"],
              "motivationalMessage": "string"
            }

            Respond with raw JSON only.`
          },
          {
            role: 'user',
            content: `Please assess this player's basketball skills and progress: ${JSON.stringify(playerData)}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI assessment');
    }

    const data = await response.json();
    const assessment = JSON.parse(data.choices[0]?.message?.content || '{}');

    return assessment;
  } catch (error) {
    console.error('Error generating AI assessment:', error);
    
    // Fallback assessment
    return {
      overallSummary: "This player shows great potential and consistent effort in their basketball development.",
      skillRatings: {
        ballHandling: { rating: 7, explanation: "Good control with room for improvement in advanced moves" },
        shooting: { rating: 6, explanation: "Solid form, needs work on consistency and range" },
        passing: { rating: 8, explanation: "Excellent court vision and decision making" },
        defense: { rating: 5, explanation: "Needs to work on stance and positioning" },
        rebounding: { rating: 6, explanation: "Good effort, needs better positioning" },
        footwork: { rating: 7, explanation: "Solid fundamentals, continue developing" },
        conditioning: { rating: 8, explanation: "Great endurance and work ethic" },
        teamwork: { rating: 9, explanation: "Outstanding team player and communicator" },
        leadership: { rating: 6, explanation: "Shows potential, needs confidence building" },
        basketballIQ: { rating: 7, explanation: "Good understanding of game concepts" }
      },
      strengths: [
        "Excellent teamwork and communication",
        "Strong work ethic and conditioning",
        "Good court vision and passing ability",
        "Solid fundamental footwork"
      ],
      areasForImprovement: [
        "Defensive positioning and stance",
        "Shooting consistency and range",
        "Leadership confidence",
        "Advanced ball handling moves"
      ],
      recommendations: [
        "Practice defensive slides daily for 10 minutes",
        "Work on shooting form with wall ball drills",
        "Focus on being more vocal during team activities",
        "Practice cone dribbling drills 3x per week",
        "Watch basketball games to improve IQ",
        "Set small daily goals to build confidence"
      ],
      shortTermGoals: [
        "Improve defensive stance in next 2 weeks",
        "Make 7 out of 10 free throws consistently",
        "Lead one team drill per practice"
      ],
      longTermGoals: [
        "Become team defensive leader",
        "Develop reliable 3-point shot",
        "Mentor newer players on the team"
      ],
      motivationalMessage: "You're making great progress! Your teamwork and effort are already at an elite level. Keep working on the fundamentals and you'll see amazing improvement in your game! 🏀⭐"
    };
  }
}

async function saveAssessment(playerId: string, assessment: any, assessorId: string) {
  try {
    // Mock save - replace with actual database save
    console.log('Saving assessment for player:', playerId);
    console.log('Assessment data:', assessment);
    console.log('Assessor ID:', assessorId);
    
    // In real implementation, save to database
    return true;
  } catch (error) {
    console.error('Error saving assessment:', error);
    return false;
  }
} 