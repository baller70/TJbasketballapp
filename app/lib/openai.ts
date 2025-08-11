import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateChatCompletion(
  messages: ChatMessage[],
  model: string = 'gpt-3.5-turbo',
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate AI response');
  }
}

export async function generateBulkAssessment(playerData: any): Promise<any> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an expert basketball coach AI assistant. Generate a comprehensive skill assessment for a player based on their performance data. Focus on technical skills, physical attributes, and mental aspects of the game.`
    },
    {
      role: 'user',
      content: `Generate a detailed skill assessment for this player:
      
Player Data: ${JSON.stringify(playerData, null, 2)}

Please provide:
1. Overall skill level assessment
2. Strengths and areas for improvement
3. Specific skill ratings (1-10) for: Shooting, Dribbling, Passing, Defense, Rebounding, Court Vision
4. Personalized recommendations for improvement
5. Suggested drills and training focus areas

Format the response as a JSON object with these fields: overallRating, strengths, improvements, skillRatings, recommendations, suggestedDrills.`
    }
  ];

  const response = await generateChatCompletion(messages, 'gpt-3.5-turbo', 0.7, 1500);
  
  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse AI assessment response:', error);
    return {
      overallRating: 7,
      strengths: ['Good effort', 'Consistent practice'],
      improvements: ['Continue working on fundamentals'],
      skillRatings: {
        shooting: 7,
        dribbling: 7,
        passing: 7,
        defense: 7,
        rebounding: 7,
        courtVision: 7
      },
      recommendations: ['Focus on consistent practice', 'Work with coach on technique'],
      suggestedDrills: ['Basic shooting drills', 'Dribbling exercises']
    };
  }
}

export async function generateAutoComment(activityType: string, activityData: any): Promise<string> {
  const { commentType = 'encouragement', variation = 0 } = activityData;
  
  const commentTypePrompts = {
    encouragement: 'Generate a positive, encouraging comment that celebrates the player\'s effort and progress.',
    technical: 'Generate a technical comment focusing on specific skills, technique, and performance analysis.',
    improvement: 'Generate a constructive comment highlighting areas for improvement with specific actionable advice.',
    general: 'Generate a balanced comment that includes encouragement, technique notes, and next steps.'
  };

  const variationPrompts = [
    'Use an enthusiastic and celebratory tone.',
    'Use a supportive and nurturing tone.',
    'Use a motivational and inspiring tone.'
  ];

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an encouraging basketball coach AI. Generate ${commentType} comments for player activities. Be specific about what they did well and provide gentle guidance for improvement. Keep comments motivational and age-appropriate.`
    },
    {
      role: 'user',
      content: `Generate a ${commentType} comment for this ${activityType} activity:
      
Activity Data: ${JSON.stringify(activityData, null, 2)}

${commentTypePrompts[commentType as keyof typeof commentTypePrompts]}
${variationPrompts[variation % variationPrompts.length]}

The comment should be:
- Appropriate for the comment type (${commentType})
- Specific to their performance
- Include actionable feedback when relevant
- Motivational for continued improvement
- 2-3 sentences long
- Unique and varied (variation ${variation})`
    }
  ];

  return await generateChatCompletion(messages, 'gpt-3.5-turbo', 0.8, 200);
}

export async function generateCustomDrill(playerSkillLevel: string, focusArea: string, playerData: any): Promise<any> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an expert basketball coach AI. Create personalized basketball drills based on player skill level and focus areas. Drills should be progressive, engaging, and appropriate for the player's level.`
    },
    {
      role: 'user',
      content: `Create a custom basketball drill for:
      
Skill Level: ${playerSkillLevel}
Focus Area: ${focusArea}
Player Data: ${JSON.stringify(playerData, null, 2)}

Please provide a drill with:
1. Name and description
2. Step-by-step instructions
3. Equipment needed
4. Duration and repetitions
5. Success criteria
6. Progressive variations
7. Coaching tips

Format as JSON with fields: name, description, instructions, equipment, duration, repetitions, successCriteria, variations, coachingTips.`
    }
  ];

  try {
    const response = await generateChatCompletion(messages, 'gpt-3.5-turbo', 0.7, 1200);
    try {
      // Clean common code fences and extract JSON object bounds
      let cleaned = response.trim().replace(/```json|```/g, '').trim();
      const first = cleaned.indexOf('{');
      const last = cleaned.lastIndexOf('}');
      if (first !== -1 && last !== -1 && last > first) {
        cleaned = cleaned.slice(first, last + 1);
      }
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse custom drill response:', error);
      return {
        name: `${focusArea} Development Drill`,
        description: `A personalized drill focusing on ${focusArea} skills`,
        instructions: [
          'Set up the drill area',
          'Practice the fundamental movement',
          'Focus on proper technique',
          'Repeat with consistency'
        ],
        equipment: ['Basketball', 'Cones'],
        duration: '15 minutes',
        repetitions: '3 sets of 10',
        successCriteria: 'Consistent technique and improvement',
        variations: ['Increase speed', 'Add complexity'],
        coachingTips: ['Focus on form over speed', 'Encourage consistent practice']
      };
    }
  } catch (error) {
    console.error('OpenAI generation failed, using fallback drill:', error);
    return {
      name: `${focusArea} Development Drill`,
      description: `A personalized drill focusing on ${focusArea} skills`,
      instructions: [
        'Set up the drill area',
        'Practice the fundamental movement',
        'Focus on proper technique',
        'Repeat with consistency'
      ],
      equipment: ['Basketball', 'Cones'],
      duration: '15 minutes',
      repetitions: '3 sets of 10',
      successCriteria: 'Consistent technique and improvement',
      variations: ['Increase speed', 'Add complexity'],
      coachingTips: ['Focus on form over speed', 'Encourage consistent practice']
    };
  }
}

