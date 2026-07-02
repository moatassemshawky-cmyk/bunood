import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Fast first line of defense: redirect to /login if the relevant session
 * cookie is entirely absent, before a page even starts rendering. This does
 * NOT validate the token against the database (session validity/expiry is
 * checked server-side per dashboard via lib/auth.ts's getSessionAccount) —
 * it only blocks the trivial "no cookie at all" case.
 */
const GUARDS: { prefix: string; cookie: string }[] = [
  { prefix: '/supplier/dashboard', cookie: 'bn_supplier_session' },
  { prefix: '/engineer/dashboard', cookie: 'bn_engineer_session' },
  { prefix: '/contractor/dashboard', cookie: 'bn_contractor_session' },
];

export function proxy(request: NextRequest) {
  const guard = GUARDS.find(g => request.nextUrl.pathname.startsWith(g.prefix));
  if (guard && !request.cookies.get(guard.cookie)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/supplier/dashboard/:path*', '/engineer/dashboard/:path*', '/contractor/dashboard/:path*'],
};
