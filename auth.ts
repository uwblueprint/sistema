// This is the configuration file for next-auth (now, more generally known as auth.js) https://authjs.dev/
// Expects the following in the .env file: AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          console.log('Google user authenticated:', user.email);

          const userData = {
            authId: user.id,
            email: user.email,
            firstName: profile?.given_name || user.name?.split(' ')[0] || '',
            lastName:
              profile?.family_name ||
              user.name?.split(' ').slice(1).join(' ') ||
              '',
            profilePicture: user.image || null,
          };

          const apiUrl =
            process.env.NODE_ENV === 'development'
              ? 'http://localhost:3000/api/auth/users'
              : `${process.env.NEXT_PUBLIC_PROD_URL}/api/auth/users`;

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            console.error(
              'Failed to add user to database',
              await response.json()
            );
            return false;
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});
