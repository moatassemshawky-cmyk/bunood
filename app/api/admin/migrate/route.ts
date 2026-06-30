import { NextResponse } from 'next/server';
import { createNeonClient } from '../../../../lib/neon';

/**
 * One-time DB migration.
 * Drops legacy tables, creates the full supplier schema.
 * Protected with ADMIN_SECRET.
 *
 * POST /api/admin/migrate
 * Authorization: Bearer <ADMIN_SECRET>
 */
export async function POST(request: Request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || request.headers.get('Authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = createNeonClient();
  try {
    await client.connect();

    /* ── 1. Drop legacy tables ───────────────────────────────── */
    await client.query(`DROP TABLE IF EXISTS early_access_signups CASCADE`);

    /* ── 2. Suppliers ────────────────────────────────────────── */
    await client.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id              SERIAL PRIMARY KEY,
        company_name    TEXT        NOT NULL,
        contact_person  TEXT        NOT NULL,
        mobile          TEXT        NOT NULL,
        email           TEXT        UNIQUE NOT NULL,
        password_hash   TEXT        NOT NULL,
        categories      TEXT[]      NOT NULL DEFAULT '{}',
        delivery_areas  TEXT[]      NOT NULL DEFAULT '{}',
        terms_accepted  BOOLEAN     NOT NULL DEFAULT FALSE,
        status          TEXT        NOT NULL DEFAULT 'pending',
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    /* ── 3. Supplier sessions ────────────────────────────────── */
    await client.query(`
      CREATE TABLE IF NOT EXISTS supplier_sessions (
        token        TEXT        PRIMARY KEY,
        supplier_id  INT         NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
        expires_at   TIMESTAMPTZ NOT NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_supplier_sessions_sid
        ON supplier_sessions(supplier_id)
    `);

    /* ── 4. Auto-update updated_at ───────────────────────────── */
    await client.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER LANGUAGE plpgsql AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$
    `);
    await client.query(`
      DROP TRIGGER IF EXISTS suppliers_updated_at ON suppliers;
      CREATE TRIGGER suppliers_updated_at
        BEFORE UPDATE ON suppliers
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);

    return NextResponse.json({ success: true, message: 'Migration complete' });
  } catch (err) {
    console.error('[migrate]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  } finally {
    await client.end().catch(() => {});
  }
}
