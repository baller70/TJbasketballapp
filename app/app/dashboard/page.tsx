
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import PlayerDashboard from '@/components/dashboard/player-dashboard';
import ParentDashboard from '@/components/dashboard/parent-dashboard';
import DashboardSwitcher from '@/components/dashboard/dashboard-switcher';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Try to get an existing user from database, or create a mock user
  let user;
  try {
    user = await prisma.user.findFirst({
    include: {
      playerProfile: true,
      children: {
        include: {
          playerProfile: true,
        },
      },
      parent: true,
    },
    });
  } catch (error) {
    console.error('Database error:', error);
    // Create a mock user for development
    user = {
      id: userId,
      email: 'mock@example.com',
      name: 'Mock User',
      role: 'PARENT',
      playerProfile: null,
      children: [
        {
          id: 'child-1',
          name: 'Alex Johnson',
          email: 'alex@example.com',
          role: 'PLAYER',
          playerProfile: {
            id: 'profile-1',
            userId: 'child-1',
            age: 10,
            position: 'Guard',
            skillLevel: 'BEGINNER',
            parentId: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ],
      parent: null,
    };
  }

  // If no user found, create a default mock user
  if (!user) {
    user = {
      id: userId,
      email: 'mock@example.com',
      name: 'Mock User',
      role: 'PARENT',
      playerProfile: null,
      children: [
        {
          id: 'child-1',
          name: 'Alex Johnson',
          email: 'alex@example.com',
          role: 'PLAYER',
          playerProfile: {
            id: 'profile-1',
            userId: 'child-1',
            age: 10,
            position: 'Guard',
            skillLevel: 'BEGINNER',
            parentId: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ],
      parent: null,
    };
  }

  const view = searchParams.view;

  // Determine if user is a parent or player
  const isParent = user.role === 'PARENT' || user.children?.length > 0;
  const isPlayer = user.role === 'PLAYER' || user.playerProfile;

  // For development: Always allow access to both views
  // If both parent and player, show switcher
  if (isParent && isPlayer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardSwitcher currentView={view || 'parent'} userRole={user.role} />
      </div>
    );
  }

  // Show appropriate dashboard based on view parameter (development mode)
  if (view === 'parent') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ParentDashboard user={user as any} />
      </div>
    );
  }

  if (view === 'player') {
    return (
      <div className="min-h-screen bg-gray-50">
        <PlayerDashboard user={user as any} />
      </div>
    );
  }

  // Default based on user role
  if (isParent && !isPlayer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ParentDashboard user={user as any} />
      </div>
    );
  }

  if (isPlayer && !isParent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PlayerDashboard user={user as any} />
      </div>
    );
  }

  // Default to parent dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <ParentDashboard user={user as any} />
    </div>
  );
}
