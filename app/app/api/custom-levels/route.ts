import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { LEVEL_PROGRESSION, LevelTier, LevelGoal } from '@/lib/level-progression';
import { logger } from '@/lib/logger';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface ExtendedLevelTier extends LevelTier {
  isCustom: boolean;
}

// Get all levels (both default and custom)
export async function GET() {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to read custom levels from a JSON file
    const customLevelsPath = path.join(process.cwd(), 'data', 'custom-levels.json');
    let customLevels: ExtendedLevelTier[] = [];
    
    try {
      if (fs.existsSync(customLevelsPath)) {
        const customLevelsData = fs.readFileSync(customLevelsPath, 'utf8');
        customLevels = JSON.parse(customLevelsData);
      }
    } catch (error) {
      logger.error('Error reading custom levels', error as Error, { userId });
    }

    // Combine default levels with custom levels
    const defaultLevels: ExtendedLevelTier[] = LEVEL_PROGRESSION.map(level => ({
      ...level,
      isCustom: false
    }));

    // Apply custom overrides to default levels
    const allLevels: ExtendedLevelTier[] = [...defaultLevels];
    
    customLevels.forEach(customLevel => {
      const existingIndex = allLevels.findIndex(level => level.level === customLevel.level);
      if (existingIndex >= 0) {
        // Override existing level
        allLevels[existingIndex] = customLevel;
      } else {
        // Add new custom level
        allLevels.push(customLevel);
      }
    });

    // Sort by level number
    allLevels.sort((a, b) => a.level - b.level);

    return NextResponse.json({ levels: allLevels });
  } catch (error) {
    logger.error('Error fetching levels', error as Error, { userId: userId || undefined });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create default goals for a level
function createDefaultGoals(levelNumber: number, overrideGoals?: LevelGoal[]): LevelGoal[] {
  const baseGoals: LevelGoal[] = [
    {
      id: `level-${levelNumber}-goal-1`,
      description: 'Complete 5 drills',
      target: 5,
      icon: '🎯',
      category: 'drills'
    },
    {
      id: `level-${levelNumber}-goal-2`,
      description: 'Practice for 3 days',
      target: 3,
      icon: '📅',
      category: 'consistency'
    },
    {
      id: `level-${levelNumber}-goal-3`,
      description: 'Achieve 2-day streak',
      target: 2,
      icon: '🔥',
      category: 'streak'
    },
    {
      id: `level-${levelNumber}-goal-4`,
      description: 'Try 3 skill categories',
      target: 3,
      icon: '🎨',
      category: 'skills'
    },
    {
      id: `level-${levelNumber}-goal-5`,
      description: 'Score 100 points',
      target: 100,
      icon: '💯',
      category: 'points'
    },
    {
      id: `level-${levelNumber}-goal-6`,
      description: 'Complete 10 drills',
      target: 10,
      icon: '✅',
      category: 'drills'
    },
    {
      id: `level-${levelNumber}-goal-7`,
      description: 'Get 3 perfect ratings',
      target: 3,
      icon: '⭐',
      category: 'skills'
    },
    {
      id: `level-${levelNumber}-goal-8`,
      description: 'Practice with teammates',
      target: 2,
      icon: '🤝',
      category: 'teamwork'
    },
    {
      id: `level-${levelNumber}-goal-9`,
      description: 'Maintain 5-day streak',
      target: 5,
      icon: '🔥',
      category: 'streak'
    },
    {
      id: `level-${levelNumber}-goal-10`,
      description: 'Complete Level Assessment Test',
      target: 1,
      icon: '🏆',
      category: 'skills'
    }
  ];

  if (overrideGoals && overrideGoals.length === 10) {
    return overrideGoals;
  }

  return baseGoals;
}

// Create a new custom level
export async function POST(request: Request) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, pointsRequired, color, icon, rewards, goals } = body;

    if (!name || !description || pointsRequired === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure we have exactly 10 goals with the last one being a test
    const levelGoals = createDefaultGoals(1, goals);

    // Read existing custom levels
    const customLevelsPath = path.join(process.cwd(), 'data', 'custom-levels.json');
    let customLevels: ExtendedLevelTier[] = [];
    
    try {
      if (fs.existsSync(customLevelsPath)) {
        const customLevelsData = fs.readFileSync(customLevelsPath, 'utf8');
        customLevels = JSON.parse(customLevelsData);
      }
    } catch (error) {
      logger.error('Error reading custom levels', error as Error, { userId });
    }

    // Determine the next level number
    const nextLevelNumber = Math.max(
      LEVEL_PROGRESSION.length,
      ...customLevels.map(level => level.level)
    ) + 1;

    // Create the new level
    const newLevel: ExtendedLevelTier = {
      level: nextLevelNumber,
      name,
      description,
      pointsRequired,
      nextLevelPoints: null,
      goals: levelGoals,
      rewards: rewards || [],
      color: color || 'bg-purple-100 text-purple-800',
      icon: icon || '⭐',
      isCustom: true, // Mark as custom
    };

    // Add to custom levels
    customLevels.push(newLevel);

    // Save updated custom levels
    fs.writeFileSync(customLevelsPath, JSON.stringify(customLevels, null, 2));

    return NextResponse.json(newLevel);
  } catch (error) {
    logger.error('Error creating level', error as Error, { userId: userId || undefined });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Edit a level (both default and custom)
export async function PATCH(request: Request) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, level, ...levelData } = body;

    if (action === 'edit') {
      // Load existing levels
      const customLevelsPath = path.join(process.cwd(), 'data', 'custom-levels.json');
      let customLevels: ExtendedLevelTier[] = [];
      let allLevels = [...LEVEL_PROGRESSION];

      try {
        if (fs.existsSync(customLevelsPath)) {
          const customData = fs.readFileSync(customLevelsPath, 'utf-8');
          customLevels = JSON.parse(customData);
          allLevels = [...allLevels, ...customLevels];
        }
      } catch (error) {
        logger.error('Error reading custom levels', error as Error, { userId });
      }

      // Ensure goals are exactly 10 with the last one being a test
      const goals = createDefaultGoals(level, levelData.goals);

      const updatedLevelData: ExtendedLevelTier = {
        ...levelData,
        goals,
        level: parseInt(level),
        nextLevelPoints: null, // Will be calculated
      };

      // Check if it's a default level (level number <= LEVEL_PROGRESSION.length)
      if (level <= LEVEL_PROGRESSION.length) {
        // For default levels, we need to store the override in custom levels
        const existingCustomIndex = customLevels.findIndex((l: ExtendedLevelTier) => l.level === level);
        if (existingCustomIndex >= 0) {
          // Update existing custom override
          customLevels[existingCustomIndex] = { ...updatedLevelData, isCustom: false };
        } else {
          // Create new custom override for default level
          customLevels.push({ ...updatedLevelData, isCustom: false });
        }
      } else {
        // For custom levels, update in custom levels array
        const customIndex = customLevels.findIndex((l: ExtendedLevelTier) => l.level === level);
        if (customIndex >= 0) {
          customLevels[customIndex] = { ...updatedLevelData, isCustom: true };
        }
      }

      // Sort custom levels by level number
      customLevels.sort((a: ExtendedLevelTier, b: ExtendedLevelTier) => a.level - b.level);

      // Save custom levels
      fs.writeFileSync(customLevelsPath, JSON.stringify(customLevels, null, 2));

      return NextResponse.json({ success: true, level: updatedLevelData });
    }

    if (action === 'reorder') {
      // Handle reordering logic
      const { levels } = body;
      
      // Separate custom levels from default levels
      const customLevels = levels.filter((l: ExtendedLevelTier) => l.isCustom);
      const defaultOverrides = levels.filter((l: ExtendedLevelTier) => !l.isCustom && l.level <= LEVEL_PROGRESSION.length);
      
      // Save custom levels and default overrides
      const customLevelsPath = path.join(process.cwd(), 'data', 'custom-levels.json');
      const allCustomData = [...defaultOverrides, ...customLevels];
      
      fs.writeFileSync(customLevelsPath, JSON.stringify(allCustomData, null, 2));
      
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error('Error updating level', error as Error, { userId: userId || undefined });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update level order (drag and drop)
export async function PUT(request: Request) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { levels } = body;

    if (!levels || !Array.isArray(levels)) {
      return NextResponse.json({ error: 'Invalid levels data' }, { status: 400 });
    }

    // Separate custom levels from default levels
    const customLevels = levels.filter((level: LevelTier) => level.level > LEVEL_PROGRESSION.length);
    
    // Update level numbers to maintain order
    const updatedCustomLevels = customLevels.map((level: LevelTier, index: number) => ({
      ...level,
      level: LEVEL_PROGRESSION.length + index + 1
    }));

    // Save updated custom levels
    const customLevelsPath = path.join(process.cwd(), 'data', 'custom-levels.json');
    const dataDir = path.join(process.cwd(), 'data');
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(customLevelsPath, JSON.stringify(updatedCustomLevels, null, 2));

    return NextResponse.json({ message: 'Levels reordered successfully' });
  } catch (error) {
    logger.error('Error reordering levels', error as Error, { userId: userId || undefined });
    return NextResponse.json({ error: 'Failed to reorder levels' }, { status: 500 });
  }
}

