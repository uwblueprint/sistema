import { NextResponse } from 'next/server';
import { auth } from './auth'; // Import your NextAuth auth instance
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const session = await auth();

  if (req.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!$).*)'],
};
