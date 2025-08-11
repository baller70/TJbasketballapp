import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const drillsToSeed = [
      // Shooting
      { name: 'Form Shooting Basics', category: 'shooting', skillLevel: 'Beginner', duration: '15', description: 'Fundamental shooting mechanics and follow-through', equipment: ['Basketball', 'Hoop'], steps: ['Stance and balance', 'Hand placement', 'Follow-through'], tips: ['Elbow under ball', 'Eyes on rim'] },
      { name: 'Free Throw Routine', category: 'shooting', skillLevel: 'Beginner', duration: '10', description: 'Consistent free-throw routine development', equipment: ['Basketball', 'Hoop'], steps: ['Routine setup', 'Breathing', 'Release'], tips: ['Same routine every time', 'Soft touch'] },
      { name: 'Catch-and-Shoot', category: 'shooting', skillLevel: 'Intermediate', duration: '20', description: 'Shooting off the catch with quick release', equipment: ['Basketball', 'Hoop'], steps: ['Footwork to square', 'Catch in pocket', 'Quick release'], tips: ['Hands ready', 'Land balanced'] },
      // Dribbling
      { name: 'Stationary Ball Handling', category: 'dribbling', skillLevel: 'Beginner', duration: '15', description: 'Pound dribbles and control at different heights', equipment: ['Basketball'], steps: ['Right-hand pound', 'Left-hand pound', 'Alternating'], tips: ['Use fingertips', 'Keep head up'] },
      { name: 'Crossover Series', category: 'dribbling', skillLevel: 'Intermediate', duration: '15', description: 'Controlled crossovers into movements', equipment: ['Basketball', 'Cones'], steps: ['Crossover at cone', 'Explode after move', 'Change pace'], tips: ['Low and quick', 'Sell the fake'] },
      { name: 'Two-Ball Dribbling', category: 'dribbling', skillLevel: 'Advanced', duration: '10', description: 'Ambidextrous control using two balls', equipment: ['2 Basketballs'], steps: ['Pound together', 'Alternate', 'High-low'], tips: ['Stay in stance', 'Controlled dribbles'] },
      // Passing
      { name: 'Wall Passing', category: 'passing', skillLevel: 'Beginner', duration: '10', description: 'Chest and bounce passes against a wall', equipment: ['Basketball', 'Wall'], steps: ['Chest pass form', 'Bounce pass form', 'Target practice'], tips: ['Step to target', 'Thumbs down on finish'] },
      { name: 'Partner Passing on the Move', category: 'passing', skillLevel: 'Intermediate', duration: '15', description: 'Pass and relocate while moving', equipment: ['Basketball', 'Partner'], steps: ['Pass and cut', 'Lead passes', 'Catch on move'], tips: ['Communicate', 'Pass to space'] },
      { name: 'No-Look Fundamentals', category: 'passing', skillLevel: 'Advanced', duration: '10', description: 'Develop court awareness with peripheral vision', equipment: ['Basketball'], steps: ['Eyes forward', 'Target with hands', 'Snap wrists'], tips: ['See the floor', 'Be decisive'] },
      // Defense
      { name: 'Defensive Stance & Slides', category: 'defense', skillLevel: 'Beginner', duration: '10', description: 'Proper stance and lateral slides', equipment: ['Cones'], steps: ['Athletic stance', 'Slide without crossing', 'Stay low'], tips: ['Hands active', 'Do not cross feet'] },
      { name: 'Closeout Technique', category: 'defense', skillLevel: 'Intermediate', duration: '10', description: 'Controlled closeouts to contest shots', equipment: ['Basketball', 'Partner'], steps: ['Sprint then chop', 'High hand contest', 'Stay down on shot fakes'], tips: ['Short choppy steps', 'Balance first'] },
      { name: 'Help & Recover', category: 'defense', skillLevel: 'Intermediate', duration: '15', description: 'Help-side positioning and recovery', equipment: ['Cones', 'Partner'], steps: ['See ball and man', 'Help position', 'Recover on pass'], tips: ['Talk on D', 'Early help'] },
      // Conditioning
      { name: 'Line Touches (Suicides)', category: 'conditioning', skillLevel: 'All Levels', duration: '10', description: 'Court sprint intervals for conditioning', equipment: ['Court'], steps: ['Baseline to lines', 'Touch and go', 'Controlled breathing'], tips: ['Pace yourself', 'Finish strong'] },
      { name: 'Interval Sprints', category: 'conditioning', skillLevel: 'All Levels', duration: '12', description: 'Timed sprint and recovery intervals', equipment: ['Court', 'Timer'], steps: ['Sprint 20s', 'Rest 40s', 'Repeat sets'], tips: ['Explode on go', 'Full recovery'] },
      { name: 'Jump Rope Series', category: 'conditioning', skillLevel: 'All Levels', duration: '8', description: 'Cardio and rhythm development', equipment: ['Jump Rope'], steps: ['Basic jumps', 'High knees', 'Alternating feet'], tips: ['Stay light', 'Rhythmic breathing'] },
      // Footwork
      { name: 'Mikan Drill', category: 'footwork', skillLevel: 'Beginner', duration: '10', description: 'Finishing footwork around the rim', equipment: ['Basketball', 'Hoop'], steps: ['Right-left finish', 'Left-right finish', 'Continuous rhythm'], tips: ['Use backboard', 'Soft touch'] },
      { name: 'Drop Step & Up-and-Under', category: 'footwork', skillLevel: 'Intermediate', duration: '12', description: 'Post footwork essentials', equipment: ['Basketball', 'Hoop'], steps: ['Seal defender', 'Drop step', 'Up-and-under'], tips: ['Wide base', 'Strong pivot'] },
      { name: 'Cone Shuffles', category: 'footwork', skillLevel: 'Beginner', duration: '8', description: 'Agility footwork around cones', equipment: ['Cones'], steps: ['Shuffle between cones', 'Stay low', 'Quick feet'], tips: ['Short steps', 'Stay balanced'] },
      // Fundamentals
      { name: 'Triple Threat Basics', category: 'fundamentals', skillLevel: 'Beginner', duration: '10', description: 'Read and react from triple threat position', equipment: ['Basketball'], steps: ['Pivot options', 'Jab step', 'Rip through'], tips: ['Ball strong', 'Eyes up'] },
      { name: 'Layup Series', category: 'fundamentals', skillLevel: 'Beginner', duration: '12', description: 'Right and left-hand layups', equipment: ['Basketball', 'Hoop'], steps: ['Right-hand layup', 'Left-hand layup', 'Off two feet'], tips: ['Use the square', 'High off glass'] },
      { name: 'Pivot & Rip', category: 'fundamentals', skillLevel: 'Beginner', duration: '8', description: 'Protect the ball and pivot out of pressure', equipment: ['Basketball'], steps: ['Front pivot', 'Reverse pivot', 'Rip low/high'], tips: ['Stay strong', 'Protect the ball'] },
    ];

    const created: any[] = [];

    for (const d of drillsToSeed) {
      const drill = await prisma.drill.upsert({
        where: { name: d.name },
        update: {},
        create: {
          name: d.name,
          description: d.description,
          category: d.category,
          skillLevel: d.skillLevel,
          duration: d.duration,
          equipment: JSON.stringify(d.equipment),
          stepByStep: JSON.stringify(d.steps),
          coachingTips: JSON.stringify(d.tips),
          videoUrl: null,
          alternativeVideos: JSON.stringify([]),
          isCustom: false,
        },
      });
      created.push({ id: drill.id, name: drill.name, category: drill.category });
    }

    return NextResponse.json({ 
      success: true,
      count: created.length,
      drills: created,
      message: 'Seeded default drills across categories.'
    });
  } catch (error) {
    console.error('Error seeding drills:', error);
    return NextResponse.json(
      { error: 'Failed to seed drills' },
      { status: 500 }
    );
  }
} 