import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateCustomDrill } from '@/lib/openai';

export const dynamic = 'force-dynamic';

const CATEGORIES: Array<{ id: string; skillLevel: string; focus: string }> = [
  { id: 'shooting', skillLevel: 'Beginner', focus: 'Form, free throws, catch-and-shoot' },
  { id: 'dribbling', skillLevel: 'Beginner', focus: 'Ball control, crossovers, two-ball' },
  { id: 'passing', skillLevel: 'Intermediate', focus: 'Chest/bounce, on-the-move, vision' },
  { id: 'defense', skillLevel: 'Intermediate', focus: 'Stance, slides, closeouts, help' },
  { id: 'conditioning', skillLevel: 'All Levels', focus: 'Intervals, court sprints, jump rope' },
  { id: 'footwork', skillLevel: 'Beginner', focus: 'Mikan, drop step, cone agility' },
  { id: 'fundamentals', skillLevel: 'Beginner', focus: 'Triple threat, pivots, layups' },
];

export async function POST() {
  try {
    const results: any[] = [];

    for (const cat of CATEGORIES) {
      // Pull up to 3 existing drills to update; if fewer than 3, we'll create the remainder
      const existing = await prisma.drill.findMany({
        where: { category: cat.id },
        orderBy: { createdAt: 'asc' },
        take: 3,
      });

      for (let i = 0; i < 3; i++) {
        // Generate via OpenAI (falls back to template if API key invalid)
        const ai = await generateCustomDrill(cat.skillLevel, `${cat.id}: ${cat.focus}`, {});

        const name: string = ai.name || `${cat.id} drill ${i + 1}`;
        const description: string = ai.description || `AI-generated ${cat.id} drill`;
        const equipmentArr: string[] = Array.isArray(ai.equipment) ? ai.equipment : ['Basketball'];
        const stepsArr: string[] = Array.isArray(ai.instructions)
          ? ai.instructions
          : Array.isArray(ai.steps)
          ? ai.steps
          : [];
        const tipsArr: string[] = Array.isArray(ai.coachingTips) ? ai.coachingTips : [];
        const durationStr: string = typeof ai.duration === 'string'
          ? (ai.duration.match(/\d+/)?.[0] || '15')
          : String(ai.duration || '15');

        if (existing[i]) {
          const updated = await prisma.drill.update({
            where: { id: existing[i].id },
            data: {
              // avoid unique name collisions by appending suffix if changed
              name: name === existing[i].name ? name : `${name} (${Date.now() % 10000})`,
              description,
              category: cat.id,
              skillLevel: cat.skillLevel,
              duration: durationStr,
              equipment: JSON.stringify(equipmentArr),
              stepByStep: JSON.stringify(stepsArr),
              coachingTips: JSON.stringify(tipsArr),
              videoUrl: null,
              alternativeVideos: JSON.stringify([]),
              isCustom: false,
            },
          });
          results.push({ id: updated.id, name: updated.name, category: updated.category, action: 'updated' });
        } else {
          // ensure unique name on create
          const uniqueName = `${name} (${cat.id}-${i + 1})`;
          const created = await prisma.drill.upsert({
            where: { name: uniqueName },
            update: {},
            create: {
              name: uniqueName,
              description,
              category: cat.id,
              skillLevel: cat.skillLevel,
              duration: durationStr,
              equipment: JSON.stringify(equipmentArr),
              stepByStep: JSON.stringify(stepsArr),
              coachingTips: JSON.stringify(tipsArr),
              videoUrl: null,
              alternativeVideos: JSON.stringify([]),
              isCustom: false,
            },
          });
          results.push({ id: created.id, name: created.name, category: created.category, action: 'created' });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'AI regeneration completed', results });
  } catch (error) {
    console.error('Error regenerating drills with AI:', error);
    return NextResponse.json({ error: 'Failed to regenerate drills with AI' }, { status: 500 });
  }
}
