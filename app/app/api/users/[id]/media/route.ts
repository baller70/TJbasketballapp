import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;

    // Fetch all media uploads for this user
    const mediaUploads = await prisma.mediaUpload.findMany({
      where: { userId: userId },
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
    console.error('Error fetching media uploads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 