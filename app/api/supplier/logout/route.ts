import { NextResponse } from 'next/server';
import { createNeonClient } from '../../../../lib/neon';

export async function POST(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const token = cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('bn_supplier_session='))
    ?.split('=')[1];

  if (token) {
    const client = createNeonClient();
    try {
      await client.connect();
      await client.query(`DELETE FROM supplier_sessions WHERE token = $1`, [token]);
    } catch (err) {
      console.error('[supplier/logout]', err);
    } finally {
      await client.end().catch(() => {});
    }
  }

  // Clear cookie
  return NextResponse.json(
    { success: true },
    {
      headers: {
        'Set-Cookie':
          'bn_supplier_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
      },
    },
  );
}
