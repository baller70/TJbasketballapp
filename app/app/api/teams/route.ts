import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getMockTeams } from './mock-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      // Return mock teams for demonstration
      logger.info('No session found, using mock teams data');
      return NextResponse.json(getMockTeams());
    }

    // Get all teams created by this user
    const teams = await (prisma as any).team.findMany({
      where: {
        createdById: userId,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(teams);
  } catch (error) {
    logger.error('Error fetching teams', error as Error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, color } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    const team = await (prisma as any).team.create({
      data: {
        name,
        description,
        color: color || '#3B82F6',
        createdById: userId,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(team);
  } catch (error) {
    logger.error('Error creating team', error as Error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}      