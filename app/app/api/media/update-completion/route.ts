import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { drillId, completionId } = body;

    if (!drillId || !completionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the completion belongs to the user
    const completion = await prisma.drillCompletion.findFirst({
      where: {
        id: completionId,
        userId: session.user.id,
      },
    });

    if (!completion) {
      return NextResponse.json({ error: 'Completion not found' }, { status: 404 });
    }

    // Update media uploads for this drill that don't have a completion ID yet
    const updatedMedia = await prisma.mediaUpload.updateMany({
      where: {
        drillId,
        userId: session.user.id,
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
    console.error('Error updating media with completion ID:', error);
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    );
  }
} 