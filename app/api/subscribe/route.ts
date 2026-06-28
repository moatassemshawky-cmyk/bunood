import { NextResponse } from 'next/server';
import { createNeonClient } from '../../../lib/neon';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = new Set(['engineer', 'contractor', 'supplier']);
const ALLOWED_LANGS = new Set(['ar', 'en']);

export async function POST(request: Request) {
  // Gracefully handle malformed JSON
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { email, whatsapp, role, lang } = body;

  // Validate email
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Whitelist and sanitize optional fields
  const safeEmail    = email.trim().toLowerCase();
  const safeWhatsapp = typeof whatsapp === 'string' ? whatsapp.trim() || null : null;
  const safeRole     = typeof role === 'string' && ALLOWED_ROLES.has(role) ? role : null;
  const safeLang     = typeof lang === 'string' && ALLOWED_LANGS.has(lang) ? lang : null;

  const client = createNeonClient();
  try {
    await client.connect();

    // TODO: Move this to a one-time migration script. Running DDL on every
    // request works but is wasteful once the table exists.
    await client.query(`
      CREATE TABLE IF NOT EXISTS early_access_signups (
        id          SERIAL PRIMARY KEY,
        email       TEXT UNIQUE NOT NULL,
        whatsapp    TEXT,
        role        TEXT,
        lang        TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(
      `INSERT INTO early_access_signups (email, whatsapp, role, lang)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE
         SET whatsapp   = EXCLUDED.whatsapp,
             role       = EXCLUDED.role,
             lang       = EXCLUDED.lang`,
      [safeEmail, safeWhatsapp, safeRole, safeLang],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log full error server-side; return a generic message to the client
    // so we never leak connection strings, table schemas, or internal details.
    console.error('[subscribe] DB error:', error);
    return NextResponse.json({ error: 'Failed to save signup. Please try again.' }, { status: 500 });
  } finally {
    await client.end().catch(() => {});
  }
}
