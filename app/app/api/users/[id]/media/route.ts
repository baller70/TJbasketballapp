import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const targetUserId = params.id;

    // Fetch all media uploads for this user
    const mediaUploads = await prisma.mediaUpload.findMany({
      where: { userId: targetUserId },
      include: {
        drill: {
          select: {
            id: true,
            name: true,
            category: true,
          }
        },
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format the media uploads for the frontend
    const formattedUploads = mediaUploads.map(upload => ({
      id: upload.id,
      type: upload.mediaType,
      url: upload.fileUrl,
      filename: upload.filename,
      fileSize: upload.fileSize,
      duration: upload.duration,
      feedback: upload.feedback,
      reviewedBy: upload.reviewedBy,
      reviewedAt: upload.reviewedAt?.toISOString(),
      createdAt: upload.createdAt.toISOString(),
      drill: {
        id: upload.drill.id,
        name: upload.drill.name,
        category: upload.drill.category,
      },
      user: {
        id: upload.user.id,
        name: upload.user.name,
      }
    }));

    return NextResponse.json({ 
      success: true,
      mediaUploads: formattedUploads
    });

  } catch (error) {
    logger.error('Error fetching media uploads', error as Error, {
      userId: params.id,
      endpoint: '/api/users/[id]/media'
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}        