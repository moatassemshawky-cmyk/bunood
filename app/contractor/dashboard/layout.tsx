import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardShell } from '../../../components/layout/DashboardShell';
import { CONTRACTOR_DASHBOARD_NAV } from '../../../lib/contractor/dashboardNav';
import { getSessionAccount } from '../../../lib/auth';
import '../../(dashboard)/layout.css';

/**
 * Shell for the contractor-specific dashboard. Reuses the shared
 * DashboardShell/Sidebar/Topbar (same as the engineer dashboard) with its own
 * nav config, and is session-gated here so every sub-route under
 * /contractor/dashboard is protected in one place.
 */
export default async function ContractorDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('bn_contractor_session')?.value;
  const session = await getSessionAccount('contractor', token);
  if (!session) redirect('/login');

  return (
    <DashboardShell navItems={CONTRACTOR_DASHBOARD_NAV} homeHref="/contractor/dashboard">
      {children}
    </DashboardShell>
  );
}
