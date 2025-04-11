import { Role } from '@prisma/client';
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
      role: Role;
      usedAbsences: number;
      absenceCap: number;
    } & DefaultSession['user'];
  }

  interface User {
    id: number;
    role: Role;
    usedAbsences: number;
    absenceCap: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: number;
    role: Role;
    usedAbsences: number;
    absenceCap: number;
  }
}
