import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { addMemberToMockTeam, removeMemberFromMockTeam } from '../../mock-data';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    // For demo purposes, allow operations without session (using mock data)
    if (!userId) {
      logger.info('No session found, using mock team member addition');
      const { userId: targetUserId } = await request.json();
      
      // Get user data from users API (mock data)
      try {
        const usersResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/users`);
        logger.info('Users API response status', { status: usersResponse.status });
        const users = await usersResponse.json();
        const user = users.find((u: any) => u.id === targetUserId);
        
        logger.info('Found user', { user });
        
        if (user) {
          // Actually add the user to the mock team data
          logger.info('Adding user to mock team', { teamId: params.id, userId: targetUserId, userName: user.name, userEmail: user.email });
          addMemberToMockTeam(params.id, targetUserId, user.name, user.email);
          
          // Return success response
          return NextResponse.json({
            id: `member-${Date.now()}`,
            teamId: params.id,
            userId: targetUserId,
            role: 'member',
            joinedAt: new Date().toISOString(),
          });
        } else {
          logger.warn('User not found', { userId: targetUserId });
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
      } catch (error) {
        logger.error('Error fetching users', error as Error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
      }
    }

    const { userId: targetUserId, role = 'member' } = await request.json();
    const teamId = params.id;

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if team exists and user owns it
    const team = await (prisma as any).team.findFirst({
      where: {
        id: teamId,
        createdById: userId,
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found or unauthorized' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await (prisma as any).teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: targetUserId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a team member' }, { status: 400 });
    }

    // Add user to team
    const teamMember = await (prisma as any).teamMember.create({
      data: {
        teamId,
        userId: targetUserId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(teamMember);
  } catch (error) {
    logger.error('Error adding team member', error as Error);
    return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    // For demo purposes, allow operations without session (using mock data)
    if (!userId) {
      logger.info('No session found, using mock team member removal');
      const { userId: targetUserId } = await request.json();
      
      // Actually remove the user from the mock team data
      removeMemberFromMockTeam(params.id, targetUserId);
      
      return NextResponse.json({ success: true });
    }

    const { userId: targetUserId } = await request.json();
    const teamId = params.id;

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if team exists and user owns it
    const team = await (prisma as any).team.findFirst({
      where: {
        id: teamId,
        createdById: userId,
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found or unauthorized' }, { status: 404 });
    }

    // Remove user from team
    await (prisma as any).teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId: targetUserId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error removing team member', error as Error);
    return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 });
  }
}                                                