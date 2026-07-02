import { NextResponse } from 'next/server';
import { withClient } from '../../../../lib/db';

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

  try {
    return await withClient(async (client) => {

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

    /* ── 4. Engineers ────────────────────────────────────────── */
    await client.query(`
      CREATE TABLE IF NOT EXISTS engineers (
        id                   SERIAL PRIMARY KEY,
        full_name            TEXT        NOT NULL,
        mobile               TEXT        NOT NULL,
        email                TEXT        UNIQUE NOT NULL,
        password_hash        TEXT        NOT NULL,
        specialization       TEXT        NOT NULL,
        other_specialization TEXT,
        company              TEXT,
        country              TEXT,
        license_number       TEXT,
        years_experience     TEXT        NOT NULL,
        city                 TEXT        NOT NULL,
        terms_accepted       BOOLEAN     NOT NULL DEFAULT FALSE,
        status               TEXT        NOT NULL DEFAULT 'pending',
        created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS engineer_sessions (
        token        TEXT        PRIMARY KEY,
        engineer_id  INT         NOT NULL REFERENCES engineers(id) ON DELETE CASCADE,
        expires_at   TIMESTAMPTZ NOT NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_engineer_sessions_eid ON engineer_sessions(engineer_id)`);

    /* ── 5. Contractors ──────────────────────────────────────── */
    await client.query(`
      CREATE TABLE IF NOT EXISTS contractors (
        id              SERIAL PRIMARY KEY,
        company_name    TEXT        NOT NULL,
        contact_person  TEXT        NOT NULL,
        mobile          TEXT        NOT NULL,
        email           TEXT        UNIQUE NOT NULL,
        password_hash   TEXT        NOT NULL,
        work_types      TEXT[]      NOT NULL DEFAULT '{}',
        company_size    TEXT        NOT NULL,
        cr_number       TEXT,
        tax_number        TEXT,
        countries_served  TEXT[]      NOT NULL DEFAULT '{}',
        years_in_business TEXT,
        city            TEXT        NOT NULL,
        terms_accepted  BOOLEAN     NOT NULL DEFAULT FALSE,
        status          TEXT        NOT NULL DEFAULT 'pending',
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS contractor_sessions (
        token           TEXT        PRIMARY KEY,
        contractor_id   INT         NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
        expires_at      TIMESTAMPTZ NOT NULL,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_contractor_sessions_cid ON contractor_sessions(contractor_id)`);

    /* ── 6. Phase 2 columns (idempotent against tables that already existed) ── */
    await client.query(`ALTER TABLE engineers   ADD COLUMN IF NOT EXISTS company TEXT`);
    await client.query(`ALTER TABLE engineers   ADD COLUMN IF NOT EXISTS country TEXT`);
    await client.query(`ALTER TABLE contractors ADD COLUMN IF NOT EXISTS tax_number TEXT`);
    await client.query(`ALTER TABLE contractors ADD COLUMN IF NOT EXISTS countries_served TEXT[] NOT NULL DEFAULT '{}'`);
    await client.query(`ALTER TABLE contractors ADD COLUMN IF NOT EXISTS years_in_business TEXT`);

    /* ── 7. Auto-update updated_at ───────────────────────────── */
    await client.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER LANGUAGE plpgsql AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$
    `);
    await client.query(`
      DROP TRIGGER IF EXISTS suppliers_updated_at ON suppliers;
      CREATE TRIGGER suppliers_updated_at BEFORE UPDATE ON suppliers
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
      DROP TRIGGER IF EXISTS engineers_updated_at ON engineers;
      CREATE TRIGGER engineers_updated_at BEFORE UPDATE ON engineers
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
      DROP TRIGGER IF EXISTS contractors_updated_at ON contractors;
      CREATE TRIGGER contractors_updated_at BEFORE UPDATE ON contractors
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    `);

    return NextResponse.json({ success: true, message: 'Migration complete — suppliers, engineers, contractors' });
    });
  } catch (err) {
    console.error('[migrate]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
