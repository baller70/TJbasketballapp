
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Define 10 basketball levels with 10 goals each (10th goal is a test)
const BASKETBALL_LEVELS = [
  {
    level: 1,
    name: 'Rookie Player',
    description: 'Master the fundamentals of basketball',
    pointsRequired: 0,
    goals: [
      { id: 'l1g1', name: 'First Dribble', description: 'Complete basic dribbling drill', points: 10 },
      { id: 'l1g2', name: 'First Shot', description: 'Make your first basket', points: 10 },
      { id: 'l1g3', name: 'Stance Master', description: 'Perfect your basketball stance', points: 15 },
      { id: 'l1g4', name: 'Ball Control', description: 'Dribble for 30 seconds without losing control', points: 15 },
      { id: 'l1g5', name: 'Free Throw Basics', description: 'Make 3 out of 10 free throws', points: 20 },
      { id: 'l1g6', name: 'Layup Learner', description: 'Complete 5 successful layups', points: 20 },
      { id: 'l1g7', name: 'Defense Position', description: 'Hold defensive stance for 1 minute', points: 25 },
      { id: 'l1g8', name: 'Passing Basics', description: 'Complete 10 chest passes accurately', points: 25 },
      { id: 'l1g9', name: 'Court Awareness', description: 'Identify all court positions and lines', points: 30 },
      { id: 'l1g10', name: 'Rookie Test', description: 'Pass fundamentals skills test', points: 50, isTest: true }
    ]
  },
  {
    level: 2,
    name: 'Developing Player',
    description: 'Build consistency in basic skills',
    pointsRequired: 220,
    goals: [
      { id: 'l2g1', name: 'Consistent Dribbling', description: 'Dribble with both hands for 1 minute', points: 30 },
      { id: 'l2g2', name: 'Shooting Form', description: 'Perfect your shooting form technique', points: 30 },
      { id: 'l2g3', name: 'Free Throw Progress', description: 'Make 5 out of 10 free throws', points: 35 },
      { id: 'l2g4', name: 'Layup Consistency', description: 'Make 8 out of 10 layups', points: 35 },
      { id: 'l2g5', name: 'Crossover Dribble', description: 'Master the crossover dribble move', points: 40 },
      { id: 'l2g6', name: 'Defensive Slides', description: 'Complete defensive slide drill', points: 40 },
      { id: 'l2g7', name: 'Passing Variety', description: 'Master bounce and overhead passes', points: 45 },
      { id: 'l2g8', name: 'Court Movement', description: 'Run plays with proper positioning', points: 45 },
      { id: 'l2g9', name: 'Game Awareness', description: 'Understand basic game rules and violations', points: 50 },
      { id: 'l2g10', name: 'Development Test', description: 'Pass intermediate skills assessment', points: 75, isTest: true }
    ]
  },
  {
    level: 3,
    name: 'Skilled Player',
    description: 'Develop advanced basketball techniques',
    pointsRequired: 665,
    goals: [
      { id: 'l3g1', name: 'Advanced Dribbling', description: 'Master behind-the-back dribble', points: 50 },
      { id: 'l3g2', name: 'Mid-Range Shooting', description: 'Make 7 out of 10 mid-range shots', points: 50 },
      { id: 'l3g3', name: 'Free Throw Accuracy', description: 'Make 8 out of 10 free throws', points: 55 },
      { id: 'l3g4', name: 'Reverse Layup', description: 'Master reverse layup technique', points: 55 },
      { id: 'l3g5', name: 'Defensive Pressure', description: 'Apply effective defensive pressure', points: 60 },
      { id: 'l3g6', name: 'Fast Break', description: 'Execute fast break plays efficiently', points: 60 },
      { id: 'l3g7', name: 'Screen Setting', description: 'Set effective picks and screens', points: 65 },
      { id: 'l3g8', name: 'Rebounding', description: 'Secure 10 rebounds in practice', points: 65 },
      { id: 'l3g9', name: 'Game Strategy', description: 'Understand offensive and defensive sets', points: 70 },
      { id: 'l3g10', name: 'Skills Test', description: 'Pass advanced skills evaluation', points: 100, isTest: true }
    ]
  },
  {
    level: 4,
    name: 'Team Player',
    description: 'Excel in team play and leadership',
    pointsRequired: 1295,
    goals: [
      { id: 'l4g1', name: 'Team Communication', description: 'Lead team communication during drills', points: 70 },
      { id: 'l4g2', name: '3-Point Shooting', description: 'Make 5 out of 10 three-pointers', points: 70 },
      { id: 'l4g3', name: 'Assist Master', description: 'Record 10 assists in scrimmage', points: 75 },
      { id: 'l4g4', name: 'Defensive Leader', description: 'Organize team defense effectively', points: 75 },
      { id: 'l4g5', name: 'Clutch Performance', description: 'Make pressure shots in game situations', points: 80 },
      { id: 'l4g6', name: 'Conditioning Elite', description: 'Complete advanced conditioning drills', points: 80 },
      { id: 'l4g7', name: 'Court Vision', description: 'Demonstrate exceptional court awareness', points: 85 },
      { id: 'l4g8', name: 'Leadership Skills', description: 'Mentor younger players effectively', points: 85 },
      { id: 'l4g9', name: 'Game Management', description: 'Control game tempo and flow', points: 90 },
      { id: 'l4g10', name: 'Team Test', description: 'Pass team leadership assessment', points: 125, isTest: true }
    ]
  },
  {
    level: 5,
    name: 'Varsity Player',
    description: 'Compete at high school varsity level',
    pointsRequired: 2130,
    goals: [
      { id: 'l5g1', name: 'Signature Move', description: 'Develop your signature basketball move', points: 90 },
      { id: 'l5g2', name: 'Clutch Shooter', description: 'Make 8 out of 10 pressure shots', points: 90 },
      { id: 'l5g3', name: 'Defensive Stopper', description: 'Shut down opponent in 1-on-1', points: 95 },
      { id: 'l5g4', name: 'Triple-Double', description: 'Achieve triple-double in scrimmage', points: 95 },
      { id: 'l5g5', name: 'Game Winner', description: 'Hit game-winning shot in pressure situation', points: 100 },
      { id: 'l5g6', name: 'Endurance Elite', description: 'Play full game without fatigue', points: 100 },
      { id: 'l5g7', name: 'Tactical Genius', description: 'Call plays and adjust strategies', points: 105 },
      { id: 'l5g8', name: 'Mental Toughness', description: 'Perform under maximum pressure', points: 105 },
      { id: 'l5g9', name: 'Complete Player', description: 'Excel in all aspects of the game', points: 110 },
      { id: 'l5g10', name: 'Varsity Test', description: 'Pass varsity-level skills test', points: 150, isTest: true }
    ]
  },
  {
    level: 6,
    name: 'All-Star Player',
    description: 'Dominate at regional competition level',
    pointsRequired: 3270,
    goals: [
      { id: 'l6g1', name: 'Unstoppable Move', description: 'Perfect an unstoppable offensive move', points: 110 },
      { id: 'l6g2', name: 'Lockdown Defense', description: 'Hold opponent to under 30% shooting', points: 110 },
      { id: 'l6g3', name: 'Clutch Gene', description: 'Make 9 out of 10 clutch shots', points: 115 },
      { id: 'l6g4', name: 'Floor General', description: 'Control entire team offense', points: 115 },
      { id: 'l6g5', name: 'Highlight Reel', description: 'Create spectacular highlight plays', points: 120 },
      { id: 'l6g6', name: 'Stamina King', description: 'Maintain peak performance all game', points: 120 },
      { id: 'l6g7', name: 'Matchup Master', description: 'Adapt to any opponent style', points: 125 },
      { id: 'l6g8', name: 'Pressure Cooker', description: 'Thrive in high-pressure situations', points: 125 },
      { id: 'l6g9', name: 'All-Around Star', description: 'Dominate in all statistical categories', points: 130 },
      { id: 'l6g10', name: 'All-Star Test', description: 'Pass all-star level evaluation', points: 175, isTest: true }
    ]
  },
  {
    level: 7,
    name: 'Elite Player',
    description: 'Compete at college scholarship level',
    pointsRequired: 4505,
    goals: [
      { id: 'l7g1', name: 'Signature Series', description: 'Develop multiple signature moves', points: 130 },
      { id: 'l7g2', name: 'Defensive Anchor', description: 'Become the defensive foundation', points: 130 },
      { id: 'l7g3', name: 'Clutch Legend', description: 'Never miss in clutch situations', points: 135 },
      { id: 'l7g4', name: 'Offensive Coordinator', description: 'Run complex offensive systems', points: 135 },
      { id: 'l7g5', name: 'Game Changer', description: 'Single-handedly change game momentum', points: 140 },
      { id: 'l7g6', name: 'Iron Man', description: 'Play at elite level without rest', points: 140 },
      { id: 'l7g7', name: 'Scout Magnet', description: 'Attract college scout attention', points: 145 },
      { id: 'l7g8', name: 'Mentality Master', description: 'Develop championship mentality', points: 145 },
      { id: 'l7g9', name: 'Complete Domination', description: 'Dominate every aspect of basketball', points: 150 },
      { id: 'l7g10', name: 'Elite Test', description: 'Pass elite player assessment', points: 200, isTest: true }
    ]
  },
  {
    level: 8,
    name: 'College Prospect',
    description: 'Ready for Division I basketball',
    pointsRequired: 5855,
    goals: [
      { id: 'l8g1', name: 'Scholarship Worthy', description: 'Demonstrate college-level skills', points: 150 },
      { id: 'l8g2', name: 'Defensive Specialist', description: 'Master all defensive positions', points: 150 },
      { id: 'l8g3', name: 'Clutch Machine', description: 'Perfect clutch performance record', points: 155 },
      { id: 'l8g4', name: 'System Master', description: 'Excel in any basketball system', points: 155 },
      { id: 'l8g5', name: 'Impact Player', description: 'Make immediate impact in any game', points: 160 },
      { id: 'l8g6', name: 'Conditioning Freak', description: 'Achieve superhuman conditioning', points: 160 },
      { id: 'l8g7', name: 'Recruit Target', description: 'Become top college recruit', points: 165 },
      { id: 'l8g8', name: 'Winner Mentality', description: 'Develop unshakeable winning mindset', points: 165 },
      { id: 'l8g9', name: 'Basketball Genius', description: 'Master every nuance of basketball', points: 170 },
      { id: 'l8g10', name: 'College Test', description: 'Pass college readiness evaluation', points: 225, isTest: true }
    ]
  },
  {
    level: 9,
    name: 'Professional Prospect',
    description: 'Prepare for professional basketball',
    pointsRequired: 7405,
    goals: [
      { id: 'l9g1', name: 'Pro Potential', description: 'Show professional-level potential', points: 170 },
      { id: 'l9g2', name: 'Elite Defender', description: 'Become elite defensive player', points: 170 },
      { id: 'l9g3', name: 'Clutch God', description: 'Achieve legendary clutch status', points: 175 },
      { id: 'l9g4', name: 'System Creator', description: 'Create your own basketball system', points: 175 },
      { id: 'l9g5', name: 'Game Breaker', description: 'Break games with individual brilliance', points: 180 },
      { id: 'l9g6', name: 'Physical Specimen', description: 'Achieve peak physical condition', points: 180 },
      { id: 'l9g7', name: 'Draft Prospect', description: 'Become professional draft prospect', points: 185 },
      { id: 'l9g8', name: 'Champion Mind', description: 'Develop championship-level mentality', points: 185 },
      { id: 'l9g9', name: 'Basketball Artist', description: 'Turn basketball into art form', points: 190 },
      { id: 'l9g10', name: 'Pro Test', description: 'Pass professional readiness test', points: 250, isTest: true }
    ]
  },
  {
    level: 10,
    name: 'Basketball Legend',
    description: 'Achieve legendary basketball status',
    pointsRequired: 9155,
    goals: [
      { id: 'l10g1', name: 'Legendary Status', description: 'Achieve legendary basketball status', points: 190 },
      { id: 'l10g2', name: 'Defensive Legend', description: 'Become legendary defensive player', points: 190 },
      { id: 'l10g3', name: 'Clutch Immortal', description: 'Achieve immortal clutch status', points: 195 },
      { id: 'l10g4', name: 'Basketball Prophet', description: 'Predict and control game flow', points: 195 },
      { id: 'l10g5', name: 'Unstoppable Force', description: 'Become truly unstoppable player', points: 200 },
      { id: 'l10g6', name: 'Physical Perfection', description: 'Achieve perfect physical form', points: 200 },
      { id: 'l10g7', name: 'Hall of Fame', description: 'Earn Hall of Fame consideration', points: 205 },
      { id: 'l10g8', name: 'Legacy Builder', description: 'Build lasting basketball legacy', points: 205 },
      { id: 'l10g9', name: 'Basketball God', description: 'Transcend normal basketball limits', points: 210 },
      { id: 'l10g10', name: 'Legend Test', description: 'Pass ultimate basketball mastery test', points: 300, isTest: true }
    ]
  }
];

