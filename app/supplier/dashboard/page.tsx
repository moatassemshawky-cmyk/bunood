import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createNeonClient } from '../../../lib/neon';
import './page.css';

interface Supplier {
  id: number;
  company_name: string;
  contact_person: string;
  email: string;
  categories: string[];
  delivery_areas: string[];
  status: string;
}

async function getSupplier(): Promise<Supplier | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('bn_supplier_session')?.value;
  if (!token) return null;

  const client = createNeonClient();
  try {
    await client.connect();
    const { rows } = await client.query<Supplier>(
      `SELECT s.id, s.company_name, s.contact_person, s.email,
              s.categories, s.delivery_areas, s.status
       FROM suppliers s
       JOIN supplier_sessions ss ON ss.supplier_id = s.id
       WHERE ss.token = $1 AND ss.expires_at > NOW()
       LIMIT 1`,
      [token],
    );
    return rows[0] ?? null;
  } catch {
    return null;
  } finally {
    await client.end().catch(() => {});
  }
}

export default async function SupplierDashboard() {
  const supplier = await getSupplier();
  if (!supplier) redirect('/supplier/login');

  const initials = supplier.company_name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="sd-root">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="sd-sidebar">
        <Link href="/" className="sd-sidebar-logo">
          <svg width="28" height="28" viewBox="0 0 96 96" fill="none">
            <g stroke="#2F6FE0" strokeWidth="7" strokeLinecap="round">
              <path d="M20 38 V23 Q20 20 23 20 H38" fill="none"/>
              <path d="M76 58 V73 Q76 76 73 76 H58" fill="none"/>
            </g>
            <g strokeWidth="6.5" strokeLinecap="round">
              <line x1="33" y1="38" x2="66" y2="38" stroke="rgba(255,255,255,.5)"/>
              <line x1="33" y1="48" x2="58" y2="48" stroke="#2F6FE0"/>
              <line x1="33" y1="58" x2="63" y2="58" stroke="rgba(255,255,255,.5)"/>
            </g>
          </svg>
          <span className="sd-logo-text">bun<span className="sd-blue">oo</span>d</span>
        </Link>

        <nav className="sd-nav">
          <a href="/supplier/dashboard" className="sd-navlink is-active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </a>
          <a href="#" className="sd-navlink sd-soon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            RFQs
            <span className="sd-badge">Soon</span>
          </a>
          <a href="#" className="sd-navlink sd-soon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Quotes
            <span className="sd-badge">Soon</span>
          </a>
          <a href="#" className="sd-navlink sd-soon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
            <span className="sd-badge">Soon</span>
          </a>
        </nav>

        <form action="/api/supplier/logout" method="POST" className="sd-logout-form">
          <button type="submit" className="sd-logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </form>
      </aside>

      {/* ── Main area ───────────────────────────────────────── */}
      <main className="sd-main">
        {/* Top bar */}
        <header className="sd-topbar">
          <div className="sd-topbar-left">
            <h1 className="sd-page-title">Dashboard</h1>
          </div>
          <div className="sd-topbar-right">
            <div className="sd-avatar" title={supplier.company_name}>{initials}</div>
          </div>
        </header>

        {/* Welcome banner */}
        <div className="sd-welcome">
          <div className="sd-welcome-text">
            <h2 className="sd-welcome-name">Welcome, {supplier.company_name} 👋</h2>
            <p className="sd-welcome-sub">
              Your account is active. RFQ matching will begin once we launch procurement in your area.
              We&apos;ll notify you by email at <strong>{supplier.email}</strong>.
            </p>
          </div>
          <div className={`sd-status-pill ${supplier.status === 'active' ? 'is-active' : 'is-pending'}`}>
            {supplier.status === 'active' ? '● Active' : '● Pending review'}
          </div>
        </div>

        {/* Stat cards */}
        <div className="sd-stats-grid">
          {[
            { label: 'Open RFQs',      val: '—', sub: 'Coming soon' },
            { label: 'Quotes sent',    val: '—', sub: 'Coming soon' },
            { label: 'Awarded',        val: '—', sub: 'Coming soon' },
            { label: 'Avg. response',  val: '—', sub: 'Coming soon' },
          ].map(s => (
            <div key={s.label} className="sd-stat-card">
              <span className="sd-stat-label">{s.label}</span>
              <span className="sd-stat-val">{s.val}</span>
              <span className="sd-stat-sub">{s.sub}</span>
            </div>
          ))}
        </div>

        {/* Empty state */}
        <div className="sd-empty">
          <div className="sd-empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9aa3ae" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h3 className="sd-empty-title">No RFQs yet</h3>
          <p className="sd-empty-desc">
            Once contractors in your area post procurement requests matching your categories,
            they&apos;ll appear here. Make sure your profile is complete for better matching.
          </p>
          <div className="sd-empty-cats">
            <span className="sd-empty-cats-label">Your categories:</span>
                   {supplier.categories.map(c => (
              <span key={c} className="sd-cat-chip">{c}</span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
