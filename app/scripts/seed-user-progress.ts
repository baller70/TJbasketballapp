import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedUserProgress() {
  console.log('📊 Seeding user progress...');

  // Get the test player
  const testPlayer = await prisma.user.findFirst({
    where: { email: 'player@test.com' }
  });

  if (!testPlayer) {
    console.log('❌ Test player not found. Please run the main seed script first.');
    return;
  }

  // Get all levels with their goals
  const levels = await prisma.level.findMany({
    include: { goals: true },
    orderBy: { levelNumber: 'asc' }
  });

  if (levels.length === 0) {
    console.log('❌ No levels found. Please run the reward system seed script first.');
    return;
  }

  // Create user level progress
  const userLevels = [
    {
      userId: testPlayer.id,
      levelId: levels[0].id, // Level 1
      status: 'COMPLETED' as const,
      progress: 100,
      completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // Completed 20 days ago
    },
    {
      userId: testPlayer.id,
      levelId: levels[1].id, // Level 2
      status: 'COMPLETED' as const,
      progress: 100,
      completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // Completed 15 days ago
    },
    {
      userId: testPlayer.id,
      levelId: levels[2].id, // Level 3
      status: 'IN_PROGRESS' as const,
      progress: 70,
      startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Started 10 days ago
    },
    {
      userId: testPlayer.id,
      levelId: levels[3].id, // Level 4
      status: 'UNLOCKED' as const,
      progress: 0,
    },
    {
      userId: testPlayer.id,
      levelId: levels[4].id, // Level 5
      status: 'LOCKED' as const,
      progress: 0,
    },
  ];

  // Create user levels
  for (const userLevel of userLevels) {
    await prisma.userLevel.upsert({
      where: {
        userId_levelId: {
          userId: userLevel.userId,
          levelId: userLevel.levelId,
        },
      },
      create: userLevel,
      update: userLevel,
    });
  }

  console.log(`✅ Created ${userLevels.length} user levels`);

  // Create user goal progress
  const userGoals = [];
  
  // Level 1 goals - all completed
  for (const goal of levels[0].goals) {
    userGoals.push({
      userId: testPlayer.id,
      goalId: goal.id,
      status: 'COMPLETED' as const,
      progress: 100,
      pointsEarned: goal.points,
      completedAt: new Date(Date.now() - (Math.random() * 20 + 15) * 24 * 60 * 60 * 1000),
    });
  }

  // Level 2 goals - all completed
  for (const goal of levels[1].goals) {
    userGoals.push({
      userId: testPlayer.id,
      goalId: goal.id,
      status: 'COMPLETED' as const,
      progress: 100,
      pointsEarned: goal.points,
      completedAt: new Date(Date.now() - (Math.random() * 15 + 10) * 24 * 60 * 60 * 1000),
    });
  }

  // Level 3 goals - some completed, some in progress
  const level3Goals = levels[2].goals;
  for (let i = 0; i < level3Goals.length; i++) {
    const goal = level3Goals[i];
    if (i < 7) {
      // First 7 goals completed
      userGoals.push({
        userId: testPlayer.id,
        goalId: goal.id,
        status: 'COMPLETED' as const,
        progress: 100,
        pointsEarned: goal.points,
        completedAt: new Date(Date.now() - (Math.random() * 10 + 5) * 24 * 60 * 60 * 1000),
      });
    } else if (i === 7) {
      // 8th goal in progress
      userGoals.push({
        userId: testPlayer.id,
        goalId: goal.id,
        status: 'IN_PROGRESS' as const,
        progress: 60,
        pointsEarned: 0,
        startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      });
    } else if (i === 8) {
      // 9th goal unlocked
      userGoals.push({
        userId: testPlayer.id,
        goalId: goal.id,
        status: 'UNLOCKED' as const,
        progress: 0,
        pointsEarned: 0,
      });
    } else {
      // 10th goal (level test) locked
      userGoals.push({
        userId: testPlayer.id,
        goalId: goal.id,
        status: 'LOCKED' as const,
        progress: 0,
        pointsEarned: 0,
      });
    }
  }

  // Level 4 goals - all unlocked but not started
  for (const goal of levels[3].goals) {
    userGoals.push({
      userId: testPlayer.id,
      goalId: goal.id,
      status: 'UNLOCKED' as const,
      progress: 0,
      pointsEarned: 0,
    });
  }

  // Create user goals
  for (const userGoal of userGoals) {
    await prisma.userGoal.upsert({
      where: {
        userId_goalId: {
          userId: userGoal.userId,
          goalId: userGoal.goalId,
        },
      },
      create: userGoal,
      update: userGoal,
    });
  }

  console.log(`✅ Created ${userGoals.length} user goals`);

  // Get weekly goals
  const weeklyGoals = await prisma.weeklyGoal.findMany({
    where: { isActive: true }
  });

  // Create user weekly goals
  const userWeeklyGoals = [];
  for (let i = 0; i < weeklyGoals.length; i++) {
    const weeklyGoal = weeklyGoals[i];
    const statuses = ['ACTIVE', 'COMPLETED', 'ACTIVE', 'ACTIVE'];
    const progresses = [75, 100, 40, 90];
    
    userWeeklyGoals.push({
      userId: testPlayer.id,
      weeklyGoalId: weeklyGoal.id,
      status: statuses[i] as 'ACTIVE' | 'COMPLETED',
      progress: progresses[i],
      pointsEarned: statuses[i] === 'COMPLETED' ? weeklyGoal.points : 0,
      startedAt: new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000),
      completedAt: statuses[i] === 'COMPLETED' ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : null,
    });
  }

  // Create user weekly goals
  for (const userWeeklyGoal of userWeeklyGoals) {
    await prisma.userWeeklyGoal.upsert({
      where: {
        userId_weeklyGoalId: {
          userId: userWeeklyGoal.userId,
          weeklyGoalId: userWeeklyGoal.weeklyGoalId,
        },
      },
      create: userWeeklyGoal,
      update: userWeeklyGoal,
    });
  }

  console.log(`✅ Created ${userWeeklyGoals.length} user weekly goals`);

  // Update player profile with total points
  const totalPoints = userGoals.reduce((sum, goal) => sum + goal.pointsEarned, 0) + 
                     userWeeklyGoals.reduce((sum, goal) => sum + goal.pointsEarned, 0);

  await prisma.playerProfile.update({
    where: { userId: testPlayer.id },
    data: { 
      totalPoints,
      currentLevel: 'rising-player', // Level 3 in progress
    },
  });

  console.log(`✅ Updated player profile with ${totalPoints} total points`);
  console.log('🎉 User progress seeded successfully!');
}

async function main() {
  try {
    await seedUserProgress();
  } catch (error) {
    console.error('Error seeding user progress:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 