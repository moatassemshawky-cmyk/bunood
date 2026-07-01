import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopbar } from './DashboardTopbar';

/** Shared shell (sidebar + topbar) wrapping every page in the (dashboard) route group. */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ds-root">
      <DashboardSidebar />
      <div className="ds-main">
        <DashboardTopbar />
        <div className="ds-content">{children}</div>
      </div>
    </div>
  );
}
