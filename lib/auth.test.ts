import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock('./db', () => ({
  withClient: async (fn: (client: { query: typeof queryMock }) => unknown) => fn({ query: queryMock }),
}));

import { registerUser, login, logout, getSessionAccount } from './auth';

beforeEach(() => {
  queryMock.mockReset();
});

describe('registerUser — Supplier Registration', () => {
  const validBody = {
    companyName: 'Delta Steel Co.',
    contactPerson: 'Ahmed Hassan',
    mobile: '01141808095',
    email: 'delta@example.com',
    password: 'SecurePass123',
    confirmPassword: 'SecurePass123',
    categories: ['Steel'],
    deliveryAreas: ['Cairo'],
    termsAccepted: true,
  };

  it('rejects an empty category selection before touching the database', async () => {
    const result = await registerUser('supplier', { ...validBody, categories: [] });
    expect(result).toEqual({ ok: false, error: 'Select at least one category', status: 400 });
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('rejects a weak password before touching the database', async () => {
    const result = await registerUser('supplier', { ...validBody, password: 'short', confirmPassword: 'short' });
    expect(result).toEqual({ ok: false, error: 'Password must be at least 8 characters', status: 400 });
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('creates the account and a session on valid input', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: 42 }] })   // INSERT INTO suppliers ... RETURNING id
      .mockResolvedValueOnce({ rows: [] });             // INSERT INTO supplier_sessions

    const result = await registerUser('supplier', validBody);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.id).toBe(42);
      expect(result.role).toBe('supplier');
      expect(result.dashboardPath).toBe('/supplier/dashboard');
      expect(result.cookie).toContain('bn_supplier_session=');
    }
    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(queryMock.mock.calls[0][0]).toContain('INSERT INTO suppliers');
  });

  it('returns a generic duplicate-email error on a unique-constraint violation', async () => {
    queryMock.mockRejectedValueOnce({ code: '23505' });
    const result = await registerUser('supplier', validBody);
    expect(result).toEqual({ ok: false, error: 'An account with this email already exists', status: 409 });
  });
});

describe('registerUser — Engineer Registration', () => {
  const validBody = {
    fullName: 'Eng. Sara Ali',
    mobile: '01141808095',
    email: 'sara@example.com',
    password: 'SecurePass123',
    confirmPassword: 'SecurePass123',
    specialization: 'Civil Engineering',
    yearsExperience: '3-5',
    city: 'Cairo',
    termsAccepted: true,
  };

  it('rejects a missing specialization', async () => {
    const result = await registerUser('engineer', { ...validBody, specialization: '' });
    expect(result).toEqual({ ok: false, error: 'Specialization is required', status: 400 });
  });

  it('creates the account and a session on valid input', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: 7 }] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await registerUser('engineer', validBody);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.dashboardPath).toBe('/engineer/dashboard');
      expect(result.cookie).toContain('bn_engineer_session=');
    }
    expect(queryMock.mock.calls[0][0]).toContain('INSERT INTO engineers');
  });
});

describe('registerUser — Contractor Registration', () => {
  const validBody = {
    companyName: 'Nile Builders',
    contactPerson: 'Omar Youssef',
    mobile: '01141808095',
    email: 'omar@example.com',
    password: 'SecurePass123',
    confirmPassword: 'SecurePass123',
    workTypes: ['Concrete Works'],
    companySize: '10-50',
    city: 'Cairo',
    termsAccepted: true,
  };

  it('rejects an empty work-types selection', async () => {
    const result = await registerUser('contractor', { ...validBody, workTypes: [] });
    expect(result).toEqual({ ok: false, error: 'Select at least one work type', status: 400 });
  });

  it('defaults an omitted countriesServed to an empty array rather than failing', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: 3 }] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await registerUser('contractor', validBody);
    expect(result.ok).toBe(true);
    const insertValues = queryMock.mock.calls[0][1] as unknown[];
    expect(insertValues).toContainEqual([]);
  });
});

describe('login — unified login', () => {
  it('reports "no account" after checking every provider, without leaking which one', async () => {
    queryMock.mockResolvedValue({ rows: [] }); // empty match in engineer, contractor, and supplier
    const result = await login('nobody@example.com', 'whatever123');
    expect(result).toEqual({ ok: false, reason: 'no-account' });
    expect(queryMock).toHaveBeenCalledTimes(3);
  });

  it('reports "wrong password" without revealing which role owns the email', async () => {
    const realHash = await bcrypt.hash('CorrectPass123', 12);
    queryMock
      .mockResolvedValueOnce({ rows: [] })                                                 // engineer: no match
      .mockResolvedValueOnce({ rows: [{ id: 1, password_hash: realHash, name: 'Acme' }] })   // contractor: match
      .mockResolvedValueOnce({ rows: [] });                                                 // supplier: no match

    const result = await login('acme@example.com', 'WrongPassword');
    expect(result).toEqual({ ok: false, reason: 'wrong-password' });
  });

  it('logs in and returns the correct role + dashboard on a valid match', async () => {
    const realHash = await bcrypt.hash('CorrectPass123', 12);
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: 5, password_hash: realHash, name: 'Eng. Sara Ali' }] }) // engineer: match
      .mockResolvedValueOnce({ rows: [] })   // contractor: no match
      .mockResolvedValueOnce({ rows: [] })   // supplier: no match
      .mockResolvedValueOnce({ rows: [] });  // session insert

    const result = await login('sara@example.com', 'CorrectPass123');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.role).toBe('engineer');
      expect(result.dashboardPath).toBe('/engineer/dashboard');
      expect(result.cookie).toContain('bn_engineer_session=');
    }
    expect(queryMock).toHaveBeenCalledTimes(4);
  });
});

describe('logout', () => {
  it('deletes the session row for the given role and token', async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });
    await logout('supplier', 'some-token');
    expect(queryMock).toHaveBeenCalledTimes(1);
    const [sql, params] = queryMock.mock.calls[0];
    expect(sql).toContain('DELETE FROM supplier_sessions');
    expect(params).toEqual(['some-token']);
  });
});

describe('getSessionAccount — Session Validation', () => {
  it('returns null immediately when no token is provided, without querying the database', async () => {
    const result = await getSessionAccount('engineer', undefined);
    expect(result).toBeNull();
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('returns null for an invalid or expired token', async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });
    const result = await getSessionAccount('engineer', 'bad-token');
    expect(result).toBeNull();
  });

  it('returns the account for a valid, unexpired token', async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 9, name: 'Eng. Sara Ali', email: 'sara@example.com' }] });
    const result = await getSessionAccount('engineer', 'good-token');
    expect(result).toEqual({ id: 9, name: 'Eng. Sara Ali', email: 'sara@example.com' });
  });
});
