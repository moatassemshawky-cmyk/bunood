'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DASHBOARD_NAV } from './dashboardNav';
import { DashboardIcon } from './DashboardIcon';

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="ds-sidebar">
      <Link href="/overview" className="ds-sidebar-logo">
        <svg width="28" height="28" viewBox="0 0 96 96" fill="none">
          <g stroke="#2F6FE0" strokeWidth="7" strokeLinecap="round">
            <path d="M20 38 V23 Q20 20 23 20 H38" fill="none" />
            <path d="M76 58 V73 Q76 76 73 76 H58" fill="none" />
          </g>
          <g strokeWidth="6.5" strokeLinecap="round">
            <line x1="33" y1="38" x2="66" y2="38" stroke="rgba(255,255,255,.5)" />
            <line x1="33" y1="48" x2="58" y2="48" stroke="#2F6FE0" />
            <line x1="33" y1="58" x2="63" y2="58" stroke="rgba(255,255,255,.5)" />
          </g>
        </svg>
        <span className="ds-logo-text">bun<span className="ds-blue">oo</span>d</span>
      </Link>

      <nav className="ds-nav">
        {DASHBOARD_NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`ds-navlink ${pathname === item.href ? 'is-active' : ''}`}
          >
            <DashboardIcon name={item.icon} />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
