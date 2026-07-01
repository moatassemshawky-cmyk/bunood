import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopbar } from './DashboardTopbar';
import type { NavItem } from './dashboardNav';

interface DashboardShellProps {
  children: React.ReactNode;
  navItems?: NavItem[];
  homeHref?: string;
}

/** Shared shell (sidebar + topbar) reused by every dashboard area (buyer-side, engineer, etc). */
export function DashboardShell({ children, navItems, homeHref }: DashboardShellProps) {
  return (
    <div className="ds-root">
      <DashboardSidebar navItems={navItems} homeHref={homeHref} />
      <div className="ds-main">
        <DashboardTopbar />
        <div className="ds-content">{children}</div>
      </div>
    </div>
  );
}
