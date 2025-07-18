
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a basketball coach for kids aged 6-13. Generate a short, motivational quote about basketball practice, improvement, or perseverance that would inspire young athletes. Keep it under 15 words and age-appropriate.'
          },
          {
            role: 'user',
            content: 'Generate a motivational basketball quote for a young player who just logged into their practice app.'
          }
        ],
        max_tokens: 50,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate quote');
    }

    const data = await response.json();
    const quote = data.choices[0]?.message?.content?.trim() || "Practice makes progress, not perfection!";

    return NextResponse.json({ quote });
  } catch (error) {
    console.error('Error generating motivational quote:', error);
    
    // Fallback quotes if AI fails
    const fallbackQuotes = [
      "Practice makes progress, not perfection!",
      "Every great player was once a beginner.",
      "The only way to get better is to keep practicing.",
      "Champions are made in practice, not in games.",
      "Your hard work today creates tomorrow's success.",
      "Focus on improvement, not just winning.",
      "Great shooters are made, not born.",
      "Consistency beats perfection every time.",
    ];
    
    const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    return NextResponse.json({ quote: randomQuote });
  }
}
