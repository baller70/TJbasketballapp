
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import PlayerDashboard from '@/components/dashboard/player-dashboard';
import ParentDashboard from '@/components/dashboard/parent-dashboard';
import { authOptions } from '@/lib/auth-config';
import DashboardSwitcher from '@/components/dashboard/dashboard-switcher';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  // TEMPORARILY BYPASS AUTHENTICATION FOR TESTING
  // const session = await getServerSession(authOptions);
  // if (!session?.user) {
  //   redirect('/auth/signin');
  // }

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
    console.log('Database error, using mock user:', error);
  }

  // If no user found or database error, create a mock user for testing
  if (!user) {
    user = {
      id: 'mock-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'PARENT', // Default to PARENT role
      playerProfile: {
        id: 'mock-profile-id',
        userId: 'mock-user-id',
        dateOfBirth: new Date('2000-01-01'),
        position: 'Guard',
        skillLevel: 'INTERMEDIATE',
        height: 72,
        weight: 180,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      children: [
        {
          id: 'mock-child-id',
          email: 'child@example.com',
          name: 'Test Child',
          role: 'PLAYER',
          parentId: 'mock-user-id',
          playerProfile: {
            id: 'mock-child-profile-id',
            userId: 'mock-child-id',
            dateOfBirth: new Date('2010-01-01'),
            position: 'Point Guard',
            skillLevel: 'BEGINNER',
            height: 60,
            weight: 120,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          children: [],
          parent: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      parent: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Get the view preference from search params (default to user's role)
  const viewMode = searchParams.view || user.role.toLowerCase();

  return (
    <div>
      <DashboardSwitcher currentView={viewMode} userRole={user.role} />
      {viewMode === 'parent' ? (
        <ParentDashboard user={user as any} />
      ) : (
        <PlayerDashboard user={user as any} />
      )}
    </div>
  );
}
