import bcrypt from 'bcryptjs';
import type { Client } from '@neondatabase/serverless';
import { withClient } from './db';

export type Role = 'engineer' | 'contractor' | 'supplier';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MOBILE_RE = /^[\d\s\+\-\(\)]{7,20}$/;

/** One column/validation rule for a role-specific registration field. */
type FieldSpec =
  | { kind: 'text'; minLength?: number }   // required non-empty string (optionally min length, trimmed)
  | { kind: 'optionalText' }               // optional string, stored as-is or null
  | { kind: 'requiredArray' }              // must be a non-empty array
  | { kind: 'optionalArray' };             // array if present, otherwise stored as []

interface RegistrationField {
  key: string;      // camelCase key in the request body
  column: string;   // snake_case column in the DB table
  spec: FieldSpec;
  error?: string;    // required for 'text' and 'requiredArray' specs
}

interface AuthProvider {
  role: Role;
  table: string;
  sessionTable: string;
  sessionIdColumn: string;
  cookieName: string;
  dashboardPath: string;
  nameColumn: string;
  /** Role-specific fields inserted alongside the common mobile/email/password_hash/terms_accepted columns. */
  fields: RegistrationField[];
}

/**
 * One entry per role. To add a future role (Admin, Consultant, Manufacturer …),
 * append a provider here — login()/registerUser()/session logic below never needs
 * to change. Table/column names are hardcoded internal identifiers, not user
 * input, so interpolating them into SQL below is safe.
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
    fields: [
      { key: 'fullName', column: 'full_name', spec: { kind: 'text', minLength: 2 }, error: 'Full name is required' },
      { key: 'specialization', column: 'specialization', spec: { kind: 'text' }, error: 'Specialization is required' },
      { key: 'otherSpec', column: 'other_specialization', spec: { kind: 'optionalText' } },
      { key: 'company', column: 'company', spec: { kind: 'optionalText' } },
      { key: 'country', column: 'country', spec: { kind: 'optionalText' } },
      { key: 'licenseNumber', column: 'license_number', spec: { kind: 'optionalText' } },
      { key: 'yearsExperience', column: 'years_experience', spec: { kind: 'text' }, error: 'Years of experience is required' },
      { key: 'city', column: 'city', spec: { kind: 'text' }, error: 'City is required' },
    ],
  },
  {
    role: 'contractor',
    table: 'contractors',
    sessionTable: 'contractor_sessions',
    sessionIdColumn: 'contractor_id',
    cookieName: 'bn_contractor_session',
    dashboardPath: '/contractor/dashboard',
    nameColumn: 'company_name',
    fields: [
      { key: 'companyName', column: 'company_name', spec: { kind: 'text', minLength: 2 }, error: 'Company name is required' },
      { key: 'contactPerson', column: 'contact_person', spec: { kind: 'text', minLength: 2 }, error: 'Contact person is required' },
      { key: 'workTypes', column: 'work_types', spec: { kind: 'requiredArray' }, error: 'Select at least one work type' },
      { key: 'companySize', column: 'company_size', spec: { kind: 'text' }, error: 'Company size is required' },
      { key: 'crNumber', column: 'cr_number', spec: { kind: 'optionalText' } },
      { key: 'taxNumber', column: 'tax_number', spec: { kind: 'optionalText' } },
      { key: 'countriesServed', column: 'countries_served', spec: { kind: 'optionalArray' } },
      { key: 'yearsInBusiness', column: 'years_in_business', spec: { kind: 'optionalText' } },
      { key: 'city', column: 'city', spec: { kind: 'text' }, error: 'City is required' },
    ],
  },
  {
    role: 'supplier',
    table: 'suppliers',
    sessionTable: 'supplier_sessions',
    sessionIdColumn: 'supplier_id',
    cookieName: 'bn_supplier_session',
    dashboardPath: '/supplier/dashboard',
    nameColumn: 'company_name',
    fields: [
      { key: 'companyName', column: 'company_name', spec: { kind: 'text', minLength: 2 }, error: 'Company name is required' },
      { key: 'contactPerson', column: 'contact_person', spec: { kind: 'text', minLength: 2 }, error: 'Contact person name is required' },
      { key: 'categories', column: 'categories', spec: { kind: 'requiredArray' }, error: 'Select at least one category' },
      { key: 'deliveryAreas', column: 'delivery_areas', spec: { kind: 'requiredArray' }, error: 'Select at least one delivery area' },
    ],
  },
];

function getProvider(role: Role): AuthProvider {
  const provider = AUTH_PROVIDERS.find(p => p.role === role);
  if (!provider) throw new Error(`Unknown auth role: ${role}`);
  return provider;
}

const SESSION_DAYS = 7;
// Valid bcrypt hash of a value nobody can type, so a "no account" login still pays
// the cost of one real bcrypt.compare — keeps response time independent of whether
// the email exists at all, or in which role's table it lives.
const DUMMY_HASH = '$2b$12$invalidhashfortimingattackprevention000000000000000000';

function sessionCookie(cookieName: string, token: string): string {
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000).toUTCString();
  return `${cookieName}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Expires=${expires}`;
}

/** Creates a session row for the given account and returns the Set-Cookie value. */
async function createSession(client: Client, provider: AuthProvider, accountId: number): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await client.query(
    `INSERT INTO ${provider.sessionTable} (${provider.sessionIdColumn}, token, expires_at) VALUES ($1,$2,$3)`,
    [accountId, token, expiresAt],
  );
  return sessionCookie(provider.cookieName, token);
}

