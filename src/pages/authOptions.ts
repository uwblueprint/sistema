import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '../lib/prisma'; // Adjust path based on your project structure

// Custom Google Profile Type
interface GoogleProfile {
  sub: string;
  name: string;
  email: string;
  picture: string;
  given_name: string;
  family_name: string;
}

// Define your NextAuth options
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
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
      const googleProfile = profile as any; // or profile as GoogleProfile

      const firstName = googleProfile.firstName || '';
      const lastName = googleProfile.lastName || '';

      if (account?.provider === 'google' && profile?.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                authId: account.id as string,
                email: profile.email,
                firstName,
                lastName,
                role: 'TEACHER',
                status: 'INVITED',
                numOfAbsences: 10,
              },
            });
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

// Export the NextAuth handler with the correct authOptions
export default NextAuth(authOptions);
