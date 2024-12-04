import NextAuth from 'next-auth';
import Google, { GoogleProfile } from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';

import { prisma } from './app/api/prisma';

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,

      // overriding default authorization scopes
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],

  adapter: PrismaAdapter(prisma),

  callbacks: {
    async signIn({ account, profile }) {
      // ensure that the provider is google and profile is defined
      // else throw error
      if (!account || account.provider !== 'google' || !profile) {
        console.error('Account not defined or Account provider is not Google');
        return false;
      }
      // we can safely assert that provider is Google and profile is defined
      const googleProfile = profile as GoogleProfile;
      const firstName = googleProfile.given_name || '';
      const lastName = googleProfile.family_name || '';

      try {
        // find user if it exists
        const isExistingUser =
          // using abstract != instead of !== on purpose
          null !=
          (await prisma.user.findUnique({
            where: { email: googleProfile.email },
          }));

        if (isExistingUser) return true;

        // Since user does not exist,
        // create new User & Account records in DB
        // then return true.
        const newUser = await prisma.user.create({
          data: {
            authId: account.providerAccountId,
            email: googleProfile.email,
            firstName,
            lastName,
          },
        });

        await prisma.account.create({
          data: {
            userId: newUser.id,
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

        return true;
      } catch (error) {
        console.error('Error during sign-in:', error);
        return false;
      }
    },
  },
});
