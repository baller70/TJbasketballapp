
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger, SecurityEventType } from '@/lib/logger';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// File-based storage for media uploads
const STORAGE_DIR = join(process.cwd(), 'tmp', 'media-uploads');
const STORAGE_FILE = join(STORAGE_DIR, 'media-storage.json');

// Ensure storage directory exists
async function ensureStorageDir() {
  if (!existsSync(STORAGE_DIR)) {
    await mkdir(STORAGE_DIR, { recursive: true });
  }
}

// Read media storage from file
async function readMediaStorage(): Promise<any[]> {
  try {
    await ensureStorageDir();
    if (existsSync(STORAGE_FILE)) {
      const data = await readFile(STORAGE_FILE, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    logger.error('Error reading media storage', error as Error);
    return [];
  }
}

// Write media storage to file
async function writeMediaStorage(data: any[]): Promise<void> {
  try {
    await ensureStorageDir();
    await writeFile(STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    logger.error('Error writing media storage', error as Error);
  }
}

export async function POST(request: NextRequest) {
  const requestContext = logger.createRequestContext(request);
  
  try {
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      logger.security('Unauthorized file upload attempt', {
        ...requestContext,
        eventType: SecurityEventType.UNAUTHORIZED_ACCESS,
        resource: 'media_upload',
        action: 'upload',
        success: false,
        reason: 'No authentication'
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const note = formData.get('note') as string;
    const type = formData.get('type') as string;
    const drillId = formData.get('drillId') as string;

    if (!file || !userId || !drillId) {
      logger.warn('File upload missing required fields', {
        ...requestContext,
        userId: authUserId,
        hasFile: !!file,
        hasUserId: !!userId,
        hasDrillId: !!drillId
      });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (authUserId !== userId) {
      logger.security('User attempting to upload file for different user', {
        ...requestContext,
        eventType: SecurityEventType.UNAUTHORIZED_ACCESS,
        resource: 'media_upload',
        action: 'upload',
        success: false,
        reason: 'User ID mismatch',
        userId: authUserId,
        targetUserId: userId
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      logger.warn('Invalid file type uploaded', {
        ...requestContext,
        userId: authUserId,
        fileType: file.type,
        fileName: file.name
      });
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      logger.warn('File size exceeds limit', {
        ...requestContext,
        userId: authUserId,
        fileSize: file.size,
        maxSize,
        fileName: file.name
      });
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    logger.info('Processing media upload', { 
      ...requestContext,
      userId: authUserId, 
      drillId 
    });

    // Convert file to base64 for storage and display
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Create media upload record with actual file content
    const mediaUpload = {
      id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      drillId: drillId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUrl: dataUrl, // Store as data URL for immediate display
      uploadedAt: new Date().toISOString(),
      note: note || '',
      type: type || (file.type.startsWith('video/') ? 'video' : 'image'),
      drill: {
        id: drillId,
        name: 'General Training'
      }
    };

    // Read existing storage and add new media
    const mediaStorage = await readMediaStorage();
    mediaStorage.push(mediaUpload);
    await writeMediaStorage(mediaStorage);

    logger.security('File uploaded successfully', {
      ...requestContext,
      eventType: SecurityEventType.FILE_UPLOAD,
      resource: 'media_upload',
      action: 'upload',
      success: true,
      userId: authUserId,
      uploadId: mediaUpload.id,
      fileName: file.name,
      fileSize: file.size,
      drillId,
      mediaType: type
    });

    return NextResponse.json({ 
      success: true, 
      mediaUpload: mediaUpload,
      message: 'Media uploaded successfully'
    });

  } catch (error) {
    logger.error('Error uploading media', error as Error, requestContext);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const requestContext = logger.createRequestContext(request);
  
  try {
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      logger.security('Unauthorized media access attempt', {
        ...requestContext,
        eventType: SecurityEventType.UNAUTHORIZED_ACCESS,
        resource: 'media_upload',
        action: 'read',
        success: false,
        reason: 'No authentication'
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      logger.warn('Media fetch missing user ID', requestContext);
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (authUserId !== userId) {
      logger.security('User attempting to access media for different user', {
        ...requestContext,
        eventType: SecurityEventType.UNAUTHORIZED_ACCESS,
        resource: 'media_upload',
        action: 'read',
        success: false,
        reason: 'User ID mismatch',
        userId: authUserId,
        targetUserId: userId
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Read media storage and filter for this user
    const mediaStorage = await readMediaStorage();
    const userMedia = mediaStorage.filter(media => media.userId === userId);

    return NextResponse.json({ 
      success: true, 
      data: userMedia 
    });

  } catch (error) {
    logger.error('Media fetch error', error as Error, requestContext);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}
