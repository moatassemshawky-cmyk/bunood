import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createNeonClient } from '../../../../lib/neon';

const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[\d\s\+\-\(\)]{7,20}$/;
const SESSION_DAYS = 7;

function sessionCookie(token: string): string {
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000).toUTCString();
  return `bn_engineer_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Expires=${expires}`;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const {
    fullName, mobile, email, password, confirmPassword,
    specialization, otherSpec, licenseNumber, yearsExperience, city, termsAccepted,
  } = body as Record<string, unknown>;

  /* ── Validate ────────────────────────────────────────────── */
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2)
    return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
  if (!mobile || typeof mobile !== 'string' || !MOBILE_RE.test(mobile.trim()))
    return NextResponse.json({ error: 'Valid mobile number is required' }, { status: 400 });
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim()))
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  if (!password || typeof password !== 'string' || password.length < 8)
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  if (password !== confirmPassword)
    return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
  if (!specialization || typeof specialization !== 'string')
    return NextResponse.json({ error: 'Specialization is required' }, { status: 400 });
  if (!yearsExperience || typeof yearsExperience !== 'string')
    return NextResponse.json({ error: 'Years of experience is required' }, { status: 400 });
  if (!city || typeof city !== 'string')
    return NextResponse.json({ error: 'City is required' }, { status: 400 });
  if (termsAccepted !== true)
    return NextResponse.json({ error: 'You must accept the terms' }, { status: 400 });

  /* ── Hash password ───────────────────────────────────────── */
  const passwordHash = await bcrypt.hash(password as string, 12);

  /* ── Persist ─────────────────────────────────────────────── */
  const client = createNeonClient();
  try {
    await client.connect();
    const safeEmail = (email as string).trim().toLowerCase();

    const { rows } = await client.query<{ id: number }>(
      `INSERT INTO engineers
         (full_name, mobile, email, password_hash, specialization, other_specialization,
          license_number, years_experience, city, terms_accepted)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [
        (fullName as string).trim(),
        (mobile as string).trim(),
        safeEmail,
        passwordHash,
        specialization,
        (otherSpec as string | undefined) || null,
        (licenseNumber as string | undefined) || null,
        yearsExperience,
        city,
        true,
      ]
    );

    /* ── Session token ───────────────────────────────────────── */
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
    await client.query(
      `INSERT INTO engineer_sessions (engineer_id, token, expires_at) VALUES ($1,$2,$3)`,
      [rows[0].id, token, expiresAt]
    );

    const response = NextResponse.json({ ok: true, id: rows[0].id }, { status: 201 });
    response.headers.set('Set-Cookie', sessionCookie(token));
    return response;

  } catch (err: unknown) {
    const pg = err as { code?: string };
    if (pg.code === '23505')
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    console.error('Engineer register error:', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  } finally {
    await client.end();
  }
}
