import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET - Fetch comments for a drill completion or media upload
export async function GET(request: NextRequest) {
  let userId: string | null = null;
  let drillCompletionId: string | null = null;
  let mediaUploadId: string | null = null;
  let drillId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    drillCompletionId = searchParams.get('drillCompletionId');
    mediaUploadId = searchParams.get('mediaUploadId');
    drillId = searchParams.get('drillId');

    if (!drillCompletionId && !mediaUploadId && !drillId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const comments = await prisma.drillComment.findMany({
      where: {
        ...(drillCompletionId && { drillCompletionId }),
        ...(mediaUploadId && { mediaUploadId }),
        ...(drillId && { drillId }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            image: true,
          },
        },

      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    logger.error('Error fetching comments', error as Error, {
      userId: userId || undefined,
      drillCompletionId: drillCompletionId || undefined,
      mediaUploadId: mediaUploadId || undefined,
      drillId: drillId || undefined
    });
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST - Create a new comment
export async function POST(request: NextRequest) {
  let userId: string | null = null;
  let drillId: string | undefined = undefined;
  let drillCompletionId: string | undefined = undefined;
  let mediaUploadId: string | undefined = undefined;
  let parentCommentId: string | undefined = undefined;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, drillId: requestDrillId, drillCompletionId: requestDrillCompletionId, mediaUploadId: requestMediaUploadId, parentCommentId: requestParentCommentId } = body;
    
    drillId = requestDrillId;
    drillCompletionId = requestDrillCompletionId;
    mediaUploadId = requestMediaUploadId;
    parentCommentId = requestParentCommentId;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    if (!drillId) {
      return NextResponse.json({ error: 'Drill ID is required' }, { status: 400 });
    }

    // Verify user has access to this drill/completion
    if (drillCompletionId) {
      const completion = await prisma.drillCompletion.findUnique({
        where: { id: drillCompletionId },
        include: {
          user: {
            select: { id: true, parentId: true },
          },
        },
      });

      if (!completion) {
        return NextResponse.json({ error: 'Drill completion not found' }, { status: 404 });
      }

      // Allow comment if user is the player or the player's parent
      const canComment = completion.userId === userId || 
                        completion.user.parentId === userId;

      if (!canComment) {
        return NextResponse.json({ error: 'Unauthorized to comment on this drill' }, { status: 403 });
      }
    }

    const comment = await prisma.drillComment.create({
      data: {
        content: content.trim(),
        userId: userId,
        drillId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            image: true,
          },
        },
      },
    });

    // Create notification for the other party
    if (drillCompletionId) {
      const completion = await prisma.drillCompletion.findUnique({
        where: { id: drillCompletionId },
        include: {
          user: {
            select: { id: true, parentId: true, name: true },
          },
          drill: {
            select: { name: true },
          },
        },
      });

      if (completion) {
        const isPlayerCommenting = completion.userId === userId;
        const notificationUserId = isPlayerCommenting ? 
          completion.user.parentId : completion.userId;

        if (notificationUserId) {
          await prisma.notification.create({
            data: {
              userId: notificationUserId,
              type: 'AI_FEEDBACK',
              title: 'New Comment on Drill',
              message: `User commented on ${completion.drill.name}`,
              data: {
                drillCompletionId,
                commentId: comment.id,
                drillId,
              },
            },
          });
        }
      }
    }

    return NextResponse.json(comment);
  } catch (error) {
    logger.error('Error creating comment', error as Error, {
      userId: userId || undefined,
      drillId: drillId || undefined,
      drillCompletionId: drillCompletionId || undefined,
      mediaUploadId: mediaUploadId || undefined,
      parentCommentId: parentCommentId || undefined
    });
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}            