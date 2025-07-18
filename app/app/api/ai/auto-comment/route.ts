import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateAutoComment } from '@/lib/openai';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let userId: string | null = null;
  let playerId: string | undefined = undefined;
  let contentType: string | undefined = undefined;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestBody = await request.json();
    const { 
      playerId: requestPlayerId, 
      contentType: requestContentType, 
      contentData,
      generateEncouragement = true,
      generateTechnicalFeedback = true,
      tone = 'encouraging',
      commentType = 'encouragement',
      generateMultiple = false,
      count = 1
    } = requestBody;
    
    playerId = requestPlayerId;
    contentType = requestContentType;

    if (!playerId || !contentType) {
      return NextResponse.json({ error: 'Player ID and content type are required' }, { status: 400 });
    }

    // Fetch player data for personalization
    const playerData = await fetchPlayerData(playerId);
    
    if (!playerData) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    if (generateMultiple) {
      // Generate multiple comment suggestions
      const suggestions = [];
      for (let i = 0; i < count; i++) {
        const comment = await generateAutoComment(contentType, {
          playerData,
          contentData,
          generateEncouragement,
          generateTechnicalFeedback,
          tone,
          commentType,
          variation: i
        });
        suggestions.push(comment);
      }

      return NextResponse.json({
        success: true,
        suggestions,
        playerId,
        contentType,
        commentType
      });
    } else {
      // Generate single comment
      const comment = await generateAutoComment(contentType, {
        playerData,
        contentData,
        generateEncouragement,
        generateTechnicalFeedback,
        tone,
        commentType
      });

      // Save comments to database
      await saveComments(playerId, contentType, comment, userId);

      return NextResponse.json({
        success: true,
        comment,
        playerId,
        contentType,
        generatedAt: new Date().toISOString()
      });
    }

  } catch (error) {
    logger.error('Error in auto comment', error as Error, { 
      userId: userId || undefined, 
      playerId: playerId || undefined,
      contentType: contentType || undefined
    });
    return NextResponse.json(
      { error: 'Failed to generate comment' },
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
      age: 10,
      skillLevel: 'intermediate',
      recentActivities: [
        { type: 'drill', name: 'Ball Handling', rating: 8, date: '2024-01-15' },
        { type: 'workout', name: 'Shooting Practice', rating: 7, date: '2024-01-14' }
      ],
      strengths: ['teamwork', 'effort', 'coachability'],
      improvementAreas: ['shooting consistency', 'defensive positioning'],
      personality: 'enthusiastic, hardworking, sometimes needs confidence boost',
      preferredFeedbackStyle: 'specific and encouraging',
      recentProgress: {
        ballHandling: 'improved',
        shooting: 'consistent',
        defense: 'needs work'
      }
    };
  } catch (error) {
    logger.error('Error fetching player data', error as Error, { playerId });
    return null;
  }
}

async function generateAIComments(playerData: any, options: any) {
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
            content: `You are an expert basketball coach AI that generates personalized, encouraging comments for young players aged 6-13.

            Based on the player data and content type provided, generate appropriate comments that:
            
            1. Are age-appropriate and encouraging
            2. Acknowledge the player's effort and progress
            3. Provide specific, actionable feedback
            4. Build confidence while being constructive
            5. Reference the player's strengths and improvement areas
            6. Use positive, motivational language
            7. Include specific observations when possible
            8. End with encouragement or next steps

            Comment Types:
            - drill_completion: Comments on drill performance
            - workout_completion: Comments on workout performance
            - media_upload: Comments on uploaded videos/images
            - assessment_result: Comments on skill assessments
            - general_progress: Comments on overall progress
            - achievement: Comments on achievements/milestones

            Tone Guidelines:
            - encouraging: Positive, supportive, confidence-building
            - constructive: Helpful, specific, improvement-focused
            - celebratory: Excited, proud, achievement-focused
            - motivational: Inspiring, goal-oriented, future-focused

            Respond in JSON format with the following structure:
            {
              "primaryComment": "string (main comment, 2-3 sentences)",
              "technicalFeedback": "string (specific technical observations, 1-2 sentences)",
              "encouragement": "string (motivational message, 1 sentence)",
              "nextSteps": "string (suggested next actions, 1 sentence)",
              "personalizedNote": "string (comment referencing player's specific traits/progress, 1 sentence)"
            }

            Keep each comment section concise but meaningful. Use the player's name occasionally for personalization.

            Respond with raw JSON only.`
          },
          {
            role: 'user',
            content: `Generate comments for this player and content: 
            Player: ${JSON.stringify(playerData)}
            Content Type: ${options.contentType}
            Content Data: ${JSON.stringify(options.contentData || {})}
            Options: ${JSON.stringify(options)}`
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI comments');
    }

    const data = await response.json();
    const comments = JSON.parse(data.choices[0]?.message?.content || '{}');

    return comments;
  } catch (error) {
    logger.error('Error generating AI comments', error as Error, { playerId: playerData?.id, contentType: options?.contentType });
    
    // Fallback comments based on content type
    return generateFallbackComments(playerData, options);
  }
}

