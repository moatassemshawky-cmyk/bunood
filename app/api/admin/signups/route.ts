import { NextResponse } from 'next/server';
import { createNeonClient } from '../../../../lib/neon';

/** Validates Bearer token against ADMIN_SECRET env var. Fails closed if env is not set. */
function isAuthorized(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return request.headers.get('Authorization') === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = createNeonClient();
  try {
    await client.connect();
    const result = await client.query(
      'SELECT id, email, whatsapp, role, lang, created_at FROM early_access_signups ORDER BY created_at DESC'
    );
    return NextResponse.json({ count: result.rows.length, signups: result.rows });
  } catch (error) {
    console.error('[admin/signups] DB error:', error);
    return NextResponse.json({ error: 'Failed to fetch signups' }, { status: 500 });
  } finally {
    await client.end().catch(() => {});
  }
}
