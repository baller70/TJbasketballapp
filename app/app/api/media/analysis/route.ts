import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { logger } from '@/lib/logger';

// File-based storage for analysis data
const STORAGE_DIR = join(process.cwd(), 'tmp', 'media-analysis');
const STORAGE_FILE = join(STORAGE_DIR, 'analysis-storage.json');

// Ensure storage directory exists
async function ensureStorageDir() {
  if (!existsSync(STORAGE_DIR)) {
    await mkdir(STORAGE_DIR, { recursive: true });
  }
}

// Read analysis storage from file
async function readAnalysisStorage(): Promise<any[]> {
  try {
    await ensureStorageDir();
    if (existsSync(STORAGE_FILE)) {
      const data = await readFile(STORAGE_FILE, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    logger.error('Error reading analysis storage', error as Error);
    return [];
  }
}

// Write analysis storage to file
async function writeAnalysisStorage(data: any[]): Promise<void> {
  try {
    await ensureStorageDir();
    await writeFile(STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    logger.error('Error writing analysis storage', error as Error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mediaId, coachFeedback, improvementNotes, positiveNotes, overallRating, annotations } = body;

    if (!mediaId || !coachFeedback) {
      return NextResponse.json(
        { success: false, error: 'Media ID and coach feedback are required' },
        { status: 400 }
      );
    }

    // Read existing analysis data
    const analysisData = await readAnalysisStorage();

    // Create new analysis entry
    const newAnalysis = {
      id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      mediaId,
      coachFeedback,
      improvementNotes,
      positiveNotes,
      overallRating,
      annotations,
      analyzedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Add to analysis data
    analysisData.push(newAnalysis);

    // Save to file
    await writeAnalysisStorage(analysisData);

    return NextResponse.json({
      success: true,
      analysis: newAnalysis,
      message: 'Analysis saved successfully'
    });

  } catch (error) {
    logger.error('Error saving analysis', error as Error);
    return NextResponse.json(
      { success: false, error: 'Failed to save analysis' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('mediaId');

    const analysisData = await readAnalysisStorage();

    if (mediaId) {
      // Return analysis for specific media
      const mediaAnalysis = analysisData.filter(analysis => analysis.mediaId === mediaId);
      return NextResponse.json({
        success: true,
        data: mediaAnalysis
      });
    } else {
      // Return all analysis data
      return NextResponse.json({
        success: true,
        data: analysisData
      });
    }

  } catch (error) {
    logger.error('Error fetching analysis', error as Error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}  