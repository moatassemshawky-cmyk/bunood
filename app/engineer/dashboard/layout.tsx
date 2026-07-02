import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardShell } from '../../../components/layout/DashboardShell';
import { ENGINEER_DASHBOARD_NAV } from '../../../lib/engineer/dashboardNav';
import { getSessionAccount } from '../../../lib/auth';
import '../../(dashboard)/layout.css';
import './layout.css';

/**
 * Shell for the engineer-specific dashboard (BOQ management). Reuses the shared
 * DashboardShell/Sidebar/Topbar from the generic buyer-side dashboard, with its
 * own nav config. Session-gated here so every sub-route under
 * /engineer/dashboard is protected in one place.
 */
export default async function EngineerDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('bn_engineer_session')?.value;
  const session = await getSessionAccount('engineer', token);
  if (!session) redirect('/login');

  return (
    <DashboardShell navItems={ENGINEER_DASHBOARD_NAV} homeHref="/engineer/dashboard">
      {children}
    </DashboardShell>
  );
}
