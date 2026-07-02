import { NextResponse } from 'next/server';
import { logout, type Role } from '../../../../lib/auth';

const COOKIE_NAMES: Record<Role, string> = {
  engineer: 'bn_engineer_session',
  contractor: 'bn_contractor_session',
  supplier: 'bn_supplier_session',
};

function clearCookie(name: string): string {
  return `${name}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

/**
 * Logs out whichever role's session cookie is present — no role picker needed,
 * mirroring the unified login. Clears every session cookie found (normally
 * just one) so the client always ends up fully signed out.
 */
export async function POST(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const present = new Map(
    cookieHeader
      .split(';')
      .map(c => c.trim().split('='))
      .filter((pair): pair is [string, string] => pair.length === 2 && pair[0].length > 0),
  );

  const headers = new Headers();
  for (const [role, cookieName] of Object.entries(COOKIE_NAMES) as [Role, string][]) {
    const token = present.get(cookieName);
    if (!token) continue;
    await logout(role, token).catch(err => console.error(`[auth/logout] ${role}`, err));
    headers.append('Set-Cookie', clearCookie(cookieName));
  }

  return NextResponse.json({ success: true }, { headers });
}
