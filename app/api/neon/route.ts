import { NextResponse } from 'next/server';
import { withClient } from '../../../lib/db';

/** Debug/health-check endpoint — secured with ADMIN_SECRET. */
export async function GET(request: Request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || request.headers.get('Authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return await withClient(async (client) => {
      const result = await client.query('SELECT NOW()');
      return NextResponse.json({ now: result.rows[0].now, status: 'ok' });
    });
  } catch (error) {
    console.error('[neon] DB connection error:', error);
    return NextResponse.json({ error: 'DB connection failed' }, { status: 500 });
  }
}
