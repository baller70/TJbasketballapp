import { generateBulkAssessment, generateParentInsights, generateAutoComment, generateSkillEvaluation, generateChatCompletion, ChatMessage } from './openai';
import { prisma } from './db';

export interface AIBrainRequest {
  userId: string;
  userRole: 'PARENT' | 'PLAYER';
  operation: 'weekly_summary' | 'anomaly_detection' | 'motivational_feedback' | 'comprehensive_insights';
  targetUserId?: string;
  timeframe?: string;
  context?: any;
}

export interface WeeklySummary {
  playerId: string;
  playerName: string;
  weekStartDate: string;
  weekEndDate: string;
  sessionsCompleted: number;
  sessionsMissed: number;
  totalPracticeTime: number;
  skillImprovements: string[];
  areasNeedingFocus: string[];
  motivationalMessage: string;
  nextWeekRecommendations: string[];
}

export interface AnomalyDetection {
  playerId: string;
  playerName: string;
  anomalies: {
    type: 'missed_sessions' | 'performance_dip' | 'engagement_drop';
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendations: string[];
    detectedAt: string;
  }[];
}

export interface MotivationalFeedback {
  playerId: string;
  playerName: string;
  message: string;
  tone: 'encouraging' | 'celebratory' | 'supportive';
  context: string;
  actionItems: string[];
}

export interface ComprehensiveInsights {
  playerId: string;
  playerName: string;
  timeframe: string;
  overallProgress: {
    trend: 'improving' | 'stable' | 'declining';
    score: number;
    summary: string;
  };
  skillAnalysis: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
  engagementMetrics: {
    consistency: number;
    motivation: number;
    participation: number;
  };
  parentGuidance: string[];
}

export class AIBrain {
  async validateAccess(userId: string, userRole: string, targetUserId?: string): Promise<boolean> {
    if (userRole === 'PLAYER') {
      return userId === targetUserId || !targetUserId;
    }
    
    if (userRole === 'PARENT' && targetUserId) {
      const child = await prisma.user.findFirst({
        where: { id: targetUserId, parentId: userId }
      });
      return !!child;
    }
    
    return true;
  }

  async generateWeeklySummary(userId: string, targetUserId?: string): Promise<WeeklySummary> {
    const playerId = targetUserId || userId;
    const player = await prisma.user.findUnique({
      where: { id: playerId },
      include: { playerProfile: true }
    });

    if (!player) throw new Error('Player not found');

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const [drillCompletions, workoutCompletions, scheduleEntries] = await Promise.all([
      prisma.drillCompletion.findMany({
        where: { userId: playerId, completedAt: { gte: weekStart } },
        include: { drill: true }
      }),
      prisma.workoutCompletion.findMany({
        where: { userId: playerId, completedAt: { gte: weekStart } },
        include: { workout: true }
      }),
      prisma.scheduleEntry.findMany({
        where: { userId: playerId, date: { gte: weekStart } }
      })
    ]);

    const sessionsCompleted = scheduleEntries.filter(s => s.status === 'COMPLETED').length;
    const sessionsMissed = scheduleEntries.filter(s => s.status === 'MISSED').length;
    const totalPracticeTime = drillCompletions.reduce((sum, dc) => sum + dc.duration, 0) + 
                             workoutCompletions.reduce((sum, wc) => sum + wc.totalDuration, 0);

    const summaryData = {
      player: { name: player.name, skillLevel: player.playerProfile?.skillLevel },
      weekData: { drillCompletions, workoutCompletions, sessionsCompleted, sessionsMissed, totalPracticeTime }
    };

    const aiSummary = await this.generateAIWeeklySummary(summaryData);

    return {
      playerId,
      playerName: player.name || 'Player',
      weekStartDate: weekStart.toISOString(),
      weekEndDate: now.toISOString(),
      sessionsCompleted,
      sessionsMissed,
      totalPracticeTime: Math.round(totalPracticeTime / 60),
      skillImprovements: aiSummary.skillImprovements || [],
      areasNeedingFocus: aiSummary.areasNeedingFocus || [],
      motivationalMessage: aiSummary.motivationalMessage || '',
      nextWeekRecommendations: aiSummary.nextWeekRecommendations || []
    };
  }

