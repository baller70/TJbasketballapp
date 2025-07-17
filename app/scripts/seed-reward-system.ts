import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rewardSystemData = {
  levels: [
    {
      levelNumber: 1,
      name: "Rookie Explorer",
      description: "Begin your basketball journey with basic fundamentals",
      pointsRequired: 0,
      badgeIcon: "🏀",
      badgeColor: "#10B981",
      rewards: { badge: "Rookie Badge", unlocks: ["Basic drills", "Beginner tips"] },
      goals: [
        { name: "First Dribble", description: "Successfully dribble the ball 10 times", type: "DRILL_COMPLETION", criteria: { drillType: "dribbling", count: 10 }, points: 50 },
        { name: "Basic Shooting", description: "Make 5 shots from close range", type: "SKILL_PRACTICE", criteria: { skillType: "shooting", shots: 5 }, points: 75 },
        { name: "Practice Streak", description: "Practice for 3 consecutive days", type: "STREAK_MAINTENANCE", criteria: { days: 3 }, points: 100 },
        { name: "Form Focus", description: "Complete 2 form shooting drills", type: "DRILL_COMPLETION", criteria: { drillCategory: "shooting", focus: "form" }, points: 60 },
        { name: "Ball Handling", description: "Master basic ball control exercises", type: "SKILL_PRACTICE", criteria: { skillType: "ball_handling", exercises: 3 }, points: 80 },
        { name: "Team Spirit", description: "Encourage a teammate during practice", type: "TEAM_PARTICIPATION", criteria: { action: "encourage" }, points: 40 },
        { name: "Consistency", description: "Complete 5 practice sessions", type: "DRILL_COMPLETION", criteria: { sessions: 5 }, points: 90 },
        { name: "Skill Variety", description: "Try 3 different skill categories", type: "SKILL_PRACTICE", criteria: { categories: 3 }, points: 70 },
        { name: "Progress Tracking", description: "Log your improvement for 1 week", type: "IMPROVEMENT_TRACKING", criteria: { duration: "1 week" }, points: 85 },
        { name: "Rookie Test", description: "Complete basic skills assessment", type: "LEVEL_TEST", criteria: { test: "basic_skills" }, points: 150, isLevelTest: true }
      ]
    },
    {
      levelNumber: 2,
      name: "Rising Player",
      description: "Develop intermediate skills and build confidence",
      pointsRequired: 600,
      badgeIcon: "⭐",
      badgeColor: "#F59E0B",
      rewards: { badge: "Rising Star Badge", unlocks: ["Intermediate drills", "Skill tracking"] },
      goals: [
        { name: "Shooting Accuracy", description: "Make 10 shots with 70% accuracy", type: "SKILL_PRACTICE", criteria: { skillType: "shooting", accuracy: 70, shots: 10 }, points: 100 },
        { name: "Dribbling Mastery", description: "Complete advanced dribbling patterns", type: "DRILL_COMPLETION", criteria: { drillType: "dribbling", level: "advanced" }, points: 120 },
        { name: "Passing Precision", description: "Complete 15 accurate passes", type: "SKILL_PRACTICE", criteria: { skillType: "passing", accuracy: 80, passes: 15 }, points: 110 },
        { name: "Defensive Stance", description: "Master defensive positioning drills", type: "DRILL_COMPLETION", criteria: { drillType: "defense", focus: "stance" }, points: 90 },
        { name: "Endurance Build", description: "Complete 20-minute conditioning session", type: "DRILL_COMPLETION", criteria: { drillType: "conditioning", duration: 20 }, points: 130 },
        { name: "Game Situation", description: "Practice game-like scenarios", type: "SKILL_PRACTICE", criteria: { scenarios: 3 }, points: 140 },
        { name: "Weekly Challenge", description: "Complete all weekly goals", type: "CUSTOM_CHALLENGE", criteria: { weekly_goals: "complete" }, points: 160 },
        { name: "Skill Combination", description: "Combine dribbling and shooting", type: "SKILL_PRACTICE", criteria: { combo: ["dribbling", "shooting"] }, points: 150 },
        { name: "Practice Leadership", description: "Help teach a skill to someone", type: "TEAM_PARTICIPATION", criteria: { action: "teach" }, points: 80 },
        { name: "Player Assessment", description: "Complete intermediate skills test", type: "LEVEL_TEST", criteria: { test: "intermediate_skills" }, points: 200, isLevelTest: true }
      ]
    },
    {
      levelNumber: 3,
      name: "Skilled Competitor",
      description: "Refine techniques and develop competitive edge",
      pointsRequired: 1500,
      badgeIcon: "🔥",
      badgeColor: "#EF4444",
      rewards: { badge: "Competitor Badge", unlocks: ["Advanced drills", "Performance analytics"] },
      goals: [
        { name: "Three-Point Challenge", description: "Make 5 three-point shots", type: "SKILL_PRACTICE", criteria: { skillType: "shooting", range: "three_point", shots: 5 }, points: 180 },
        { name: "Speed Dribbling", description: "Complete speed dribbling course in under 30 seconds", type: "DRILL_COMPLETION", criteria: { drillType: "dribbling", time_limit: 30 }, points: 160 },
        { name: "Defensive Pressure", description: "Practice defense under pressure", type: "DRILL_COMPLETION", criteria: { drillType: "defense", pressure: true }, points: 170 },
        { name: "Rebounding Power", description: "Secure 10 rebounds in practice", type: "SKILL_PRACTICE", criteria: { skillType: "rebounding", rebounds: 10 }, points: 150 },
        { name: "Footwork Finesse", description: "Master advanced footwork patterns", type: "DRILL_COMPLETION", criteria: { drillType: "footwork", level: "advanced" }, points: 140 },
        { name: "Game Strategy", description: "Learn and apply 3 basketball strategies", type: "SKILL_PRACTICE", criteria: { strategies: 3 }, points: 190 },
        { name: "Consistency Streak", description: "Maintain 7-day practice streak", type: "STREAK_MAINTENANCE", criteria: { days: 7 }, points: 200 },
        { name: "Skill Mastery", description: "Achieve 90% accuracy in chosen skill", type: "SKILL_PRACTICE", criteria: { accuracy: 90 }, points: 220 },
        { name: "Team Captain", description: "Lead a practice session", type: "TEAM_PARTICIPATION", criteria: { action: "lead" }, points: 180 },
        { name: "Competitor Evaluation", description: "Complete advanced skills assessment", type: "LEVEL_TEST", criteria: { test: "advanced_skills" }, points: 300, isLevelTest: true }
      ]
    },
    {
      levelNumber: 4,
      name: "Court General",
      description: "Develop leadership and advanced game understanding",
      pointsRequired: 3000,
      badgeIcon: "👑",
      badgeColor: "#8B5CF6",
      rewards: { badge: "General Badge", unlocks: ["Leadership challenges", "Advanced strategies"] },
      goals: [
        { name: "Playmaker", description: "Execute 10 successful plays", type: "SKILL_PRACTICE", criteria: { skillType: "playmaking", plays: 10 }, points: 250 },
        { name: "Clutch Performance", description: "Make game-winning shots under pressure", type: "SKILL_PRACTICE", criteria: { pressure: true, shots: 3 }, points: 280 },
        { name: "All-Around Skills", description: "Excel in all 5 major skill areas", type: "SKILL_PRACTICE", criteria: { skills: 5, proficiency: "high" }, points: 300 },
        { name: "Mental Toughness", description: "Overcome 3 challenging scenarios", type: "CUSTOM_CHALLENGE", criteria: { scenarios: 3, difficulty: "high" }, points: 220 },
        { name: "Court Vision", description: "Make 15 assists in practice games", type: "SKILL_PRACTICE", criteria: { skillType: "passing", assists: 15 }, points: 260 },
        { name: "Defensive Anchor", description: "Prevent 10 scoring attempts", type: "SKILL_PRACTICE", criteria: { skillType: "defense", stops: 10 }, points: 240 },
        { name: "Conditioning Peak", description: "Complete advanced fitness test", type: "DRILL_COMPLETION", criteria: { test: "fitness", level: "advanced" }, points: 200 },
        { name: "Team Builder", description: "Organize and lead team activities", type: "TEAM_PARTICIPATION", criteria: { action: "organize", activities: 2 }, points: 180 },
        { name: "Strategic Mind", description: "Develop and implement game plan", type: "SKILL_PRACTICE", criteria: { strategy: "game_plan" }, points: 320 },
        { name: "General's Challenge", description: "Complete leadership assessment", type: "LEVEL_TEST", criteria: { test: "leadership" }, points: 400, isLevelTest: true }
      ]
    },
    {
      levelNumber: 5,
      name: "Elite Performer",
      description: "Master advanced techniques and competitive excellence",
      pointsRequired: 5000,
      badgeIcon: "💎",
      badgeColor: "#06B6D4",
      rewards: { badge: "Elite Badge", unlocks: ["Elite drills", "Performance optimization"] },
      goals: [
        { name: "Precision Shooting", description: "Achieve 95% accuracy from free throw line", type: "SKILL_PRACTICE", criteria: { skillType: "shooting", accuracy: 95, shots: 20 }, points: 350 },
        { name: "Advanced Moves", description: "Master 5 signature basketball moves", type: "SKILL_PRACTICE", criteria: { moves: 5, mastery: true }, points: 400 },
        { name: "Game Control", description: "Control game tempo for full session", type: "SKILL_PRACTICE", criteria: { control: "tempo", duration: "full" }, points: 380 },
        { name: "Pressure Performance", description: "Excel under maximum pressure", type: "CUSTOM_CHALLENGE", criteria: { pressure: "maximum", performance: "excel" }, points: 420 },
        { name: "Versatility", description: "Play effectively in all 5 positions", type: "SKILL_PRACTICE", criteria: { positions: 5, effectiveness: "high" }, points: 450 },
        { name: "Championship Mindset", description: "Demonstrate winning mentality", type: "IMPROVEMENT_TRACKING", criteria: { mindset: "championship" }, points: 300 },
        { name: "Peak Conditioning", description: "Achieve elite fitness standards", type: "DRILL_COMPLETION", criteria: { fitness: "elite" }, points: 350 },
        { name: "Mentor Role", description: "Successfully mentor 3 junior players", type: "TEAM_PARTICIPATION", criteria: { action: "mentor", players: 3 }, points: 280 },
        { name: "Innovation", description: "Create and teach new drill or technique", type: "CUSTOM_CHALLENGE", criteria: { innovation: true }, points: 500 },
        { name: "Elite Assessment", description: "Complete elite performance evaluation", type: "LEVEL_TEST", criteria: { test: "elite_performance" }, points: 600, isLevelTest: true }
      ]
    },
    {
      levelNumber: 6,
      name: "Master Craftsman",
      description: "Perfect your craft and inspire others",
      pointsRequired: 8000,
      badgeIcon: "🎯",
      badgeColor: "#DC2626",
      rewards: { badge: "Master Badge", unlocks: ["Master techniques", "Teaching privileges"] },
      goals: [
        { name: "Flawless Execution", description: "Perform 25 perfect skill demonstrations", type: "SKILL_PRACTICE", criteria: { demonstrations: 25, quality: "perfect" }, points: 500 },
        { name: "Signature Style", description: "Develop your unique playing style", type: "SKILL_PRACTICE", criteria: { style: "unique", development: true }, points: 550 },
        { name: "Consistency Master", description: "Maintain peak performance for 2 weeks", type: "STREAK_MAINTENANCE", criteria: { performance: "peak", duration: 14 }, points: 600 },
        { name: "Advanced Teaching", description: "Teach advanced techniques to others", type: "TEAM_PARTICIPATION", criteria: { action: "teach_advanced", students: 5 }, points: 450 },
        { name: "Tactical Genius", description: "Master complex game strategies", type: "SKILL_PRACTICE", criteria: { strategies: "complex", mastery: true }, points: 580 },
        { name: "Physical Excellence", description: "Achieve perfect physical conditioning", type: "DRILL_COMPLETION", criteria: { conditioning: "perfect" }, points: 400 },
        { name: "Mental Fortitude", description: "Overcome 5 major challenges", type: "CUSTOM_CHALLENGE", criteria: { challenges: 5, difficulty: "major" }, points: 520 },
        { name: "Legacy Building", description: "Create lasting impact on team/community", type: "TEAM_PARTICIPATION", criteria: { impact: "lasting" }, points: 480 },
        { name: "Skill Integration", description: "Seamlessly combine all learned skills", type: "SKILL_PRACTICE", criteria: { integration: "seamless" }, points: 650 },
        { name: "Master's Trial", description: "Complete comprehensive mastery test", type: "LEVEL_TEST", criteria: { test: "mastery" }, points: 800, isLevelTest: true }
      ]
    },
    {
      levelNumber: 7,
      name: "Champion Contender",
      description: "Compete at the highest level with championship potential",
      pointsRequired: 12000,
      badgeIcon: "🏆",
      badgeColor: "#F59E0B",
      rewards: { badge: "Champion Badge", unlocks: ["Championship training", "Elite competition"] },
      goals: [
        { name: "Championship Performance", description: "Perform at championship level consistently", type: "SKILL_PRACTICE", criteria: { level: "championship", consistency: true }, points: 700 },
        { name: "Clutch Master", description: "Excel in 10 high-pressure situations", type: "SKILL_PRACTICE", criteria: { pressure: "high", situations: 10 }, points: 650 },
        { name: "Complete Domination", description: "Dominate in chosen specialty", type: "SKILL_PRACTICE", criteria: { domination: true, specialty: "chosen" }, points: 800 },
        { name: "Team Elevater", description: "Elevate entire team's performance", type: "TEAM_PARTICIPATION", criteria: { action: "elevate", scope: "team" }, points: 600 },
        { name: "Strategic Mastery", description: "Master all aspects of game strategy", type: "SKILL_PRACTICE", criteria: { strategy: "all_aspects", mastery: true }, points: 750 },
        { name: "Inspirational Leader", description: "Inspire others to achieve greatness", type: "TEAM_PARTICIPATION", criteria: { action: "inspire", impact: "greatness" }, points: 550 },
        { name: "Perfect Game", description: "Achieve perfect performance in full game", type: "SKILL_PRACTICE", criteria: { performance: "perfect", duration: "full_game" }, points: 900 },
        { name: "Legacy Creation", description: "Create techniques that others will learn", type: "CUSTOM_CHALLENGE", criteria: { creation: "techniques", legacy: true }, points: 700 },
        { name: "Championship Mindset", description: "Demonstrate true champion mentality", type: "IMPROVEMENT_TRACKING", criteria: { mindset: "true_champion" }, points: 650 },
        { name: "Championship Trial", description: "Complete championship-level assessment", type: "LEVEL_TEST", criteria: { test: "championship" }, points: 1000, isLevelTest: true }
      ]
    },
    {
      levelNumber: 8,
      name: "Basketball Virtuoso",
      description: "Achieve artistic mastery of the game",
      pointsRequired: 18000,
      badgeIcon: "🎨",
      badgeColor: "#8B5CF6",
      rewards: { badge: "Virtuoso Badge", unlocks: ["Artistic expression", "Creative techniques"] },
      goals: [
        { name: "Artistic Expression", description: "Create beautiful basketball artistry", type: "SKILL_PRACTICE", criteria: { artistry: true, beauty: "exceptional" }, points: 800 },
        { name: "Creative Innovation", description: "Innovate 3 new techniques or plays", type: "CUSTOM_CHALLENGE", criteria: { innovation: 3, creativity: true }, points: 900 },
        { name: "Flawless Fundamentals", description: "Perfect execution of all fundamentals", type: "SKILL_PRACTICE", criteria: { fundamentals: "all", execution: "perfect" }, points: 850 },
        { name: "Signature Moves", description: "Master 10 signature moves", type: "SKILL_PRACTICE", criteria: { moves: 10, signature: true }, points: 750 },
        { name: "Game Poetry", description: "Play with rhythmic flow and beauty", type: "SKILL_PRACTICE", criteria: { rhythm: true, beauty: true }, points: 800 },
        { name: "Teaching Mastery", description: "Become master teacher of the game", type: "TEAM_PARTICIPATION", criteria: { teaching: "master", scope: "game" }, points: 700 },
        { name: "Emotional Control", description: "Master emotional regulation under all conditions", type: "IMPROVEMENT_TRACKING", criteria: { emotion: "master", conditions: "all" }, points: 650 },
        { name: "Perfect Harmony", description: "Achieve perfect team harmony", type: "TEAM_PARTICIPATION", criteria: { harmony: "perfect" }, points: 750 },
        { name: "Transcendent Performance", description: "Transcend normal performance limits", type: "SKILL_PRACTICE", criteria: { performance: "transcendent" }, points: 1000 },
        { name: "Virtuoso Examination", description: "Complete artistic mastery assessment", type: "LEVEL_TEST", criteria: { test: "artistic_mastery" }, points: 1200, isLevelTest: true }
      ]
    },
    {
      levelNumber: 9,
      name: "Basketball Sage",
      description: "Embody wisdom and deep understanding of the game",
      pointsRequired: 25000,
      badgeIcon: "🧙‍♂️",
      badgeColor: "#059669",
      rewards: { badge: "Sage Badge", unlocks: ["Ancient wisdom", "Deep game understanding"] },
      goals: [
        { name: "Ancient Wisdom", description: "Study and master basketball history and philosophy", type: "IMPROVEMENT_TRACKING", criteria: { study: "history", mastery: "philosophy" }, points: 900 },
        { name: "Intuitive Play", description: "Develop supernatural court awareness", type: "SKILL_PRACTICE", criteria: { awareness: "supernatural", intuition: true }, points: 1000 },
        { name: "Mentor Legacy", description: "Successfully develop 5 future champions", type: "TEAM_PARTICIPATION", criteria: { mentoring: 5, development: "champions" }, points: 1100 },
        { name: "Philosophical Understanding", description: "Understand deeper meaning of competition", type: "IMPROVEMENT_TRACKING", criteria: { understanding: "philosophical", depth: "competition" }, points: 800 },
        { name: "Timeless Techniques", description: "Master techniques that transcend eras", type: "SKILL_PRACTICE", criteria: { techniques: "timeless", transcendence: true }, points: 950 },
        { name: "Wisdom Sharing", description: "Share wisdom with the basketball community", type: "TEAM_PARTICIPATION", criteria: { sharing: "wisdom", community: true }, points: 850 },
        { name: "Perfect Balance", description: "Achieve perfect life-basketball balance", type: "IMPROVEMENT_TRACKING", criteria: { balance: "perfect", aspects: "life-basketball" }, points: 750 },
        { name: "Universal Respect", description: "Earn respect from all levels of players", type: "TEAM_PARTICIPATION", criteria: { respect: "universal", levels: "all" }, points: 900 },
        { name: "Enlightened Play", description: "Achieve enlightened state of play", type: "SKILL_PRACTICE", criteria: { state: "enlightened" }, points: 1200 },
        { name: "Sage's Wisdom Test", description: "Complete wisdom and understanding assessment", type: "LEVEL_TEST", criteria: { test: "wisdom" }, points: 1500, isLevelTest: true }
      ]
    },
    {
      levelNumber: 10,
      name: "Basketball Legend",
      description: "Achieve legendary status and eternal basketball immortality",
      pointsRequired: 35000,
      badgeIcon: "🌟",
      badgeColor: "#DC2626",
      rewards: { badge: "Legend Badge", unlocks: ["Immortal status", "Hall of Fame", "Eternal recognition"] },
      goals: [
        { name: "Immortal Performance", description: "Achieve performance that will be remembered forever", type: "SKILL_PRACTICE", criteria: { performance: "immortal", memory: "forever" }, points: 1200 },
        { name: "Legacy Foundation", description: "Create foundation that will impact future generations", type: "TEAM_PARTICIPATION", criteria: { foundation: true, impact: "generations" }, points: 1500 },
        { name: "Legendary Moments", description: "Create 5 legendary basketball moments", type: "SKILL_PRACTICE", criteria: { moments: 5, status: "legendary" }, points: 1300 },
        { name: "Universal Impact", description: "Impact basketball globally", type: "TEAM_PARTICIPATION", criteria: { impact: "global", scope: "basketball" }, points: 1100 },
        { name: "Transcendent Skill", description: "Achieve skill level that transcends human limits", type: "SKILL_PRACTICE", criteria: { skill: "transcendent", limits: "human" }, points: 1400 },
        { name: "Eternal Wisdom", description: "Possess wisdom that will guide future players", type: "IMPROVEMENT_TRACKING", criteria: { wisdom: "eternal", guidance: "future" }, points: 1000 },
        { name: "Perfect Mastery", description: "Achieve perfect mastery of every aspect", type: "SKILL_PRACTICE", criteria: { mastery: "perfect", scope: "every_aspect" }, points: 1600 },
        { name: "Inspirational Force", description: "Become force that inspires millions", type: "TEAM_PARTICIPATION", criteria: { force: "inspirational", reach: "millions" }, points: 1200 },
        { name: "Immortal Legacy", description: "Create legacy that will never be forgotten", type: "TEAM_PARTICIPATION", criteria: { legacy: "immortal", permanence: true }, points: 1800 },
        { name: "Legend's Ascension", description: "Complete the ultimate basketball trial", type: "LEVEL_TEST", criteria: { test: "ultimate" }, points: 2000, isLevelTest: true }
      ]
    }
  ]
};

