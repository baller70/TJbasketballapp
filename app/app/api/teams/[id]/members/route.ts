import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { addMemberToMockTeam, removeMemberFromMockTeam } from '../../mock-data';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // For demo purposes, allow operations without session (using mock data)
    if (!session?.user?.id) {
      console.log('No session found, using mock team member addition');
      const { userId } = await request.json();
      
      // Get user data from users API (mock data)
      try {
        const usersResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/users`);
        console.log('Users API response status:', usersResponse.status);
        const users = await usersResponse.json();
        const user = users.find((u: any) => u.id === userId);
        
        console.log('Found user:', user);
        
        if (user) {
          // Actually add the user to the mock team data
          console.log('Adding user to mock team:', params.id, userId, user.name, user.email);
          addMemberToMockTeam(params.id, userId, user.name, user.email);
          
          // Return success response
          return NextResponse.json({
            id: `member-${Date.now()}`,
            teamId: params.id,
            userId: userId,
            role: 'member',
            joinedAt: new Date().toISOString(),
          });
        } else {
          console.log('User not found:', userId);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
      }
    }

    const { userId, role = 'member' } = await request.json();
    const teamId = params.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if team exists and user owns it
    const team = await (prisma as any).team.findFirst({
      where: {
        id: teamId,
        createdById: session.user.id,
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
          userId,
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
        userId,
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
    console.error('Error adding team member:', error);
    return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // For demo purposes, allow operations without session (using mock data)
    if (!session?.user?.id) {
      console.log('No session found, using mock team member removal');
      const { userId } = await request.json();
      
      // Actually remove the user from the mock team data
      removeMemberFromMockTeam(params.id, userId);
      
      return NextResponse.json({ success: true });
    }

    const { userId } = await request.json();
    const teamId = params.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if team exists and user owns it
    const team = await (prisma as any).team.findFirst({
      where: {
        id: teamId,
        createdById: session.user.id,
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
          userId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 });
  }
} 