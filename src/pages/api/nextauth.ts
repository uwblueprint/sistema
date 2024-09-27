// pages/api/auth/[...nextauth].ts
import { authOptions } from '../authOptions'; // Adjust based on your project structure
import NextAuth from 'next-auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
