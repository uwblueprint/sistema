import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './app/api/prisma';

// Custom Google Profile Type
interface GoogleProfile {
  sub: string;
  name: string;
  email: string;
  picture: string;
  given_name: string;
  family_name: string;
}

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

  debug: true,

  callbacks: {
    async signIn({ account, profile }) {
      console.log('Account: ', account);
      console.log('Profile: ', profile);
      const googleProfile = profile as any;

      const firstName = googleProfile.given_name || '';
      const lastName = googleProfile.family_name || '';

      if (account?.provider === 'google' && profile?.email) {
        try {
          let existingUser = await prisma.user.findUnique({
            where: { email: profile.email },
          });

          if (!existingUser) {
            console.log('Creating new user...');
            // console.log(account.providerAccountId);
            existingUser = await prisma.user.create({
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
            console.log(
              'BAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAMBAM'
            );
            console.log('NEW USER IS CREATED   ', existingUser.id);

            console.log('ONTO ACCOUNTS');

            await prisma.account.create({
              data: {
                userId: existingUser.id,
                provider: account.provider!,
                providerAccountId: account.providerAccountId!,
                refreshToken: account.refresh_token,
                accessToken: account.access_token,
                accessTokenExpires: account.expires_at
                  ? new Date(account.expires_at * 1000)
                  : null,
                providerType: 'oauth',
              },
            });
            console.log('Linked Google account to existing user');
          }

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
