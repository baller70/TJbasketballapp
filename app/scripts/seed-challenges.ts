import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedUserChallenges() {
  console.log('🎯 Seeding user challenges...');

  // Get the test player
  const testPlayer = await prisma.user.findFirst({
    where: { email: 'player@test.com' }
  });

  if (!testPlayer) {
    console.log('❌ Test player not found. Please run the main seed script first.');
    return;
  }

  // Get all challenges
  const challenges = await prisma.challenge.findMany();
  
  if (challenges.length === 0) {
    console.log('❌ No challenges found. Please run the main seed script first.');
    return;
  }

  // Create user challenges with different statuses
  const userChallenges = [
    {
      userId: testPlayer.id,
      challengeId: challenges[0].id, // Perfect Form
      status: 'ACTIVE' as const,
      progress: 60,
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Started 2 hours ago
    },
    {
      userId: testPlayer.id,
      challengeId: challenges[1].id, // Speed Challenge
      status: 'ACTIVE' as const,
      progress: 25,
      startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // Started 6 hours ago
    },
    {
      userId: testPlayer.id,
      challengeId: challenges[2].id, // Helper Hero
      status: 'COMPLETED' as const,
      progress: 100,
      startedAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // Started 20 hours ago
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Completed 2 hours ago
    },
    {
      userId: testPlayer.id,
      challengeId: challenges[3].id, // Skill Explorer
      status: 'ACTIVE' as const,
      progress: 33,
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Started 2 days ago
    },
    {
      userId: testPlayer.id,
      challengeId: challenges[4].id, // Consistency Master
      status: 'ACTIVE' as const,
      progress: 71,
      startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Started 5 days ago
    },
    {
      userId: testPlayer.id,
      challengeId: challenges[5].id, // Champion's Journey
      status: 'ACTIVE' as const,
      progress: 15,
      startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Started 10 days ago
    },
  ];

  // Create user challenges
  for (const userChallenge of userChallenges) {
    await prisma.userChallenge.upsert({
      where: {
        userId_challengeId: {
          userId: userChallenge.userId,
          challengeId: userChallenge.challengeId,
        },
      },
      create: userChallenge,
      update: userChallenge,
    });
  }

  console.log(`✅ Created ${userChallenges.length} user challenges`);
  console.log('🎉 User challenges seeded successfully!');
}

async function main() {
  try {
    await seedUserChallenges();
  } catch (error) {
    console.error('Error seeding user challenges:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 