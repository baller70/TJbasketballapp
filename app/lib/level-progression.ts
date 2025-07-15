export interface LevelGoal {
  id: string;
  description: string;
  target: number;
  icon: string;
  category: 'drills' | 'points' | 'streak' | 'skills' | 'teamwork' | 'consistency';
}

export interface LevelTier {
  level: number;
  name: string;
  pointsRequired: number;
  nextLevelPoints: number | null;
  goals: LevelGoal[];
  rewards: string[];
  description: string;
  color: string;
  icon: string;
}

export const LEVEL_PROGRESSION: LevelTier[] = [
  {
    level: 1,
    name: 'Rookie',
    pointsRequired: 0,
    nextLevelPoints: 100,
    description: 'Start your basketball journey with basic fundamentals',
    color: 'bg-gray-100 text-gray-800',
    icon: '🏀',
    goals: [
      {
        id: 'first-drill',
        description: 'Complete your first drill',
        target: 1,
        icon: '🎯',
        category: 'drills'
      },
      {
        id: 'basic-practice',
        description: 'Practice for 3 different days',
        target: 3,
        icon: '📅',
        category: 'consistency'
      },
      {
        id: 'learn-basics',
        description: 'Try 3 different drill categories',
        target: 3,
        icon: '📚',
        category: 'skills'
      }
    ],
    rewards: [
      'Basic drill library access',
      'Practice timer',
      'Progress tracking'
    ]
  },
  {
    level: 2,
    name: 'Beginner',
    pointsRequired: 100,
    nextLevelPoints: 300,
    description: 'Build consistency and explore different basketball skills',
    color: 'bg-blue-100 text-blue-800',
    icon: '⭐',
    goals: [
      {
        id: 'drill-completion',
        description: 'Complete 10 drills total',
        target: 10,
        icon: '✅',
        category: 'drills'
      },
      {
        id: 'first-streak',
        description: 'Achieve a 3-day practice streak',
        target: 3,
        icon: '🔥',
        category: 'streak'
      },
      {
        id: 'skill-variety',
        description: 'Try all 5 skill categories',
        target: 5,
        icon: '🎨',
        category: 'skills'
      }
    ],
    rewards: [
      'Intermediate drills unlocked',
      'Skill tracking enabled',
      'Weekly goal setting'
    ]
  },
  {
    level: 3,
    name: 'Learner',
    pointsRequired: 300,
    nextLevelPoints: 600,
    description: 'Develop regular practice habits and improve technique',
    color: 'bg-green-100 text-green-800',
    icon: '🌱',
    goals: [
      {
        id: 'consistent-practice',
        description: 'Practice 15 times total',
        target: 15,
        icon: '💪',
        category: 'consistency'
      },
      {
        id: 'quality-focus',
        description: 'Get 5 perfect ratings (5-star)',
        target: 5,
        icon: '⭐',
        category: 'skills'
      },
      {
        id: 'week-streak',
        description: 'Achieve a 7-day practice streak',
        target: 7,
        icon: '📅',
        category: 'streak'
      }
    ],
    rewards: [
      'Advanced drill techniques',
      'Performance analytics',
      'Custom workout builder'
    ]
  },
  {
    level: 4,
    name: 'Player',
    pointsRequired: 600,
    nextLevelPoints: 1000,
    description: 'Establish strong fundamentals and consistent improvement',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '🏆',
    goals: [
      {
        id: 'skill-mastery',
        description: 'Complete 25 drills total',
        target: 25,
        icon: '🎯',
        category: 'drills'
      },
      {
        id: 'points-milestone',
        description: 'Earn 600 total points',
        target: 600,
        icon: '💎',
        category: 'points'
      },
      {
        id: 'improvement-focus',
        description: 'Get 10 perfect ratings',
        target: 10,
        icon: '⭐',
        category: 'skills'
      }
    ],
    rewards: [
      'Team challenges unlocked',
      'Video analysis tools',
      'Achievement badges'
    ]
  },
  {
    level: 5,
    name: 'Skilled',
    pointsRequired: 1000,
    nextLevelPoints: 1500,
    description: 'Master intermediate skills and help teammates grow',
    color: 'bg-purple-100 text-purple-800',
    icon: '🎖️',
    goals: [
      {
        id: 'drill-expert',
        description: 'Complete 40 drills total',
        target: 40,
        icon: '🏅',
        category: 'drills'
      },
      {
        id: 'streak-master',
        description: 'Achieve a 10-day practice streak',
        target: 10,
        icon: '🔥',
        category: 'streak'
      },
      {
        id: 'team-helper',
        description: 'Help teammates 5 times',
        target: 5,
        icon: '🤝',
        category: 'teamwork'
      }
    ],
    rewards: [
      'Advanced skill tutorials',
      'Mentor privileges',
      'Team leadership roles'
    ]
  },
  {
    level: 6,
    name: 'Advanced',
    pointsRequired: 1500,
    nextLevelPoints: 2200,
    description: 'Excel in advanced techniques and become a role model',
    color: 'bg-orange-100 text-orange-800',
    icon: '🥇',
    goals: [
      {
        id: 'mastery-drills',
        description: 'Complete 60 drills total',
        target: 60,
        icon: '🎯',
        category: 'drills'
      },
      {
        id: 'excellence-streak',
        description: 'Get 20 perfect ratings',
        target: 20,
        icon: '⭐',
        category: 'skills'
      },
      {
        id: 'consistency-champion',
        description: 'Achieve a 14-day practice streak',
        target: 14,
        icon: '📅',
        category: 'streak'
      }
    ],
    rewards: [
      'Expert-level content',
      'Performance coaching tips',
      'Custom drill creation'
    ]
  },
  {
    level: 7,
    name: 'Expert',
    pointsRequired: 2200,
    nextLevelPoints: 3000,
    description: 'Demonstrate mastery and exceptional dedication',
    color: 'bg-red-100 text-red-800',
    icon: '💫',
    goals: [
      {
        id: 'expert-completion',
        description: 'Complete 80 drills total',
        target: 80,
        icon: '🏆',
        category: 'drills'
      },
      {
        id: 'points-expert',
        description: 'Earn 2200 total points',
        target: 2200,
        icon: '💎',
        category: 'points'
      },
      {
        id: 'leadership-impact',
        description: 'Help teammates 10 times',
        target: 10,
        icon: '👑',
        category: 'teamwork'
      }
    ],
    rewards: [
      'Master coach insights',
      'Leadership certification',
      'Special recognition'
    ]
  },
  {
    level: 8,
    name: 'Star',
    pointsRequired: 3000,
    nextLevelPoints: 4000,
    description: 'Shine as an elite player with exceptional skills',
    color: 'bg-indigo-100 text-indigo-800',
    icon: '⭐',
    goals: [
      {
        id: 'star-dedication',
        description: 'Complete 100 drills total',
        target: 100,
        icon: '🌟',
        category: 'drills'
      },
      {
        id: 'perfect-streak',
        description: 'Achieve a 21-day practice streak',
        target: 21,
        icon: '🔥',
        category: 'streak'
      },
      {
        id: 'excellence-master',
        description: 'Get 30 perfect ratings',
        target: 30,
        icon: '💯',
        category: 'skills'
      }
    ],
    rewards: [
      'Elite training programs',
      'Hall of Fame recognition',
      'Special avatar items'
    ]
  },
  {
    level: 9,
    name: 'Champion',
    pointsRequired: 4000,
    nextLevelPoints: 5000,
    description: 'Dominate with championship-level performance',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '🏆',
    goals: [
      {
        id: 'champion-mastery',
        description: 'Complete 125 drills total',
        target: 125,
        icon: '👑',
        category: 'drills'
      },
      {
        id: 'champion-points',
        description: 'Earn 4000 total points',
        target: 4000,
        icon: '💎',
        category: 'points'
      },
      {
        id: 'team-champion',
        description: 'Help teammates 15 times',
        target: 15,
        icon: '🤝',
        category: 'teamwork'
      }
    ],
    rewards: [
      'Championship content',
      'Mentor certification',
      'Legacy recognition'
    ]
  },
  {
    level: 10,
    name: 'Legend',
    pointsRequired: 5000,
    nextLevelPoints: null,
    description: 'Join the legends with unmatched dedication and skill',
    color: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
    icon: '👑',
    goals: [
      {
        id: 'legend-dedication',
        description: 'Complete 150 drills total',
        target: 150,
        icon: '🏅',
        category: 'drills'
      },
      {
        id: 'legend-consistency',
        description: 'Achieve a 30-day practice streak',
        target: 30,
        icon: '🔥',
        category: 'streak'
      },
      {
        id: 'legend-excellence',
        description: 'Get 50 perfect ratings',
        target: 50,
        icon: '💯',
        category: 'skills'
      }
    ],
    rewards: [
      'All content unlocked',
      'Legend Hall of Fame',
      'Ultimate recognition',
      'Special privileges'
    ]
  }
];

