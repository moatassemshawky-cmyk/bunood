import { PageHeader } from '../../../../components/dashboard/PageHeader';
import { EmptyState } from '../../../../components/dashboard/EmptyState';
import { DashboardIcon } from '../../../../components/layout/DashboardIcon';

export default function ContractorProjectsPage() {
  return (
    <>
      <PageHeader title="Projects" action={{ label: 'New Project', icon: 'plus' }} />
      <EmptyState
        title="No projects yet"
        description="Projects you create or get invited to will appear here."
        icon={<DashboardIcon name="projects" size={28} />}
      />
    </>
  );
}
