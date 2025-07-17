
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';

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
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            playerProfile: true,
            children: true,
            parent: true
          }
        });

        if (!user?.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || '',
          role: user.role,
          parentId: user.parentId,
          playerProfile: user.playerProfile,
          children: user.children,
          parent: user.parent
        } as any;
      }
    })
  ],
  session: {
    strategy: 'jwt' as const
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.parentId = user.parentId;
        token.playerProfile = user.playerProfile;
        token.children = user.children;
        token.parent = user.parent;
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
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
};
