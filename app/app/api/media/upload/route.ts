
import { NextRequest, NextResponse } from 'next/server';
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
    console.error('Error reading media storage:', error);
    return [];
  }
}

// Write media storage to file
async function writeMediaStorage(data: any[]): Promise<void> {
  try {
    await ensureStorageDir();
    await writeFile(STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing media storage:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Skip authentication for development
    console.log('Media upload request received');

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const note = formData.get('note') as string;
    const type = formData.get('type') as string;
    const drillId = formData.get('drillId') as string;

    if (!file || !userId || !drillId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Processing media upload for user:', userId, 'drill:', drillId);

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

    console.log('Media upload successful:', mediaUpload.id);

    return NextResponse.json({ 
      success: true, 
      mediaUpload: mediaUpload,
      message: 'Media uploaded successfully'
    });

  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Read media storage and filter for this user
    const mediaStorage = await readMediaStorage();
    const userMedia = mediaStorage.filter(media => media.userId === userId);

    return NextResponse.json({ 
      success: true, 
      data: userMedia 
    });

  } catch (error) {
    console.error('Media fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}
