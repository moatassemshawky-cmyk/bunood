import { PageHeader } from '../../../components/dashboard/PageHeader';
import { PlaceholderTable } from '../../../components/dashboard/PlaceholderTable';
import { DashboardIcon } from '../../../components/layout/DashboardIcon';

const FILTERS = ['All', 'Active', 'Planning', 'Completed'];

export default function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projects" action={{ label: 'New Project', icon: 'plus' }} />

      <div className="dc-section" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="ds-topbar-search" style={{ maxWidth: 280 }}>
          <DashboardIcon name="search" size={16} />
          <input className="ds-topbar-search-input" placeholder="Search projects…" disabled />
        </div>
        {FILTERS.map(f => (
          <span key={f} className="dc-directory-chip" style={{ cursor: 'not-allowed' }}>{f}</span>
        ))}
      </div>

      <PlaceholderTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'status', label: 'Status' },
          { key: 'budget', label: 'Budget' },
          { key: 'date', label: 'Date' },
        ]}
        rows={[]}
        emptyLabel="No projects yet — create your first project to get started."
      />
    </>
  );
}
