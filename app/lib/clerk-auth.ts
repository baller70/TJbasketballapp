import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function getAuth() {
  return auth();
}

export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  return { userId };
}

export async function getCurrentUser() {
  const { userId } = await auth();
  return userId;
}

export async function isAuthenticated() {
  const { userId } = await auth();
  return !!userId;
} 