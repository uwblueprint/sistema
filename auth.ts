import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
    };
  }

  interface User {
    role: Role;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      const allowedDomain = process.env.SISTEMA_EMAIL_DOMAIN;

      if (!user?.email?.endsWith(`@${allowedDomain}`)) {
        console.log(`Login attempt blocked for ${user?.email}`);
        return false;
      }

      // Check if user exists in DB
      let existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      // If user doesn't exist, create them
      if (!existingUser) {
        existingUser = await prisma.user.create({
          data: {
            authId: user.id ?? '',
            email: user.email!,
            firstName: user.name?.split(' ')[0] || '',
            lastName: user.name?.split(' ').slice(1).join(' ') || '',
            role: Role.TEACHER,
            profilePicture: user.image || null,
          },
        });
      }

      // Attach role to user object for session callback
      (user as any).role = existingUser.role;

      return true;
    },

    async session({ session }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
        });

        if (dbUser) {
          session.user.id = dbUser.id.toString();
          session.user.role = dbUser.role;
        }
      }
      return session;
    },
  },
});