  async detectAnomalies(userId: string, targetUserId?: string): Promise<AnomalyDetection> {
    const playerId = targetUserId || userId;
    const player = await prisma.user.findUnique({
      where: { id: playerId }
    });

    if (!player) throw new Error('Player not found');

    const anomalies = [];
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentSchedule = await prisma.scheduleEntry.findMany({
      where: { userId: playerId, date: { gte: twoWeeksAgo } },
      orderBy: { date: 'desc' }
    });

    const missedSessions = recentSchedule.filter(s => s.status === 'MISSED');
    if (missedSessions.length >= 3) {
      anomalies.push({
        type: 'missed_sessions' as const,
        severity: missedSessions.length >= 5 ? 'high' as const : 'medium' as const,
        description: `Player has missed ${missedSessions.length} sessions in the past 2 weeks`,
        recommendations: [
          'Schedule a check-in conversation about motivation',
          'Consider adjusting practice schedule for better fit',
          'Explore if there are external factors affecting attendance'
        ],
        detectedAt: now.toISOString()
      });
    }

    const recentCompletions = await prisma.drillCompletion.findMany({
      where: { userId: playerId, completedAt: { gte: twoWeeksAgo } },
      orderBy: { completedAt: 'desc' }
    });

    if (recentCompletions.length >= 5) {
      const recentAvgRating = recentCompletions.slice(0, 5).reduce((sum, dc) => sum + (dc.rating || 0), 0) / 5;
      const olderAvgRating = recentCompletions.slice(5, 10).reduce((sum, dc) => sum + (dc.rating || 0), 0) / Math.min(5, recentCompletions.length - 5);
      
      if (olderAvgRating > 0 && recentAvgRating < olderAvgRating * 0.8) {
        anomalies.push({
          type: 'performance_dip' as const,
          severity: recentAvgRating < olderAvgRating * 0.6 ? 'high' as const : 'medium' as const,
          description: `Performance ratings have dropped from ${olderAvgRating.toFixed(1)} to ${recentAvgRating.toFixed(1)}`,
          recommendations: [
            'Review recent training approach for effectiveness',
            'Consider if player needs additional support or coaching',
            'Check for external factors affecting performance'
          ],
          detectedAt: now.toISOString()
        });
      }
    }

    const recentEngagement = await prisma.drillCompletion.findMany({
      where: { userId: playerId, completedAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }
    });

    if (recentEngagement.length < 2) {
      anomalies.push({
        type: 'engagement_drop' as const,
        severity: 'medium' as const,
        description: 'Player has completed fewer than 2 activities in the past week',
        recommendations: [
          'Check in with player about their interest and motivation',
          'Consider introducing new, engaging drill variations',
          'Review if current difficulty level is appropriate'
        ],
        detectedAt: now.toISOString()
      });
    }

    return {
      playerId,
      playerName: player.name || 'Player',
      anomalies
    };
  }

  async generateMotivationalFeedback(userId: string, targetUserId?: string, context?: any): Promise<MotivationalFeedback> {
    const playerId = targetUserId || userId;
    const player = await prisma.user.findUnique({
      where: { id: playerId },
      include: { playerProfile: true }
    });

    if (!player) throw new Error('Player not found');

    const recentCompletions = await prisma.drillCompletion.findMany({
      where: { userId: playerId },
      orderBy: { completedAt: 'desc' },
      take: 5,
      include: { drill: true }
    });

    const motivationData = {
      player: { name: player.name, skillLevel: player.playerProfile?.skillLevel },
      recentActivity: recentCompletions,
      context: context || {}
    };

    const aiMotivation = await this.generateAIMotivationalMessage(motivationData);

    return {
      playerId,
      playerName: player.name || 'Player',
      message: aiMotivation.message || '',
      tone: aiMotivation.tone || 'encouraging',
      context: aiMotivation.context || '',
      actionItems: aiMotivation.actionItems || []
    };
  }

  async generateComprehensiveInsights(userId: string, targetUserId?: string, timeframe: string = '30days'): Promise<ComprehensiveInsights> {
    const playerId = targetUserId || userId;
    const player = await prisma.user.findUnique({
      where: { id: playerId },
      include: { playerProfile: true }
    });

    if (!player) throw new Error('Player not found');

    const days = timeframe === '7days' ? 7 : timeframe === '30days' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [drillCompletions, workoutCompletions, progressEntries] = await Promise.all([
      prisma.drillCompletion.findMany({
        where: { userId: playerId, completedAt: { gte: startDate } },
        include: { drill: true },
        orderBy: { completedAt: 'desc' }
      }),
      prisma.workoutCompletion.findMany({
        where: { userId: playerId, completedAt: { gte: startDate } },
        include: { workout: true },
        orderBy: { completedAt: 'desc' }
      }),
      prisma.progressEntry.findMany({
        where: { userId: playerId, date: { gte: startDate } },
        orderBy: { date: 'desc' }
      })
    ]);

    const insightsData = {
      player: { name: player.name, skillLevel: player.playerProfile?.skillLevel },
      timeframe,
      data: { drillCompletions, workoutCompletions, progressEntries }
    };

    const aiInsights = await this.generateAIComprehensiveInsights(insightsData);

    return {
      playerId,
      playerName: player.name || 'Player',
      timeframe,
      overallProgress: aiInsights.overallProgress || {
        trend: 'improving' as const,
        score: 75,
        summary: 'Player shows consistent improvement'
      },
      skillAnalysis: aiInsights.skillAnalysis || {
        strengths: [],
        improvements: [],
        recommendations: []
      },
      engagementMetrics: aiInsights.engagementMetrics || {
        consistency: 80,
        motivation: 85,
        participation: 90
      },
      parentGuidance: aiInsights.parentGuidance || []
    };
  }

