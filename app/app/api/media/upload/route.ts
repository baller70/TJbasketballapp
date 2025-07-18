
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth-config';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'video/x-msvideo': 'avi',
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const drillId = formData.get('drillId') as string;
    const drillCompletionId = formData.get('drillCompletionId') as string | null;

    if (!drillId) {
      return NextResponse.json({ error: 'drillId is required' }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Validate drill exists
    const drill = await prisma.drill.findUnique({
      where: { id: drillId },
    });
    if (!drill) {
      return NextResponse.json({ error: 'Drill not found' }, { status: 404 });
    }

    const uploadedFiles = [];
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'media');
    
    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]) {
        return NextResponse.json({ 
          error: `Invalid file type: ${file.type}. Allowed types: ${Object.keys(ALLOWED_TYPES).join(', ')}` 
        }, { status: 400 });
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ 
          error: `File ${file.name} is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
        }, { status: 400 });
      }

      // Generate unique filename
      const fileExtension = ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES];
      const filename = `${uuidv4()}.${fileExtension}`;
      const filepath = join(uploadDir, filename);

      // Save file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // Determine media type
      const mediaType = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';

             // Create database record
       const mediaUpload = await prisma.mediaUpload.create({
         data: {
           filename: file.name,
           fileUrl: `/uploads/media/${filename}`,
           fileSize: file.size,
           mediaType,
           userId: session.user.id,
           drillId: drillId,
           drillCompletionId: drillCompletionId || undefined,
         },
         include: {
           user: {
             select: {
               id: true,
               name: true,
               email: true,
             },
           },
           drill: {
             select: {
               id: true,
               name: true,
               category: true,
             },
           },
         },
       });

      uploadedFiles.push(mediaUpload);
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
    });

  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Failed to upload media files' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const drillId = searchParams.get('drillId');
    const userId = searchParams.get('userId');

    const whereClause: any = {};

    if (drillId) {
      whereClause.drillId = drillId;
    }

    if (userId) {
      whereClause.userId = userId;
    } else {
      // If no specific user requested, only show current user's uploads
      whereClause.userId = session.user.id;
    }

    const mediaUploads = await prisma.mediaUpload.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        drill: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(mediaUploads);

  } catch (error) {
    console.error('Error fetching media uploads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media uploads' },
      { status: 500 }
    );
  }
}
