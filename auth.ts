import { prisma } from '@utils/prisma';
import { Role } from '@utils/types';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const ALLOWED_DOMAINS = new Set(
  process.env.ALLOWED_EMAIL_DOMAINS?.split(',') ?? []
);

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

      const emailDomain = user.email.split('@')[1]?.toLowerCase();
      if (!ALLOWED_DOMAINS.has(emailDomain)) {
        throw new Error('InvalidEmailDomain');
      }

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              authId: String(user.id),
              email: user.email,
              firstName: user.name?.split(' ')[0] || '',
              lastName: user.name?.split(' ').slice(1).join(' ') || '',
              role: Role.TEACHER,
              profilePicture: user.image || null,
            },
          });

          const subjects = await prisma.subject.findMany({
            where: { archived: false },
            select: { id: true },
          });

          if (subjects.length > 0) {
            await prisma.mailingList.createMany({
              data: subjects.map((subject) => ({
                userId: newUser.id,
                subjectId: subject.id,
              })),
            });
          }
        }
      } catch (error) {
        console.error('Database error:', error);
        throw new Error('DatabaseError');
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: {
            absences: true,
          },
        });

        const settings = await prisma.globalSettings.findFirst();
        token.userId = Number(dbUser?.id);
        token.role = dbUser?.role;
        token.usedAbsences = dbUser?.absences.length ?? 0;
        token.absenceCap = settings?.absenceCap ?? 10;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as number;
        session.user.role = token.role as Role;
        session.user.usedAbsences = token.usedAbsences as number;
        session.user.absenceCap = token.absenceCap as number;
      }
      return session;
    },
  },
});
