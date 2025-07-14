
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feedback } = await request.json();
    const { id: mediaId } = params;

    if (!feedback || !feedback.trim()) {
      return NextResponse.json({ error: 'Feedback is required' }, { status: 400 });
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        name: true,
        children: {
          select: { id: true }
        }
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the media upload
    const mediaUpload = await prisma.mediaUpload.findUnique({
      where: { id: mediaId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            parentId: true,
          }
        },
        drill: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!mediaUpload) {
      return NextResponse.json({ error: 'Media upload not found' }, { status: 404 });
    }

    // Check if user has permission to provide feedback
    let canProvideFeedback = false;
    
    if (currentUser.role === 'PARENT') {
      // Parents can provide feedback on their children's uploads
      const childIds = currentUser.children.map(child => child.id);
      canProvideFeedback = childIds.includes(mediaUpload.userId);
    }

    if (!canProvideFeedback) {
      return NextResponse.json({ error: 'Not authorized to provide feedback' }, { status: 403 });
    }

    // Update the media upload with feedback
    const updatedUpload = await prisma.mediaUpload.update({
      where: { id: mediaId },
      data: {
        feedback: feedback.trim(),
        reviewedBy: currentUser.id,
        reviewedAt: new Date(),
      },
      include: {
        drill: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Create notification for the player
    await prisma.notification.create({
      data: {
        userId: mediaUpload.userId,
        type: 'AI_FEEDBACK',
        title: 'New Feedback Received',
        message: `${currentUser.name} provided feedback on your ${mediaUpload.mediaType.toLowerCase()} for ${mediaUpload.drill.name}`,
        data: {
          mediaUploadId: mediaUpload.id,
          drillId: mediaUpload.drillId,
          feedbackFrom: currentUser.id,
        },
      },
    });

    return NextResponse.json(updatedUpload);
  } catch (error) {
    console.error('Error providing feedback:', error);
    return NextResponse.json(
      { error: 'Failed to provide feedback' },
      { status: 500 }
    );
  }
}