export async function generateSkillEvaluation(playerHistory: any): Promise<any> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an expert basketball analytics AI. Analyze player performance data over time to provide comprehensive skill evaluations and progress tracking.`
    },
    {
      role: 'user',
      content: `Analyze this player's performance history and provide a skill evaluation:
      
Player History: ${JSON.stringify(playerHistory, null, 2)}

Please provide:
1. Progress analysis over time
2. Skill development trends
3. Performance consistency metrics
4. Areas of significant improvement
5. Areas needing more focus
6. Comparative analysis against skill level benchmarks
7. Future development recommendations

Format as JSON with fields: progressAnalysis, skillTrends, consistencyMetrics, improvements, focusAreas, benchmarkComparison, futureRecommendations.`
    }
  ];

  const response = await generateChatCompletion(messages, 'gpt-3.5-turbo', 0.6, 1500);
  
  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse skill evaluation response:', error);
    return {
      progressAnalysis: 'Steady improvement across all areas',
      skillTrends: {
        shooting: 'Improving',
        dribbling: 'Stable',
        passing: 'Improving',
        defense: 'Needs focus'
      },
      consistencyMetrics: {
        overall: 75,
        practice: 80,
        games: 70
      },
      improvements: ['Shooting accuracy', 'Ball handling'],
      focusAreas: ['Defensive positioning', 'Court awareness'],
      benchmarkComparison: 'Above average for skill level',
      futureRecommendations: ['Continue current training', 'Add defensive drills']
    };
  }
}

export async function generateParentInsights(familyData: any): Promise<any> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a family-focused basketball development AI. Provide insights and recommendations for parents to support their children's basketball development at home and in their overall athletic journey.`
    },
    {
      role: 'user',
      content: `Generate parent insights for this family's basketball development:
      
Family Data: ${JSON.stringify(familyData, null, 2)}

Please provide:
1. Family progress overview
2. Individual child highlights
3. Home practice recommendations
4. Motivation and encouragement strategies
5. Goal setting suggestions
6. Family engagement activities
7. Long-term development pathway

Format as JSON with fields: familyOverview, childHighlights, homePractice, motivationStrategies, goalSetting, familyActivities, developmentPathway.`
    }
  ];

  const response = await generateChatCompletion(messages, 'gpt-3.5-turbo', 0.7, 1500);
  
  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse parent insights response:', error);
    return {
      familyOverview: 'Great family engagement in basketball development',
      childHighlights: ['Consistent practice', 'Positive attitude'],
      homePractice: ['Daily shooting practice', 'Dribbling exercises'],
      motivationStrategies: ['Celebrate small wins', 'Set achievable goals'],
      goalSetting: ['Short-term skill goals', 'Long-term development milestones'],
      familyActivities: ['Family shooting competitions', 'Watch games together'],
      developmentPathway: ['Continue current training', 'Consider advanced coaching']
    };
  }
}

export async function generateSmartAssignment(assignmentData: any): Promise<any> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an AI basketball coach specializing in creating personalized training assignments. Create smart, adaptive assignments based on player data, skill level, and development goals.`
    },
    {
      role: 'user',
      content: `Create a smart assignment for this player:
      
Assignment Data: ${JSON.stringify(assignmentData, null, 2)}

Please provide:
1. Assignment title and description
2. Difficulty level (adaptive to player)
3. Estimated duration and frequency
4. Step-by-step instructions
5. Success criteria and metrics
6. AI recommendations for optimization
7. Progression pathway
8. Due date suggestion

