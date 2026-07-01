import type { DashboardIconName } from '../layout/DashboardIcon';
import { DashboardIcon } from '../layout/DashboardIcon';

interface PageHeaderProps {
  title: string;
  action?: {
    label: string;
    icon?: DashboardIconName;
    /** Phase-3 hook: not wired up yet, so the button is always disabled for now. */
    disabled?: boolean;
  };
}

/** Shared page title + optional primary action button. */
export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="dc-page-header">
      <h1 className="dc-page-title">{title}</h1>
      {action && (
        <button type="button" className="dc-btn-primary" disabled={action.disabled ?? true}>
          {action.icon && <DashboardIcon name={action.icon} size={16} />}
          {action.label}
        </button>
      )}
    </div>
  );
}
