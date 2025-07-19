import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { AIBrain, AIBrainRequest } from '@/lib/ai-brain';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { operation, targetUserId, timeframe, context }: AIBrainRequest = await request.json();

    if (!operation) {
      return NextResponse.json({ error: 'Operation is required' }, { status: 400 });
    }

    const aiBrain = new AIBrain();
    const userId = session.user.id;
    const userRole = session.user.role;

    if (targetUserId && targetUserId !== userId) {
      const hasAccess = await aiBrain.validateAccess(userId, userRole, targetUserId);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    let result;
    switch (operation) {
      case 'weekly_summary':
        result = await aiBrain.generateWeeklySummary(userId, targetUserId);
        break;
      case 'anomaly_detection':
        result = await aiBrain.detectAnomalies(userId, targetUserId);
        break;
      case 'motivational_feedback':
        result = await aiBrain.generateMotivationalFeedback(userId, targetUserId, context);
        break;
      case 'comprehensive_insights':
        result = await aiBrain.generateComprehensiveInsights(userId, targetUserId, timeframe);
        break;
      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      operation,
      result,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in AI Brain:', error);
    return NextResponse.json(
      { error: 'Failed to process AI Brain request' },
      { status: 500 }
    );
  }
}
