import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let userId: string | null = null;
  let body: any = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    body = await request.json();
    const { drillId, completionId } = body;

    if (!drillId || !completionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the completion belongs to the user
    const completion = await prisma.drillCompletion.findFirst({
      where: {
        id: completionId,
        userId: userId,
      },
    });

    if (!completion) {
      return NextResponse.json({ error: 'Completion not found' }, { status: 404 });
    }

    // Update media uploads for this drill that don't have a completion ID yet
    const updatedMedia = await prisma.mediaUpload.updateMany({
      where: {
        drillId,
        userId: userId,
        drillCompletionId: null,
        // Only update media uploaded in the last hour to avoid updating old media
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000),
        },
      },
      data: {
        drillCompletionId: completionId,
      },
    });

    return NextResponse.json({ 
      message: 'Media updated successfully',
      updatedCount: updatedMedia.count,
    });
  } catch (error) {
    logger.error('Error updating media with completion ID', error as Error, {
      userId: userId || undefined,
      drillId: body?.drillId,
      completionId: body?.completionId
    });
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    );
  }
}          