Format as JSON with fields: title, description, difficulty, estimatedDuration, frequency, instructions, successCriteria, recommendations, progressionPathway, dueDate, insights.`
    }
  ];

  const response = await generateChatCompletion(messages, 'gpt-3.5-turbo', 0.6, 1500);
  
  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse smart assignment response:', error);
    return {
      title: 'Personalized Basketball Training',
      description: 'Customized training session based on your skill level and goals',
      difficulty: 'medium',
      estimatedDuration: 30,
      frequency: 'daily',
      instructions: ['Warm up for 5 minutes', 'Practice main skill for 20 minutes', 'Cool down for 5 minutes'],
      successCriteria: ['Complete all exercises', 'Maintain proper form', 'Record progress'],
      recommendations: ['Focus on consistency', 'Track improvement metrics'],
      progressionPathway: 'Beginner → Intermediate → Advanced',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      insights: 'This assignment is tailored to your current skill level and development goals'
    };
  }
}

export async function generateAssignmentEvaluation(evaluationData: any): Promise<any> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an AI basketball performance evaluator. Analyze completed assignments and provide comprehensive feedback, scoring, and recommendations for improvement.`
    },
    {
      role: 'user',
      content: `Evaluate this completed assignment:
      
Evaluation Data: ${JSON.stringify(evaluationData, null, 2)}

Please provide:
1. Overall performance score (0-100)
2. Detailed feedback on execution
3. Strengths demonstrated
4. Areas for improvement
5. Technical analysis
6. Effort and consistency rating
7. Next steps and recommendations
8. Comparison to expected performance

Format as JSON with fields: score, feedback, strengths, improvements, technicalAnalysis, effortRating, nextSteps, performanceComparison.`
    }
  ];

  const response = await generateChatCompletion(messages, 'gpt-3.5-turbo', 0.5, 1500);
  
  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse assignment evaluation response:', error);
    return {
      score: 85,
      feedback: 'Great effort and improvement shown in this assignment',
      strengths: ['Consistent form', 'Good effort', 'Followed instructions'],
      improvements: ['Work on speed', 'Focus on accuracy'],
      technicalAnalysis: 'Form is improving, need to work on consistency',
      effortRating: 9,
      nextSteps: ['Continue current training', 'Add more challenging drills'],
      performanceComparison: 'Above expected level for skill progression'
    };
  }
}

export async function generateAutoAssessment(assessmentData: any): Promise<any> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an AI basketball skills assessor. Analyze comprehensive player data to generate detailed skill assessments, ratings, and development recommendations.`
    },
    {
      role: 'user',
      content: `Generate an auto-assessment for this player:
      
Assessment Data: ${JSON.stringify(assessmentData, null, 2)}

Please provide:
1. Individual skill ratings (1-10 scale)
2. Overall performance score
3. Strengths and weaknesses analysis
4. AI-generated insights
5. Specific recommendations
6. Improvement areas priority
7. Next assessment goals
8. Development timeline

Format as JSON with fields: skillRatings, overallScore, strengths, weaknesses, insights, recommendations, improvementAreas, nextGoals, timeline.`
    }
  ];

  const response = await generateChatCompletion(messages, 'gpt-3.5-turbo', 0.6, 1500);
  
  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse auto-assessment response:', error);
    return {
      skillRatings: {
        shooting: 7,
        dribbling: 8,
        passing: 6,
        defense: 5,
        rebounding: 6,
        conditioning: 7
      },
      overallScore: 6.5,
      strengths: ['Ball handling', 'Shooting form'],
      weaknesses: ['Defensive positioning', 'Rebounding technique'],
      insights: 'Player shows strong offensive skills with room for defensive improvement',
      recommendations: ['Focus on defensive drills', 'Practice rebounding techniques'],
      improvementAreas: ['Defense', 'Rebounding', 'Court awareness'],
      nextGoals: ['Improve defensive stance', 'Increase rebounding success rate'],
      timeline: '4-6 weeks for noticeable improvement'
    };
  }
}

export async function generateSkillProgression(progressionData: any): Promise<any> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an AI basketball analytics expert specializing in skill progression analysis. Analyze historical performance data to identify trends, patterns, and provide insights for continued development.`
    },
    {
      role: 'user',
      content: `Analyze skill progression for this player:
      
Progression Data: ${JSON.stringify(progressionData, null, 2)}

Please provide:
1. Skill development trends over time
2. Performance consistency analysis
3. Improvement rate calculations
4. Plateau identification and solutions
5. Comparative benchmarking
6. Future projection and goals
7. Training adjustment recommendations
8. Motivation and engagement insights

Format as JSON with fields: skillTrends, consistencyAnalysis, improvementRate, plateauSolutions, benchmarking, futureProjection, trainingAdjustments, motivationInsights, insights.`
    }
  ];

  const response = await generateChatCompletion(messages, 'gpt-3.5-turbo', 0.6, 1500);
  
  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse skill progression response:', error);
    return {
      skillTrends: {
        shooting: 'Steady improvement',
        dribbling: 'Rapid improvement',
        defense: 'Slow improvement',
        overall: 'Positive trajectory'
      },
      consistencyAnalysis: 'Good consistency in practice, variable in games',
      improvementRate: 15,
      plateauSolutions: ['Vary training methods', 'Increase challenge level'],
      benchmarking: 'Above average for age group',
      futureProjection: 'Continued improvement expected',
      trainingAdjustments: ['Add advanced drills', 'Focus on weak areas'],
      motivationInsights: 'Responds well to positive reinforcement',
      insights: 'Player shows excellent potential with consistent development patterns'
    };
  }
}

export default openai; 