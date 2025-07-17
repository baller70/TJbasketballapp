
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import { getEnvConfig } from './env-validation';
import { validatePassword, isCommonWeakPassword } from './password-validation';

const env = getEnvConfig();

export const authOptions: NextAuthOptions = {
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

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        // Check if account is locked (you can extend this with a lockout system)
        // if (user.lockedUntil && user.lockedUntil > new Date()) {
        //   throw new Error('Account is temporarily locked');
        // }

        return {
          id: user.id,
          email: user.email,
          name: user.name || '',
          role: user.role,
          parentId: user.parentId,
          playerProfile: user.playerProfile,
          children: user.children,
          parent: user.parent,
          lastLogin: new Date()
        } as any;
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: env.SESSION_TIMEOUT_MINUTES * 60, // Convert minutes to seconds
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: env.NODE_ENV === 'production',
        maxAge: env.SESSION_TIMEOUT_MINUTES * 60,
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.parentId = user.parentId;
        token.playerProfile = user.playerProfile;
        token.children = user.children;
        token.parent = user.parent;
        token.lastLogin = user.lastLogin;
        token.iat = Math.floor(Date.now() / 1000);
      }

      // Check if session is expired
      if (token.iat && Date.now() - token.iat * 1000 > env.SESSION_TIMEOUT_MINUTES * 60 * 1000) {
        return null; // Force logout
      }

      // Update last activity
      if (trigger === 'update') {
        token.lastActivity = Math.floor(Date.now() / 1000);
      }

      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.parentId = token.parentId;
        session.user.playerProfile = token.playerProfile;
        session.user.children = token.children;
        session.user.parent = token.parent;
        session.user.lastLogin = token.lastLogin;
        session.user.lastActivity = token.lastActivity;
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Additional sign-in validation can be added here
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Log successful sign-in
      if (env.ENABLE_SECURITY_LOGGING) {
        console.log(`User signed in: ${user.email} at ${new Date().toISOString()}`);
      }
    },
    async signOut({ session, token }) {
      // Log sign-out
      if (env.ENABLE_SECURITY_LOGGING) {
        console.log(`User signed out: ${session?.user?.email} at ${new Date().toISOString()}`);
      }
    },
  },
  debug: env.NODE_ENV === 'development',
  secret: env.NEXTAUTH_SECRET,
};
