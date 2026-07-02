import { NextResponse } from 'next/server';
import { registerUser } from '../../../../lib/auth';

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const result = await registerUser('contractor', body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  const response = NextResponse.json({ ok: true, id: result.id }, { status: 201 });
  response.headers.set('Set-Cookie', result.cookie);
  return response;
}