export function getCurrentLevel(points: number): LevelTier {
  // Find the highest level the user has reached
  let currentLevel = LEVEL_PROGRESSION[0];
  
  for (const level of LEVEL_PROGRESSION) {
    if (points >= level.pointsRequired) {
      currentLevel = level;
    } else {
      break;
    }
  }
  
  return currentLevel;
}

export function getNextLevel(points: number): LevelTier | null {
  const currentLevel = getCurrentLevel(points);
  const currentIndex = LEVEL_PROGRESSION.findIndex(l => l.level === currentLevel.level);
  
  if (currentIndex < LEVEL_PROGRESSION.length - 1) {
    return LEVEL_PROGRESSION[currentIndex + 1];
  }
  
  return null; // Already at max level
}

export function getProgressToNextLevel(points: number): {
  current: number;
  required: number;
  percentage: number;
} {
  const currentLevel = getCurrentLevel(points);
  const nextLevel = getNextLevel(points);
  
  if (!nextLevel) {
    return {
      current: points,
      required: points,
      percentage: 100
    };
  }
  
  const current = points - currentLevel.pointsRequired;
  const required = nextLevel.pointsRequired - currentLevel.pointsRequired;
  const percentage = (current / required) * 100;
  
  return {
    current,
    required,
    percentage: Math.min(percentage, 100)
  };
}

export function getLevelGoalProgress(
  levelGoals: LevelGoal[],
  userStats: {
    totalDrills: number;
    totalPoints: number;
    currentStreak: number;
    perfectRatings: number;
    teamworkActions: number;
    practiceDays: number;
    skillCategories: number;
  }
): Array<LevelGoal & { progress: number; completed: boolean }> {
  return levelGoals.map(goal => {
    let progress = 0;
    
    switch (goal.category) {
      case 'drills':
        progress = userStats.totalDrills;
        break;
      case 'points':
        progress = userStats.totalPoints;
        break;
      case 'streak':
        progress = userStats.currentStreak;
        break;
      case 'skills':
        if (goal.id === 'learn-basics' || goal.id === 'skill-variety') {
          progress = userStats.skillCategories;
        } else {
          progress = userStats.perfectRatings;
        }
        break;
      case 'teamwork':
        progress = userStats.teamworkActions;
        break;
      case 'consistency':
        if (goal.id === 'basic-practice') {
          progress = userStats.practiceDays;
        } else {
          progress = userStats.totalDrills;
        }
        break;
    }
    
    return {
      ...goal,
      progress,
      completed: progress >= goal.target
    };
  });
} 