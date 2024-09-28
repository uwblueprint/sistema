import NextAuth from 'next-auth';
import { authOptions } from '../../../../src/lib/authOptions';

// Use NextAuth directly
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
