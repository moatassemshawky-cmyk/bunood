import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { withClient } from '../../../../lib/db';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_DAYS = 7;

function sessionCookie(token: string): string {
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000).toUTCString();
  return `bn_supplier_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Expires=${expires}`;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { email, password } = body as { email?: string; password?: string };

  if (!email || !EMAIL_RE.test(email.trim()))
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  if (!password || password.length < 1)
    return NextResponse.json({ error: 'Password is required' }, { status: 400 });

  try {
    return await withClient(async (client) => {
      const { rows } = await client.query<{
        id: number; password_hash: string; company_name: string; status: string;
      }>(
        `SELECT id, password_hash, company_name, status
         FROM suppliers WHERE email = $1`,
        [email.trim().toLowerCase()],
      );

      const supplier = rows[0];

      // Constant-time path — always hash-compare even if supplier not found
      const dummyHash = '$2b$12$invalidhashfortimingattackprevention000000000000000000';
      const match = await bcrypt.compare(password, supplier?.password_hash ?? dummyHash);

      if (!supplier || !match) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 },
        );
      }

      // Create new session
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
      await client.query(
        `INSERT INTO supplier_sessions (token, supplier_id, expires_at)
         VALUES ($1, $2, $3)`,
        [token, supplier.id, expiresAt],
      );

      return NextResponse.json(
        { success: true, companyName: supplier.company_name },
        { headers: { 'Set-Cookie': sessionCookie(token) } },
      );
    });
  } catch (err) {
    console.error('[supplier/login]', err);
    return NextResponse.json({ error: 'Login failed. Try again.' }, { status: 500 });
  }
}
