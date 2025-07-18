import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET - Fetch comments for a workout completion
export async function GET(request: NextRequest) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workoutCompletionId = searchParams.get('workoutCompletionId');
    const workoutId = searchParams.get('workoutId');

    if (!workoutCompletionId && !workoutId) {
      return NextResponse.json({ error: 'Missing workoutCompletionId or workoutId' }, { status: 400 });
    }

    let whereClause: any = {};
    
    if (workoutCompletionId) {
      whereClause.workoutCompletionId = workoutCompletionId;
    }
    
    if (workoutId) {
      whereClause.workoutId = workoutId;
    }

    const comments = await prisma.workoutComment.findMany({
      where: {
        parentCommentId: null, // Only get top-level comments
        ...whereClause
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
    logger.error('Error fetching workout comments', error as Error, { userId: userId || undefined });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new comment
export async function POST(request: NextRequest) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workoutId, workoutCompletionId, content, parentCommentId } = body;

    if (!content || (!workoutId && !workoutCompletionId)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the workout exists if workoutId is provided
    if (workoutId) {
      const workout = await prisma.workout.findUnique({
        where: { id: workoutId },
      });

      if (!workout) {
        return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
      }
    }

    // Verify the workout completion exists if workoutCompletionId is provided
    if (workoutCompletionId) {
      const completion = await prisma.workoutCompletion.findUnique({
        where: { id: workoutCompletionId },
      });

      if (!completion) {
        return NextResponse.json({ error: 'Workout completion not found' }, { status: 404 });
      }
    }

    // Create the comment
    const comment = await prisma.workoutComment.create({
      data: {
        userId: userId,
        workoutId: workoutId || null,
        workoutCompletionId: workoutCompletionId || null,
        content,
        parentCommentId: parentCommentId || null,
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
    });

    return NextResponse.json(comment);
  } catch (error) {
    logger.error('Error creating workout comment', error as Error, { userId: userId || undefined });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a comment
export async function DELETE(request: NextRequest) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ error: 'Missing commentId' }, { status: 400 });
    }

    // Verify the comment exists and belongs to the user
    const comment = await prisma.workoutComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized to delete this comment' }, { status: 403 });
    }

    // Delete the comment and its replies
    await prisma.workoutComment.deleteMany({
      where: {
        OR: [
          { id: commentId },
          { parentCommentId: commentId },
        ],
      },
    });

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    logger.error('Error deleting workout comment', error as Error, { userId: userId || undefined });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}            