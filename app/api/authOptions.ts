import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';

// Custom Google Profile Type
interface GoogleProfile {
  sub: string;
  name: string;
  email: string;
  picture: string;
  given_name: string;
  family_name: string;
}

console.log('1');

// Define your NextAuth options
export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
      profile(profile: GoogleProfile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
          firstName: profile.given_name,
          lastName: profile.family_name,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ account, profile }) {
      console.log('Account: ', account);
      console.log('Profile: ', profile);
      const googleProfile = profile as any;

      const firstName = googleProfile.firstName || '';
      const lastName = googleProfile.lastName || '';

      console.log('Nigeria');

      if (account?.provider === 'google' && profile?.email) {
        try {
          // const existingUser = await prisma.user.findUnique({
          //   where: { email: profile.email },
          // });

          // if (!existingUser) {
          console.log('Nigeria');
          console.log(account.providerAccountId);
          await prisma.user.create({
            data: {
              authId: account.providerAccountId,
              email: profile.email,
              firstName,
              lastName,
              role: 'TEACHER',
              status: 'INVITED',
              numOfAbsences: 10,
            },
          });
          // }

          return true;
        } catch (error) {
          console.error('Error during sign-in:', error);
          return false;
        }
      }
      return false;
    },
  },
};

export default NextAuth(authOptions);