export type LoginResult =
  | { ok: true; role: Role; name: string; dashboardPath: string; cookie: string }
  | { ok: false; reason: 'no-account' | 'wrong-password' };

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
    const cookie = await createSession(client, provider, id);

    return { ok: true, role: provider.role, name, dashboardPath: provider.dashboardPath, cookie };
  });
}

/** Deletes the session row matching whichever role's cookie token is passed. */
export async function logout(role: Role, token: string): Promise<void> {
  const provider = getProvider(role);
  await withClient(async (client) => {
    await client.query(`DELETE FROM ${provider.sessionTable} WHERE token = $1`, [token]);
  });
}

export interface SessionAccount {
  id: number;
  name: string;
  email: string;
}

/**
 * Validates a session token for the given role and returns the account's
 * id/name/email if the session exists and hasn't expired, or null otherwise.
 * Shared by every dashboard so session-gating logic lives in exactly one place.
 */
export async function getSessionAccount(role: Role, token: string | undefined): Promise<SessionAccount | null> {
  if (!token) return null;
  const provider = getProvider(role);

  return withClient(async (client) => {
    const { rows } = await client.query<SessionAccount>(
      `SELECT id, ${provider.nameColumn} AS name, email FROM ${provider.table}
       WHERE id = (
         SELECT ${provider.sessionIdColumn} FROM ${provider.sessionTable}
         WHERE token = $1 AND expires_at > NOW()
       )`,
      [token],
    );
    return rows[0] ?? null;
  });
}

function validateField(field: RegistrationField, value: unknown): { value: unknown; error: string | null } {
  switch (field.spec.kind) {
    case 'text': {
      if (!value || typeof value !== 'string') return { value: null, error: field.error ?? `${field.key} is required` };
      if (field.spec.minLength !== undefined) {
        const trimmed = value.trim();
        if (trimmed.length < field.spec.minLength) return { value: null, error: field.error ?? `${field.key} is required` };
        return { value: trimmed, error: null };
      }
      return { value, error: null };
    }
    case 'optionalText':
      return { value: value || null, error: null };
    case 'requiredArray':
      if (!Array.isArray(value) || value.length === 0) return { value: null, error: field.error ?? `${field.key} is required` };
      return { value, error: null };
    case 'optionalArray':
      return { value: Array.isArray(value) ? value : [], error: null };
  }
}

export type RegisterResult =
  | { ok: true; role: Role; id: number; dashboardPath: string; cookie: string }
  | { ok: false; error: string; status: number };

/**
 * Role-based registration: validates the fields common to every role (email,
 * mobile, password, confirmPassword, termsAccepted), then the role-specific
 * fields declared on that provider, hashes the password, inserts the account,
 * and creates a session — the same shape every register route used to
 * hand-roll individually.
 */
export async function registerUser(role: Role, data: Record<string, unknown>): Promise<RegisterResult> {
  const provider = getProvider(role);
  const { email, mobile, password, confirmPassword, termsAccepted } = data;

  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim()))
    return { ok: false, error: 'Valid email is required', status: 400 };
  if (!mobile || typeof mobile !== 'string' || !MOBILE_RE.test(mobile.trim()))
    return { ok: false, error: 'Valid mobile number is required', status: 400 };
  if (!password || typeof password !== 'string' || password.length < 8)
    return { ok: false, error: 'Password must be at least 8 characters', status: 400 };
  if (password !== confirmPassword)
    return { ok: false, error: 'Passwords do not match', status: 400 };
  if (termsAccepted !== true)
    return { ok: false, error: 'You must accept the terms', status: 400 };

  const fieldValues: { column: string; value: unknown }[] = [];
  for (const field of provider.fields) {
    const result = validateField(field, data[field.key]);
    if (result.error) return { ok: false, error: result.error, status: 400 };
    fieldValues.push({ column: field.column, value: result.value });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const columns = ['mobile', 'email', 'password_hash', ...fieldValues.map(f => f.column), 'terms_accepted'];
  const values: unknown[] = [
    mobile.trim(),
    email.trim().toLowerCase(),
    passwordHash,
    ...fieldValues.map(f => f.value),
    true,
  ];
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(',');

  try {
    return await withClient(async (client) => {
      const { rows } = await client.query<{ id: number }>(
        `INSERT INTO ${provider.table} (${columns.join(',')}) VALUES (${placeholders}) RETURNING id`,
        values,
      );
      const id = rows[0].id;
      const cookie = await createSession(client, provider, id);
      return { ok: true, role: provider.role, id, dashboardPath: provider.dashboardPath, cookie };
    });
  } catch (err: unknown) {
    const pg = err as { code?: string };
    if (pg.code === '23505')
      return { ok: false, error: 'An account with this email already exists', status: 409 };
    console.error(`[register/${role}]`, err);
    return { ok: false, error: 'Something went wrong on our end. Please try again in a moment.', status: 500 };
  }
}
