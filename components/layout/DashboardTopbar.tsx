import { DashboardIcon } from './DashboardIcon';

/** Minimal shared topbar — per-page titles live in each page's own PageHeader. */
export function DashboardTopbar() {
  return (
    <header className="ds-topbar">
      <div className="ds-topbar-search">
        <DashboardIcon name="search" size={16} />
        <input className="ds-topbar-search-input" placeholder="Search…" disabled />
      </div>
      <div className="ds-topbar-right">
        <button className="ds-topbar-icon-btn" type="button" aria-label="Notifications" disabled>
          <DashboardIcon name="bell" />
        </button>
        <div className="ds-avatar" title="Your account">BU</div>
      </div>
    </header>
  );
}
