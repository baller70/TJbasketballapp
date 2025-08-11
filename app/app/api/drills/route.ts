
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { generateCustomDrill } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Always try DB first (even if unauthenticated)
    const drills = await prisma.drill.findMany({
      orderBy: { name: 'asc' },
    });

    if (drills.length > 0) {
      // Normalize JSON fields and strings for UI
      const normalized = drills.map((drill: any) => ({
        ...drill,
        equipment: (() => {
          try { return JSON.parse(drill.equipment || '[]'); } catch { return []; }
        })(),
        stepByStep: (() => {
          try { return JSON.parse(drill.stepByStep || '[]').join(', '); } catch { return drill.stepByStep || ''; }
        })(),
        coachingTips: (() => {
          try { return JSON.parse(drill.coachingTips || '[]').join(', '); } catch { return drill.coachingTips || ''; }
        })(),
        alternativeVideos: (() => {
          try { return JSON.parse(drill.alternativeVideos || '[]'); } catch { return []; }
        })(),
      }));
      return NextResponse.json(normalized);
    }

    // Fallback: Generate drills with OpenAI if DB is empty
    const categories: Array<{id: string; skillLevel: string; focus: string}> = [
      { id: 'shooting', skillLevel: 'Beginner', focus: 'Form shooting and free throws' },
      { id: 'dribbling', skillLevel: 'Beginner', focus: 'Ball control and crossovers' },
      { id: 'passing', skillLevel: 'Intermediate', focus: 'Chest/bounce and on-the-move passing' },
      { id: 'defense', skillLevel: 'Intermediate', focus: 'Stance, slides, closeouts' },
      { id: 'conditioning', skillLevel: 'All Levels', focus: 'Court sprints and intervals' },
      { id: 'footwork', skillLevel: 'Beginner', focus: 'Mikan, drop step, cone agility' },
      { id: 'fundamentals', skillLevel: 'Beginner', focus: 'Triple threat, pivots, layups' },
    ];

    const generated: any[] = [];

    for (const cat of categories) {
      for (let i = 0; i < 3; i++) {
        try {
          const drill = await generateCustomDrill(cat.skillLevel, `${cat.id}: ${cat.focus}`, {});
          // Normalize fields
          const name = drill.name || `${cat.id} drill ${i+1}`;
          const description = drill.description || `AI-generated ${cat.id} drill`;
          const equipment = Array.isArray(drill.equipment) ? drill.equipment : ['Basketball'];
          const steps = Array.isArray(drill.instructions) ? drill.instructions : (Array.isArray(drill.steps) ? drill.steps : []);
          const tips = Array.isArray(drill.coachingTips) ? drill.coachingTips : [];
          const duration = typeof drill.duration === 'string' ? drill.duration.replace(/[^0-9]/g, '') || '15' : String(drill.duration || '15');

          const created = await prisma.drill.upsert({
            where: { name },
            update: {},
            create: {
              name,
              description,
              category: cat.id,
              skillLevel: cat.skillLevel,
              duration,
              equipment: JSON.stringify(equipment),
              stepByStep: JSON.stringify(steps),
              coachingTips: JSON.stringify(tips),
              videoUrl: null,
              alternativeVideos: JSON.stringify([]),
              isCustom: false,
            },
          });
          generated.push({ id: created.id, name: created.name, category: created.category });
        } catch (e) {
          console.error('AI drill generation failed for', cat.id, e);
        }
      }
    }

    return NextResponse.json(generated, { status: 200 });
  } catch (error) {
    console.error('Error fetching drills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drills' },
      { status: 500 }
    );
  }
}
