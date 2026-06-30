import { NextResponse } from 'next/server';
import { createNeonClient } from '../../../../lib/neon';

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const token = cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('bn_supplier_session='))
    ?.split('=')[1];

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const client = createNeonClient();
  try {
    await client.connect();
    const { rows } = await client.query<{
      id: number; company_name: string; contact_person: string;
      email: string; categories: string[]; delivery_areas: string[]; status: string;
    }>(
      `SELECT s.id, s.company_name, s.contact_person, s.email,
              s.categories, s.delivery_areas, s.status
       FROM suppliers s
       JOIN supplier_sessions ss ON ss.supplier_id = s.id
       WHERE ss.token = $1 AND ss.expires_at > NOW()`,
      [token],
    );

    if (!rows[0]) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    return NextResponse.json({ supplier: rows[0] });
  } catch (err) {
    console.error('[supplier/me]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await client.end().catch(() => {});
  }
}