// Delete a custom level
export async function DELETE(request: Request) {
  let userId: string | null = null;
  
  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { level } = body;

    if (!level) {
      return NextResponse.json({ error: 'Level number is required' }, { status: 400 });
    }

    const levelNumber = parseInt(level);

    // Can't delete default levels
    if (levelNumber <= LEVEL_PROGRESSION.length) {
      return NextResponse.json({ error: 'Cannot delete default levels' }, { status: 400 });
    }

    // Read existing custom levels
    const customLevelsPath = path.join(process.cwd(), 'data', 'custom-levels.json');
    let customLevels: ExtendedLevelTier[] = [];
    
    try {
      if (fs.existsSync(customLevelsPath)) {
        const customLevelsData = fs.readFileSync(customLevelsPath, 'utf8');
        customLevels = JSON.parse(customLevelsData);
      }
    } catch (error) {
      logger.error('Error reading custom levels', error as Error, { userId });
      return NextResponse.json({ error: 'Failed to read custom levels' }, { status: 500 });
    }

    // Find and remove the level
    const levelIndex = customLevels.findIndex((level: ExtendedLevelTier) => level.level === levelNumber);
    if (levelIndex === -1) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    customLevels.splice(levelIndex, 1);

    // Save updated custom levels
    fs.writeFileSync(customLevelsPath, JSON.stringify(customLevels, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting level', error as Error, { userId: userId || undefined });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}            