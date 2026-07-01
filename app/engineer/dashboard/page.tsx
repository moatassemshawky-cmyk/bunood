import { KpiCard } from '../../../components/dashboard/KpiCard';
import { EmptyState } from '../../../components/dashboard/EmptyState';
import { PageHeader } from '../../../components/dashboard/PageHeader';
import { DashboardIcon } from '../../../components/layout/DashboardIcon';
import { MOCK_PROJECTS, MOCK_BOQS } from '../../../lib/mockData/engineerDashboard';

export default function EngineerDashboardPage() {
  const activeProjects = MOCK_PROJECTS.filter(p => p.status === 'active').length;
  const totalBoqs = MOCK_BOQS.length;
  const inProgressBoqs = MOCK_BOQS.filter(b => b.status === 'in-progress').length;

  return (
    <>
      <PageHeader title="Dashboard" />

      <div className="dc-section dc-grid-4">
        <KpiCard label="Active Projects" value={String(activeProjects)} />
        <KpiCard label="Total BOQs" value={String(totalBoqs)} />
        <KpiCard label="In Progress" value={String(inProgressBoqs)} sub="BOQs" />
        <KpiCard label="Pending RFQs" value="—" sub="Coming soon" />
      </div>

      <div className="dc-section">
        <EmptyState
          title="No recent activity yet"
          description="Updates on your BOQs, RFQs, and supplier responses will show up here."
          icon={<DashboardIcon name="boq" size={28} />}
        />
      </div>
    </>
  );
}
