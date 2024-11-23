import NextAuth from 'next-auth';
import Google, { GoogleProfile } from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';

import { prisma } from './app/api/prisma';

console.log('auth running');

// Custom Google Profile Type
// interface GoogleProfile {
//   sub: string;
//   name: string;
//   email: string;
//   picture: string;
//   given_name: string;
//   family_name: string;
// }

// export const authOptions: NextAuthConfig = {
export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,

      // temp rahul commentary: overriding default authorization scopes
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },

      // what I return will be used to create the user object in the database
      // profile(profile: GoogleProfile) {
      //   return {
      //     id: profile.sub,
      //     name: profile.name,
      //     email: profile.email,
      //     picture: profile.picture,
      //     firstName: profile.given_name,
      //     lastName: profile.family_name,
      //   };
      // },
    }),
  ],

  adapter: PrismaAdapter(prisma),

  // debug: true,

  callbacks: {
    async signIn({ account, profile }) {
      console.log('Account: ', account);
      console.log('Profile: ', profile);
      // const googleProfile = profile as any;
      if (account?.provider !== 'google' || !profile) {
        console.error('');
        return false;
      }
      // if I'm here, I know that the provider is google and profile is defined
      const googleProfile = profile as GoogleProfile;
      const firstName = googleProfile.given_name || '';
      const lastName = googleProfile.family_name || '';

      try {
        // find user if it exists
        let existingUser = await prisma.user.findUnique({
          where: { email: googleProfile.email },
        });

        /**
         * TODOs
         * abstraction & ease of reading
         * ? in typescript.
         * user vs account stuff
         */

        // if user does not exist, create user and account.
        if (!existingUser) {
          existingUser = await prisma.user.create({
            data: {
              authId: account.providerAccountId,
              email: googleProfile.email,
              firstName,
              lastName,
            },
          });

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
        }

        return true;
      } catch (error) {
        console.error('Error during sign-in:', error);
        return false;
      }
      // }
      return false;
    },
  },
});

// export default NextAuth(authOptions);
// export const { auth, handlers, signIn, signOut } = NextAuth(authOptions)
