import { NextResponse } from 'next/server';
import { login } from '../../../../lib/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { email, password } = body as { email?: string; password?: string };

  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim()))
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  if (!password || typeof password !== 'string' || password.length < 1)
    return NextResponse.json({ error: 'Password is required' }, { status: 400 });

  try {
    const result = await login(email, password);

    if (!result.ok) {
      const error = result.reason === 'no-account'
        ? 'No account found with this email.'
        : 'Incorrect password.';
      return NextResponse.json({ error }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      role: result.role,
      name: result.name,
      redirectTo: result.dashboardPath,
    });
    response.headers.set('Set-Cookie', result.cookie);
    return response;
  } catch (err) {
    console.error('[auth/login]', err);
    return NextResponse.json({ error: 'Something went wrong on our end. Please try again in a moment.' }, { status: 500 });
  }
}
