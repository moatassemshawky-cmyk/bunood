import { NextResponse } from 'next/server';
import { createNeonClient } from '../../../lib/neon';

export async function POST(request: Request) {
  const { email, whatsapp, role, lang } = await request.json();

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  let client;
  try {
    client = createNeonClient();
    await client.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS early_access_signups (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        whatsapp TEXT,
        role TEXT,
        lang TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const result = await client.query(
      'INSERT INTO early_access_signups (email, whatsapp, role, lang) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET whatsapp = EXCLUDED.whatsapp, role = EXCLUDED.role, lang = EXCLUDED.lang RETURNING id, email, whatsapp, role, lang, created_at',
      [email.trim(), typeof whatsapp === 'string' ? whatsapp.trim() : null, typeof role === 'string' ? role : null, typeof lang === 'string' ? lang : null],
    );

    return NextResponse.json({ success: true, signup: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  } finally {
    if (client) {
      await client.end();
    }
  }
}
