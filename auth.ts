// This is the configuration file for next-auth (now, more generally known as auth.js) https://authjs.dev/
// Expects the following in the .env file: AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET

import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
})