function generateFallbackComments(playerData: any, options: any) {
  const fallbackComments = {
    drill_completion: {
      primaryComment: `Great job completing the drill! Your effort and focus are really showing in your improvement.`,
      technicalFeedback: `I noticed your form is getting more consistent - keep working on that follow-through.`,
      encouragement: `You're building great habits that will make you an even better player!`,
      nextSteps: `Try to challenge yourself with the next difficulty level when you feel ready.`,
      personalizedNote: `Your dedication to practice is one of your strongest qualities - keep it up!`
    },
    workout_completion: {
      primaryComment: `Excellent work on your workout! Your conditioning and strength are clearly improving.`,
      technicalFeedback: `Your endurance looked great throughout the session - you're getting stronger!`,
      encouragement: `Every workout is making you a better athlete!`,
      nextSteps: `Focus on maintaining this consistency in your training schedule.`,
      personalizedNote: `Your work ethic is impressive and it's paying off in your performance!`
    },
    media_upload: {
      primaryComment: `Thanks for sharing your practice video! It's great to see you working on your skills.`,
      technicalFeedback: `I can see improvement in your technique compared to last time.`,
      encouragement: `Keep recording your practice - it's a great way to track your progress!`,
      nextSteps: `Try focusing on the specific areas we discussed in your next practice session.`,
      personalizedNote: `Your willingness to share your work shows great confidence and growth mindset!`
    },
    assessment_result: {
      primaryComment: `Your assessment results show real progress in several key areas!`,
      technicalFeedback: `Your strengths in teamwork and effort are really standing out.`,
      encouragement: `You should be proud of how far you've come!`,
      nextSteps: `Let's focus on the improvement areas we identified in your next practices.`,
      personalizedNote: `Your positive attitude makes coaching you a joy!`
    },
    general_progress: {
      primaryComment: `You're making consistent progress and it shows in your confidence on the court!`,
      technicalFeedback: `Your fundamentals are getting stronger with each practice.`,
      encouragement: `Keep up the great work - you're on the right track!`,
      nextSteps: `Continue building on these improvements in your upcoming sessions.`,
      personalizedNote: `Your growth as a player and teammate has been fantastic to watch!`
    }
  };

  return fallbackComments[options.contentType as keyof typeof fallbackComments] || fallbackComments.general_progress;
}

async function saveComments(playerId: string, contentType: string, comments: any, commenterId: string) {
  try {
    // Mock save - replace with actual database save
    const savedComment = {
      id: `comment_${Date.now()}`,
      playerId,
      contentType,
      comments,
      commenterId,
      createdAt: new Date().toISOString(),
      isAIGenerated: true
    };
    
    logger.info('Saving AI comment', { commentId: savedComment.id, playerId, contentType, commenterId });
    
    // In real implementation, save to database
    return savedComment;
  } catch (error) {
    logger.error('Error saving comments', error as Error, { playerId, contentType, commenterId });
    return false;
  }
}        