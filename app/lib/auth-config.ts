
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import { getEnvConfig } from './env-validation';
import { validatePassword, isCommonWeakPassword } from './password-validation';

const env = getEnvConfig();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
          throw new Error('Invalid email format');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.toLowerCase()
          },
          include: {
            playerProfile: true,
            children: true,
            parent: true
          }
        });

        if (!user?.password) {
          throw new Error('Invalid credentials');
        }

        // Validate password strength for new users
        if (!validatePassword(credentials.password)) {
          throw new Error('Password does not meet security requirements');
        }

        // Check for common weak passwords
        if (isCommonWeakPassword(credentials.password)) {
          throw new Error('Password is too common. Please choose a stronger password.');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { updatedAt: new Date() }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name || '',
          role: user.role,
          parentId: user.parentId,
          playerProfile: user.playerProfile,
          children: user.children,
          parent: user.parent,
          lastLogin: new Date(),
        } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.parentId = user.parentId;
        token.playerProfile = user.playerProfile;
        token.children = user.children;
        token.parent = user.parent;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as any;
        session.user.parentId = token.parentId as string;
        session.user.playerProfile = token.playerProfile as any;
        session.user.children = token.children as any;
        session.user.parent = token.parent as any;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  secret: env.NEXTAUTH_SECRET,
  debug: env.NODE_ENV === 'development',
};
