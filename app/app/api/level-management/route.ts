import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { LEVEL_PROGRESSION, LevelTier } from '@/lib/level-progression';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Get all levels
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(LEVEL_PROGRESSION);
  } catch (error) {
    console.error('Error fetching levels:', error);
    return NextResponse.json({ error: 'Failed to fetch levels' }, { status: 500 });
  }
}

// Create a new level
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newLevel: LevelTier = await request.json();
    
    // Validate required fields
    if (!newLevel.name || !newLevel.description || newLevel.pointsRequired === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Add the new level to the progression
    const updatedProgression = [...LEVEL_PROGRESSION, newLevel].sort((a, b) => a.level - b.level);
    
    // Update the file (in a real app, you'd use a database)
    await updateLevelProgressionFile(updatedProgression);

    return NextResponse.json(newLevel, { status: 201 });
  } catch (error) {
    console.error('Error creating level:', error);
    return NextResponse.json({ error: 'Failed to create level' }, { status: 500 });
  }
}

// Update level order (for drag and drop)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { levels } = await request.json();
    
    // Update level numbers based on new order
    const updatedLevels = levels.map((level: LevelTier, index: number) => ({
      ...level,
      level: index + 1,
      nextLevelPoints: index < levels.length - 1 ? levels[index + 1].pointsRequired : null
    }));

    await updateLevelProgressionFile(updatedLevels);

    return NextResponse.json(updatedLevels);
  } catch (error) {
    console.error('Error updating level order:', error);
    return NextResponse.json({ error: 'Failed to update level order' }, { status: 500 });
  }
}

// Delete a level
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const levelId = searchParams.get('level');

    if (!levelId) {
      return NextResponse.json({ error: 'Level ID required' }, { status: 400 });
    }

    const updatedProgression = LEVEL_PROGRESSION.filter(level => level.level !== parseInt(levelId));
    
    // Reorder levels after deletion
    const reorderedProgression = updatedProgression.map((level, index) => ({
      ...level,
      level: index + 1,
      nextLevelPoints: index < updatedProgression.length - 1 ? updatedProgression[index + 1].pointsRequired : null
    }));

    await updateLevelProgressionFile(reorderedProgression);

    return NextResponse.json({ message: 'Level deleted successfully' });
  } catch (error) {
    console.error('Error deleting level:', error);
    return NextResponse.json({ error: 'Failed to delete level' }, { status: 500 });
  }
}

async function updateLevelProgressionFile(levels: LevelTier[]) {
  // In a real application, you would update a database
  // For now, we'll just return the updated levels
  // This is a placeholder for the actual file update logic
  console.log('Level progression updated:', levels);
} 