import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch comments for a drill completion or media upload
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const drillCompletionId = searchParams.get('drillCompletionId');
    const mediaUploadId = searchParams.get('mediaUploadId');
    const drillId = searchParams.get('drillId');

    if (!drillCompletionId && !mediaUploadId && !drillId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const comments = await prisma.drillComment.findMany({
      where: {
        parentCommentId: null, // Only get top-level comments
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
        replies: {
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
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, drillId, drillCompletionId, mediaUploadId, parentCommentId } = body;

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
      const canComment = completion.userId === session.user.id || 
                        completion.user.parentId === session.user.id;

      if (!canComment) {
        return NextResponse.json({ error: 'Unauthorized to comment on this drill' }, { status: 403 });
      }
    }

    const comment = await prisma.drillComment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        drillId,
        drillCompletionId,
        mediaUploadId,
        parentCommentId,
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
        const isPlayerCommenting = completion.userId === session.user.id;
        const notificationUserId = isPlayerCommenting ? 
          completion.user.parentId : completion.userId;

        if (notificationUserId) {
          await prisma.notification.create({
            data: {
              userId: notificationUserId,
              type: 'AI_FEEDBACK',
              title: 'New Comment on Drill',
              message: `${session.user.name} commented on ${completion.drill.name}`,
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
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
} 