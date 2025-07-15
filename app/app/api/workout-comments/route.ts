import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch comments for a workout completion
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
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
    console.error('Error fetching workout comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
        userId: session.user.id,
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
    console.error('Error creating workout comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a comment
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
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

    if (comment.userId !== session.user.id) {
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
    console.error('Error deleting workout comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 