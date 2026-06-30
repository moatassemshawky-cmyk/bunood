import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createNeonClient } from '../../../../lib/neon';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[\d\s\+\-\(\)]{7,20}$/;
const SESSION_DAYS = 7;

function sessionCookie(token: string): string {
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000).toUTCString();
  return `bn_supplier_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Expires=${expires}`;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const {
    companyName, contactPerson, mobile, email,
    password, confirmPassword, categories, deliveryAreas, termsAccepted,
  } = body as Record<string, unknown>;

  /* ── Validate ─────────────────────────────────────────── */
  if (!companyName || typeof companyName !== 'string' || companyName.trim().length < 2)
    return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
  if (!contactPerson || typeof contactPerson !== 'string' || contactPerson.trim().length < 2)
    return NextResponse.json({ error: 'Contact person name is required' }, { status: 400 });
  if (!mobile || typeof mobile !== 'string' || !MOBILE_RE.test(mobile.trim()))
    return NextResponse.json({ error: 'Valid mobile number is required' }, { status: 400 });
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim()))
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  if (!password || typeof password !== 'string' || password.length < 8)
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  if (password !== confirmPassword)
    return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
  if (!Array.isArray(categories) || categories.length === 0)
    return NextResponse.json({ error: 'Select at least one category' }, { status: 400 });
  if (!Array.isArray(deliveryAreas) || deliveryAreas.length === 0)
    return NextResponse.json({ error: 'Select at least one delivery area' }, { status: 400 });
  if (termsAccepted !== true)
    return NextResponse.json({ error: 'You must accept the terms' }, { status: 400 });

  /* ── Hash password ────────────────────────────────────── */
  const passwordHash = await bcrypt.hash(password as string, 12);

  /* ── Persist ──────────────────────────────────────────── */
  const client = createNeonClient();
  try {
    await client.connect();

    const safeEmail = (email as string).trim().toLowerCase();

    // Insert supplier
    const { rows } = await client.query<{ id: number }>(
      `INSERT INTO suppliers
         (company_name, contact_person, mobile, email, password_hash,
          categories, delivery_areas, terms_accepted)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id`,
      [
        (companyName as string).trim(),
        (contactPerson as string).trim(),
        (mobile as string).trim(),
        safeEmail,
        passwordHash,
        categories as string[],
        deliveryAreas as string[],
        true,
      ],
    );

    const supplierId = rows[0].id;

    // Create session token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
    await client.query(
      `INSERT INTO supplier_sessions (token, supplier_id, expires_at)
       VALUES ($1, $2, $3)`,
      [token, supplierId, expiresAt],
    );

    return NextResponse.json(
      { success: true, supplierId },
      { headers: { 'Set-Cookie': sessionCookie(token) } },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      );
    }
    console.error('[supplier/register]', err);
    return NextResponse.json({ error: 'Registration failed. Try again.' }, { status: 500 });
  } finally {
    await client.end().catch(() => {});
  }
}