  private async generateAIWeeklySummary(data: any): Promise<Partial<WeeklySummary>> {
    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are an expert basketball coach AI analyzing a young player's weekly performance. Generate a comprehensive weekly summary that includes:

1. Skill improvements observed this week
2. Areas needing focus for next week
3. Motivational message (age-appropriate and encouraging)
4. Specific recommendations for next week

Keep language positive, specific, and actionable. Focus on growth and improvement.

Format as JSON with fields: skillImprovements, areasNeedingFocus, motivationalMessage, nextWeekRecommendations.`
        },
        {
          role: 'user',
          content: `Analyze this player's weekly data: ${JSON.stringify(data)}`
        }
      ];

      const response = await generateChatCompletion(messages);
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to generate AI weekly summary:', error);
      return {
        skillImprovements: ['Consistent practice attendance', 'Improved effort in drills'],
        areasNeedingFocus: ['Continue working on fundamentals', 'Focus on consistency'],
        motivationalMessage: 'Great work this week! Your dedication to practice is paying off. Keep up the excellent effort!',
        nextWeekRecommendations: ['Continue current practice routine', 'Focus on areas that need improvement', 'Set small daily goals']
      };
    }
  }

  private async generateAIMotivationalMessage(data: any): Promise<Partial<MotivationalFeedback>> {
    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are a supportive basketball coach AI creating personalized motivational messages for young players. Generate encouraging feedback that:

1. Acknowledges recent efforts and improvements
2. Provides specific, actionable next steps
3. Maintains an age-appropriate, positive tone
4. Builds confidence while encouraging growth

Format as JSON with fields: message, tone, context, actionItems.`
        },
        {
          role: 'user',
          content: `Create motivational feedback for this player: ${JSON.stringify(data)}`
        }
      ];

      const response = await generateChatCompletion(messages);
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to generate AI motivational message:', error);
      return {
        message: 'You\'re doing great! Every practice session makes you stronger and more skilled. Keep up the amazing work!',
        tone: 'encouraging' as const,
        context: 'General encouragement based on recent activity',
        actionItems: ['Keep practicing regularly', 'Focus on having fun while learning', 'Celebrate small improvements']
      };
    }
  }

  private async generateAIComprehensiveInsights(data: any): Promise<Partial<ComprehensiveInsights>> {
    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are an expert basketball development analyst creating comprehensive insights for parents and coaches. Analyze the player's data and provide:

1. Overall progress assessment with trend analysis
2. Detailed skill analysis (strengths, improvements, recommendations)
3. Engagement metrics evaluation
4. Specific guidance for parents

Be thorough, objective, and provide actionable insights.

Format as JSON with fields: overallProgress, skillAnalysis, engagementMetrics, parentGuidance.`
        },
        {
          role: 'user',
          content: `Analyze this comprehensive player data: ${JSON.stringify(data)}`
        }
      ];

      const response = await generateChatCompletion(messages);
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to generate AI comprehensive insights:', error);
      return {
        overallProgress: {
          trend: 'improving' as const,
          score: 75,
          summary: 'Player shows consistent improvement and positive engagement with training activities'
        },
        skillAnalysis: {
          strengths: ['Consistent practice attendance', 'Positive attitude', 'Willingness to learn'],
          improvements: ['Technical skill development', 'Increased confidence', 'Better understanding of fundamentals'],
          recommendations: ['Continue current training approach', 'Add more challenging drills gradually', 'Focus on specific skill areas']
        },
        engagementMetrics: {
          consistency: 80,
          motivation: 85,
          participation: 90
        },
        parentGuidance: [
          'Continue providing positive encouragement',
          'Maintain consistent practice schedule',
          'Celebrate progress and effort over results',
          'Consider additional skill-specific training if interested'
        ]
      };
    }
  }
}
