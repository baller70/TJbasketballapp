
import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/server';

export async function getSession(req?: NextRequest) {
  return await getServerSession();
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}
