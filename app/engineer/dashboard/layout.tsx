import { DashboardShell } from '../../../components/layout/DashboardShell';
import { ENGINEER_DASHBOARD_NAV } from '../../../lib/engineer/dashboardNav';
import '../../(dashboard)/layout.css';
import './layout.css';

/**
 * Shell for the engineer-specific dashboard (BOQ management). Reuses the shared
 * DashboardShell/Sidebar/Topbar from the generic buyer-side dashboard, with its
 * own nav config — not session-gated yet (no engineer login page exists to
 * redirect to).
 */
export default function EngineerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={ENGINEER_DASHBOARD_NAV} homeHref="/engineer/dashboard">
      {children}
    </DashboardShell>
  );
}