async function seedRewardSystem() {
  console.log('🌱 Seeding reward system...');

  try {
    // Clear existing data
    await prisma.userWeeklyGoal.deleteMany();
    await prisma.weeklyGoal.deleteMany();
    await prisma.userGoal.deleteMany();
    await prisma.userLevel.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.level.deleteMany();

    // Create levels and goals
    for (const levelData of rewardSystemData.levels) {
      console.log(`Creating level ${levelData.levelNumber}: ${levelData.name}`);
      
      const level = await prisma.level.create({
        data: {
          levelNumber: levelData.levelNumber,
          name: levelData.name,
          description: levelData.description,
          pointsRequired: levelData.pointsRequired,
          badgeIcon: levelData.badgeIcon,
          badgeColor: levelData.badgeColor,
          rewards: levelData.rewards,
          isCustom: false,
        },
      });

      // Create goals for this level
      for (let i = 0; i < levelData.goals.length; i++) {
        const goalData = levelData.goals[i];
        await prisma.goal.create({
          data: {
            levelId: level.id,
            goalNumber: i + 1,
            name: goalData.name,
            description: goalData.description,
            type: goalData.type as any,
            criteria: goalData.criteria,
            points: goalData.points,
            isLevelTest: goalData.isLevelTest || false,
            isCustom: false,
          },
        });
      }
    }

    // Create sample weekly goals
    const weeklyGoals = [
      {
        name: "Practice Consistency",
        description: "Practice at least 4 times this week",
        type: "PRACTICE_FREQUENCY",
        criteria: { sessions: 4, timeframe: "week" },
        points: 200,
      },
      {
        name: "Skill Focus",
        description: "Focus on shooting skills this week",
        type: "SKILL_FOCUS",
        criteria: { skill: "shooting", focus_time: 120 },
        points: 150,
      },
      {
        name: "Drill Variety",
        description: "Try 5 different types of drills",
        type: "DRILL_VARIETY",
        criteria: { different_drills: 5 },
        points: 180,
      },
      {
        name: "Team Activity",
        description: "Participate in team activities",
        type: "TEAM_ACTIVITY",
        criteria: { activities: 2 },
        points: 120,
      },
    ];

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    for (const weeklyGoal of weeklyGoals) {
      await prisma.weeklyGoal.create({
        data: {
          name: weeklyGoal.name,
          description: weeklyGoal.description,
          type: weeklyGoal.type as any,
          criteria: weeklyGoal.criteria,
          points: weeklyGoal.points,
          startDate: startOfWeek,
          endDate: endOfWeek,
          isActive: true,
          isCustom: false,
        },
      });
    }

    console.log('✅ Reward system seeded successfully!');
    console.log(`Created ${rewardSystemData.levels.length} levels with ${rewardSystemData.levels.reduce((sum, level) => sum + level.goals.length, 0)} goals`);
    console.log(`Created ${weeklyGoals.length} weekly goals`);

  } catch (error) {
    console.error('❌ Error seeding reward system:', error);
    throw error;
  }
}

// Run the seed function
seedRewardSystem()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 