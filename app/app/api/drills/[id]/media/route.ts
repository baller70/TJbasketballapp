import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mediaUploads = await prisma.mediaUpload.findMany({
      where: {
        drillId: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(mediaUploads);
  } catch (error) {
    logger.error('Error fetching media uploads', error as Error, {
      drillId: params.id
    });
    return NextResponse.json(
      { error: 'Failed to fetch media uploads' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // In a real app, you'd upload to cloud storage (S3, Cloudinary, etc.)
    const mediaUpload = await prisma.mediaUpload.create({
      data: {
        filename: file.name,
        mediaType: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
        fileSize: file.size,
        fileUrl: `/uploads/${file.name}`, // Placeholder URL
        drillId: params.id,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(mediaUpload);
  } catch (error) {
    logger.error('Error uploading media', error as Error, {
      drillId: params.id,
      userId: userId || undefined
    });
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}          