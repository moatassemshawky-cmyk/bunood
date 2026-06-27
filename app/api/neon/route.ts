import { NextResponse } from 'next/server';
import { createNeonClient } from '../../../lib/neon';

export async function GET() {
  const client = createNeonClient();
  try {
    const result = await client.query('SELECT NOW()');
    await client.end();
    return NextResponse.json({ now: result.rows[0].now });
  } catch (error) {
    await client.end();
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
