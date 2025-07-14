
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/avi'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const drillId = formData.get('drillId') as string;
    const drillCompletionId = formData.get('drillCompletionId') as string | null;

    if (!file || !drillId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Determine media type
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);

    if (!isVideo && !isImage) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const mediaType = isVideo ? 'VIDEO' : 'IMAGE';
    const fileId = uuidv4();
    const fileExtension = path.extname(file.name);
    const fileName = `${fileId}${fileExtension}`;
    
    // Create upload directories if they don't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', isVideo ? 'videos' : 'images');
    const thumbnailDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    if (!existsSync(thumbnailDir)) {
      await mkdir(thumbnailDir, { recursive: true });
    }

    // Save the file
    const filePath = path.join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);

    // Generate thumbnail
    let thumbnailUrl = null;
    if (isImage) {
      // For images, create a thumbnail
      const thumbnailName = `thumb_${fileId}.webp`;
      const thumbnailPath = path.join(thumbnailDir, thumbnailName);
      
      await sharp(buffer)
        .resize(300, 200, { fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(thumbnailPath);
      
      thumbnailUrl = `/uploads/thumbnails/${thumbnailName}`;
    } else if (isVideo) {
      // For videos, we'll create a placeholder thumbnail
      // In a real app, you'd use ffmpeg to extract a frame
      const thumbnailName = `thumb_${fileId}.webp`;
      const thumbnailPath = path.join(thumbnailDir, thumbnailName);
      
      // Create a simple placeholder thumbnail
      await sharp({
        create: {
          width: 300,
          height: 200,
          channels: 3,
          background: { r: 59, g: 130, b: 246 }
        }
      })
      .png()
      .composite([{
        input: Buffer.from('<svg width="60" height="60" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>'),
        top: 70,
        left: 120
      }])
      .webp({ quality: 80 })
      .toFile(thumbnailPath);
      
      thumbnailUrl = `/uploads/thumbnails/${thumbnailName}`;
    }

    // Save to database
    const fileUrl = `/uploads/${isVideo ? 'videos' : 'images'}/${fileName}`;
    
    const mediaUpload = await prisma.mediaUpload.create({
      data: {
        userId: session.user.id,
        drillId,
        drillCompletionId,
        mediaType,
        fileUrl,
        thumbnailUrl,
        filename: file.name,
        fileSize: file.size,
        duration: null, // TODO: Extract duration for videos
      },
      include: {
        drill: true,
        user: true,
      },
    });

    // Create notification for parent
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { parentId: true }
    });

    if (user?.parentId) {
      await prisma.notification.create({
        data: {
          userId: user.parentId,
          type: 'MEDIA_UPLOAD',
          title: 'New Media Upload',
          message: `${session.user.name} uploaded a ${mediaType.toLowerCase()} for ${mediaUpload.drill.name}`,
          data: {
            mediaUploadId: mediaUpload.id,
            drillId: mediaUpload.drillId,
            mediaType: mediaUpload.mediaType,
          },
        },
      });
    }

    return NextResponse.json(mediaUpload);
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}
