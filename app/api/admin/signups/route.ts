import { NextResponse } from 'next/server';
import { createNeonClient } from '../../../../lib/neon';

export async function GET() {
  const client = createNeonClient();
  try {
    await client.connect();
    const result = await client.query(
      'SELECT id, email, whatsapp, role, lang, created_at FROM early_access_signups ORDER BY created_at DESC'
    );
    return NextResponse.json({ count: result.rows.length, signups: result.rows });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  } finally {
    await client.end().catch(() => {});
  }
}
