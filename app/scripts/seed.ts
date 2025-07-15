
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🏀 Starting HoopsQuest database seeding...');

  // Load research data files
  const drillsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/basketball_drills_data.json'), 'utf-8'));
  const videosData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/basketball_videos_data.json'), 'utf-8'));
  const gamificationData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/gamification_content_data.json'), 'utf-8'));

  // 1. Seed Drills
  console.log('📚 Seeding basketball drills...');
  const drillsToCreate = drillsData.drills.map((drill: any) => {
    // Find corresponding video
    const video = videosData.videos.find((v: any) => v.drill_name === drill.name);
    
    return {
      name: drill.name,
      description: drill.description,
      category: drill.category,
      skillLevel: drill.skill_level,
      duration: drill.duration,
      equipment: JSON.stringify(drill.equipment || []),
      stepByStep: JSON.stringify(drill.step_by_step || []),
      coachingTips: JSON.stringify(drill.coaching_tips || []),
      videoUrl: video?.video_url || null,
      alternativeVideos: JSON.stringify(video?.alternative_videos || []),
    };
  });

  const createdDrills = await Promise.all(
    drillsToCreate.map(async (drill: any) => {
      return await prisma.drill.upsert({
        where: { name: drill.name },
        create: drill,
        update: drill,
      });
    })
  );

  console.log(`✅ Created ${createdDrills.length} drills`);

  // 2. Seed Achievements
  console.log('🏆 Seeding achievements...');
  const achievementsToCreate = [
    ...gamificationData.achievement_badges.skill_based,
    ...gamificationData.achievement_badges.effort_persistence,
    ...gamificationData.achievement_badges.teamwork_leadership,
    ...gamificationData.achievement_badges.milestone_achievements,
    ...gamificationData.achievement_badges.fun_creative,
  ].map((badge: any) => ({
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    criteria: badge.criteria,
    rarity: badge.rarity,
    points: getPointsForRarity(badge.rarity),
    category: getCategoryFromBadge(badge),
  }));

  const createdAchievements = await Promise.all(
    achievementsToCreate.map(async (achievement) => {
      return await prisma.achievement.upsert({
        where: { name: achievement.name },
        create: achievement,
        update: achievement,
      });
    })
  );

  console.log(`✅ Created ${createdAchievements.length} achievements`);

  // 3. Seed Challenges
  console.log('🎯 Seeding challenges...');
  const challengesToCreate = [
    ...gamificationData.gamification_mechanics.challenges.daily.map((c: any) => ({
      ...c,
      type: 'DAILY' as const,
      timeLimit: 24,
    })),
    ...gamificationData.gamification_mechanics.challenges.weekly.map((c: any) => ({
      ...c,
      type: 'WEEKLY' as const,
      timeLimit: 168,
    })),
    ...gamificationData.gamification_mechanics.challenges.monthly.map((c: any) => ({
      ...c,
      type: 'MONTHLY' as const,
      timeLimit: 720,
    })),
  ].map((challenge: any) => ({
    name: challenge.name,
    description: challenge.description,
    type: challenge.type,
    criteria: { description: challenge.description },
    reward: { description: challenge.reward },
    timeLimit: challenge.timeLimit,
    isActive: true,
  }));

  const createdChallenges = await Promise.all(
    challengesToCreate.map(async (challenge) => {
      return await prisma.challenge.upsert({
        where: { name: challenge.name },
        create: challenge,
        update: challenge,
      });
    })
  );

  console.log(`✅ Created ${createdChallenges.length} challenges`);

  // 4. Create test parent account
  console.log('👨‍👩‍👧‍👦 Creating test parent account...');
  const hashedPassword = await bcrypt.hash('johndoe123', 10);
  
  const testParent = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    create: {
      email: 'john@doe.com',
      name: 'John Doe',
      password: hashedPassword,
      role: 'PARENT',
    },
    update: {
      password: hashedPassword,
    },
  });

  console.log(`✅ Created test parent account: ${testParent.email}`);

  // 5. Create test player account
  console.log('👦 Creating test player account...');
  const testPlayer = await prisma.user.upsert({
    where: { email: 'player@test.com' },
    create: {
      email: 'player@test.com',
      name: 'Alex Johnson',
      password: hashedPassword,
      role: 'PLAYER',
      parentId: testParent.id,
      dateOfBirth: new Date('2015-05-15'), // 8 years old
    },
    update: {
      password: hashedPassword,
      parentId: testParent.id,
    },
  });

  // Create player profile
  await prisma.playerProfile.upsert({
    where: { userId: testPlayer.id },
    create: {
      userId: testPlayer.id,
      skillLevel: 'beginner',
      favoritePosition: 'Point Guard',
      totalPoints: 150,
      currentLevel: 'rookie',
      currentStreak: 3,
      longestStreak: 5,
      lastActiveDate: new Date(),
      goals: {
        daily: 'Practice for 30 minutes',
        weekly: 'Complete 5 different drills',
        monthly: 'Improve shooting accuracy by 10%',
      },
      preferences: {
        reminderTime: '16:00',
        favoriteCategories: ['shooting', 'dribbling'],
      },
    },
    update: {},
  });

  console.log(`✅ Created test player account: ${testPlayer.email}`);

  // 6. Create some sample schedule entries for the test player
  console.log('📅 Creating sample schedule entries...');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sampleSchedules = [
    {
      userId: testPlayer.id,
      date: today,
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0), // 4 PM
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 30), // 4:30 PM
      drillId: createdDrills[0].id,
      status: 'SCHEDULED' as const,
      notes: 'Focus on form and fundamentals',
    },
    {
      userId: testPlayer.id,
      date: tomorrow,
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 0),
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 17, 0),
      drillId: createdDrills[1].id,
      status: 'SCHEDULED' as const,
      notes: 'Practice shooting from different positions',
    },
  ];

  await Promise.all(
    sampleSchedules.map(async (schedule) => {
      return await prisma.scheduleEntry.create({
        data: schedule,
      });
    })
  );

  console.log(`✅ Created ${sampleSchedules.length} sample schedule entries`);

  console.log('🎉 Database seeding completed successfully!');
  console.log(`
📊 Summary:
- ${createdDrills.length} basketball drills
- ${createdAchievements.length} achievements
- ${createdChallenges.length} challenges
- 1 test parent account (john@doe.com)
- 1 test player account (player@test.com)
- ${sampleSchedules.length} sample schedule entries
  `);
}

function getPointsForRarity(rarity: string): number {
  switch (rarity) {
    case 'starter': return 25;
    case 'common': return 50;
    case 'uncommon': return 100;
    case 'rare': return 200;
    case 'legendary': return 500;
    default: return 50;
  }
}

function getCategoryFromBadge(badge: any): string {
  if (badge.name.includes('Shoot') || badge.name.includes('Basket')) return 'shooting';
  if (badge.name.includes('Dribble')) return 'dribbling';
  if (badge.name.includes('Pass') || badge.name.includes('Assist')) return 'passing';
  if (badge.name.includes('Defense')) return 'defense';
  if (badge.name.includes('Team') || badge.name.includes('Help')) return 'teamwork';
  if (badge.name.includes('Practice') || badge.name.includes('Day')) return 'effort';
  return 'general';
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
