
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import PlayerDashboard from '@/components/dashboard/player-dashboard';
import ParentDashboard from '@/components/dashboard/parent-dashboard';
import { authOptions } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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

  if (!user) {
    redirect('/auth/signin');
  }

  if (user.role === 'PARENT') {
    return <ParentDashboard user={user as any} />;
  }

  return <PlayerDashboard user={user as any} />;
}
