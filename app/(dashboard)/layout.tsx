import { DashboardShell } from '../../components/layout/DashboardShell';
import './layout.css';

/**
 * Shared shell for the buyer-side (contractor/engineer) placeholder dashboard.
 * Not session-gated yet — no engineer/contractor login exists to gate against.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
