import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import LandingPage from '@/components/landing/landing-page';

export default async function Home() {
  const session = await getServerSession();

  if (session) {
    redirect('/dashboard');
  }

  return <LandingPage />;
}