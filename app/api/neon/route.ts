import { NextResponse } from 'next/server';
import { createNeonClient } from '../../../lib/neon';

/** Debug/health-check endpoint — secured with ADMIN_SECRET. */
export async function GET(request: Request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || request.headers.get('Authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = createNeonClient();
  try {
    await client.connect();
    const result = await client.query('SELECT NOW()');
    return NextResponse.json({ now: result.rows[0].now, status: 'ok' });
  } catch (error) {
    console.error('[neon] DB connection error:', error);
    return NextResponse.json({ error: 'DB connection failed' }, { status: 500 });
  } finally {
    await client.end().catch(() => {});
  }
}
