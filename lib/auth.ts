import bcrypt from 'bcryptjs';
import { withClient } from './db';

export type Role = 'engineer' | 'contractor' | 'supplier';

interface AuthProvider {
  role: Role;
  table: string;
  sessionTable: string;
  sessionIdColumn: string;
  cookieName: string;
  dashboardPath: string;
  nameColumn: string;
}

/**
 * One entry per role. To add a future role (Admin, Consultant, Manufacturer …),
 * append a provider here — login()/session logic below never needs to change.
 * Table/column names are hardcoded internal identifiers, not user input, so
 * interpolating them into SQL below is safe.
 */
const AUTH_PROVIDERS: AuthProvider[] = [
  {
    role: 'engineer',
    table: 'engineers',
    sessionTable: 'engineer_sessions',
    sessionIdColumn: 'engineer_id',
    cookieName: 'bn_engineer_session',
    dashboardPath: '/engineer/dashboard',
    nameColumn: 'full_name',
  },
  {
    role: 'contractor',
    table: 'contractors',
    sessionTable: 'contractor_sessions',
    sessionIdColumn: 'contractor_id',
    cookieName: 'bn_contractor_session',
    dashboardPath: '/contractor/dashboard',
    nameColumn: 'company_name',
  },
  {
    role: 'supplier',
    table: 'suppliers',
    sessionTable: 'supplier_sessions',
    sessionIdColumn: 'supplier_id',
    cookieName: 'bn_supplier_session',
    dashboardPath: '/supplier/dashboard',
    nameColumn: 'company_name',
  },
];

const SESSION_DAYS = 7;
// Valid bcrypt hash of a value nobody can type, so a "no account" login still pays
// the cost of one real bcrypt.compare — keeps response time independent of whether
// the email exists at all, or in which role's table it lives.
const DUMMY_HASH = '$2b$12$invalidhashfortimingattackprevention000000000000000000';

export type LoginResult =
  | { ok: true; role: Role; name: string; dashboardPath: string; cookie: string }
  | { ok: false; reason: 'no-account' | 'wrong-password' };

function sessionCookie(cookieName: string, token: string): string {
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000).toUTCString();
  return `${cookieName}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Expires=${expires}`;
}

/**
 * Looks up the email across every registered provider (engineer, then
 * contractor, then supplier), verifies the password, and creates a session
 * in the matching role's session table. Always queries every provider table
 * and always performs exactly one bcrypt compare, so the response shape and
 * timing don't reveal which role (or whether any role) owns the email.
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  const safeEmail = email.trim().toLowerCase();

  return withClient(async (client) => {
    let matched: { provider: AuthProvider; id: number; passwordHash: string; name: string } | null = null;

    for (const provider of AUTH_PROVIDERS) {
      const { rows } = await client.query<{ id: number; password_hash: string; name: string }>(
        `SELECT id, password_hash, ${provider.nameColumn} AS name FROM ${provider.table} WHERE email = $1`,
        [safeEmail],
      );
      if (rows[0] && !matched) {
        matched = { provider, id: rows[0].id, passwordHash: rows[0].password_hash, name: rows[0].name };
      }
    }

    const passwordMatches = await bcrypt.compare(password, matched?.passwordHash ?? DUMMY_HASH);

    if (!matched) return { ok: false, reason: 'no-account' };
    if (!passwordMatches) return { ok: false, reason: 'wrong-password' };

    const { provider, id, name } = matched;
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
    await client.query(
      `INSERT INTO ${provider.sessionTable} (${provider.sessionIdColumn}, token, expires_at) VALUES ($1,$2,$3)`,
      [id, token, expiresAt],
    );

    return {
      ok: true,
      role: provider.role,
      name,
      dashboardPath: provider.dashboardPath,
      cookie: sessionCookie(provider.cookieName, token),
    };
  });
}