function getCurrentLevel(totalPoints: number) {
  for (let i = BASKETBALL_LEVELS.length - 1; i >= 0; i--) {
    if (totalPoints >= BASKETBALL_LEVELS[i].pointsRequired) {
      return {
        ...BASKETBALL_LEVELS[i],
        progressToNext: i < BASKETBALL_LEVELS.length - 1 ? 
          Math.min(100, ((totalPoints - BASKETBALL_LEVELS[i].pointsRequired) / 
          (BASKETBALL_LEVELS[i + 1].pointsRequired - BASKETBALL_LEVELS[i].pointsRequired)) * 100) : 100,
        pointsToNext: i < BASKETBALL_LEVELS.length - 1 ? 
          BASKETBALL_LEVELS[i + 1].pointsRequired - totalPoints : 0
      };
    }
  }
  return {
    ...BASKETBALL_LEVELS[0],
    progressToNext: (totalPoints / BASKETBALL_LEVELS[1].pointsRequired) * 100,
    pointsToNext: BASKETBALL_LEVELS[1].pointsRequired - totalPoints
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Handle case where there's no session (mock mode)
    if (!session?.user?.id) {
      console.log('No session found, using mock achievements data');
      
      const mockTotalPoints = 890; // Example: Level 3 player
      const currentLevel = getCurrentLevel(mockTotalPoints);
      
      // Return enhanced basketball-focused achievements data
      const mockAchievements = {
        unlockedAchievements: [
          {
            id: 'l1g1',
            name: 'First Dribble',
            description: 'Completed basic dribbling drill',
            icon: '🏀',
            category: 'LEVEL_1',
            points: 10,
            rarity: 'COMMON',
            unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 100
          },
          {
            id: 'l1g2',
            name: 'First Shot',
            description: 'Made your first basket',
            icon: '🎯',
            category: 'LEVEL_1',
            points: 10,
            rarity: 'COMMON',
            unlockedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 100
          },
          {
            id: 'l1g10',
            name: 'Rookie Test',
            description: 'Passed fundamentals skills test',
            icon: '✅',
            category: 'LEVEL_1',
            points: 50,
            rarity: 'UNCOMMON',
            unlockedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 100
          },
          {
            id: 'l2g1',
            name: 'Consistent Dribbling',
            description: 'Dribbled with both hands for 1 minute',
            icon: '🔄',
            category: 'LEVEL_2',
            points: 30,
            rarity: 'COMMON',
            unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 100
          },
          {
            id: 'l2g10',
            name: 'Development Test',
            description: 'Passed intermediate skills assessment',
            icon: '🏆',
            category: 'LEVEL_2',
            points: 75,
            rarity: 'RARE',
            unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 100
          },
          {
            id: 'l3g1',
            name: 'Advanced Dribbling',
            description: 'Mastered behind-the-back dribble',
            icon: '🌟',
            category: 'LEVEL_3',
            points: 50,
            rarity: 'UNCOMMON',
            unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 100
          }
        ],
        availableAchievements: currentLevel.goals.filter(goal => 
          !['l1g1', 'l1g2', 'l1g10', 'l2g1', 'l2g10', 'l3g1'].includes(goal.id)
        ).map(goal => ({
          id: goal.id,
          name: goal.name,
          description: goal.description,
          icon: goal.isTest ? '🎓' : '⭐',
          category: `LEVEL_${currentLevel.level}`,
          points: goal.points,
          rarity: goal.points >= 100 ? 'EPIC' : goal.points >= 50 ? 'RARE' : 'UNCOMMON',
          progress: Math.floor(Math.random() * 80), // Random progress for demo
          requirement: goal.description
        })),
        playerStats: {
          totalPoints: mockTotalPoints,
          currentLevel: currentLevel.level,
          levelName: currentLevel.name,
          progressToNextLevel: Math.floor(currentLevel.progressToNext),
          pointsToNextLevel: currentLevel.pointsToNext,
          totalAchievements: 6,
          availableAchievements: currentLevel.goals.length - 6,
          completionRate: Math.floor((6 / currentLevel.goals.length) * 100)
        },
        levelSystem: {
          currentLevel: currentLevel,
          allLevels: BASKETBALL_LEVELS.map(level => ({
            ...level,
            isUnlocked: mockTotalPoints >= level.pointsRequired,
            isCurrent: level.level === currentLevel.level
          }))
        },
        weeklyGoals: [
          {
            id: 'weekly-shooting-accuracy',
            name: 'Shooting Accuracy Master',
            description: 'Achieve 85% accuracy in 100 shots this week',
            icon: '🎯',
            category: 'SHOOTING',
            points: 50,
            progress: 67,
            target: 100,
            current: 67,
            timeLeft: '3 days',
            difficulty: 'MEDIUM'
          },
          {
            id: 'weekly-defensive-drills',
            name: 'Defensive Specialist',
            description: 'Complete 25 defensive drills this week',
            icon: '🛡️',
            category: 'DEFENSE',
            points: 45,
            progress: 48,
            target: 25,
            current: 12,
            timeLeft: '3 days',
            difficulty: 'MEDIUM'
          },
          {
            id: 'weekly-conditioning',
            name: 'Conditioning Beast',
            description: 'Complete 5 high-intensity conditioning sessions',
            icon: '💪',
            category: 'CONDITIONING',
            points: 60,
            progress: 40,
            target: 5,
            current: 2,
            timeLeft: '3 days',
            difficulty: 'HARD'
          },
          {
            id: 'weekly-ball-handling',
            name: 'Ball Handling Wizard',
            description: 'Master 3 new dribbling combinations',
            icon: '🪄',
            category: 'BALL_HANDLING',
            points: 40,
            progress: 33,
            target: 3,
            current: 1,
            timeLeft: '3 days',
            difficulty: 'MEDIUM'
          },
          {
            id: 'weekly-game-situations',
            name: 'Clutch Performer',
            description: 'Successfully complete 10 game-situation drills',
            icon: '⚡',
            category: 'GAME_SITUATIONS',
            points: 55,
            progress: 20,
            target: 10,
            current: 2,
            timeLeft: '3 days',
            difficulty: 'HARD'
          }
        ],
        recentActivity: [
          {
            type: 'ACHIEVEMENT_UNLOCKED',
            title: 'Advanced Dribbling',
            description: 'Mastered behind-the-back dribble',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            points: 50
          },
          {
            type: 'LEVEL_PROGRESS',
            title: 'Level 3 Progress',
            description: 'Completed goal: Mid-Range Shooting',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            points: 50
          },
          {
            type: 'WEEKLY_GOAL_PROGRESS',
            title: 'Weekly Goal Progress',
            description: 'Shooting Accuracy Master: 67/100 shots',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            points: 0
          }
        ]
      };

      return NextResponse.json(mockAchievements);
    }

    // Real implementation would go here for authenticated users
    // For now, return the mock data
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}
