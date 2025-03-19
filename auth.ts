import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@utils/prisma';
import { Role } from '@utils/types';

const allowedDomain = process.env.SISTEMA_EMAIL_DOMAIN;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GoogleProvider],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') {
        return false;
      }

      if (!user.email || !user.id) {
        throw new Error('MissingCredentials');
      }

      if (!user.email.endsWith(`@${allowedDomain}`)) {
        throw new Error('InvalidEmailDomain');
      }

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              authId: user.id,
              email: user.email,
              firstName: user.name?.split(' ')[0] || '',
              lastName: user.name?.split(' ').slice(1).join(' ') || '',
              role: Role.TEACHER,
              profilePicture: user.image || null,
            },
          });
        }
      } catch (error) {
        console.error('Database error:', error);
        throw new Error('DatabaseError');
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && typeof token.userId === 'string') {
        session.user.id = token.userId;
      }
      return session;
    },
  },
});
